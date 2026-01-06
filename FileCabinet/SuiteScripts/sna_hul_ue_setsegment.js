/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to assign Custom Segment Equipment Posting/Category/Group and HUL Manufacturer
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/9/30       		                 aduldulao       Initial version.
 * 2022/11/4       		                 aduldulao       Null checking of fleet
 * 2022/1/18       		                 aduldulao       Add Responsibility Center
 * 2024/6/7                              aduldulao       Tax automation
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/runtime', './sna_hul_mod_sales_tax.js'],
    /**
     * @param{search} search
     */
    (search, runtime, mod_tax) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            // tax automation
            var currentScript = runtime.getCurrentScript();
            var willcall = currentScript.getParameter({name: 'custscript_sna_ofm_willcall'});
            var ship = currentScript.getParameter({name: 'custscript_sna_ofm_ship'});
            var avataxpos = currentScript.getParameter({name: 'custscript_sna_tax_avataxpos'});
            var avatax = currentScript.getParameter({name: 'custscript_sna_tax_avatax'});
            var NONTAXABLE = currentScript.getParameter({ name: 'custscript_sna_tax_nontaxable' });

            var rec = scriptContext.newRecord;
            var recid = rec.id;
            var rectype = rec.type;

            log.debug({title: 'beforeSubmit', details: 'runtime.executionContext: ' + runtime.executionContext + ' | recid: ' + recid});

            var finaltaxcode = '';
            var userinterface = false;
            let internal = false;

            //if (runtime.executionContext == runtime.ContextType.USER_INTERFACE || runtime.executionContext == runtime.ContextType.WEBSERVICES) {
            if (rectype == search.Type.INVOICE || rectype == search.Type.SALES_ORDER || rectype == search.Type.ESTIMATE) {
                userinterface = true;

                var ordermethod = rec.getValue({fieldId: 'custbody_sna_order_fulfillment_method'});

                if (ordermethod == willcall) {
                    finaltaxcode = avataxpos;
                }
                else if (ordermethod == ship) {
                    finaltaxcode = avatax;
                }

                if (rectype == search.Type.INVOICE) {
                    internal = mod_tax.updateLines(rec, true); // moved to aftersubmit SNA HUL UE Set Tax Not Taxable
                }
            }
            //}

            log.debug({title: 'beforeSubmit', details: 'finaltaxcode: ' + finaltaxcode});

            if (userinterface && !isEmpty(finaltaxcode)) {
                rec.setValue({fieldId: 'custbody_sna_tax_processed', value: true});
                rec.setValue({fieldId: 'shippingtaxcode', value: finaltaxcode});
            }

            var hasheaderobj = false;
            var lineobj = [];
            var objinfo = {};
            var eqseg = '';
            var manufseg = '';
            var respcenter = '';

            var equipobj = rec.getValue({fieldId: 'custbody_sna_equipment_object'});
            if (!isEmpty(equipobj)) {
                hasheaderobj = true;

                var objflds = search.lookupFields({type: 'customrecord_sna_objects', id: equipobj, columns: ['cseg_hul_mfg', 'cseg_sna_hul_eq_seg', 'custrecord_sna_responsibility_center']});

                if (!isEmpty(objflds.cseg_hul_mfg)) {
                    manufseg = objflds.cseg_hul_mfg[0].value;
                }

                if (!isEmpty(objflds.cseg_sna_hul_eq_seg)) {
                    eqseg = objflds.cseg_sna_hul_eq_seg[0].value;
                }

                if (!isEmpty(objflds.custrecord_sna_responsibility_center)) {
                    respcenter = objflds.custrecord_sna_responsibility_center[0].value;
                }
            }

            var itemcount = rec.getLineCount({sublistId: 'item'});

            for (var i = 0; i < itemcount; i++) {
                var fleet = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: i});
                var objln = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_object', line: i});
                if (isEmpty(fleet)) {
                    fleet = objln;
                }

                if (isEmpty(equipobj) && !isEmpty(fleet)) {
                    lineobj.push(fleet);
                }
            }

            log.debug({title: 'beforeSubmit', details: 'lineobj: ' + lineobj.toString() + ' | ' + lineobj.length});

            // if the header object is empty, get the segments from the line objects
            if (isEmpty(equipobj) && !isEmpty(lineobj)) {
                var filters = [];
                filters.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: lineobj}));

                var columns = [];
                columns.push(search.createColumn({name: 'cseg_hul_mfg'}));
                columns.push(search.createColumn({name: 'cseg_sna_hul_eq_seg'}));
                columns.push(search.createColumn({name: 'custrecord_sna_responsibility_center'}));

                var objser = search.create({type: 'customrecord_sna_objects', filters: filters, columns: columns});
                objser.run().each(function(result) {
                    var obj = result.id;
                    var seg = result.getValue({name: 'cseg_sna_hul_eq_seg'});
                    var manseg = result.getValue({name: 'cseg_hul_mfg'});
                    var recenter = result.getValue({name: 'custrecord_sna_responsibility_center'});

                    objinfo[obj] = {seg: seg, manseg: manseg, recenter: recenter};

                    return true;
                });
            }

            // go back to the lines to set the value
            for (var i = 0; i < itemcount; i++) {
                var fleet = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: i});
                var objln = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_object', line: i});
                if (isEmpty(fleet)) {
                    fleet = objln;
                }

                var finalseg = hasheaderobj ? eqseg : (!isEmpty(objinfo[fleet]) ? objinfo[fleet].seg : '');
                var finalmanufseg = hasheaderobj ? manufseg : (!isEmpty(objinfo[fleet]) ? objinfo[fleet].manseg : '');
                var finalrespcenter = hasheaderobj ? respcenter : (!isEmpty(objinfo[fleet]) ? objinfo[fleet].recenter : '');

                rec.setSublistValue({sublistId: 'item', fieldId: 'cseg_sna_hul_eq_seg', line: i, value: finalseg});
                rec.setSublistValue({sublistId: 'item', fieldId: 'cseg_hul_mfg', line: i, value: finalmanufseg});
                rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_resource_res_center', line: i, value: finalrespcenter});

                log.debug({title: 'beforeSubmit', details: 'i: ' + i + ' | finalseg: ' + finalseg + ' | finalmanufseg: ' + finalmanufseg + ' | finalrespcenter: ' + finalrespcenter});

                if (userinterface && !isEmpty(finaltaxcode) && !internal) {
                    rec.setSublistValue({sublistId: 'item', fieldId: 'taxcode', value: finaltaxcode, line: i});
                    log.debug({title: 'beforeSubmit', details: 'i: ' + i + ' | finaltaxcode: ' + finaltaxcode});
                }
            }
        }

        return {beforeSubmit}

    });

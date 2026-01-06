/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to check and set the inventory details of temporary items on the Item Receipt
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/6/27       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Item Category checking as temp item
 * 2023/5/4                              aduldulao       New item categories
 * 2023/6/18                             aduldulao       Invoice Qty > SO Qty minus Returned Qty
 * 2023/9/18                             aduldulao       Retain items not marked for return
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/error', 'N/record', 'N/search', 'N/url'],
    /**
 * @param{record} record
 */
    (runtime, error, record, search, url) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try {
                var rec = scriptContext.newRecord;
                var recid = rec.id;
                var rectype = rec.type;

                if (scriptContext.type == scriptContext.UserEventType.VIEW) {
                    var form = scriptContext.form;
                    var closebtn = form.getButton({id: 'closeremaining'});

                    if (closebtn) {
                        // Getting the URL to open the suitelet.
                        var urlSuitelet = url.resolveScript({scriptId: 'customscript_sna_hul_sl_closebutton', deploymentId: 'customdeploy_sna_hul_sl_closebutton',
                            returnExternalUrl: false,
                            params: {
                                recid: recid,
                            }
                        });

                        var scriptUrl = 'window.location = \''+urlSuitelet+'\',\'_blank\';'
                        form.addButton({ id: 'custpage_btn_close', label: 'Close', functionName: scriptUrl});
                        form.removeButton({id: 'closeremaining'});
                    }
                }
                else if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                    var itemcount = rec.getLineCount({sublistId: 'item'});

                    for (var i = itemcount - 1; i >= 0; i--) {
                        var tempcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                        var returnitm =  rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_return_item', line: i});

                        log.debug({title: 'beforeLoad', details: 'line: ' + i + ' | tempcode: ' + tempcode + ' | returnitm: ' + returnitm});

                        if (!returnitm && isEmpty(tempcode)) {
                            rec.removeLine({sublistId: 'item', line: i});

                            log.debug({title: 'removeLines - 1', details: 'removing line: ' + i});
                        }
                    }
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }
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

            var currentScript = runtime.getCurrentScript();
            var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});

            var rec = scriptContext.newRecord;
            var itemcount = rec.getLineCount({sublistId: 'item'});

            for (var i = 0; i < itemcount; i++) {
                var tempcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                var lineqty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                var handling = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_returns_handling', line: i});
                var rate = rec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                log.debug({title: 'beforeSubmit', details: 'line: ' + i + ' | tempcode: ' + tempcode + ' | lineqty: ' + lineqty + ' | itm: ' + itm + ' | handling: ' + handling + ' | itmcatcust: ' + itmcatcust + ' | rate: ' + rate});

                rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_custrate_tempitem', line: i, value: rate});

                if ((tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat) && isEmpty(handling)) {
                    throw error.create({name: 'INVALID_RETURNS_HANDLING', message: 'Enter a Temp Item Returns Handling'});
                }

                if (!isEmpty(tempcode) && (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat)) {
                    var subrecord = rec.getSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail', line: i});
                    var sublen = subrecord.getLineCount({sublistId: 'inventoryassignment'});
                    log.debug({title: 'beforeSubmit', details: 'sublen: ' + sublen});

                    for (var m = 0; m < sublen; m++) {
                        var subnum = subrecord.getSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', line: m});
                        log.debug({title: 'beforeSubmit', details: 'subnum: ' + subnum});

                        if (tempcode != subnum) {
                            throw error.create({name: 'INVALID_INVENTORY_DETAIL', message: 'Set inventory number is different from the Temporary Item Code'});
                        }
                    }
                }
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try {
                if (scriptContext.type == scriptContext.UserEventType.DELETE) return;
                log.debug({title: 'afterSubmit', details: 'runtime.executionContext: ' + runtime.executionContext});

                var contexttype = scriptContext.type;

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                var oldstatus = '';
                var soinfo = {};

                var oldrec = scriptContext.oldRecord;
                if (!isEmpty(oldrec)) {
                    oldstatus = oldrec.getValue({fieldId: 'orderstatus'});
                }

                var rec = record.load({type: _rectype, id: _recid, isDynamic: true});
                var newstatus = rec.getValue({fieldId: 'orderstatus'});

                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | _rectype: ' + _rectype + ' | oldstatus: ' + oldstatus + ' | newstatus: ' + newstatus});

                //if (newstatus == 'H') {
                if (newstatus == 'H' && oldstatus != 'H') {
                    var filters = [];
                    filters.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: _recid}));
                    filters.push(search.createFilter({name: 'status', operator: search.Operator.ANYOF, values: 'RtnAuth:H'}));
                    filters.push(search.createFilter({name: 'quantityshiprecv', operator: search.Operator.GREATERTHAN, values: 0}));
                    filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: false}));
                    filters.push(search.createFilter({name: 'cogs', operator: search.Operator.IS, values: false}));
                    filters.push(search.createFilter({name: 'taxline', operator: search.Operator.IS, values: false}));
                    filters.push(search.createFilter({name: 'shipping', operator: search.Operator.IS, values: false}));
                    filters.push(search.createFilter({name: 'type', join: 'createdfrom', operator: search.Operator.ANYOF, values: 'SalesOrd'}));

                    var columns = [];
                    columns.push(search.createColumn({name: 'createdfrom'}));
                    columns.push(search.createColumn({name: 'quantityshiprecv'}));
                    columns.push(search.createColumn({name: 'quantity'}));
                    columns.push(search.createColumn({name: 'tranid', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'item', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'quantity', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'lineuniquekey', join: 'appliedToTransaction'}));

                    var srch = search.create({type: record.Type.RETURN_AUTHORIZATION, columns: columns, filters: filters});

                    srch.run().each(function(result) {
                        var so = result.getValue({name: 'createdfrom'});
                        var returnedqty = result.getValue({name: 'quantityshiprecv'});
                        var solinekey = result.getValue({name: 'lineuniquekey', join: 'appliedToTransaction'});

                        if (!isEmpty(so) && isEmpty(soinfo[so])) {
                            soinfo[so] = [];
                        }

                        soinfo[so].push({
                            'solinekey': solinekey,
                            'returnedqty': returnedqty
                        })

                        return true;
                    });

                    for (var soid in soinfo) {
                        var sorec = record.load({type: record.Type.SALES_ORDER, id: soid});

                        for (var a = 0; a < soinfo[soid].length; a++) {
                            var soline = sorec.findSublistLineWithValue({sublistId: 'item', fieldId: 'lineuniquekey', value: soinfo[soid][a].solinekey});
                            log.debug({title: 'afterSubmit', details: 'soline: ' + soline + ' | returnedqty: ' + soinfo[soid][a].returnedqty});

                            sorec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_qty_returned', line: soline, value: soinfo[soid][a].returnedqty});
                        }

                        sorec.save({ignoreMandatoryFields: true});
                        log.debug({title: 'afterSubmit', details: 'SO updated: ' + soid});
                    }
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });

/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script for Item Price Level validations
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/21       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/ui/serverWidget', 'N/record', 'N/error', 'N/runtime'],
    /**
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (search, serverWidget, record, error, runtime) => {

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
                if (runtime.executionContext == runtime.ContextType.CSV_IMPORT) return; // the itmcat and prcinggrpid are null for some reason
              
                if (scriptContext.type == scriptContext.UserEventType.EDIT ||
                    scriptContext.type == scriptContext.UserEventType.CREATE  ||
                    scriptContext.type == scriptContext.UserEventType.COPY)
                {
                    var form = scriptContext.form;
                    var rec = scriptContext.newRecord;
                    var rectype = rec.type;
                    var recid = rec.id;

                    var itmcat = rec.getValue({fieldId: 'custrecord_sna_hul_itemcategory'});
                    var prcinggrpid = rec.getValue({fieldId: 'custrecord_sna_hul_customerpricinggroup'});

                    log.debug({title: 'beforeLoad', details: 'itmcat: ' + itmcat + ' | prcinggrpid: ' + prcinggrpid});

                    var hasmin = false;
                    var mincostfld = form.getField({id: 'custrecord_sna_hul_mincost'});
                    !isEmpty(mincostfld) ? hasmin = true : hasmin = false;
                    hasmin ? mincostfld.updateDisplayType({displayType : serverWidget.FieldDisplayType.NORMAL}) : '';

                    var hasmax = false;
                    var maxcostfld = form.getField({id: 'custrecord_sna_hul_maxcost'});
                    !isEmpty(maxcostfld) ? hasmax = true : hasmax = false;
                    hasmax ? maxcostfld.updateDisplayType({displayType : serverWidget.FieldDisplayType.NORMAL}) : '';

                    // Customer Pricing Group = List
                    if (prcinggrpid == 155) {
                        var filters_ = [];
                        if (!isEmpty(itmcat)) {
                            filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: itmcat}));
                        } else {
                            filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: '@NONE@'}));
                        }
                        filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: prcinggrpid}));
                        var columns_ = [];
                        columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Customer Pricing combination

                        var cusrecsearch = search.create({type: rectype, filters: filters_, columns: columns_});
                        var cusrecser = cusrecsearch.run().getRange({start: 0, end: 2});

                        if (isEmpty(cusrecser) || cusrecser[0].id == recid) {
                            // Min Unit Cost is defaulted to 0 and cannot be changed for first Item Category-Customer Pricing Group combination where Customer Pricing Group = List.
                            rec.setValue({fieldId: 'custrecord_sna_hul_mincost', value: 0});
                            rec.setValue({fieldId: 'custrecord_sna_hul_maxcost', value: ''});
                            hasmin ? mincostfld.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED}) : '';

                            log.debug({title: 'beforeLoad', details: 'min = 0'});
                        }
                        if (isEmpty(cusrecser) || cusrecser.length == 1) {
                            // Max Unit Cost is grayed out if only one Item Category-Customer Pricing Group combination is available where Customer Pricing Group = List.
                            hasmax ? maxcostfld.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED}) : '';
                        }
                        if (!isEmpty(cusrecser) && cusrecser[0].id != recid) {
                            // If there is a new Item Category-Customer Pricing Group combination where Customer Pricing Group = List, Min Unit Cost is Mandatory and can be set to any value. Max Unit Cost is grayed out
                            hasmin ? mincostfld.isMandatory = true : '';
                            hasmax ? maxcostfld.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED}) : '';
                        }
                    }
                    if (prcinggrpid != 155) {
                        // If Customer Pricing Group is not List, Min Unit Cost and Max Unit Cost is grayed out.
                        hasmin ? mincostfld.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED}) : '';
                        hasmax ? maxcostfld.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED}) : '';

                        hasmin ? mincostfld.isMandatory = false : '';
                        rec.setValue({fieldId: 'custrecord_sna_hul_mincost', value: ''});
                        rec.setValue({fieldId: 'custrecord_sna_hul_maxcost', value: ''});

                        log.debug({title: 'beforeLoad', details: 'null costs'});
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
            var currrec = scriptContext.newRecord;
            var recid = currrec.id;

            var itmcat = currrec.getValue({fieldId: 'custrecord_sna_hul_itemcategory'});
            var prcinggrpid =  currrec.getValue({fieldId: 'custrecord_sna_hul_customerpricinggroup'});
            log.debug({title: 'beforeSubmit', details: itmcat + ' | ' + prcinggrpid + ' | ' + recid});

            // Item Category-Customer Pricing Group combination must be unique, unless Customer Pricing Group = List
            if (prcinggrpid != 155) {
                var filters_ = [];
                if (!isEmpty(itmcat)) {
                    filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: itmcat}));
                } else {
                    filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: '@NONE@'}));
                }
                if (!isEmpty(prcinggrpid)) {
                    filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: prcinggrpid}));
                } else {
                    filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: '@NONE@'}));
                }
                if (!isEmpty(recid)) {
                    filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.NONEOF, values: recid}));
                }
                var columns_ = [];
                columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Customer Pricing combination

                var cusrecsearch = search.create({type: 'customrecord_sna_hul_itempricelevel', filters: filters_, columns: columns_});
                var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});
                if (!isEmpty(cusrecser)) {
                    throw 'This is a duplicate record.';
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
            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            try {
                var _rec = scriptContext.newRecord;
                var recid = _rec.id;
                var rec = record.load({type: 'customrecord_sna_hul_itempricelevel', id: recid});

                var isinactive = rec.getValue({fieldId: 'isinactive'});
                var itmcat = rec.getValue({fieldId: 'custrecord_sna_hul_itemcategory'});
                var prcinggrpid = rec.getValue({fieldId: 'custrecord_sna_hul_customerpricinggroup'});
                var newmax = (prcinggrpid == 155 && !isinactive) ? rec.getValue({fieldId: 'custrecord_sna_hul_mincost'}) : ''; // default to current min if List and active
                log.debug({title: 'afterSubmit', details: 'current recid: ' + recid + ' | isinactive: ' + isinactive + ' | itmcat: ' + itmcat + ' | prcinggrpid: ' + prcinggrpid + ' | current mincost: ' + newmax});

                getNewCost(recid, isinactive, itmcat, itmcat, prcinggrpid, newmax);
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
         * Set Max Cost
         *
         * @param recid
         * @param isinactive
         * @param itmcat
         * @param curritmcat
         * @param prcinggrpid
         * @param newmax
         */
        function getNewCost(recid, isinactive, itmcat, curritmcat, prcinggrpid, newmax) {
            var tempid = '';
            var tempprevid = '';
            var previd = '';
            var nextid = '';
            var currnewmax = '';

            // get List-Item Category combination records
            var initfilters = [];
            initfilters.push(['isinactive', search.Operator.IS, 'F']);
            initfilters.push('and');
            initfilters.push(['custrecord_sna_hul_itemcategory', search.Operator.IS, itmcat]);
            initfilters.push('and');
            initfilters.push(['custrecord_sna_hul_customerpricinggroup', search.Operator.IS, 155]); // update affected List records

            var filters_ = [];
            filters_.push(initfilters)
            filters_.push('or');
            filters_.push(['internalid', search.Operator.IS, recid]); // include current record

            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // ascending to get previous ID and next ID from current ID
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_mincost'}));

            var srch = search.create({type: 'customrecord_sna_hul_itempricelevel', filters: filters_, columns: columns_});

            srch.run().each(function(result) {
                var id = result.getValue({name: 'internalid'});
                var minunit = result.getValue({name: 'custrecord_sna_hul_mincost'});

                tempprevid = tempid; // temp previous ID
                tempid = id; // temp current ID

                if (tempprevid == recid) {
                    nextid = id;
                    currnewmax = minunit; // max of current rec is min of next List

                    // current record is inactive - new max of previous List is min of next List
                    if (isinactive) {
                        // current rec is middle record - previous List max unit is sourced from next List record min unit
                        // current rec is last record - previous List max unit is blank
                        newmax = minunit;
                        log.debug({title: 'getNewCost', details: 'newmax: ' + newmax});
                    }
                }
                if (tempid == recid) {
                    previd = tempprevid;
                }

                return true; // don't break
            });

            // Once saved, the previous/first Item Category-Customer Pricing Group combination with Customer Pricing Group = List has the Max Unit Cost populated with the Min Unit Cost of the new Item Category-Customer Pricing Group combination.
            if (!isEmpty(previd)) {
                record.submitFields({type: 'customrecord_sna_hul_itempricelevel', id: previd, values: {custrecord_sna_hul_maxcost: newmax}});
                log.debug({title: 'getNewCost', details: 'Updated previd: ' + previd + ' | nextid: ' + nextid + ' | newmax: ' + newmax});
            }
            // Safeguard to make sure current max is min of next record if List
            if (!isEmpty(nextid) && prcinggrpid == 155) {
                record.submitFields({type: 'customrecord_sna_hul_itempricelevel', id: recid, values: {custrecord_sna_hul_maxcost: currnewmax}});
                log.debug({title: 'getNewCost', details: 'Updated recid: ' + recid + ' | currnewmax: ' + currnewmax});
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });

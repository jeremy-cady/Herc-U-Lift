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
 * 2022/6/20       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Default UOM to Each, Item Category checking as temp item
 * 2022/8/12                             aduldulao       Get vendor from IR mainname
 * 2023/5/4                              aduldulao        New item categories
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/error', 'N/search', 'N/record'],
    /**
 * @param{search} search
 */
    (runtime, error, search, record) => {

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

            var currentScript = runtime.getCurrentScript();
            var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});

            var rec = scriptContext.newRecord;

            var createdfromtype = '';
            var createdfrom = rec.getValue({fieldId: 'createdfrom'});
            if (!isEmpty(createdfrom)) {
                var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
                createdfromtype = fldcreatefrom.recordtype;
            }
            log.debug({title: 'beforeSubmit', details: 'createdfrom: ' + createdfrom + ' | createdfromtype: ' + createdfromtype});

            if (createdfromtype != 'purchaseorder') return;

            var itemcount = rec.getLineCount({sublistId: 'item'});

            for (var i = 0; i < itemcount; i++) {
                var itmreceive = rec.getSublistValue({sublistId: 'item', fieldId: 'itemreceive', line: i});
                log.debug({title: 'afterSubmit', details: 'line: ' + i + ' | itmreceive: ' + itmreceive});
                if (!itmreceive) continue;

                var tempcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                var lineqty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                log.debug({title: 'beforeSubmit', details: 'line: ' + i + ' | tempcode: ' + tempcode + ' | lineqty: ' + lineqty + ' | itm: ' + itm + ' | itmcatcust: ' + itmcatcust});

                if (!isEmpty(tempcode) && (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat)) {
                    var subrecord = rec.getSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail', line: i});
                    var sublen = subrecord.getLineCount({sublistId: 'inventoryassignment'});
                    log.debug({title: 'beforeSubmit', details: 'sublen: ' + sublen});

                    for (var m = 0; m < sublen; m++) {
                        var subnum = subrecord.getSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', line: m});
                        log.debug({title: 'beforeSubmit', details: 'subnum: ' + subnum});

                        if (tempcode != subnum) {
                            throw error.create({name: 'INVALID_INVENTORY_DETAIL', message: 'Inventory number is different from the Temporary Item Code'});
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

                var currentScript = runtime.getCurrentScript();
                var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
                var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
                var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
                var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
                var each = currentScript.getParameter({name: 'custscript_sna_each_measure'});

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                log.debug({title: 'afterSubmit', details: 'IR: ' + _recid});

                // search for the inventory numbers
                var uniquenumbers = [];

                var filters = [];
                filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: 'F'}));
                filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: _recid}));
                filters.push(search.createFilter({name: 'custcol_sna_hul_itemcategory', operator: search.Operator.ANYOF, values: [tempitemcat, allieditemcat, rackingitemcat, storageitemcat]}));
                filters.push(search.createFilter({name: 'type', join: 'createdfrom', operator: search.Operator.IS, values: 'PurchOrd'}));

                var columns = [];
                columns.push(search.createColumn({name: 'inventorynumber', join: 'inventoryDetail'}));
                columns.push(search.createColumn({name: 'custcol_sna_hul_itemcategory'}));
                columns.push(search.createColumn({name: 'mainname'})); // get vendor from IR entity which should be the same as the PO vendor
                columns.push(search.createColumn({name: 'custcol_sna_hul_vendor_item_code'}));
                columns.push(search.createColumn({name: 'memo', join: 'appliedToTransaction'}));
                columns.push(search.createColumn({name: 'rate'}));

                var srch = search.create({type: record.Type.ITEM_RECEIPT, columns: columns, filters: filters});

                srch.run().each(function(result) {
                    var tempcode = result.getValue({name: 'custcol_sna_hul_temp_item_code'});
                    var num = result.getValue({name: 'inventorynumber', join: 'inventoryDetail'});
                    uniquenumbers[num] = {};
                    uniquenumbers[num].custitemnumber_sna_hul_item_category = result.getValue({name: 'custcol_sna_hul_itemcategory'});
                    uniquenumbers[num].custitemnumber_sna_hul_vendor_no = result.getValue({name: 'mainname'});
                    uniquenumbers[num].custitemnumber_sna_hul_vendor_item_no = result.getValue({name: 'custcol_sna_hul_vendor_item_code'});
                    uniquenumbers[num].custitemnumber_sna_hul_description = result.getValue({name: 'memo', join: 'appliedToTransaction'});
                    uniquenumbers[num].custitemnumber_sna_hul_unit_cost = result.getValue({name: 'rate'});
                    uniquenumbers[num].custitemnumber_sna_hul_uom = each; // default to Each unit

                    return true;
                });

                // update inventory numbers
                for (var num in uniquenumbers) {
                    log.debug({title: 'afterSubmit', details: 'num: ' + num});

                    record.submitFields({type: record.Type.INVENTORY_NUMBER, id: num,
                        values: {
                            custitemnumber_sna_hul_item_category: uniquenumbers[num].custitemnumber_sna_hul_item_category,
                            custitemnumber_sna_hul_vendor_no: uniquenumbers[num].custitemnumber_sna_hul_vendor_no,
                            custitemnumber_sna_hul_vendor_item_no: uniquenumbers[num].custitemnumber_sna_hul_vendor_item_no,
                            custitemnumber_sna_hul_description: uniquenumbers[num].custitemnumber_sna_hul_description,
                            custitemnumber_sna_hul_unit_cost: uniquenumbers[num].custitemnumber_sna_hul_unit_cost,
                            custitemnumber_sna_hul_uom: uniquenumbers[num].custitemnumber_sna_hul_uom,
                        }
                    });
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR', e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error', e.toString());
                }
            }
        }

        return {beforeSubmit, afterSubmit}

    });

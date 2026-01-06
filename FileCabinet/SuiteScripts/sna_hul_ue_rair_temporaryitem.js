/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to handle RMA returns of temporary items
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/6/27       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Item Category checking as temp item
 * 2022/8/12                             aduldulao       Defective handling
 * 2022/8/15                             aduldulao       Default UOM to Each
 * 2023/1/20                             aduldulao       Set the Est Unit Cost. or Item Rate Column
 * 2023/02/23                            aduldulao       Defective Location will be dependent on the Parent Location
 * 2023/5/4                              aduldulao       New item categories
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/search', 'N/record'],
    /**
 * @param{runtime} runtime
 */
    (runtime, search, record) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
            }
            return flValue;
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
                var currentScript = runtime.getCurrentScript();
                var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
                var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
                var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
                var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
                var expensed = currentScript.getParameter({name: 'custscript_sna_hul_expensed'});
                var restock = currentScript.getParameter({name: 'custscript_sna_hul_restock'});
                var convert = currentScript.getParameter({name: 'custscript_sna_hul_convert_to_item'});
                var defective = currentScript.getParameter({name: 'custscript_hul_defective'});

                var rec = scriptContext.newRecord;

                var createdfromtype = '';
                var createdfrom = rec.getValue({fieldId: 'createdfrom'});
                if (!isEmpty(createdfrom)) {
                    var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
                    createdfromtype = fldcreatefrom.recordtype;
                }
                log.debug({title: 'beforeLoad', details: 'createdfrom: ' + createdfrom + ' | createdfromtype: ' + createdfromtype});

                if (createdfromtype != 'returnauthorization') return;

                var itemcount = rec.getLineCount({sublistId: 'item'});

                for (var i = 0; i < itemcount; i++) {
                    var itmreceive = rec.getSublistValue({sublistId: 'item', fieldId: 'itemreceive', line: i});
                    log.debug({title: 'afterSubmit', details: 'line: ' + i + ' | itmreceive: ' + itmreceive});
                    if (!itmreceive) continue;

                    var tempcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                    var lineqty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                    var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                    var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                    var handling = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_returns_handling', line: i});
                    log.debug({title: 'afterSubmit', details: 'line: ' + i + ' | tempcode: ' + tempcode + ' | lineqty: ' + lineqty + ' | itm: ' + itm + ' | handling: ' + handling + ' | itmcatcust: ' + itmcatcust});

                    if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat) {
                        if (handling == expensed) {
                            rec.setSublistValue({sublistId: 'item', fieldId: 'restock', value: false, line: i});
                        }
                        else if (handling == restock || handling == convert || handling == defective) {
                            rec.setSublistValue({sublistId: 'item', fieldId: 'restock', value: true, line: i});
                        }
                    }
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

        /**
         * Get unit costs of items
         * @param recid
         * @returns {{}}
         */
        function getUnitCosts(recid) {
            var itemcosts = {};

            var searchres = search.load({id: 'customsearch_hul_tempitem_cost'});
            searchres.filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: recid}));

            searchres.run().each(function(result) {
                var itm = result.getValue({name: 'item', summary: 'GROUP'});
                var rte = result.getValue({name: 'rate', summary: 'MAX'});

                if (isEmpty(itemcosts[itm])) {
                    itemcosts[itm] = rte;
                }

                return true;
            });

            return itemcosts;
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

            var currentScript = runtime.getCurrentScript();
            var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
            var convert = currentScript.getParameter({name: 'custscript_sna_hul_convert_to_item'});
            var iaaccount = currentScript.getParameter({name: 'custscript_sna_hul_ia_account'});
            var cogs = currentScript.getParameter({name: 'custscript_sna_hul_cogs'});
            var asset = currentScript.getParameter({name: 'custscript_sna_hul_asset_account'});
            var defective = currentScript.getParameter({name: 'custscript_hul_defective'});
            var defectiveloc = currentScript.getParameter({name: 'custscript_sna_hul_defective_loc'});
            var each = currentScript.getParameter({name: 'custscript_sna_each_measure'});

            var _rec = scriptContext.newRecord;
            var _recid = _rec.id;
            log.debug({title: 'afterSubmit', details: 'IR: ' + _recid});

            var rec = record.load({type: _rec.type, id: _recid});
            var subs = rec.getValue({fieldId: 'subsidiary'});

            var createdfromtype = '';
            var createdfrom = rec.getValue({fieldId: 'createdfrom'});
            if (!isEmpty(createdfrom)) {
                var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
                createdfromtype = fldcreatefrom.recordtype;
            }
            log.debug({title: 'afterSubmit', details: 'createdfrom: ' + createdfrom + ' | createdfromtype: ' + createdfromtype});

            if (createdfromtype != 'returnauthorization') return;

            // get unit cost
            var itemcosts = getUnitCosts(_recid);

            var itemcount = rec.getLineCount({sublistId: 'item'});
            var hasconvert = false;
            var hasdefective = false;

            for (var i = 0; i < itemcount; i++) {
                var itmreceive = rec.getSublistValue({sublistId: 'item', fieldId: 'itemreceive', line: i});
                log.debug({title: 'afterSubmit', details: 'line: ' + i + ' | itmreceive: ' + itmreceive});
                if (!itmreceive) continue;

                var tempcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                var lineqty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                var lineamt = rec.getSublistValue({sublistId: 'item', fieldId: 'itemfxamount', line: i});
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                var handling = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_returns_handling', line: i});
                var vendorcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code', line: i});
                var regularitm = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_regular_itm', line: i});
                var ia = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_ia', line: i});
                var loc = rec.getSublistValue({sublistId: 'item', fieldId: 'location', line: i});
                var loctxt = rec.getSublistText({sublistId: 'item', fieldId: 'location', line: i});
                var it = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_it', line: i});
                log.debug({title: 'afterSubmit', details: 'line: ' + i + ' | tempcode: ' + tempcode + ' | lineqty: ' + lineqty + ' | lineamt: ' + lineamt
                        + ' | itm: ' + itm + ' | handling: ' + handling + ' | vendorcode: ' + vendorcode + ' | itmcatcust: ' + itmcatcust
                        + ' | regularitm: ' + regularitm + ' | ia: ' + ia + ' | loc: ' + loc + ' | it: ' + it + ' | loctxt: ' + loctxt});

                if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat) {
                    if (handling == convert) {
                        if (isEmpty(regularitm)) {
                            // search for existing item
                            regularitm = getExistingItem(vendorcode, tempcode);

                            if (isEmpty(regularitm)) {
                                // create item
                                var itemrec = record.create({type: record.Type.INVENTORY_ITEM});
                                if (!isEmpty(vendorcode)) {
                                    itemrec.setValue({fieldId: 'itemid', value: vendorcode});
                                }
                                else {
                                    itemrec.setValue({fieldId: 'itemid', value: tempcode});
                                }
                                itemrec.setValue({fieldId: 'subsidiary', value: subs});
                                itemrec.setValue({fieldId: 'cogsaccount', value: cogs});
                                itemrec.setValue({fieldId: 'assetaccount', value: asset});
                                itemrec.setValue({fieldId: 'custitemnumber_sna_hul_uom', value: each});
                                regularitm = itemrec.save({ignoreMandatoryFields: true});
                                log.debug({title: 'afterSubmit', details: 'item created: ' + regularitm});
                            }
                        }

                        if (!isEmpty(regularitm)) {
                            if (isEmpty(ia)) {
                                var linerate = !isEmpty(itemcosts[itm]) ? itemcosts[itm] : 0;
                                log.debug({title: 'afterSubmit', details: 'linerate: ' + linerate});

                                // create inventory adjustment
                                var iarec = record.create({type: record.Type.INVENTORY_ADJUSTMENT, isDynamic: true});
                                log.debug({title: 'afterSubmit', details: 'creating inventoryadjustment'});

                                iarec.setValue({fieldId: 'subsidiary', value: subs});
                                iarec.setValue({fieldId: 'account', value: iaaccount});

                                // temp line
                                iarec.selectNewLine({sublistId: 'inventory'});
                                iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: itm});
                                iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'location', value: loc});
                                iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: (lineqty*-1)});

                                var invsubrecord = iarec.getCurrentSublistSubrecord({sublistId: 'inventory', fieldId: 'inventorydetail'});
                                // Remove all lines
                                var _lotcount = invsubrecord.getLineCount({sublistId: 'inventoryassignment'});
                                for (var k = parseInt(_lotcount)-1; k >= 0; k--) {
                                    invsubrecord.removeLine({sublistId: 'inventoryassignment', line: k});
                                }

                                invsubrecord.selectNewLine({sublistId: 'inventoryassignment'});
                                invsubrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: (lineqty*-1)});
                                invsubrecord.setCurrentSublistText({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', text: tempcode});
                                invsubrecord.commitLine({sublistId: 'inventoryassignment'});

                                iarec.commitLine({sublistId: 'inventory'});

                                // regular line
                                iarec.selectNewLine({sublistId: 'inventory'});
                                iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: regularitm});
                                iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'location', value: loc});
                                iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: lineqty});
                                iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'unitcost', value: linerate});;
                                iarec.commitLine({sublistId: 'inventory'});

                                ia = iarec.save();
                                log.debug({title: 'afterSubmit', details: 'inventory adjustment created: ' + ia});

                                // set IR line
                                rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_regular_itm', value: regularitm, line: i});
                                rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_ia', value: ia, line: i});
                            }
                        }

                        hasconvert = true;
                    }

                    else if (handling == defective) {
                        if (isEmpty(it)) {
                            // get defective location
                            var defectiveloca = getDefectiveLocation(loc, loctxt);

                            // create inventory transfer
                            var itrec = record.create({type: record.Type.INVENTORY_TRANSFER, isDynamic: true});
                            log.debug({title: 'afterSubmit', details: 'creating inventorytransfer'});

                            itrec.setValue({fieldId: 'subsidiary', value: subs});
                            itrec.setValue({fieldId: 'location', value: loc});
                            itrec.setValue({fieldId: 'transferlocation', value: defectiveloca});

                            // temp line
                            itrec.selectNewLine({sublistId: 'inventory'});
                            itrec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: itm});
                            itrec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: lineqty});;

                            var invsubrecord = itrec.getCurrentSublistSubrecord({sublistId: 'inventory', fieldId: 'inventorydetail'});
                            // Remove all lines
                            var _lotcount = invsubrecord.getLineCount({sublistId: 'inventoryassignment'});
                            for (var k = parseInt(_lotcount)-1; k >= 0; k--) {
                                invsubrecord.removeLine({sublistId: 'inventoryassignment', line: k});
                            }

                            invsubrecord.selectNewLine({sublistId: 'inventoryassignment'});
                            invsubrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: lineqty});
                            invsubrecord.setCurrentSublistText({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', text: tempcode});
                            invsubrecord.commitLine({sublistId: 'inventoryassignment'});

                            itrec.commitLine({sublistId: 'inventory'});

                            it = itrec.save();
                            log.debug({title: 'afterSubmit', details: 'inventory transfer created: ' + it});

                            // set IR line
                            rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_it', value: it, line: i});

                            hasdefective = true;
                        }
                    }
                }
            }

            if (hasconvert || hasdefective) {
                var irid = rec.save();
                log.debug({title: 'afterSubmit', details: 'IR lines updated: ' + irid});
            }
        }

        /**
         * Get existing item if partial receipt
         * @param vendorcode
         * @param tempcode
         * @returns {string}
         */
        function getExistingItem(vendorcode, tempcode) {
            var filters = [];

            if (!isEmpty(vendorcode)) {
                filters.push(['name', search.Operator.IS, vendorcode]);

                if (!isEmpty(tempcode)) {
                    filters.push('or');
                }
            }

            if (!isEmpty(tempcode)) {
                filters.push(['name', search.Operator.IS, tempcode]);
            }

            var columns = [];
            columns.push(search.createColumn({name: 'internalid'}));

            var recsearch = search.create({type: search.Type.ITEM, filters: filters, columns: columns});
            var recser = recsearch.run().getRange({start: 0, end: 1});
            if (!isEmpty(recser)) {
                return recser[0].getValue({name: 'internalid'});
            }

            return '';
        }

        /**
         * Get defective location from parent
         * @param loc
         * @param loctxt
         * @returns {string}
         */
        function getDefectiveLocation(loc, loctxt) {
            if (isEmpty(loc)) return '';

            var defectiveloc = '';
            var formla = "case when REPLACE(REGEXP_SUBSTR({name}, '[^:]+'),' ','') = REPLACE(REGEXP_SUBSTR('" + loctxt + "', '[^:]+'),' ','') then 1 else 0 end";
            log.debug({title: 'getDefectiveLocation', details: 'formla: ' + formla});

            var filters_ = [];
            filters_.push(search.createFilter({name: 'formulatext', operator: search.Operator.IS, values: '1', formula: formla}));
            filters_.push(search.createFilter({name: 'name', operator: search.Operator.CONTAINS, values: 'defective'}));

            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first

            var recsearch = search.create({type: search.Type.LOCATION, filters: filters_, columns: columns_});
            var recser = recsearch.run().getRange({start: 0, end: 1});
            if (!isEmpty(recser)) {
                defectiveloc = recser[0].getValue({name: 'internalid'});
            }

            log.debug({title: 'getDefectiveLocation', details: 'defectiveloc: ' + defectiveloc});

            return defectiveloc;
        }

        return {beforeLoad, afterSubmit}

    });

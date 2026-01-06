/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author fang
 *
 * Script brief description:
 * CS script to populate item rates on depending on Vendor and Item column value.
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/9/14                               fang       Initial version
 * 2022/01/06                             nretiro     GAP009 Addendum: vendor pricing will now be based on the sum of
 *                                                    item qty instead of the per line functionality
 * 2023/03/07                              fang       Additional Requirement for Vendor Price Hierarchy > Contract Price
 * 2023/03/09                               nretiro     task 64546 | Department: (P2P GAP Change # 8)
 * 2023/05/05                              fang       Fix issue regarding additional line item when adding new lines + vendor pricing
 * 2023/06/07                              fang       Remove pageInit fxn (setting of Department value (Main line + Sublist) > Moved to sna_hul_cs_setvendor.js
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime', 'N/currentRecord'],
    /**
     * @param{search} search
     */
    function (search, runtime, currentRecord) {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
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

        var TEMPITEMCAT = '';
        var RENTALCHARGE = '';
        var RENTALEQUIPMENT = '';
        var ITEM_PRICING = {};

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            var objCurrRec = currentRecord.get();
            var currentScript = runtime.getCurrentScript();
            TEMPITEMCAT = currentScript.getParameter({ name: 'custscript_sna_hul_tempitemcat' });
            RENTALCHARGE = currentScript.getParameter({ name: 'custscript_sna_rental_serviceitem' });
            RENTALEQUIPMENT = currentScript.getParameter({ name: 'custscript_sna_rental_equipment' });

            var stFormParts = currentScript.getParameter({ name: 'custscript_param_popartsform' });
            var stFormPartsDept = currentScript.getParameter({ name: 'custscript_param_popartsformdept' });
            log.debug(({ title: 'pageInit', details: 'scriptContext.mode: ' + scriptContext.mode + ' | stFormParts: ' + stFormParts + ' | stFormPartsDept: ' + stFormPartsDept }));

            var stCustomForm = objCurrRec.getValue({ fieldId: 'customform' });

            if (scriptContext.mode == 'create') {
                if (stCustomForm == stFormParts) {
                    objCurrRec.setValue({ fieldId: 'department', value: stFormPartsDept });

                    // check if item lines has content
                    var intItemLines = objCurrRec.getLineCount({ sublistId: 'item' });

                    if (intItemLines > 0) {
                        for (var i = 0; i < intItemLines; i++) {
                            objCurrRec.selectLine({ sublistId: 'item', line: i });
                            objCurrRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: stFormPartsDept });
                        }
                    }
                }
                else {
                    //set item sublist department field to mandatory
                    var objItemSL = objCurrRec.getSublist({ sublistId: 'item' });

                    var fldDept = objItemSL.getColumn({
                        fieldId: 'department'
                    });

                    fldDept.isMandatory = true;

                }
            }
        }

        function validateLine_(scriptContext) {
            var currRec = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;

            debugger;
            var stItem = currRec.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' });

            if (!isEmpty(stItem)) {
                var stDept = currRec.getValue({ fieldId: 'department' });
                currRec.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'department',
                    value: stDept,
                    ignoreFieldChange: true
                });
            }


            return true;
        }


        /**
         * Function to be executed when field value is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;
            var rec = scriptContext.currentRecord;
            var line = scriptContext.line;

            if (sublist == 'item')
                if (field == 'quantity') {
                    var buyFromVendor = rec.getValue({
                        fieldId: 'custbody_sna_buy_from'
                    });

                    log.debug({ title: '-- sublistChanged', details: 'field: ' + field + ' | sublist: item | setVendorPrice' });

                    setVendorPrice(rec, sublist, field, buyFromVendor, line);
                }
        }

        /**
         * Function to be executed when field value is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {
            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;
            var rec = scriptContext.currentRecord;
            var line = scriptContext.line;


            if (sublist == 'item')

                // if (field == 'quantity' || field == 'item') {
                if (field == 'item') {
                    var buyFromVendor = rec.getValue({
                        fieldId: 'custbody_sna_buy_from'
                    });

                    console.log({ title: '-- postSourcing', details: 'field: ' + field + ' | sublist: ' + sublist + '| setVendorPrice' });
                    log.debug({ title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setVendorPrice' });

                    setVendorPrice(rec, sublist, field, buyFromVendor, line);
                }
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
         * @param rec
         * @param sublist
         * @param field
         */

        function setSOVendorPrice(rec, sublist, field, buyFromVendor) {
            if (!isEmpty(sublist)) {
                var itm = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'item' });
                var itmtype = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'itemtype' });
                var qty = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'quantity' });
                var intSumOfQty = 0;



                if (itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

                log.debug({ title: 'setVendorPrice', details: 'itm: ' + itm + '| buyFromVendor: ' + buyFromVendor + '| qty: ' + qty });

                if (!isEmpty(itm)) {
                    var prices = getVendorPrice(itm, buyFromVendor);

                    if (!isEmpty(prices.qtybreakprice)) {
                        //log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });
                        log.debug({ title: 'setVendorPrice', details: 'qtybreakprice: ' + prices.qtybreakprice });

                        var qtyBreakPrice = JSON.parse(prices.qtybreakprice);

                        var setPrice;

                        for (var qbpIndex = 0; qbpIndex < qtyBreakPrice.length; qbpIndex++) {
                            var currQty = qtyBreakPrice[qbpIndex].Quantity;
                            var currPrice = qtyBreakPrice[qbpIndex].Price;

                            log.debug({ title: 'setVendorPrice', details: 'qty: ' + qty + ' vs. ' + 'currQty: ' + currQty + '| currPrice: ' + currPrice });

                            if (qty >= currQty) {
                                setPrice = currPrice;

                                continue;
                            } else {
                                break;
                            }
                        }

                        rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, forceSyncSourcing: true });

                    } else if (!isEmpty(prices.itmpurchprice)) {
                        log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });

                        rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: prices.itmpurchprice, forceSyncSourcing: true });
                    }


                    //rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price', value: prices.listprice, forceSyncSourcing: true});
                    //rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost', value: prices.itmpurchprice, forceSyncSourcing: true});
                }
            }
        }

        function setVendorPrice(rec, sublist, field, buyFromVendor, line) {
            debugger;
            if (!isEmpty(sublist)) {




                var itm = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'item' });
                // var itmtype = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'itemtype' });
                var qty = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'quantity' });
                var intSumOfQty = 0;

                var intLineCount = rec.getLineCount({ sublistId: 'item' });

                if (intLineCount > 0) {
                    for (var i = 0; i < intLineCount; i++) {
                        try {
                            var stItem = rec.getSublistValue({ sublistId: sublist, fieldId: 'item', line: i });

                            if (stItem == itm) {
                                if (line == i) {
                                    intSumOfQty += qty;
                                }
                                else {
                                    intSumOfQty += rec.getSublistValue({ sublistId: sublist, fieldId: 'quantity', line: i });
                                }

                                console.log('line = ' + i + ' | intSumOfQty = ' + intSumOfQty);
                            }
                        }
                        catch (e) {
                            console.log('test');
                            // intSumOfQty += qty;
                        }

                    }

                    // intSumOfQty += qty;
                }
                else {
                    intSumOfQty = qty;
                }


                // if (itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

                console.log({ title: 'setVendorPrice', details: 'itm: ' + itm + '| buyFromVendor: ' + buyFromVendor + '| qty: ' + qty });

                if (!isEmpty(itm)) {
                    var prices = getVendorPrice(itm, buyFromVendor);

                    console.log({ title: 'setVendorPrice', details: 'prices: ' + JSON.stringify(prices) });

                    if (!isEmpty(prices.qtybreakprice)) {

                        console.log({ title: 'setVendorPrice', details: 'qtybreakprice: ' + prices.qtybreakprice });

                        var qtyBreakPrice = JSON.parse(prices.qtybreakprice);

                        var setPrice = 0;

                        for (var qbpIndex = 0; qbpIndex < qtyBreakPrice.length; qbpIndex++) {
                            var currQty = qtyBreakPrice[qbpIndex].Quantity;
                            var currPrice = qtyBreakPrice[qbpIndex].Price;

                            log.debug({ title: 'setVendorPrice', details: 'intSumOfQty : ' + intSumOfQty + ' | qty: ' + qty + ' vs. ' + 'currQty: ' + currQty + '| currPrice: ' + currPrice });

                            if (intSumOfQty >= currQty) {

                                setPrice = currPrice;

                                continue;
                            }
                            else if (intSumOfQty == 0) {
                                setPrice = currPrice;
                                break;
                            }
                            else {
                                break;
                            }
                        }

                        if (field == 'quantity') {
                            if (intLineCount > 0) {

                                for (var i = 0; i < intLineCount; i++) {
                                    try {
                                        var stItem = rec.getSublistValue({ sublistId: sublist, fieldId: 'item', line: i });

                                        if (stItem == itm) {
                                            rec.selectLine({ sublistId: 'item', line: i });
                                            if (line == i) {
                                                rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'quantity', value: qty, ignoreFieldChange: true });
                                            }

                                            rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, forceSyncSourcing: true });
                                            rec.commitLine({ sublistId: 'item' });


                                        }
                                    }
                                    catch (e) {
                                        console.log('no item here...');
                                    }

                                }

                                rec.selectLine({ sublistId: 'item', line: line });
                                rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, forceSyncSourcing: true });
                                rec.commitLine({ sublistId: 'item' });
                                rec.selectLine({ sublistId: 'item', line: line });
                            }
                            else {
                                setTimeout(function () {
                                    rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, forceSyncSourcing: true });
                                    rec.commitLine({ sublistId: 'item' });
                                }, 500);
                            }

                        }
                        else if (field == 'item') {
                            setTimeout(function () {
                                rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, forceSyncSourcing: true });
                                rec.commitLine({ sublistId: 'item' });
                            }, 500);

                        }


                    } else if (!isEmpty(prices.contractprice)) { //New Requirement: Contract Price
                        console.log({ title: 'setVendorPrice', details: 'contractprice: ' + prices.contractprice });

                        rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: prices.contractprice, forceSyncSourcing: true });
                        rec.commitLine({ sublistId: 'item' });

                    } else if (!isEmpty(prices.itmpurchprice)) {
                        log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });

                        rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'rate', value: prices.itmpurchprice, forceSyncSourcing: true });
                        rec.commitLine({ sublistId: 'item' });
                    }


                    //rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price', value: prices.listprice, forceSyncSourcing: true});
                    //rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost', value: prices.itmpurchprice, forceSyncSourcing: true});
                }
            }
        }

        /**
         * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
         * @param itm
         * @param buyFromVendor
         * @returns {{}}
         */
        function getVendorPrice(itm, buyFromVendor) {
            var prices = {};
            prices.listprice = '';
            prices.itmpurchprice = '';
            prices.contractprice = '';

            var filters_ = [];

            filters_.push(search.createFilter({ name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm }));
            if (!isEmpty(buyFromVendor)) {
                filters_.push(search.createFilter({ name: 'custrecord_sna_hul_vendor', operator: search.Operator.ANYOF, values: buyFromVendor }));
            }

            // filters_.push(search.createFilter({ name: 'custrecord_sna_hul_vendor', operator: search.Operator.IS, values: buyFromVendor }));
            //filters_.push(search.createFilter({name: 'custrecord_sna_hul_primaryvendor', operator: search.Operator.IS, values: true}));
            var columns_ = [];
            columns_.push(search.createColumn({ name: 'internalid', sort: search.Sort.ASC })); // to get first combination
            columns_.push(search.createColumn({ name: 'custrecord_sna_hul_listprice' }));
            columns_.push(search.createColumn({ name: 'custrecord_sna_hul_itempurchaseprice' }));
            columns_.push(search.createColumn({ name: 'custrecord_sna_hul_qtybreakprices' }));
            columns_.push(search.createColumn({ name: 'custrecord_sna_hul_contractprice' }));


            var cusrecsearch = search.create({ type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_ });
            var cusrecser = cusrecsearch.run().getRange({ start: 0, end: 1 });

            log.debug({ title: 'getVendorPrice', details: 'cusrecser: ' + JSON.stringify(cusrecser) });

            if (!isEmpty(cusrecser)) {
                prices.listprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_listprice' });
                prices.itmpurchprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_itempurchaseprice' });
                prices.qtybreakprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_qtybreakprices' });
                prices.contractprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_contractprice' });
            }

            return prices;
        }

        return {
            // pageInit: pageInit,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            validateLine: validateLine_
        };

    });

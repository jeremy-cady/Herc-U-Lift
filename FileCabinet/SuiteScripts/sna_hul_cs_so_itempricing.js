/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to populate item pricing fields
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/25       		                 aduldulao       Initial version.
 * 2022/8/21                             aduldulao       Costing for 9800 Item Category
 * 2022/9/8                              aduldulao       Remove for rental items
 * 2022/9/15                             aduldulao       Use rate for inventory items
 * 2023/01/13                            nretiro         GAP 009
 * 2026/01/25                            aduldulao       Trigger cumulative calc on location change
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime'],
/**
 * @param{search} search
 */
function(search, runtime) {

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

    var TEMPITEMCAT = '';
    var RENTALCHARGE = '';
    var RENTALEQUIPMENT = '';

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
        var currentScript = runtime.getCurrentScript();
        TEMPITEMCAT = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
        RENTALCHARGE = currentScript.getParameter({name: 'custscript_sna_rental_serviceitem'});
        RENTALEQUIPMENT = currentScript.getParameter({name: 'custscript_sna_rental_equipment'});

        log.debug({title: 'pageInit', details: 'TEMPITEMCAT: ' + TEMPITEMCAT + ' | RENTALCHARGE: ' + RENTALCHARGE + ' | RENTALEQUIPMENT: ' + RENTALEQUIPMENT});
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var field = scriptContext.fieldId;
        var sublist = scriptContext.sublistId;
        var rec = scriptContext.currentRecord;
        var line = scriptContext.line;
        var rectype = rec.type;

        if (isEmpty(sublist)) {
            if (field == 'custbody_sna_hul_cus_pricing_grp') {
                rec.cancelLine({sublistId: 'item'}); // loner line

                log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | setPriceLevel'});
                setPriceLevel(rec, null, field);
            }
            if (field == 'custbody_sna_hul_location' || field == 'location') {
               log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | setLocationMarkUp'});
               setLocationMarkUp(rec, null, field);
            }
        }
        if (sublist == 'item') {
            // validateline works
            /*if (field == 'custcol_sna_hul_itemcategory' || field == 'custcol_sna_hul_replacementcost') {
                log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setPriceLevel'});
                setPriceLevel(rec, sublist, field);
            }
            if (field == 'custcol_sna_hul_markup' || field == 'custcol_sna_hul_markupchange' || field == 'custcol_sna_hul_loc_markupchange') {
                log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setCumulativeMarkup'});
                setCumulativeMarkup(rec, sublist, field);
            }*/
            if (field == 'custcol_sna_hul_dollar_disc' || field == 'custcol_sna_hul_perc_disc' || field == 'custcol_sna_hul_cumulative_markup' || field == 'custcol_sna_hul_basis' || field == 'custcol_sna_hul_list_price' || field == 'custcol_sna_hul_replacementcost' || field == 'custcol_sna_hul_itemcategory' || field == 'custcol_sna_hul_markup' || field == 'porate') {
                log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setNewCostUnit'});
                setNewCostUnit(rec, sublist, field);
            }
            if (field == 'custcol_sna_hul_newunitcost' || field == 'quantity') {
                log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setAmount'});
                setAmount(rec, sublist, field);
            }
            // validateline works
            /*if (field == 'location') {
                log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setLocationMarkUp'});
                setLocationMarkUp(rec, sublist, field);
            }*/
            if (field == 'quantity' || field == 'item' || field == 'povendor') {
                var poVendor = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'povendor' });

                log.debug({ title: '-- sublistChanged', details: 'field: ' + field + ' | sublist: item | setSOVendorPrice' });

                setSOVendorPrice(rec, sublist, field, poVendor, line);
            }
        }
    }

    /**
     * Function to be executed when field is slaved.
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
        var rectype = rec.type;

        /*if (isEmpty(sublist)) { // originally in postsourcing before custom location field
            if (field == 'location') {
                log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | setLocationMarkUp'});
                setLocationMarkUp(rec, null, field);
            }
        }*/
        if (sublist == 'item') {
            /*if (field == 'location') {
                log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setLocationMarkUp'});
                setLocationMarkUp(rec, sublist, field);
            }*/
            // validateline works
            /*if (field == 'item') {
                log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setLocationMarkUp'});
                setLocationMarkUp(rec, sublist, field);
                log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setVendorPrice'});
                setVendorPrice(rec, sublist, field);
            }*/
        }
    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {
        var rec = scriptContext.currentRecord;
        var itmpricelevel = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel'});
        var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
        var genprodgrp = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
        var itmtype = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'itemtype'});

        if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return true;

        log.audit('itmpricelevel', itmpricelevel)

        // run for all because field change for hidden fields does not work - hidden fields moved to SL page
        //if (isEmpty(itmpricelevel)) {
            setLocationMarkUp(rec, 'item', null);
            setVendorPrice(rec, 'item', null);
            setPriceLevel(rec, 'item', null);
            setCumulativeMarkup(rec, 'item', null);
            setNewCostUnit(rec, 'item', null);
            setAmount(rec, 'item', null);
        //}

        return true;
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Amount (Native Field) is populated based on New Unit Cost x Quantity
     * @param rec
     * @param sublist
     * @param field
     */
    function setAmount(rec, sublist, field) {
        var newunitcost = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_newunitcost'});
        var qty = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'quantity'});
        var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
        var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
        var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});

        if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

        if (!isEmpty(itm)) {
            var newamt = forceFloat(newunitcost) * forceFloat(qty);
            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: forceFloat(newunitcost)});
            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'amount', value: newamt});
            log.debug({title: 'setAmount', details: 'newamt: ' + newamt});
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * New Unit Cost (Custom Field) is populated based on ((1 + Cumulative % Mark Up + % Discount) x List/Item Purchase Price) + $ Discount
     * Basis = SRP, List Price (field in Vendor Price Record) is Used
     * Basis = Replacement Cost, Item Purchase Price is used
     * @param rec
     * @param sublist
     * @param field
     */
    function setNewCostUnit(rec, sublist, field) {
        var cumulative = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_cumulative_markup'});
        var percdiscount = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_perc_disc'});
        var dollardiscount = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_dollar_disc'});
        var basis = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_basis'});
        var listprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price'});
        var purchaseprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost'});
        var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
        var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});
        var porate = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'porate'});
        var markup = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_markup'});
        var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
        var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});
        if (basis == 1) { // SRP
            var price = listprice;
        }
        else { // Replacement Cost
            var price = purchaseprice;
        }

        if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

        log.debug({title: 'setNewCostUnit', details: 'cumulative: ' + cumulative + ' | percdiscount: ' + percdiscount
                + ' | dollardiscount: ' + dollardiscount + ' | basis: ' + basis + ' | price: ' + price
                + ' | itmcat: ' + itmcat + ' | porate: ' + porate + ' | markup: ' + markup + ' | itmtype: ' + itmtype});

        if (!isEmpty(itm)) {
            if (itmcat == TEMPITEMCAT) {
                var newunitcost = ((1 + ((forceFloat(cumulative) + forceFloat(percdiscount)) / 100)) * forceFloat(porate)) + forceFloat(dollardiscount);
            }
            else {
                var newunitcost = ((1 + ((forceFloat(cumulative) + forceFloat(percdiscount)) / 100)) * forceFloat(price)) + forceFloat(dollardiscount);
            }
            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_newunitcost', value: newunitcost, forceSyncSourcing: true});
            log.debug({title: 'setNewCostUnit', details: 'newunitcost: ' + newunitcost});
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Cumulative % Mark Up (Custom Field) field is populated based on the total of: % Mark Up, % Mark Up Change, Location % Mark Up Change
     * @param rec
     * @param sublist
     * @param field
     */
    function setCumulativeMarkup(rec, sublist, field) {
        var markup = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_markup'});
        var markupchange = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_markupchange'});
        var locmarkupchange = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_loc_markupchange'});
        var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
        var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
        var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});

        if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

        log.debug({title: 'setCumulativeMarkup', details: 'markup: ' + markup + ' | markupchange: ' + markupchange + ' | locmarkupchange: ' + locmarkupchange});

        if (!isEmpty(itm)) {
            var sum = forceFloat(markup) + forceFloat(markupchange) + forceFloat(locmarkupchange);

            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_cumulative_markup', value: sum, forceSyncSourcing: true});
            log.debug({title: 'setCumulativeMarkup', details: 'sum: ' + sum});
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
     * @param rec
     * @param sublist
     * @param field
     */
    function setVendorPrice(rec, sublist, field) {
        if (!isEmpty(sublist)) {
            var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
            var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
            var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});

            if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

            log.debug({title: 'setVendorPrice', details: 'itm: ' + itm});

            if (!isEmpty(itm)) {
                var prices = getVendorPrice(itm);
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price', value: prices.listprice, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost', value: prices.itmpurchprice, forceSyncSourcing: true});
                log.debug({title: 'setVendorPrice', details: 'listprice: ' + prices.listprice + ' | itmpurchprice: ' + prices.itmpurchprice});
            }
        }
    }

    /**
     * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
     * @param itm
     * @returns {{}}
     */
    function getVendorPrice(itm) {
        var prices = {};
        prices.listprice = '';
        prices.itmpurchprice = '';

        var filters_ = [];
        filters_.push(search.createFilter({name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm}));
        filters_.push(search.createFilter({name: 'custrecord_sna_hul_primaryvendor', operator: search.Operator.IS, values: true}));
        var columns_ = [];
        columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first combination
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_listprice'}));
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_itempurchaseprice'}));

        var cusrecsearch = search.create({type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_});
        var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});
        if (!isEmpty(cusrecser)) {
            prices.listprice = cusrecser[0].getValue({name: 'custrecord_sna_hul_listprice'});
            prices.itmpurchprice = cusrecser[0].getValue({name: 'custrecord_sna_hul_itempurchaseprice'});
        }

        return prices;
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Item Price Level is populated based on Item Category-Customer Pricing Group combination.
     * If no Item Category-Customer Pricing Group combination is found, List is selected as default.
     * If Customer Pricing Group = List, and there are multiple under the Item Category,
     * Min Unit Cost and Max Unit Cost are considered and filtered and compared against Item Purchase Price.
     * @param rec
     * @param sublist
     * @param field
     */
    function setPriceLevel(rec, sublist, field) {
        var prcinggroup = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
        if (isEmpty(prcinggroup)) {
            prcinggroup = 1; // List
        }

        if (!isEmpty(sublist)) {
            var finalpricelevel = '';

            var itmpurchaseprice = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost'});
            var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});
            var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
            var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
            var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});

            if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

            log.debug({title: 'setPriceLevel', details: 'prcinggroup: ' + prcinggroup + ' | itmcat: ' + itmcat + ' | itm: ' + itm});

            if (!isEmpty(itm)) {
                var pricelevel = getPriceLevel(itmcat, prcinggroup);
                if (!isEmpty(pricelevel[itmcat+'-'+prcinggroup])) {
                    var arrrec = pricelevel[itmcat+'-'+prcinggroup];
                    finalpricelevel = getFinalPriceLevel(arrrec, prcinggroup, itmpurchaseprice);
                }
                else if (!isEmpty(pricelevel[itmcat+'-1'])) {
                    var arrrec = pricelevel[itmcat+'-1']; // default to list if orig combi is not found
                    finalpricelevel = getFinalPriceLevel(arrrec, 1, itmpurchaseprice);
                }

                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_item_pricelevel', value: finalpricelevel, forceSyncSourcing: true});
                log.debug({title: 'setPriceLevel', details: 'finalpricelevel: ' + finalpricelevel});
            }
        }
        else {
            var allitmcat = [];

            var itmlines = rec.getLineCount({sublistId: 'item'});
            for (var j = 0; j < itmlines; j++) {
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: j});
                var lineitmcat = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j});
                var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: j});
                var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: j});

                if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') continue;

                if (!isEmpty(lineitmcat)) {
                    allitmcat.push(lineitmcat);
                }
            }

            log.debug({title: 'setPriceLevel', details: 'allitmcat: ' + allitmcat.toString() + ' | prcinggroup: ' + prcinggroup + ' | itmlines: ' + itmlines});

            var pricelevel = getPriceLevel(allitmcat, prcinggroup);
            for (var i = 0; i < itmlines; i++) {
                var finalpricelevel = '';

                var lineitmcat = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                var linepricelevel = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel', line: i});
                var lineitmpurchaseprice = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost', line: i});
                var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i});
                var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i});
                var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});

                if (!isEmpty(genprodgrp) || lineitm == RENTALCHARGE || lineitm == RENTALEQUIPMENT || itmtype != 'InvtPart') continue;

                if (!isEmpty(pricelevel[lineitmcat+'-'+prcinggroup])) {
                    var arrrec = pricelevel[lineitmcat+'-'+prcinggroup];
                    finalpricelevel = getFinalPriceLevel(arrrec, prcinggroup, lineitmpurchaseprice);
                }
                else if (!isEmpty(pricelevel[itmcat+'-1'])) {
                    var arrrec = pricelevel[itmcat+'-1']; // default to list if orig combi is not found
                    finalpricelevel = getFinalPriceLevel(arrrec, 1, itmpurchaseprice);
                }

                if (linepricelevel != finalpricelevel && !isEmpty(lineitm)) {
                    rec.selectLine({sublistId: 'item', line: i});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel', value: finalpricelevel, forceSyncSourcing: true});
                    rec.commitLine({sublistId: 'item'});
                    log.debug({title: 'setPriceLevel', details: 'finalpricelevel: ' + finalpricelevel + ' | line: ' + i});
                }
            }
        }
    }

    /**
     * Item Price Level is populated based on Item Category-Customer Pricing Group combination.
     * If no Item Category-Customer Pricing Group combination is found, List is selected as default.
     * If Customer Pricing Group = List, and there are multiple under the Item Category,
     * Min Unit Cost and Max Unit Cost are considered and filtered and compared against Item Purchase Price.
     * @param arrrec
     * @param prcinggroup
     * @param lineitmpurchaseprice
     * @returns {string}
     */
    function getFinalPriceLevel(arrrec, prcinggroup, lineitmpurchaseprice) {
        var finalpricelevel = '';

        for (var x = 0; x < arrrec.length; x++) {
            if (prcinggroup == 1) { // List
                var min = arrrec[x].mincost;
                var max = arrrec[x].maxcost;

                if ((!isEmpty(max) && forceFloat(lineitmpurchaseprice) >= forceFloat(min) && forceFloat(lineitmpurchaseprice) < forceFloat(max)) ||
                    (isEmpty(max) && forceFloat(lineitmpurchaseprice) >= forceFloat(min))) { // min cost is priority
                    finalpricelevel = arrrec[x].id;
                }
            }
            else {
                finalpricelevel = arrrec[x].id; // assumed to be 1 if non-List
            }
        }

        return finalpricelevel;
    }

    /**
     * Item Price Level is populated based on Item Category-Customer Pricing Group combination.
     * If no Item Category-Customer Pricing Group combination is found, List is selected as default.
     * If Customer Pricing Group = List, and there are multiple under the Item Category,
     * Min Unit Cost and Max Unit Cost are considered and filtered and compared against Item Purchase Price.
     * @param allitmcat
     * @param prcinggroup
     * @returns {{}}
     */
    function getPriceLevel(allitmcat, prcinggroup) {
        var pricelevel = {};

        var filters_ = [];
        if (!isEmpty(allitmcat)) {
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.ANYOF, values: allitmcat}));
        } else {
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: '@NONE@'}));
        }
        // do not filter pricing group
        if (isEmpty(prcinggroup)) {
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: '@NONE@'}));
        }
        var columns_ = [];
        columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Location combination
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_itemcategory'}));
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_customerpricinggroup'}));
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_mincost'}));
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_maxcost'}));

        var cusrecsearch = search.create({type: 'customrecord_sna_hul_itempricelevel', filters: filters_, columns: columns_});
        cusrecsearch.run().each(function(result) {
            var curritmcat = result.getValue({name: 'custrecord_sna_hul_itemcategory'});
            var currpricinggrp = result.getValue({name: 'custrecord_sna_hul_customerpricinggroup'});
            var currid = result.getValue({name: 'internalid'});
            var currmincost = result.getValue({name: 'custrecord_sna_hul_mincost'});
            var currmaxcost = result.getValue({name: 'custrecord_sna_hul_maxcost'});

            if (isEmpty(pricelevel[curritmcat+'-'+currpricinggrp])) {
                pricelevel[curritmcat+'-'+currpricinggrp] = [];
            }

            var obj = {};
            obj.mincost = currmincost;
            obj.maxcost = currmaxcost;
            obj.id = currid;
            pricelevel[curritmcat+'-'+currpricinggrp].push(obj);

            return true;
        });

        return pricelevel;
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Sales Rep enters Location. If there is a Location Mark Up record that matches the populated Item Category-Location Mark up combination available,
     * Location Mark Up and Location Mark Up % Change record is populated.
     * @param rec
     * @param sublist
     * @param field
     */
    function setLocationMarkUp(rec, sublist, field) {
        if (!isEmpty(sublist)) {
            var finallocmarkup = '';

            var loc = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'location'});
            if (isEmpty(loc)) {
                loc = rec.getValue({fieldId: 'location'});
            }
            var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});
            var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
            var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
            var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});

            if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

            log.debug({title: 'setLocationMarkUp', details: 'loc: ' + loc + ' | itmcat: ' + itmcat + ' | itm: ' + itm});

            if (!isEmpty(itm)) {
                var locmarkup = getLocationMarkup(itmcat, loc);
                if (!isEmpty(locmarkup[itmcat+'-'+loc])) {
                    finallocmarkup = locmarkup[itmcat+'-'+loc];
                }

                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_loc_markup', value: finallocmarkup, forceSyncSourcing: true});
                log.debug({title: 'setLocationMarkUp', details: 'finallocmarkup: ' + finallocmarkup});
            }
        }
        else {
            var allitmcat = [];
            var allloc = [];

            var loc = rec.getValue({fieldId: 'location'});
            if (!isEmpty(loc)) {
                allloc.push(loc);
            }
            var custloc = rec.getValue({fieldId: 'custbody_sna_hul_location'});
            if (!isEmpty(custloc)) {
                allloc.push(custloc);
            }

            var itmlines = rec.getLineCount({sublistId: 'item'});
            for (var j = 0; j < itmlines; j++) {
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: j});
                var lineloc = rec.getSublistValue({ sublistId: 'item', fieldId: 'location', line: j});
                if (!isEmpty(lineloc)) {
                    allloc.push(lineloc);
                }
                var lineitmcat = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j});
                var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: j});
                var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: j});

                if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') continue;

                if (!isEmpty(lineitmcat)) {
                    allitmcat.push(lineitmcat);
                }
            }

            log.debug({title: 'setLocationMarkUp', details: 'allloc: ' + allloc.toString() + ' | allitmcat: ' + allitmcat.toString()});

            var locmarkup = getLocationMarkup(allitmcat, allloc);
            for (var i = 0; i < itmlines; i++) {
                var finallocmarkup = '';

                var lineloc = rec.getSublistValue({ sublistId: 'item', fieldId: 'location', line: i});
                if (isEmpty(lineloc)) {
                    lineloc = loc;
                }
                if (isEmpty(lineloc)) {
                    lineloc = custloc;
                }
                var lineitmcat = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                var linelocmarkup = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_loc_markup', line: i});
                var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i});
                var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i});
                var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});

                if (!isEmpty(genprodgrp) || lineitm == RENTALCHARGE || lineitm == RENTALEQUIPMENT || itmtype != 'InvtPart') continue;

                if (!isEmpty(locmarkup[lineitmcat+'-'+lineloc])) {
                    finallocmarkup = locmarkup[lineitmcat+'-'+lineloc];
                }

                if (linelocmarkup != finallocmarkup && !isEmpty(lineitm)) {
                    rec.selectLine({sublistId: 'item', line: i});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_loc_markup', value: finallocmarkup, forceSyncSourcing: true});
                    rec.commitLine({sublistId: 'item'});
                    log.debug({title: 'setLocationMarkUp', details: 'finallocmarkup: ' + finallocmarkup + ' | line: ' + i});
                }
            }
        }
    }

    /**
     * Sales Rep enters Location. If there is a Location Mark Up record that matches the populated Item Category-Location Mark up combination available,
     * Location Mark Up and Location Mark Up % Change record is populated.
     * @param itmcat
     * @param loc
     * @returns {{}}
     */
    function getLocationMarkup(itmcat, loc) {
        var locmarkup = {};

        var filters_ = [];
        if (!isEmpty(itmcat)) {
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcat', operator: search.Operator.ANYOF, values: itmcat}));
        } else {
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcat', operator: search.Operator.IS, values: '@NONE@'}));
        }
        if (!isEmpty(loc)) {
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.ANYOF, values: loc}));
        } else {
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.IS, values: '@NONE@'}));
        }
        var columns_ = [];
        columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Location combination
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_itemcat'}));
        columns_.push(search.createColumn({name: 'custrecord_sna_hul_loc'}));

        var cusrecsearch = search.create({type: 'customrecord_sna_hul_locationmarkup', filters: filters_, columns: columns_});
        cusrecsearch.run().each(function(result) {
            var curritmcat = result.getValue({name: 'custrecord_sna_hul_itemcat'});
            var currloc = result.getValue({name: 'custrecord_sna_hul_loc'});
            var currid = result.getValue({name: 'internalid'});

            locmarkup[curritmcat+'-'+currloc] = currid;

            return true;
        });

        return locmarkup;
    }



    //GAP 009
    /**
     * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
     * @param rec
     * @param sublist
     * @param field
     */

    function setSOVendorPrice(rec, sublist, field, buyFromVendor, line) {
        if (!isEmpty(sublist)) {




            var itm = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'item' });
            var itmtype = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'itemtype' });
            var qty = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'quantity' });
            var intSumOfQty = 0;



            if (itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

            log.debug({ title: 'setVendorPrice', details: 'itm: ' + itm + '| buyFromVendor: ' + buyFromVendor + '| qty: ' + qty });

            if (!isEmpty(itm)) {
                var prices = getSOVendorPrice(itm, buyFromVendor);

                if (!isEmpty(prices.qtybreakprice)) {
                    //log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });
                    log.debug({ title: 'setVendorPrice', details: 'qtybreakprice: ' + prices.qtybreakprice });

                    var qtyBreakPrice = JSON.parse(prices.qtybreakprice);

                    var setPrice;

                    for (var qbpIndex = 0; qbpIndex < qtyBreakPrice.length; qbpIndex++) {
                        var currQty = qtyBreakPrice[qbpIndex].Quantity;
                        var currPrice = qtyBreakPrice[qbpIndex].Price;

                        log.debug({ title: 'setVendorPrice', details: 'qty: ' + qty + ' vs. ' + 'currQty: ' + currQty + '| currPrice: ' + currPrice});

                        if (qty >= currQty) {
                            setPrice = currPrice;

                            continue;
                        } else {
                            break;
                        }
                    }

                    setTimeout(function(){
                        rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'porate', value: setPrice, ignoreFieldChange: false });
                        //rec.commitLine({ sublistId: sublist });
                    }, 700);




                } else if (!isEmpty(prices.itmpurchprice)) {
                    log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });

                    setTimeout( function(){
                        rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'porate', value: prices.itmpurchprice, ignoreFieldChange: false });
                        //rec.commitLine({ sublistId: sublist });
                    }, 700);

                }

                //rec.selectLine({ sublistId: sublist, line: line });

            }
        }
    }

    /**
     * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
     * @param itm
     * @param buyFromVendor
     * @returns {{}}
     */
    function getSOVendorPrice(itm, buyFromVendor) {
        var prices = {};
        prices.listprice = '';
        prices.itmpurchprice = '';

        var filters_ = [];
        filters_.push(search.createFilter({ name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm }));
        if (!isEmpty(buyFromVendor)) {
            filters_.push(search.createFilter({ name: 'custrecord_sna_hul_vendor', operator: search.Operator.ANYOF, values: buyFromVendor }));
        }
        //filters_.push(search.createFilter({name: 'custrecord_sna_hul_primaryvendor', operator: search.Operator.IS, values: true}));
        var columns_ = [];
        columns_.push(search.createColumn({ name: 'internalid', sort: search.Sort.ASC })); // to get first combination
        columns_.push(search.createColumn({ name: 'custrecord_sna_hul_listprice' }));
        columns_.push(search.createColumn({ name: 'custrecord_sna_hul_itempurchaseprice' }));
        columns_.push(search.createColumn({ name: 'custrecord_sna_hul_qtybreakprices' }));

        var cusrecsearch = search.create({ type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_ });
        var cusrecser = cusrecsearch.run().getRange({ start: 0, end: 1 });

        log.debug({ title: 'getVendorPrice', details: 'cusrecser: ' + JSON.stringify(cusrecser) });

        if (!isEmpty(cusrecser)) {
            prices.listprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_listprice' });
            prices.itmpurchprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_itempurchaseprice' });
            prices.qtybreakprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_qtybreakprices' });
        }

        return prices;
    }

    //END  OF GAP009


    return {
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        pageInit: pageInit,
        validateLine: validateLine
    };

});

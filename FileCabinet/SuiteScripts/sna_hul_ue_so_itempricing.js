/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to populate item pricing fields via CSV import
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/31       		                 aduldulao       Initial version.
 * 2022/8/21                             aduldulao       Costing for 9800 Item Category, remove CSV filter
 * 2022/9/8                              aduldulao       Remove for rental items
 * 2022/9/15                             aduldulao       Use rate for inventory items
 * 2023/4/4                              aduldulao       Source customer pricing group from address
 * 2023/4/7                              aduldulao       Remove use of main line customer pricing group
 * 2023/4/12                             aduldulao       Lock Rate
 * 2023/5/4                              aduldulao       New item categories
 * 2023/5/23                             aduldulao       Add service code filter
 * 2023/6/08                             aduldulao       Estimated PO Rate
 * 2023/6/15                             aduldulao       Sublet
 * 2023/6/19                             aduldulao       Tax automation
 * 2023/9/25                             aduldulao       Parts Pricing > Add Revenue Stream
 * 2023/9/27                             aduldulao       Item Price Level of sublet and temporary items
 * 2024/2/9                              caranda         Exclude Item with Service Type = Resource in setting Lock Rate
 * 2024/7/18                             fang            Added setting of Price Level = Custom before setting of item rate to prevent issue when item is added in SO via NXC Mobile
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/search', 'N/record', 'N/url', './sna_hul_mod_sales_tax.js'],
    /**
     * @param{runtime} runtime
     * @param{search} search
     */
    (runtime, search, record, url, mod_tax) => {

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
                log.debug({title: 'beforeLoad', details: 'scriptContext.type: ' + scriptContext.type});

                var recso = scriptContext.newRecord;
                var recid = recso.id;
                var rectype = recso.type;
                var createdfrom = recso.getValue({fieldId: 'createdfrom'});

                var isview = false;
                var iscreate = false;
                var fromest = false;

                if (scriptContext.type == scriptContext.UserEventType.VIEW) {
                    isview = true;
                }
                else if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.COPY) {
                    iscreate = true;
                }
                if (rectype == record.Type.SALES_ORDER && !isEmpty(createdfrom)) {
                    fromest = true;
                }

                var itmlen = recso.getLineCount({sublistId: 'item'});

                for (var i = 0; i < itmlen; i++) {
                    if (isview) {
                        var lineuniquekey = recso.getSublistValue({sublistId: 'item', fieldId: 'lineuniquekey', line: i});
                        var otherdets = recso.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_pricing_details', line: i});

                        if (isEmpty(otherdets)) {
                            var slurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_itempricingdet', deploymentId: 'customdeploy_sna_hul_sl_itempricingdet',
                                params : {'lineid': lineuniquekey}
                            });
                            slurl = '<a href="' + slurl + '" onclick="window.open(\'' + slurl + '\', \'newwindow\', \'width=400,height=250\'); return false;">Other Details</a>';

                            recso.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_pricing_details', value: slurl, line: i});
                        }
                    }

                    else if (iscreate) {
                        log.debug({title: 'beforeLoad', details: 'createdfrom: ' + createdfrom});

                        if (fromest) {
                            var estporate = recso.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', line: i});
                            log.debug({title: 'beforeLoad', details: 'estporate: ' + estporate});

                            if (!isEmpty(estporate)) {
                                recso.setSublistValue({sublistId: 'item', fieldId: 'porate', value: estporate, line: i});
                            }
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
            var RENTALCHARGE = currentScript.getParameter({name: 'custscript_sna_rental_serviceitem'});
            var RENTALEQUIPMENT = currentScript.getParameter({name: 'custscript_sna_rental_equipment'});
            var itemservicecodetype = currentScript.getParameter({name: 'custscript_sna_servicecodetype_item'});
            var subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});
            var willcall = currentScript.getParameter({name: 'custscript_sna_ofm_willcall'});
            var ship = currentScript.getParameter({name: 'custscript_sna_ofm_ship'});
            var avataxpos = currentScript.getParameter({name: 'custscript_sna_tax_avataxpos'});
            var avatax = currentScript.getParameter({name: 'custscript_sna_tax_avatax'});
            var cshop = currentScript.getParameter({name: 'custscript_sn_revstream_cshop'});
            var rentalform = currentScript.getParameter({name: 'custscript_sn_rentalso'});
            var nxcform = currentScript.getParameter({name: 'custscript_sn_nxso'});
            let NONTAXABLE = currentScript.getParameter({name: 'custscript_sna_tax_nontaxable'});
            var rentalestform = currentScript.getParameter('custscript_sna_rentalestform');
            var nxcestform = currentScript.getParameter('custscript_sn_serviceestimate');

            var rec = scriptContext.newRecord;
            var rectype = rec.type;
            let recId = rec.id;

            log.debug({title: 'beforeSubmit', details: 'runtime.executionContext: ' + runtime.executionContext + ' | ' + scriptContext.type});

            let uiCreated = false;

            if (runtime.executionContext == runtime.ContextType.USER_INTERFACE &&
                (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.COPY))
            {
                uiCreated = true;
            }

            log.debug({title: 'beforeSubmit', details: 'uiCreated: ' + uiCreated});

            if (!uiCreated) {
                if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                    var customform = rec.getValue({fieldId: 'customform'});
                    var revstream = rec.getValue({fieldId: 'cseg_sna_revenue_st'})
                    log.debug({title: 'beforeSubmit', details: 'customform: ' + customform + ' | revstream: ' + revstream});

                    // If Sales Order Form is NXC or Rental Forms, it will be set to SHIP and If Revenue Stream is CSHOP it will be set to Will Call.
                    if (revstream == cshop) {
                        rec.setValue({fieldId: 'custbody_sna_order_fulfillment_method', value: willcall});
                    }
                }
            }

            /*var finaltaxcode = '';
            var userinterface = false;
            var internal = false;

            //if (runtime.executionContext == runtime.ContextType.USER_INTERFACE || runtime.executionContext == runtime.ContextType.WEBSERVICES) {
                if (rectype == record.Type.SALES_ORDER) {
                    userinterface = true;

                    var ordermethod = rec.getValue({fieldId: 'custbody_sna_order_fulfillment_method'});

                    if (ordermethod == willcall) {
                        finaltaxcode = avataxpos;
                    }
                    else if (ordermethod == ship) {
                        finaltaxcode = avatax;
                    }

                    internal = mod_tax.updateLines(rec, true);
                }
            //}

            log.debug({title: 'beforeSubmit', details: 'finaltaxcode: ' + finaltaxcode});

            if (userinterface) {
                if (!isEmpty(finaltaxcode)) {
                    log.audit({title: 'beforeSubmit | finaltaxcode', details: 'setting shipping tax code'});

                    rec.setValue({fieldId: 'custbody_sna_tax_processed', value: true});
                    rec.setValue({fieldId: 'shippingtaxcode', value: finaltaxcode});
                }
            }*/

            var itmlines = rec.getLineCount({sublistId: 'item'});
            for (var j = 0; j < itmlines; j++) {
                var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: j});
                var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: j});
                var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: j});
                var lockline = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate', line: j});
                var lineservicetype = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: j});
                var itmcat = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j});

                /*if (userinterface) {
                    if (!isEmpty(finaltaxcode) && !internal) {
                        rec.setSublistValue({sublistId: 'item', fieldId: 'taxcode', value: finaltaxcode, line: j});

                        log.audit({title: 'beforeSubmit | setting line tax code', details: 'line = ' + j + ' | finaltaxcode = ' + finaltaxcode});
                    }
                }*/

                if (!isEmpty(genprodgrp) || lineitm == RENTALCHARGE || lineitm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && lineservicetype != 2 && itmcat != subletitemcat)) continue;

                if(lineservicetype != 2){
                    rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate', value: true, line: j}); // default to true on save
                }

                var isLockRate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate', line: j});
                log.audit({title: 'beforeSubmit | for testing', details: 'line = ' + j + ' | isLockRate = ' + isLockRate});
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
                // if (runtime.executionContext != runtime.ContextType.CSV_IMPORT) return; // comment out for cases where items are added via Search in the UI. CS script is not triggered

                var currentScript = runtime.getCurrentScript();
                var TEMPITEMCAT = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
                var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
                var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
                var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
                var RENTALCHARGE = currentScript.getParameter({name: 'custscript_sna_rental_serviceitem'});
                var RENTALEQUIPMENT = currentScript.getParameter({name: 'custscript_sna_rental_equipment'});
                var itemservicecodetype = currentScript.getParameter({name: 'custscript_sna_servicecodetype_item'});
                var subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});

                var allitem = [];
                var allloc = [];
                var allrevstream = [];
                var hasemptypricelevel = false;
                var haschanged = false;

                var _rec = scriptContext.newRecord;

                var rec = record.load({
                    type: _rec.type,
                    id: _rec.id,
                    isDynamic: true
                });

                var shipaddrSubrecord = rec.getSubrecord({fieldId: 'shippingaddress'});
                var addressid = rec.getValue({fieldId: 'shipaddresslist'});

                var entity = rec.getValue({fieldId: 'entity'});
                //var prcinggrp = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
                var prcinggrp = getPricingGrpAddress(rec);
                var loc = rec.getValue({fieldId: 'location'});
                if (!isEmpty(loc)) {
                    allloc.push(loc);
                }
                var custloc = rec.getValue({fieldId: 'custbody_sna_hul_location'});
                if (!isEmpty(custloc)) {
                    allloc.push(custloc);
                }
                var headerrevstream = rec.getValue({fieldId: 'cseg_sna_revenue_st'});
                log.debug({title: 'afterSubmit', details: 'headerrevstream: ' + headerrevstream});

                // get from customer record
                if (!isEmpty(entity) && isEmpty(prcinggrp) && !isEmpty(addressid)) {
                    /*var custrec = search.lookupFields({type: record.Type.CUSTOMER, id: entity, columns: ['custentity_sna_hul_customerpricinggroup']});
                    if (!isEmpty(custrec.custentity_sna_hul_customerpricinggroup)) {
                        prcinggrp = custrec.custentity_sna_hul_customerpricinggroup[0].value;
                        rec.setValue({fieldId: 'custbody_sna_hul_cus_pricing_grp', value: prcinggrp});
                    }*/

                    prcinggrp = getCustPricingGrpAddress(entity, addressid);
                    shipaddrSubrecord.setValue({fieldId: 'custrecord_sna_cpg_parts', value: prcinggrp});
                }

                if (isEmpty(prcinggrp)) prcinggrp = 155; // List

                var oldrec = scriptContext.oldRecord;
                var arroldrev = [];

                if (!isEmpty(oldrec)) {
                    var _itemcount = oldrec.getLineCount({sublistId: 'item'});
                    for (var c = 0; c < _itemcount; c++) {
                        var _lineuniquekey = oldrec.getSublistValue({sublistId: 'item', fieldId: 'lineuniquekey', line: c});
                        var _revstream = oldrec.getSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st', line: c});

                        arroldrev[_lineuniquekey] = _revstream;

                        log.debug({title: 'afterSubmit', details: 'arroldrev: ' + arroldrev[_lineuniquekey] + ' | _lineuniquekey: ' + _lineuniquekey});
                    }
                }

                var itmlines = rec.getLineCount({sublistId: 'item'});
                for (var j = 0; j < itmlines; j++) {
                    var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: j});
                    var revStream = rec.getSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st', line: j});
                    if (isEmpty(revStream)) {
                        revStream = headerrevstream;
                    }
                    var lineuniquekey = rec.getSublistValue({sublistId: 'item', fieldId: 'lineuniquekey', line: j});
                    var oldrevStream = !isEmpty(arroldrev[lineuniquekey]) ? arroldrev[lineuniquekey] : '';
                    var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: j});
                    var itmpricelevel = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel', line: j});
                    var lineservicetype = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: j});
                    var manual = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual', line: j});
                    var itmcat = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j});
                    var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: j});
                    if (!isEmpty(lineitm)) {
                        allitem.push(lineitm);
                    }

                    log.debug({title: 'afterSubmit', details: 'revStream: ' + revStream + ' | oldrevStream: ' + oldrevStream});

                    if (!isEmpty(revStream)) {
                        allrevstream.push(revStream);
                    }

                    var lineloc = rec.getSublistValue({sublistId: 'item', fieldId: 'location', line: j});
                    if (!isEmpty(lineloc)) {
                        allloc.push(lineloc);
                    }

                    if (!isEmpty(genprodgrp) || lineitm == RENTALCHARGE || lineitm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat) || manual) continue;

                    if (isEmpty(itmpricelevel) || revStream != oldrevStream) {
                        hasemptypricelevel = true;
                    }
                }

                if (!hasemptypricelevel) return; // CS script already ran

                log.debug({title: 'afterSubmit', details: 'allitem: ' + JSON.stringify(allitem) + ' | allloc: ' + JSON.stringify(allloc) + ' | allrevstream: ' + JSON.stringify(allrevstream)});

                var itemsourcing = getItemValues(allitem);
                var locmarkup = getLocationMarkup(allloc);
                var prices = getVendorPrice(allitem);
                var pricelevel = getPriceLevel(prcinggrp);
                var revStreamData = getRevStreamData(allrevstream, itemservicecodetype);

                for (var i = 0; i < itmlines; i++) {
                    var finalitemcat = '';
                    var finaldiscgrp = '';
                    var finalmarkupchange = '';
                    var finallocmarkup = '';
                    var finallocmarkupchange = '';
                    var finallistprice = '';
                    var finalpurchprice = '';
                    var temppurchprice = '';
                    var finalpricelevel = '';
                    var finalbasis = '';
                    var finalmarkup = '';

                    var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i});
                    var percdiscount = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_perc_disc', line: i});
                    var dollardiscount = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dollar_disc', line: i});
                    var qty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                    var lineloc = rec.getSublistValue({ sublistId: 'item', fieldId: 'location', line: i});
                    var porate = rec.getSublistValue({sublistId: 'item', fieldId: 'porate', line: i});
                    var itmpricelevel = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel', line: i});
                    var itmcat = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                    if (isEmpty(lineloc)) {
                        lineloc = loc;
                    }
                    if (isEmpty(lineloc)) {
                        lineloc = custloc;
                    }
                    var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i});
                    var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
                    var lineservicetype = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: i});
                    var manual = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual', line: i});
                    var revStream = rec.getSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st', line: i});
                    if (isEmpty(revStream)) {
                        revStream = headerrevstream;
                    }
                    var lineuniquekey = rec.getSublistValue({sublistId: 'item', fieldId: 'lineuniquekey', line: i});
                    var oldrevStream = !isEmpty(arroldrev[lineuniquekey]) ? arroldrev[lineuniquekey] : '';
                    var initlistprice = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_list_price_init', line: i});
                    var initpurchaseprice = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost_init', line: i});
                    var prevlistprice = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_list_price_prev', line: i});
                    var prevpurchaseprice = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost_prev', line: i});

                    if (!isEmpty(itmpricelevel) && revStream == oldrevStream) continue; // CS script already ran
                    if (!isEmpty(genprodgrp) || lineitm == RENTALCHARGE || lineitm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat) || manual) continue;

                    haschanged = true;

                    rec.selectLine({sublistId: 'item', line: i});

                    if (!isEmpty(itemsourcing[lineitm])) {
                        finalitemcat = itemsourcing[lineitm].itemcat;
                        finaldiscgrp = itemsourcing[lineitm].discgrp;
                        finalmarkupchange = itemsourcing[lineitm].markupchange;
                    }

                    if (!isEmpty(locmarkup[finalitemcat+'-'+lineloc])) {
                        finallocmarkup = locmarkup[finalitemcat+'-'+lineloc].locmarkup;
                        finallocmarkupchange = locmarkup[finalitemcat+'-'+lineloc].locmarkupchange;
                    }

                    if (!isEmpty(prices[lineitm])) {
                        finallistprice = prices[lineitm].listprice;
                        finalpurchprice = prices[lineitm].itmpurchprice;
                    }

                    if (finalitemcat == TEMPITEMCAT || finalitemcat == allieditemcat || finalitemcat == rackingitemcat || finalitemcat == storageitemcat || finalitemcat == subletitemcat) {
                        if (_rec.type == record.Type.ESTIMATE) {
                            porate =  rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', line: i});
                        }
                        temppurchprice = porate;
                    }
                    else {
                        temppurchprice = finalpurchprice;
                    }

                    if (!isEmpty(pricelevel[finalitemcat+'-'+prcinggrp])) {
                        var arrrec = pricelevel[finalitemcat+'-'+prcinggrp];
                        var _finalpricelevel = getFinalPriceLevel(arrrec, prcinggrp, temppurchprice);
                        finalpricelevel = _finalpricelevel.finalpricelevel;
                        finalbasis = _finalpricelevel.finalbasis;
                        finalmarkup = _finalpricelevel.finalmarkup;
                    }
                    else if (!isEmpty(pricelevel[finalitemcat+'-155'])) {
                        var arrrec = pricelevel[finalitemcat+'-155']; // default to list if orig combi is not found
                        var _finalpricelevel = getFinalPriceLevel(arrrec, 155, temppurchprice);
                        finalpricelevel = _finalpricelevel.finalpricelevel;
                        finalbasis = _finalpricelevel.finalbasis;
                        finalmarkup = _finalpricelevel.finalmarkup;
                    }

                    var cumultive = forceFloat(finalmarkup) + forceFloat(finalmarkupchange) + forceFloat(finallocmarkupchange);

                    var _revStreamData = !isEmpty(revStreamData[revStream]) ? revStreamData[revStream] : {};
                    log.debug({title: 'afterSubmit', details: 'line: ' + i  + ' | _revStreamData: ' + JSON.stringify(_revStreamData) + ' | revStream: ' + revStream
                        + ' | prevlistprice: ' + prevlistprice + ' | prevpurchaseprice: ' + prevpurchaseprice});

                    // var price = (_revStreamData.pricecalc == 1) ? (isEmpty(prevlistprice) ? finallistprice : prevlistprice) : ((_revStreamData.pricecalc == 2) ? (isEmpty(initlistprice) ? finallistprice : initlistprice) : finallistprice);
                    // var price = (_revStreamData.pricecalc == 1) ? (isEmpty(prevpurchaseprice) ? finalpurchprice : prevpurchaseprice) : ((_revStreamData.pricecalc == 2) ? (isEmpty(initpurchaseprice) ? finalpurchprice : initpurchaseprice) : finalpurchprice);

                    // always use the initial purchase price if cost
                    if (_revStreamData.pricecalc == 2 || _revStreamData.pricecalc == 4) {
                        var price = isEmpty(initpurchaseprice) ? finalpurchprice : initpurchaseprice;
                    }
                    else {
                        if (finalbasis == 1) { // SRP
                            //var price = isEmpty(prevlistprice) ? finallistprice : prevlistprice;
                            var price = finallistprice;
                        }
                        else { // Replacement Cost
                            //var price = isEmpty(prevpurchaseprice) ? finalpurchprice : prevpurchaseprice;
                            var price = finalpurchprice;
                        }
                    }

                    if (finalitemcat == TEMPITEMCAT || finalitemcat == allieditemcat || finalitemcat == rackingitemcat || finalitemcat == storageitemcat || finalitemcat == subletitemcat) {
                        if (_rec.type == record.Type.ESTIMATE) {
                            porate =  rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', line: i});
                        }

                        var finalprice = porate;
                    }
                    else {
                        var finalprice = price;
                    }

                    var wodiscount = (1 + (forceFloat(cumultive) / 100)) * forceFloat(finalprice);

                    // 1 = Sales Price - Discount
                    if (_revStreamData.pricecalc == 1) {
                        wodiscount = wodiscount - forceFloat(wodiscount * (forceFloat(_revStreamData.surcharge) / 100));
                    }
                    // 2 = Cost Price + Surcharge
                    else if (_revStreamData.pricecalc == 2) {
                        wodiscount = (1 + (forceFloat(_revStreamData.surcharge) / 100)) * forceFloat(finalprice);
                    }
                    // 3 = Sales Price + Surcharge
                    else if (_revStreamData.pricecalc == 3) {
                        wodiscount = (1 + (forceFloat(_revStreamData.surcharge) / 100)) * forceFloat(wodiscount);
                    }
                    // 4 = Cost Price - Discount
                    else if (_revStreamData.pricecalc == 4) {
                        wodiscount = finalprice - forceFloat(finalprice * (forceFloat(_revStreamData.surcharge) / 100));
                    }

                    var newunitcost = wodiscount - forceFloat(dollardiscount) - forceFloat(wodiscount * (forceFloat(percdiscount) / 100));

                    var newamt = forceFloat(newunitcost) * forceFloat(qty);

                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', value: finalitemcat});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_item_discount_grp', value: finaldiscgrp});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_markupchange', value: forceFloat(finalmarkupchange)}); // field sourcing kicks in
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_loc_markup', value: finallocmarkup});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_loc_markupchange', value: forceFloat(finallocmarkupchange)}); // field sourcing kicks in
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_list_price', value: finallistprice});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost', value: finalpurchprice});
                    if (isEmpty(initlistprice)) {
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_list_price_init', value: finallistprice});
                    }
                    if (isEmpty(initpurchaseprice)) {
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost_init', value: finalpurchprice});
                    }
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel', value: finalpricelevel});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_basis', value: finalbasis}); // field sourcing kicks in
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_markup', value: forceFloat(finalmarkup)}); // field sourcing kicks in
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_cumulative_markup', value: cumultive});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_newunitcost', value: newunitcost});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcolsna_hul_newunitcost_wodisc', value: wodiscount});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_list_price_prev', value: finallistprice});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost_prev', value: finalpurchprice});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: newunitcost});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'amount', value: newamt});

                    log.debug({title: 'afterSubmit', details: 'line: ' + i
                            + ' | finalitemcat: ' + finalitemcat
                            + ' | finaldiscgrp: ' + finaldiscgrp
                            + ' | finalmarkupchange: ' + finalmarkupchange
                            + ' | finallocmarkup: ' + finallocmarkup
                            + ' | finallocmarkupchange: ' + finallocmarkupchange
                            + ' | finallistprice: ' + finallistprice
                            + ' | finalpurchprice: ' + finalpurchprice
                            + ' | finalpricelevel: ' + finalpricelevel
                            + ' | finalbasis: ' + finalbasis
                            + ' | finalmarkup: ' + finalmarkup
                            + ' | cumultive: ' + cumultive
                            + ' | newunitcost: ' + newunitcost
                            + ' | newamt: ' + newamt
                    });

                    rec.commitLine({sublistId: 'item'});
                }

                if (haschanged) {
                    var idso = rec.save({enableSourcing: true, ignoreMandatoryFields: true});
                    log.debug({title: 'afterSubmit', details: 'SO costing updated: ' + idso});
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
         * Get revenue stream calculations
         * @param revStream
         * @param itemservicecodetype
         * @returns {{}}
         */
        function getRevStreamData(allrevstream, itemservicecodetype) {
            if (isEmpty(allrevstream)) return {};

            var revStreamData = {};

            var filters_ = [];
            filters_.push(search.createFilter({name: 'custrecord_sna_serv_code', operator: search.Operator.ANYOF, values: allrevstream}));
            filters_.push(search.createFilter({name: 'custrecord_sna_ser_code_type', operator: search.Operator.IS, values: itemservicecodetype}));
            filters_.push(search.createFilter({name: 'custrecord_sna_surcharge', operator: search.Operator.ISNOTEMPTY, values: ''}));
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.DESC})); // get latest
            columns_.push(search.createColumn({name: 'custrecord_sna_price_calculation'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_surcharge'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_serv_code'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_service_code_type', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var currrevstream = result.getValue({name: 'custrecord_sna_serv_code'});
                var currpricecalc = result.getValue({name: 'custrecord_sna_price_calculation'});
                var currsurcharge = result.getValue({name: 'custrecord_sna_surcharge'});

                if (isEmpty(revStreamData[currrevstream])) {
                    revStreamData[currrevstream] = {};
                    revStreamData[currrevstream].pricecalc = currpricecalc;
                    revStreamData[currrevstream].surcharge = currsurcharge;
                }

                return true;
            });

            return revStreamData;
        }

        /**
         * Get info of items
         * @param items
         * @returns {{}}
         */
        function getItemValues(items) {
            if (isEmpty(items)) return {};

            var itemvalues = {};

            var filters_ = [];
            filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: items}));
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid'}));
            columns_.push(search.createColumn({name: 'custitem_sna_hul_itemcategory'}));
            columns_.push(search.createColumn({name: 'custitem_sna_hul_itemdiscountgroup'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_markup_change', join: 'custitem_sna_hul_itemdiscountgroup'}));

            var cusrecsearch = search.create({type: 'item', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var curritm = result.getValue({name: 'internalid'});
                var curritemcat = result.getValue({name: 'custitem_sna_hul_itemcategory'});
                var currdiscgrp = result.getValue({name: 'custitem_sna_hul_itemdiscountgroup'});
                var currmarkupchange = result.getValue({name: 'custrecord_sna_hul_markup_change', join: 'custitem_sna_hul_itemdiscountgroup'});

                itemvalues[curritm] = {};
                itemvalues[curritm].itemcat = curritemcat;
                itemvalues[curritm].discgrp = currdiscgrp;
                itemvalues[curritm].markupchange = currmarkupchange;

                return true;
            });

            return itemvalues;
        }

        /**
         * Sales Rep enters Location. If there is a Location Mark Up record that matches the populated Item Category-Location Mark up combination available,
         * Location Mark Up and Location Mark Up % Change record is populated.
         * @param loc
         * @returns {{}}
         */
        function getLocationMarkup(loc) {
            var locmarkup = {};

            var filters_ = [];
            if (!isEmpty(loc)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.ANYOF, values: loc}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.ANYOF, values: ['@NONE@']}));
            }
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Location combination
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_itemcat'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_loc'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_loc_markup'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_locationmarkup', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var curritmcat = result.getValue({name: 'custrecord_sna_hul_itemcat'});
                var currloc = result.getValue({name: 'custrecord_sna_hul_loc'});
                var currlocmarkupchange = result.getValue({name: 'custrecord_sna_hul_loc_markup'});
                var currid = result.getValue({name: 'internalid'});

                locmarkup[curritmcat+'-'+currloc] = {};
                locmarkup[curritmcat+'-'+currloc].locmarkup = currid;
                locmarkup[curritmcat+'-'+currloc].locmarkupchange = currlocmarkupchange;

                return true;
            });

            return locmarkup;
        }

        /**
         * Get customer pricing group from customer
         * @param entity
         * @param id
         * @returns {string}
         */
        function getCustPricingGrpAddress(entity, addid) {
            log.debug({title: 'getCustPricingGrpAddress', details: 'entity: ' + entity + ' | addid: ' + addid});
            var cpg = '';

            var filters_ = [];

            filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: entity}));
            //filters_.push(search.createFilter({name: 'addressinternalid', join: 'address', operator: search.Operator.IS, values: addid})); // this is not working

            var columns_ = [];
            columns_.push(search.createColumn({name: 'custrecord_sna_cpg_parts', join: 'Address'}));
            columns_.push(search.createColumn({name: 'addressinternalid', join: 'Address'}));

            var cusrecsearch = search.create({type: search.Type.CUSTOMER, filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var resaddressid = result.getValue({name: 'addressinternalid', join: 'Address'});
                log.debug({title: 'getCustPricingGrpAddress', details: 'resaddressid: ' + resaddressid});

                if (resaddressid == addid) {
                    cpg = result.getValue({name: 'custrecord_sna_cpg_parts', join: 'Address'});
                    return false;
                }

                return true;
            });

            log.debug({title: 'getCustPricingGrpAddress', details: 'cpg: ' + cpg});
            return cpg;
        }

        /**
         * get customer pricing group from address subrecord
         * @param rec
         */
        function getPricingGrpAddress(rec) {
            var shipaddrSubrecord = rec.getSubrecord({fieldId: 'shippingaddress'});
            var prcinggroup = shipaddrSubrecord.getValue({fieldId: 'custrecord_sna_cpg_parts'});

            log.debug({title: 'getPricingGrpAddress', details: 'prcinggroup: ' + prcinggroup});

            return prcinggroup;
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
            var finalbasis = '';
            var finalmarkup = '';

            for (var x = 0; x < arrrec.length; x++) {
                if (prcinggroup == 155) { // List
                    var min = arrrec[x].mincost;
                    var max = arrrec[x].maxcost;

                    if ((!isEmpty(max) && forceFloat(lineitmpurchaseprice) >= forceFloat(min) && forceFloat(lineitmpurchaseprice) < forceFloat(max)) ||
                        (isEmpty(max) && forceFloat(lineitmpurchaseprice) >= forceFloat(min))) { // min cost is priority
                        finalpricelevel = arrrec[x].id;
                        finalbasis = arrrec[x].basis;
                        finalmarkup = arrrec[x].markup;
                    }
                }
                else {
                    finalpricelevel = arrrec[x].id; // assumed to be 1 if non-List
                    finalbasis = arrrec[x].basis;
                    finalmarkup = arrrec[x].markup;
                }
            }

            return {finalpricelevel: finalpricelevel, finalbasis: finalbasis, finalmarkup: finalmarkup};
        }

        /**
         * Item Price Level is populated based on Item Category-Customer Pricing Group combination.
         * If no Item Category-Customer Pricing Group combination is found, List is selected as default.
         * If Customer Pricing Group = List, and there are multiple under the Item Category,
         * Min Unit Cost and Max Unit Cost are considered and filtered and compared against Item Purchase Price.
         * @param prcinggroup
         * @returns {{}}
         */
        function getPriceLevel(prcinggroup) {
            var pricelevel = {};

            var filters_ = [];
            // do not filter pricing group
            if (isEmpty(prcinggroup)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.ANYOF, values: ['@NONE@']}));
            }
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Location combination
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_itemcategory'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_customerpricinggroup'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_mincost'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_maxcost'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_basis'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_markup'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_itempricelevel', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var curritmcat = result.getValue({name: 'custrecord_sna_hul_itemcategory'});
                var currpricinggrp = result.getValue({name: 'custrecord_sna_hul_customerpricinggroup'});
                var currid = result.getValue({name: 'internalid'});
                var currmincost = result.getValue({name: 'custrecord_sna_hul_mincost'});
                var currmaxcost = result.getValue({name: 'custrecord_sna_hul_maxcost'});
                var currbasis = result.getValue({name: 'custrecord_sna_hul_basis'});
                var currmarkup = result.getValue({name: 'custrecord_sna_hul_markup'});

                if (isEmpty(pricelevel[curritmcat+'-'+currpricinggrp])) {
                    pricelevel[curritmcat+'-'+currpricinggrp] = [];
                }

                var obj = {};
                obj.mincost = currmincost;
                obj.maxcost = currmaxcost;
                obj.basis = currbasis;
                obj.markup = currmarkup;
                obj.id = currid;
                pricelevel[curritmcat+'-'+currpricinggrp].push(obj);

                return true;
            });

            return pricelevel;
        }

        /**
         * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
         * @param itm
         * @returns {{}}
         */
        function getVendorPrice(itm) {
            var prices = {};

            var filters_ = [];
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_item', operator: search.Operator.ANYOF, values: itm}));
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_primaryvendor', operator: search.Operator.IS, values: true}));
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first combination
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_listprice'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_itempurchaseprice'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_item'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var currlistprice = result.getValue({name: 'custrecord_sna_hul_listprice'});
                var currpurchprice = result.getValue({name: 'custrecord_sna_hul_itempurchaseprice'});
                var curritm = result.getValue({name: 'custrecord_sna_hul_item'});

                prices[curritm] = {};
                prices[curritm].listprice = currlistprice;
                prices[curritm].itmpurchprice = currpurchprice;

                return true;
            });

            return prices;
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
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
 * 2022/9/14      		                   fang       Initial version
 * 2022/01/03                             nretiro     GAP009
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
    function (search, runtime) {

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
            var currentScript = runtime.getCurrentScript();
            TEMPITEMCAT = currentScript.getParameter({ name: 'custscript_sna_hul_tempitemcat' });
            RENTALCHARGE = currentScript.getParameter({ name: 'custscript_sna_rental_serviceitem' });
            RENTALEQUIPMENT = currentScript.getParameter({ name: 'custscript_sna_rental_equipment' });

            log.debug({ title: 'pageInit', details: 'TEMPITEMCAT: ' + TEMPITEMCAT + ' | RENTALCHARGE: ' + RENTALCHARGE + ' | RENTALEQUIPMENT: ' + RENTALEQUIPMENT });
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
            var line = scriptContext.line;

            if (sublist == 'item') {
                if (field == 'item') {
                    //  log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setLocationMarkUp'});
                    //  setLocationMarkUp(rec, sublist, field);

                    var buyFromVendor = rec.getValue({
                        fieldId: 'custbody_sna_buy_from'
                    });

                    log.debug({ title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setVendorPrice' });
                    setVendorPrice(rec, sublist, field, buyFromVendor, line);
                }
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
        function fieldChanged(scriptContext) {
            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;
            var rec = scriptContext.currentRecord;
            var line = scriptContext.line;
            debugger;
            if (sublist == 'item')
                if (field == 'quantity' || field == 'item') {
                    var buyFromVendor = rec.getValue({
                        fieldId: 'custbody_sna_buy_from'
                    });

                    console.log ({ title: '-- sublistChanged', details: 'field: ' + field + ' | sublist: item | setVendorPrice' });

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

        function setVendorPrice(rec, sublist, field, buyFromVendor) {
          if (!isEmpty(sublist)) {
            debugger;



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

                  log.debug({ title: 'setVendorPrice', details: 'qty: ' + qty + ' vs. ' + 'currQty: ' + currQty + '| currPrice: ' + currPrice});

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

            var filters_ = [];
            filters_.push(search.createFilter({ name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm }));
            filters_.push(search.createFilter({ name: 'custrecord_sna_hul_vendor', operator: search.Operator.IS, values: buyFromVendor }));
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

        return {
            // postSourcing: postSourcing,
            pageInit: pageInit,
            fieldChanged: fieldChanged
        };

    });

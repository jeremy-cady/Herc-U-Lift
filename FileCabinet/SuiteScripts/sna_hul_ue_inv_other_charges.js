/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Service Pricing : Other Charges in Invoice
 *
 * Revision History:
 *
 * Date			            Issue/Case		    Author			    Issue Fix Summary
 * =======================================================================================================
 * 2023/04/18						            caranda           	Initial 
 * 2023/07/13                                   lkhatri             added miscFe
 * 2023/07/17                                   cparba              Added Misc Fee filtering logic
 * 2023/09/27                                   caranda             Convert from afterSubmit to beforeSubmit
 * 2025/03/31                                   cparba              Add location to line level
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search', './sna_hul_mod_sales_tax.js'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search, mod_tax) => {

        const beforeSubmit = (scriptContext) => {
            var TITLE = 'beforeSubmit';
            log.debug(TITLE, '*** START ***');

            // tax automation
            let currentScript = runtime.getCurrentScript();
            let willcall = currentScript.getParameter({ name: 'custscript_sna_ofm_willcall' });
            let ship = currentScript.getParameter({ name: 'custscript_sna_ofm_ship' });
            let avataxpos = currentScript.getParameter({ name: 'custscript_sna_tax_avataxpos' });
            let avatax = currentScript.getParameter({ name: 'custscript_sna_tax_avatax' });

            var invRecObj = scriptContext.newRecord;

            if(invRecObj.type != 'invoice'){
                return;
            }

            var miscFeeAllowed = invRecObj.getValue({
                fieldId: 'custbody_sna_misc_fee_allowed'
            });
            log.debug("miscFeeAllowed", miscFeeAllowed);

            if (!miscFeeAllowed)
                return;

            var miscFeeGenerated = invRecObj.getValue({
                fieldId: 'custbody_sna_misc_fee_generated'
            });
            log.debug("miscFeeGenerated", miscFeeGenerated);

            if (miscFeeGenerated)
                return;

            var headerLocation = invRecObj.getValue({
                fieldId: 'location'
            });

            // aduldulao 9/9/25 - add tax code
            let internal = mod_tax.updateLines(invRecObj, true);
            let finaltaxcode = '';
            let ordermethod = invRecObj.getValue({ fieldId: 'custbody_sna_order_fulfillment_method' });

            if (ordermethod == willcall) {
                finaltaxcode = avataxpos;
            }
            else if (ordermethod == ship) {
                finaltaxcode = avatax;
            }

            var lineCnt = invRecObj.getLineCount({ sublistId: 'item' });
            var updateTaxProcessed = false;

            for(var h = 0; h < lineCnt; h++){
                var taxCode = Number(invRecObj.getSublistValue({sublistId: 'item', fieldId: 'taxcode', line: h}));
                log.debug("taxCode", taxCode);

                if(updateTaxProcessed){
                    break;
                }

                if(taxCode === 101507) { // Avatax-POS - SB
                    updateTaxProcessed = true;
                }
            }

            log.debug("updateTaxProcessed", updateTaxProcessed);

            if(updateTaxProcessed){
                invRecObj.setValue({ fieldId: 'custbody_sna_tax_processed', value: false });
            }

            var mainArr = [];

            for(var i = 0; i < lineCnt; i++){
                var subObj = {};

                var lineRevStreams = invRecObj.getSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st', line: i});// Revenue Streams
                var lineServiceType = invRecObj.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', line: i});// Service Code Type

                var lineAmt = invRecObj.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i}); // Amount

                log.audit(TITLE, 'lineServiceType = ' + lineServiceType);
                log.audit(TITLE, 'lineRevStreams = ' + lineRevStreams);
                log.audit(TITLE, 'lineAmt = ' + lineAmt);

                if(!isEmpty(lineRevStreams) && !isEmpty(lineServiceType)){
                    if(isEmpty(mainArr)){
                        subObj.revStream = lineRevStreams;
                        subObj.serviceType = lineServiceType;
                        subObj.amt = lineAmt;

                        mainArr.push(subObj);
                    }else{

                        var objIndex = _findIndexByKeyValue(mainArr, 'revStream', lineRevStreams, 'serviceType', lineServiceType);

                        log.debug(TITLE, 'objIndex = ' + objIndex);

                        if(objIndex < 0){
                            subObj.revStream = lineRevStreams;
                            subObj.serviceType = lineServiceType;
                            subObj.amt = lineAmt;

                            mainArr.push(subObj);
                        }else{
                            //Update Amount
                            log.debug(TITLE, 'mainArr = ' + JSON.stringify(mainArr));
                            mainArr[objIndex].amt += lineAmt
                        }

                    }
                }
            }

            log.debug(TITLE, 'mainArr = ' + JSON.stringify(mainArr));

            if(!isEmpty(mainArr)){
                for(var x = 0; x < mainArr.length; x++){
                    var lineRevStreams = mainArr[x].revStream;
                    var lineServiceType = mainArr[x].serviceType;
                    var lineAmt = mainArr[x].amt;

                    var serviceCodeObj = _getServiceCodeRevStream(lineRevStreams, lineServiceType);

                    if (!isEmpty(serviceCodeObj)) {
                        var compVal = (parseFloat(serviceCodeObj.shopFee) / 100) * parseFloat(lineAmt);
                        log.audit(TITLE, 'compVal = ' + compVal);

                        var finalAmt = _getFinalAmt(compVal, serviceCodeObj.minShopFee, serviceCodeObj.maxShopFee);
                        log.audit(TITLE, 'finalAmt = ' + finalAmt);


                        if (!isEmpty(finalAmt) && !isEmpty(serviceCodeObj.otherChargeItem)) {
                            //Add Other Charge Item
                            lineCnt--;

                            log.audit(TITLE, 'lineCnt = ' + lineCnt);

                            invRecObj.insertLine({sublistId: 'item', line: lineCnt});
                            invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'item', value: serviceCodeObj.otherChargeItem, line: lineCnt });
                            invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', value: lineServiceType, line: lineCnt });
                            invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'cseg_sna_revenue_st', value: lineRevStreams, line: lineCnt });
                            invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 1, line: lineCnt });
                            invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'amount', value: finalAmt, line: lineCnt });

                            if(!isEmpty(headerLocation)){
                                invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'location', value: headerLocation, line: lineCnt });
                            }
                            if (!isEmpty(finaltaxcode) && !internal) {
                                invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: finaltaxcode, line: lineCnt });
                            }
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

            var TITLE = 'afterSubmit';
            log.debug(TITLE, '*** START ***');

            var invRec = scriptContext.newRecord;

            // var miscFeeAllowed = invRec.getValue({
            //     name: 'custbody_sna_misc_fee_allowed'
            // });
            // log.debug("miscFeeAllowed", miscFeeAllowed);

            // if (!miscFeeAllowed)
            //     return;

            if(scriptContext.type !== 'salesorder'){
                return;
            }

            var scriptObj = runtime.getCurrentScript();
            var invSrchId = scriptObj.getParameter({ name: 'custscript_sna_hul_othercharge_srch' });

            log.audit(TITLE, 'Invoice ID = ' + invRec.id);

            var invRecObj = record.load({
                type: invRec.type,
                id: invRec.id,
                isDynamic: true
            });

            var miscFeeAllowed = invRecObj.getValue({
                fieldId: 'custbody_sna_misc_fee_allowed'
            });
            log.debug("miscFeeAllowed", miscFeeAllowed);

            if (!miscFeeAllowed)
                return;

            var miscFeeGenerated = invRecObj.getValue({
                fieldId: 'custbody_sna_misc_fee_generated'
            });
            log.debug("miscFeeGenerated", miscFeeGenerated);

            if (miscFeeGenerated)
                return;

            var lineCnt = invRecObj.getLineCount({ sublistId: 'item' });

            if (!isEmpty(invSrchId)) {
                var srch = search.load({
                    id: invSrchId
                });

                var filters = srch.filters;
                var invIdFilter = search.createFilter({
                    name: 'internalid',
                    operator: 'anyof',
                    values: [invRec.id]
                });
                filters.push(invIdFilter);

                srch.run().each(function (result) {
                    var lineServiceType = result.getValue({ name: 'custcol_sna_so_service_code_type', summary: search.Summary.GROUP });
                    var lineRevStreams = result.getValue({ name: 'line.cseg_sna_revenue_st', summary: search.Summary.GROUP });
                    var lineAmt = result.getValue({ name: 'amount', summary: search.Summary.SUM });

                    log.audit(TITLE, 'lineServiceType = ' + lineServiceType);
                    log.audit(TITLE, 'lineRevStreams = ' + lineRevStreams);
                    log.audit(TITLE, 'lineAmt = ' + lineAmt);

                    var serviceCodeObj = _getServiceCodeRevStream(lineRevStreams, lineServiceType);

                    if (!isEmpty(serviceCodeObj)) {
                        var compVal = (parseFloat(serviceCodeObj.shopFee) / 100) * parseFloat(lineAmt);
                        log.audit(TITLE, 'compVal = ' + compVal);

                        var finalAmt = _getFinalAmt(compVal, serviceCodeObj.minShopFee, serviceCodeObj.maxShopFee);
                        log.audit(TITLE, 'finalAmt = ' + finalAmt);


                        if (!isEmpty(finalAmt) && !isEmpty(serviceCodeObj.otherChargeItem)) {
                            //Add Other Charge Item
                            invRecObj.selectNewLine({ sublistId: 'item' });
                            invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: serviceCodeObj.otherChargeItem });
                            invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', value: lineServiceType });
                            invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'cseg_sna_revenue_st', value: lineRevStreams });
                            invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 1 });
                            invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: finalAmt });
                            invRecObj.commitLine({ sublistId: 'item' });

                            lineCnt++;
                        }
                    }

                    return true;
                });


                invRecObj.save();

            }

        }

        function _getServiceCodeRevStream(revStreams, serviceType) {
            var TITLE = '_getServiceCodeRevStream(' + revStreams + ', ' + serviceType + ')';

            var srch = search.create({
                type: 'customrecord_sna_service_code_type',
                filters: [
                    {
                        name: 'custrecord_sna_serv_code',
                        operator: 'anyof',
                        values: [revStreams]
                    },
                    {
                        name: 'custrecord_sna_ser_code_type',
                        operator: 'anyof',
                        values: [serviceType]
                    }
                ],
                columns: ['custrecord_sna_shop_fee_code_item', 'custrecord_sna_shop_fee_percent', 'custrecord_sna_min_shop_fee', 'custrecord_sna_max_shop_fee']
            });

            var serviceCodeRevStreamObj = {};
            srch.run().each(function (result) {
                serviceCodeRevStreamObj.id = result.id;
                serviceCodeRevStreamObj.otherChargeItem = result.getValue({ name: 'custrecord_sna_shop_fee_code_item' });
                serviceCodeRevStreamObj.shopFee = result.getValue({ name: 'custrecord_sna_shop_fee_percent' });
                serviceCodeRevStreamObj.minShopFee = result.getValue({ name: 'custrecord_sna_min_shop_fee' });
                serviceCodeRevStreamObj.maxShopFee = result.getValue({ name: 'custrecord_sna_max_shop_fee' });
            });

            log.audit(TITLE, 'serviceCodeRevStreamObj = ' + JSON.stringify(serviceCodeRevStreamObj));

            return serviceCodeRevStreamObj;
        }

        function _getFinalAmt(num, min, max) {
            var TITLE = '_getFinalAmt(' + num + ', ' + min + ', ' + max + ')';
            var finalAmt;
            var isBetween = (num >= min && num <= max);

            if (isBetween) {
                //num is within min and max
                finalAmt = num;
            } else {

                if (num < min) {
                    //num is below min
                    finalAmt = min;
                } else if (num > max) {
                    //num is above max
                    finalAmt = max;
                }
            }

            log.debug(TITLE, 'finalAmt = ' + finalAmt);
            return finalAmt;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        function _findIndexByKeyValue(array, key1, value1, key2, value2) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][key1] === value1 && array[i][key2] === value2) {
                    return i;
                }
            }
            return -1; // Return -1 if the key-value pair is not found
        }

        return { beforeSubmit }

    });

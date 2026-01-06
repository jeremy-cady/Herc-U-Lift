/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Service Pricing : Other Charges in Invoice in Client Script
 *
 * Revision History:
 *
 * Date			            Issue/Case		    Author			    Issue Fix Summary
 * =======================================================================================================
 * 2023/12/14						            caranda           	Initial Version
 * 2025/03/31                                   cparba              Add location to line level
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param{search} search
 */
(search) => {


    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    const saveRecord = (scriptContext) => {
        const stLoggerTitle = 'saveRecord';
        let invRecObj = scriptContext.currentRecord;

        let miscFeeAllowed = invRecObj.getValue({
            fieldId: 'custbody_sna_misc_fee_allowed'
        });
        log.debug(stLoggerTitle, "miscFeeAllowed = " + miscFeeAllowed);

        if (!miscFeeAllowed){
            return true;
        }


        let miscFeeGenerated = invRecObj.getValue({
            fieldId: 'custbody_sna_misc_fee_generated'
        });
        log.debug(stLoggerTitle, "miscFeeGenerated = " + miscFeeGenerated);

        if (miscFeeGenerated){
            return true;
        }

        var headerLocation = invRecObj.getValue({
            fieldId: 'location'
        });

        let lineCnt = invRecObj.getLineCount({ sublistId: 'item' });
        log.debug(stLoggerTitle, 'lineCnt = ' + lineCnt);

        let mainArr = [];

        for(var i = 0; i < lineCnt; i++){
            var subObj = {};

            var lineRevStreams = invRecObj.getSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st', line: i});// Revenue Streams
            var lineServiceType = invRecObj.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', line: i});// Service Code Type

            var lineAmt = invRecObj.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i}); // Amount

            log.audit(stLoggerTitle, 'lineServiceType = ' + lineServiceType);
            log.audit(stLoggerTitle, 'lineRevStreams = ' + lineRevStreams);
            log.audit(stLoggerTitle, 'lineAmt = ' + lineAmt);

            if(!isEmpty(lineRevStreams) && !isEmpty(lineServiceType)){
                if(isEmpty(mainArr)){
                    subObj.revStream = lineRevStreams;
                    subObj.serviceType = lineServiceType;
                    subObj.amt = lineAmt;

                    mainArr.push(subObj);
                }else{

                    var objIndex = _findIndexByKeyValue(mainArr, 'revStream', lineRevStreams, 'serviceType', lineServiceType);

                    log.debug(stLoggerTitle, 'objIndex = ' + objIndex);

                    if(objIndex < 0){
                        subObj.revStream = lineRevStreams;
                        subObj.serviceType = lineServiceType;
                        subObj.amt = lineAmt;

                        mainArr.push(subObj);
                    }else{
                        //Update Amount
                        log.debug(stLoggerTitle, 'mainArr = ' + JSON.stringify(mainArr));
                        mainArr[objIndex].amt += lineAmt
                    }

                }
            }
        }

        log.debug(stLoggerTitle, 'mainArr = ' + JSON.stringify(mainArr));

        if(!isEmpty(mainArr)){
            for(var x = 0; x < mainArr.length; x++){
                var lineRevStreams = mainArr[x].revStream;
                var lineServiceType = mainArr[x].serviceType;
                var lineAmt = mainArr[x].amt;

                var serviceCodeObj = _getServiceCodeRevStream(lineRevStreams, lineServiceType);

                if (!isEmpty(serviceCodeObj)) {
                    var compVal = (parseFloat(serviceCodeObj.shopFee) / 100) * parseFloat(lineAmt);
                    log.audit(stLoggerTitle, 'compVal = ' + compVal);

                    var finalAmt = _getFinalAmt(compVal, serviceCodeObj.minShopFee, serviceCodeObj.maxShopFee);
                    log.audit(stLoggerTitle, 'finalAmt = ' + finalAmt);


                    if (!isEmpty(finalAmt) && !isEmpty(serviceCodeObj.otherChargeItem)) {
                        //Add Other Charge Item
                        //lineCnt--;

                        log.audit(stLoggerTitle, 'lineCnt = ' + lineCnt);

                        /*invRecObj.insertLine({sublistId: 'item', line: lineCnt});
                        invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'item', value: serviceCodeObj.otherChargeItem, line: lineCnt });
                        invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', value: lineServiceType, line: lineCnt });
                        invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'cseg_sna_revenue_st', value: lineRevStreams, line: lineCnt });
                        invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 1, line: lineCnt });
                        invRecObj.setSublistValue({ sublistId: 'item', fieldId: 'amount', value: finalAmt, line: lineCnt });*/

                        invRecObj.selectNewLine({sublistId: 'item'});
                        invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: serviceCodeObj.otherChargeItem, forceSyncSourcing: true });
                        invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', value: lineServiceType, forceSyncSourcing: true });
                        invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'cseg_sna_revenue_st', value: lineRevStreams, forceSyncSourcing: true });
                        invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 1, forceSyncSourcing: true });
                        invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: finalAmt, forceSyncSourcing: true  });

                        if(!isEmpty(headerLocation)){
                            invRecObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: headerLocation, forceSyncSourcing: true });
                        }

                        invRecObj.commitLine({sublistId: 'item'});

                    }
                }
            }
        }

        //alert('done trigger save!');
        return true;

    }

    const _getServiceCodeRevStream = (revStreams, serviceType) => {
        let TITLE = '_getServiceCodeRevStream(' + revStreams + ', ' + serviceType + ')';

        let srch = search.create({
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

        let serviceCodeRevStreamObj = {};
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

    const _getFinalAmt = (num, min, max) => {
        let TITLE = '_getFinalAmt(' + num + ', ' + min + ', ' + max + ')';
        let finalAmt;
        let isBetween = (num >= min && num <= max);

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

    const isEmpty = (stValue) => {
        return ((stValue === '' || stValue == null || stValue == undefined) ||
            (stValue.constructor === Array && stValue.length == 0) ||
            (stValue.constructor === Object && (function (v) {
                for (var k in v) return false;
                return true;
            })(stValue)));
    }

    const _findIndexByKeyValue = (array, key1, value1, key2, value2) => {
        for (let i = 0; i < array.length; i++) {
            if (array[i][key1] === value1 && array[i][key2] === value2) {
                return i;
            }
        }
        return -1; // Return -1 if the key-value pair is not found
    }

    return { saveRecord };
    
});

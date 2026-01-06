/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script to transform PO to IR for temporary items
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/6/30       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Item Category checking as temp item
 * 2022/11/15                            aduldulao       Create item fulfillment
 * 2023/02/23                            aduldulao       Defective Location will be dependent on the Parent Location
 * 2023/5/4                              aduldulao       New item categories
 * 2023/6/13                             aduldulao       Auto creation for temp items only
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/runtime'],
    /**
 * @param{record} record
 */
    (record, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var currentScript = runtime.getCurrentScript();
            var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});

            var poid = JSON.parse(scriptContext.request.body).poid;
            log.debug({title: 'onRequest', details: 'poid: ' + poid});

            // transform PO to IR
            try {
                var recir = record.transform({fromType: record.Type.PURCHASE_ORDER, fromId: poid, toType: record.Type.ITEM_RECEIPT, isDynamic: true});

                var itemcount = recir.getLineCount({sublistId: 'item'});

                for (var i = 0; i < itemcount; i++) {
                    var isauto = false;

                    var tempcode = recir.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                    var lineqty = recir.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                    var itm = recir.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                    var itmcatcust = recir.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                    var nxtask = recir.getSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', line: i});
                    var vendorname = recir.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name', line: i});

                    log.debug({title: 'onRequest', details: 'line: ' + i + ' | tempcode: ' + tempcode + ' | lineqty: ' + lineqty + ' | itm: ' + itm + ' | itmcatcust: ' + itmcatcust+ ' | nxtask: ' + nxtask + ' | vendorname: ' + vendorname});

                    recir.selectLine({sublistId: 'item', line: i});

                    if (!isEmpty(tempcode) && (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat)) {
                        if (!isEmpty(nxtask)) {
                            isauto = true;
                        }

                        var subrecord = recir.getCurrentSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail'});

                        // Remove all lines
                        var lotcount = subrecord.getLineCount({sublistId: 'inventoryassignment'})
                        for (var j = parseInt(lotcount)-1; j >= 0; j--) {
                            subrecord.removeLine({sublistId: 'inventoryassignment', line: j});
                        }

                        subrecord.selectNewLine({sublistId: 'inventoryassignment'});
                        subrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: tempcode});
                        subrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: lineqty});
                        subrecord.commitLine({sublistId: 'inventoryassignment'});
                    }

                    recir.setCurrentSublistValue({sublistId: 'item', fieldId: 'itemreceive', value: isauto});
                    recir.commitLine({sublistId: 'item'});
                }

                var irid = recir.save({ignoreMandatoryFields: true});
                log.debug({title: 'onRequest', details: 'IR created: ' + irid});

                if (!isEmpty(irid)) {
                    var recbill = record.transform({fromType: record.Type.PURCHASE_ORDER, fromId: poid, toType: record.Type.VENDOR_BILL, isDynamic: true});
                    var recbillcnt = recbill.getLineCount({sublistId: 'item'});

                    for (var b = recbillcnt - 1; b >= 0; b--) {
                        var itmcatcust = recbill.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: b});
                        var nxtask = recbill.getSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', line: b});

                        if (isEmpty(nxtask) || (tempitemcat != itmcatcust && itmcatcust != allieditemcat && itmcatcust != rackingitemcat && itmcatcust != storageitemcat)) {
                            recbill.removeLine({sublistId: 'item', line: b});
                        }
                    }

                    var recbillid = recbill.save({ignoreMandatoryFields: true});
                    log.debug({title: 'onRequest', details: 'VB created: ' + recbillid});
                }
            }
            catch (e) {}
        }

        return {onRequest}

    });

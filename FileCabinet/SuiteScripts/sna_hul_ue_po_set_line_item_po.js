/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author fang
*
* Script brief description:
* This user event script holds user event functions deployed on the Purchase Order record. Includes the following:
* - Set PO Internal ID on line items
*
* Revision History:
* Date              Issue/Case         Author         Issue Fix Summary
* =============================================================================================
* 2023/05/18         ######            fang           Initial version
*/

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define([
        'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget'

    ],
    function (
        record, runtime, search, serverWidget
    ) {

        /**
         * @param {string} stValue
         * @returns {boolean} - Returns true if the input value is considered to be 'empty'' (null, undefined, etc.)
         */
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function afterSubmit(scriptContext) {
            var stLoggerTitle = 'afterSubmit';
            log.debug({title: stLoggerTitle, details: '|---> ' + 'Starting ' + stLoggerTitle + ' <---|'});


            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            try {
                var rec = scriptContext.newRecord;
                var recId = rec.id;


                log.debug({
                    title: stLoggerTitle,
                    details: 'rec: ' + JSON.stringify(rec)
                });

                log.debug({
                    title: stLoggerTitle,
                    details: 'recId: ' + recId
                });


                var currRec = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: recId
                })

                var lineItemCount = currRec.getLineCount({
                    sublistId: 'item'
                });

                log.debug({
                    title: stLoggerTitle,
                    details: 'scriptContext.type: ' + scriptContext.type + ' | recId: ' + recId + ' | lineItemCount: ' + lineItemCount
                });

                for (var i=0; i < lineItemCount; i++) {
                    currRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_item_po_number',
                        line: i,
                        value: recId
                    });
                }

                var updatedRecId = currRec.save({
                    ignoreMandatoryFields: true
                });

                log.debug({
                    title: stLoggerTitle,
                    details: 'Updated item lines for PO#: ' + updatedRecId
                });

            } catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR', e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error', e.toString());
                }
            }
        }

        return {
            afterSubmit: afterSubmit
        };
    });
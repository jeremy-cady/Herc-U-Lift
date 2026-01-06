/*
* Copyright (c) 2024, ScaleNorth LLC and/or its affiliates. All rights reserved.
*
* @author elausin
*
* Script brief description:
* Update related WIP JE when IF is edited or deleted
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2025/03/26                             elausin        Initial version
*/
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],

    (record) => {

        const beforeSubmit = (scriptContext) => {
            var contextType = scriptContext.type;
            log.debug('DEBUG', 'beforeSubmit triggered');
            log.debug('DEBUG', 'contextType: ' + contextType);

            if (contextType === 'delete') {
                var objRecord = scriptContext.oldRecord;
                var ifNumber = objRecord.getValue('transactionnumber');
                var relatedJE = objRecord.getValue('custbody_sna_hul_je_wip');

                log.debug('DEBUG', 'Deleted IF: ' + ifNumber);
                log.debug('DEBUG', 'Related JE: ' + relatedJE);
                
                // delete JE
                if (!isEmpty(relatedJE)) {
                    throw "This has a related WIP Reclassification Reversal Journal. Please delete the journal first.";
                }

            } else if (contextType === 'edit') {
                var objRecord = scriptContext.newRecord;
                // Get Removed Lines
                var removedLinesFromIF = '';
                var remArr = [];
                var retArr = [];

                var relatedJEs = objRecord.getValue('custbody_sna_hul_je_wip');
                log.debug('DEBUG', 'Related JE: ' + relatedJEs);

                for (var i = 0; i < objRecord.getLineCount('item'); i++) {
                    var itemReceive = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'itemreceive', line: i });
                    log.debug('DEBUG', 'itemReceive: ' + itemReceive);
                    var itemId = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });

                    if (!itemReceive) {
                        remArr.push(itemId);
                    } else {
                        retArr.push(itemId);
                    }
                }

                log.debug('DEBUG', 'remArr: ' + remArr);
                log.debug('DEBUG', 'retArr: ' + retArr);
                remArr = removeDuplicates(remArr, retArr);

                log.debug('DEBUG', 'remArr: ' + remArr);

                for (var j = 0; j < remArr.length; j++) {
                    if (isEmpty(removedLinesFromIF)) {
                        removedLinesFromIF = remArr[j];
                    } else {
                        removedLinesFromIF = removedLinesFromIF + ',' + remArr[j];
                    }
                }

                log.debug('DEBUG', 'removedLinesFromIF: ' + removedLinesFromIF);

                objRecord.setValue({
                    fieldId: 'custbody_sn_removed_lines',
                    value: removedLinesFromIF
                });
            }
        }

        function removeDuplicates(arrItems, arrSelectedItems) {
            for(var i = arrItems.length - 1; i >= 0; i--) {
                for(var j = 0; j < arrSelectedItems.length; j++) {
                    if(JSON.stringify(arrItems[i])  == JSON.stringify(arrSelectedItems[j])) {
                        arrItems.splice(i, 1);
                    }
                }
            }
            return arrItems;

        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {beforeSubmit}

    });

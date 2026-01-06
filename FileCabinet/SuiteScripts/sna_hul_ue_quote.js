/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author vpitale
*
* Script brief description:
* UE script deployed on Estimate/Quote Record used for:
* - Updating the Document Number of the Quote using the Document Number Custom Record.
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2023/05/31           10177            vpitale         Updated the script to resolve the duplicate and empty doc numbers.
* 2023/03/09           10177            vpitale         Initial Version - Document Numbering
*
*/

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search','N/redirect', 'N/runtime'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search, redirect, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        // Function to generate zeroes preceding the fieldValue entered.
        function generateZero(fieldValue, requiredlength) {
log.audit('generateZero function', 'fieldValue: ' + fieldValue + ', requiredlength: ' + requiredlength);
            var lengthOfField = fieldValue.length;
            var diffBetweenLengths = requiredlength - lengthOfField;
            if (diffBetweenLengths > 0) {
                for (var i = 0; i < diffBetweenLengths; i++) {
                    fieldValue = '0' + fieldValue;
                }
            }
            return fieldValue;
        }

        // Function to get the Document Nummber for Estimate.
        function getDocNum(customform) {
            // Searching the Document Numbering List to get the Prefix, Min. Digits and Current Number.
            var customSearch = search.create({ type: 'customrecord_sna_hul_document_numbering',
                filters: [ ['custrecord_sna_hul_transaction_form','anyof', customform] ],
                columns: [ 'custrecord_sna_hul_doc_num_prefix', 'custrecord_sna_hul_doc_num_min', 'custrecord_sna_hul_doc_current_number' ]
            }).run().getRange(0, 1);
log.audit('customSearch', customSearch);

            // Executing the code only when the search is not empty.
            if(!isEmpty(customSearch)) {
                var custRecID = customSearch[0].id;
                var numPrefix = customSearch[0].getValue({ name: 'custrecord_sna_hul_doc_num_prefix' });
                var minDigits = Number(customSearch[0].getValue({ name: 'custrecord_sna_hul_doc_num_min' }));
                var curDocNum = customSearch[0].getValue({ name: 'custrecord_sna_hul_doc_current_number' });
log.audit('Search Details', 'custRecID: ' + custRecID + ', numPrefix: ' + numPrefix + ', minDigits: ' + minDigits + ', curDocNum: ' + curDocNum);

                // Executing the code only when the values in the Document Number List is not empty.
                if(!isEmpty(numPrefix) && !isEmpty(minDigits) && !isEmpty(curDocNum)) {
                    curDocNum = Number(curDocNum) + 1;
                    curDocNum = '' + curDocNum;
                    var updateDocNum = Number(curDocNum);
                    if(curDocNum.length < minDigits) {
                        var docNumFinal = generateZero(curDocNum, minDigits);
log.audit('Details', 'curDocNum: ' + curDocNum + ', docNumFinal: ' + docNumFinal);
                        curDocNum = docNumFinal;
                    }

                    var docNum = numPrefix + curDocNum;
log.audit('Details', 'docNum: '+ docNum + ', updateDocNum: ' + updateDocNum);

                    // Searching if the Document Number already exists in the system.
                    var estDocSearch = search.create({ type: 'estimate',
                        filters: [ ['mainline','is','T'], 'AND', ['numbertext','is',docNum] ],
                        columns: [ 'tranid' ] }).run().getRange(0, 1);
log.audit('estDocSearch', estDocSearch);

                    // Checking if the IF Document Number already exists in the system.
                    if(!isEmpty(estDocSearch)) {
                        return {};
                    } else {
                        return { 'docNum': docNum, 'updateDocNum': updateDocNum, 'custRecID': custRecID };
                    }

                } else {
                    log.error('Error', 'Values numPrefix: ' + numPrefix + ', minDigits: ' + minDigits + ', curDocNum: ' + curDocNum);
                    return {};
                }
            } else {
                log.error('Error', 'Search for Document Numbering list with customform ' + customform + ' is empty');
                return {};
            }
        }

        function updateDocumentNumber(scriptContext) {
            var rec = scriptContext.newRecord, docNumDetails = '';
            var recId = scriptContext.newRecord.id;
log.audit('recId', recId);
            var customform = rec.getValue({ fieldId: 'customform' });
log.audit('customform', customform);

            // Executing the code only when the customform is not empty.
            if(!isEmpty(customform)) {
                var flag = false;
                // Getting the Document Number to be updated for the Estimate.
                for(var loop = 0; loop < 20; loop++) {
                    docNumDetails = getDocNum(customform);
log.audit('docNumDetails ' + loop, docNumDetails);
                    if (!isEmpty(docNumDetails)) {
                        // Updating the Document Number Custom record.
                        var updateDocNumList = record.submitFields({type: 'customrecord_sna_hul_document_numbering',
                            id: docNumDetails.custRecID, values: {'custrecord_sna_hul_doc_current_number': docNumDetails.updateDocNum}
                        });
log.audit('updateDocNumList', updateDocNumList);

                        var estDocSearch = search.create({ type: 'estimate',
                            filters: [['mainline', 'is', 'T'], 'AND', ['tranid', 'is', docNumDetails.docNum]],
                            columns: ['tranid'] });
                        var searchResultCount = estDocSearch.runPaged().count;
log.audit('Estimate searchResultCount', searchResultCount);

                        if (searchResultCount == 0) {
                            var estSubmit = record.submitFields({ type: 'estimate', id: recId, values: {'tranid': docNumDetails.docNum} });
log.audit('Details', 'estSubmit: ' + estSubmit + ', docNumDetails b4 update: ' + JSON.stringify(docNumDetails));
                            flag = true;
                            break;
                        }
                    }
                }

                // Updating the Document Number in Estimate when the Document Number extracted is not Empty.
                if (flag && runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
                    // Reloading the stale Estimate.
                    redirect.toRecord({ type: 'estimate', id: recId });
log.audit('Custom Record Updated.');
                }
            } else {
                log.error('Error', 'CustomForm is empty.');
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
                var recId = scriptContext.newRecord.id;
log.audit('Script AfterSubmit Details', 'scriptContext.type: ' + scriptContext.type + ', recId: ' + recId);
                // Executing the code only when the Estimate is getting created.
                if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                    updateDocumentNumber(scriptContext);
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

        return {
            afterSubmit: afterSubmit
        }
    });
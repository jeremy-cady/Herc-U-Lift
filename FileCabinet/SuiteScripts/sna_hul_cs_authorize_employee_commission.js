/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author fang
 *
 * Script brief description:
 * This Client script attached to "SNA | SL | Authorize Employee Commission"
 *
 * Revision History:
 *
 * Date            Issue/Case        Author            Issue Fix Summary
 * =============================================================================================
 * 2023/12/13                        cparba            Added logic to display multiple commission payable record on success message
 * 2023/12/12                        cparba            Added logic to handle a multi-select field type for sales rep
 * 2023/04/17                        fang              Initial version
 *
 */
define(['N/currentRecord', 'N/ui/dialog', 'N/url', 'N/https', 'N/format', 'N/search', 'N/ui/message'],
    /**
     * @param{currentRecord} currentRecord
     * @param{dialog} dialog
     * @param{url} url
     */
    function (currentRecord, dialog, url, https, format, search, message) {
        var currRecord;

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
            var currUrl = new URL(window.location);

            if (currUrl.searchParams.has('commission_payable_id')) {
                var commissionPayableRecId = currUrl.searchParams.get("commission_payable_id");
                //var commissionPayableRecUrl = url.resolveRecord({recordType: 'customtransaction_sna_commission_payable', recordId: commissionPayableRecId});
                var commissionPayableRecIds = [];
                if(!isEmpty(commissionPayableRecId)){
                    commissionPayableRecIds = JSON.parse(commissionPayableRecId);
                }
                console.log(commissionPayableRecId);
                console.log(commissionPayableRecIds);

                var htmlMessage = `<ul style="list-style-type:disc">`;

                for(let i = 0; i < commissionPayableRecIds.length; i++) {
                    var commissionPayableRecUrl = url.resolveRecord({recordType: 'customtransaction_sna_commission_payable', recordId: commissionPayableRecIds[i]});
                    var commissionPayableNum = search.lookupFields({
                        type: 'customtransaction_sna_commission_payable',
                        id: commissionPayableRecIds[i],
                        columns: 'tranid'
                    }).tranid;

                    console.log('commissionPayableNum = ' + commissionPayableNum);
                    htmlMessage += `<li><a href="${commissionPayableRecUrl}">Commission Payable #${commissionPayableNum}</a></li></ul>`;
                }

                htmlMessage += `</ul>`;

                message.create({
                    title: "New Commission Payables Were Created",
                    message: htmlMessage,
                    type: message.Type.CONFIRMATION
                }).show();
            }
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
            // log.debug('Suitelet fieldChanged');

            currRecord = scriptContext.currentRecord;

            if (scriptContext.fieldId == 'custpage_trans_date' || scriptContext.fieldId == 'custpage_subsidiary' || scriptContext.fieldId == 'custpage_sales_rep' || scriptContext.fieldId == 'custpage_comms_type') {
                var currPostingDate = currRecord.getText({ fieldId: 'custpage_posting_date' });
                var currPostingPeriod = currRecord.getValue({ fieldId: 'custpage_posting_period' });
                var currLiabAcct = currRecord.getValue({ fieldId: 'custpage_liability_acct' });
                var currExpAcct = currRecord.getValue({ fieldId: 'custpage_expense_acct' });

                var currTransDate = currRecord.getValue({ fieldId: 'custpage_trans_date' });
                var currSubsidiary = currRecord.getValue({ fieldId: 'custpage_subsidiary' });
                var currSalesRep = currRecord.getValue({ fieldId: 'custpage_sales_rep' });

                if (currSalesRep.length > 0) {
                    if (!isEmpty(currSalesRep[0])) {
                        currSalesRep = JSON.stringify(currSalesRep);
                    } else {
                        currSalesRep = '';
                    }
                } else {
                    currSalesRep = '';
                }

                // var currEmployee = currRecord.getValue({ fieldId: 'custpage_employee' });
                var currCommsType = currRecord.getValue({ fieldId: 'custpage_comms_type'})

                if(!isEmpty(currTransDate)){
                    currTransDate = format.format({ value: format.parse({ value: currTransDate, type: format.Type.DATE }), type: format.Type.DATE });
                }

                if (currCommsType == '1') { //Employee Commissions
                    currRecord.getField({
                        fieldId: 'custpage_trans_date'
                    }).isDisplay = true;

                    currRecord.getField({
                        fieldId: 'custpage_subsidiary'
                    }).isDisplay = true;

                    currRecord.getField({
                        fieldId: 'custpage_sales_rep'
                    }).isDisplay = true;

                    // currRecord.getField({
                    //     fieldId: 'custpage_employee'
                    // }).isDisplay = false;

                    if (!isEmpty(currSubsidiary)) {
                        window.onbeforeunload = null;
                        document.location = url.resolveScript({
                            scriptId: getParameterFromURL('script'),
                            deploymentId: getParameterFromURL('deploy'),
                            params: {
                                'display_search_results': true,
                                'posting_date': currPostingDate,
                                'posting_period': currPostingPeriod,
                                'liability_acct': currLiabAcct,
                                'expense_acct': currExpAcct,
                                'trans_date': currTransDate,
                                'subsidiary': currSubsidiary,
                                'sales_rep': currSalesRep,
                                'comms_type': currCommsType
                            }
                        });
                    }
                } else { //Employee Spiff
                    currRecord.getField({
                        fieldId: 'custpage_trans_date'
                    }).isDisplay = false;

                    currRecord.getField({
                        fieldId: 'custpage_sales_rep'
                    }).isDisplay = true;

                    // currRecord.getField({
                    //     fieldId: 'custpage_employee'
                    // }).isDisplay = true;

                    // currRecord.getField({
                    //     fieldId: 'custpage_subsidiary'
                    // }).isDisplay = false;

                    //if (!isEmpty(currSalesRep)) {
                        window.onbeforeunload = null;
                        document.location = url.resolveScript({
                            scriptId: getParameterFromURL('script'),
                            deploymentId: getParameterFromURL('deploy'),
                            params: {
                                'display_search_results': true,
                                'posting_date': currPostingDate,
                                'posting_period': currPostingPeriod,
                                'liability_acct': currLiabAcct,
                                'expense_acct': currExpAcct,
                                'trans_date': currTransDate,
                                'subsidiary': currSubsidiary,
                                'sales_rep': currSalesRep,
                                'comms_type': currCommsType
                            }
                        });
                    //}
                }
            }
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            return true;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        function getParameterFromURL(param) {
            var query = window.location.search.substring(1);

            log.debug('query', query);

            var vars = query.split("&");

            log.debug('vars', vars);
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");

                log.debug('pair', pair);

                if (pair[0] == param) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return (false);
        }

        function markAllFxn() {
            currRecord = currentRecord.get();

            var sublistLineCount = currRecord.getLineCount({
                sublistId: 'sublist_search_results'
            });

            console.log('sublistLineCount: ' + sublistLineCount);

            for (var i = 0; i <= sublistLineCount; i++) {
                currRecord.selectLine({
                    sublistId: 'sublist_search_results',
                    line: i
                });

                currRecord.setCurrentSublistValue({
                    sublistId: 'sublist_search_results',
                    fieldId: 'sublist_auth_checkbox',
                    value: true
                });

                currRecord.commitLine({
                    sublistId: 'sublist_search_results'
                });
            }
        }

        function unmarkAllFxn() {
            currRecord = currentRecord.get();

            var sublistLineCount = currRecord.getLineCount({
                sublistId: 'sublist_search_results'
            });

            console.log('sublistLineCount: ' + sublistLineCount);

            for (var i = 0; i <= sublistLineCount; i++) {
                currRecord.selectLine({
                    sublistId: 'sublist_search_results',
                    line: i
                });

                currRecord.setCurrentSublistValue({
                    sublistId: 'sublist_search_results',
                    fieldId: 'sublist_auth_checkbox',
                    value: false
                });

                currRecord.commitLine({
                    sublistId: 'sublist_search_results'
                });
            }
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            markAllFxn: markAllFxn,
            unmarkAllFxn: unmarkAllFxn
        };

    });

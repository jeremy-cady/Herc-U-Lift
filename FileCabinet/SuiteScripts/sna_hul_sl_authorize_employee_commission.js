/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author fang
*
* Script brief description:
* Suitelet to show Authorize Employee Commissions Page (both Employee Commissions and Employee Spiff) and process Commission Payable record based on Suitelet parameters
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/12/13                                    cparba              Added logic for bulk processing of commission payable
* 2023/12/12                                    cparba              Changed sales rep field type on the filters into a multi-select
* 2023/04/13                                    fang                Initial version
*
*
*/

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/task', 'N/redirect'],
    /**
     * @param{file} file
     * @param{format} format
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, format, record, runtime, search, serverWidget, url, task, redirect) => {

        var CURRENT_USER = '';
        var CURRENT_USER_ID = '';
        var PAGE_SIZE = 20;

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var stLoggerTitle = 'onRequest';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            //CURRENT_USER = runtime.getCurrentUser();
            //CURRENT_USER_ID = CURRENT_USER.id;

            var objRequest = scriptContext.request;
            var objResponse = scriptContext.response;

            try {
                var stReqMethod = objRequest.method;
                log.debug(stLoggerTitle, 'stReqMethod = ' + stReqMethod);

                log.debug(stLoggerTitle, 'objRequest.parameters = ' + JSON.stringify(objRequest.parameters));

                if (stReqMethod == 'GET') {
                    var form = serverWidget.createForm({
                        title: 'Authorize Employee Commission',
                        hideNavbar: false
                    });
                    form = createForm(form, objRequest);
                    form.clientScriptModulePath = './sna_hul_cs_authorize_employee_commission.js';

                    objResponse.writePage(form);

                } else { //POST - Authorize
                    // log.debug(stLoggerTitle, 'objRequest.parameters.custpage_sales_rep = ' + objRequest.parameters.custpage_sales_rep);

                    var commissionPayableIdsArr = processRequest(objRequest);

                    redirect.toSuitelet({
                        scriptId: 'customscript_sna_sl_authorize_emp_comms',
                        deploymentId: 'customdeploy_sna_sl_authorize_emp_comms',
                        parameters: {
                            'posting_date': objRequest.parameters.custpage_posting_date,
                            'posting_period': objRequest.parameters.custpage_posting_period,
                            'liability_acct': objRequest.parameters.custpage_liability_acct,
                            'expense_acct': objRequest.parameters.custpage_expense_acct,
                            'trans_date': objRequest.parameters.custpage_trans_date,
                            'subsidiary': objRequest.parameters.custpage_subsidiary,
                            'sales_rep': objRequest.parameters.custpage_sales_rep,
                            'commission_payable_id': JSON.stringify(commissionPayableIdsArr)
                        }
                    });
                }
            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }


        function createForm(form, objRequest) {
            var stLoggerTitle = 'createForm';
            log.debug({ title: stLoggerTitle, details: '|---> ' + 'Starting ' + stLoggerTitle + ' <---|' });
            log.debug({ title: stLoggerTitle, details: 'objRequest.parameters: ' + JSON.stringify(objRequest.parameters) });

            //Display Search Results
            var displaySearchResults = objRequest.parameters.display_search_results;

            //PARAM FIELDS
            var stPostingDate = objRequest.parameters.posting_date;
            var stPostingPeriod = objRequest.parameters.posting_period;
            var stLiabilityAccount = objRequest.parameters.liability_acct;
            var stExpenseAccount = objRequest.parameters.expense_acct;

            //PARAM FILTERS
            var stSubsidiary = objRequest.parameters.subsidiary;
            var stTransDate = objRequest.parameters.trans_date;
            var stSalesRep = objRequest.parameters.sales_rep;
            if(!isEmpty(stSalesRep)) {
                stSalesRep = JSON.parse(objRequest.parameters.sales_rep);
            }

            var stEmployee = objRequest.parameters.employee;
            var stCommsType = objRequest.parameters.comms_type;

            log.debug({ title: stLoggerTitle, details: 'stSalesRep: ' + stSalesRep });
            log.debug({ title: stLoggerTitle, details: 'typeof stSalesRep: ' + typeof stSalesRep });

            //BUTTONS
            form.addSubmitButton({ label: 'Authorize' });
            //form.addButton({ id: 'custpage_btn_authorize', label: 'Authorize', functionName: 'authorizeFxn()' });
            form.addButton({ id: 'custpage_btn_mark_all', label: 'Mark All', functionName: 'markAllFxn()' });
            form.addButton({ id: 'custpage_btn_unmark_all', label: 'Unmark All', functionName: 'unmarkAllFxn()' });


            //FIELDS
            //Field Group
            var fieldGroup = form.addFieldGroup({
                id: 'suitelet_fields',
                label: 'Fields'
            });

            //Fields
            var fldPostingDate = form.addField({ id: 'custpage_posting_date', type: serverWidget.FieldType.DATE, label: 'Posting Date', container: 'suitelet_fields' });

            fldPostingDate.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            });

            if (!isEmpty(stPostingDate)) {
                var dt = new Date(stPostingDate);
                var dtMonth = dt.getMonth();
                var dtDay = dt.getDate();
                var dtYear = dt.getFullYear();

                stPostingDate = new Date(dtMonth + 1 + '/' + dtDay + '/' + dtYear);

                fldPostingDate.defaultValue = format.format({ value: format.parse({ value: stPostingDate, type: format.Type.DATE }), type: format.Type.DATE });
            }
            else {
                fldPostingDate.defaultValue = new Date();
                stPostingDate = new Date();
            }

            var fldPostingPeriod = form.addField({ id: 'custpage_posting_period', label: 'Posting Period', type: serverWidget.FieldType.SELECT, source: 'accountingperiod', container: 'suitelet_fields' });
            var fldLiabilityAcct = form.addField({ id: 'custpage_liability_acct', label: 'Liability Account', type: serverWidget.FieldType.SELECT, source: 'account', container: 'suitelet_fields' });

            fldLiabilityAcct.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            });

            var fldExpenseAcct = form.addField({ id: 'custpage_expense_acct', label: 'Expense Account', type: serverWidget.FieldType.SELECT, source: 'account', container: 'suitelet_fields' });

            fldPostingPeriod.defaultValue = stPostingPeriod;

            if (!isEmpty(stLiabilityAccount)) {
                fldLiabilityAcct.defaultValue = stLiabilityAccount;
            } else {
                fldLiabilityAcct.defaultValue = 1076;
                //20025 Accrued Commissions - SB: 1076
            }

            if (!isEmpty(stExpenseAccount)) {
                fldExpenseAcct.defaultValue = stExpenseAccount;
            } else {
                fldExpenseAcct.defaultValue = 693;
                //61220 Commission  - SB: 693
            }

            //TRANSACTION FILTERS
            //Field Group
            var transFiltersFieldGroup = form.addFieldGroup({
                id: 'trans_filters',
                label: 'Transaction Filters'
            });

            //Commission Type Filter
            var fldFltrCommissionsType = form.addField({ id: 'custpage_comms_type', label: 'Commissions Type', type: serverWidget.FieldType.SELECT, container: 'trans_filters' });

            fldFltrCommissionsType.addSelectOption({
                value: '1',
                text: 'Employee Commissions'
            });

            fldFltrCommissionsType.addSelectOption({
                value: '2',
                text: 'Employee Spiff'
            });

            fldFltrCommissionsType.defaultValue = stCommsType;

            //Sales Rep Filter - For Employee Commissions only
            var fldFltrSalesRep = form.addField({ id: 'custpage_sales_rep', label: 'Sales Rep', type: serverWidget.FieldType.MULTISELECT, source: 'employee', container: 'trans_filters' });
            //
            // fldFltrSalesRep.addSelectOption({
            //     value: '',
            //     text: ''
            // });
            //
            // var salesRepSearch = search.create({
            //     type: search.Type.EMPLOYEE,
            //     filters: [
            //         ['salesrep', 'is', 'T'],
            //     ],
            //     columns: [{
            //         name: 'internalid'
            //     }, {
            //         name: 'entityid'
            //     }, {
            //         name: 'issalesrep'
            //     }]
            // });
            //
            // salesRepSearch.run().each(function (searchResult) {
            //     var value = searchResult.getValue('internalid');
            //     var text = searchResult.getValue('entityid');
            //
            //     fldFltrSalesRep.addSelectOption({
            //         value: value,
            //         text: text
            //     });
            //     return true;
            // });

            fldFltrSalesRep.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            });

            fldFltrSalesRep.defaultValue = stSalesRep;

            //Employee Filter - For Employee Spiff only
            // var fldFltrEmployee = form.addField({ id: 'custpage_employee', label: 'Employee', type: serverWidget.FieldType.SELECT, source: 'employee', container: 'trans_filters' });

            // fldFltrEmployee.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

            // fldFltrEmployee.defaultValue = stEmployee;

            //Transaction Date Filter
            var fldFltrTransDate = form.addField({ id: 'custpage_trans_date', type: serverWidget.FieldType.DATE, label: 'Transaction Date', container: 'trans_filters' });

            if (!isEmpty(stTransDate)) {
                var dt = new Date(stTransDate);
                var dtMonth = dt.getMonth();
                var dtDay = dt.getDate();
                var dtYear = dt.getFullYear();

                stTransDate = new Date(dtMonth + 1 + '/' + dtDay + '/' + dtYear);

                fldFltrTransDate.defaultValue = format.format({ value: format.parse({ value: stTransDate, type: format.Type.DATE }), type: format.Type.DATE });
            }
            else {
                //fldFltrTransDate.defaultValue = new Date();
                stTransDate = new Date();
            }

            //Subsidiary Filter
            var fldFltrSubsidiary = form.addField({ id: 'custpage_subsidiary', label: 'Subsidiary', type: serverWidget.FieldType.SELECT, source: 'subsidiary', container: 'trans_filters' });

            fldFltrSubsidiary.isMandatory = true;
            fldFltrSubsidiary.defaultValue = stSubsidiary;

            if (!isEmpty(stCommsType)) {
                if (stCommsType == '2') { //Employee Spiff
                    fldFltrTransDate.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                    // fldFltrSalesRep.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                }
                // else { //Employee Commmissions
                //     fldFltrSalesRep.updateDisplayType({displayType: serverWidget.FieldDisplayType.NORMAL});
                // }
            }

            //Display Search Results in Sublist
            if (displaySearchResults) {
                form = createSearchResultsData(form, objRequest);
            }

            log.debug({ title: stLoggerTitle, details: '|---> ' + 'Exiting ' + stLoggerTitle + ' <---|' });

            return form;
        }

        function createSearchResultsData(form, objRequest) {
            var stLoggerTitle = 'createSearchResultsData';
            log.debug({ title: stLoggerTitle, details: '|---> ' + 'Starting ' + stLoggerTitle + ' <---|' });
            log.debug({ title: stLoggerTitle, details: 'objRequest.parameters: ' + JSON.stringify(objRequest.parameters) });

            var stSubsidiary = objRequest.parameters.subsidiary;
            var stTransDate = objRequest.parameters.trans_date;
            var stSalesRep = objRequest.parameters.sales_rep;
            if(!isEmpty(stSalesRep)) {
                stSalesRep = JSON.parse(objRequest.parameters.sales_rep);
            }

            // var stEmployee = objRequest.parameters.employee;
            var stCommsType = objRequest.parameters.comms_type;

            var searchId;
            var searchCols = [];

            log.debug({ title: stLoggerTitle, details: 'stSubsidiary: ' + stSubsidiary });
            log.debug({ title: stLoggerTitle, details: 'stTransDate: ' + stSubsidiary });
            log.debug({ title: stLoggerTitle, details: 'stSalesRep: ' + stSalesRep });
            // log.debug({ title: stLoggerTitle, details: 'stEmployee: ' + stEmployee });
            log.debug({ title: stLoggerTitle, details: 'stCommsType: ' + stCommsType });

            if (!isEmpty(stTransDate)) {
                stTransDate = formatDate(stTransDate);
            }

            log.debug({ title: stLoggerTitle, details: 'stTransDate: ' + stTransDate });

            var arrFilters = [];


            if (stCommsType == '1') { //Employee Commissions
                searchId = 'customsearch_sna_trans_eligilble_comms'

                //Columns:
                searchCols = [
                    'custcol_sna_sales_rep',
                    'custcol_sna_hul_sales_rep_comm_type',
                    'tranid',
                    'custcol_sna_commission_amount'
                ];

                //Additional filters
                if (!isEmpty(stTransDate)) {
                    arrFilters.push(search.createFilter({ name: 'trandate', operator: search.Operator.ON, values: stTransDate }));
                }
                if (!isEmpty(stSubsidiary)) {
                    arrFilters.push(search.createFilter({ name: 'subsidiary', operator: search.Operator.ANYOF, values: stSubsidiary }));
                }

                if (!isEmpty(stSalesRep)) {
                    arrFilters.push(search.createFilter({ name: 'custcol_sna_sales_rep', operator: search.Operator.ANYOF, values: stSalesRep }));
                }
            } else { //Employee Spiff
                searchId = 'customsearch_sna_emp_spiff_eligible_comm';
                // searchId = 'customsearch_hul_sna__com_pay_ope_4_2';


                searchCols = [
                    'custrecord_sna_hul_sales_rep_csm_2',
                    'Employee Spiff',
                    'name',
                    'custrecord_sna_hul_spiff_amount',
                    'custrecord_sna_hul_orig_transaction'
                ]

                if (!isEmpty(stSalesRep)) {
                    arrFilters.push(search.createFilter({ name: 'custrecord_sna_hul_sales_rep_csm_2', operator: search.Operator.ANYOF, values: stSalesRep }));
                }
                if (!isEmpty(stSubsidiary)) {
                    arrFilters.push(search.createFilter({ name: 'subsidiary', join: 'custrecord_sna_hul_sales_rep_csm_2', operator: search.Operator.ANYOF, values: stSubsidiary }));
                }
            }


            var so_search_paged = runPagedSearch({
                searchId: searchId,
                filters: arrFilters,
                pageSize: PAGE_SIZE
            });

            log.debug({ title: stLoggerTitle, details: 'so_search_paged.count: ' + so_search_paged.count });

            //Sublist + Sublist Fields
            var searchResultsSublist = form.addSublist({
                id: 'sublist_search_results',
                type: serverWidget.SublistType.LIST,
                label: 'Results'
            });

            var fldAuthorizeCheckbox = searchResultsSublist.addField({
                id: 'sublist_auth_checkbox',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Select'
            });

            var fldSalesRep = searchResultsSublist.addField({
                id: 'sublist_sales_rep',
                type: serverWidget.FieldType.TEXT,
                label: 'Sales Rep'
            });

            var fldCommType = searchResultsSublist.addField({
                id: 'sublist_comm_type',
                type: serverWidget.FieldType.TEXT,
                label: 'Commission Type'
            });

            var fldDocuNum = searchResultsSublist.addField({
                id: 'sublist_docu_num',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'Document Number'
            });

            var fldDocuNumText = searchResultsSublist.addField({
                id: 'sublist_docu_num_text',
                type: serverWidget.FieldType.TEXT,
                label: 'Document Number'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            if (stCommsType == '2') { //Add fields for Employee Spiff (Originating Transaction)
                var fldOrigTrans = searchResultsSublist.addField({
                    id: 'sublist_orig_trans',
                    type: serverWidget.FieldType.TEXTAREA,
                    label: 'Originating Transaction'
                });

                var fldOrigTransText = searchResultsSublist.addField({
                    id: 'sublist_orig_trans_text',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Originating Transaction Text'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var fldOrigTransID = searchResultsSublist.addField({
                    id: 'sublist_orig_trans_id',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Orig Transaction Record ID'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
            }

            var fldRecordId = searchResultsSublist.addField({
                id: 'sublist_trans_rec_id',
                type: serverWidget.FieldType.INTEGER,
                label: 'Transaction Record ID'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            var fldAmount = searchResultsSublist.addField({
                id: 'sublist_amt',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Amount'
            });

            var line = 0;
            so_search_paged.pageRanges.forEach(function (pageRange) {
                var myPage = so_search_paged.fetch({ index: pageRange.index });
                myPage.data.forEach(function (result) {

                    var transRecId = result.getValue({ //Record Internal ID
                        name: 'internalid'
                    })

                    var salesRep = result.getText({ //Sales Rep
                        // name: 'custcol_sna_sales_rep'
                        name: searchCols[0]
                    });

                    var docuNumber = result.getValue({ //Record Document Number (Invoice or Employee Spiff)
                        //name: 'tranid'
                        name: searchCols[2]
                    });

                    if (stCommsType == '1') { //Employee Commissions
                        var recType = 'invoice';
                        var salesRepCommsType = result.getText({
                            //name: 'custcol_sna_hul_sales_rep_comm_type'
                            name: searchCols[1]
                        });

                    } else { //Employee Spiff
                        var recType = 'customrecord_sna_hul_employee_spiff';
                        var origTransRecType;
                        // var recType = 'invoice';
                        var salesRepCommsType = searchCols[1];
                        var origTransId = result.getValue({
                            name: searchCols[4]
                        });

                        log.debug('origTransId', origTransId);

                        var origTransText = result.getText({
                            name: searchCols[4]
                        });

                        log.debug('origTransText', origTransText);

                        if(origTransText.includes("Invoice")){
                            origTransRecType = 'invoice';
                        } else {
                            origTransRecType = 'salesorder';
                        }

                        log.debug('origTransRecType', origTransRecType);

                        // var docuNumber = result.getText({ //Originating Transaction Text
                        //     //name: 'tranid'
                        //     name: searchCols[2]
                        // });
                        // transRecId = result.getValue({  //Originating Transaction ID
                        //     //name: 'tranid'
                        //     name: searchCols[2]
                        // });
                    }

                    log.debug('salesRepCommsType', salesRepCommsType);
                    log.debug('docuNumber', docuNumber);
                    log.debug('transRecId', transRecId);


                    var commAmount = result.getValue({
                        //name: 'custcol_sna_commission_amount'
                        name: searchCols[3]
                    });

                    log.debug('commAmount', commAmount);

                    searchResultsSublist.setSublistValue({
                        id: 'sublist_sales_rep',
                        line: line,
                        value: salesRep || ' '
                    });

                    log.debug('setSublistValue sublist_sales_rep');

                    searchResultsSublist.setSublistValue({
                        id: 'sublist_comm_type',
                        line: line,
                        value: salesRepCommsType || ' '
                    });

                    log.debug('setSublistValue sublist_comm_type');

                    searchResultsSublist.setSublistValue({
                        id: 'sublist_docu_num_text',
                        line: line,
                        value: docuNumber
                    });

                    log.debug('setSublistValue sublist_docu_num_text');


                    searchResultsSublist.setSublistValue({
                        id: 'sublist_trans_rec_id',
                        line: line,
                        value: transRecId
                    });

                    log.debug('setSublistValue sublist_trans_rec_id');


                    searchResultsSublist.setSublistValue({
                        id: 'sublist_docu_num',
                        line: line,
                        value: '<a href="' + getUrl(recType, transRecId) + '">' + docuNumber + '</a>'
                    });

                    log.debug('setSublistValue sublist_docu_num');


                    if (stCommsType == '2') { //Employee Spiff
                        searchResultsSublist.setSublistValue({
                            id: 'sublist_orig_trans',
                            line: line,
                            value: '<a href="' + getUrl(origTransRecType, origTransId) + '">' + origTransText + '</a>'
                        });

                        searchResultsSublist.setSublistValue({
                            id: 'sublist_orig_trans_text',
                            line: line,
                            value: origTransText
                        });

                        searchResultsSublist.setSublistValue({
                            id: 'sublist_orig_trans_id',
                            line: line,
                            value: origTransId
                        });
                    }

                    searchResultsSublist.setSublistValue({
                        id: 'sublist_amt',
                        line: line,
                        value: commAmount || 0
                    });

                    log.debug('setSublistValue sublist_amt');


                    line++;
                });
            });
            log.debug({ title: stLoggerTitle, details: '|---> ' + 'Exiting ' + stLoggerTitle + ' <---|' });

            return form;
        }

        function readRequest(objRequest) {
            var data = [],
                keys = [
                    'sublist_auth_checkbox',
                    'sublist_sales_rep',
                    'sublist_comm_type',
                    'sublist_docu_num',
                    'sublist_docu_num_text',
                    'sublist_trans_rec_id',
                    'sublist_amt'
                ]

            for (var i = 0; i < objRequest.getLineCount({ group: 'sublist_search_results' }); i++) {
                if (objRequest.getSublistValue({
                    group: 'sublist_search_results',
                    name: 'sublist_auth_checkbox',
                    line: i
                }) == 'T') {
                    var dataObj = {};
                    keys.forEach(key => {
                        dataObj[key.replace('sublist_', '')] = objRequest.getSublistValue({
                            group: 'sublist_search_results',
                            name: key,
                            line: i
                        });
                    });
                    data.push(dataObj);
                }
            }
            // log.debug({title: 'Read Request - Data', details: data});

            return data;
        }

        function processRequest(objRequest) {
            var stLoggerTitle = 'processRequest';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            //PARAM FIELDS
            var stPostingDate = objRequest.parameters.custpage_posting_date;
            var stPostingPeriod = objRequest.parameters.custpage_posting_period;
            var stLiabilityAccount = objRequest.parameters.custpage_liability_acct;
            var stExpenseAccount = objRequest.parameters.custpage_expense_acct;

            //PARAM FILTERS
            var stSubsidiary = objRequest.parameters.custpage_subsidiary;
            var stTransDate = objRequest.parameters.custpage_trans_date;
            var stSalesRep = objRequest.parameters.custpage_sales_rep;
            log.debug({ title: stLoggerTitle, details: 'stSalesRep: ' + stSalesRep });
            log.debug({ title: stLoggerTitle, details: 'typeof stSalesRep: ' + typeof stSalesRep });
            if(!isEmpty(stSalesRep)) {
                stSalesRep = stSalesRep.split(' ');//JSON.parse(stSalesRep);
            }
            log.debug({ title: stLoggerTitle, details: 'updated stSalesRep: ' + stSalesRep });
            log.debug({ title: stLoggerTitle, details: 'typeof updated stSalesRep: ' + typeof stSalesRep });
            var stCommsType = objRequest.parameters.custpage_comms_type;

            var headerData = {
                posting_date: stPostingDate,
                posting_period: stPostingPeriod,
                liability_acct: stLiabilityAccount,
                expense_acct: stExpenseAccount,
                subsidiary: stSubsidiary,
                trans_date: stTransDate,
                sales_rep: stSalesRep,
                comms_type: stCommsType
            };

            var sublistData = readRequest(objRequest);

            log.debug(stLoggerTitle, 'headerData = ' + JSON.stringify(headerData));
            log.debug(stLoggerTitle, 'sublistData = ' + JSON.stringify(sublistData));

            var salesRepArr = [], uniqueSalesRepArr = [], uniqSalesRepIndex = [], commissionPayableIds = [];

            for (let i = 0; i < sublistData.length; i++) {
                var currSalesRep = sublistData[i]['sales_rep'];
                salesRepArr.push(currSalesRep);
            }

            uniqueSalesRepArr = salesRepArr.filter((c, index) => {
                return salesRepArr.indexOf(c) === index;
            });

            for (let i = 0; i < uniqueSalesRepArr.length; i++) {
                var uniqueSalesRep = uniqueSalesRepArr[i];
                var indexes = sublistData.map((element, index) => {
                        if (element.sales_rep == uniqueSalesRep) {
                            return index;
                        }
                }).filter(element => element >= 0);

                uniqSalesRepIndex.push({
                    'salesRep': uniqueSalesRep,
                    'salesRepIndex': indexes
                });
            }
            log.debug(stLoggerTitle, 'uniqSalesRepIndex = ' + JSON.stringify(uniqSalesRepIndex));
            log.debug(stLoggerTitle , 'uniqSalesRepIndex length = ' + uniqSalesRepIndex.length);

            for(let h = 0; h < uniqSalesRepIndex.length; h++) {
                var totalAmount = 0;
                var docuNumArr = [];
                var transRecIdArr = [];

                log.debug(stLoggerTitle, 'unique salesrep = ' + uniqSalesRepIndex[h].salesRep);

                var salesRepId;
                var objSalesRepIdSearch = search.create({
                    type: "employee",
                    filters: [
                            ["entityid","contains", uniqSalesRepIndex[h].salesRep ]
                    ],
                    columns: [
                        search.createColumn({ name: "internalid" })
                    ]
                }).run().getRange({ start: 0, end: 1 });

                if(objSalesRepIdSearch.length > 0){
                    salesRepId = objSalesRepIdSearch[0].id;
                }

                for (let j = 0; j < uniqSalesRepIndex[h].salesRepIndex.length; j++) {
                    var currDocuNumText = sublistData[uniqSalesRepIndex[h].salesRepIndex[j]]['docu_num_text'];
                    var currTransId = sublistData[uniqSalesRepIndex[h].salesRepIndex[j]]['trans_rec_id'];
                    var currAmt = sublistData[uniqSalesRepIndex[h].salesRepIndex[j]]['amt'];

                    docuNumArr.push(currDocuNumText);
                    transRecIdArr.push(currTransId);
                    totalAmount = parseFloat(totalAmount) + parseFloat(currAmt);
                }

                log.debug(stLoggerTitle, 'salesRepId = ' + salesRepId);
                log.debug(stLoggerTitle, 'docuNumArr = ' + docuNumArr);
                log.debug(stLoggerTitle, 'transRecIdArr = ' + transRecIdArr);
                log.debug(stLoggerTitle, 'totalAmount = ' + totalAmount);

                var docuNumStr = docuNumArr.join();

                //CREATE COMMISSIONS PAYABLE RECORD
                var commissionsPayableRec = record.create({type: 'customtransaction_sna_commission_payable'});

                //Record - Header Fields
                commissionsPayableRec.setValue({fieldId: 'trandate', value: new Date(headerData.posting_date)});
                commissionsPayableRec.setValue({fieldId: 'postingperiod', value: headerData.posting_period});
                commissionsPayableRec.setValue({fieldId: 'subsidiary', value: headerData.subsidiary});


                //Record - Sublist Fields
                //Sublist Line 1 - Debit
                commissionsPayableRec.setSublistValue({
                    sublistId: 'line', fieldId: 'account', line: 0, value: headerData.expense_acct
                });
                commissionsPayableRec.setSublistValue({
                    sublistId: 'line', fieldId: 'debit', line: 0, value: totalAmount
                });

                //Sublist Line 2 - Credit
                commissionsPayableRec.setSublistValue({
                    sublistId: 'line', fieldId: 'account', line: 1, value: headerData.liability_acct
                });
                commissionsPayableRec.setSublistValue({
                    sublistId: 'line', fieldId: 'credit', line: 1, value: totalAmount
                });
                commissionsPayableRec.setSublistValue({
                    sublistId: 'line', fieldId: 'memo', line: 1, value: docuNumStr
                });
                commissionsPayableRec.setSublistValue({
                    sublistId: 'line', fieldId: 'entity', line: 1, value: salesRepId
                });

                var commissionsPayableRecId = commissionsPayableRec.save({ignoreMandatoryFields: true});
                log.debug({title: "Commissions Payable Created", details: commissionsPayableRecId});

                commissionPayableIds.push(commissionsPayableRecId);

                try {
                    for (var j = 0; j < transRecIdArr.length; j++) {
                        if (stCommsType == "1") { //Employee Commissions
                            log.debug({title: "Commissions Type - stCommsType", details: stCommsType});

                            var sourceTransRec = record.load({
                                type: record.Type.INVOICE,
                                id: transRecIdArr[j]
                            });

                            var sourceTransLineCount = sourceTransRec.getLineCount({
                                sublistId: 'item'
                            });

                            for (var line = 0; line < sourceTransLineCount; line++) {
                                var isEligibleForComms = sourceTransRec.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_sna_hul_eligible_for_comm',
                                    line: line
                                });

                                if (isEligibleForComms) {
                                    sourceTransRec.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_sna_hul_rel_comms_payable',
                                        line: line,
                                        value: commissionsPayableRecId
                                    });
                                }
                            }

                            var sourceTransRecId = sourceTransRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });

                            log.debug({
                                title: stLoggerTitle,
                                details: 'Source transaction updated. Source Transaction ID:' + sourceTransRecId
                            });

                        } else { //Employee Spiff
                            log.debug({title: "Commissions Type - stCommsType", details: stCommsType});

                            var recordType;

                            //Updating Employee Spiff
                            var sourceTransRec = record.load({
                                type: 'customrecord_sna_hul_employee_spiff',
                                id: transRecIdArr[j]
                            });

                            sourceTransRec.setValue({fieldId: 'custrecord_sna_hul_emp_spiff_authorized', value: true});

                            sourceTransRec.setValue({
                                fieldId: 'custrecord_sna_hul_related_comm_payable',
                                value: commissionsPayableRecId
                            });

                            var originatingTransId = sourceTransRec.getValue({fieldId: 'custrecord_sna_hul_orig_transaction'});
                            var originatingTransText = sourceTransRec.getText({fieldId: 'custrecord_sna_hul_orig_transaction'});

                            if(originatingTransText.includes("Invoice")){
                                recordType = record.Type.INVOICE;
                            } else {
                                recordType = record.Type.SALES_ORDER;
                            }

                            log.debug({
                                title: "Employee Spiff > Originating Transaction ID",
                                details: originatingTransId
                            });

                            var sourceTransRecId = sourceTransRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });

                            log.debug({
                                title: stLoggerTitle,
                                details: 'Source transaction updated. Source Transaction ID:' + sourceTransRecId
                            });

                            //Updating Employee Spiff > Originating Trans
                            var originatingTransRec = record.load({
                                type: recordType,
                                id: originatingTransId
                            });

                            var originatingTransLineCount = originatingTransRec.getLineCount({
                                sublistId: 'item'
                            });

                            for (var line = 0; line < originatingTransLineCount; line++) {
                                var isEligibleForComms = originatingTransRec.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_sna_hul_eligible_for_comm',
                                    line: line
                                });

                                if (isEligibleForComms) {
                                    originatingTransRec.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_sna_hul_authorized_emp_spiff',
                                        line: line,
                                        value: true
                                    });
                                }
                            }

                            var updatedOriginatingTransRecId = originatingTransRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });

                            log.debug({
                                title: stLoggerTitle,
                                details: 'Originating transaction updated. Originating Transaction ID:' + updatedOriginatingTransRecId
                            });

                        }
                    }
                } catch (error) {
                    log.error({title: "Error updating source transaction", details: error});
                }
            }

            log.debug({ title: stLoggerTitle, details: '|---> ' + 'Exiting ' + stLoggerTitle + ' <---|' });

            return commissionPayableIds;
        }

        function formatDate(date) {
            var dt = new Date(date);
            var dtMonth = dt.getMonth();
            var dtDay = dt.getDate();
            var dtYear = dt.getFullYear();

            date = new Date(dtMonth + 1 + '/' + dtDay + '/' + dtYear);
            return format.format({ value: format.parse({ value: date, type: format.Type.DATE }), type: format.Type.DATE });
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        function getAllIndexes(arr, val) {
            var indexes = [], i;
            for(i = 0; i < arr.length; i++)
                if (arr[i] === val)
                    indexes.push(i);
            return indexes;
        }

        function runPagedSearch(objOptions) {
            var LOG_TITLE = 'runPagedSearch';

            // log.debug({title: LOG_TITLE, details: JSON.stringify(objOptions)});

            var objSearch = search.load({ id: objOptions.searchId });

            if (objOptions.filters) {
                objSearch.filters = objSearch.filters.concat(objOptions.filters);
            }
            return objSearch.runPaged({
                pageSize: objOptions.pageSize
            });
        };

        function getUrl(recordType, recordId) {
            return url.resolveRecord({
                recordType: recordType,
                recordId: recordId,
            });
        }

        return { onRequest }
    });
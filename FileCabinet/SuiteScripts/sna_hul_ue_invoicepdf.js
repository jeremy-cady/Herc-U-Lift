/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author fang
*
* Script brief description:
* This user event script holds user event functions deployed on the invoice record. Includes the following:
* - Search and set items  in a custom field for printing purposes
* - Add 'Print Warranty' button on beforeLoad (if context is not Print/Delete
*
* Revision History:
* Date              Issue/Case         Author         Issue Fix Summary
* =============================================================================================
* 2023/05/12         ######            fang           Initial version
* 2023/05/23         ######            fang           Added Equipment Info Search
* 2023/11/21         ######            fang           Add 'Print Warranty' button on beforeLoad (if context is not Print/Delete
* 2023/12/19         ######            fang           Added Item Sublist > Revenue Stream Info Search
* 2025/1/24          252983            apalad         Change Task Search to search all cases/task related to the Sales Order, not just the NXC Case Field
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

        function itemsSearch(recId) {
            /* Columns
             * 0 - item internal id
             * 1 - make
             * 2 - model
             * 3 - serial number
             * 4 - fleet code
             * 5 - lease from (start date)
             * 6 - lease to (end date)
             * 7 - amount
             */
            var invoiceSearchObj = search.create({
                type: 'transaction',
                filters:
                    [
                        ['internalid', 'anyof', recId],
                        'AND',
                        ['taxline', 'is', 'F'],
                        'AND',
                        ['mainline', 'is', 'F'],
                        "AND",
                        ['shipping', 'is', 'F'],
                        'AND',
                        ['shipping', 'is', 'F'],
                        'AND',
                        ['custcol_sna_do_not_print', 'is', 'F'], // aduldulao 6/7/2023 - Do not Print criteria
                        'AND',
                        ['line.cseg_sna_revenue_st.custrecord_sna_hul_do_not_print', 'is', 'F']
                    ],
                columns:
                    [
                        search.createColumn({
                            name: 'internalid',
                            summary: 'GROUP'
                        }),
                        search.createColumn({ //Make
                            name: 'formulatext',
                            summary: 'GROUP',
                            formula: 'Coalesce({custcol_sna_hul_fleet_no.cseg_hul_mfg},{custcol_sna_object.cseg_hul_mfg})'
                        }),
                        search.createColumn({ //Model
                            name: 'formulatext',
                            summary: search.Summary.GROUP,
                            formula: 'Coalesce({custcol_sna_hul_fleet_no.custrecord_sna_equipment_model},{custcol_sna_object.custrecord_sna_equipment_model})'
                        }),
                        search.createColumn({ //Serial No.
                            name: 'formulatext',
                            summary: search.Summary.GROUP,
                            formula: 'Coalesce({custcol_sna_hul_fleet_no.custrecord_sna_serial_no},{custcol_sna_object.custrecord_sna_serial_no})'
                        }),
                        search.createColumn({ //Fleet Code
                            name: 'formulatext',
                            summary: search.Summary.GROUP,
                            formula: 'Coalesce({custcol_sna_hul_fleet_no.custrecord_sna_fleet_code},{custcol_sna_object.custrecord_sna_fleet_code})'
                        }),
                        search.createColumn({ //Start Date
                            name: 'formuladate',
                            summary: search.Summary.GROUP,
                            formula: '{asofdate}'
                        }),
                        search.createColumn({ //End Date
                            name: 'formuladate',
                            summary: search.Summary.GROUP,
                            formula: 'ADD_MONTHS({asofdate},1) - 1'
                        }),
                        search.createColumn({
                            name: 'amount',
                            summary: 'SUM'
                        }),
                        search.createColumn({
                            name: 'custcol_ava_taxamount',
                            summary: 'SUM'
                        })
                    ]
            });

            var searchResult = invoiceSearchObj.run().getRange(0, 1000);
            var objData =
                searchResult.map(function (result) {
                    var cols = result.columns;
                    return {
                        item: result.getText(cols[0]),
                        make: result.getValue(cols[1]),
                        model: result.getValue(cols[2]),
                        serial_num: result.getValue(cols[3]),
                        fleet_code: result.getValue(cols[4]),
                        start_date: result.getValue(cols[5]),
                        end_date: result.getValue(cols[6]),
                        amount: result.getValue(cols[7]),
                        taxamount: result.getValue(cols[8])
                    };
                }) || [];

            return objData;
        }

        function tasksSearch(salesOrderId, recType, objRecord) {

            //TODO: Search Case records using the NextServe Transaction field with SO ID

            let intSalesOrderId = salesOrderId;

            if (recType === 'invoice'){
                intSalesOrderId = objRecord.getValue({
                    fieldId: 'createdfrom'
                });
            }

            log.debug('intSalesOrderId',intSalesOrderId);

            let arrCaseId = new Array();

            let objCaseSearch = search.create({
                type: 'supportcase',
                filters: [[
                    'custevent_nx_case_transaction', 'anyof', intSalesOrderId]]
            });

            objCaseSearch.run().each(function(result) {
                arrCaseId.push(result.id)
                return true;
            });

            log.debug('arrCaseId',arrCaseId);

            /* Columns
             * 0 - task number
             * 1 - date
             * 2 - hour meter reading
             * 3 - actions taken
             */
            var taskSearchObj = search.create({
                type: 'task',
                filters:
                    [
                        ['case.internalid', 'anyof', arrCaseId],
                    ],
                columns:
                    [
                        search.createColumn({ //Task Number
                            name: 'custevent_nx_task_number',
                            sort: search.Sort.ASC
                        }),
                        search.createColumn({ //Date
                            name: 'startdate'
                        }),
                        search.createColumn({ //Hour Meter Reading
                            name: 'custrecord_nxc_mr_field_222',
                            join: 'CUSTRECORD_NXC_MR_TASK'
                        }),
                        search.createColumn({ //Action Taken
                            name: 'custevent_nx_actions_taken'
                        }),
                        // search.createColumn({ //Name/Title
                        //     name: 'title'
                        // })
                    ]
            });

            var searchResult = taskSearchObj.run().getRange(0, 1000);
            var objData =
                searchResult.map(function (result) {
                    var cols = result.columns;
                    return {
                        task_num: result.getValue(cols[0]),
                        date: result.getValue(cols[1]),
                        hr_meter_reading: result.getValue(cols[2]),
                        action_taken: result.getValue(cols[3]),
                    };
                }) || [];

            return objData;
        }

        function sortTasksByDate(tasks) {
            tasks.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
            return tasks;
        }

        function equipmentInfoSearch(internalId) {

            //Get from Case Record > Equipment Asset Record
            /* Columns
             * 0 - Equipment Asset record > Model
             * 1 - Equipment Asset record > Make (manufacturer)
             * 2 - Equipment Asset record > Serial
             * 3 - Equipment Asset record > Fleet code
             */

            var equipInfoSearchObj = search.create({
                type: 'supportcase',
                filters:
                    [
                        ['internalid', 'anyof', internalId],
                        "and",
                        ["custevent_nxc_case_assets.name","isnotempty",""]
                    ],
                columns:
                    [
                        search.createColumn({ //Equipment Asset record > Model
                            name: 'custrecord_sna_hul_nxc_object_model',
                            join: 'CUSTEVENT_NXC_CASE_ASSETS'
                        }),
                        search.createColumn({ //Equipment Asset record > Make (manufacturer)
                            name: 'cseg_hul_mfg',
                            join: 'CUSTEVENT_NXC_CASE_ASSETS'
                        }),
                        search.createColumn({ //Equipment Asset record > Serial
                            name: 'custrecord_nx_asset_serial',
                            join: 'CUSTEVENT_NXC_CASE_ASSETS'
                        }),
                        search.createColumn({ //Equipment Asset record > Fleet code
                            name: 'custrecord_sna_hul_fleetcode',
                            join: 'CUSTEVENT_NXC_CASE_ASSETS'
                        })
                    ]
            });

            var searchResult = equipInfoSearchObj.run().getRange(0, 1);

            for (var i in searchResult) {
                var result = searchResult[i];
                var cols = result.columns;

                var objData = {
                    model: result.getText(cols[0]),
                    make: result.getText(cols[1]),
                    serial_num: result.getValue(cols[2]),
                    fleet_code: result.getValue(cols[3]),
                };

                return objData;
            }
        }

        function meterReadingSearch(internalId) {

            //Get from Task Record > Maintenance Record
            /* Columns
             * 0 - maintenance record > internal id
             * 1 - maintenance record > hour meter reading
             */

            var meterReadingSearchObj = search.create({
                type: 'task',
                filters:
                    [
                        ['internalid', 'anyof', internalId],
                    ],
                columns:
                    [
                        search.createColumn({ //Maintenance Record > Internal id
                            name: 'internalid',
                            join: 'CUSTRECORD_NXC_MR_TASK'
                        }),
                        search.createColumn({ //Maintenance Record > Hour Meter Reading
                            name: 'custrecord_nxc_mr_field_222',
                            join: 'CUSTRECORD_NXC_MR_TASK'
                        })
                    ]
            });

            var searchResults = meterReadingSearchObj.run().getRange(0, 1);

            for (var i in searchResults) {
                var meterReading = searchResults[i].getValue({
                    name:'custrecord_nxc_mr_field_222',
                    join: 'CUSTRECORD_NXC_MR_TASK'
                });

                // log.debug('meterReading', meterReading);

                return meterReading;
            }
        }

        function revenueStreamDataSearch(internalId) {

            //Get from Invoice > Item Sublist > Revenue Streams column
            /* Columns
             * 0 - revenue streams record > internal id
             * 1 - revenue streams record > warranty vendor
             * 2 - revenue streams record > warranty vendor address
             */

            var revenueStreamVendorSearchObj = search.create({
                type: 'invoice',
                filters:
                    [
                        ['mainline', 'is', 'F'],
                        'AND',
                        ['custcol_sn_for_warranty_claim', 'is', 'T'],
                        'AND',
                        ['custcol_sna_hul_rev_streams_warranty', 'is', 'T'],
                        'AND',
                        ['internalid', 'anyof', internalId],
                    ],
                columns:
                    [
                        search.createColumn({ //revenue streams record > internal id
                            name: 'line.cseg_sna_revenue_st'
                        }),
                        search.createColumn({ //revenue streams record > warranty vendor
                            name: 'custrecord_sna_vendor_warranty',
                            join: 'line.cseg_sna_revenue_st'
                        }),
                        search.createColumn({ //revenue streams record > warranty vendor address
                            name: 'custrecord_sna_hul_vendor_warranty_addr',
                            join: 'line.cseg_sna_revenue_st'
                        })
                    ]
            });

            var searchResults = revenueStreamVendorSearchObj.run().getRange(0, 1);

            for (var i in searchResults) {
                var result = searchResults[i];
                var cols = result.columns;

                var objData = {
                    rev_stream_id: result.getText(cols[0]),
                    rev_stream_wty_vendor: result.getText(cols[1]),
                    rev_stream_wty_vendor_addr: result.getValue(cols[2]),
                };

                //log.debug('revenueStreamVendorSearch - objData', objData);
                return objData;
            }
        }

        function beforeLoad(scriptContext) {
            try {
                var form = scriptContext.form;
                var rec = scriptContext.newRecord;
                var recId = rec.id;
                var recType = rec.type;

                var caseId = rec.getValue({ fieldId: 'custbody_nx_case' });
                var taskId = rec.getValue({ fieldId: 'custbody_nx_task' });
                var form = scriptContext.form;

                if (scriptContext.type == scriptContext.UserEventType.PRINT) {
                    log.debug({
                        title: 'beforeLoad',
                        details: 'scriptContext.type: ' + scriptContext.type + ' | recId: ' + recId + ' | caseId: ' + caseId + ' | taskId: ' + taskId
                    });

                    //var form = scriptContext.form;
                    form.addField({id: 'custpage_itemlist', type: 'longtext', label: 'ItemList'});
                    form.addField({id: 'custpage_tasklist', type: 'longtext', label: 'TaskList'});
                    form.addField({id: 'custpage_meterreading', type: 'longtext', label: 'MeterReading' });
                    form.addField({ id: 'custpage_equipmentinfo', type: 'longtext', label: 'EquipmentInfo' });
                    // form.addField({ id: 'custpage_timelist', type: 'longtext', label: 'TimeList' });
                    // form.addField({ id: 'custpage_timesum', type: 'longtext', label: 'TimeSum' });

                    var itemsSearchResult = itemsSearch(recId);
                    log.debug({title: 'beforeLoad - itemsSearchResult: ', details: JSON.stringify(itemsSearchResult)});

                    rec.setValue({fieldId: 'custpage_itemlist', value: JSON.stringify(itemsSearchResult)});

                    if (!isEmpty(caseId)) {
                        //1.24.2025 START Case Task 252983  apalad
                        //var tasksSearchResults = tasksSearch(caseId);
                        var tasksSearchResults = tasksSearch(recId, recType, rec);
                        //1.24.2025 START Case Task 252983  apalad
                        log.debug({title: 'beforeLoad - tasksSearchResults: ', details: JSON.stringify(tasksSearchResults)
                        });
                        var taskSearchResultsSort = sortTasksByDate(tasksSearchResults);
                        log.debug({title: 'beforeLoad - taskSearchResultsSort: ', details: JSON.stringify(taskSearchResultsSort)
                        });

                        rec.setValue({fieldId: 'custpage_tasklist', value: JSON.stringify(tasksSearchResults)});

                        var equipmentInfoSearchResults = equipmentInfoSearch(caseId);
                        log.debug({title: 'beforeLoad - equipmentInfoSearchResults: ', details: JSON.stringify(equipmentInfoSearchResults)
                        });

                        rec.setValue({fieldId: 'custpage_equipmentinfo', value: JSON.stringify(equipmentInfoSearchResults)});
                    }

                    if (!isEmpty(taskId)) {
                        var meterReading = meterReadingSearch(taskId);
                        log.debug({title: 'beforeLoad - meterReadingSearchResults: ', details: meterReading });

                        rec.setValue({fieldId: 'custpage_meterreading', value: meterReading});

                    }
                } else {
                    if (scriptContext.type != scriptContext.UserEventType.DELETE && recType == 'invoice') {
                        log.debug({
                            title: 'beforeLoad',
                            details: 'scriptContext.type: ' + scriptContext.type + ' | recType: ' + recType
                        });

                        if (scriptContext.type != scriptContext.UserEventType.CREATE) {
                            form.addField({ id: 'custpage_line_item_rev_stream', type: 'longtext', label: 'LineItemRevenueStream' });

                            var revenueStreamDataSearchResult = revenueStreamDataSearch(recId);
                            log.debug({title: 'beforeLoad - revenueStreamDataSearchResult: ', details: JSON.stringify(revenueStreamDataSearchResult)});

                            rec.setValue({fieldId: 'custpage_line_item_rev_stream', value: JSON.stringify(revenueStreamDataSearchResult)});
                        }

                        form.clientScriptModulePath = 'SuiteScripts/sna_hul_cs_sales_order_consolidate.js';

                        form.addButton({
                            id: 'custpage_print_wty_btn',
                            label: 'Print Warranty',
                            functionName: 'printWarrantyFxn'
                        });
                    }
                }

            } catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR', e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error', e.toString());
                }
            }
        }

        return {
            beforeLoad: beforeLoad
        };
    });
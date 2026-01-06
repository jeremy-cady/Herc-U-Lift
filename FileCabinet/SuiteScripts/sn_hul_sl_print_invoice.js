/*
* Copyright (c) 2024, ScaleNorth LLC and/or its affiliates. All rights reserved.
*
* @author elausin
*
* Script brief description:
*
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2025/03/11                            elausin         Initial version
*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/record'],
    
    (search, record) => {

        function isEmpty(stValue) {
            return ((stValue === '' || stValue === null || stValue === undefined) || (stValue.constructor === Array && stValue.length === 0) || (stValue.constructor === Object && (function (
                v) {
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
                        ['custcol_sna_do_not_print', 'is', 'F'],
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

        const onRequest = (scriptContext) => {
            try {
                var recordId = scriptContext.request.parameters.recid;
                log.debug('recordId', recordId);

                var itemsSearchResult = itemsSearch(recordId);
                log.debug({title: 'beforeLoad - itemsSearchResult: ', details: JSON.stringify(itemsSearchResult)});

                var returnList = '<#assign itemList =' + JSON.stringify(itemsSearchResult) + '/>';

                scriptContext.response.writeLine(returnList);
            } catch (e) {
                log.debug('Error onRequest', e);
            }

        }

        return {onRequest}

    });

/*
* Copyright (c) 2024, ScaleNorth LLC and/or its affiliates. All rights reserved.
*
* @author elausin
*
* Script brief description:
* Custom UI - popup when deleting an invoice.
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2025/05/21                            elausin         Initial version
*/
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'],

    (record, search) => {

        const beforeSubmit = (scriptContext) => {
            const contextType = scriptContext.type;
            if (contextType === 'delete') {
                const objRecord = scriptContext.newRecord;
                const invTranId = objRecord.getValue('tranid');
                const jeRecords = searchJE(invTranId);
                const jeURL = 'https://6952227.app.netsuite.com/app/accounting/transactions/journal.nl?id='
                log.debug('DEBUG', 'jeRecords: ' + jeRecords);
                let strMessage = '';
                let jeDocUrl = '';
                let jeIds = [];

                if (!isEmpty(jeRecords)) {
                    for (let i = 0; i < jeRecords.length; i++) {
                        jeDocUrl += `<br/><a href="${jeURL}` + jeRecords[i].jeId + `">` + jeRecords[i].jeNo + `</a>` + '<br/>';
                        // jeDoc.push(jeRecords[i].jeNo);
                        // jeIds.push(jeRecords[i].jeId);
                    }
                    strMessage = "This invoice has an associated journal entry: <b>" + jeDocUrl + "</b><br/>";
                    throw strMessage + "Please delete the journal first.";
                }
            }
        }

        const searchJE = (invoiceDocNum) => {
            var relatedJEs = [];
            var journalentrySearchObj = search.create({
                type: "journalentry",
                filters:
                    [
                        ["type","anyof","Journal"],
                        "AND",
                        ["mainline","is","T"],
                        "AND",
                        ["memomain","contains",invoiceDocNum]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            summary: "GROUP",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "tranid",
                            summary: "GROUP",
                            label: "Document Number"
                        })
                    ]
            });

            journalentrySearchObj.run().each(function(result){
                const jeDetails = {
                    jeNo: result.getValue({ name: "tranid", summary: "GROUP" }),
                    jeId: result.getValue({ name: "internalid", summary: "GROUP" })
                }
                relatedJEs.push(jeDetails);
                return true;
            });
            return relatedJEs;
        }

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {beforeSubmit}

    });

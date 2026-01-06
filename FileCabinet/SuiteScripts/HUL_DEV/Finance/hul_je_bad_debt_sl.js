/**
* @NApiVersion 2.x
* @NScriptType Suitelet
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 01/15/2025
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/search", "N/record"], function (require, exports, log, search, record) {
    "use strict";
    /**
    * Definition of the Suitelet script trigger point.
    * @param {Object} context
    * @param {ServerRequest} context.request - Encapsulation of the incoming request
    * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
    * @Since 2015.2
    */
    function onRequest(ctx) {
        try {
            if (ctx.request.method === 'GET') {
                var resultsArray_1 = [];
                var journalEntrySearchFilters = [
                    ['type', 'anyof', 'Journal'],
                    'AND',
                    ['account', 'anyof', '774'],
                    'AND',
                    ['trandate', 'within', '10/01/2024', '10/31/2024'],
                    'AND',
                    ['subsidiary', 'anyof', '2'],
                ];
                var journalEntrySearchColInternalId_1 = search.createColumn({ name: 'internalid' });
                var journalEntrySearchColTranDate_1 = search.createColumn({ name: 'trandate', sort: search.Sort.ASC });
                var journalEntrySearchColTransactionName_1 = search.createColumn({ name: 'transactionname' });
                var journalEntrySearch = search.create({
                    type: 'journalentry',
                    filters: journalEntrySearchFilters,
                    columns: [
                        journalEntrySearchColInternalId_1,
                        journalEntrySearchColTranDate_1,
                        journalEntrySearchColTransactionName_1,
                    ],
                });
                var journalEntrySearchPagedData = journalEntrySearch.runPaged({ pageSize: 1000 });
                for (var i = 0; i < journalEntrySearchPagedData.pageRanges.length; i++) {
                    var journalEntrySearchPage = journalEntrySearchPagedData.fetch({ index: i });
                    journalEntrySearchPage.data.forEach(function (result) {
                        var internalId = result.getValue(journalEntrySearchColInternalId_1);
                        var tranDate = result.getValue(journalEntrySearchColTranDate_1);
                        var tranName = result.getValue(journalEntrySearchColTransactionName_1);
                        // log.debug('internalId',internalId);
                        // log.debug('tranDate', tranDate);
                        // log.debug('transactionName', tranName);
                        var jeRec = record.load({
                            type: record.Type.JOURNAL_ENTRY,
                            id: internalId
                        });
                        var lineCount = jeRec.getLineCount({ sublistId: 'line' });
                        // log.debug('lineCount', lineCount);
                        var linesArray = [];
                        for (var lineIndex = 0; lineIndex < lineCount; lineIndex++) {
                            var account = jeRec.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'account_display',
                                line: lineIndex,
                            });
                            var cleared = jeRec.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'cleared',
                                line: lineIndex,
                            });
                            var debit = jeRec.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                line: lineIndex,
                            });
                            var locationName = jeRec.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'location_display',
                                line: lineIndex,
                            });
                            var entity = jeRec.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity_display',
                                line: lineIndex,
                            });
                            var credit = jeRec.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                line: lineIndex,
                            });
                            var linesObject = {
                                accountName: account,
                                isCleared: cleared,
                                creditNUm: credit,
                                debitNum: debit,
                                entityName: entity,
                                location: locationName,
                            };
                            linesArray.push(linesObject);
                        }
                        var journalData = {
                            internalID: internalId,
                            transactionDate: tranDate,
                            transactionName: tranName,
                            lines: linesArray,
                        };
                        resultsArray_1.push(journalData);
                    });
                }
                log.debug('resultsArray', resultsArray_1);
                // Generate the HTML page
                // const htmlContent = generateHTMLPage(resultsArray);
                // Send the HTML response
                ctx.response.setHeader({
                    name: 'Content-Type',
                    value: 'text/html',
                });
                ctx.response.write(generateHTMLPage(resultsArray_1));
            }
        }
        catch (error) {
            log.error('HTML Generation Error', error);
            ctx.response.write('<h1>ERROR generating page</h1>');
        }
    }
    var generateHTMLPage = function (resultsArray) {
        var css = "\n        <style>\n            body {\n                font-family: Arial, sans-serif;\n                margin: 20px;\n            }\n            h1, h2 {\n                text-align: center; \n            }\n            table {\n                width: 100%;\n                border-collapse: collapse;\n                margin: 20px 0;\n            }\n            th, td {\n                border: 1px solid #ddd;\n                padding: 8px;\n                text-align: left;\n            }\n            th {\n                background-color: #f4f4f4;\n            }\n            .lines-table th, .lines-table td {\n                text-align: right;\n            }\n            .entry-container {\n                page-break-inside: avoid;\n                margin-bottom: 60px;\n            }\n        </style>\n    ";
        var html = "\n        <!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>Journal Entry Report</title>\n            ".concat(css, "\n        </head>\n        <body>\n            <h1>Journal Entry Report</h1>\n            <h2>Prepared for Audit</h2>\n            <h2>October 2024</h2>\n    ");
        // Iterate through journal entries and create a section for each
        resultsArray.forEach(function (entry) {
            html += "\n            <div class=\"entry-container\">\n                <h3>".concat(entry.transactionName, "</h3>\n                <p><strong>Date:</strong> ").concat(entry.transactionDate, "</p>\n                <p><strong>Internal ID:</strong> ").concat(entry.internalID, "</p>\n                <table>\n                    <thead>\n                        <tr>\n                            <th>Account Name</th>\n                            <th>Is Cleared</th>\n                            <th>Credit Amount</th>\n                            <th>Debit Amount</th>\n                            <th>Entity Name</th>\n                            <th>Location</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n        ");
            entry.lines.forEach(function (line) {
                html += "\n                <tr>\n                    <td>".concat(line.accountName || '', "</td>\n                    <td>").concat(line.isCleared || '', "</td>\n                    <td>").concat(line.creditNUm || '', "</td>\n                    <td>").concat(line.debitNum || '', "</td>\n                    <td>").concat(line.entityName || '', "</td>\n                    <td>").concat(line.location || '', "</td>\n                </tr>\n            ");
            });
            html += "\n                    </tbody>\n                </table>\n            </div>\n        ";
        });
        html += "\n        </body>\n        </html>\n    ";
        return html;
    };
    return { onRequest: onRequest };
});

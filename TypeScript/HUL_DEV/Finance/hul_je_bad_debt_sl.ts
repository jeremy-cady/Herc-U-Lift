/**
* @NApiVersion 2.x
* @NScriptType Suitelet
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 01/15/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';

interface JournalDataObject {
    internalID: string;
    transactionDate: string;
    transactionName: string;
    lines: JournalLinesObject [];
}
interface JournalLinesObject {
    accountName: string;
    isCleared: string;
    creditNUm: string;
    debitNum: string;
    entityName: string;
    location: string;
}

/**
* Definition of the Suitelet script trigger point.
* @param {Object} context
* @param {ServerRequest} context.request - Encapsulation of the incoming request
* @param {ServerResponse} context.response - Encapsulation of the Suitelet response
* @Since 2015.2
*/
function onRequest(ctx: EntryPoints.Suitelet.onRequestContext) {
    try {
        if (ctx.request.method === 'GET') {
            const resultsArray: JournalDataObject[] = [];
            const journalEntrySearchFilters: SavedSearchFilters = [
                ['type', 'anyof', 'Journal'],
                'AND',
                ['account', 'anyof', '774'],
                'AND',
                ['trandate', 'within', '10/01/2024', '10/31/2024'],
                'AND',
                ['subsidiary', 'anyof', '2'],
            ];
            const journalEntrySearchColInternalId = search.createColumn({ name: 'internalid' });
            const journalEntrySearchColTranDate = search.createColumn({ name: 'trandate', sort: search.Sort.ASC });
            const journalEntrySearchColTransactionName = search.createColumn({ name: 'transactionname' });
            const journalEntrySearch = search.create({
                type: 'journalentry',
                filters: journalEntrySearchFilters,
                columns: [
                    journalEntrySearchColInternalId,
                    journalEntrySearchColTranDate,
                    journalEntrySearchColTransactionName,
                ],
            });
            const journalEntrySearchPagedData = journalEntrySearch.runPaged({ pageSize: 1000 });
            for (let i = 0; i < journalEntrySearchPagedData.pageRanges.length; i++) {
                const journalEntrySearchPage = journalEntrySearchPagedData.fetch({ index: i });
                journalEntrySearchPage.data.forEach((result: search.Result): void => {
                    const internalId = <string>result.getValue(journalEntrySearchColInternalId);
                    const tranDate = <string>result.getValue(journalEntrySearchColTranDate);
                    const tranName = <string>result.getValue(journalEntrySearchColTransactionName);
                    // log.debug('internalId',internalId);
                    // log.debug('tranDate', tranDate);
                    // log.debug('transactionName', tranName);
                    const jeRec = record.load({
                        type: record.Type.JOURNAL_ENTRY,
                        id: internalId
                    });
                    const lineCount = jeRec.getLineCount({ sublistId: 'line' });
                    // log.debug('lineCount', lineCount);
                    const linesArray: JournalLinesObject [] = [];

                    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
                        const account = jeRec.getSublistValue({
                            sublistId: 'line',
                            fieldId: 'account_display',
                            line: lineIndex as number,
                        }) as string;
                        const cleared = jeRec.getSublistValue({
                            sublistId: 'line',
                            fieldId: 'cleared',
                            line: lineIndex as number,
                        }) as string;
                        const debit = jeRec.getSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            line: lineIndex as number,
                        }) as string | null;
                        const locationName = jeRec.getSublistValue({
                            sublistId: 'line',
                            fieldId: 'location_display',
                            line: lineIndex as number,
                        }) as string;
                        const entity = jeRec.getSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity_display',
                            line: lineIndex as number,
                        }) as string;
                        const credit = jeRec.getSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            line: lineIndex as number,
                        }) as string | null;

                        const linesObject: JournalLinesObject = {
                            accountName: account,
                            isCleared: cleared,
                            creditNUm: credit,
                            debitNum: debit,
                            entityName: entity,
                            location: locationName,
                        };

                        linesArray.push(linesObject);

                    }
                    const journalData: JournalDataObject = {
                        internalID: internalId,
                        transactionDate: tranDate,
                        transactionName: tranName,
                        lines: linesArray,
                    };
                    resultsArray.push(journalData);
                });
            }
            interface NestedArray<T> extends Array<T | NestedArray<T>> { }
            type SavedSearchFilters = string | NestedArray<string | search.Operator>;
            log.debug('resultsArray', resultsArray);

            // Generate the HTML page
            // const htmlContent = generateHTMLPage(resultsArray);

            // Send the HTML response
            ctx.response.setHeader({
                name: 'Content-Type',
                value: 'text/html',
            });

            ctx.response.write(generateHTMLPage(resultsArray));
        }
    } catch (error) {
        log.error('HTML Generation Error', error);
        ctx.response.write('<h1>ERROR generating page</h1>');
    }
}

const generateHTMLPage = (resultsArray: JournalDataObject[]): string => {
    const css = `
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1, h2 {
                text-align: center; 
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f4f4f4;
            }
            .lines-table th, .lines-table td {
                text-align: right;
            }
            .entry-container {
                page-break-inside: avoid;
                margin-bottom: 60px;
            }
        </style>
    `;
    let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Journal Entry Report</title>
            ${css}
        </head>
        <body>
            <h1>Journal Entry Report</h1>
            <h2>Prepared for Audit</h2>
            <h2>October 2024</h2>
    `;

    // Iterate through journal entries and create a section for each
    resultsArray.forEach((entry) => {
        html += `
            <div class="entry-container">
                <h3>${entry.transactionName}</h3>
                <p><strong>Date:</strong> ${entry.transactionDate}</p>
                <p><strong>Internal ID:</strong> ${entry.internalID}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Account Name</th>
                            <th>Is Cleared</th>
                            <th>Credit Amount</th>
                            <th>Debit Amount</th>
                            <th>Entity Name</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        entry.lines.forEach((line) => {
            html += `
                <tr>
                    <td>${line.accountName || ''}</td>
                    <td>${line.isCleared || ''}</td>
                    <td>${line.creditNUm || ''}</td>
                    <td>${line.debitNum || ''}</td>
                    <td>${line.entityName || ''}</td>
                    <td>${line.location || ''}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    });

    html += `
        </body>
        </html>
    `;

    return html;
};

// const generateTestHtmlPage = (): string => `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <title>Test Page</title>
//     </head>
//     <body>
//         <h1>Test Content</h1>
//         <p>If you see this, HTML generation works.</p>
//     </body>
//     </html>
// `;

export = { onRequest };
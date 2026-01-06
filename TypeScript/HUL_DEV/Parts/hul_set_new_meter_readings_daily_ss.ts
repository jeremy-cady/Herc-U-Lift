/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/27/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';

interface MeterObject {
    actualReading: number;
    readingDate: Date;
    objectID: number;
}

/**
* Definition of the Scheduled script trigger point.
* @param {Object} context
* @param {string} context.type - The context in which the script is executed.
*                                It is one of the values from the context.InvocationType enum.
* @Since 2015.2
*/
function execute(ctx: EntryPoints.Scheduled.executeContext) {
    const changedObjectArray = getChangedHourMeterRecords();
    setMeterReadingField(changedObjectArray);
}

const getChangedHourMeterRecords = () => {
    const meterReadingReturnArray: any[] = [];
    const maxMeterReadingQuery = `
        SELECT 
            co.id,
            chm_sub.createddate,
            chm_sub.reading
        FROM 
            customrecord_sna_objects co
        LEFT JOIN (
            SELECT 
                chm.custrecord_sna_hul_object_ref AS object_ref,
                MAX(chm.created) AS createddate,
                chm.custrecord_sna_hul_actual_reading AS reading
            FROM 
                customrecord_sna_hul_hour_meter chm
            WHERE 
                chm.created >= CURRENT_DATE - 1
            GROUP BY 
                chm.custrecord_sna_hul_object_ref, 
                chm.custrecord_sna_hul_actual_reading
        ) chm_sub ON chm_sub.object_ref = co.id
        WHERE 
            EXISTS (
                SELECT 1 
                FROM customrecord_sna_hul_hour_meter chm 
                WHERE chm.custrecord_sna_hul_object_ref = co.id 
                AND chm.created >= CURRENT_DATE - 1
            );
    `;
    const maxMeterReadingQueryResults = query.runSuiteQL({
        query: maxMeterReadingQuery
    });
    log.debug('maxMeterReadingQueryResults', maxMeterReadingQueryResults);
    const meterResultsArray: any = maxMeterReadingQueryResults.results;
    if (meterResultsArray.length === 0) {
        log.debug('No new meter readings', 0);
        return;
    } else if (meterResultsArray.length > 0) {
        meterResultsArray.map((result) => {
            const readingObject: MeterObject = {
                objectID: result.values[0],
                readingDate: result.values[1],
                actualReading: result.values[2],
            };
            log.debug('readingObject', readingObject);
            meterReadingReturnArray.push(readingObject);
        });
        return meterReadingReturnArray;
    }

};

const setMeterReadingField = (changedObjectArray) => {
    try {
        changedObjectArray.forEach((meterObject) => {
            const objectID = meterObject.objectID;
            const readingDateString = meterObject.readingDate;
            const readingDate = convertToDate(readingDateString);
            const actualReading = meterObject.actualReading;
            log.debug('objectID', objectID);
            // log.debug('readingDateString', readingDateString);
            log.debug('readingDate', readingDate);
            // log.debug('type of readingDate', typeof readingDateString);
            log.debug('actualReading', actualReading);

            record.submitFields({
                type: 'customrecord_sna_objects',
                id: objectID,
                values: {
                    custrecord_hul_meter_key_static: actualReading,
                    custrecord_sna_last_meter_reading_m1: readingDate
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });
        });
        return true;
    } catch (error) {
        log.debug('ERROR setting meter reading field', error);
    }
};

function convertToDate(readingDateString) {
    let formattedDate: any;
    const dateParts = readingDateString.split('/');
    if (dateParts.length !== 3) {
        log.debug('Invalid date format', dateParts);
        return;
    }
    const month = parseInt(dateParts[0], 10) - 1; // JavaScript months are 0-based
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    // Validate the date components
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        log.debug('Invalid date components', dateParts);
        return;
    }
    // Create the JavaScript Date object
    const date = new Date(year, month, day);
    log.debug('date', date);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        log.debug('Invalid date object', date);
    } else {
        // Format the date
        formattedDate = `${(date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1)}/` +
                        `${(date.getDate() < 10 ? '0' : '') + date.getDate()}/` +
                        `${date.getFullYear()}`;
    }
    log.debug('formattedDate', formattedDate);
    return date;
}

export = { execute };
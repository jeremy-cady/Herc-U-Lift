/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/27/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/record"], function (require, exports, log, query, record) {
    "use strict";
    /**
    * Definition of the Scheduled script trigger point.
    * @param {Object} context
    * @param {string} context.type - The context in which the script is executed.
    *                                It is one of the values from the context.InvocationType enum.
    * @Since 2015.2
    */
    function execute(ctx) {
        var changedObjectArray = getChangedHourMeterRecords();
        setMeterReadingField(changedObjectArray);
    }
    var getChangedHourMeterRecords = function () {
        var meterReadingReturnArray = [];
        var maxMeterReadingQuery = "\n        SELECT \n            co.id,\n            chm_sub.createddate,\n            chm_sub.reading\n        FROM \n            customrecord_sna_objects co\n        LEFT JOIN (\n            SELECT \n                chm.custrecord_sna_hul_object_ref AS object_ref,\n                MAX(chm.created) AS createddate,\n                chm.custrecord_sna_hul_actual_reading AS reading\n            FROM \n                customrecord_sna_hul_hour_meter chm\n            WHERE \n                chm.created >= CURRENT_DATE - 1\n            GROUP BY \n                chm.custrecord_sna_hul_object_ref, \n                chm.custrecord_sna_hul_actual_reading\n        ) chm_sub ON chm_sub.object_ref = co.id\n        WHERE \n            EXISTS (\n                SELECT 1 \n                FROM customrecord_sna_hul_hour_meter chm \n                WHERE chm.custrecord_sna_hul_object_ref = co.id \n                AND chm.created >= CURRENT_DATE - 1\n            );\n    ";
        var maxMeterReadingQueryResults = query.runSuiteQL({
            query: maxMeterReadingQuery
        });
        log.debug('maxMeterReadingQueryResults', maxMeterReadingQueryResults);
        var meterResultsArray = maxMeterReadingQueryResults.results;
        if (meterResultsArray.length === 0) {
            log.debug('No new meter readings', 0);
            return;
        }
        else if (meterResultsArray.length > 0) {
            meterResultsArray.map(function (result) {
                var readingObject = {
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
    var setMeterReadingField = function (changedObjectArray) {
        try {
            changedObjectArray.forEach(function (meterObject) {
                var objectID = meterObject.objectID;
                var readingDateString = meterObject.readingDate;
                var readingDate = convertToDate(readingDateString);
                var actualReading = meterObject.actualReading;
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
        }
        catch (error) {
            log.debug('ERROR setting meter reading field', error);
        }
    };
    function convertToDate(readingDateString) {
        var formattedDate;
        var dateParts = readingDateString.split('/');
        if (dateParts.length !== 3) {
            log.debug('Invalid date format', dateParts);
            return;
        }
        var month = parseInt(dateParts[0], 10) - 1; // JavaScript months are 0-based
        var day = parseInt(dateParts[1], 10);
        var year = parseInt(dateParts[2], 10);
        // Validate the date components
        if (isNaN(month) || isNaN(day) || isNaN(year)) {
            log.debug('Invalid date components', dateParts);
            return;
        }
        // Create the JavaScript Date object
        var date = new Date(year, month, day);
        log.debug('date', date);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            log.debug('Invalid date object', date);
        }
        else {
            // Format the date
            formattedDate = "".concat((date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1), "/") +
                "".concat((date.getDate() < 10 ? '0' : '') + date.getDate(), "/") +
                "".concat(date.getFullYear());
        }
        log.debug('formattedDate', formattedDate);
        return date;
    }
    return { execute: execute };
});

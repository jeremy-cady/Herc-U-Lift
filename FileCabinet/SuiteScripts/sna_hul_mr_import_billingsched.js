/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author fang
 *
 * Script brief description:
 * MR script to iterate through the CSV lines
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/05/09       		              fang           Initial version.
 *
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/error', 'N/runtime', 'N/format', 'N/file', 'N/search', 'N/email'],
    /**
     * @param{record} record
     */
    (record, error, runtime, format, file, search, email) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
            }

            return flValue.toFixed(2);
        }


        function splitCSVButIgnoreCommasInDoublequotes(str) {
            //split the str first
            //then merge the elments between two double quotes
            var delimiter = ',';
            var quotes = '"';
            var elements = str.split(delimiter);
            var newElements = [];
            for (var i = 0; i < elements.length; ++i) {
                if (elements[i].indexOf(quotes) >= 0) {//the left double quotes is found
                    var indexOfRightQuotes = -1;
                    var tmp = elements[i];
                    //find the right double quotes
                    for (var j = i + 1; j < elements.length; ++j) {
                        if (elements[j].indexOf(quotes) >= 0) {
                            indexOfRightQuotes = j;
                            break;
                        }
                    }
                    //found the right double quotes
                    //merge all the elements between double quotes
                    if (-1 != indexOfRightQuotes) {
                        for (var j = i + 1; j <= indexOfRightQuotes; ++j) {
                            tmp = tmp + delimiter + elements[j];
                        }
                        newElements.push(tmp);
                        i = indexOfRightQuotes;
                    } else { //right double quotes is not found
                        newElements.push(elements[i]);
                    }
                } else {//no left double quotes is found
                    newElements.push(elements[i]);
                }
            }

            return newElements;
        }

        function handleErrorAndSendNotification(e, stage) {
            log.error('Stage: ' + stage + ' failed', e);
        }

        function handleErrorIfAny(summary) {
            var inputSummary = summary.inputSummary;
            var mapSummary = summary.mapSummary;
            var reduceSummary = summary.reduceSummary;

            if (inputSummary.error) {
                var e = error.create({
                    name: 'INPUT_STAGE_FAILED',
                    message: inputSummary.error
                });
                handleErrorAndSendNotification(e, 'getInputData');
            }

            handleErrorInStage('map', mapSummary);
            handleErrorInStage('reduce', reduceSummary);
        }

        function handleErrorInStage(stage, summary) {
            var errorMsg = [];
            summary.errors.iterator().each(function (key, value) {
                if (!isEmpty(JSON.parse(value).message)) {
                    var msg = 'Error was: ' + JSON.parse(value).message + '\n';
                    errorMsg.push(msg);
                }
            });
            if (errorMsg.length > 0) {
                var e = error.create({
                    name: 'ERROR_IN_STAGE',
                    message: JSON.stringify(errorMsg)
                });
                handleErrorAndSendNotification(e, stage);
            }
        }

        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            var currscript = runtime.getCurrentScript();
            var fileId = currscript.getParameter({name: 'custscript_sna_file_id'});

            log.debug({title: 'getInputData', details: 'fileId: ' + fileId});

            var finalresults = [];

            if (!isEmpty(fileId)) {
                // load csv file from file cabinet using Internal Id
                var arrLines = file.load({
                    id: fileId
                }).getContents().split(/\n|\n\r/);

                //new index guide for CSV
                /*
                * 0 - primary key (id)
                * 1 - match (name)
                * 2 - document number
                * 3 - archive version
                * 4 - equipment object
                * 5 - line no.
                * 6 - invoice period
                * 7 - invoicing date
                * 8 - principal
                * 9 - interest amount
                * 10 - amount per period
                * 11 - invoiced
                * */

                // loop to get all lines
                for (var i = 1; i < arrLines.length; i++) {
                    var content = splitCSVButIgnoreCommasInDoublequotes(arrLines[i]);

                    if (!isEmpty(content[0])) {
                        finalresults.push({
                            primarykey: !isEmpty(content[0]) ? content[0].replace(/\r/g, '') : '',
                            name: !isEmpty(content[1]) ? content[1].replace(/\r/g, '') : '',
                            docunum: !isEmpty(content[2]) ? content[2].replace(/\r/g, '') : '',
                            archivever: !isEmpty(content[3]) ? content[3].replace(/\r/g, '') : '',
                            equipobj: !isEmpty(content[4]) ? content[4].replace(/\r/g, '') : '',
                            linenum: !isEmpty(content[5]) ? content[5].replace(/\r/g, '') : '',
                            invperiod: !isEmpty(content[6]) ? content[6].replace(/\r/g, '') : '',
                            invdate: !isEmpty(content[7]) ? content[7].replace(/\r/g, '') : '',
                            principal: !isEmpty(content[8]) ? content[8].replace(/\r/g, '') : '',
                            interestamt: !isEmpty(content[9]) ? content[9].replace(/\r/g, '') : '',
                            amtperperiod: !isEmpty(content[10]) ? content[10].replace(/\r/g, '') : '',
                            invoiced: !isEmpty(content[11]) ? content[11].replace(/\r/g, '') : '',
                        });
                    }
                }
            }

            log.debug({title: 'getInputData', details: 'finalresults: ' + JSON.stringify(finalresults)});
            log.debug({title: 'getInputData', details: 'finalresults count: ' + finalresults.length});

            return finalresults;
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            var key = mapContext.key;
            var objSearchResult = mapContext.value;

            var ke = '';

            var _objSearchResult = JSON.parse(objSearchResult);
            if (!isEmpty(_objSearchResult.primarykey)) {
                ke = _objSearchResult.primarykey;
            }
            log.debug({
                title: 'map',
                details: 'KEY: ' + key + ' | objSearchResult: ' + objSearchResult + ' | primarykey: ' + ke
            });

            // group by primarykey
            if (!isEmpty(ke)) {
                mapContext.write({key: ke, value: objSearchResult});
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            var currscript = runtime.getCurrentScript();

            log.debug({title: 'reduce', details: 'data: ' + JSON.stringify(reduceContext)});
            var nameVal = reduceContext.key;
            var objReduceData = reduceContext.values;

            log.debug({title: 'reduce', details: 'objReduceData.length: ' + objReduceData.length});
            log.debug({title: 'reduce', details: 'objReduceData: ' + objReduceData});

            try {
                var rec = record.create({type: 'billingschedule', isDynamic: true});

                rec.setValue({fieldId: 'name', value: nameVal});
                rec.setValue({fieldId: 'initialamount', value: 0});
                rec.setValue({fieldId: 'frequency', value: 'CUSTOM'});
                rec.setValue({fieldId: 'ispublic', value: true});

                log.debug({title: 'reduce', details: 'After setting header fields'});

                for (var i = 0; i < objReduceData.length; i++) {
                    var currObjReduceData = JSON.parse(objReduceData[i]);

                    // log.debug({title: 'reduce', details: 'currObjReduceData: ' + JSON.stringify(currObjReduceData)});

                    rec.selectNewLine({sublistId: 'recurrence'});
                    rec.setCurrentSublistValue({sublistId: 'recurrence', fieldId: 'count', value: 1});

                    rec.setCurrentSublistValue({sublistId: 'recurrence', fieldId: 'units', value: 'CUSTOM'});

                    rec.setCurrentSublistValue({
                        sublistId: 'recurrence',
                        fieldId: 'recurrencedate',
                        value: new Date(currObjReduceData.invdate)
                    });

                    rec.setCurrentSublistValue({
                        sublistId: 'recurrence',
                        fieldId: 'amount',
                        value: forceFloat(currObjReduceData.amtperperiod)
                    });

                    rec.commitLine({sublistId: 'recurrence'});

                    log.debug({title: 'reduce', details: 'After commit line'});

                }

                var newrecid = rec.save({enableSourcing: true, ignoreMandatoryFields: true});
                log.debug({title: 'reduce', details: 'billing schedule record saved: ' + newrecid});

            } catch (e) {
                var errmessage = '';

                if (e.message != undefined) {
                    errmessage = e.name + ' ' + e.message;
                    log.error('ERROR', e.name + ' ' + e.message + '| Key: ' + nameVal );
                } else {
                    errmessage = e.toString();
                    log.error('ERROR', 'Unexpected Error', e.toString());
                }
            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            log.debug({title: 'summarize', details: 'SUMMARY: ' + JSON.stringify(summaryContext)});

            // Error handling
            handleErrorIfAny(summaryContext);
        }

        return {getInputData, map, reduce, summarize}

    });

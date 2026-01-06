/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * Map/reduce script to process tax automation
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/6/22       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/error', 'N/runtime'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search, error, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
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
                    name : 'INPUT_STAGE_FAILED',
                    message : inputSummary.error
                });
                handleErrorAndSendNotification(e, 'getInputData');
            }

            handleErrorInStage('map', mapSummary);
            handleErrorInStage('reduce', reduceSummary);
        }

        function handleErrorInStage(stage, summary) {
            var errorMsg = [];
            summary.errors.iterator().each(function(key, value) {
                if (!isEmpty(JSON.parse(value).message)) {
                    var msg = 'Error was: ' + JSON.parse(value).message + '\n';
                    errorMsg.push(msg);
                }
            });
            if (errorMsg.length > 0) {
                var e = error.create({
                    name : 'ERROR_IN_STAGE',
                    message : JSON.stringify(errorMsg)
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
            var searchres = search.load({id: 'customsearch_sna_bulk_tax_automation'});

            return searchres;
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
            var currentScript = runtime.getCurrentScript();
            var willcall = currentScript.getParameter({name: 'custscript_sna_ofm_willcall'});
            var ship = currentScript.getParameter({name: 'custscript_sna_ofm_ship'});
            var avataxpos = currentScript.getParameter({name: 'custscript_sna_tax_avataxpos'});
            var avatax = currentScript.getParameter({name: 'custscript_sna_tax_avatax'});

            var uniquepair = reduceContext.values;

            // Assumed results are grouped by internal ID, therefore only one array value
            var parsed = JSON.parse(uniquepair[0]);
            log.debug({title: 'reduce', details: 'parsed: ' + JSON.stringify(parsed)});

            var soid = parsed.values['GROUP(internalid)'].value;
            var rectype = search.lookupFields({type: 'transaction', id: soid, columns: ['recordtype']}).recordtype;
            log.debug({title: 'reduce', details: 'tranid: ' + soid + ' | rectype: ' + rectype});

            var finaltaxcode = '';

            if (!isEmpty(soid)) {
                var rec = record.load({type: rectype, id: soid, isDynamic: true});

                var ordermethod = rec.getValue({fieldId: 'custbody_sna_order_fulfillment_method'});

                if (ordermethod == willcall) {
                    finaltaxcode = avataxpos;
                }
                else if (ordermethod == ship) {
                    finaltaxcode = avatax;
                }

                log.debug({title: 'reduce', details: 'finaltaxcode: ' + finaltaxcode});

                if (!isEmpty(finaltaxcode)) {
                    rec.setValue({fieldId: 'shippingtaxcode', value: finaltaxcode});
                    rec.setValue({fieldId: 'custbody_sna_tax_processed', value: true});

                    var itmlines = rec.getLineCount({sublistId: 'item'});
                    for (var j = 0; j < itmlines; j++) {
                        rec.selectLine({sublistId: 'item', line: j});
                        rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: finaltaxcode});
                        rec.commitLine({sublistId: 'item'});
                    }

                    rec.save({ ignoreMandatoryFields:true});
                    log.debug({title: 'reduce', details: 'Tran updated: ' + soid + ' | finaltaxcode: ' + finaltaxcode});
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

        return {getInputData, reduce, summarize}

    });

/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * MR script to transform rental orders to invoices
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/8/20       		                 aduldulao       Initial version.
 * 2022/9/22       		                 aduldulao       Add config 2 checking
 * 2023/7/24                             aduldulao       Rental enhancements
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/runtime', 'N/error', 'N/email'],
    /**
 * @param{record} record
 */
    (record, runtime, error, email) => {

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

            var currscript = runtime.getCurrentScript();
            var curruser = currscript.getParameter({name: 'custscript_sna_current_user'});

            if (!isEmpty(curruser)) {
                var author = -5;
                var subject = 'Map/Reduce script ' + runtime.getCurrentScript().id + ' failed for stage: ' + stage;
                var body = 'An error occurred with the following information:\n' +
                    'Error code: ' + e.name + '\n' +
                    'Error msg: ' + e.message;

                email.send({author: author, recipients: curruser, subject: subject, body: body});
            }
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
            var currscript = runtime.getCurrentScript();
            var soids  =  currscript.getParameter({name: 'custscript_sna_rentalsoids'});
            var curruser  =  currscript.getParameter({name: 'custscript_sna_current_user'});
            log.debug({title: 'getInputData', details: 'soids: ' + soids + ' | curruser: ' + curruser});

            var arrselected = []
            if (!isEmpty(soids)) {
                arrselected = JSON.parse(soids);
            }

            return arrselected;
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
            var uniquepair = reduceContext.values;
            log.debug({title: 'reduce', details: 'uniquepair: ' + JSON.stringify(uniquepair)});

            var currscript = runtime.getCurrentScript();
            var aracct = currscript.getParameter({name: 'custscript_sna_ar_account'});
            log.debug({title: 'reduce', details: 'aracct: ' + aracct});

            var so = JSON.parse(uniquepair[0]);
            if (!isEmpty(so)) {
                // transform SO to invoice
                var rec = record.transform({fromType: record.Type.SALES_ORDER, fromId: so, toType: record.Type.INVOICE, isDynamic: true});
                rec.setValue({fieldId: 'account', value: aracct});

                var itemcount = rec.getLineCount({sublistId: 'item'});

                // UE ItemFulfillment should run
                /*for (var i = itemcount - 1; i >= 0; i--) {
                    var billdate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i});
                    var objconfig = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator', line: i});
                    var objconfig2 = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator_2', line: i});
                    var dummy = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dummy', line: i});

                    log.debug({title: 'onRequest', details: 'line: ' + i + ' | billdate: ' + billdate + ' | objconfig: ' + objconfig + ' | dummy: ' + dummy});

                    // only lines where it is not yet invoiced and Bill Date is <= the Date today will be included
                    if (dummy || objconfig.includes('"CONFIGURED":"F"') || objconfig2.includes('"CONFIGURED":"F"') || billdate > new Date()) {
                        rec.removeLine({sublistId: 'item', line: i});

                        log.debug({title: 'onRequest', details: 'removing line: ' + i});
                    }
                }*/

                var invid = rec.save();
                log.debug({title: 'onRequest', details: 'invoice created: ' + invid});
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
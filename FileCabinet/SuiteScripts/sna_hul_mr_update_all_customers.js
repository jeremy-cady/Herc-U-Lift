/*
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author cparba
 *
 * Script brief description:
 * This script updates all customers and triggers another MR script to update sales rep matrix for all customers
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/09/04       		             cparba          Initial version.
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/error', 'N/file', 'N/record', 'N/runtime', 'N/search', 'N/format', 'N/task'],
    /**
     * @param{error} error
     * @param{file} file
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{format} format
     * @param{task} task
     */
    (error, file, record, runtime, search, format, task) => {

        const getActiveDeployments = (stScriptId) => {
            let arrDeployments = [];

            if (!stScriptId) return [];

            let filters = [
                {name: 'scriptid', join: 'script', operator: 'is', values: stScriptId},
                {name: 'isdeployed', operator: 'is', values: true},
                {name: 'status', operator: 'anyof', values: 'NOTSCHEDULED'}
            ];

            let deploySearch = search.create({type: search.Type.SCRIPT_DEPLOYMENT, filters, columns: ['scriptid']});
            let deploySearchObj = getFullResultSet(deploySearch);

            for (let loop1 = 0; loop1 < deploySearchObj.length; loop1++) {
                arrDeployments.push({
                    id: deploySearchObj[loop1].id,
                    name: deploySearchObj[loop1].getValue({name: 'scriptid'})
                });
            }

            return arrDeployments;
        }

        const executeMR = (params) => {
            let scriptId = "customscript_sna_hul_mr_upd_matrix_oncus";
            let isSuccess = false, executeFlag = false;

            // Get all active deployments
            let arrDeployments = getActiveDeployments(scriptId);

            arrDeployments.forEach((deployment) => {
                if (!executeFlag) {
                    try {
                        var cacheKey = deployment.name;
                        var cacheVal = cache.getCache({
                            name: 'sna_hul_ue_sales_rep_matrix_config',
                            scope: cache.Scope.PUBLIC
                        }).get({key: cacheKey});
                        log.audit('Cache Details', 'cacheKey: ' + cacheKey + ', cacheVal: ' + cacheVal);

                        // Executing the code only when cacheVal value in not empty.
                        if (!isEmpty(cacheVal)) {
                            var taskStatus = task.checkStatus({taskId: cacheVal});
                            log.audit('cacheval not empty taskStatus', taskStatus);
                            // Executing the code only when the task status is returned.
                            if (!isEmpty(taskStatus)) {
                                // Executing the code only when the status is not Pending or Processing.
                                if (taskStatus.status !== task.TaskStatus.PENDING && taskStatus.status !== task.TaskStatus.PROCESSING) {
                                    executeFlag = true;
                                }
                            } else {
                                executeFlag = true;
                            }
                        } else {
                            executeFlag = true;
                        }

                        log.audit('After checking cache executeFlag', executeFlag);

                        // Executing the code when executeFlag is true.
                        if (executeFlag) {
                            log.audit('Calling Map Reduce Script', 'Processing Deployment: ' + cacheKey);

                            let taskSched = task.create({taskType: task.TaskType.MAP_REDUCE});
                            taskSched.scriptId = scriptId;
                            taskSched.deploymentId = cacheKey;
                            taskSched.params = params;

                            let taskSchedId = taskSched.submit();
                            let taskStatus = task.checkStatus(taskSchedId);
                            log.audit('Calling Map Reduce Script', 'Deployment Status: ' + taskStatus.status);
                            cache.getCache({
                                name: 'sna_hul_ue_sales_rep_matrix_config',
                                scope: cache.Scope.PUBLIC
                            }).put({key: cacheKey, value: taskSchedId});
                            isSuccess = true;
                        }

                    } catch (e) {
                        log.error('Error', e);
                    }
                }

                return true;
            });

            if (!isSuccess) {
                let randomId = '_sc_inv_' + new Date().getTime();

                let recDeployment = record.copy({type: 'scriptdeployment', id: arrDeployments[0].id, isDynamic: true});
                recDeployment.setValue({fieldId: 'scriptid', value: randomId});
                let deploymentId = recDeployment.save();
                log.audit({title: 'Calling Map Reduce Script', details: 'New deployment: ' + deploymentId});

                let taskSched = task.create({taskType: task.TaskType.MAP_REDUCE});
                taskSched.scriptId = scriptId;
                taskSched.deploymentId = 'customdeploy' + randomId;
                taskSched.params = params;

                let taskSchedId = taskSched.submit();
                let taskStatus = task.checkStatus(taskSchedId);
                log.audit('Calling Map Reduce Script', 'New Deployment Status: ' + taskStatus.status);

                if (taskStatus.status != task.TaskStatus.FAILED) {
                    log.audit('Calling Map Reduce Script', 'New Map Reduce Script has successfully been scheduled. ');
                }
            }
        }

        function getFullResultSet(mySearch) {
            var searchResults = [], pagedData;
            pagedData = mySearch.runPaged({pageSize: 1000});
            pagedData.pageRanges.forEach(function (pageRange) {
                var page = pagedData.fetch({index: pageRange.index});
                page.data.forEach(function (result) {
                    searchResults.push(result);
                });
            });
            return searchResults;
        }

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
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
            const stLoggerTitle = 'getInputData';
            let objCurrentScript = runtime.getCurrentScript();
            let objCustomerInternalId = [];
            let stCustomerIdArr = objCurrentScript.getParameter({name: 'custscript_sna_hul_customer_id'});
            log.debug({title: stLoggerTitle, details: {stCustomerIdArr} });

            if(!isEmpty(stCustomerIdArr)){
                objCustomerInternalId = JSON.parse(stCustomerIdArr);
            }

            log.debug({title: stLoggerTitle, details: `objCustomerInternalId: ${JSON.stringify(objCustomerInternalId)}`});
            log.debug({title: stLoggerTitle, details: `objCustomerInternalId length: ${objCustomerInternalId.length}`});

            let filters = [];

            if(objCustomerInternalId.length > 0){
                filters.push({name: "isinactive", operator: "is", values: "F"});
                filters.push({name: "internalid", operator: "anyof", values: objCustomerInternalId});

                log.debug({title: stLoggerTitle, details: `filters: ${JSON.stringify(filters)}`});
                return search.create({type: search.Type.CUSTOMER, filters: filters});
            }

            //return [];
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
            const stLoggerTitle = 'map';
            log.debug({title: stLoggerTitle, details: `mapContext: ${mapContext}`});
            log.debug({title: stLoggerTitle, details: `mapContext.key: ${mapContext.key}`});
            let customerRecord = record.load({
                type: record.Type.CUSTOMER,
                id: mapContext.key
            });
            customerRecord.save();
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
            const stLoggerTitle = 'summarize';
            /*executeMR({
                custscript_sna_sales_rep_global_resync: true,
            });*/
            log.debug({
                title: stLoggerTitle,
                details: `remaining usage unit: ${runtime.getCurrentScript().getRemainingUsage()}`
            });
        }

        return {getInputData, map, summarize}

    });

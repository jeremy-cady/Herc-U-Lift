/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Angelbert Palad
 *
 * Script brief description: Retrieves all the Script deployments that are set to NOTSCHEDULED
 * for a specific M/R Script and deletes them.
 *
 * Revision History:
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2025-11-06        Case Task#333934   apalad         Initial version
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/error', 'N/record', 'N/search'],
    /**
     * @param{error} error
     * @param{record} record
     * @param{search} search
     */
    (error, record, search) => {

        //SANDBOX
        //let DEPLOYMENT_EXCEPTION = "253707";
        //PROD
        let DEPLOYMENT_EXCEPTION = "1026";

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

            let stLoggerTitle = "getInputData";

            try {

                let arrDeployments = [];
                let arrFilters = [
                    {
                        name: 'scriptid',
                        join: 'script',
                        operator: 'is',
                        values: 'customscript_sna_hul_mr_upd_matrix_oncus'
                    },
                    {name: 'isdeployed', operator: 'is', values: true},
                    {name: 'status', operator: 'anyof', values: 'NOTSCHEDULED'}
                ];

                let deploySearch = search.create({
                    type: search.Type.SCRIPT_DEPLOYMENT,
                    filters: arrFilters,
                    columns: ['scriptid']
                });

                let searchResults = [], pagedData;
                pagedData = deploySearch.runPaged({pageSize: 1000});
                pagedData.pageRanges.forEach(function (pageRange) {
                    let page = pagedData.fetch({index: pageRange.index});
                    page.data.forEach(function (result) {
                        searchResults.push(result);
                    });
                });
                let deploySearchObj = searchResults;

                for (let intCounter = 0; intCounter < deploySearchObj.length; intCounter++) {
                    let intId = deploySearchObj[intCounter].id;
                    if(intId === DEPLOYMENT_EXCEPTION){
                        log.debug("Skipping Deployment", intId)
                    }else{
                        arrDeployments.push({
                            id: deploySearchObj[intCounter].id,
                            name: deploySearchObj[intCounter].getValue({
                                name: 'scriptid'
                            })
                        });
                    }
                }

                log.debug("arrDeployments length",arrDeployments.length)
                log.debug("arrDeployments",arrDeployments);
                return arrDeployments;

            } catch (e) {
                log.error({title: stLoggerTitle, details: `${e.name}: ${e.message}`});
                throw error.create({
                    name: e.name,
                    message: `ERROR - ${stLoggerTitle} : ${e.message}`,
                    notifyOff: false
                });
            }
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

            let stLoggerTitle = "map";

            try {

                var objParsedData = JSON.parse(mapContext.value);
                log.debug('objParsedData',objParsedData);

                let intId = objParsedData.id;
                //log.debug('intId',intId);

                let strName = objParsedData.name;
                //log.debug('strName',strName);

                record.delete({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: intId,
                });

                log.audit('Deleted Script Deployment', 'ID: ' + intId + ", Name: " + strName);

            } catch (e) {
                log.error({title: stLoggerTitle, details: `${e.name}: ${e.message}`});
                throw error.create({
                    name: e.name,
                    message: `ERROR - ${stLoggerTitle} : ${e.message}`,
                    notifyOff: false
                });
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

            try {
                let stType = summaryContext.toString();
                log.audit({
                    title: stLoggerTitle,
                    details: `${stType} Duration: ${summaryContext.seconds}
                | ${stType} Usage Consumed: ${summaryContext.usage}
                | ${stType} Number of Queues: ${summaryContext.concurrency}
                | ${stType} Number of Yields: ${summaryContext.yields}`
                });

                summaryContext.reduceSummary.errors.iterator().each(function (key, error) {
                    log.error('Reduce Error for key: ' + key, error);

                    return true;
                });

                let dtServerDate = new Date();
                log.audit({ title: stLoggerTitle, details: `>>EXIT<< | Server Date = ${dtServerDate}` });
            } catch (e) {
                log.error({ title: stLoggerTitle, details: `${e.name}: ${e.message}` });
                throw error.create({
                    name: e.name,
                    message: `ERROR - ${stLoggerTitle} : ${e.message}`,
                    notifyOff: false
                });
            }
        }

        return {getInputData, map, reduce, summarize}

    });

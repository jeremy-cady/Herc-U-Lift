/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author SNAImran
 *
 * Script brief description:
 * This Script is used update Service Bucket to Parts on Sales Order
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               	Issue Fix Summary
 * =============================================================================================
 * 11-11-2023                           SNAImran             	Initial version
 */
define(['N/record', 'N/runtime', 'N/search', './modules/sna_hul_mod_pd'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{workflow} workflow
     */
    (record, runtime, search, sna_hul_mod_pd) => {

        const FILE_NAME = 'sna_hul_mr_pd_esign_status';

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
            let searchId = runtime.getCurrentScript().getParameter({name: sna_hul_mod_pd.SCRIPT_PARAMETERS.PENDING_DOCUMENT_SEARCH });
            return search.load({id: searchId});
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
            try {
                let mapValues = JSON.parse(mapContext.value).values;

                const pdDocStatus = sna_hul_mod_pd.handlePdDocStatus(mapValues);
                log.debug({title: "map => pdDocStatus", details: pdDocStatus});

                log.debug({title: "pdDocStatus?.status", details: pdDocStatus?.status});
                sna_hul_mod_pd.updateDocStatusOnTransaction(mapValues, pdDocStatus);

                if(pdDocStatus?.status === 'document.completed') {
                    mapContext.write({
                        key: mapContext.key,
                        value: mapValues
                    });
                };
            } catch (error) {
                log.error({title: "Error", details: error});
            }
        };

        /**
         * @function reduce
         * @param reduceContext
         * @author Imran Khan
         */
        const reduce = (reduceContext) => {
            const logTitle = `${FILE_NAME} => reduce`;
            try {
                log.debug('reduceContext', reduceContext);
                sna_hul_mod_pd.getPDFSignedCopy(reduceContext);
            } catch (exp) {
                log.error({
                    title: logTitle,
                    details: exp
                })
            }
        };

        /**
         * @function summarize
         * @param summarizeContext
         * @author Imran Khan
         */
        const summarize = (summarizeContext) => {

        };

        return {getInputData, map, reduce, summarize }

    });
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Script is used update Service Bucket to Parts on Sales Order
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               	Issue Fix Summary
 * =============================================================================================
 * 10-14-2023                               Amol Jagkar             	Initial version
 */
define(['N/record', 'N/runtime', 'N/search', 'N/workflow'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{workflow} workflow
     */
    (record, runtime, search, workflow) => {

        const SERVICE_BUCKET = {
            PARTS: 1
        }

        const parseJSON = (data) => {
            if (typeof data == "string") data = JSON.parse(data);
            return data;
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
            let searchId = runtime.getCurrentScript().getParameter({name: "custscript_so_appr_fwd_bucket_search"});
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
                let mapValues = parseJSON(mapContext.value).values;
                log.debug({title: "mapValues", details: mapValues});

                let salesOrder = mapValues.custevent_nx_case_transaction.value;
                log.debug({title: "salesOrder", details: salesOrder});

                if (!!salesOrder) {
                    try {

                        // workflow.trigger({
                        //     recordType: record.Type.SALES_ORDER,
                        //     recordId: salesOrder,
                        //     workflowId: "customworkflow_sna_hul_so_approval",
                        //     actionId: 'workflowaction271'
                        // });
                        record.submitFields({
                            type: record.Type.SALES_ORDER, id: salesOrder, values: {
                                "custbody_sna_hul_service_bucket_": SERVICE_BUCKET.PARTS
                            }
                        });
                    } catch (error) {
                        record.load({
                            type: record.Type.SALES_ORDER, id: salesOrder
                        }).setValue({fieldId: "custbody_sna_hul_service_bucket_", value: SERVICE_BUCKET.PARTS}).save();
                    }

                    try {
                        workflow.trigger({
                            recordType: record.Type.SALES_ORDER,
                            recordId: salesOrder,
                            workflowId: "customworkflow_sna_hul_so_approval",
                            actionId: 'workflowaction271'
                        });
                    } catch (error) {
                        log.error({title: "Error", details: error});
                    }
                }
            } catch (error) {
                log.error({title: "Error", details: error});
            }
        }

        return {getInputData, map}

    });

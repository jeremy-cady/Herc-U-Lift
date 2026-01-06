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
 * This Script is used validate Purchase Orders created from Requisition Worksheet
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               	Issue Fix Summary
 * =============================================================================================
 * 12-15-2023                           Amol Jagkar             Initial version
 * 2024/03/21                           aduldulao               Related SO Line ID
 */
define(['N/record', 'N/search'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search) => {

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
            return search.create({
                type: search.Type.PURCHASE_ORDER,
                filters: [
                    {name: "custbody_sna_hul_validate_with_so", operator: "is", values: "T"},
                    //{name: "internalid", operator: "anyof", values: ["1486432", "1486433"]},
                    {name: "mainline", operator: "is", values: "T"}
                ]
            });
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
                let purchaseOrderId = mapContext.key, sublistId = "item", poDetails = [], salesOrderIds = [];
                log.debug({title: "purchaseOrderId", details: purchaseOrderId});

                let purchaseOrder = record.load({type: record.Type.PURCHASE_ORDER, id: purchaseOrderId});

                let vendor = purchaseOrder.getValue({fieldId: "custbody_sna_buy_from"})
                for (let line = 0; line < purchaseOrder.getLineCount({sublistId}); line++) {
                    let item = purchaseOrder.getSublistValue({sublistId, fieldId: "item", line});
                    let salesOrder = purchaseOrder.getSublistValue({sublistId, fieldId: "custcol_sna_linked_so", line});
                    let salesOrderLineId = purchaseOrder.getSublistValue({sublistId, fieldId: "custcol_sn_hul_so_line_id", line});
                    if (!salesOrderIds.includes(salesOrder) && !isEmpty(salesOrder)) salesOrderIds.push(salesOrder);
                    poDetails.push({item, vendor, salesOrder, salesOrderLineId});
                }

                log.debug({title: "poDetails", details: {poDetails, salesOrderIds}});

                salesOrderIds.forEach(salesOrderId => {
                    let salesOrder = record.load({type: record.Type.SALES_ORDER, id: salesOrderId}), flag = false;

                    for (let line = 0; line < salesOrder.getLineCount({sublistId}); line++) {
                        let lineId = salesOrder.getSublistValue({sublistId, fieldId: "line", line});
                        let item = salesOrder.getSublistValue({sublistId, fieldId: "item", line});
                        let poVendor = salesOrder.getSublistValue({
                            sublistId, fieldId: "custcol_sna_csi_povendor", line
                        });
                        let linkedPO = salesOrder.getSublistValue({
                            sublistId, fieldId: "custcol_sna_linked_po", line
                        });

                        let poDataIndex = poDetails.findIndex(element => element.item === item && element.vendor === poVendor && element.salesOrderLineId === lineId);

                        log.debug({title: "PO Search from SO", details: {item, poVendor, lineId, linkedPO, poDataIndex}});

                        if (poDataIndex !== -1 && isEmpty(linkedPO)) {
                            log.debug({title: "Setting Linked PO", details: line});

                            salesOrder.setSublistValue({
                                sublistId, fieldId: "custcol_sna_linked_po", value: purchaseOrderId, line
                            });
                            flag = true;
                        }
                    }

                    if (flag) salesOrder.save();
                });

                purchaseOrder.setValue({fieldId: "custbody_sna_hul_validate_with_so", value: false});
                purchaseOrder.save();
            } catch (error) {
                log.error({title: "Error", details: error});
            }
        }

        return {getInputData, map}

    });

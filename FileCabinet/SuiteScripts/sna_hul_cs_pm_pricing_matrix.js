/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Client script is attached to "SNA HUL SL PM Pricing Matrix"
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/02/24                           Amol Jagkar         Initial version
 *
 */
define(['N/currentRecord', 'N/search', 'N/url'],
    /**
     * @param{currentRecord} currentRecord
     * @param{search} search
     * @param{url} url
     */
    (currentRecord, search, url) => {

        const TAX_CODE = {
            NOT_TAXABLE: -8
        }

        const parseJSON = (data) => {
            if (typeof data == "string") return JSON.parse(data);
            return data;
        }

        const updatePage = (params) => {
            let stPriceMatrixURL = url.resolveScript({
                scriptId: "customscript_sna_hul_sl_pm_pricing_mtrix",
                deploymentId: "customdeploy_sna_hul_sl_pm_pricing_mtrix",
                params
            });

            window.onbeforeunload = null;
            window.document.location = stPriceMatrixURL;
        }

        const checkUrlParam = (id) => {
            return window.location.href.indexOf(id) != -1 && window.location.href.indexOf("rate") != -1;
        }

        const getDate = (dateStr) => {
            let dateArr = dateStr.split("-");
            let data = [dateArr[1], dateArr[2], dateArr[0]].join("/")
            let date = new Date(data);
            return date;
        }

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        const pageInit = (scriptContext) => {
            window.ischange = false;
            window.onbeforeunload = null;

            let currentRecordObj = currentRecord.get();

            if (!currentRecordObj.type) {
                let item = currentRecordObj.getValue({fieldId: "custpage_sna_item"});
                let quantity = currentRecordObj.getValue({fieldId: "custpage_sna_quantity"});
                let rate = currentRecordObj.getValue({fieldId: "custpage_sna_pm_rate"});
                if (!!item && !!quantity && !!rate)
                    submitLine();

                if (checkUrlParam("item") && !item)
                    alert("Please select an Item");
                if (checkUrlParam("quantity") && !quantity)
                    alert("Please enter a Quantity");
            }
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        const fieldChanged = (scriptContext) => {
            let currentRecord = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            let fieldId = scriptContext.fieldId;
            let line = scriptContext.line;

            if (sublistId == "item" && fieldId == "custcol_sna_select_item") {

                let customer = currentRecord.getValue({fieldId: "entity"});
                let tranDate = currentRecord.getText({fieldId: "trandate"});

                let stPriceMatrixURL = url.resolveScript({
                    scriptId: "customscript_sna_hul_sl_pm_pricing_mtrix",
                    deploymentId: "customdeploy_sna_hul_sl_pm_pricing_mtrix",
                    params: {customer, tranDate, line}
                });

                window.open(stPriceMatrixURL, "PM Price Matrix", 'width=1000,height=500').focus();
            }

            /*if (fieldId == "custbody_sna_pm_price_matrix_data") {
                let data = parseJSON(currentRecord.getValue({fieldId: "custbody_sna_pm_price_matrix_data"}));

                currentRecord.selectLine({sublistId: 'item', line: data.line});
                currentRecord.setCurrentSublistValue({
                    sublistId: "item", fieldId: "item", value: data.item
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: "item", fieldId: "custcol_sna_select_item", value: true
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: "item", fieldId: "quantity", value: data.quantity
                });
                currentRecord.setCurrentSublistValue({sublistId: "item", fieldId: "price", value: "-1"});
                currentRecord.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: data.rate});
            }*/

            if (sublistId == "item" && fieldId == "custcol_sna_pm_price_matrix_data") {
                let data = parseJSON(currentRecord.getCurrentSublistValue({
                    sublistId: "item", fieldId: "custcol_sna_pm_price_matrix_data"
                }));
                currentRecord.setCurrentSublistValue({
                    sublistId: "item", fieldId: "item", value: data.item
                });

                setTimeout(function () {
                    currentRecord.setCurrentSublistValue({sublistId: "item", fieldId: "price", value: -1});
                    currentRecord.setCurrentSublistValue({
                        sublistId: "item", fieldId: "quantity", value: data.quantity
                    });
                    currentRecord.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: data.rate});

                    currentRecord.setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_sna_select_item",
                        value: true,
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    });
                    console.log({data});
                }, 2000);
            }

            if (fieldId == "custpage_sna_item" || fieldId == "custpage_sna_geography" || fieldId == "custpage_sna_equipment_type" || fieldId == "custpage_sna_service_action" || fieldId == "custpage_sna_object" || fieldId == "custpage_sna_frequency" || fieldId == "custpage_sna_quantity") {
                let customer = currentRecord.getValue({fieldId: "custpage_sna_customer"});
                let tranDate = currentRecord.getValue({fieldId: "custpage_sna_trandate"});
                let zipCode = currentRecord.getValue({fieldId: "custpage_sna_geography"});
                let equipmentType = currentRecord.getValue({fieldId: "custpage_sna_equipment_type"});
                let serviceAction = currentRecord.getValue({fieldId: "custpage_sna_service_action"});
                let objectNo = currentRecord.getValue({fieldId: "custpage_sna_object"});
                let frequency = currentRecord.getValue({fieldId: "custpage_sna_frequency"});
                let item = currentRecord.getValue({fieldId: "custpage_sna_item"});
                let quantity = currentRecord.getValue({fieldId: "custpage_sna_quantity"});
                let line = currentRecord.getValue({fieldId: "custpage_sna_line"});

                updatePage({
                    customer, tranDate,//: getDate(tranDate.toISOString().split("T")[0]),
                    zipCode, equipmentType, serviceAction, objectNo, frequency,
                    item, quantity, line
                });
            }
        }

        const submitLine = () => {
            let currentRecordObj = currentRecord.get();
            if (window.opener) {
                let line = currentRecordObj.getValue({fieldId: "custpage_sna_line"});
                let item = currentRecordObj.getValue({fieldId: "custpage_sna_item"});
                let quantity = Number(currentRecordObj.getValue({fieldId: "custpage_sna_quantity"}));
                let rate = Number(currentRecordObj.getValue({fieldId: "custpage_sna_pm_rate"}));
                let data = {line, item, quantity, rate};

                // window.opener.nlapiSelectLineItem('item', line);
                //
                // window.opener.nlapiSetCurrentLineItemValue('item', 'custcol_sna_select_item', 'T');
                // window.opener.nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
                // window.opener.nlapiSetCurrentLineItemValue('item', 'quantity', quantity);
                // window.opener.nlapiSetCurrentLineItemValue('item', 'price', -1);
                // window.opener.nlapiSetCurrentLineItemValue('item', 'rate', rate);
                // // window.opener.nlapiSetCurrentLineItemValue('item', 'amount', quantity * rate, false, false);
                // window.opener.nlapiSetCurrentLineItemValue('item', 'taxcode', TAX_CODE.NOT_TAXABLE, false, false);
                // // window.opener.nlapiSetCurrentLineItemValue('item', 'taxcode', -8, false, false);
                //
                window.opener.nlapiSetCurrentLineItemValue('item', 'custcol_sna_pm_price_matrix_data', JSON.stringify(data));

                // window.opener.nlapiSetFieldValue("custbody_sna_pm_price_matrix_data", JSON.stringify(data));

            }

            window.ischange = false;
            window.onbeforeunload = null;
            window.close();
        }

        return {pageInit, fieldChanged, submitLine};

    });

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Client script attached to "SNA HUL SL Requisition Worksheet"
 *
 * Revision History:
 *
 * Date            Issue/Case        Author            Issue Fix Summary
 * =============================================================================================
 * 2022/06/20                    Amol Jagkar         Initial version
 * 2023/05/10                    aduldulao           Temporary items
 *
 */
define(['N/currentRecord', 'N/search', 'N/runtime', 'N/url', 'N/ui/message'],
    /**
     * @param{currentRecord} currentRecord
     * @param{search} search
     * @param{runtime} runtime
     * @param{url} url
     * @param{message} message
     */
    (currentRecord, search, runtime, url, message) => {

        let SHIPPING_METHOD = {
            TRANSFER: 92535
        }

        let tempitemcat = '';
        let allieditemcat = '';
        let rackingitemcat = '';
        let storageitemcat = '';
        let subletitemcat = '';

        const parseJSON = (data) => {
            if (typeof data == "string") return JSON.parse(data);
            return data;
        }

        const updateItemDetails = (currrec) => {
            let sublistId = "custpage_sna_itemdetails";
            let lineData = [], itemDetails = [];
            for (let line = 0; line < currrec.getLineCount({sublistId}); line++) {
                let item = currrec.getSublistValue({
                    sublistId, fieldId: "list_sna_item", line
                });
                let vendor = currrec.getSublistValue({
                    sublistId, fieldId: "list_sna_vendor", line
                });
                let quantity = currrec.getSublistValue({
                    sublistId, fieldId: "list_sna_quantity", line
                });

                let vendorItemIndex = itemDetails.findIndex(element => element.vendor == vendor && element.item == item);

                try {
                    if (currrec.getSublistValue({sublistId, fieldId: "list_sna_select", line})) {
                        lineData.push({line, item, vendor, quantity});

                        if (vendorItemIndex == -1)
                            itemDetails.push({vendor, item, quantity});
                        else if (vendorItemIndex != -1)
                            itemDetails[vendorItemIndex].quantity = itemDetails[vendorItemIndex].quantity + quantity;
                    }
                } catch (error) {
                }
            }

            currrec.setValue({fieldId: "custpage_sna_item_details", value: JSON.stringify(itemDetails)});
        }

        const updateRate = (currrec) => {
            let sublistId = "custpage_sna_itemdetails";
            let itemDetails = parseJSON(currrec.getValue({fieldId: "custpage_sna_item_details"}));
            let currentItem = currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_item"});

            for (let line = 0; line < currrec.getLineCount({sublistId}); line++) {
                let isSelected = currrec.getSublistValue({sublistId, fieldId: "list_sna_select", line});
                let item = currrec.getSublistValue({sublistId, fieldId: "list_sna_item", line});
                if (isSelected && currentItem == item) {
                    let vendor = currrec.getSublistValue({sublistId, fieldId: "list_sna_vendor", line});
                    let quantity = Number(currrec.getSublistValue({sublistId, fieldId: "list_sna_quantity", line}));
                    var lineitmcat = currrec.getSublistValue({sublistId, fieldId: "list_sna_item_category", line});

                    if (tempitemcat == lineitmcat || lineitmcat == allieditemcat || lineitmcat == rackingitemcat || lineitmcat == storageitemcat || lineitmcat == subletitemcat) continue;

                    let vendorItemIndex = itemDetails.findIndex(element => element.vendor == vendor && element.item == item);

                    let totalQuantity = itemDetails[vendorItemIndex].quantity;

                    let rateArray = JSON.parse(currrec.getCurrentSublistValue({
                        sublistId, fieldId: "list_sna_rate_array"
                    }) || "{}");

                    let rateObj;
                    if (!!rateArray.data)
                        rateObj = rateArray.data.find(element => element.itemId == item && element.vendorId == vendor);

                    if (!rateObj) rateObj = {basePrice: "", purchasePrice: "", quantityPrices: []};

                    let rate = rateObj.contractPrice || rateObj.basePrice || rateObj.purchasePrice || Number(currrec.getCurrentSublistValue({
                        sublistId,
                        fieldId: "list_sna_rate"
                    }));
                    if (!!rateObj) {
                        let rateA = rateObj.quantityPrices.filter(element => element.Quantity <= totalQuantity);
                        if (!!rateA[rateA.length - 1])
                            rate = rateA[rateA.length - 1].Price;
                    }

                    console.log("updateRate", {vendor, item, quantity, totalQuantity, line, rate, rateArray});

                    currrec.selectLine({sublistId, line});
                    currrec.setCurrentSublistValue({
                        sublistId, fieldId: "list_sna_rate", value: rate//, ignoreFieldChange: true
                    });
                    /*currrec.setCurrentSublistValue({
                        sublistId, fieldId: "list_sna_amount", value: quantity * rate, ignoreFieldChange: true
                    });*/
                }
            }
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
            var currentScript = runtime.getCurrentScript();

            tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
            subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});

            let url = new URL(window.location);

            document.getElementById("main_mh").style = "display:none!important";

            if (url.searchParams.has('purchaseOrders')) {
                let purchaseOrders = url.searchParams.get("purchaseOrders");
                console.log(purchaseOrders);
                let orders = getPurchaseOrders(purchaseOrders);
                let htmlMessage = `<ul style="list-style-type:disc">`;
                orders.forEach(element => {
                    htmlMessage += `<li><a href="${element.url}">Purchase Order #${element.documentNumber}</a></li>`;
                });
                htmlMessage += "</ul>";

                message.create({
                    title: "New Purchase Order(s) Created",
                    message: htmlMessage,
                    type: message.Type.CONFIRMATION
                }).show();
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
            let currrec = currentRecord.get();
            let sublistId = scriptContext.sublistId || "custpage_sna_itemdetails";
            let fieldId = scriptContext.fieldId;
            let line = scriptContext.line;

            console.log("Field Id", fieldId);


            if (fieldId == "custpage_sna_location") {
                fetchRecords();
            }

            if (fieldId == "custpage_sna_vendor") {
                let vendor = currrec.getValue({fieldId: "custpage_sna_vendor"});
                for (let i = 0; i < currrec.getLineCount({sublistId}); i++) {
                    currrec.selectLine({sublistId, fieldId: "list_sna_select", line: i});
                    if (currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_select"})) {
                        if (!currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_vendor"}))
                            currrec.setCurrentSublistValue({sublistId, fieldId: "list_sna_vendor", value: vendor});
                    }
                    currrec.commitLine({sublistId})
                }
            }

            if (fieldId == "custpage_sna_po_type") {
                let poType = currrec.getValue({fieldId: "custpage_sna_po_type"});
                for (let i = 0; i < currrec.getLineCount({sublistId}); i++) {
                    currrec.selectLine({sublistId, fieldId: "list_sna_select", line: i});
                    if (currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_select"})) {
                        if (!currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_potype"}))
                            currrec.setCurrentSublistValue({sublistId, fieldId: "list_sna_potype", value: poType});
                    }
                    currrec.commitLine({sublistId})
                }
            }

            if (fieldId == "list_sna_select") {
                let vendor = currrec.getValue({fieldId: "custpage_sna_vendor"});
                let currentLineVendor = currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_vendor"});

                if (!currentLineVendor && !isEmpty(vendor))
                    currrec.setCurrentSublistValue({sublistId, fieldId: "list_sna_vendor", value: vendor});

                if (!currentLineVendor) {
                    alert("Please select Vendor!");
                    return;
                }

                updateItemDetails(currrec);
                updateRate(currrec);
            }

            // if (sublistId == "custpage_sna_itemdetails" && (fieldId == "list_sna_quantity" || fieldId == "list_sna_rate") || fieldId == "list_sna_vendor") {
            if (sublistId == "custpage_sna_itemdetails" && fieldId == "list_sna_quantity" || fieldId == "list_sna_vendor") {
                updateItemDetails(currrec);
                updateRate(currrec);
            }

            if (sublistId == "custpage_sna_itemdetails" && fieldId == "list_sna_rate") {
                let quantity = Number(currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_quantity"}));
                let rate = Number(currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_rate"}));

                currrec.setCurrentSublistValue({
                    sublistId, fieldId: "list_sna_amount", value: quantity * rate, ignoreFieldChange: true
                });
            }

            if (sublistId == "custpage_sna_itemdetails" && fieldId == "list_sna_vendor") {
                let item = currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_item_id"});
                let vendor = currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_vendor"});

                currrec.setCurrentSublistValue({
                    sublistId, fieldId: "list_sna_vendor_item_name", value: getVendorItemName(item, vendor)
                });
            }
        }


        const validateField = (scriptContext) => {
            let currrec = currentRecord.get();
            if (scriptContext.fieldId == "custpage_sna_shipping_method") {
                let shippingMethod = currrec.getValue({fieldId: "custpage_sna_shipping_method"});
                let shippingMethodTransfer = currrec.getValue({fieldId: "custpage_sna_shipmethod_transfer"});

                SHIPPING_METHOD.TRANSFER = shippingMethodTransfer;//runtime.getCurrentScript().getParameter({name: 'custscript_rw_shipping_method_transfer'});

                if (shippingMethod == SHIPPING_METHOD.TRANSFER) {
                    alert("Shipping Method: Transfer is not allowed! Please select different shipping method.");
                    return false;
                }
            }
            return true;
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        const saveRecord = (scriptContext) => {
            let currrec = currentRecord.get();
            let sublistId = "custpage_sna_itemdetails";
            for (let i = 0; i < currrec.getLineCount({sublistId}); i++) {
                currrec.selectLine({sublistId, fieldId: "list_sna_select", line: i});
                if (currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_select"})) {
                    if (!currrec.getCurrentSublistValue({sublistId, fieldId: "list_sna_vendor"})) {
                        alert(`Please select Vendor on line: ${i + 1}`);
                        return false;
                    }
                }
                currrec.commitLine({sublistId})
            }
            return true;
        }

        const getVendorItemName = (item, vendor) => {
            let response = "";
            search.create({
                type: "customrecord_sna_hul_vendorprice",
                filters: [
                    {name: "custrecord_sna_hul_item", operator: "anyof", values: item},
                    {name: "custrecord_sna_hul_vendor", operator: "anyof", values: vendor}
                ],
                columns: [
                    search.createColumn({name: "custrecord_sna_vendor_item_name2", label: "Vendor Item Name 2"})
                ]
            }).run().each(function (result) {
                response = result.getValue("custrecord_sna_vendor_item_name2");
                return true;
            });
            console.log("getVendorItemName", response);
            return response;
        }

        const getDate = (date) => {
            console.log(date);
            let data = date.toISOString().split("T")[0]
            let dataArray = data.split("-");
            return `${dataArray[1]}/${dataArray[2]}/${dataArray[0]}`
        }

        const getPurchaseOrders = (purchaseOrders) => {
            let response = [];

            if (!purchaseOrders) return response;

            search.create({
                type: search.Type.PURCHASE_ORDER,
                filters: [
                    {name: "internalid", operator: "anyof", values: purchaseOrders.split(",")},
                    {name: "mainline", operator: "is", values: "T"}
                ],
                columns: "tranid"
            }).run().each(result => {
                response.push({
                    internalId: result.id,
                    documentNumber: result.getValue({name: "tranid"}),
                    url: url.resolveRecord({recordType: 'purchaseorder', recordId: result.id})
                });
                return true;
            });

            return response;
        }

        const fetchRecords = () => {
            let currrec = currentRecord.get();
            /*let customer = currrec.getValue({fieldId: 'custpage_sna_customer'});
            let fromDate = currrec.getValue({fieldId: 'custpage_sna_from_date'});
            let toDate = currrec.getValue({fieldId: 'custpage_sna_to_date'});*/
            let location = currrec.getValue({fieldId: 'custpage_sna_location'});
            let department = currrec.getValue({fieldId: 'custpage_sna_department'});
            let vendor = currrec.getValue({fieldId: 'custpage_sna_vendor'});
            let items = currrec.getValue({fieldId: 'custpage_sna_item'});
            let salesOrders = currrec.getValue({fieldId: 'custpage_sna_sales_order'});
            let shippingMethod = currrec.getValue({fieldId: 'custpage_sna_shipping_method'});

            /*console.log(JSON.stringify({customer, fromdate: getDate(fromDate), todate: getDate(toDate), salesOrders}));

            if (!!fromDate && !toDate) {
                alert('Please select to date');
                return;
            }*/

            console.log({location, vendor, items: items.join(","), salesorders: salesOrders.join(",")});

            let scriptUrl = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_req_worksheet',
                deploymentId: 'customdeploy_sna_hul_sl_req_worksheet',
                params: {
                    /*customer, fromdate: getDate(fromDate), todate: getDate(toDate),*/
                    location, department, vendor,
                    items: items.join(","),
                    salesorders: salesOrders.join(","),
                    shippingmethod: shippingMethod
                }
            });

            // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
            window.onbeforeunload = null;
            window.document.location = scriptUrl;
        }

        const selectAll = () => {
            let currrec = currentRecord.get();
            let flag = true;
            for (let i = 0; i < currrec.getLineCount({sublistId: "custpage_sna_itemdetails"}); i++) {
                currrec.selectLine({sublistId: "custpage_sna_itemdetails", fieldId: "list_sna_select", line: i});
                if (i == 0)
                    flag = !currrec.getCurrentSublistValue({
                        sublistId: "custpage_sna_itemdetails",
                        fieldId: "list_sna_select"
                    });
                currrec.setCurrentSublistValue({
                    sublistId: "custpage_sna_itemdetails",
                    fieldId: "list_sna_select",
                    value: flag
                });
                currrec.commitLine({sublistId: "custpage_sna_itemdetails"})
            }
        }

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {pageInit, fieldChanged, validateField, saveRecord, fetchRecords, selectAll};

    });
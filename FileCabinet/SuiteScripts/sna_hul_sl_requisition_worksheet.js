/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Suitelet script creates Ui for Requisition Worksheet
 *
 * Revision History:
 *
 * Date            Issue/Case        Author            Issue Fix Summary
 * =============================================================================================
 * 2022/06/20                    Amol Jagkar         Initial version
 * 2023/05/10                    aduldulao           Temporary items
 * 2024/03/21                    aduldulao           Related SO Line ID
 *
 */
define(['N/record', 'N/runtime', 'N/search', 'N/url', 'N/redirect', 'N/ui/serverWidget', "N/query"],
    /**
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} ui
     */
    (record, runtime, search, url, redirect, ui, query) => {

        let itemRates = [];
        let itemDetails = [];
        let locationArray = [];
        let itemsOnOrder = [];

        const SHIPPING_METHOD = {
            TRANSFER: 98430
        }

        const parseJSON = (data) => {
            if (typeof data == "string") return JSON.parse(data);
            return data;
        }

        const getItemRatesData = (items) => {
            if (isEmpty(items)) itemRates = [];
            search.create({
                type: "customrecord_sna_hul_vendorprice",
                filters: [
                    {name: "custrecord_sna_hul_item", operator: "anyof", values: items}
                ],
                columns: [
                    search.createColumn({name: "custrecord_sna_hul_item", label: "Item"}),
                    search.createColumn({name: "custrecord_sna_hul_vendor", label: "Vendor"}),
                    search.createColumn({name: "custrecord_sna_hul_itempurchaseprice", label: "Item Purchase Price"}),
                    search.createColumn({name: "custrecord_sna_hul_contractprice", label: "Contract Price"}),
                    search.createColumn({name: "custrecord_sna_hul_qtybreakprices", label: "Quantity Break Prices"}),
                    search.createColumn({name: "custrecord_sna_vendor_item_name2", label: "Vendor Item Name 2"})
                ]
            }).run().each(function (result) {
                //Start --- Added by Care P
                let isArray = false;
                let quantityPrice = result.getValue("custrecord_sna_hul_qtybreakprices");

                if(!isEmpty(quantityPrice)) {
                    if (quantityPrice instanceof Object && quantityPrice instanceof Array) {
                        isArray = true;
                    }
                    if (isArray == false) {
                        quantityPrice = parseJSON(`[${quantityPrice.toString()}]`);
                    }
                } else {
                    quantityPrice = [];
                }
                //End --- Added by Care P
                itemRates.push({
                    itemId: result.getValue("custrecord_sna_hul_item"),
                    vendorId: result.getValue("custrecord_sna_hul_vendor"),
                    price: result.getValue("custrecord_sna_hul_itempurchaseprice"),
                    contractPrice: result.getValue("custrecord_sna_hul_contractprice"),
                    quantityPrices: quantityPrice, //Updated by Care P
                    //quantityPrices: parseJSON(result.getValue("custrecord_sna_hul_qtybreakprices") || "[]"), //Updated by Care P
                    vendorItemName: result.getValue("custrecord_sna_vendor_item_name2")
                });
                return true;
            });
        }

        const getItemRates = (itemId) => {
            let response = [];

            if (!isEmpty(itemRates))
                response = itemRates.filter(element => element.itemId == itemId);

            /*if (response.length == 0) {
                search.create({
                    type: "customrecord_sna_hul_vendorprice",
                    filters: [
                        {name: "custrecord_sna_hul_item", operator: "anyof", values: itemId}
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_sna_hul_vendor", label: "Vendor"
                        }),
                        search.createColumn({
                            name: "custrecord_sna_hul_itempurchaseprice", label: "Item Purchase Price"
                        }),
                        search.createColumn({
                            name: "custrecord_sna_hul_contractprice", label: "Contract Price"
                        }),
                        search.createColumn({
                            name: "custrecord_sna_hul_qtybreakprices", label: "Quantity Break Prices"
                        }),
                        search.createColumn({
                            name: "custrecord_sna_vendor_item_name2", label: "Vendor Item Name 2"
                        })
                    ]
                }).run().each(function (result) {
                    itemRates.push({
                        itemId, vendorId: result.getValue("custrecord_sna_hul_vendor"),
                        price: result.getValue("custrecord_sna_hul_itempurchaseprice"),
                        contractPrice: result.getValue("custrecord_sna_hul_contractprice"),
                        quantityPrices: parseJSON(result.getValue("custrecord_sna_hul_qtybreakprices") || "[]"),
                        vendorItemName: result.getValue("custrecord_sna_vendor_item_name2")
                    });
                    return true;
                });
                response = itemRates.filter(element => element.itemId == itemId);
            }*/

            return response;
        }

        const getVendors = () => {
            let response = [{value: "", text: "", isSelected: false, items: []}];
            search.create({
                type: "customrecord_sna_hul_vendorprice",
                filters: [
                    // {name: "custrecord_sna_hul_primaryvendor", operator: "is", values: "T"}
                ],
                columns: [
                    search.createColumn({name: "custrecord_sna_hul_vendor", summary: "GROUP", label: "Vendor"}),
                    /*search.createColumn({name: "custrecord_sna_hul_item", summary: "GROUP", label: "Item"}),
                    search.createColumn({
                        name: "custrecord_sna_hul_primaryvendor", summary: "GROUP", label: "Primary Vendor"
                    })*/
                ]
            }).run().each(function (result) {
                let value = result.getValue({name: "custrecord_sna_hul_vendor", summary: "GROUP"});
                let text = result.getText({name: "custrecord_sna_hul_vendor", summary: "GROUP"});
                let isSelected = result.getValue({name: "custrecord_sna_hul_primaryvendor", summary: "GROUP"});
                let index = response.findIndex(element => element.value == value && element.text == text);
                if (index == -1) {
                    response.push({value, text, isSelected, items: []});
                    index = response.length - 1;
                }

                // response[index].items.push(result.getValue({name: "custrecord_sna_hul_item", summary: "GROUP"}));
                return true;
            });
            return response;
        }

        const getAllSearchResults = (resultSet) => {
            let batch, batchResults, results = [], searchStart = 0;
            do {
                batch = resultSet.getRange({start: searchStart, end: searchStart + 1000});
                batchResults = (batch || []).map(function (row) {
                    searchStart++;
                    return row;
                }, this);
                results = results.concat(batchResults);
            } while ((batchResults || []).length === 1000);

            return results;
        }

        const getPrimaryVendors = (items) => {
            let response = [{value: "", text: "", items: []}];

            if (isEmpty(items)) return response;

            search.create({
                type: "customrecord_sna_hul_vendorprice",
                filters: [
                    {name: "custrecord_sna_hul_item", operator: "anyof", values: items}
                ],
                columns: [
                    search.createColumn({name: "custrecord_sna_hul_item", summary: "GROUP", label: "Item"}),
                    search.createColumn({name: "custrecord_sna_hul_vendor", summary: "GROUP", label: "Vendor"}),
                    search.createColumn({
                        name: "custrecord_sna_hul_primaryvendor", summary: "GROUP", label: "Primary Vendor"
                    })
                ]
            }).run().each(result => {
                let value = result.getValue({name: "custrecord_sna_hul_vendor", summary: "GROUP"});
                let text = result.getText({name: "custrecord_sna_hul_vendor", summary: "GROUP"});
                let item = result.getValue({name: "custrecord_sna_hul_item", summary: "GROUP"});
                let isPrimary = result.getValue({name: "custrecord_sna_hul_primaryvendor", summary: "GROUP"});
                response.push({value, text, item, isPrimary});
                return true;
            });
            return response;
        }

        const checkSOCreatedPO = (salesOrders) => {
            let response = [];
            if (salesOrders.length == 0) return response;

            let sql = ` SELECT createdPo, item, transactionLine.id, transaction.Id FROM transaction
                        INNER JOIN transactionLine ON transaction.id = transactionLine.transaction
                        WHERE transaction.id IN (${salesOrders.join(",")}) AND TAXLINE = 'F' and item is not null`;

            let resultIterator = query.runSuiteQLPaged({query: sql, pageSize: 1000}).iterator();

            resultIterator.each(function (page) {
                let pageIterator = page.value.data.iterator();
                pageIterator.each(function (row) {
                    response.push({
                        createdPo: row.value.getValue(0),
                        item: row.value.getValue(1),
                        line: row.value.getValue(2),
                        salesOrder: row.value.getValue(3),
                    });
                    return true;
                });
                return true;
            });

            return response;
        }

        const getParentLocation = (location) => {
            let parentLocation = record.load({type: "location", id: location}).getValue("parent");
            if (isEmpty(parentLocation)) return location;
            else return parentLocation;
        }

        const checkDuplicateObject = (dataArray, object) => {
            return dataArray.findIndex(element =>
                element.item_line == object.item_line &&
                element.location == object.location &&
                element.department == object.department &&
                element.item == object.item &&
                element.item_id == object.item_id &&
                element.item_description == object.item_description &&
                element.item_category == object.item_category &&
                // element.vendor == object.vendor &&
                element.units == object.units &&
                element.available == object.available &&
                element.back_ordered == object.back_ordered &&
                element.on_order == object.on_order &&
                element.reorder_point == object.reorder_point &&
                element.quantity == object.quantity &&
                // element.rate == object.rate &&
                // element.rate_array == object.rate_array &&
                // element.vendor_item_name == object.vendor_item_name &&
                // element.amount == object.amount &&
                // element.customer == object.customer &&
                element.sales_order == object.sales_order
            );
        }

        const getParentVendor = (vendor) => {
            if (!!vendor) {
                let objVendor = search.lookupFields({
                    type: search.Type.VENDOR,
                    id: vendor,
                    columns: ['custentity_sna_parent_vendor']
                }).custentity_sna_parent_vendor;

                if (!isEmpty(objVendor[0]))
                    return objVendor[0].value;
            }
            return "";
        }

        const getItemsOnOrder = () => {
            let response = [];

            search.create({
                type: search.Type.PURCHASE_ORDER,
                /*filters: [
                    {name: "type", operator: "anyof", values: "PurchOrd"},
                    {name: "mainline", operator: "is", values: "F"},
                    {name: "custcol_sna_linked_so", operator: "noneof", values: "@NONE@"},
                    {
                        name: "status",
                        operator: "anyof",
                        values: ["PurchOrd:A", "PurchOrd:B", "PurchOrd:D", "PurchOrd:E"]
                    }
                ],*/
                filters: [
                    ["type", "anyof", "PurchOrd"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["custcol_sna_linked_so", "anyof", "@NONE@"],
                    "AND",
                    ["status", "anyof", "PurchOrd:A", "PurchOrd:B", "PurchOrd:D", "PurchOrd:E"]
                ],
                columns: [
                    search.createColumn({name: "location", summary: "GROUP", label: "Location"}),
                    search.createColumn({name: "item", summary: "GROUP", label: "Item"}),
                    search.createColumn({name: "quantity", summary: "SUM", label: "Quantity"}),
                    search.createColumn({
                        name: "quantityshiprecv",
                        summary: "SUM",
                        label: "Quantity Fulfilled/Received"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "{quantity} - {quantityshiprecv}",
                        label: "Formula (Numeric)"
                    })
                ]
            }).run().each(function (result) {
                response.push({
                    location: Number(result.getValue({name: "location", summary: "GROUP"})),
                    item: result.getValue({name: "item", summary: "GROUP"}),
                    quantity: Number(result.getValue({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "{quantity} - {quantityshiprecv}"
                    })),
                })
                return true;
            });

            return response;
        }

        const getReorderItems = (itemFilters) => {
            let response = [];
            let itemSearch = search.create({
                type: search.Type.ITEM,
                filters: itemFilters,
                columns: [
                    "inventorylocation", "department", "internalid", "displayname", "salesdescription", "custitem_sna_hul_itemcategory",
                    search.createColumn({name: "custrecord_sna_hul_vendor", join: "CUSTRECORD_SNA_HUL_ITEM"}),
                    search.createColumn({
                        name: "custrecord_sna_hul_primaryvendor",
                        join: "CUSTRECORD_SNA_HUL_ITEM",
                        sort: search.Sort.DESC
                    }),
                    "locationreorderpoint", "locationquantityavailable", "locationquantitybackordered", "locationquantityonhand", "locationquantityonorder",
                    "baseprice", "lastpurchaseprice"
                ]
            }).run();

            let resultSets = getAllSearchResults(itemSearch);

            for (let i = 0; i < resultSets.length; i++) {
                let result = resultSets[i];
                let available = Number(result.getValue({name: "locationquantityavailable"}) || 0);
                let reorderQuantity = Number(result.getValue({name: "locationreorderpoint"}) || 0);
                let item = result.getValue({name: "internalid"});
                let locationValue = locationArray.find(element => element.id == result.getValue({name: "inventorylocation"}));

                let onOrder = 0
                try {
                    onOrder = itemsOnOrder.find(element => Number(element.item) == Number(item) && Number(element.location) == (locationValue.parent || locationValue.id)).quantity;
                } catch (e) {
                }

                if (reorderQuantity - available - onOrder > 0) {
                    if (!response.includes(item)) response.push(item);
                }
            }

            return response;
        }

        const getSalesOrderItems = (soFilters) => {
            let response = [];
            search.create({
                type: search.Type.SALES_ORDER,
                filters: soFilters,
                columns: [
                    "line", "location", "department", /*"class",*/ "item", "custcol_sna_hul_item_category", "custcol_sna_hul_vendor_name",
                    "docunit", "quantity", "custbody_fam_specdeprjrn_rate", "amount", "entity", "tranid", "trandate", "custcol_sna_hul_ship_meth_vendor",
                    search.createColumn({name: "salesdescription", join: "item"}),
                    search.createColumn({name: "vendor", join: "item"}),
                    search.createColumn({name: "reorderpoint", join: "item"}),
                    search.createColumn({name: "locationquantityavailable", join: "item"}),
                    search.createColumn({name: "locationquantitycommitted", join: "item"}),
                    search.createColumn({name: "locationquantitybackordered", join: "item"}),
                    search.createColumn({name: "locationquantityonorder", join: "item"}),
                    search.createColumn({name: "locationquantityonhand", join: "item"}),
                    search.createColumn({name: "locationreorderpoint", join: "item"}),
                ]
            }).run().each(function (result) {
                if (!response.includes(result.getValue("item")))
                    response.push(result.getValue("item"));
                return true;
            });
            return response;
        }

        const getSalesOrderLoc = (soIds) => {
            let response = [];
            search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    {name: "internalid", operator: "anyof", values: soIds},
                    {name: "mainline", operator: "is", values: "T"}
                ],
                columns: [
                    "location"
                ]
            }).run().each(function (result) {
                response[result.id] = result.getValue("location");

                return true;
            });
            return response;
        }

        const getPOTranId = (id) => {
            return search.lookupFields({type: search.Type.TRANSACTION, id, columns: ["tranid"]}).tranid;
        }

        class RequisitionWorksheet {
            constructor(params) {
                this.params = params;
                // this.salesOrders = this.getSalesOrders();
                if (params.method == "GET")
                    this.results = this.fetchResults();
            }

            createUi() {
                let form = ui.createForm({title: 'Requisition Worksheet'});

                form.clientScriptFileId = getClientScriptFileId();

                // form.addFieldGroup({id: 'custpage_sna_filters', label: 'Filters'});
                // form.addFieldGroup({id: 'custpage_sna_default_values', label: 'Default Values'});

                // Body Fields
                /*
                // Customer
                let bodyCustomer = form.addField({
                    id: 'custpage_sna_customer',
                    type: ui.FieldType.SELECT,
                    source: 'customer',
                    label: 'Customer'
                });

                // From Date
                let bodyFromDate = form.addField({
                    id: 'custpage_sna_from_date',
                    type: ui.FieldType.DATE,
                    label: 'From Date'
                });
                if (!!this.params["fromdate"])
                    bodyFromDate.defaultValue = new Date(this.params["fromdate"]);

                // To Date
                let bodyToDate = form.addField({
                    id: 'custpage_sna_to_date',
                    type: ui.FieldType.DATE,
                    label: 'To Date'
                });
                if (!!this.params["todate"])
                    bodyToDate.defaultValue = new Date(this.params["todate"]);
                */

                // Location
                let bodyLocation = form.addField({
                    id: 'custpage_sna_location',
                    type: ui.FieldType.SELECT,
                    source: 'location',
                    label: 'Location',
                    // container: 'custpage_sna_filters'
                });
                if (!!this.params["location"])
                    bodyLocation.defaultValue = this.params["location"];
                /*else if (!!runtime.getCurrentUser().location) {
                    let location = runtime.getCurrentUser().location;
                    this.params["location"] = location;
                    bodyLocation.defaultValue = location;
                }*/
                bodyLocation.isMandatory = true;

                // Department
                let bodyDepartment = form.addField({
                    id: 'custpage_sna_department',
                    type: ui.FieldType.SELECT,
                    source: 'department',
                    label: 'Department',
                    // container: 'custpage_sna_filters'
                });
                if (!!this.params["department"])
                    bodyDepartment.defaultValue = this.params["department"];
                bodyDepartment.isMandatory = true;

                // Vendor
                let bodyVendor = form.addField({
                    id: 'custpage_sna_vendor',
                    type: ui.FieldType.SELECT,
                    // source: 'vendor',
                    label: 'Vendor',
                    // container: 'custpage_sna_default_values'
                });
                getVendors().forEach(option => {
                    option.isSelected = false;
                    bodyVendor.addSelectOption(option);
                });
                if (!!this.params["vendor"])
                    bodyVendor.defaultValue = this.params["vendor"];

                // Item
                let bodyItem = form.addField({
                    id: 'custpage_sna_item',
                    type: ui.FieldType.MULTISELECT,
                    source: 'item',
                    label: 'Item',
                    // container: 'custpage_sna_filters'
                });
                if (this.params.hasOwnProperty("items") && this.params["items"].split(",").length != 0 && !!this.params["items"][0])
                    bodyItem.defaultValue = this.params["items"].split(",");

                // Sales Order MultiSelect
                let bodySalesOrder = form.addField({
                    id: 'custpage_sna_sales_order',
                    type: ui.FieldType.MULTISELECT,
                    source: 'salesorder',
                    label: 'Sales Order',
                    // container: 'custpage_sna_filters'
                });
                // this.salesOrders.orders.forEach(element => {
                //     bodySalesOrder.addSelectOption({value: element.value, text: `Sales Order #${element.text}`});
                // });
                if (this.params.hasOwnProperty("salesorders") && this.params["salesorders"].split(",").length != 0 && !!this.params["salesorders"][0])
                    bodySalesOrder.defaultValue = this.params["salesorders"].split(",");

                // Purchase Order Type
                let bodyPurchaseOrderType = form.addField({
                    id: 'custpage_sna_po_type',
                    type: ui.FieldType.SELECT,
                    source: 'customlist_po_type_list',
                    label: 'Purchase Order Type',
                    // container: 'custpage_sna_default_values'
                });

                // Shipping Method
                let bodyShippingMethod = form.addField({
                    id: 'custpage_sna_shipping_method',
                    type: ui.FieldType.SELECT,
                    source: -192,//'shipmethod',
                    label: 'Shipping Method',
                    // container: 'custpage_sna_default_values'
                });
                bodyShippingMethod.defaultValue = this.params["shippingmethod"];

                // Employee
                let bodyEmployee = form.addField({
                    id: 'custpage_sna_employee',
                    type: ui.FieldType.TEXT,
                    label: 'Employee'
                });
                bodyEmployee.defaultValue = runtime.getCurrentUser().id;
                bodyEmployee.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Item Rates
                let bodyItemRates = form.addField({
                    id: 'custpage_sna_item_rates',
                    type: ui.FieldType.LONGTEXT,
                    label: 'Item Rates'
                });
                bodyItemRates.defaultValue = JSON.stringify(itemRates);
                bodyItemRates.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Item Details
                let bodyItemDetails = form.addField({
                    id: 'custpage_sna_item_details',
                    type: ui.FieldType.LONGTEXT,
                    label: 'Item Details'
                });
                bodyItemDetails.defaultValue = JSON.stringify(itemDetails);
                bodyItemDetails.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Item Details
                let bodyShippingMethodTransfer = form.addField({
                    id: 'custpage_sna_shipmethod_transfer',
                    type: ui.FieldType.TEXT,
                    label: 'Shipping Method (Transfer)'
                });
                bodyShippingMethodTransfer.defaultValue = SHIPPING_METHOD.TRANSFER;
                bodyShippingMethodTransfer.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Sublist Fields
                let sublistData = form.addSublist({
                    id: 'custpage_sna_itemdetails',
                    type: ui.SublistType.LIST,
                    label: ' '
                });

                // Select
                sublistData.addField({
                    id: 'list_sna_select',
                    type: ui.FieldType.CHECKBOX,
                    label: 'Select',
                });

                // Line #
                sublistData.addField({
                    id: 'list_sna_line',
                    type: ui.FieldType.TEXT,
                    label: 'Line #'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Line Id
                sublistData.addField({
                    id: 'list_sna_item_line',
                    type: ui.FieldType.TEXT,
                    label: 'Line Id'
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Location
                sublistData.addField({
                    id: 'list_sna_location',
                    type: ui.FieldType.SELECT,
                    label: 'Location',
                    source: 'location'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Department
                sublistData.addField({
                    id: 'list_sna_department',
                    type: ui.FieldType.SELECT,
                    label: 'Department',
                    source: 'department'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Sub-location
                sublistData.addField({
                    id: 'list_sna_sub_location',
                    type: ui.FieldType.SELECT,
                    label: 'Sub-location',
                    source: 'location'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Class
                /*sublistData.addField({
                    id: 'list_sna_class',
                    type: ui.FieldType.SELECT,
                    label: 'Class',
                    source: 'class'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});*/

                // Item Id
                sublistData.addField({
                    id: 'list_sna_item_id',
                    type: ui.FieldType.TEXT,
                    label: 'Item',
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Item
                sublistData.addField({
                    id: 'list_sna_item',
                    type: ui.FieldType.SELECT,
                    label: 'Item',
                    source: 'item'
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Item Link
                sublistData.addField({
                    id: 'list_sna_item_link',
                    type: ui.FieldType.TEXT,
                    label: 'Item',
                    source: 'item'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Item Description
                sublistData.addField({
                    id: 'list_sna_item_description',
                    type: ui.FieldType.TEXT,
                    label: 'Item Description'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Temporary Item Memo
                sublistData.addField({
                    id: 'list_sna_tempitem_memo',
                    type: ui.FieldType.TEXT,
                    label: 'Temporary Item Memo'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE}); // hidden

                // Temporary Item Code
                sublistData.addField({
                    id: 'list_sna_tempitem_tempcode',
                    type: ui.FieldType.TEXT,
                    label: 'Temporary Item Code'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE}); // hidden

                // Vendor Item Code
                sublistData.addField({
                    id: 'list_sna_tempitem_vendorcode',
                    type: ui.FieldType.TEXT,
                    label: 'Vendor Item Code'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE}); // hidden

                // Item Category
                sublistData.addField({
                    id: 'list_sna_item_category',
                    type: ui.FieldType.SELECT,
                    label: 'Category',
                    source: 'customrecord_sna_hul_itemcategory'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Vendor
                let sublistVendor = sublistData.addField({
                    id: 'list_sna_vendor',
                    type: ui.FieldType.SELECT,
                    label: 'Vendor',
                    source: 'vendor'
                });
                /*getPrimaryVendors().forEach(option => {
                    sublistVendor.addSelectOption(option);
                });*/

                // Purchase Order Type
                sublistData.addField({
                    id: 'list_sna_potype',
                    type: ui.FieldType.SELECT,
                    label: 'Purchase Order Type',
                    source: 'customlist_po_type_list'
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                sublistData.addField({
                    id: 'list_sna_shipping_method',
                    type: ui.FieldType.SELECT,
                    label: 'Shipping Method',
                    source: -192,//'shippingmethod'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Units
                sublistData.addField({
                    id: 'list_sna_units',
                    type: ui.FieldType.INTEGER,
                    label: 'Units',
                });

                // Sales Order Date
                sublistData.addField({
                    id: 'list_sna_sales_order_date',
                    type: ui.FieldType.DATE,
                    label: 'SO Date'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Sales Order
                sublistData.addField({
                    id: 'list_sna_sales_order',
                    type: ui.FieldType.SELECT,
                    label: 'Sales Order',
                    source: 'salesorder'
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Sales Order
                sublistData.addField({
                    id: 'list_sna_sales_order_link',
                    type: ui.FieldType.TEXT,
                    label: 'Sales Order',
                    source: 'salesorder'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // SO Quantity
                sublistData.addField({
                    id: 'list_sna_so_quantity',
                    type: ui.FieldType.FLOAT,
                    label: 'SO Quantity',
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Unfulfilled Quantity
                sublistData.addField({
                    id: 'list_sna_so_unfulfilled_quantity',
                    type: ui.FieldType.FLOAT,
                    label: 'SO Unfulfilled Quantity',
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                // Available
                sublistData.addField({
                    id: 'list_sna_available',
                    type: ui.FieldType.FLOAT,
                    label: 'Available',
                });

                // Back Ordered
                sublistData.addField({
                    id: 'list_sna_back_ordered',
                    type: ui.FieldType.FLOAT,
                    label: 'Back Ordered',
                });

                // On Order
                sublistData.addField({
                    id: 'list_sna_on_order',
                    type: ui.FieldType.FLOAT,
                    label: 'On Order',
                });

                // Reorder Point
                sublistData.addField({
                    id: 'list_sna_reorder_point',
                    type: ui.FieldType.FLOAT,
                    label: 'Reorder Point',
                });

                // Vendor Item Name
                sublistData.addField({
                    id: 'list_sna_vendor_item_name',
                    type: ui.FieldType.TEXT,
                    label: 'Vendor Item Name',
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Quantity
                sublistData.addField({
                    id: 'list_sna_quantity',
                    type: ui.FieldType.FLOAT,
                    label: 'Quantity',
                }).updateDisplayType({displayType: ui.FieldDisplayType.ENTRY});

                // Rate
                sublistData.addField({
                    id: 'list_sna_rate',
                    type: ui.FieldType.CURRENCY,
                    label: 'Rate',
                }).updateDisplayType({displayType: ui.FieldDisplayType.ENTRY});

                // RateArray
                sublistData.addField({
                    id: 'list_sna_rate_array',
                    type: ui.FieldType.TEXTAREA,
                    label: 'Rate Array',
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                // Amount
                sublistData.addField({
                    id: 'list_sna_amount',
                    type: ui.FieldType.CURRENCY,
                    label: 'Amount',
                }).updateDisplayType({displayType: ui.FieldDisplayType.ENTRY});

                // Customer
                /*sublistData.addField({
                    id: 'list_sna_customer',
                    type: ui.FieldType.SELECT,
                    label: 'Customer',
                    source: 'customer'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});*/

                // Sublist Data
                for (let index = 0; index < this.results.length; index++) {
                    // log.debug({title: "Results " + index, details: this.results[index]});
                    sublistData.setSublistValue({
                        id: `list_sna_line`,
                        line: index,
                        value: index + 1
                    });
                    for (let key in this.results[index])
                        sublistData.setSublistValue({
                            id: `list_sna_${key}`,
                            line: index,
                            value: isEmpty(this.results[index][key]) ? null : this.results[index][key]
                        });
                }

                // Buttons
                // Submit Button
                form.addSubmitButton({
                    label: 'Submit'
                });
                // Fetch Records
                form.addButton({
                    id: 'custpage_sna_export_master',
                    label: 'Fetch Records',
                    functionName: `fetchRecords(${false})`
                });
                sublistData.addButton({
                    id: 'custpage_sna_select_all',
                    label: 'Select All',
                    functionName: `selectAll()`
                });

                return form;
            }

            getSalesOrders() {
                let customers = [], orders = [];
                search.create({
                    type: search.Type.SALES_ORDER,
                    filters: [
                        {name: "type", operator: "anyof", values: "SalesOrd"},
                        {name: "status", operator: "anyof", values: ["SalesOrd:E", "SalesOrd:B"]},
                        {name: "mainline", operator: "is", values: "T"},
                        {name: "taxline", operator: "is", values: "F"},
                        {name: "cogs", operator: "is", values: "F"},
                        {name: "custcol_sna_linked_transaction", operator: "anyof", values: "@NONE@"}
                    ],
                    columns: ["entity", "tranid"]
                }).run().each(function (result) {
                    if (customers.findIndex(element => element.value == result.getValue({name: "entity"})) == -1)
                        customers.push({
                            text: result.getText({name: "entity"}),
                            value: result.getValue({name: "entity"})
                        });

                    orders.push({text: result.getValue({name: "tranid"}), value: result.id});
                    return true;
                });

                return {customers, orders};
            }

            fetchResults() {
                // temporary item categories
                var currentScript = runtime.getCurrentScript();
                var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
                var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
                var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
                var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
                var subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});

                let response = [];
                let vendors = [];
                locationArray = getParentLocations();
                itemsOnOrder = getItemsOnOrder();
                let locationFilterValues = [];

                // For Reorder Point Item -- End
                let itemFilters = [
                    {name: "reorderpoint", operator: "isnotempty"},
                    // {name: "internalid", operator: "anyof", values: "211"},
                    {name: "locationreorderpoint", operator: "isnotempty"},
                    {name: "locationreorderpoint", operator: "greaterthan", values: 0}

                    /*{
                        name: "custrecord_sna_hul_primaryvendor",
                        join: "custrecord_sna_hul_item",
                        operator: "is",
                        values: "T"
                    }*/
                ];

                if (this.params.hasOwnProperty("location") && !!this.params["location"]) {
                    locationFilterValues = [Number(this.params["location"])];
                    /*let parentLocation = record.load({
                        type: "location", id: this.params["location"]
                    }).getValue("parent");
                    if (isEmpty(parentLocation)) {
                        let locationArr = locationArray.filter(element => element.parent == this.params["location"]);
                        locationArr.forEach(element => locationFilterValues.push(element.id));
                    }*/

                    itemFilters.push({name: "inventorylocation", operator: "anyof", values: locationFilterValues});
                }

                if (this.params.hasOwnProperty("items") && this.params["items"].split(",").length != 0 && !!this.params["items"][0])
                    itemFilters.push({
                        name: "internalid", operator: "anyof", values: this.params["items"].split(",")
                    });

                log.audit({title: "itemFilters", details: itemFilters});

                let itemList = getReorderItems(itemFilters);

                log.audit({title: "itemList", details: itemList});

                if (itemList.length > 0) {
                    getItemRatesData(itemList);

                    log.audit({title: "itemRates", details: itemRates});

                    if (itemList.length > 0)
                        itemFilters.push({
                            name: "internalid", operator: "anyof", values: itemList
                        });

                    let searchObj = search.create({
                        type: search.Type.ITEM,
                        filters: itemFilters,
                        columns: [
                            "itemid", "inventorylocation", "department", "internalid", "displayname", "salesdescription", "custitem_sna_hul_itemcategory",
                            search.createColumn({name: "custrecord_sna_hul_vendor", join: "CUSTRECORD_SNA_HUL_ITEM"}),
                            search.createColumn({
                                name: "custrecord_sna_hul_primaryvendor",
                                join: "CUSTRECORD_SNA_HUL_ITEM",
                                sort: search.Sort.DESC
                            }),
                            "locationreorderpoint", "locationquantityavailable", "locationquantitybackordered", "locationquantityonhand", "locationquantityonorder", "baseprice", "lastpurchaseprice"
                        ]
                    }).run();

                    getAllSearchResults(searchObj).forEach(result => {
                        let available = Number(result.getValue({name: "locationquantityavailable"}) || 0);
                        let reorderQuantity = Number(result.getValue({name: "locationreorderpoint"}) || 0);
                        // let onOrder = Number(result.getValue({name: "locationquantityonorder"}) || 0);
                        let itemName = result.getValue({name: "itemid"});
                        let item = result.getValue({name: "internalid"});
                        let locationValue = locationArray.find(element => element.id == result.getValue({name: "inventorylocation"}));

                        let onOrder = 0
                        try {
                            onOrder = itemsOnOrder.find(element => Number(element.item) == Number(item) && Number(element.location) == (locationValue.parent || locationValue.id)).quantity;
                        } catch (e) {
                        }

                        if (reorderQuantity - available - onOrder > 0) {
                            let vendor = "";
                            let primaryVendor = result.getValue({
                                name: "custrecord_sna_hul_primaryvendor", join: "CUSTRECORD_SNA_HUL_ITEM"
                            });
                            if (primaryVendor)
                                vendor = result.getValue({
                                    name: "custrecord_sna_hul_vendor", join: "CUSTRECORD_SNA_HUL_ITEM"
                                });

                            let rate = 0;
                            let rateArray = {
                                basePrice: Number(result.getValue({name: "baseprice"})),
                                purchasePrice: Number(result.getValue({name: "lastpurchaseprice"}))
                            };
                            let rateObj = {quantityPrices: []};
                            if (!isEmpty(vendor) && !isEmpty(item)) {
                                rateArray.data = getItemRates(item);
                                rateObj = rateArray.data.find(element => element.vendorId == vendor && element.itemId == item);
                                let quantity = reorderQuantity - available;

                                if (!isEmpty(rateObj)) {
                                    rate = rateObj.contractPrice || rateObj.price;

                                    // log.debug({title: "rateObj", details: {rateObj, quantity}});
                                    if (!isEmpty(rateObj)) {
                                        rate = rateObj.price;
                                        if (!isEmpty(rateObj.quantityPrices)) {
                                            let rateA = rateObj.quantityPrices.filter(element => element.Quantity <= quantity);
                                            if (!isEmpty(rateA[rateA.length - 1]))
                                                rate = rateA[rateA.length - 1].Price;
                                        }
                                    }
                                } else rateObj = {quantityPrices: [], vendorItemName: ""};
                            }

                            // log.debug({title: "rateArray", details: JSON.stringify(rateArray)});

                            if (vendors.findIndex(element => element.itemId == item) == -1)
                                vendors.push({itemId: item, vendor: vendor});


                            let responseObj = {
                                item_line: result.getValue({name: "line"}),
                                location: !isEmpty(locationValue) ? (locationValue.parent || locationValue.id) : "",
                                sub_location: result.getValue({name: "inventorylocation"}),
                                department: result.getValue({name: "department"}),
                                // class: result.getValue({name: "class"}),
                                item: item,
                                item_link: `<a href="${url.resolveRecord({
                                    recordType: 'inventoryitem',
                                    recordId: item
                                })}" class="dottedlink" target="_blank">${itemName}</a>`,
                                item_id: item,
                                item_description: result.getValue({name: "salesdescription"}),
                                item_category: result.getValue({name: "custitem_sna_hul_itemcategory"}),
                                vendor: vendor,
                                // units: result.getValue({name: "unitstype"}),
                                available: available,
                                back_ordered: result.getValue({name: "locationquantitybackordered"}) || 0,
                                // on_order: onOrder,
                                on_order: result.getValue({name: "locationquantityonorder"}) || 0,
                                reorder_point: reorderQuantity,
                                quantity: reorderQuantity - available - onOrder,
                                // rate: Number(result.getValue({name: "baseprice"}) || 0),
                                rate: Number(rate || Number(result.getValue({name: "baseprice"}) || result.getValue({name: "lastpurchaseprice"}) || 0)).toFixed(2),
                                rate_array: JSON.stringify(rateArray),
                                vendor_item_name: rateObj.vendorItemName,
                                // ratePrices: rateObj.quantityPrices,
                                // amount: Number(result.getValue({name: "baseprice"}) || 0) * (reorderQuantity - available),
                                amount: Number(Number(rateObj.price || 0) * (reorderQuantity - available)).toFixed(2),
                                customer: "",
                                sales_order: ""
                            };

                            // log.debug({title: "responseObj", details: JSON.stringify(responseObj)});

                            if (checkDuplicateObject(response, responseObj) == -1)
                                response.push(responseObj);
                        }
                        return true;
                    });
                }
                // For Reorder Point Item -- End

                // For Sales Orders -- Start
                let soFilters = [
                    {name: "type", operator: "anyof", values: "SalesOrd"},
                    {name: "status", operator: "anyof", values: ["SalesOrd:B", "SalesOrd:D", "SalesOrd:E"]},
                    {name: "mainline", operator: "is", values: "F"},
                    {name: "taxline", operator: "is", values: "F"},
                    {name: "cogs", operator: "is", values: "F"},
                    {name: "custcol_sna_linked_transaction", operator: "anyof", values: "@NONE@"},
                    {name: "custcol_sna_linked_po", operator: "anyof", values: "@NONE@"},
                    // {name: "trandate", operator: "within", values: ["07/17/2022", "07/20/2022"]}
                    // {name: "locationquantitybackordered", operator: "isnotempty", join: "item"},
                    // {name: "locationreorderpoint", operator: "isnotempty", join: "item"}
                    {
                        name: "custcol_sna_hul_ship_meth_vendor",
                        operator: "noneof",
                        values: ["@NONE@", SHIPPING_METHOD.TRANSFER]
                    }
                ];

                if (this.params.hasOwnProperty("location") && !!this.params["location"]) {
                    let locations = [Number(this.params["location"])];
                    let parentLocation = record.load({
                        type: "location", id: this.params["location"]
                    }).getValue("parent");
                    if (isEmpty(parentLocation)) {
                        let locationArr = locationArray.filter(element => element.parent == this.params["location"]);
                        locationArr.forEach(element => locations.push(element.id));
                    }
                    soFilters.push({name: "location", operator: "anyof", values: locations});
                    soFilters.push({name: "inventorylocation", operator: "anyof", join: "item", values: locations});
                }

                if (this.params.hasOwnProperty("department") && !!this.params["department"]) {
                    let department = [Number(this.params["department"])];
                    soFilters.push({name: "department", operator: "anyof", values: department});
                }

                soFilters.push({
                    name: "formulanumeric",
                    formula: "CASE WHEN {item.inventorylocation.id} = {location.id} THEN 1 ELSE 0 END",
                    operator: "equalto",
                    values: "1"
                });

                if (this.params.hasOwnProperty("salesorders") && this.params["salesorders"].split(",").length != 0 && !!this.params["salesorders"][0])
                    soFilters.push({
                        name: "internalid",
                        operator: "anyof",
                        values: this.params["salesorders"].split(",")
                    });

                if (this.params.hasOwnProperty("items") && this.params["items"].split(",").length != 0 && !!this.params["items"][0])
                    soFilters.push({
                        name: "item",
                        operator: "anyof",
                        values: this.params["items"].split(",")
                    });

                if (this.params.hasOwnProperty("shippingmethod") && !!this.params["shippingmethod"])
                    soFilters.push({
                        name: "custcol_sna_hul_ship_meth_vendor",
                        operator: "anyof",
                        values: this.params["shippingmethod"]
                    });
                /*
                if (this.params.hasOwnProperty("customer") && !!this.params["customer"])
                    filters.push({name: "name", operator: "anyof", values: this.params["customer"]});

                if (this.params.hasOwnProperty("fromdate") && !!this.params["fromdate"] && !!this.params["todate"])
                    filters.push({
                        name: "trandate",
                        operator: "within",
                        values: [this.params["fromdate"], this.params["todate"]]
                    });
                */

                log.audit({title: "soFilters", details: soFilters});

                let salesOrders = [];
                let salesOrderData = [];
                let salesOrdersTempItm = {};

                let items = getSalesOrderItems(soFilters);
                // log.debug({title: "getSalesOrderItems items", details: items});

                if (items.length > 0) {
                    let primaryVendors = getPrimaryVendors(items);
                    getItemRatesData(items);

                    search.create({
                        type: search.Type.SALES_ORDER,
                        filters: soFilters,
                        columns: [
                            "line", "location", "department", /*"class",*/ "item", "custcol_sna_hul_item_category", "custcol_sna_hul_vendor_name",
                            "docunit", "quantity", "custbody_fam_specdeprjrn_rate", "amount", "entity", "tranid", "trandate", "custcol_sna_hul_ship_meth_vendor",
                            "custcol_sna_hul_itemcategory", "custcol_sna_hul_item_vendor", "custcol_sna_hul_cumulative_markup", "custcolsna_hul_newunitcost_wodisc",
                            "custcol_sna_hul_temp_item_code", "memo", "custcol_sna_hul_vendor_item_code", "quantityshiprecv", "lineuniquekey",
                            search.createColumn({name: "salesdescription", join: "item"}),
                            search.createColumn({name: "vendor", join: "item"}),
                            search.createColumn({name: "reorderpoint", join: "item"}),
                            search.createColumn({name: "locationquantityavailable", join: "item"}),
                            search.createColumn({name: "locationquantitycommitted", join: "item"}),
                            search.createColumn({name: "locationquantitybackordered", join: "item"}),
                            search.createColumn({name: "locationquantityonorder", join: "item"}),
                            search.createColumn({name: "locationquantityonhand", join: "item"}),
                            search.createColumn({name: "locationreorderpoint", join: "item"}),
                            search.createColumn({name: "custitem_sna_hul_itemcategory", join: "item"}),
                        ]
                    }).run().each(function (result) {
                        let tranId = result.getValue({name: "tranid"});
                        let item = result.getValue({name: "item"});
                        let quantityOnOrder = result.getValue({name: "quantity"});
                        let quantityFulfilled = result.getValue({name: "quantityshiprecv"});

                        if (quantityOnOrder === quantityFulfilled) return true;

                        let itemName = result.getText({name: "item"});
                        let cumulative = result.getValue({name: "custcol_sna_hul_cumulative_markup"});
                        var wodiscount = result.getValue({name: "custcolsna_hul_newunitcost_wodisc"});
                        let lineitmcat = result.getValue({name: "custitem_sna_hul_itemcategory", join: "item"});
                        let quantity = result.getValue({name: "locationquantitybackordered", join: "item"}) || 0;
                        let backOrdered = result.getValue({name: "locationquantitybackordered", join: "item"}) || 0;
                        let committed = result.getValue({name: "locationquantitycommitted", join: "item"}) || 0;

                        if (backOrdered != committed)
                            quantity = result.getValue({name: "quantity"});

                        let rate = Number(result.getValue({name: "amount"})) / Number(result.getValue({name: "quantity"}));

                        // let vendor = vendors.find(element => element.itemId == item);
                        let vendor;
                        try {
                            log.audit({title: "primaryVendors", details: primaryVendors});
                            log.audit({title: "item", details: {type: typeof item, item}});
                            log.audit({title: "lineitmcat", details: lineitmcat});
                            log.audit({title: "porate", details: result.getValue({name: "porate"})});

                            // temporary items
                            if (tempitemcat == lineitmcat || lineitmcat == allieditemcat || lineitmcat == rackingitemcat || lineitmcat == storageitemcat || lineitmcat == subletitemcat) {
                                vendor = result.getValue({name: "custcol_sna_hul_item_vendor"});
                            } else {
                                vendor = primaryVendors.filter(element => element.item == item && element.isPrimary)[0].value;
                                log.audit({title: "vendor", details: vendor});
                                if (isEmpty(vendor)) {
                                    /*primaryVendors.forEach(element => {
                                        // log.debug({title: "primaryVendors element", details: element});
                                        if (!!element.items && element.items.includes(item))
                                            vendor = {vendor: element.value};
                                    });*/
                                    vendor = vendors.find(element => element.itemId == item).vendor;
                                }
                            }
                        } catch (e) {
                            log.error({title: "Error", details: e});
                        }

                        // log.debug({title: "SO Item Details", details: {item, quantity, vendor}});

                        let rateArray = {
                            basePrice: rate,
                            purchasePrice: rate
                        };
                        let rateObj = {quantityPrices: []};
                        if (!isEmpty(vendor) && !isEmpty(item)) {
                            rateArray.data = getItemRates(item);
                            rateObj = rateArray.data.find(element => element.vendorId == vendor && element.itemId == item);

                            // log.debug({title: "SO rateObj", details: rateObj});
                            if (!isEmpty(rateObj)) {
                                rate = rateObj.contractPrice || rateObj.price;
                                if (!isEmpty(rateObj.quantityPrices)) {
                                    let rateA = rateObj.quantityPrices.filter(element => element.Quantity <= quantity);
                                    if (!isEmpty(rateA[rateA.length - 1]))
                                        rate = rateA[rateA.length - 1].Price;
                                }
                            }

                            // temporary items
                            if (tempitemcat == lineitmcat || lineitmcat == allieditemcat || lineitmcat == rackingitemcat || lineitmcat == storageitemcat || lineitmcat == subletitemcat) {
                                //rate = wodiscount / (1 + (forceFloat(cumulative) / 100)); // PO rate since column is not searchable

                                if (isEmpty(salesOrdersTempItm[result.id])) {
                                    salesOrdersTempItm[result.id] = [];
                                }
                                salesOrdersTempItm[result.id].push(result.getValue({name: "lineuniquekey"}));
                            }
                        }

                        if (isEmpty(rateObj)) rateObj = {};

                        // log.debug({title: "SO Rate", details: rate});
                        // log.debug({title: "SO rateObj", details: rateObj});

                        let locationValue = locationArray.find(element => element.id == result.getValue({name: "location"}));

                        salesOrderData.push({
                            item_lineuniquekey: result.getValue({name: "lineuniquekey"}),
                            item_line: result.getValue({name: "line"}),
                            location: !isEmpty(locationValue) ? (locationValue.parent || locationValue.id) : "",
                            sub_location: result.getValue({name: "location"}),
                            department: result.getValue({name: "department"}),
                            // class: result.getValue({name: "class"}),
                            item: item,
                            item_id: item,
                            item_link: `<a href="${url.resolveRecord({
                                recordType: 'inventoryitem',
                                recordId: item
                            })}" class="dottedlink" target="_blank">${itemName}</a>`,
                            item_description: result.getValue({name: "salesdescription", join: "item"}),
                            tempitem_memo: result.getValue({name: "memo"}),
                            tempitem_tempcode: result.getValue({name: "custcol_sna_hul_temp_item_code"}),
                            tempitem_vendorcode: result.getValue({name: "custcol_sna_hul_vendor_item_code"}),
                            item_category: lineitmcat,
                            vendor: vendor,
                            units: result.getValue({name: "docunit"}),
                            shipping_method: result.getValue({name: "custcol_sna_hul_ship_meth_vendor"}),
                            available: result.getValue({name: "locationquantityavailable", join: "item"}) || 0,
                            back_ordered: backOrdered,
                            on_order: result.getValue({name: "locationquantityonorder", join: "item"}) || 0,
                            reorder_point: result.getValue({name: "locationreorderpoint", join: "item"}) || 0,
                            so_quantity: quantity,
                            so_unfulfilled_quantity: quantity - quantityFulfilled,
                            // quantity: quantity,
                            quantity: quantity - quantityFulfilled,
                            rate: Number(rate).toFixed(2),
                            amount: Number(rate * quantity).toFixed(2),
                            vendor_item_name: rateObj.vendorItemName,
                            rate_array: JSON.stringify(rateArray),
                            customer: result.getValue({name: "entity"}),
                            sales_order: result.id,
                            sales_order_link: `<a href="${url.resolveRecord({
                                recordType: 'salesorder',
                                recordId: result.id
                            })}" class="dottedlink" target="_blank">${tranId}</a>`,
                            sales_order_date: result.getValue({name: "trandate"})
                        });

                        if (!salesOrders.includes(result.id))
                            salesOrders.push(result.id);
                        return true;
                    });
                }

                // aduldulao 1/3/2024 - Get PO Rate
                for (var soid in salesOrdersTempItm) {
                    if (!isEmpty(soid)) {
                        var _recso = record.load({type: record.Type.SALES_ORDER, id: soid});

                        for (var x = 0; x < salesOrdersTempItm[soid].length; x++) {
                            var linekey = salesOrdersTempItm[soid][x];

                            var solne = _recso.findSublistLineWithValue({
                                sublistId: 'item',
                                fieldId: 'lineuniquekey',
                                value: linekey
                            });

                            if (solne != -1) {
                                var dataFound = salesOrderData.findIndex(item => item.item_lineuniquekey === linekey);
                                if (dataFound >= 0) {
                                    salesOrderData[dataFound].rate = _recso.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'porate',
                                        line: solne
                                    })
                                }
                            }
                        }
                    }
                }

                // For Sales Orders -- End
                // log.debug({title: "FetchResults - salesOrders", details: salesOrders});
                 log.audit({title: "FetchResults - salesOrderData", details: salesOrderData});

                let createdPOArray = checkSOCreatedPO(salesOrders);
                // log.debug({title: "FetchResults - createdPOArray", details: createdPOArray});
                salesOrderData.forEach(element => {
                    let line = element.item_line;
                    let item = element.item;
                    let sales_order = element.sales_order;

                    let object = createdPOArray.find(e => e.salesOrder == sales_order && e.item == item && e.line == line);
                    // log.debug({title: "FetchResults - SO Data Push", details: {object, line, item, sales_order}});
                    if (!isEmpty(object) && isEmpty(object.createdPo))
                        response.push(element);
                });

                // log.debug({title: "FetchResults - Response", details: response});

                if (this.params.hasOwnProperty("vendor") && !!this.params["vendor"])
                    response = response.filter(element => element.vendor == this.params["vendor"]);

                if (this.params.hasOwnProperty("salesorders") && this.params["salesorders"].split(",").length != 0 && !!this.params["salesorders"][0])
                    response = response.filter(element => this.params["salesorders"].split(",").includes(element.sales_order));

                // log.debug({title: "FetchResults - Response", details: response});

                return response;
            }

            readRequest(request) {
                let data = [],
                    keys = ["list_sna_select", "list_sna_item_line", "list_sna_department", "list_sna_class", "list_sna_item", "list_sna_item_category",
                        "list_sna_vendor", "list_sna_vendor_item_name", "list_sna_quantity", "list_sna_rate", "list_sna_amount", "list_sna_customer", "list_sna_sales_order",
                        "list_sna_location", "list_sna_sub_location", "list_sna_shipping_method", "list_sna_sub_itemcat", "list_sna_tempitem_tempcode", "list_sna_tempitem_memo", "list_sna_tempitem_vendorcode"];
                for (let i = 0; i < request.getLineCount({group: 'custpage_sna_itemdetails'}); i++) {
                    if (request.getSublistValue({
                        group: 'custpage_sna_itemdetails',
                        name: "list_sna_select",
                        line: i
                    }) == "T") {
                        let dataObj = {};
                        keys.forEach(key => {
                            dataObj[key.replace("list_sna_", "")] = request.getSublistValue({
                                group: 'custpage_sna_itemdetails',
                                name: key,
                                line: i
                            });
                        });

                        if (isEmpty(dataObj.shipping_method))
                            dataObj.shipping_method = request.parameters.custpage_sna_shipping_method;
                        data.push(dataObj);
                    }
                }
                log.debug({title: "Read Request - Data", details: data});

                return data;
            }

            processRequest(request) {
                let data = this.readRequest(request);
                let vendors = [], purchaseOrders = [], shippingMethods = [], _salesOrders = [],
                    validatePurchaseOrder = false;
                log.debug({
                    title: "Process Request - Request Params",
                    details: {
                        employee: request.parameters.custpage_sna_employee,
                        department: request.parameters.custpage_sna_department,
                        location: request.parameters.custpage_sna_location
                    }
                });
                // log.debug({title: "Process Request - Data", details: data});
                // log.debug({
                //     title: "Process Request - request.parameters.department",
                //     details: request.parameters.custpage_sna_department
                // });
                // log.debug({
                //     title: "Process Request - request.parameters.location",
                //     details: request.parameters.custpage_sna_location
                // });
                // log.debug({title: "Process Request - PO Type", details: request.parameters.custpage_sna_po_type || 5});

                data.forEach(element => {
                    if (!vendors.includes(element["vendor"]))
                        vendors.push(element["vendor"]);
                });

                data.forEach(element => {
                    if (!shippingMethods.includes(element["shipping_method"]))
                        shippingMethods.push(element["shipping_method"]);
                });

                log.debug({title: "Shipping Methods", details: shippingMethods});

                /*data.forEach(element => {
                    if (!_salesOrders.includes(element["sales_order"]))
                        _salesOrders.push(element["sales_order"]);
                });*/

                log.emergency({title: "Selected Sales Order", details: _salesOrders});

                let solocs = !isEmpty(_salesOrders) ? getSalesOrderLoc(_salesOrders) : {};

                vendors.forEach(vendor => {
                    shippingMethods.forEach(shippingMethod => {
                        let purchaseOrder = record.create({type: record.Type.PURCHASE_ORDER, isDynamic: true});
                        purchaseOrder.setValue({fieldId: "entity", value: getParentVendor(vendor) || vendor});
                        //purchaseOrder.setValue({fieldId: "subsidiary", value: 2});  // Herc-U-Lift, Inc.
                        purchaseOrder.setValue({fieldId: "custbody_sna_created_from_reqworksheet", value: true});
                        purchaseOrder.setValue({fieldId: "custbody_sna_buy_from", value: vendor});
                        purchaseOrder.setValue({
                            fieldId: "employee", value: Number(request.parameters.custpage_sna_employee)
                        }); // aduldulao 9/12/23 - move here above dept and loc setting
                        purchaseOrder.setValue({
                            fieldId: "department", value: request.parameters.custpage_sna_department
                        });
                        purchaseOrder.setValue({
                            fieldId: "location", value: request.parameters.custpage_sna_location
                        });
                        // main SO loc but what if multiple SO in one PO
                        /*purchaseOrder.setValue({
                            fieldId: "location", value: request.parameters.custpage_sna_location
                        });*/
                        let sublistData = data.filter(element => element.vendor == vendor && element.shipping_method == shippingMethod);
                        log.audit({title: "Sublist Data Vendor: " + vendor, details: sublistData});
                        log.audit({title: "Request Parameters: " + vendor, details: request.parameters});

                        purchaseOrder.setValue({
                            fieldId: "custbody_po_type", value: request.parameters.custpage_sna_po_type || 5
                        });

                        log.audit({
                            title: "shippingMethod: " + vendor,
                            details: {shippingMethod, paramShipMethod: request.parameters.custpage_sna_shipping_method}
                        });
                        if (!!shippingMethod)
                            purchaseOrder.setValue({fieldId: "shipmethod", value: shippingMethod});
                        else if (!!request.parameters.custpage_sna_shipping_method)
                            purchaseOrder.setValue({
                                fieldId: "shipmethod",
                                value: request.parameters.custpage_sna_shipping_method
                            });

                        let salesOrders = [];

                        for (let line = 0; line < sublistData.length; line++) {
                            // log.debug({
                            //     title: "Comparing Shipping Method",
                            //     details: {shippingMethod, sublistDataShipping: sublistData[line]["shipping_method"]}
                            // });
                            // if (sublistData[line]["shipping_method"] == shippingMethod) {
                            purchaseOrder.selectNewLine({sublistId: 'item'});

                            purchaseOrder.setCurrentSublistValue({
                                sublistId: "item", fieldId: "item", value: sublistData[line]["item"]
                            });
                            purchaseOrder.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "quantity",
                                value: sublistData[line]["quantity"]
                            });
                            purchaseOrder.setCurrentSublistValue({
                                sublistId: "item", fieldId: "rate", value: sublistData[line]["rate"]
                            });
                            // if (!isEmpty(sublistData[line]["department"]))
                            purchaseOrder.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "department",
                                value: request.parameters.custpage_sna_department || sublistData[line]["department"]
                            });
                            /*if (!isEmpty(sublistData[line]["class"]))
                                purchaseOrder.setSublistValue({
                                    sublistId: "item", fieldId: "class", line: line, value: sublistData[line]["class"]
                                });*/
                            // if (!isEmpty(sublistData[line]["location"]))
                            purchaseOrder.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "location",
                                value: request.parameters.custpage_sna_location || sublistData[line]["location"]
                            });
                            purchaseOrder.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "custcol_sna_vendor_item_name",
                                value: sublistData[line]["vendor_item_name"]
                            });
                            if (!isEmpty(sublistData[line]["sub_location"]))
                                purchaseOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_sna_hul_so_location",
                                    value: sublistData[line]["sub_location"]
                                });

                            if (!isEmpty(sublistData[line]["sales_order"])) {
                                log.emergency({
                                    title: "getSalesOrderLoc location",
                                    details: !isEmpty(solocs[sublistData[line]["sales_order"]]) ? solocs[sublistData[line]["sales_order"]] : ''
                                });

                                purchaseOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_sna_linked_transaction",
                                    value: Number(sublistData[line]["sales_order"])
                                });
                                purchaseOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_sna_linked_so",
                                    value: Number(sublistData[line]["sales_order"])
                                });
                                purchaseOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_sn_hul_so_line_id",
                                    value: Number(sublistData[line]["item_line"])
                                });

                                salesOrders.push({
                                    salesOrder: sublistData[line]["sales_order"],
                                    line: sublistData[line]["item_line"]
                                });

                                validatePurchaseOrder = true;
                            }

                            log.emergency('sublistData[line]', JSON.stringify(sublistData[line]));

                            if (!isEmpty(sublistData[line]["tempitem_tempcode"])) {
                                purchaseOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_sna_hul_temp_item_code",
                                    value: sublistData[line]["tempitem_tempcode"]
                                });
                                purchaseOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_sna_hul_vendor_item_code",
                                    value: sublistData[line]["tempitem_vendorcode"]
                                });
                                purchaseOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "description",
                                    value: sublistData[line]["tempitem_memo"]
                                });

                                var subrecord = purchaseOrder.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail'
                                });

                                // Remove all lines
                                var lotcount = subrecord.getLineCount({sublistId: 'inventoryassignment'})
                                for (var j = parseInt(lotcount) - 1; j >= 0; j--) {
                                    subrecord.removeLine({sublistId: 'inventoryassignment', line: j});
                                }

                                subrecord.selectNewLine({sublistId: 'inventoryassignment'});
                                subrecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'receiptinventorynumber',
                                    value: sublistData[line]["tempitem_tempcode"]
                                });
                                subrecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: sublistData[line]["quantity"]
                                });
                                subrecord.commitLine({sublistId: 'inventoryassignment'});
                            }

                            purchaseOrder.commitLine({sublistId: 'item'});
                            // }
                        }
                        /*purchaseOrder.setValue({
                            fieldId: "employee", values: Number(request.parameters.custpage_sna_employee)
                        });
                        purchaseOrder.setValue({
                            fieldId: "department", value: request.parameters.custpage_sna_department
                        });
                        purchaseOrder.setValue({
                            fieldId: "location", value: request.parameters.custpage_sna_location
                        });
                        log.debug({
                            title: "Purchase Order Employee",
                            details: {
                                employee: purchaseOrder.getValue({fieldId: "employee"}),
                                department: purchaseOrder.getValue({fieldId: "department"}),
                                location: purchaseOrder.getValue({fieldId: "location"}),
                            }
                        });*/

                        if (sublistData.length > 0) {
                            if (validatePurchaseOrder)
                                purchaseOrder.setValue({fieldId: "custbody_sna_hul_validate_with_so", value: true});

                            let purchaseOrderId = purchaseOrder.save({ignoreMandatoryFields: true});
                            log.debug({title: "Purchase Order Created", details: purchaseOrderId});

                            /*try {
                                record.submitFields({
                                    type: record.Type.PURCHASE_ORDER,
                                    id: purchaseOrderId,
                                    values: {
                                        shipmethod: Number(shippingMethod || request.parameters.custpage_sna_shipping_method)
                                    }
                                });
                            } catch (error) {
                                log.error({title: "Error Submit Fields", details: error});
                            }*/

                            this.updateSalesOrders(salesOrders, purchaseOrderId);
                            purchaseOrders.push(purchaseOrderId);
                        }
                    });
                });

                log.debug({title: "Purchase Orders", details: purchaseOrders});

                return purchaseOrders;
            }

            updateSalesOrders(data, purchaseOrderId, vendor) {
                let salesOrders = [];

                data.forEach(element => {
                    if (!salesOrders.includes(element.salesOrder))
                        salesOrders.push(element.salesOrder);
                });

                log.debug({title: "Sales Orders", details: salesOrders});

                try {
                    salesOrders.forEach(orderId => {
                        try {
                            let soLineData = data.filter(element => element.salesOrder == orderId);
                            log.debug({title: "soLineData", details: {orderId, soLineData}});
                            let salesOrder = record.load({type: record.Type.SALES_ORDER, id: orderId});
                            for (let line = 0; line < salesOrder.getLineCount({sublistId: "item"}); line++) {
                                let lineNo = salesOrder.getSublistValue({sublistId: "item", fieldId: "line", line});
                                soLineData.forEach(element => {
                                    /*salesOrder.setSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_sna_linked_transaction",
                                        value: purchaseOrderId,
                                        line: Number(element.line) - 1
                                    });*/
                                    if (Number(lineNo) == Number(element.line))
                                        salesOrder.setSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_linked_po",
                                            value: purchaseOrderId,
                                            line: line
                                        });

                                    // salesOrder.setSublistValue({
                                    //     sublistId: 'item',
                                    //     fieldId: 'povendor',
                                    //     value: vendor,
                                    //     line: i
                                    // });
                                });
                            }
                            salesOrder.save({ignoreMandatoryFields: true});
                        } catch (error) {
                            log.error({title: "updateSalesOrders salesOrders Error", details: error});
                        }
                    });
                } catch (error) {
                    log.error({title: "updateSalesOrders Error", details: error});
                }
            }
        }

        const getParentLocations = () => {
            let response = [];
            let sql = `SELECT ID, PARENT FROM LOCATION WHERE ISINACTIVE='F'`;

            let resultIterator = query.runSuiteQLPaged({query: sql, pageSize: 1000}).iterator();

            resultIterator.each(function (page) {
                let pageIterator = page.value.data.iterator();
                pageIterator.each(function (row) {
                    response.push({
                        id: row.value.getValue(0),
                        parent: row.value.getValue(1),
                    });
                    return true;
                });
                return true;
            });

            return response;
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            // Reading Parameters
            let params = scriptContext.request.parameters;

            if (scriptContext.request.method === 'GET') {
                if (isEmpty(params["location"]) && !!runtime.getCurrentUser().location && !params.hasOwnProperty("vendor")) {
                    let location = runtime.getCurrentUser().location;
                    params["location"] = location;
                }
                params.method = "GET";
            }
            log.debug({title: "Params", details: params});

            SHIPPING_METHOD.TRANSFER = runtime.getCurrentScript().getParameter({name: "custscript_rw_shipping_method_transfer"}) || SHIPPING_METHOD.TRANSFER;

            let requisitionWorksheet = new RequisitionWorksheet(params);
            if (scriptContext.request.method === 'GET') {
                scriptContext.response.writePage(requisitionWorksheet.createUi());
            } else {
                let purchaseOrders = requisitionWorksheet.processRequest(scriptContext.request);

                redirect.toSuitelet({
                    scriptId: 'customscript_sna_hul_sl_req_worksheet',
                    deploymentId: 'customdeploy_sna_hul_sl_req_worksheet',
                    parameters: {
                        'purchaseOrders': purchaseOrders.join(",")
                    }
                });
            }
        }

        const getClientScriptFileId = () => {
            return search.create({
                type: "file",
                filters: [["name", "is", "sna_hul_cs_requisition_worksheet.js"]]
            }).run().getRange(0, 1000)[0].id;
        }

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
            return flValue;
        }

        return {onRequest}

    });

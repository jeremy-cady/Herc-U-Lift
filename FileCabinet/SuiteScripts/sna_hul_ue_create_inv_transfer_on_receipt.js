/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This User Event script creates Inventory Transfers on Receipt
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2023/01/10                        Amol Jagkar         Initial version
 *
 */
define(['N/record', 'N/search', 'N/url', 'N/render', 'N/redirect', 'N/runtime', 'N/file', 'N/xml'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{url} url
     * @param{render} render
     * @param{redirect} redirect
     * @param{runtime} runtime
     * @param{file} file
     * @param{xml} xml     */
    (record, search, url, render, redirect, runtime, file, xml) => {

        const getDate = (dateStr) => {
            let dateArr = dateStr.split("-");
            let data = [dateArr[1], dateArr[2], dateArr[0]].join("/")
            // let date = new Date(data);
            return data;
        }

        const getInventoryTransferLines = (transferId) => {
            let response = [];
            /*search.create({
                type: search.Type.INVENTORY_TRANSFER,
                filters: [
                    {name: "type", operator: "anyof", values: "InvTrnfr"},
                    {name: "internalid", operator: "anyof", values: transfers},
                    {name: "mainline", operator: "is", values: "F"},
                    {
                        name: "formulanumeric",
                        formula: "CASE WHEN {location.id}={item.inventorylocation.id} THEN 1 ELSE 0 END",
                        operator: "equalto",
                        values: "1"
                    }
                ],
                columns: [
                    search.createColumn({name: "trandate", label: "Date"}),
                    search.createColumn({name: "location", label: "Location"}),
                    search.createColumn({name: "item", label: "Item"}),
                    search.createColumn({name: "salesdescription", join: "item", label: "Description"}),
                    search.createColumn({name: "tranid", label: "Document Number"}),
                    search.createColumn({name: "amount", label: "Amount"}),
                    search.createColumn({name: "quantity", label: "Quantity"}),
                    search.createColumn({
                        name: "locationquantityonhand",
                        join: "item",
                        label: "Location On Hand"
                    }),
                ]
            }).run().each(function (result) {
                let amount = result.getValue("amount");
                if (amount > 0)
                    response.push({
                        id: result.id,
                        date: result.getValue("trandate"),
                        toLocation: result.getText("location"),
                        item: result.getText("item"),
                        description: result.getValue({name: "salesdescription", join: "item"}),
                        tranId: result.getValue("tranid"),
                        amount: result.getValue("amount"),
                        quantity: result.getValue("quantity"),
                        quantityOnHand: result.getValue({name: "locationquantityonhand", join: "item"})
                    });
                else {
                    let index = response.findIndex(element => element.id == result.id);
                    response[index].fromLocation = result.getText("location");
                }
                return true;
            });*/

            let inventoryTransfer = record.load({
                type: record.Type.INVENTORY_TRANSFER, id: transferId
            });

            let tranId = inventoryTransfer.getValue({fieldId: "tranid"});
            let tranDate = inventoryTransfer.getValue({fieldId: "trandate"});
            let fromLocation = inventoryTransfer.getText({fieldId: "location"});
            let toLocation = inventoryTransfer.getText({fieldId: "transferlocation"});

            for (let line = 0; line < inventoryTransfer.getLineCount({sublistId: "inventory"}); line++) {
                let item = inventoryTransfer.getSublistText({sublistId: "inventory", fieldId: "item", line});
                let quantity = inventoryTransfer.getSublistValue({
                    sublistId: "inventory",
                    fieldId: "adjustqtyby",
                    line
                });
                let description = inventoryTransfer.getSublistValue({
                    sublistId: "inventory",
                    fieldId: "description",
                    line
                });
                let amount = inventoryTransfer.getSublistValue({sublistId: "inventory", fieldId: "amount", line});
                let quantityOnHand = inventoryTransfer.getSublistValue({
                    sublistId: "inventory",
                    fieldId: "quantityonhand",
                    line
                });
                let inventoryDetails = inventoryTransfer.getSublistSubrecord({
                    sublistId: 'inventory',
                    fieldId: 'inventorydetail',
                    line
                });
                let inventoryDetailsLines = inventoryDetails.getLineCount({sublistId: 'inventoryassignment'});
                let fromBin, toBin;
                for (let i = 0; i < inventoryDetailsLines; i++) {
                    fromBin = inventoryDetails.getSublistText({
                        sublistId: 'inventoryassignment',
                        fieldId: 'binnumber',
                        line: i
                    });
                    toBin = inventoryDetails.getSublistText({
                        sublistId: 'inventoryassignment',
                        fieldId: 'tobinnumber',
                        line: i
                    });
                }
                response.push({
                    item,
                    quantity,
                    description: xml.escape(description),
                    amount,
                    quantityOnHand,
                    fromLocation: xml.escape(fromLocation),
                    toLocation: xml.escape(toLocation),
                    fromBin,
                    toBin
                });
            }

            return response;
        }

        const createInventoryTransfer = (data) => {
            let inventoryTransfer = record.create({type: record.Type.INVENTORY_TRANSFER});
            inventoryTransfer.setValue({fieldId: "subsidiary", value: data.subsidiary});
            inventoryTransfer.setValue({fieldId: "custbody_sna_item_receipt", value: data.itemReceipt});
            inventoryTransfer.setValue({fieldId: "location", value: data.toLocation});
            inventoryTransfer.setValue({fieldId: "transferlocation", value: data.soLocation});

            for (let line = 0; line < data.lines.length; line++) {
                inventoryTransfer.setSublistValue({
                    sublistId: "inventory", fieldId: "item", value: data.lines[line].item, line
                });
                inventoryTransfer.setSublistValue({
                    sublistId: "inventory", fieldId: "adjustqtyby", value: data.lines[line].quantity, line
                });
                if (!isEmpty(data.lines[line].inventoryDetails)) {
                    try {
                        let invDetail = inventoryTransfer.getSublistSubrecord({
                            sublistId: 'inventory', fieldId: 'inventorydetail', line
                        });
                        for (let i = 0; i < data.lines[line].inventoryDetails.length; i++) {
                            let invDetailObj = data.lines[line].inventoryDetails[i];
                            invDetail.setSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'receiptinventorynumber',
                                value: invDetailObj.pallet,
                                line: i
                            });
                            invDetail.setSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'binnumber',
                                value: invDetailObj.bin,
                                line: i
                            });
                            invDetail.setSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                value: invDetailObj.quantity,
                                line: i
                            });
                        }
                    } catch (error) {
                        log.error({title: "createInventoryTransfer Error", details: error});
                    }
                }
            }
            let id = inventoryTransfer.save();
            return id;
        }

        const renderInventoryTransfers = (newRecord) => {
            let tranId = newRecord.getValue({fieldId: "tranid"});
            let createdFromSO = newRecord.getText({ fieldId: 'custbody_sna_hul_created_from_so' });
            let subsidiaryAddress = search.lookupFields({
                type: search.Type.SUBSIDIARY,
                id: newRecord.getValue({fieldId: "subsidiary"}),
                columns: "address.address"
            })["address.address"];
            // let tranDate = newRecord.getValue({fieldId: "trandate"});
            let dateStr = JSON.stringify(newRecord.getValue({fieldId: "trandate"})).replaceAll("\"", "").split("T")[0];
            let tranDate = getDate(dateStr);

            log.debug({title: "tranDate", details: newRecord.getValue({fieldId: "trandate"})});
            log.debug({title: "dateStr", details: dateStr});
            log.debug({title: "tranDate", details: tranDate});

            // let transfers = newRecord.getValue({fieldId: "custbody_sna_inventory_transfers"});

            /*let fromLocation = newRecord.getText({fieldId: "location"});
            let toLocation = newRecord.getText({fieldId: "transferlocation"});

            let lines = [], sublistId = "inventory";
            for (let line = 0; line < newRecord.getLineCount({sublistId}); line++) {
                let item = newRecord.getSublistText({sublistId, fieldId: "item", line});
                let description = newRecord.getSublistText({sublistId, fieldId: "description", line});
                let quantityOnHand = newRecord.getSublistText({sublistId, fieldId: "quantityonhand", line});
                let quantity = newRecord.getSublistText({sublistId, fieldId: "adjustqtyby", line});

                lines.push({item, description, quantityOnHand, quantity});
            }*/

            // let lines = getInventoryTransferLines(transfers);
            let lines = getInventoryTransferLines(newRecord.id);

            /*Template Creation - Add Invoices*/
            let templateFile = file.load({id: './TEMPLATES/sna_hul_inventory_transfer_template.xml'});
            let renderer = render.create();
            renderer.templateContent = templateFile.getContents();

            let invTransferObj = {
                tranId: xml.escape(tranId),
                tranDate: xml.escape(tranDate),
                createdFromSO: xml.escape(createdFromSO),
                subsidiaryAddress: xml.escape(subsidiaryAddress.replace(/\n/g, "<br/>"))
            };
            invTransferObj.lines = lines;

            log.debug({title: "invTransferObj", details: invTransferObj});

            renderer.addCustomDataSource({format: 'OBJECT', alias: 'inventoryTransfer', data: invTransferObj});

            /*var StatementPDF = renderer.renderAsString();
            log.debug('StatementPDF', StatementPDF);
            return StatementPDF;*/

            let statementPDF = renderer.renderAsPdf();
            return statementPDF;
        }

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            let newRecord = scriptContext.newRecord;
            if (newRecord.type == record.Type.INVENTORY_TRANSFER)
                // if (newRecord.type == record.Type.ITEM_RECEIPT)
                try {
                    let params = scriptContext.request.parameters;
                    log.debug({title: "params", details: params});

                    if (params.hasOwnProperty("printpdf")) {
                        let transactionFile = renderInventoryTransfers(newRecord);
                        transactionFile.name = 'Inventory Transfer - ' + transactionFile.name + '_' + new Date().getTime() + '.pdf';
                        transactionFile.folder = runtime.getCurrentScript().getParameter("custscript_inv_transfer_folder");
                        let id = transactionFile.save();
                        log.debug({title: 'File Saved - transactionFile Id', details: id});

                        transactionFile = file.load({id});

                        redirect.redirect({url: transactionFile.url});
                    }

                    let printUrl = url.resolveRecord({
                        recordType: newRecord.type, recordId: newRecord.id, params: {printpdf: "T"}
                    });
                    scriptContext.form.addButton({
                        id: "custpage_sna_print", label: "Print", functionName: `window.open("${printUrl}")`
                    });
                } catch (error) {
                    log.error({title: "Error", details: error});
                }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            let newRecord = scriptContext.newRecord;
            if (newRecord.type == record.Type.ITEM_RECEIPT)
                if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.COPY) {

                    let subsidiary = newRecord.getValue({fieldId: "subsidiary"});

                    let locationPairs = [];

                    for (let line = 0; line < newRecord.getLineCount({sublistId: "item"}); line++) {
                        let item = newRecord.getSublistValue({
                            sublistId: "item", fieldId: "item", line
                        });
                        let quantity = newRecord.getSublistValue({
                            sublistId: "item", fieldId: "quantity", line
                        });
                        let toLocation = newRecord.getSublistValue({
                            sublistId: "item", fieldId: "location", line
                        });
                        let soLocation = newRecord.getSublistValue({
                            sublistId: "item", fieldId: "custcol_sna_hul_so_location", line
                        });

                        let index = locationPairs.findIndex(element => element.toLocation == toLocation && element.soLocation == soLocation);
                        if (index == -1 && !!toLocation && !!soLocation && toLocation != soLocation) {
                            locationPairs.push({
                                subsidiary,
                                itemReceipt: newRecord.id,
                                toLocation,
                                soLocation,
                                lines: []
                            });
                            index = locationPairs.findIndex(element => element.toLocation == toLocation && element.soLocation == soLocation);
                        }

                        let inventoryDetails = [];
                        if (newRecord.hasSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail', line})) {
                            try {
                                let invDetail = newRecord.getSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                    line: line
                                });
                                let invDetailLines = invDetail.getLineCount({sublistId: 'inventoryassignment'});
                                for (let j = 0; j < invDetailLines; j++) {
                                    inventoryDetails.push({
                                        pallet: invDetail.getSublistValue({
                                            sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', line: j
                                        }),
                                        bin: invDetail.getSublistValue({
                                            sublistId: 'inventoryassignment', fieldId: 'binnumber', line: j
                                        }),
                                        quantity: invDetail.getSublistValue({
                                            sublistId: 'inventoryassignment', fieldId: 'quantity', line: j
                                        })
                                    });
                                }
                            } catch (e) {
                            }
                        }

                        if (index != -1)
                            locationPairs[index].lines.push({line, item, quantity, inventoryDetails});
                    }

                    log.debug({title: "locationPairs", details: locationPairs});

                    let itemReceipt = record.load({type: newRecord.type, id: newRecord.id});
                    let inventoryTransfers = [];
                    locationPairs.forEach(element => {
                        let id = createInventoryTransfer(element);
                        element.lines.forEach(e => {
                            itemReceipt.setSublistValue({
                                sublistId: "item", fieldId: "custcol_sna_hul_it", value: id, line: e.line
                            });
                        });
                        inventoryTransfers.push(id);
                    });
                    itemReceipt.setValue({fieldId: "custbody_sna_inventory_transfers", value: inventoryTransfers});
                    itemReceipt.save();

                    /*if (inventoryTransfers.length > 0)
                        record.submitFields({
                            type: newRecord.type,
                            id: newRecord.id,
                            values: {
                                custbody_sna_inventory_transfers: inventoryTransfers
                            }
                        })*/
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

        return {beforeLoad, afterSubmit}

    });
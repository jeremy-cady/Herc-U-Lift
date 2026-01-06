/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to update the vendor of special orders for temporary items
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/6/20       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Item Category checking as temp item
 * 2022/8/12                             aduldulao       Additional vendor fields
 * 2022/9/20                             aduldulao       Move creation of vendor
 * 2022/11/14                            aduldulao       Copy SO line location
 * 2022/11/15                            aduldulao       Update trigger of auto receive
 * 2023/2/23                             aduldulao       Update trigger of auto receive
 * 2023/2/26                             aduldulao       Memo from SO line
 * 2023/5/4                              aduldulao       New item categories
 * 2023/6/13                                 aduldulao       Auto creation for temp items only
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/https', 'N/url'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search, runtime, https, url) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
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
            try {
                var rec = scriptContext.newRecord;

                if (scriptContext.type == scriptContext.UserEventType.COPY || scriptContext.type == scriptContext.UserEventType.CREATE) {
                    var shipitm = '';
                    var orderline = rec.getValue({fieldId: 'custbody_sna_hul_orderid'});
                    var somemo = rec.getValue({fieldId: 'custbody_sna_soline_memo'});
                    log.debug({title: 'beforeLoad', details: 'orderline: ' + orderline + ' | somemo: ' + somemo});

                    if (!isEmpty(orderline)) {
                        var itmlen = rec.getLineCount({sublistId: 'item'});

                        for (var a = itmlen - 1; a >= 0; a--) {
                            var lineorderline = rec.getSublistValue({sublistId: 'item', fieldId: 'orderline', line: a});
                            var lineshipitm = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_ship_meth_vendor', line: a});

                            if (lineorderline != orderline) {
                                rec.removeLine({sublistId: 'item', line: a});
                            }
                            else {
                                shipitm = lineshipitm;
                                log.debug({title: 'beforeLoad', details: 'shipitm: ' + shipitm});

                                rec.setSublistValue({sublistId: 'item', fieldId: 'description', value: somemo, line: a});
                            }
                        }

                        rec.setValue({fieldId: 'shipmethod', value: shipitm});
                    }
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
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
            try {
                log.debug({title: 'afterSubmit', details: scriptContext.type});

                if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

                var currentScript = runtime.getCurrentScript();
                var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
                var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
                var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
                var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
                var subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var rec = record.load({type: _rec.type, id: _recid});

                var specialorder = rec.getValue({fieldId: 'specord'});
                var createdfrom = rec.getValue({fieldId: 'createdfrom'});
                var vendor = rec.getValue({fieldId: 'entity'});
                var subs = rec.getValue({fieldId: 'subsidiary'});
                var tranid = rec.getValue({fieldId: 'tranid'});
                var potype = rec.getValue({fieldId: 'custbody_po_type'});

                log.debug({title: 'afterSubmit', details: 'PO: ' + _recid + ' | specialorder: ' + specialorder + ' | createdfrom: ' + createdfrom + ' | vendor: ' + vendor + ' | potype: ' + potype});

                // NX order || Create PO manually set in the sales order
                if (specialorder == 'T' || potype == 6 || potype == 3 || scriptContext.type == scriptContext.UserEventType.DROPSHIP || scriptContext.type == scriptContext.UserEventType.SPECIALORDER) {
                    var hasnx = false;
                    var fromso = false;

                    var filters = [];
                    filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: 'F'}));
                    filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: _recid}));
                    //filters.push(search.createFilter({name: 'custcol_sna_hul_itemcategory', operator: search.Operator.ANYOF, values: [tempitemcat, allieditemcat, rackingitemcat, storageitemcat, subletitemcat]}));
                    filters.push(search.createFilter({name: 'type', join: 'appliedtotransaction', operator: search.Operator.IS, values: 'SalesOrd'}));

                    var columns = [];
                    columns.push(search.createColumn({name: 'lineuniquekey'}));
                    columns.push(search.createColumn({name: 'custcol_sna_hul_temp_item_code'}));
                    columns.push(search.createColumn({name: 'custcol_sna_hul_itemcategory'}));
                    columns.push(search.createColumn({name: 'lineuniquekey', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'custcol_sna_hul_item_vendor', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'custcol_sna_hul_temp_item_code', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'custcol_sna_hul_vendor_name', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'location', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'custcol_nx_task', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'quantity'}));
                    columns.push(search.createColumn({name: 'quantity', join: 'appliedToTransaction'}));
                    columns.push(search.createColumn({name: 'memo', join: 'appliedToTransaction'}));

                    var srch = search.create({type: record.Type.PURCHASE_ORDER, columns: columns, filters: filters});
                    var count = 0;
                    var parentlocfound = false;
                    var getparentLoc = '';

                    srch.run().each(function(result) {
                        var poitemcode = result.getValue({name: 'custcol_sna_hul_temp_item_code'});
                        var poitemcat = result.getValue({name: 'custcol_sna_hul_itemcategory'});
                        var soitemcode = result.getValue({name: 'custcol_sna_hul_temp_item_code', join: 'appliedToTransaction'});
                        var solocation = result.getValue({name: 'location', join: 'appliedToTransaction'});
                        var polinekey = result.getValue({name: 'lineuniquekey'});
                        var poqty = result.getValue({name: 'quantity'});
                        var soqty = result.getValue({name: 'quantity', join: 'appliedToTransaction'});
                        var somemo = result.getValue({name: 'memo', join: 'appliedToTransaction'});
                        var sonxtask = result.getValue({name: 'custcol_nx_task', join: 'appliedToTransaction'});

                        if (!parentlocfound) {
                            getparentLoc = loadLocation(solocation);
                            parentlocfound = true;
                        }

                        var polne = rec.findSublistLineWithValue({sublistId:'item', fieldId: 'lineuniquekey', value: polinekey});

                        // set the PO line temp code if empty
                        if (polne != -1) {
                            log.debug({title: 'afterSubmit', details: 'polne: ' + polne + ' | soitemcode: ' + soitemcode + ' | solocation: ' + solocation + ' | poqty: ' + poqty + ' | soqty: ' + soqty + ' | somemo: ' + somemo + ' | getparentLoc: ' + getparentLoc});

                            if (poqty != soqty && scriptContext.type == scriptContext.UserEventType.CREATE) {
                                rec.setSublistValue({sublistId: 'item', fieldId: 'quantity', line: polne, value: soqty});
                            }

                            if (tempitemcat == poitemcat || poitemcat == allieditemcat || poitemcat == rackingitemcat || poitemcat == storageitemcat || poitemcat == subletitemcat) {
                                if (isEmpty(poitemcode)) {
                                    rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: polne, value: soitemcode});
                                }
                                if (!isEmpty(getparentLoc)) {
                                    rec.setSublistValue({sublistId: 'item', fieldId: 'location', line: polne, value: getparentLoc});
                                }
                                else {
                                    rec.setSublistValue({sublistId: 'item', fieldId: 'location', line: polne, value: solocation});
                                }
                                rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_so_location', line: polne, value: solocation});
                                rec.setSublistValue({sublistId: 'item', fieldId: 'description', line: polne, value: somemo});

                                if (!isEmpty(sonxtask)) {
                                    hasnx = true;
                                }
                            }
                        }

                        fromso = true;

                        return true;
                    });

                    // remove items with different ship item
                    if (((specialorder == 'T' || potype == 6 || potype == 3) && scriptContext.type == scriptContext.UserEventType.CREATE) || scriptContext.type == scriptContext.UserEventType.DROPSHIP || scriptContext.type == scriptContext.UserEventType.SPECIALORDER) {
                        var shipitm = '';

                        var itemcount = rec.getLineCount({sublistId: 'item'});
                        for (var i = itemcount - 1; i >= 0; i--) {
                            var lineshipitm = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_ship_meth_vendor', line: i});

                            // get first ship item
                            if (i == (itemcount - 1)) {
                                shipitm = lineshipitm;
                                log.debug({title: 'afterSubmit', details: 'shipitm: ' + shipitm});
                            }

                            if (lineshipitm != shipitm) {
                                log.debug({title: 'afterSubmit', details: 'lineshipitm: ' + lineshipitm});

                                rec.removeLine({sublistId: 'item', line: i});
                            }
                        }
                    }

                    rec.save({ignoreMandatoryFields: true});
                    log.debug({title: 'afterSubmit', details: 'PO updated: ' + _recid});

                    if (fromso) {
                        // update SO vendor for multiple lines. po vendor for next lines copy the po vendor of the 1st line
                        //updateSOvendors(createdfrom, tempitemcat, allieditemcat, rackingitemcat, storageitemcat, subletitemcat);

                        log.debug({title: 'afterSubmit', details: 'hasnx: ' + hasnx});

                        // NX sales order only
                        if (hasnx) {
                            var counter = 1;
                            var exit = false;

                            while (!exit && counter < 6) {
                                try {
                                    // call suitelet to transform PO to IR
                                    /*var slUrl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_po_tempitem', deploymentId: 'customdeploy_sna_hul_sl_po_tempitem', returnExternalUrl: true});
                                    https.post({url: slUrl, body: JSON.stringify({poid: _recid})});
                                    log.debug({title: 'afterSubmit', details: 'SL called: customscript_sna_hul_sl_po_tempitem'});*/

                                    exit = true;
                                }
                                catch (e) {
                                    exit = true;
                                    break;

                                    /*if (e.message != undefined) {
                                        var errordetails;
                                        var errorcode = e.name;

                                        switch(errorcode) {
                                            case "SSS_REQUEST_TIME_EXCEEDED":
                                                errordetails = "Connection closed because it has exceed the time out period (NetSuite has not received a response after 5 seconds on initial connection or after 45 seconds on the request). Executing retry #: " +counter;
                                                break;
                                            case "SSS_CONNECTION_TIME_OUT":
                                                errordetails = "Connection closed because it has exceed the time out period (NetSuite has not received a response after 5 seconds on initial connection or after 45 seconds on the request). Executing retry #: " +counter;
                                                break;
                                            case "SSS_CONNECTION_CLOSED":
                                                errordetails = "Connection closed because it was unresponsive. Executing retry #: " +counter;
                                                break;
                                            case "SSS_INVALID_URL":
                                                errordetails = "Connection closed because of an invalid URL.  The URL must be a fully qualified HTTP or HTTPS URL if it is referencing a non-NetSuite resource.  The URL cannot contain white space.";
                                                exit = true;
                                                break;
                                            case "SSS_TIME_LIMIT_EXCEEDED":
                                                errordetails = "NetSuite Suitescript execution time limit of 180 seconds exceeded. Exiting script.";
                                                exit = true;
                                                break;
                                            case "SSS_USAGE_LIMIT_EXCEEDED":
                                                errordetails = "NetSuite User Event Suitescript usage limit of 1000 units exceeded. Exiting script.";
                                                exit = true;
                                                break;
                                            default:
                                                errordetails = e.message + '.  Executing retry #: ' +counter;
                                        }

                                        counter += 1;
                                        log.error({title: 'Process Error', details: errorcode + ': ' + errordetails});
                                    }
                                    else {
                                        log.error({title: 'Unexpected Error', details: e.toString()});
                                        exit = true;
                                        break;
                                    }*/
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR', e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error', e.toString());
                }
            }
        }

        function loadLocation(location) {

            var objRecord = record.load({
                type: "location",
                id: location,
                isDynamic: true,
            });
            log.debug("objRecord", objRecord);

            var parLoc = objRecord.getValue("parent");
            log.debug("parLoc", parLoc);

            return parLoc;

        }

        /**
         * Update SO vendors on cases where 1st line vendor is copied to other lines
         * @param createdfrom
         * @param tempitemcat
         */
        function updateSOvendors(createdfrom, tempitemcat, allieditemcat, rackingitemcat, storageitemcat, subletitemcat) {
            var hasupdate = false;

            var sorec = record.load({type: record.Type.SALES_ORDER, id: createdfrom});

            var itemcount = sorec.getLineCount({sublistId: 'item'});

            for (var i = 0; i < itemcount; i++) {
                var itm = sorec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                var itmcatcust = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                var tempvendor = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', line: i});
                var vendor = sorec.getSublistValue({sublistId: 'item', fieldId: 'povendor', line: i});
                var porate = sorec.getSublistValue({sublistId: 'item', fieldId: 'porate', line: i});

                if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat || itmcatcust == subletitemcat) {
                    log.debug({title: 'updateSOvendors', details: 'tempvendor: ' + tempvendor + ' | vendor: '+ vendor});

                    if (!isEmpty(tempvendor) && vendor != tempvendor) {
                        hasupdate = true;

                        sorec.setSublistValue({sublistId: 'item', fieldId: 'povendor', line: i, value: tempvendor});
                        sorec.setSublistValue({sublistId: 'item', fieldId: 'porate', line: i, value: porate});
                        log.debug({title: 'updateSOvendors', details: 'PO vendor updated: ' + tempvendor + ' | line: ' + i});
                    }
                }
            }

            if (hasupdate) {
                var soid = sorec.save({ignoreMandatoryFields: true});
                log.debug({title: 'afterSubmit', details: 'Sales order updated: ' + soid});
            }
        }

        return {beforeLoad, afterSubmit}

    });

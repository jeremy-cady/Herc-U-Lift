/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script to create special purchase orders
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/11/21       		                 aduldulao       Initial version.
 * 2023/5/4                                  aduldulao       New item categories, temp PO checkbox
 * 2023/5/5                                  aduldulao       PO creation based of unique vendor and shipping item
 * 2023/5/10                                 aduldulao       Remove non temp items
 * 2023/6/13                                 aduldulao       Auto creation for temp items only
 * 2023/6/15                                 aduldulao       Sublet
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
 * @param{record} record
 */
    (record, search, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var currentScript = runtime.getCurrentScript();
            var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
            var subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});

            var params = JSON.parse(scriptContext.request.body);

            var soid = params.soid;
            var entity = params.entity;
            var poinfo = !isEmpty(params.poinfo) ? JSON.parse(params.poinfo) : [];
            var hasnx = params.hasnx;
            var hasdiffqty = params.hasdiffqty;

            log.debug({title: 'onRequest', details: 'soid: ' + soid + ' | entity: ' + entity + ' | hasnx: ' + hasnx});

            /*var mainshipmethod = '';
            if (!isEmpty(soid)) {
                var soflds = search.lookupFields({type: search.Type.SALES_ORDER, id: soid, columns: ['shipmethod']});

                if (!isEmpty(soflds['shipmethod'])) {
                    mainshipmethod = soflds['shipmethod'][0].value;
                }
            }*/

            for (var ind in poinfo) {
                log.debug({title: 'onRequest', details: 'ind: ' + JSON.stringify(ind)});

                var indxarr = ind.split('||');
                var vend = !isEmpty(indxarr[0]) ? indxarr[0] : '';
                var typ = !isEmpty(indxarr[1]) ? indxarr[1] : '';

                log.debug({title: 'onRequest', details: 'vend: ' + vend + ' | typ: ' + typ});

                var params = {
                    soid: soid,
                    entity: vend,
                    poentity: vend
                };

                var potype = '';
                if (typ == 'SpecOrd') {
                    params['specord'] = 'T';
                    potype = 6; // Special Order
                }
                else if (typ == 'DropShip') {
                    params['dropship'] = 'T';
                    params['shipgroup'] = 1;
                    potype = 3; // Drop Ship
                }

                for (var q = 0; q < poinfo[ind].length; q++) {
                    var shipitm = poinfo[ind][q];
                    log.debug({title: 'onRequest', details: 'shipitm: ' + shipitm});

                    var porec = record.create({type: record.Type.PURCHASE_ORDER, isDynamic: true, defaultValues: params});
                    porec.setValue({fieldId: 'entity', value: vend}); // set the actual
                    porec.setValue({fieldId: 'poentity', value: vend}); // set the actual
                    //porec.setValue({fieldId: 'custbody_sna_buy_from', value: vend});
                    porec.setValue({fieldId: 'custbody_po_type', value: potype});
                    porec.setValue({fieldId: 'shipmethod', value: shipitm});

                    try {
                        var itemcount = porec.getLineCount({sublistId: 'item'});

                        linect: for (var i = itemcount - 1; i >= 0; i--) {
                            var temppovendor = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', line: i}); // Temporary Vendor
                            var tempcode = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                            var lineqty = porec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                            var itmcatcust = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                            var linerte = porec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                            var linetemprte = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_porate', line: i});
                            var lineshipitm = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_ship_meth_vendor', line: i});
                            var linelinkedpo = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_linked_po', line: i}); // apply to PO form. set from SO
                            var linenxtask = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', line: i}); // apply to PO form. set from SO
                            var linecreateposcrpt = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_createpo', line: i}); // apply to PO form. set from SO
                            var linepoitmcatcust = porec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_po_itemcat', line: i});

                            log.debug({title: 'onRequest', details: 'linepoitmcatcust: ' + linepoitmcatcust + ' | itmcatcust: ' + itmcatcust});

                            if (isEmpty(itmcatcust) && !isEmpty(linepoitmcatcust)) {
                                itmcatcust = linepoitmcatcust;

                                porec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i, value: itmcatcust});
                            }

                            if (lineshipitm != shipitm || (!isEmpty(linecreateposcrpt) && linecreateposcrpt != typ) || isEmpty(linecreateposcrpt)) {
                                porec.removeLine({sublistId: 'item', line: i});
                                continue linect;
                            }

                            log.debug({title: 'onRequest', details: 'temppovendor: ' + temppovendor + ' | line default rate: ' + linerte + ' | line temp rate custom: ' + linetemprte + ' | line temp ship item: ' + lineshipitm});

                            if (isEmpty(linelinkedpo) && (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat || itmcatcust == subletitemcat)) {
                                if (temppovendor != vend) {
                                    porec.removeLine({sublistId: 'item', line: i});
                                    continue linect;
                                }

                                porec.selectLine({sublistId: 'item', line: i});
                                porec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: linetemprte});

                                if (!isEmpty(tempcode)) {
                                    var subrecord = porec.getCurrentSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail'});

                                    // Remove all lines
                                    var lotcount = subrecord.getLineCount({sublistId: 'inventoryassignment'})
                                    for (var j = parseInt(lotcount)-1; j >= 0; j--) {
                                        subrecord.removeLine({sublistId: 'inventoryassignment', line: j});
                                    }

                                    subrecord.selectNewLine({sublistId: 'inventoryassignment'});
                                    subrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: tempcode});
                                    subrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: lineqty});
                                    subrecord.commitLine({sublistId: 'inventoryassignment'});
                                }

                                porec.commitLine({sublistId: 'item'});
                            }
                            else {
                                porec.selectLine({sublistId: 'item', line: i});
                                porec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: linetemprte}); // to get the original rate from SO
                                porec.commitLine({sublistId: 'item'});
                            }
                        }

                        var poId = porec.save({ignoreMandatoryFields: true, enableSourcing: false});
                        log.debug({ title: 'onRequest', details: 'PO created: ' + poId});
                    }
                    catch (e) {
                        if (e.message != undefined) {
                            log.error('ERROR' , e.name + ' ' + e.message);
                        } else {
                            log.error('ERROR', 'Unexpected Error' , e.toString());
                        }

                        continue;
                    }
                }
            }

            // if hasdiffqty, update PO
            if (hasdiffqty) {
                updatePOs(soid, [tempitemcat, allieditemcat, rackingitemcat, storageitemcat, subletitemcat]);
            }

            /*try {
                var ifrec = record.transform({fromType: record.Type.SALES_ORDER, fromId: soid, toType: record.Type.ITEM_FULFILLMENT});
                var itemcount = ifrec.getLineCount({sublistId: 'item'});

                for (var i = 0; i < itemcount; i++) {
                    var isauto = false;

                    var itmcatcust = ifrec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                    var nxtask = ifrec.getSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', line: i});
                    var vendorname = ifrec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name', line: i});
                    log.debug({title: 'onRequest', details: 'line: ' + i + ' | nxtask: ' + nxtask + ' | vendorname: ' + vendorname});

                    if (!isEmpty(nxtask) && (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat)) {
                        isauto = true;
                    }

                    ifrec.setSublistValue({sublistId: 'item', fieldId: 'itemreceive', line: i, value: isauto});
                }

                var ifid = ifrec.save({ignoreMandatoryFields: true});
                log.debug({title: 'onRequest', details: 'IF created: ' + ifid});
            }
            catch (e) {}*/
        }

        /**
         * Trigger UE PO Temp Items for PO
         * @param soid
         * @param tempitemcat
         */
        function updatePOs(soid, tempitemcat) {
            var poids = [];

            var filters = [];
            filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: 'F'}));
            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: soid}));
            //filters.push(search.createFilter({name: 'custcol_sna_hul_itemcategory', operator: search.Operator.ANYOF, values: tempitemcat}));
            filters.push(search.createFilter({name: 'type', join: 'applyingtransaction', operator: search.Operator.IS, values: 'PurchOrd'}));
            filters.push(search.createFilter({ name: 'formulanumeric', operator: search.Operator.EQUALTO, values: 1, formula: 'case when {quantity} != {applyingtransaction.quantity} then 1 else 0 end'}));

            var columns = [];
            columns.push(search.createColumn({name: 'quantity'}));
            columns.push(search.createColumn({name: 'quantity', join: 'applyingTransaction'}));
            columns.push(search.createColumn({name: 'lineuniquekey'}));
            columns.push(search.createColumn({name: 'lineuniquekey', join: 'applyingTransaction'}));
            columns.push(search.createColumn({name: 'applyingtransaction', sort: search.Sort.ASC}));
            columns.push(search.createColumn({name: 'memomain'}));

            var srch = search.create({type: record.Type.SALES_ORDER, columns: columns, filters: filters});

            srch.run().each(function(result) {
                var po = result.getValue({name: 'applyingtransaction'});
                var memo = result.getValue({name: 'memomain'});

                if (!inArray(po, poids)) {
                    record.submitFields({type: record.Type.PURCHASE_ORDER, id: po, values: {memo: memo}});
                    log.debug({title: 'updatePOs', details: 'trigger UE PO Temp Items for PO: ' + po});

                    poids.push(po);
                }

                return true;
            });
        }

        return {onRequest}

    });

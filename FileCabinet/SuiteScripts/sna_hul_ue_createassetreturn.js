/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to create FAM asset from Item Receipt
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/3       		                 aduldulao       Initial version.
 * 2022/6/1       		                 aduldulao       Update subsidiary source
 * 2023/2/28       		                 aduldulao       Set department, class, location
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search, runtime) => {

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
                if (scriptContext.type == scriptContext.UserEventType.DELETE) return;
                if (scriptContext.type != scriptContext.UserEventType.CREATE) return;

                var currentScript = runtime.getCurrentScript();
                var used = currentScript.getParameter({name: 'custscript_sna_postingstatus_used'});
                var assetusage = currentScript.getParameter({name: 'custscript_sna_depmethod_assetusage'});

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                var rec = record.load({type: _rectype, id: _recid, isDynamic: true});
                var createdfrom = rec.getValue({fieldId: 'createdfrom'});
                var objsubs = rec.getValue({fieldId: 'custbody_sna_hul_object_subsidiary'});
                var irtrandate = rec.getValue({fieldId: 'trandate'});
                var dept = rec.getValue({fieldId: 'department'});
                var clss = rec.getValue({fieldId: 'class'});
                var loc = rec.getValue({fieldId: 'location'});

                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | _rectype: ' + _rectype + ' | createdfrom: ' + createdfrom + ' | irtrandate: ' + irtrandate + ' | dept: ' + dept + ' | clss: ' + clss + ' | loc: ' + loc});

                if (!isEmpty(createdfrom)) {
                    var fieldLookUp = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});

                    var createdfromtype = fieldLookUp.recordtype;
                    if (createdfromtype == 'purchaseorder' || createdfromtype == 'returnauthorization') {
                        var allasset = [];
                        var allfleet = [];
                        var fleetorderline = {}
                        var fleetasset = {};

                        var lineItemCount = rec.getLineCount({sublistId: 'item'});

                        for (var i = 0; i < lineItemCount; i++ ) {
                            rec.selectLine({sublistId: 'item', line: i});
                            var itemreceive = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'itemreceive'});
                            var fleetno = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
                            var orderline = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'orderline'});
                            var qty = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'quantity'});
                            var assetId = rec.getCurrentSublistValue({sublistId : 'item', fieldId : 'custcol_sna_fam_obj'});
                            var isFA = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_is_fa_form'});

                            // no need to check if customer-owned or disposed
                            if (itemreceive && isFA && !isEmpty(assetId) && !isEmpty(fleetno)) {
                                allfleet.push(fleetno);
                                fleetorderline[fleetno] = {
                                    orderline: orderline,
                                    qty: qty
                                };
                            }
                        }

                        log.debug({title: 'afterSubmit', details: 'allfleet: ' + JSON.stringify(allfleet)});

                        // get the customer-owned fixed assets of the fleets
                        if (!isEmpty(allfleet)) {
                            var filters = [];
                            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: allfleet}));
                            filters.push(search.createFilter({name: 'isinactive', join: 'custrecord_sna_fixed_asset', operator: search.Operator.IS, values: false}));
                            filters.push(search.createFilter({name: 'custrecord_sna_customer_owned', join: 'custrecord_sna_fixed_asset', operator: search.Operator.IS, values: true}));
                            var columns = [];
                            columns.push(search.createColumn({name: 'internalid'}));
                            columns.push(search.createColumn({name: 'name'}));
                            columns.push(search.createColumn({name: 'custrecord_sna_fixed_asset'}));
                            // need to get the asset lifetime and type in the search because the fixed asset on the transaction line may not be the customer-owned
                            columns.push(search.createColumn({name: 'custrecord_assetlifetime', join: 'custrecord_sna_fixed_asset'}));
                            columns.push(search.createColumn({name: 'custrecord_assettype', join: 'custrecord_sna_fixed_asset'}));
                            columns.push(search.createColumn({name: 'altname', join: 'custrecord_sna_fixed_asset'}));
                            columns.push(search.createColumn({name: 'custrecord_assetaccmethod', join: 'custrecord_sna_fixed_asset'}));
                            columns.push(search.createColumn({name: 'custrecord_assetcurrentage', join: 'custrecord_sna_fixed_asset'}));
                            columns.push(search.createColumn({name: 'custrecord_assetlifeunits', join: 'custrecord_sna_fixed_asset'}));
                            columns.push(search.createColumn({name: 'custrecord_assetdeprrules', join: 'custrecord_sna_fixed_asset'}));
                            columns.push(search.createColumn({name: 'custrecord_assetrevisionrules', join: 'custrecord_sna_fixed_asset'}));

                            var objser = search.create({type: 'customrecord_sna_objects', filters: filters, columns: columns});
                            objser.run().each(function(result) {
                                var fleet = result.getValue({name: 'internalid'});
                                var fleetname = result.getValue({name: 'name'});
                                var fassettxt = result.getText({name: 'custrecord_sna_fixed_asset'});
                                var fasset = result.getValue({name: 'custrecord_sna_fixed_asset'});
                                var flifetime = result.getValue({name: 'custrecord_assetlifetime', join: 'custrecord_sna_fixed_asset'});
                                var ftype = result.getValue({name: 'custrecord_assettype', join: 'custrecord_sna_fixed_asset'});
                                var ftypetxt = result.getText({name: 'custrecord_assettype', join: 'custrecord_sna_fixed_asset'});
                                var faltname = result.getValue({name: 'altname', join: 'custrecord_sna_fixed_asset'});
                                var fdepcmethod = result.getValue({name: 'custrecord_assetaccmethod', join: 'custrecord_sna_fixed_asset'});
                                var flastdepperiod = result.getValue({name: 'custrecord_assetcurrentage', join: 'custrecord_sna_fixed_asset'});
                                var flifetimeusage = result.getValue({name: 'custrecord_assetlifeunits', join: 'custrecord_sna_fixed_asset'});
                                var fdeprules = result.getValue({name: 'custrecord_assetdeprrules', join: 'custrecord_sna_fixed_asset'});
                                var frevrules = result.getValue({name: 'custrecord_assetrevisionrules', join: 'custrecord_sna_fixed_asset'});

                                fleetasset[fleet] = {
                                    fleetname: fleetname,
                                    fassettxt: fassettxt,
                                    fasset: fasset,
                                    flifetime: flifetime,
                                    ftype: ftype,
                                    ftypetxt: ftypetxt,
                                    faltname: faltname,
                                    fdepcmethod: fdepcmethod,
                                    flastdepperiod: flastdepperiod,
                                    flifetimeusage: flifetimeusage,
                                    fdeprules: fdeprules,
                                    frevrules: frevrules
                                };

                                allasset.push(fasset);

                                return true;
                            });
                        }

                        log.debug({title: 'afterSubmit', details: 'allasset: ' + JSON.stringify(allasset)});
                        log.debug({title: 'afterSubmit', details: 'fleetasset: ' + JSON.stringify(fleetasset)});

                        var faInfo = getAssetInfo(allasset);

                        var fromrec = record.load({type: createdfromtype, id: createdfrom, isDynamic: true});

                        // create 1 asset for each line. 1 line = 1 qty = 1 asset
                        for (var fleet in fleetasset) {
                            log.debug({title: 'afterSubmit', details: 'fleet: ' + fleet + ' | ' + JSON.stringify(fleetasset[fleet])});

                            var info = !isEmpty(faInfo[fleetasset[fleet].fasset]) ? faInfo[fleetasset[fleet].fasset] : {};
                            log.debug({title: 'afterSubmit', details: 'info (total usage): ' + JSON.stringify(info)});

                            var deprecmethod = !isEmpty(fleetasset[fleet].fdepcmethod) ? fleetasset[fleet].fdepcmethod : '';

                            var line = fromrec.findSublistLineWithValue({sublistId: 'item', fieldId: 'line', value: fleetorderline[fleet].orderline});
                            log.debug({title: 'afterSubmit', details: 'line : ' + line + ' | po/ra line key: ' + fleetorderline[fleet].orderline});

                            if (line != -1) {
                                fromrec.selectLine({sublistId: 'item', line: line});
                                var linequniquekey = fromrec.getCurrentSublistValue({sublistId: 'item', fieldId: 'lineuniquekey'});
                                var amount = fromrec.getCurrentSublistValue({sublistId: 'item', fieldId: 'amount'});
                                var qty = fromrec.getCurrentSublistValue({sublistId: 'item', fieldId: 'quantity'});
                                var rate = forceFloat(amount) / forceFloat(qty);
                                var receivedtotal = forceFloat(fleetorderline[fleet].qty) * rate;
                                var pofleetcode = fromrec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_po_fleet_code'});

                                var famname = !isEmpty(fleetasset[fleet].faltname) ? fleetasset[fleet].faltname : fleetasset[fleet].fleetname;
                                var famassettypetxt = !isEmpty(fleetasset[fleet].ftypetxt) ? fleetasset[fleet].ftypetxt.replace(' - LC', '') : '';
                                var famassettype = !isEmpty(fleetasset[fleet].ftype) ? fleetasset[fleet].ftype : '';
                                var famdeprules = !isEmpty(fleetasset[fleet].fdeprules) ? fleetasset[fleet].fdeprules : '';;
                                var famrevrules = !isEmpty(fleetasset[fleet].frevrules) ? fleetasset[fleet].frevrules : '';;

                                var famlifetime = !isEmpty(fleetasset[fleet].flifetime) ? fleetasset[fleet].flifetime : '';
                                var famlastdepmethod = !isEmpty(fleetasset[fleet].flastdepperiod) ? fleetasset[fleet].flastdepperiod : '';
                                var newfamlifetime = forceFloat(famlifetime) - forceFloat(famlastdepmethod);

                                var famlifetimeusage = !isEmpty(fleetasset[fleet].flifetimeusage) ? fleetasset[fleet].flifetimeusage : '';
                                var famtotalassetusage = !isEmpty(info.custrecord_usageunits) ? info.custrecord_usageunits : '';
                                var newfamlifetimeusage = '';
                                if (deprecmethod == assetusage) {
                                    newfamlifetimeusage = forceFloat(famlifetimeusage) - forceFloat(famtotalassetusage);
                                }
                                var irtrandate_d = new Date(irtrandate);
                                var newdeprenddate = new Date(irtrandate_d.setMonth(irtrandate_d.getMonth() + newfamlifetime));

                                log.debug({title: 'afterSubmit', details: 'PO/RA rate: ' + rate + ' | PO/RA amount: ' + amount + ' | PO/RA qty: ' + qty + ' | PO/RA linequniquekey: ' + linequniquekey + ' PO/RA pofleetcode: ' + pofleetcode
                                        + ' | IR SO order line: ' +fleetorderline[fleet].orderline + ' | IF qty: ' + fleetorderline[fleet].qty + ' | receivedtotal: ' + receivedtotal
                                });

                                log.debug({title: 'afterSubmit', details: 'deprecmethod: ' + deprecmethod + ' | famlifetime: ' + famlifetime + ' | famlastdepmethod: ' + famlastdepmethod + ' | newfamlifetime: ' + newfamlifetime
                                        + ' | famlifetimeusage: ' + famlifetimeusage + ' | famtotalassetusage: ' + famtotalassetusage + ' | newfamlifetimeusage: ' + newfamlifetimeusage + ' | newdeprenddate: ' + newdeprenddate
                                });

                                // create 1 asset for each line. 1 line = 1 qty = 1 asset
                                var rec = record.create({type : 'customrecord_ncfar_asset', isDynamic: true});
                                rec.setValue({fieldId: 'altname', value: famname});
                                rec.setValue({fieldId: 'custrecord_assetlocation', value: loc});
                                rec.setValue({fieldId: 'custrecord_assetdepartment', value: dept});
                                rec.setValue({fieldId: 'custrecord_assetclass', value: clss});
                                try {
                                    rec.setText({fieldId: 'custrecord_assettype', text: famassettypetxt});
                                }
                                catch(ee) {
                                    if (ee.message != undefined) {
                                        log.error('ERROR' , ee.name + ' ' + ee.message);
                                    } else {
                                        log.error('ERROR', 'Unexpected Error' , ee.toString());
                                    }
                                    rec.setValue({fieldId: 'custrecord_assettype', value: famassettype});
                                }
                                rec.setValue({fieldId: 'custrecord_assetcost', value: receivedtotal});
                                rec.setValue({fieldId: 'custrecord_assetcurrentcost', value: receivedtotal});
                                rec.setValue({fieldId: 'custrecord_assetresidualvalue', value: 0});
                                rec.setValue({fieldId: 'custrecord_assetaccmethod', value: deprecmethod});
                                rec.setValue({fieldId: 'custrecord_assetlifetime', value: newfamlifetime});
                                rec.setValue({fieldId: 'custrecord_assetlifeunits', value: newfamlifetimeusage});
                                rec.setValue({fieldId: 'custrecord_assetdeprperiod', value: 1}); // Monthly
                                rec.setValue({fieldId: 'custrecord_assetbookvalue', value: receivedtotal});
                                rec.setValue({fieldId: 'custrecord_assetstatus', value: 6}); // New - auto set
                                rec.setValue({fieldId: 'custrecord_assetsubsidiary', value: objsubs}); // Herc-U-Lift, Inc.
                                rec.setValue({fieldId: 'custrecord_assetinclreports', value: true});
                                rec.setValue({fieldId: 'custrecord_assetpurchasedate', value: new Date(irtrandate)});
                                rec.setValue({fieldId: 'custrecord_assetdeprstartdate', value: new Date(irtrandate)});
                                rec.setValue({fieldId: 'custrecord_assetcurrentage', value: 0}); // auto set
                                rec.setValue({fieldId: 'custrecord_assetlastdepramt', value: 0}); // auto set
                                rec.setValue({fieldId: 'custrecord_assetlastdeprdate', value: new Date('01/01/1980')}); // auto set
                                rec.setValue({fieldId: 'custrecord_assettargetdeprdate', value: new Date('01/01/1980')}); // auto set
                                rec.setValue({fieldId: 'custrecord_assetdepractive', value: 1}); // True
                                rec.setValue({fieldId: 'custrecord_assetdeprrules', value: famdeprules});
                                rec.setValue({fieldId: 'custrecord_assetrevisionrules', value: famrevrules});
                                rec.setValue({fieldId: 'custrecord_assetdeprenddate', value: newdeprenddate});
                                rec.setValue({fieldId: 'custrecord_sna_customer_owned', value: false});
                                rec.setValue({fieldId: 'custrecord_sna_fa_created', value: true});
                                rec.setValue({fieldId: 'custrecord_sna_object', value: fleet});
                                rec.setValue({fieldId: 'custrecord_sna_hul_fleet_code', value: pofleetcode});

                                var recId = rec.save();
                                log.debug({title: 'afterSubmit', details: 'HUL-owned FAM Asset created: ' + recId});

                                if (!isEmpty(recId) && !isEmpty(fleet)) {
                                    record.submitFields({type: 'customrecord_sna_objects', id: fleet,
                                        values: {
                                            custrecord_sna_fixed_asset: recId,
                                            custrecord_sna_owner_status: 3, // Owner Status = Own
                                            custrecord_sna_posting_status: used, // Posting Status = Used
                                            custrecord_sna_status: '',
                                            custrecord_sna_rental_status: '',
                                            custrecord_sna_customer_name: '',
                                            custrecord_sna_current_address: '',
                                            custrecord_sna_owning_loc_code: loc
                                        }
                                    });
                                    log.debug({title: 'afterSubmit', details: 'Object/Fleet updated with new Fixed Asset: ' + fleet});

                                    if (!isEmpty(fleetasset[fleet].fasset)) {
                                        record.submitFields({type: 'customrecord_ncfar_asset', id: fleetasset[fleet].fasset, values: {isinactive: true, custrecord_sna_object: ''}});
                                        log.debug({title: 'afterSubmit', details: 'Customer-owned fixed asset inactive: ' + fleetasset[fleet].fasset});
                                    }
                                }
                            }
                        }
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
         * Get asset info
         * @param allasset
         * @returns {{}}
         */
        function getAssetInfo(allasset) {
            var allfa = allasset;
            var fainfo = {};

            if (isEmpty(allfa)) return fainfo;

            var filters = [];
            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: allfa}));

            var col = [];
            col.push(search.createColumn({name: 'internalid', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_usageunits', join: 'CUSTRECORD_USAGEASSETID', summary: 'SUM'}));

            var fasearch = search.create({type: 'customrecord_ncfar_asset', filters: filters, columns: col});

            fasearch.run().each(function(result) {
                var id = result.getValue({name: 'internalid', summary: 'GROUP'})

                if (isEmpty(fainfo[id])) {
                    fainfo[id] = {};
                }

                fainfo[id] = {
                    custrecord_usageunits: result.getValue({name: 'custrecord_usageunits', join: 'CUSTRECORD_USAGEASSETID', summary: 'SUM'})
                }

                log.debug({title: 'getAssetInfo', details: 'fa: ' + id + ' | ' + JSON.stringify(fainfo[id])});

                return true;
            });

            return fainfo;
        }

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
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

        return {afterSubmit}

    });

/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to assign Unique Temporary Item Code
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/6/17       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Remove Temporary UOM, Item Category checking as temp item
 * 2022/8/10                             aduldulao       Move creation of vendor
 * 2022/11/14                            aduldulao       Autocreate special order
 * 2023/2/23                             aduldulao       Update trigger of auto fulfill
 * 2023/5/2                              aduldulao       New item categories
 * 2023/5/5                              aduldulao       PO creation based of unique vendor and shipping item
 * 2023/5/11                             aduldulao       Set Temp PO Rate
 * 2023/6/08                             aduldulao       Estimated PO Rate
 * 2023/6/15                             aduldulao       Sublet
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/error', 'N/https', 'N/url'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search, error, https, url) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceInt(stValue){
            var intValue = parseInt(stValue, 10);
            if (isNaN(intValue) || (stValue == 'Infinity')) {
                return 0;
            }
            return intValue;
        }

        function padZero(num, lead) {
            var numString = num.toString();
            var numLength = numString.length;
            if (numLength < lead) {
                for (let i = numLength; i < lead; i++) {
                    numString = "0" + numString;
                }
            }

            return numString;
        }

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
        }

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
            }
            return flValue;
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
                    var itmlen = rec.getLineCount({sublistId: 'item'});

                    for (var a = itmlen - 1; a >= 0; a--) {
                        rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: a, value: ''});
                        rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_createpo', line: a, value: ''});
                    }
                }

                else if (scriptContext.type == scriptContext.UserEventType.VIEW) {
                    var soid = rec.id;
                    var custid = rec.getValue({fieldId: 'entity'});

                    log.debug({title: 'beforeLoad', details: 'soid: ' + soid + ' | custid: ' + custid});

                    var itmlen = rec.getLineCount({sublistId: 'item'});

                    for (var i = 0; i < itmlen; i++) {
                        var somemo = rec.getSublistValue({sublistId: 'item', fieldId: 'description', line: i});
                        var createpo = rec.getSublistValue({sublistId: 'item', fieldId: 'createpo', line: i});
                        var povendor = rec.getSublistValue({sublistId: 'item', fieldId: 'povendor', line: i});
                        var orderline = rec.getSublistValue({sublistId: 'item', fieldId: 'line', line: i});//parseInt(i)+1;

                        log.debug({title: 'beforeLoad', details: 'line: ' + i + ' | createpo: ' + createpo + ' | povendor: ' + povendor + ' | orderline: ' + orderline + ' | somemo: ' + somemo});

                        if (createpo == 'Drop Ship' && !isEmpty(povendor)) {
                            var slurl = url.resolveRecord({recordType: record.Type.PURCHASE_ORDER, recordId: null,
                                params : {'soid': soid, 'entity': povendor, 'poentity': povendor, 'specord': 'T', 'record.custbody_sna_hul_orderid': orderline, 'record.custbody_sna_soline_memo': somemo}
                            });
                            var slurlDs = url.resolveRecord({recordType: record.Type.PURCHASE_ORDER, recordId: null,
                                params : {'soid': soid, 'entity': povendor, 'poentity': povendor, 'dropship': 'T', 'shipgroup' : 1, 'record.custbody_sna_hul_orderid': orderline, 'record.custbody_sna_soline_memo': somemo}
                            });

                            log.debug({title: 'beforeLoad', details: 'slurl: ' + slurl + ' | slurlDs: ' + slurlDs});

                            slurl = '<a href="' + slurlDs + '" target="_blank">Drop Ship</a><br /><a href="' + slurl + '" target="_blank">Spec. Ord.</a>';

                            rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_cust_createpo', value: slurl, line: i});
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
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            var currentScript = runtime.getCurrentScript();
            var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
            var pref = currentScript.getParameter({name: 'custscript_sna_hul_prefix'});
            var alliedpref = currentScript.getParameter({name: 'custscript_sna_hul_prefix_allied'});
            var rackingpref = currentScript.getParameter({name: 'custscript_sna_hul_prefix_racking'});
            var storagepref = currentScript.getParameter({name: 'custscript_sna_hul_prefix_storage'});
            var subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});

            var prefmapping = {};
            prefmapping[tempitemcat] = pref;
            prefmapping[allieditemcat] = alliedpref;
            prefmapping[rackingitemcat] = rackingpref;
            prefmapping[storageitemcat] = storagepref;

            var setcode = false;
            if (scriptContext.type == scriptContext.UserEventType.COPY || scriptContext.type == scriptContext.UserEventType.CREATE) {
                setcode = true;
            }

            var fields = '';

            var rec = scriptContext.newRecord;
            var rectype = rec.type;

            var subs = rec.getValue({fieldId: 'subsidiary'});
            var itemcount = rec.getLineCount({sublistId: 'item'});

            if (setcode) {
                // search for last counter
                var latestindex = [];

                var preffil = [];
                preffil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, pref]);
                preffil.push('and');
                preffil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, tempitemcat]);

                var alliedfil = [];
                alliedfil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, alliedpref]);
                alliedfil.push('and');
                alliedfil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, allieditemcat]);

                var rackfil = [];
                rackfil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, rackingpref]);
                rackfil.push('and');
                rackfil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, rackingitemcat]);

                var storefil = [];
                storefil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, storagepref]);
                storefil.push('and');
                storefil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, storageitemcat]);

                var initfilters = [];
                initfilters.push(preffil);
                initfilters.push('or');
                initfilters.push(alliedfil);
                initfilters.push('or');
                initfilters.push(rackfil);
                initfilters.push('or');
                initfilters.push(storefil);

                var srch = search.load({id: 'customsearch_sna_hul_tempcode_index'});
                var erfilters = srch.filterExpression;
                erfilters.push('and');
                erfilters.push(initfilters);
                srch.filterExpression = erfilters;

                log.debug({title: 'beforeSubmit', details: 'srch.filterExpression: ' + JSON.stringify(srch.filterExpression)});

                srch.run().each(function(result) {
                    var res_itmcat = result.getValue({name: 'custitem_sna_hul_itemcategory', join: 'item', summary: search.Summary.GROUP});
                    var res_pref = result.getValue({name: 'formulatext', formula: 'UPPER(SUBSTR({custcol_sna_hul_temp_item_code},0,INSTR({custcol_sna_hul_temp_item_code},\'-\')-1))', summary: search.Summary.GROUP});
                    var res_maxindex = result.getValue({name: 'formulanumeric', formula: 'TO_NUMBER(NVL(SUBSTR({custcol_sna_hul_temp_item_code},INSTR({custcol_sna_hul_temp_item_code},\'-\')+1), 0))', summary: search.Summary.MAX});

                    latestindex[res_itmcat] = forceInt(res_maxindex);
                    log.debug({title: 'beforeSubmit', details: 'res_pref: ' + res_pref + ' | res_itmcat: ' + res_itmcat + ' | latestindex: ' + latestindex[res_itmcat]});

                    return true;
                });
            }

            var allitem = [];
            for (var m = 0; m < itemcount; m++) {
                var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: m});
                if (!isEmpty(lineitm)) {
                    allitem.push(lineitm);
                }
            }

            var itemsourcing = getItemValues(allitem);

            for (var i = 0; i < itemcount; i++) {
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                var tempvendor = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', line: i});
                var vendoritmcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code', line: i});
                var desc = rec.getSublistValue({sublistId: 'item', fieldId: 'description', line: i});
                var qty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                var porate = rec.getSublistValue({sublistId: 'item', fieldId: 'porate', line: i});
                var estporate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', line: i});
                var rate = rec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                var vendorname = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name', line: i});
                var lineitmcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                var linecreatepo = rec.getSublistValue({sublistId: 'item', fieldId: 'createpo', line: i});

                if (isEmpty(itmcatcust) && !isEmpty(itemsourcing[itm])) {
                    itmcatcust = itemsourcing[itm].itemcat;

                    rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i, value: itmcatcust});
                }

                log.debug({title: 'beforeSubmit', details: 'linecreatepo: ' + linecreatepo + ' | itmcatcust: ' + itmcatcust});

                if (linecreatepo == 'SpecOrd' || linecreatepo == 'DropShip') {
                    rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_createpo', line: i, value: linecreatepo}); // for PO creation
                    rec.setSublistValue({sublistId: 'item', fieldId: 'createpo', line: i, value: ''}); // cleared due to timing issue
                }
                rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_porate', line: i, value: forceFloat(porate)});

                if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat) {
                    if (setcode && isEmpty(lineitmcode)) {
                        if (isEmpty(latestindex[itmcatcust])) {
                            latestindex[itmcatcust] = 0;
                        }

                        latestindex[itmcatcust] += 1;

                        var currpref = !isEmpty(prefmapping[itmcatcust]) ? prefmapping[itmcatcust] : pref;

                        log.debug({title: 'beforeSubmit', details: 'line: ' + (forceInt(i)+1) + ' | currindex: ' + latestindex[itmcatcust] + ' | currpref: ' + currpref});

                        rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i, value: currpref+'-'+padZero(latestindex[itmcatcust], 8)});
                    }
                }

                if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat || itmcatcust == subletitemcat) {
                    if (isEmpty(itmcatcust)) {
                        fields += 'Item Category, ';
                    }
                    if (isEmpty(desc)) {
                        fields += 'Description, ';
                    }
                    if (isEmpty(qty)) {
                        fields += 'Quantity, ';
                    }
                    if (isEmpty(rate)) {
                        fields += 'Rate, ';
                    }

                    if (rectype == record.Type.SALES_ORDER) {
                        log.debug({title: 'beforeSubmit', details: 'tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname});

                        if (isEmpty(tempvendor) && isEmpty(vendorname)) {
                            if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
                                throw error.create({name: 'MISSING_VENDOR', message: 'Temporary Item Vendor is missing. Enter Vendor Name to create vendor record'});
                            }
                        }
                        if (isEmpty(vendoritmcode)) {
                            fields += 'Vendor Item Code, ';
                        }
                        if (isEmpty(porate)) {
                            fields += 'PO Rate, ';
                        }
                    }
                    else if (rectype == record.Type.ESTIMATE) {
                        if (isEmpty(estporate)) {
                            fields += 'Estimated PO Rate, ';
                        }
                    }

                    if (!isEmpty(fields)) {
                        fields = fields.slice(0, -2); // remove last comma

                        if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
                            throw error.create({name: 'MISSING_SUBLIST_VALUES', message: 'Enter missing sublist fields: ' + fields});
                        }
                    }

                    if (rectype == record.Type.SALES_ORDER) {
                        // set PO vendor
                        setVendor(rec, i, subs);
                    }
                }
            }
        }

        /**
         * Set new vendors
         * @param rec
         * @param i
         * @param subs
         */
        function setVendor(rec, i, subs) {
            var vendor = rec.getSublistValue({sublistId: 'item', fieldId: 'povendor', line: i});
            var porate = rec.getSublistValue({sublistId: 'item', fieldId: 'porate', line: i});
            var povendor = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', line: i}); // Temporary Vendor
            var isperson = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_company_or_indv', line: i});
            if (isperson) {
                isperson = 'T';
            }
            else {
                isperson = 'F';
            }
            var vendorname = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name', line: i});
            var vendorphone = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_phone_no', line: i});
            var vendorcity = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_city', line: i});
            var vendorstate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_state', line: i});
            var vendorcountry = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_country', line: i});
            var vendorzip = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_zipcode', line: i});
            var vendoradd2 = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_address2', line: i});
            var vendoradd1 = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_address1', line: i});
            var vendorsub = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_sub', line: i});

            log.debug({title: 'setVendor', details: 'i: ' + i +  ' | tempvendor: ' + povendor + ' | vendorsub: ' + vendorsub + ' | actualvendor: ' + vendor
                    + ' | isperson: ' + isperson + ' | vendorname: ' + vendorname + ' | vendorphone: ' + vendorphone
                    + ' | vendorcity: ' + vendorcity + ' | vendorstate: ' + vendorstate + ' | vendorcountry: ' + vendorcountry
                    + ' | vendorzip: ' + vendorzip + ' | vendoradd2: ' + vendoradd2 + ' | vendoradd1: ' + vendoradd1
            });

            if (!isEmpty(povendor)) {
                if (vendor != povendor) {
                    rec.setSublistValue({sublistId: 'item', fieldId: 'povendor', line: i, value: povendor});
                    rec.setSublistValue({sublistId: 'item', fieldId: 'porate', line: i, value: porate});
                }
                rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_porate', line: i, value: porate});
                log.debug({title: 'setVendor', details: 'PO vendor updated: ' + povendor});
            }

            // empty may mean created from nextservice
            else if (isEmpty(povendor) && !isEmpty(vendorname)) {
                // create vendor record
                var vendorrec = record.create({type: record.Type.VENDOR, isDynamic: true});

                vendorrec.setValue({fieldId: 'phone', value: vendorphone});
                vendorrec.setValue({fieldId: 'isperson', value: isperson});
                if (isperson == 'T') {
                    vendorrec.setValue({fieldId: 'firstname', value: vendorname});
                } else {
                    vendorrec.setValue({fieldId: 'companyname', value: vendorname});
                }
                if (!isEmpty(vendorsub)) {
                    vendorrec.setValue({fieldId: 'subsidiary', value: vendorsub});
                } else {
                    vendorrec.setValue({fieldId: 'subsidiary', value: subs});
                }
                // vendor address
                vendorrec.selectNewLine({sublistId: 'addressbook'});
                vendorrec.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'defaultshipping', value: true});
                vendorrec.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'defaultbilling', value: true});

                var addressSubrecord = vendorrec.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});
                addressSubrecord.setValue({fieldId: 'addrphone', value: vendorphone});
                addressSubrecord.setValue({fieldId: 'city', value: vendorcity});
                addressSubrecord.setValue({fieldId: 'state', value: vendorstate});
                //addressSubrecord.setText({fieldId: 'country', text: vendorcountry});
                addressSubrecord.setValue({fieldId: 'zip', value: vendorzip});
                addressSubrecord.setValue({fieldId: 'addr2', value: vendoradd2});
                addressSubrecord.setValue({fieldId: 'addr1', value: vendoradd1});
                vendorrec.commitLine({sublistId: 'addressbook'});

                povendor = vendorrec.save({ignoreMandatoryFields: true});
                log.debug({title: 'setVendor', details: 'Vendor created: ' + povendor});

                if (!isEmpty(povendor)) {
                    rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', line: i, value: povendor});
                    rec.setSublistValue({sublistId: 'item', fieldId: 'povendor', line: i, value: povendor});
                    rec.setSublistValue({sublistId: 'item', fieldId: 'porate', line: i, value: porate});
                    rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_porate', line: i, value: porate});
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
            // no need to filter context type. re-trigger always to set empty temporary code
            try {
                if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

                var currentScript = runtime.getCurrentScript();
                var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
                var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
                var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
                var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
                var pref = currentScript.getParameter({name: 'custscript_sna_hul_prefix'});
                var alliedpref = currentScript.getParameter({name: 'custscript_sna_hul_prefix_allied'});
                var rackingpref = currentScript.getParameter({name: 'custscript_sna_hul_prefix_racking'});
                var storagepref = currentScript.getParameter({name: 'custscript_sna_hul_prefix_storage'});
                var subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});

                var prefmapping = {};
                prefmapping[tempitemcat] = pref;
                prefmapping[allieditemcat] = alliedpref;
                prefmapping[rackingitemcat] = rackingpref;
                prefmapping[storageitemcat] = storagepref;

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var rectype = _rec.type;

                var rec = record.load({type: rectype, id: _recid});
                var entity = rec.getValue({fieldId: 'entity'});

                // search for last counter
                var latestindex = [];

                var preffil = [];
                preffil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, pref]);
                preffil.push('and');
                preffil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, tempitemcat]);

                var alliedfil = [];
                alliedfil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, alliedpref]);
                alliedfil.push('and');
                alliedfil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, allieditemcat]);

                var rackfil = [];
                rackfil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, rackingpref]);
                rackfil.push('and');
                rackfil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, rackingitemcat]);

                var storefil = [];
                storefil.push(['custcol_sna_hul_temp_item_code', search.Operator.STARTSWITH, storagepref]);
                storefil.push('and');
                storefil.push(['item.custitem_sna_hul_itemcategory', search.Operator.IS, storageitemcat]);

                var initfilters = [];
                initfilters.push(preffil);
                initfilters.push('or');
                initfilters.push(alliedfil);
                initfilters.push('or');
                initfilters.push(rackfil);
                initfilters.push('or');
                initfilters.push(storefil);

                var srch = search.load({id: 'customsearch_sna_hul_tempcode_index'});
                var erfilters = srch.filterExpression;
                erfilters.push('and');
                erfilters.push(initfilters);
                srch.filterExpression = erfilters;

                log.debug({title: 'afterSubmit', details: 'srch.filterExpression: ' + JSON.stringify(srch.filterExpression)});

                srch.run().each(function(result) {
                    var res_itmcat = result.getValue({name: 'custitem_sna_hul_itemcategory', join: 'item', summary: search.Summary.GROUP});
                    var res_pref = result.getValue({name: 'formulatext', formula: 'UPPER(SUBSTR({custcol_sna_hul_temp_item_code},0,INSTR({custcol_sna_hul_temp_item_code},\'-\')-1))', summary: search.Summary.GROUP});
                    var res_maxindex = result.getValue({name: 'formulanumeric', formula: 'TO_NUMBER(NVL(SUBSTR({custcol_sna_hul_temp_item_code},INSTR({custcol_sna_hul_temp_item_code},\'-\')+1), 0))', summary: search.Summary.MAX});

                    latestindex[res_itmcat] = forceInt(res_maxindex);
                    log.debug({title: 'afterSubmit', details: 'res_pref: ' + res_pref + ' | res_itmcat: ' + res_itmcat + ' | latestindex: ' + latestindex[res_itmcat]});

                    return true;
                });

                var itmlines = rec.getLineCount({sublistId: 'item'});

                var allitem = [];
                for (var m = 0; m < itmlines; m++) {
                    var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: m});
                    if (!isEmpty(lineitm)) {
                        allitem.push(lineitm);
                    }
                }

                var itemsourcing = getItemValues(allitem);

                // set unique code
                var hasnew = false;
                var hasnx = false;
                var poinfo = {};

                for (var j = 0; j < itmlines; j++) {
                    var lineitm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: j});
                    var lineitmcat = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j});
                    var lineitmcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: j});
                    var linecreatepo = rec.getSublistValue({sublistId: 'item', fieldId: 'createpo', line: j});
                    var linelinkedpo = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_linked_po', line: j});
                    var linevendor = rec.getSublistValue({sublistId: 'item', fieldId: 'povendor', line: j});
                    var linevendorcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code', line: j});
                    var linenxtask = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', line: j});
                    var vendorname = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name', line: j});
                    var lineshipitm = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_ship_meth_vendor', line: j});
                    var linecreateposcrpt = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_createpo', line: j});

                    if (isEmpty(lineitmcat) && !isEmpty(itemsourcing[lineitm])) {
                        lineitmcat = itemsourcing[lineitm].itemcat;

                        rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j, value: lineitmcat});
                    }

                    log.debug({title: 'afterSubmit', details: 'linecreatepo: ' + linecreatepo + ' | linecreateposcrpt: ' + linecreateposcrpt + ' | lineitmcode: ' + lineitmcode + ' | linevendorcode: ' + linevendorcode
                            + ' | linevendor: ' + linevendor + ' | linenxtask: ' + linenxtask + ' | lineshipitm: ' + lineshipitm + ' | linelinkedpo: ' + linelinkedpo + ' | lineitmcat: ' + lineitmcat});

                    if (tempitemcat == lineitmcat || lineitmcat == allieditemcat || lineitmcat == rackingitemcat || lineitmcat == storageitemcat) {
                        if (isEmpty(lineitmcode)) {
                            if (isEmpty(latestindex[lineitmcat])) {
                                latestindex[lineitmcat] = 0;
                            }

                            latestindex[lineitmcat] += 1;

                            var currpref = !isEmpty(prefmapping[lineitmcat]) ? prefmapping[lineitmcat] : pref;

                            log.debug({title: 'afterSubmit', details: 'line: ' + (forceInt(j)+1) + ' | currindex: ' + latestindex[lineitmcat] + ' | currpref: ' + currpref});

                            rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: j, value: currpref+'-'+padZero(latestindex[lineitmcat], 8)});
                            hasnew = true;
                        }
                    }

                    // need for regular items too
                    if (isEmpty(linecreatepo) && isEmpty(linelinkedpo) && !isEmpty(linevendor)) {
                        // NX sales order only
                        /*if (!isEmpty(linenxtask) && isEmpty(linecreateposcrpt) && (tempitemcat == lineitmcat || lineitmcat == allieditemcat || lineitmcat == rackingitemcat || lineitmcat == storageitemcat)) {
                            hasnx = true;

                            var indx = linevendor + '||' + 'SpecOrd';

                            if (isEmpty(poinfo[indx])) {
                                poinfo[indx] = [];
                            }

                            if (!inArray(lineshipitm, poinfo[indx])) {
                                poinfo[indx].push(lineshipitm);
                            }
                        }
                        // Create PO is set to special order or dropship
                        else*/ if (!isEmpty(linecreateposcrpt)) {
                            var indx = linevendor + '||' + linecreateposcrpt;

                            if (isEmpty(poinfo[indx])) {
                                poinfo[indx] = [];
                            }

                            if (!inArray(lineshipitm, poinfo[indx])) {
                                poinfo[indx].push(lineshipitm);
                            }
                        }
                    }
                }

                if (hasnew) {
                    rec.save();
                    log.debug({title: 'afterSubmit', details: 'Lines updated: ' + _recid});
                }

                if (rectype == record.Type.SALES_ORDER) {
                    var hasdiffqty = checkQtyChange(_recid, [tempitemcat, allieditemcat, rackingitemcat, storageitemcat, subletitemcat]);

                    if (!isEmpty(poinfo) || hasdiffqty) {
                        createPO(_recid, entity, poinfo, hasnx, hasdiffqty);
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

        /**
         * Get info of items
         * @param items
         * @returns {{}}
         */
        function getItemValues(items) {
            if (isEmpty(items)) return {};

            var itemvalues = {};

            var filters_ = [];
            filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: items}));
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid'}));
            columns_.push(search.createColumn({name: 'custitem_sna_hul_itemcategory'}));

            var cusrecsearch = search.create({type: 'item', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var curritm = result.getValue({name: 'internalid'});
                var curritemcat = result.getValue({name: 'custitem_sna_hul_itemcategory'});

                itemvalues[curritm] = {};
                itemvalues[curritm].itemcat = curritemcat;

                log.debug({title: 'getItemValues', details: 'itemvalues: ' + curritemcat + ' | ' + curritm});

                return true;
            });

            return itemvalues;
        }

        /**
         * Check PO qty against SO qty
         * @param _recid
         * @param tempitemcat
         * @returns {boolean}
         */
        function checkQtyChange(_recid, tempitemcat) {
            var hasdiffqty = false;

            var filters = [];
            filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: 'F'}));
            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: _recid}));
            //filters.push(search.createFilter({name: 'custcol_sna_hul_itemcategory', operator: search.Operator.ANYOF, values: tempitemcat}));
            filters.push(search.createFilter({name: 'type', join: 'applyingtransaction', operator: search.Operator.IS, values: 'PurchOrd'}));
            filters.push(search.createFilter({ name: 'formulanumeric', operator: search.Operator.EQUALTO, values: 1, formula: 'case when {quantity} != {applyingtransaction.quantity} then 1 else 0 end'}));

            var srch = search.create({type: record.Type.SALES_ORDER, filters: filters});

            var tranres = srch.run().getRange({start: 0, end: 1});

            if (!isEmpty(tranres)) {
                hasdiffqty = true;
            }

            return hasdiffqty;
        }

        /**
         * Create purchase orders
         * @param soid
         * @param entity
         * @param poinfo
         * @param hasnx
         * @param hasdiffqty
         */
        function createPO(soid, entity, poinfo, hasnx, hasdiffqty) {
            log.debug({title: 'createPO', details: 'soid: ' + soid});

            var counter = 1;
            var exit = false;

            while (!exit && counter < 6) {
                try {
                    var slUrl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_so_tempitem', deploymentId: 'customdeploy_sna_hul_sl_so_tempitem', returnExternalUrl: true});
                    https.post({url: slUrl, body: JSON.stringify({soid: soid, entity: entity, poinfo: JSON.stringify(poinfo), hasnx: hasnx, hasdiffqty: hasdiffqty})});
                    log.debug({title: 'afterSubmit', details: 'SL called: customscript_sna_hul_sl_so_tempitem'});

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

        return {beforeLoad, beforeSubmit, afterSubmit}

    });

/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to create FAM asset from FAM Process
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/3       		                 aduldulao       Initial version.
 * 2022/6/1       		                 aduldulao       Update subsidiary source
 * 2023/2/1       		                 aduldulao       After demo updates
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

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                var rec = record.load({type: _rectype, id: _recid, isDynamic: true});
                var status = rec.getValue({fieldId: 'custrecord_fam_procstatus'});
                var stagestatus = rec.getValue({fieldId: 'custrecord_fam_proccurrstagestatus'});
                var snaparams = rec.getValue({fieldId: 'custrecord_sna_fa_snaparams'});
                var snaif = rec.getValue({fieldId: 'custrecord_sna_fam_if'});
                var statevalues = rec.getValue({fieldId: 'custrecord_fam_procstateval'});
                var totalstages = rec.getValue({fieldId: 'custrecord_fam_proctotstages'});
                var procid = rec.getValue({fieldId: 'custrecord_fam_procid'});

                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | _rectype: ' + _rectype + ' | status: ' + status + ' | stagestatus: ' + stagestatus
                        + ' | snaparams: ' + snaparams + ' | snaif: ' + snaif + ' | statevalues: ' + statevalues + ' | procid: ' + procid
                });

                var processcompleted = false;
                // check if last stage has been called because FAM bundle sets the process to completed immediately
                if (!isEmpty(statevalues)) {
                    var pstatevalues = JSON.parse(statevalues);

                    for (var q = 0; q < pstatevalues.length; q++) {
                        var currstage = pstatevalues[q].stage;
                        log.debug({title: 'afterSubmit', details: 'currstage: ' + currstage});

                        if (currstage == totalstages) {
                            processcompleted = true;
                        }
                    }
                }

                // Completed
                 if (status == 3 && !isEmpty(snaif) && procid == 'disposal' && processcompleted) {
                     var currentScript = runtime.getCurrentScript();
                     var sold = currentScript.getParameter({name: 'custscript_sna_postingstatus_sold'});
                     var assetusage = currentScript.getParameter({name: 'custscript_sna_depmethod_assetusage'});

                     var fieldLookUp = search.lookupFields({type: search.Type.ITEM_FULFILLMENT, id: snaif, columns: ['createdfrom', 'trandate', 'shipaddress', 'department'/*, 'class'*/, 'location']});

                     if (!isEmpty(fieldLookUp.createdfrom)) {
                         var so = fieldLookUp.createdfrom[0].value;
                         var iftrandate = fieldLookUp.trandate;
                         var custshipaddress = fieldLookUp.shipaddress;
                         var dept = !isEmpty(fieldLookUp.department) ? fieldLookUp.department[0].value : '';
                         var clss = !isEmpty(fieldLookUp.class) ? fieldLookUp.class[0].value : '';
                         var loc = !isEmpty(fieldLookUp.location) ? fieldLookUp.location[0].value : '';
                         log.debug({title: 'afterSubmit', details: 'so: ' + so + ' | iftrandate: ' + iftrandate + ' | custshipaddress: ' + custshipaddress + ' | dept: ' + dept + ' | clss: ' + clss + ' | loc: ' + loc});

                         if (!isEmpty(snaparams) && !isEmpty(so)) {
                             var sorec = record.load({type: 'salesorder', id: so, isDynamic: true});
                             var cust = sorec.getValue({fieldId: 'entity'});
                             var subs = sorec.getValue({fieldId: 'subsidiary'});
                             var objsubs = sorec.getValue({fieldId: 'custbody_sna_hul_object_subsidiary'});

                             var parsed = JSON.parse(snaparams); // snaValues: {"4":{"qty":"1","solinekey":"2"},"28":{"qty":"1","solinekey":"3"}}

                             var faInfo = getAssetInfo(parsed);

                             // create 1 asset for each line. 1 line = 1 qty = 1 asset
                             for (var fa in parsed) {
                                 log.debug({title: 'afterSubmit', details: 'fa: ' + fa + ' | ' + JSON.stringify(parsed[fa])});

                                 var info = !isEmpty(faInfo[fa]) ? faInfo[fa] : {};
                                 log.debug({title: 'afterSubmit', details: 'info: ' + JSON.stringify(info)});

                                 var deprecmethod = !isEmpty(info.custrecord_assetaccmethod) && info.custrecord_assetaccmethod != '- None -' ? info.custrecord_assetaccmethod : '';

                                 var soline = sorec.findSublistLineWithValue({sublistId: 'item', fieldId: 'line', value: parsed[fa].solinekey});
                                 log.debug({title: 'afterSubmit', details: 'soline: ' + soline + ' | so line key: ' + parsed[fa].solinekey});

                                 if (soline != -1) {
                                     sorec.selectLine({sublistId: 'item', line: soline});
                                     var fleet = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
                                     var famstatus = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_asset_status'});
                                     var linequniquekey = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'lineuniquekey'});
                                     var amount = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'amount'});
                                     var qty = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'quantity'});
                                     var rate = forceFloat(amount) / forceFloat(qty);
                                     var fulfilledtotal = forceFloat(parsed[fa].qty) * rate;

                                     var famname = !isEmpty(info.altname) && info.altname != '- None -' ? info.altname : sorec.getCurrentSublistText({sublistId: 'item', fieldId: 'custcol_sna_fam_obj'});
                                     var famassettypetxt = !isEmpty(info.custrecord_assettype_txt) && info.custrecord_assettype_txt != '- None -' ? info.custrecord_assettype_txt : '';
                                     var famassettype = !isEmpty(info.custrecord_assettype) && info.custrecord_assettype != '- None -' ? info.custrecord_assettype : '';
                                     var famdeprules = !isEmpty(info.custrecord_assetdeprrules) && info.custrecord_assetdeprrules != '- None -' ? info.custrecord_assetdeprrules : '';;
                                     var famrevrules = !isEmpty(info.custrecord_assetrevisionrules) && info.custrecord_assetrevisionrules != '- None -' ? info.custrecord_assetrevisionrules : '';;

                                     var famlifetime = !isEmpty(info.custrecord_assetlifetime) ? info.custrecord_assetlifetime : '';
                                     var famlastdepmethod = !isEmpty(info.custrecord_assetcurrentage) ? info.custrecord_assetcurrentage : '';
                                     var newfamlifetime = forceFloat(famlifetime) - forceFloat(famlastdepmethod);

                                     var famlifetimeusage = !isEmpty(info.custrecord_assetlifeunits) ? info.custrecord_assetlifeunits : '';
                                     var famtotalassetusage = !isEmpty(info.custrecord_usageunits) ? info.custrecord_usageunits : '';
                                     var newfamlifetimeusage = '';
                                     if (deprecmethod == assetusage) {
                                         newfamlifetimeusage = forceFloat(famlifetimeusage) - forceFloat(famtotalassetusage);
                                     }
                                     var iftrandate_d = new Date(iftrandate);
                                     var newdeprenddate = new Date(iftrandate_d.setMonth(iftrandate_d.getMonth() + newfamlifetime));
                                     var famparent = !isEmpty(info.custrecord_componentof) ? info.custrecord_componentof : '';

                                     log.debug({title: 'afterSubmit', details: 'SO Asset Status: ' + famstatus + ' | Asset Altname: ' + famname + ' | Asset Type: ' + famassettypetxt + ' | SO rate: ' + rate + ' | SO amount: ' + amount + ' | SO qty: ' + qty + ' | SO linequniquekey: ' + linequniquekey
                                        + ' | IF SO order line: ' + parsed[fa].solinekey + ' | IF qty: ' + parsed[fa].qty + ' | fulfilledtotal: ' + fulfilledtotal
                                     });

                                     log.debug({title: 'afterSubmit', details: 'deprecmethod: ' + deprecmethod + ' | famlifetime: ' + famlifetime + ' | famlastdepmethod: ' + famlastdepmethod + ' | newfamlifetime: ' + newfamlifetime
                                             + ' | famlifetimeusage: ' + famlifetimeusage + ' | famtotalassetusage: ' + famtotalassetusage + ' | newfamlifetimeusage: ' + newfamlifetimeusage + ' | newdeprenddate: ' + newdeprenddate
                                             + ' | famparent: ' + famparent
                                     });

                                     // Disposed already
                                     if (famstatus == 4) {
                                         // create 1 asset for each line. 1 line = 1 qty = 1 asset
                                         var rec = record.create({type : 'customrecord_ncfar_asset', isDynamic: true});
                                         rec.setValue({fieldId: 'altname', value: famname});
                                         rec.setValue({fieldId: 'custrecord_assetlocation', value: loc});
                                         rec.setValue({fieldId: 'custrecord_assetdepartment', value: dept});
                                         rec.setValue({fieldId: 'custrecord_assetclass', value: clss});
                                         try {
                                             rec.setText({fieldId: 'custrecord_assettype', text: famassettypetxt + ' - LC'});
                                         }
                                         catch(ee) {
                                             if (ee.message != undefined) {
                                                 log.error('ERROR' , ee.name + ' ' + ee.message);
                                             } else {
                                                 log.error('ERROR', 'Unexpected Error' , ee.toString());
                                             }
                                             rec.setValue({fieldId: 'custrecord_assettype', value: famassettype});
                                         }
                                         rec.setValue({fieldId: 'custrecord_assetcost', value: fulfilledtotal});
                                         rec.setValue({fieldId: 'custrecord_assetcurrentcost', value: fulfilledtotal});
                                         rec.setValue({fieldId: 'custrecord_assetresidualvalue', value: 0});
                                         rec.setValue({fieldId: 'custrecord_assetaccmethod', value: deprecmethod});
                                         rec.setValue({fieldId: 'custrecord_assetlifetime', value: newfamlifetime});
                                         rec.setValue({fieldId: 'custrecord_assetlifeunits', value: newfamlifetimeusage});
                                         rec.setValue({fieldId: 'custrecord_assetdeprperiod', value: 1}); // Monthly
                                         rec.setValue({fieldId: 'custrecord_assetbookvalue', value: fulfilledtotal});
                                         rec.setValue({fieldId: 'custrecord_assetstatus', value: 6}); // New - auto set
                                         rec.setValue({fieldId: 'custrecord_assetsubsidiary', value: objsubs});
                                         rec.setValue({fieldId: 'custrecord_assetinclreports', value: true});
                                         rec.setValue({fieldId: 'custrecord_assetpurchasedate', value: new Date(iftrandate)});
                                         rec.setValue({fieldId: 'custrecord_assetdeprstartdate', value: new Date(iftrandate)});
                                         rec.setValue({fieldId: 'custrecord_assetcurrentage', value: 0}); // auto set
                                         rec.setValue({fieldId: 'custrecord_assetlastdepramt', value: 0}); // auto set
                                         rec.setValue({fieldId: 'custrecord_assetlastdeprdate', value: new Date('01/01/1980')}); // auto set
                                         rec.setValue({fieldId: 'custrecord_assettargetdeprdate', value: new Date('01/01/1980')}); // auto set
                                         rec.setValue({fieldId: 'custrecord_assetdepractive', value: 1}); // True
                                         rec.setValue({fieldId: 'custrecord_assetdeprrules', value: famdeprules});
                                         rec.setValue({fieldId: 'custrecord_assetrevisionrules', value: famrevrules});
                                         rec.setValue({fieldId: 'custrecord_assetdeprenddate', value: newdeprenddate});
                                         rec.setValue({fieldId: 'custrecord_sna_customer_owned', value: true});
                                         rec.setValue({fieldId: 'custrecord_sna_fa_created', value: true});
                                         rec.setValue({fieldId: 'custrecord_sna_object', value: fleet});

                                         var recId = rec.save();
                                         log.debug({title: 'afterSubmit', details: 'customer-owned FAM Asset created: ' + recId});

                                         /*if (!isEmpty(famparent)) {
                                             record.submitFields({type: 'customrecord_ncfar_asset', id: famparent, values: {isinactive: true}});
                                             log.debug({title: 'afterSubmit', details: 'Parent fixed asset inactive: ' + famparent});
                                         }*/

                                         if (!isEmpty(recId) && !isEmpty(fleet)) {
                                             record.submitFields({type: 'customrecord_sna_objects', id: fleet,
                                                 values: {
                                                    custrecord_sna_fixed_asset: recId,
                                                     custrecord_sna_owner_status: 1, // Owner Status = Customer
                                                     custrecord_sna_posting_status: sold, // Posting Status = Sold
                                                     custrecord_sna_status: '',
                                                     custrecord_sna_rental_status: '',
                                                     custrecord_sna_customer_name: cust,
                                                     custrecord_sna_current_address: custshipaddress,
                                                     custrecord_sna_owning_loc_code: loc
                                                }
                                             });
                                         }
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
         * Get Shipping address
         * @param cust
         * @returns {string}
         */
        function getCustAddress(cust) {
            if (isEmpty(cust)) return '';

            var custinfo = {};

            var filters = [];
            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: cust}));

            var col = [];
            col.push(search.createColumn({name: 'shipaddress'}));
            col.push(search.createColumn({name: 'email'}));

            var csearch = search.create({type: 'customer', filters: filters, columns: col});

            csearch.run().each(function(result) {
                custinfo.shipaddress = result.getValue({name: 'shipaddress'});
                custinfo.email = result.getValue({name: 'email'});

                log.debug({title: 'getCustAddress', details: 'custinfo: ' + JSON.stringify(custinfo)});

                return true;
            });

            return custinfo;
        }

        /**
         * Get asset informatuon
         * @param parsed
         * @returns {{}}
         */
        function getAssetInfo(parsed) {
            var allfa = [];
            var fainfo = {};

            for (var fa in parsed) {
                if (!isEmpty(fa)) {
                    allfa.push(fa);
                }
            }

            if (isEmpty(allfa)) return fainfo;

            var filters = [];
            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: allfa}));

            var col = [];
            col.push(search.createColumn({name: 'internalid', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assetlifetime', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assettype', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assetlifetime', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assetcurrentage', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assetlifeunits', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'altname', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assetaccmethod', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assetdeprrules', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_assetrevisionrules', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_componentof', summary: 'GROUP'}));
            col.push(search.createColumn({name: 'custrecord_usageunits', join: 'CUSTRECORD_USAGEASSETID', summary: 'SUM'}));

            var fasearch = search.create({type: 'customrecord_ncfar_asset', filters: filters, columns: col});

            fasearch.run().each(function(result) {
                var id = result.getValue({name: 'internalid', summary: 'GROUP'})

                if (isEmpty(fainfo[id])) {
                    fainfo[id] = {};
                }

                fainfo[id] = {
                    custrecord_assetlifetime: result.getValue({name: 'custrecord_assetlifetime', summary: 'GROUP'}),
                    custrecord_assettype: result.getValue({name: 'custrecord_assettype', summary: 'GROUP'}),
                    custrecord_assettype_txt: result.getText({name: 'custrecord_assettype', summary: 'GROUP'}),
                    custrecord_assetlifetime: result.getValue({name: 'custrecord_assetlifetime', summary: 'GROUP'}),
                    custrecord_assetcurrentage: result.getValue({name: 'custrecord_assetcurrentage', summary: 'GROUP'}),
                    custrecord_assetlifeunits: result.getValue({name: 'custrecord_assetlifeunits', summary: 'GROUP'}),
                    altname: result.getValue({name: 'altname', summary: 'GROUP'}),
                    custrecord_assetaccmethod: result.getValue({name: 'custrecord_assetaccmethod', summary: 'GROUP'}),
                    custrecord_assetdeprrules: result.getValue({name: 'custrecord_assetdeprrules', summary: 'GROUP'}),
                    custrecord_assetrevisionrules: result.getValue({name: 'custrecord_assetrevisionrules', summary: 'GROUP'}),
                    custrecord_componentof: result.getValue({name: 'custrecord_componentof', summary: 'GROUP'}),
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

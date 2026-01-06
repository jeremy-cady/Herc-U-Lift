/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to call the asset disposal script
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/4/21       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/record', 'N/url', 'N/task', 'N/format', 'N/runtime', 'N/search'],
    /**
 * @param{https} https
 * @param{record} record
 * @param{url} url
 */
    (https, record, url, task, format, runtime, search) => {

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

                var contexttype = scriptContext.type;

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                var oldstatus = '';

                var oldrec = scriptContext.oldRecord;
                if (!isEmpty(oldrec)) {
                    oldstatus = oldrec.getValue({fieldId: 'shipstatus'});
                }

                var rec = record.load({type: _rectype, id: _recid, isDynamic: true});
                var ifstatus = rec.getValue({fieldId: 'shipstatus'});
                var createdfrom = rec.getValue({fieldId: 'createdfrom'});

                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | _rectype: ' + _rectype + ' | ifstatus: ' + ifstatus + ' | oldstatus: ' + oldstatus});

                if (contexttype == 'C' || (ifstatus == 'C' && oldstatus != 'C')) {
                    var assetsToDisposeMap = getAssetsToDispose(rec);
                    var pId = dispose(assetsToDisposeMap, _recid);
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
         * Build object from IF lines
         *
         * @param rec
         * @returns {{assetsToDisposeMapSna: {}, assetsToDisposeMap: {}}}
         */
        function getAssetsToDispose(rec) {
            var assetsToDisposeMap = {};
            var assetsToDisposeMapSna = {};
            var hasvalid = false;

            var lineItemCount = rec.getLineCount({sublistId: 'item'});

            var getComponents = checkAssetComponents(rec);
            var parentgrp = getComponents.parentgrp;
            var allcomponent = getComponents.allcomponent;

            var type = '2'; // write-off
            var date = format.parse({value: rec.getValue({fieldId: 'trandate'}), type: format.Type.DATE}).getTime();
            var inv = 'F'; // disabled if write-off
            var cust = ''; // disabled if write-off
            var item = ''; // disabled if write-off
            var tax = ''; // disabled if write-off

            var userObj = runtime.getCurrentUser();
            var permission = userObj.getPermission('TRAN_JOURNALAPPRV');

            if (inv === 'T') {
                assetsToDisposeMap.inv = inv;
            }

            assetsToDisposeMap.prmt = permission;

            for (var i = 0; i < lineItemCount; i++) {
                rec.selectLine({sublistId: 'item', line: i});
                var itemreceive = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'itemreceive'});
                var objFam = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
                var isFA = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_is_fa_form'});
                var assetstatus = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_asset_status'});
                var custowned = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_cust_owned'});
                var assetId = rec.getCurrentSublistValue({sublistId : 'item', fieldId : 'custcol_sna_fam_obj'}); // assumed asset in line is the oldest purchase date ccomponent
                var parentAsset = !isEmpty(parentgrp[assetId]) ? parentgrp[assetId] : '';

                log.debug({title: 'getAssetsToDispose', details: i + ' | itemreceive: ' + itemreceive + ' | assetId: ' + assetId + ' | objFam: ' + objFam + ' | isFA: ' + isFA + ' | assetstatus: ' + assetstatus + ' | custowned: ' + custowned + ' | parentAsset: ' + parentAsset});

                // Disposed = 4
                if (itemreceive && isFA && !isEmpty(assetId) && assetstatus != 4 && !custowned) {
                    hasvalid = true;

                    var solinekey = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'orderline'});
                    var qty = rec.getCurrentSublistValue({sublistId : 'item', fieldId : 'quantity'});
                    var assetLoc = rec.getCurrentSublistValue({sublistId : 'item', fieldId : 'custcol_sna_loc_asset'});

                    // dispose components
                    if (!isEmpty(allcomponent[parentAsset])) {
                        log.debug({title: 'getAssetsToDispose', details: 'has component'});

                        var oldestcomp = isEmpty(allcomponent[parentAsset].oldest) ? assetId : allcomponent[parentAsset].oldest; // assumed asset in line is the oldest purchase date ccomponent

                        // Components = Disposed
                        for (var w = 0; w < allcomponent[parentAsset].components.length; w++) {
                            addInAssetsToDisposeMap(assetsToDisposeMap, allcomponent[parentAsset].components[w], 'date', date);
                            addInAssetsToDisposeMap(assetsToDisposeMap, allcomponent[parentAsset].components[w], 'type', type);
                            addInAssetsToDisposeMap(assetsToDisposeMap, allcomponent[parentAsset].components[w], 'qty', JSON.stringify(qty));
                            addInAssetsToDisposeMap(assetsToDisposeMap, allcomponent[parentAsset].components[w], 'loc', assetLoc); // loc is blank in the custom page unless manually set
                        }

                        // SNA use for FAM asset creation. Object of the oldest Component based on Purchase Date will be linked to the newly created Customer-Owned Asset
                        addInAssetsToDisposeMap(assetsToDisposeMapSna, oldestcomp, 'qty', JSON.stringify(qty));
                        addInAssetsToDisposeMap(assetsToDisposeMapSna, oldestcomp, 'solinekey', solinekey);
                    }
                    else {
                        log.debug({title: 'getAssetsToDispose', details: 'no component'});

                        addInAssetsToDisposeMap(assetsToDisposeMap, assetId, 'date', date);
                        addInAssetsToDisposeMap(assetsToDisposeMap, assetId, 'type', type);
                        addInAssetsToDisposeMap(assetsToDisposeMap, assetId, 'qty', JSON.stringify(qty));
                        addInAssetsToDisposeMap(assetsToDisposeMap, assetId, 'loc', assetLoc); // loc is blank in the custom page unless manually set

                        // SNA use for FAM asset creation
                        addInAssetsToDisposeMap(assetsToDisposeMapSna, assetId, 'qty', JSON.stringify(qty));
                        addInAssetsToDisposeMap(assetsToDisposeMapSna, assetId, 'solinekey', solinekey);
                    }

                    // Parameters: {"prmt":4,"recsToProc":{"4":{"date":1651118279679,"type":"2","qty":1},"111":{"date":1651118279679,"type":"2","qty":1}}}
                    // snaValues: {"4":{"qty":1,"solinekey":"1"},"111":{"qty":1,"solinekey":"1"}}
                }
            }

            log.debug({title: 'getAssetsToDispose', details: 'hasvalid: ' + hasvalid});

            return {assetsToDisposeMap: hasvalid ? assetsToDisposeMap : {}, assetsToDisposeMapSna: hasvalid ? assetsToDisposeMapSna : {}};
        };

        /**
         * Check is asset has components
         * @param rec
         * @returns {{allcomponent: {}, parentgrp: {}}}
         */
        function checkAssetComponents(rec) {
            var allassets = [];
            var allparent = [];
            var parentgrp = {};
            var allcomponent = {};

            var lineItemCount = rec.getLineCount({sublistId: 'item'});

            for (var i = 0; i < lineItemCount; i++) {
                rec.selectLine({sublistId: 'item', line: i});
                var assetId = rec.getCurrentSublistValue({sublistId : 'item', fieldId : 'custcol_sna_fam_obj'});

                if (!isEmpty(assetId)) {
                    allassets.push(assetId);
                }
            }

            log.debug({title: 'checkAssetComponents', details: 'allassets: ' + allassets.toString()});

            if (!isEmpty(allassets)) {
                // get all parent asset first
                var filters = [];
                filters.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: allassets}));

                var columns = [];
                columns.push(search.createColumn({name: 'custrecord_componentof'}));

                var srch = search.create({type: 'customrecord_ncfar_asset', columns: columns, filters: filters});

                srch.run().each(function(result) {
                    var asst = result.id;
                    var componentof = result.getValue({name: 'custrecord_componentof'});

                    if (!isEmpty(componentof)) {
                        parentgrp[asst] = componentof;
                        allparent.push(componentof);
                    }

                    return true;
                });

                log.debug({title: 'checkAssetComponents', details: 'allparent: ' + allparent.toString()});

                if (!isEmpty(allparent)) {
                    // get other components
                    var filters = [];
                    filters.push(search.createFilter({name: 'custrecord_componentof', operator: search.Operator.ANYOF, values: allparent}));
                    filters.push(search.createFilter({name: 'custrecord_assetstatus', operator: search.Operator.NONEOF, values: 4})); // disposed
                    filters.push(search.createFilter({name: 'custrecord_sna_customer_owned', operator: search.Operator.IS, values: 'F'}));

                    var columns = [];
                    columns.push(search.createColumn({name: 'custrecord_componentof', sort: search.Sort.ASC}));
                    columns.push(search.createColumn({name: 'custrecord_assetpurchasedate', sort: search.Sort.ASC}));

                    var srch = search.create({type: 'customrecord_ncfar_asset', columns: columns, filters: filters});

                    srch.run().each(function(result) {
                        var asst = result.id;
                        var parentasset = result.getValue({name: 'custrecord_componentof'});
                        var purchdte = result.getValue({name: 'custrecord_assetpurchasedate'});

                        if (isEmpty(allcomponent[parentasset])) {
                            allcomponent[parentasset] = {};
                            allcomponent[parentasset].oldest = asst;
                            allcomponent[parentasset].components = [];
                        }

                        allcomponent[parentasset].components.push(asst);

                        return true;
                    });
                }
            }

            return {parentgrp: parentgrp, allcomponent: allcomponent};
        }

        /**
         * Set object key-values
         *
         * @param assetsToDisposeMap
         * @param assetId
         * @param key
         * @param value
         */
        function addInAssetsToDisposeMap(assetsToDisposeMap, assetId, key, value){
            assetsToDisposeMap[assetId] = assetsToDisposeMap[assetId] || {};

            if(value){
                assetsToDisposeMap[assetId][key] = value;
            }
        }

        /**
         * Call function to dispose object
         *
         * @param assetsToDisposeMap_
         * @param _recid
         * @returns {*}
         */
        function dispose(assetsToDisposeMap_, _recid){
            var stateValues = assetsToDisposeMap_.assetsToDisposeMap;
            var snaValues = assetsToDisposeMap_.assetsToDisposeMapSna;

            return callDisposalPM(stateValues, snaValues, _recid);
        };

        /**
         * Call function to create disposal
         *
         * @param stateValues
         * @param snaValues
         * @param recid
         * @returns {*}
         */
        function callDisposalPM(stateValues, snaValues, recid){
            var params = {
                prmt : stateValues.prmt
            };

            delete stateValues.prmt;

            if (stateValues.inv) {
                params.inv = stateValues.inv;
                delete stateValues.inv;
            }

            params.recsToProc = stateValues;

            log.debug({title: 'callDisposalPM', details: 'Parameters: ' + JSON.stringify(params) + ' | snaValues: ' + JSON.stringify(snaValues)});

            if (!isEmpty(stateValues)) {
                var procId = Recordcreate({
                    procId : 'disposal',
                    params : params,
                    snaparams: snaValues,
                    recid: recid
                });

                Controlinvoke();

                return procId;
            }

            return 0;
        };

        /**
         * Creates the FAM Process record/pre-requisite to dispose asset
         *
         * @param options
         * @returns {null}
         * @constructor
         */
        function Recordcreate(options) {
            var recId = null;

            if (options && options.procId) {

                try {
                    var rec = record.create({type : 'customrecord_fam_process'});

                    rec.setValue('custrecord_fam_procid', options.procId);
                    rec.setValue('custrecord_sna_fa_snacreated', true);
                    rec.setValue('custrecord_sna_fam_if', options.recid);

                    if (options.stateValues) {
                        rec.setValue('custrecord_fam_procstateval', options.stateValues);
                    }
                    if (options.params) {
                        var params = typeof options.params === 'object' ?
                            JSON.stringify(options.params) : options.params;

                        rec.setValue('custrecord_fam_procparams', params);
                    }
                    if (options.snaparams) {
                        var snaparams = typeof options.snaparams === 'object' ?
                            JSON.stringify(options.snaparams) : options.snaparams;

                        rec.setValue('custrecord_sna_fa_snaparams', snaparams);
                    }

                    recId = rec.save();
                    log.debug({title: 'Recordcreate', details: 'FAM Process created: ' + recId});
                }
                catch(ex) {
                    log.error('process util create fpr', 'error occurred: ' + JSON.stringify(ex));
                }
            }

            return recId;
        }

        /**
         * Calls standard suitelet to dispose asset
         *
         * @constructor
         */
        function Controlinvoke() {
            var urlSU = url.resolveScript({
                scriptId : 'customscript_fam_triggerprocess_su',
                deploymentId : 'customdeploy_fam_triggerprocess_su',
                returnExternalUrl : true
            });

            var response = https.request({
                method : https.Method.GET,
                url : urlSU
            });

            log.debug({title: 'Controlinvoke', details: 'FAM Trigger Process Su triggered: ' + urlSU + ' | response: ' + JSON.stringify(response)});
        };

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {afterSubmit}

    });

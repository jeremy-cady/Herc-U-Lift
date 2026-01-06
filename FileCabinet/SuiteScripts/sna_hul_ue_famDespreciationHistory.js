/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to create inventory adjustment for Used Equipment Item after asset disposal
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/10/3       		                 aduldulao       Initial version.
 * 2024/17/4       		                 aduldulao       Tran date
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search, runtime, format) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
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
                //if (scriptContext.type != scriptContext.UserEventType.CREATE) return;

                var currentScript = runtime.getCurrentScript();
                var disposal = currentScript.getParameter({name: 'custscript_sna_history_disposal'});
                var usedequipment = currentScript.getParameter({name: 'custscript_sn_hul_used_equipment'});

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                var trantype = _rec.getValue({fieldId: 'custrecord_deprhisttype'});
                var asset = _rec.getValue({fieldId: 'custrecord_deprhistasset'});
                var je = _rec.getValue({fieldId: 'custrecord_deprhistjournal'});
                var disposaldate = _rec.getValue({fieldId: 'custrecord_deprhistdate'});

                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | trantype: ' + trantype + ' | asset: ' + asset + ' | je: ' + je + ' | trandate: ' + disposaldate});

                if (trantype == disposal && !isEmpty(asset) && !isEmpty(je)) {
                    var jeflds = search.lookupFields({type: search.Type.JOURNAL_ENTRY, id: je, columns: ['tranid', 'trandate']});
                    var jename = !isEmpty(jeflds['tranid']) ? jeflds['tranid'] : '';
                    var jedate = !isEmpty(jeflds['trandate']) ? format.parse({value: jeflds['trandate'], type: format.Type.DATE}) : format.parse({value: new Date(), type: format.Type.DATE});

                    var assetflds = search.lookupFields({type: 'customrecord_ncfar_asset', id: asset, columns: ['custrecord_assetsubsidiary', 'custrecord_assetdisposalacc', 'custrecord_sna_object', 'custrecord_assetbookvalue', 'custrecord_assetlocation']});
                    var assetsubs = !isEmpty(assetflds['custrecord_assetsubsidiary']) ? assetflds['custrecord_assetsubsidiary'][0].value : '';
                    var assetobj = !isEmpty(assetflds['custrecord_sna_object']) ? assetflds['custrecord_sna_object'][0].text : '';
                    var assetdisacct = !isEmpty(assetflds['custrecord_assetdisposalacc']) ? assetflds['custrecord_assetdisposalacc'][0].value : '';
                    var assetloc = !isEmpty(assetflds['custrecord_assetlocation']) ? assetflds['custrecord_assetlocation'][0].value : '';
                    var assetbookval = !isEmpty(assetflds['custrecord_assetbookvalue']) ? assetflds['custrecord_assetbookvalue'] : '';

                    log.debug({title: 'afterSubmit', details: 'jename: ' + jename + ' | jedate: ' + jedate + ' | assetsubs: ' + assetsubs + ' | assetobj: ' + assetobj + ' | assetdisacct: ' + assetdisacct + ' | assetloc: ' + assetloc + ' | assetbookval: ' + assetbookval});

                    // create inventory adjustment
                    var iarec = record.create({type: record.Type.INVENTORY_ADJUSTMENT, isDynamic: true});
                    log.debug({title: 'afterSubmit', details: 'creating inventoryadjustment'});

                    iarec.setValue({fieldId: 'trandate', value: jedate});
                    iarec.setValue({fieldId: 'subsidiary', value: assetsubs});
                    iarec.setValue({fieldId: 'account', value: assetdisacct});
                    iarec.setValue({fieldId: 'memo', value: ('Rental Fleet Conversion || ' + jename)});
                    //iarec.setValue({fieldId: 'trandate', value: disposaldate});

                    iarec.selectNewLine({sublistId: 'inventory'});
                    iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: usedequipment});
                    iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'location', value: assetloc});
                    iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: 1});
                    iarec.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'unitcost', value: assetbookval});

                    var invsubrecord = iarec.getCurrentSublistSubrecord({sublistId: 'inventory', fieldId: 'inventorydetail'});
                    // Remove all lines
                    var _lotcount = invsubrecord.getLineCount({sublistId: 'inventoryassignment'});
                    for (var k = parseInt(_lotcount)-1; k >= 0; k--) {
                        invsubrecord.removeLine({sublistId: 'inventoryassignment', line: k});
                    }

                    invsubrecord.selectNewLine({sublistId: 'inventoryassignment'});
                    invsubrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: 1});
                    invsubrecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: assetobj});
                    invsubrecord.commitLine({sublistId: 'inventoryassignment'});

                    iarec.commitLine({sublistId: 'inventory'});

                    ia = iarec.save();
                    log.debug({title: 'afterSubmit', details: 'inventory adjustment created: ' + ia});
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

        return {afterSubmit}

    });
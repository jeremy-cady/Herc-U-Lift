/**
 * Copyright (c) 2023, ScaleNorth, Inc and/or its affiliates. All rights reserved.
 *
 * @author ckoch
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Script brief description:
 * Sources extra fields from NX Consumable to Sales Order line when NX creates/edits
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               Issue Fix Summary
 * =============================================================================================
 * 2023-08-24                           ckoch               initial
 * 2023-12-21                           ckoch               updated to validate equip asset before setting it
 *
 *
 */
define(['N/record', 'N/search'],

    (record, search) => {

        const MAPPING = {
            custrecord_sna_hul_con_work_code: 'custcol_sna_work_code',
            custrecord_sna_hul_con_repair_code: 'custcol_sna_repair_code',
            custrecord_sna_hul_con_group_code: 'custcol_sna_group_code',
            custrecord_nx_consqty: 'custcol_sna_hul_act_service_hours',
            custrecord_sna_cons_eq_asset: 'custcol_nxc_equip_asset',
            custrecord_sna_cons_retain_codes: 'custcol_sna_hul_nxc_retain_task_codes',
            custrecord_sna_cons_vendor: 'custcol_sna_hul_item_vendor',
            custrecord_sna_cons_vendor_item_code: 'custcol_sna_hul_vendor_item_code',
            custrecord_sna_cons_new_vendor: 'custcol_sna_hul_vendor_name',
            custrecord_sna_cons_subsidiary: 'custcol_sna_hul_vendor_sub',
            custrecord_sna_cons_address_1: 'custcol_sna_hul_vendor_address1',
            custrecord_sna_cons_address_2: 'custcol_sna_hul_vendor_address2',
            custrecord_sna_cons_zip: 'custcol_sna_hul_vendor_zipcode',
            custrecord_sna_cons_phone: 'custcol_sna_hul_vendor_phone_no',
            custrecord_sna_cons_po_rate: 'porate',
            custrecord_sna_cons_description: 'description',
            custrecord_nx_constask: null
        };

        const beforeSubmit = (context) => {
            if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) return;

            let rec = context.newRecord;
            let recId = rec.id;

            let newLines = getNewLines(rec);
            log.debug({ title: 'newLines', details: { recId, newLines } });
            if (newLines.length === 0) return;

            let consumables = newLines.map(line => {return line.consumable;});
            log.debug({ title: 'consumables', details: { recId, consumables } });
            if (consumables.length === 0) return;

            let consumableFields = getConsumableFields(consumables);
            log.debug({ title: 'consumableFields.before', details: { recId, consumableFields } });

            consumableFields = fixEquipmentAssets(consumableFields);
            log.debug({ title: 'consumableFields.after', details: { recId, consumableFields } });

            try {
                let taskId = null;
                let equipId = null;
                let assetObject = null;

                newLines.forEach(line => {
                    log.debug({ title: 'processNewLine', details: { recId, line } });
                    if (consumableFields.hasOwnProperty(line.consumable)) {
                        if (!taskId) {
                            taskId = consumableFields[line.consumable]['custrecord_nx_constask'] || null;
                        }
                        if (!equipId) {
                            equipId = consumableFields[line.consumable]['custrecord_sna_cons_eq_asset'] || null;
                        }
                        if (!assetObject) {
                            assetObject = consumableFields[line.consumable]['assetObject'] || null;
                        }

                        rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_sn_hul_nx_consum_src_done',
                            value: true,
                            line: line.lineIndex
                        });

                        for (let m in MAPPING) {
                            if (!MAPPING[m]) continue;

                            let curVal = rec.getSublistValue({
                                sublistId: 'item',
                                fieldId: MAPPING[m],
                                line: line.lineIndex
                            });
                            let newVal = consumableFields[line.consumable][m];

                            if (curVal == '' || curVal == null || (newVal != '' && newVal != null)) {
                                log.debug({
                                    title: 'updateLine',
                                    details: {
                                        sublistId: 'item',
                                        fieldId: MAPPING[m],
                                        value: newVal,
                                        line: line.lineIndex
                                    }
                                });
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: MAPPING[m],
                                    value: newVal,
                                    line: line.lineIndex
                                });
                            }
                        }
                    }
                });

                if (taskId) {
                    rec.setValue({
                        fieldId: 'custbody_nx_task',
                        value: taskId
                    });
                }
                if (equipId) {
                    rec.setValue({
                        fieldId: 'custbody_sna_hul_nxc_eq_asset',
                        value: equipId
                    });
                }
                if (assetObject) {
                    rec.setValue({
                        fieldId: 'custbody_sna_equipment_object',
                        value: assetObject
                    });
                }
            } catch (e) {
                log.error({
                    title: 'beforeSubmit',
                    details: { recId, consumableFields, e }
                });
            }
        };

        const fixEquipmentAssets = (consumableFields) => {
            let output = {};

            for (let c in consumableFields) {
                let fixed = consumableFields[c];
                if (fixed['assetParent'] !== fixed['nativeAsset']) {
                    fixed['custrecord_sna_cons_eq_asset'] = null;
                }
                output[c] = fixed;
            }
            return output;
        };

        const getNewLines = (rec) => {
            let output = [];

            let lineCount = rec.getLineCount({ sublistId: 'item' });

            for (let i = 0; i < lineCount; i++) {
                let isProcessed = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sn_hul_nx_consum_src_done',
                    line: i
                });
                let consumable = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_nx_consumable',
                    line: i
                }) || null;

                if (consumable && !isProcessed) {
                    output.push({
                        lineIndex: i,
                        consumable: consumable
                    });
                }
            }

            return output;
        };

        const getNewLinesAFTERSUBMIT = (soId) => {
            let output = [];

            search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['internalid', search.Operator.ANYOF, soId],
                    'and',
                    ['custcol_nx_consumable', search.Operator.NONEOF, '@NONE@'],
                    'and',
                    ['custcol_sn_hul_nx_consum_src_done', search.Operator.IS, 'F']
                ],
                columns: ['linesequencenumber', 'custcol_nx_consumable']
            }).run().each(r => {
                output.push({
                    lineIndex: (Number(r.getValue({ name: 'linesequencenumber' })) - 1),
                    consumable: r.getValue({ name: 'custcol_nx_consumable' })
                });

                return true;
            });

            return output;
        };

        const getConsumableFields = (consumableIds) => {
            let output = {};

            search.create({
                type: 'customrecord_nx_consumable',
                filters: [
                    ['internalid', search.Operator.ANYOF, consumableIds]
                ],
                columns: Object.keys(MAPPING).concat([
                    'custrecord_sna_cons_eq_asset.parent',
                    'custrecord_sna_cons_eq_asset.custrecord_sna_hul_nxcassetobject',
                    'custrecord_nx_consasset'
                ])
            }).run().each(r => {
                output[r.id] = {};
                output[r.id]['assetParent'] = r.getValue({
                    name: 'parent',
                    join: 'custrecord_sna_cons_eq_asset'
                });
                output[r.id]['assetObject'] = r.getValue({
                    name: 'custrecord_sna_hul_nxcassetobject',
                    join: 'custrecord_sna_cons_eq_asset'
                });
                output[r.id]['nativeAsset'] = r.getValue({
                    name: 'custrecord_nx_consasset'
                });
                for (let m in MAPPING) {
                    output[r.id][m] = r.getValue({ name: m });
                }

                return true;
            });

            return output;
        };

        return { beforeSubmit };

    });

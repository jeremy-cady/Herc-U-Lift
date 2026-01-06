/**
 * Copyright (c) 2023, ScaleNorth, Inc and/or its affiliates. All rights reserved.
 *
 * @author ckoch
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Script brief description:
 * Copies fields from the task to the case when created by NX "add new task" function
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               Issue Fix Summary
 * =============================================================================================
 * 2023-08-24                           ckoch               initial
 *
 *
 */
define(['N/record'],

    (record) => {

        const beforeSubmit = (context) => {
            if (context.type !== context.UserEventType.CREATE) return;

            let rec = context.newRecord;

            let taskType = rec.getValue({ fieldId: 'custevent_nx_task_type' });
            let supportCase = rec.getValue({ fieldId: 'supportcase' });
log.debug('taskType',taskType);
log.debug('supportCase',supportCase);
            if (isEmpty(taskType) || isEmpty(supportCase)) return;

            let revStream = rec.getValue({ fieldId: 'cseg_sna_revenue_st' });
            let equipAsset = rec.getValue({ fieldId: 'custevent_sn_hul_equip_asset' });

            let updateVals = {};

            if (!isEmpty(revStream)) {
                updateVals['cseg_sna_revenue_st'] = revStream;
            }
            if (!isEmpty(equipAsset)) {
                updateVals['custevent_nxc_case_assets'] = equipAsset;
            }
log.debug('updateVals',updateVals);
            if (Object.keys(updateVals).length > 0) {
                try {
                    record.submitFields({
                        type: record.Type.SUPPORT_CASE,
                        id: supportCase,
                        values: updateVals,
                        options: {
                            enablesourcing: true,
                            ignoreMandatoryFields: true
                        }
                    });
                } catch (e) {
                    log.error({
                        title: 'submitFields',
                        details: {
                            recId: rec.id,
                            updateVals: updateVals,
                            e: e
                        }
                    });
                }
            }
        };

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return { beforeSubmit };

    });

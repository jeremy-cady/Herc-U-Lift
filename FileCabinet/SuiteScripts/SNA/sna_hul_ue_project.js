/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author Vishal Pitale
*
* Script brief description:
* UE script deployed on Project Record used for:
* - Updating the Project field from its Sales Order.
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2023/12/01          114516         Vishal Pitale      Initial Version
*/


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/redirect'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        // Function is used to populate the Project Data using its originating Sales Order.
        function updateProjectFields(recVal, originalDoc, event) {
            let inProgressStatus = 2;

            let transSearchObj = search.create({ type: 'transaction',
                filters: [ ['internalid','anyof',originalDoc], 'AND', ['mainline','is','T'] ],
                columns: [ 'type', 'tranid', 'custbody_nx_asset', 'custbody_sna_hul_nxc_eq_asset', 'cseg_sna_revenue_st',
                    'custbody_sna_nxc_fmc_project_type', 'startdate', 'enddate', 'custbody_sna_hul_fmc_internal_rev_str' ] }).run().getRange(0,1);
            log.audit('transSearchObj', transSearchObj);

            let transType = transSearchObj[0].getValue({ name: 'type' });

            // Executing the code only when the transaction is Sales Order.
            if(transType == 'SalesOrd') {
                let rec = '';
                let soId = transSearchObj[0].id;
                let tranId = transSearchObj[0].getValue({ name: 'tranid' });
                let nxAsset = transSearchObj[0].getValue({ name: 'custbody_nx_asset' });
                let nxEqAsset = transSearchObj[0].getValue({ name: 'custbody_sna_hul_nxc_eq_asset' });
                let revSt = transSearchObj[0].getValue({ name: 'cseg_sna_revenue_st' });
                let fmcProjType = transSearchObj[0].getValue({ name: 'custbody_sna_nxc_fmc_project_type' });
                let startDate = transSearchObj[0].getValue({ name: 'startdate' });
                let endDate = transSearchObj[0].getValue({ name: 'enddate' });
                let fmcIntRevStream = transSearchObj[0].getValue({ name: 'custbody_sna_hul_fmc_internal_rev_str' });

                log.audit('Details', 'soId: ' + soId + ', tranId: ' + tranId + ', nxAsset: ' + nxAsset + ', nxEqAsset: ' + nxEqAsset + ', revSt: ' + revSt + ', fmcProjType: ' + fmcProjType + ', startDate: ' + startDate + ', endDate: ' + endDate + ', fmcIntRevStream: ' + fmcIntRevStream);

                if(event == 'before') {
                    rec = recVal;
                    if(!isEmpty(soId))
                        rec.setValue({ fieldId: 'custentity_sna_hul_fmc_so', value: soId });

                    if(!isEmpty(nxAsset))
                        rec.setValue({ fieldId: 'custentity_nx_asset', value: nxAsset });

                    // if(!isEmpty(revSt))
                    //     rec.setValue({ fieldId: 'cseg_sna_revenue_st', value: revSt });

                    if(!isEmpty(fmcProjType))
                        rec.setValue({ fieldId: 'custentity_nx_project_type', value: fmcProjType });

                    if(!isEmpty(startDate))
                        rec.setValue({ fieldId: 'startdate', value: startDate });

                    if(!isEmpty(endDate))
                        rec.setValue({ fieldId: 'enddate', value: endDate });

                    if(!isEmpty(fmcIntRevStream))
                        rec.setValue({ fieldId: 'cseg_sna_revenue_st', value: fmcIntRevStream });

                    rec.setValue({ fieldId: 'custentity_nx_program_update', value: true });
                    rec.setValue({ fieldId: 'custentity_sna_hul_force_auto_name', value: true });
                    rec.setValue({ fieldId: 'entitystatus', value: inProgressStatus });
                    rec.setText({ fieldId: 'companyname', value: 'To Be Generated' });
                    rec.setText({ fieldId: 'entityid', value: 'To Be Generated' });
                }

                if(event == 'after') {
                    if(!isEmpty(nxEqAsset)) {
                        rec = record.load({ type: 'job', id: recVal.id });
                        rec.setValue({fieldId: 'custentity_nxc_project_assets', value: nxEqAsset});
                        let proj = rec.save({enableSourcing: true, ignoreMandatoryFields: true});
                        log.audit('proj', proj);
                    }
                }
            } else {
                log.error('Error', 'Transaction is not Sales Order for Update Project Fields Function.');
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
        const beforeSubmit = (scriptContext) => {
            try {
                // Executing the code only when the Project is getting created.
                if(scriptContext.type == scriptContext.UserEventType.CREATE) {
                    let rec = scriptContext.newRecord;
                    // let originalDoc =  scriptContext.newRecord.getValue({ fieldId: 'originatingdoc' });
                    // log.audit('originalDoc beforeSubmit', originalDoc);
                    //
                    // // Executing the code only when the Original Document Number is not empty.
                    // if(!isEmpty(originalDoc)) {
                    //     updateProjectFields(rec, originalDoc, 'before');
                    // }

                    let hul_location = rec.getValue({ fieldId: 'custentity_sna_hul_location' });
                    if(isEmpty(hul_location)){
                        var userObj = runtime.getCurrentUser();
                        log.debug('Current User:' , userObj);
                        if(!isEmpty(userObj.location) && userObj.location > 0){
                            rec.setValue({
                                fieldId : 'custentity_sna_hul_location',
                                value : userObj.location
                            });
                        }
                    }
                }
            } catch(e) { log.error('Error', e); }
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
                // Executing the code only when the Project is getting created.
                // if(scriptContext.type == scriptContext.UserEventType.CREATE) {
                //     let rec = scriptContext.newRecord;
                //     let originalDoc =  scriptContext.newRecord.getValue({ fieldId: 'originatingdoc' });
                //     log.audit('originalDoc afterSubmit', originalDoc);
                //
                //     // Executing the code only when the Original Document Number is not empty.
                //     if(!isEmpty(originalDoc)) {
                //         updateProjectFields(rec, originalDoc, 'after');
                //     }
                // }
            } catch (e) {
                log.error('ERROR', e);
            }
        }

        return {
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        }
    });
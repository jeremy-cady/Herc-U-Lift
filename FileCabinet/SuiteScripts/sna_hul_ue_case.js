/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script for Save and Create NXC Site Asset button
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/3/28       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     */
    (record, runtime, search) => {

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
                var currscript = runtime.getCurrentScript();
                var siteform = currscript.getParameter('custscript_sna_custform_site');
                var sitetype = currscript.getParameter('custscript_sna_assettype_site');

                var rec = scriptContext.newRecord;
                var recid = rec.id;
                var rectype = rec.type;

                if (scriptContext.type != scriptContext.UserEventType.VIEW && runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
                    var siteasset = rec.getValue({fieldId: 'custevent_nx_case_asset'});

                    //if (!isEmpty(siteasset)) return; // replace with error alert

                    scriptContext.form.clientScriptModulePath = './sna_hul_cs_case.js';
                    scriptContext.form.addButton({id : 'custpage_saveandcreate', label : 'Save and Create NXC Site Asset', functionName : 'showPrompt(' + siteform + ',' + sitetype + ')'});
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
            var LOG_TITLE = 'beforeSubmit';
            try{
                var rec = scriptContext.newRecord;

                if(scriptContext.type == scriptContext.UserEventType.CREATE) {

                    var hul_location = rec.getValue({
                        fieldId : 'custevent_sna_hul_caselocation',
                    })
                    if(isEmpty(hul_location)){
                        var projectid = rec.getValue({
                            fieldId : 'company',
                        });

                        log.debug({
                            title : LOG_TITLE,
                            details :'projectid: ' + JSON.stringify(projectid)
                        });
                        var locationLookUp = search.lookupFields({
                            type : 'job',
                            id : projectid,
                            columns : 'custentity_sna_hul_location'
                        })
                        log.debug({
                            title : LOG_TITLE,
                            details :'locationLookUp: ' + JSON.stringify(locationLookUp)
                        });
                        if(!isEmpty(locationLookUp['custentity_sna_hul_location'])){
                            rec.setValue({
                                fieldId : 'custevent_sna_hul_caselocation',
                                value : locationLookUp['custentity_sna_hul_location'][0].value
                            })
                        }
                    }
                }

            }
            catch(e) {
                if (e.message != undefined) {
                    log.error(LOG_TITLE+ ' ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error(LOG_TITLE+ ' ERROR', 'Unexpected Error' , e.toString());
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
            var LOG_TITLE = 'afterSubmit';
            try{

                var rec = scriptContext.newRecord;
                var projectId = rec.getValue({fieldId: 'company'});

                var getProjectFields = search.lookupFields({
                    type : 'entity',
                    id : projectId,
                    columns : ['custentity_nx_project_type', 'cseg_sna_revenue_st','custentity_nxc_project_assets']
                });

                log.debug({
                    title : LOG_TITLE,
                    details :'getProjectFields: ' + JSON.stringify(getProjectFields)
                });

                if(!isEmpty(getProjectFields.custentity_nx_project_type)
                    &&
                    (isEmpty(getProjectFields.cseg_sna_revenue_st)  || isEmpty(getProjectFields.custentity_nxc_project_assets))){

                    if(getProjectFields.custentity_nx_project_type[0].text == "Billable"){

                        var revenueStream = rec.getValue({fieldId : 'cseg_sna_revenue_st'});
                        var equipmentAsset = rec.getValue({fieldId : 'custevent_nxc_case_assets'});
                        var values = {};
                        log.debug({
                            title : LOG_TITLE,
                            details :'revenueStream: ' + revenueStream + ' | equipmentAsset: ' + equipmentAsset
                        });

                        if(!isEmpty(revenueStream)){
                            values.cseg_sna_revenue_st = revenueStream;
                        }
                        if(!isEmpty(equipmentAsset)){
                            values.custentity_nxc_project_assets = equipmentAsset;
                        }
                    }

                    var hul_location = rec.getValue({fieldId : 'custevent_sna_hul_caselocation'});

                    if(!isEmpty(hul_location)){
                        values.custentity_sna_hul_location = hul_location;
                    }

                    if(!isEmpty(values)){
                        var id = record.submitFields({
                            type : 'job',
                            id : projectId,
                            values : values
                        })
                        log.debug({
                            title : LOG_TITLE,
                            details :'Project Updated: ' + id
                        });
                    }
                }



            }
            catch(e) {
                if (e.message != undefined) {
                    log.error(LOG_TITLE+ ' ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error(LOG_TITLE+ ' ERROR', 'Unexpected Error' , e.toString());
                }
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });

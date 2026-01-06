/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This User Event script deployed on
 * 1) Sales Rep Matrix Customer Mapping
 *    - Before Load: Disables Sales Rep(s) field
 *    - After Submit: Executes Map Reduce Script "SNA HUL MR Update Matix on Customer"
 * 2) Sales Order
 *    - After Submit: Updates Assigned on Date
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2022/10/26                           Amol Jagkar         Initial version
 *
 */
define(["N/task", "N/search", "N/record", "N/ui/serverWidget", "N/cache"], (task, search, record, serverWidget, cache) => {

    function getFullResultSet(mySearch) {
        var searchResults = [], pagedData;
        pagedData = mySearch.runPaged({ pageSize: 1000 });
        pagedData.pageRanges.forEach(function(pageRange) {
            var page = pagedData.fetch({ index: pageRange.index });
            page.data.forEach(function(result) { searchResults.push(result); });
        });
        return searchResults;
    }

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    const getCustomerZipCodes = (customerId) => {
        let zipCodes = [];
        search.create({
            type: search.Type.CUSTOMER,
            filters: [
                {name: "internalid", operator: "anyof", values: customerId},
                {name: "custrecord_sn_inactive_address", join: "Address", operator: "is", values: false}
            ],
            columns: [search.createColumn({name: "zipcode", join: "Address"})]
        }).run().each(function (result) {
            zipCodes.push(result.getValue({name: "zipcode", join: "Address"}));
            return true;
        });
        return zipCodes;
    }

    const getActiveDeployments = (stScriptId) => {
        let arrDeployments = [];

        if (!stScriptId) return [];

        let filters = [
            {name: 'scriptid', join: 'script', operator: 'is', values: stScriptId},
            {name: 'isdeployed', operator: 'is', values: true},
            {name: 'status', operator: 'anyof', values: 'NOTSCHEDULED'}
        ];

        let deploySearch = search.create({ type: search.Type.SCRIPT_DEPLOYMENT, filters, columns: ['scriptid'] });
        let deploySearchObj = getFullResultSet(deploySearch);

        for(let loop1 = 0; loop1 < deploySearchObj.length; loop1++) {
            arrDeployments.push({ id: deploySearchObj[loop1].id, name: deploySearchObj[loop1].getValue({name: 'scriptid'}) });
        }

        return arrDeployments;
    }

    const executeMR = (params) => {
        let scriptId = "customscript_sna_hul_mr_upd_matrix_oncus";
        let isSuccess = false, executeFlag = false;
        // Get all active deployments
        let arrDeployments = getActiveDeployments(scriptId);

        // var cacheVal = cache.getCache({ name: 'sna_thm_sl_markworelease_cache', scope: cache.Scope.PUBLIC }).get({ key: 'markworeleasetaskid' });
        // cache.getCache({ name: 'sna_thm_sl_markworelease_cache', scope: cache.Scope.PUBLIC }).put({ key: 'markworeleasetaskid', value: newTask });
        // cache.getCache({ name: 'sna_thm_sl_markworelease_cache', scope: cache.Scope.PUBLIC }).remove({ key: 'markworeleasetaskid' });

//         var deployList = arrDeployments.run().getRange(0,999);
// log.audit('deployList', deployList);

        arrDeployments.forEach((deployment) => {

                if (!executeFlag) {
                    try {
                        var cacheKey = deployment.name;
                        var cacheVal = cache.getCache({ name: 'sna_hul_ue_sales_rep_matrix_config', scope: cache.Scope.PUBLIC }).get({ key: cacheKey });
                        log.audit('Cache Details', 'cacheKey: ' + cacheKey + ', cacheVal: ' + cacheVal);

                        // Executing the code only when cacheVal value in not empty.
                        if (!isEmpty(cacheVal)) {
                            var taskStatus = task.checkStatus({ taskId: cacheVal });
                            log.audit('cacheval not empty taskStatus', taskStatus);
                            // Executing the code only when the task status is returned.
                            if (!isEmpty(taskStatus)) {
                                // Executing the code only when the status is not Pending or Processing.
                                if (taskStatus.status !== task.TaskStatus.PENDING && taskStatus.status !== task.TaskStatus.PROCESSING) {
                                    executeFlag = true;
                                }
                            } else { executeFlag = true; }
                        } else { executeFlag = true; }

                        log.audit('After checking cache executeFlag', executeFlag);

                        // Executing the code when executeFlag is true.
                        if(executeFlag) {
                            log.audit('Calling Map Reduce Script', 'Processing Deployment: ' + cacheKey);

                            let taskSched = task.create({taskType: task.TaskType.MAP_REDUCE});
                            taskSched.scriptId = scriptId;
                            taskSched.deploymentId = cacheKey;
                            taskSched.params = params;

                            let taskSchedId = taskSched.submit();
                            let taskStatus = task.checkStatus(taskSchedId);
                            log.audit('Calling Map Reduce Script', 'Deployment Status: ' + taskStatus.status);
                            cache.getCache({ name: 'sna_hul_ue_sales_rep_matrix_config', scope: cache.Scope.PUBLIC }).put({key: cacheKey, value: taskSchedId});
                            isSuccess = true;
                        }

                    } catch (e) {
                        log.error('Error', e);
                    }
                }

                return true;
            }
        );

        if(!isSuccess) {
            let randomId = '_sc_inv_' + new Date().getTime();

            let recDeployment = record.copy({type: 'scriptdeployment', id: arrDeployments[0].id, isDynamic: true});
            recDeployment.setValue({fieldId: 'scriptid', value: randomId});
            let deploymentId = recDeployment.save();
            log.audit({title: 'Calling Map Reduce Script', details: 'New deployment: ' + deploymentId});

            let taskSched = task.create({taskType: task.TaskType.MAP_REDUCE});
            taskSched.scriptId = scriptId;
            taskSched.deploymentId = 'customdeploy' + randomId;
            taskSched.params = params;

            let taskSchedId = taskSched.submit();
            let taskStatus = task.checkStatus(taskSchedId);
            log.audit('Calling Map Reduce Script', 'New Deployment Status: ' + taskStatus.status);

            if (taskStatus.status != task.TaskStatus.FAILED) {
                log.audit('Calling Map Reduce Script', 'New Map Reduce Script has successfully been scheduled. ');
            }
        }
    }

    const afterSubmitSalesRepMatrix = (scriptContext) => {
        if (scriptContext.type == scriptContext.UserEventType.EDIT) {
            let oldRecord = scriptContext.oldRecord;
            let newRecord = scriptContext.newRecord;

            let keys = ["custrecord_sna_state", "custrecord_sna_county", "custrecord_sna_zip_code", "custrecord_sna_rep_matrix_equipment_cat", "custrecord_sna_revenue_streams", "custrecord_sna_hul_manufacturer_cs", "custrecord_sna_rep_matrix_sales_reps", "custrecord_sna_hul_sales_rep_comm_plan", "custrecord_sna_hul_comm_plan_end_date"];

            let executeMRFlag = false;
            keys.forEach(fieldId => {
                let oldValue = oldRecord.getValue({fieldId});
                let newValue = newRecord.getValue({fieldId});

                log.debug({
                    title: "Comparing Values",
                    details: {fieldId, oldValue, newValue, flag: (oldValue != newValue)}
                });
                if (oldValue != newValue)
                    executeMRFlag = true;
            });

            if (executeMRFlag)
                executeMR({
                    custscript_sna_sales_rep_matrix: newRecord.id
                });
        }
    }

    const afterSubmitSalesOrder = (scriptContext) => {
        if (scriptContext.type == scriptContext.UserEventType.CREATE) {
            let newRecord = scriptContext.newRecord;
            let salesReps = [];
            for (let line = 0; line < newRecord.getLineCount({sublistId: "item"}); line++) {
                let salesRep = newRecord.getSublistValue({sublistId: "item", fieldId: "custcol_sna_sales_rep", line});
                if (!!salesRep)
                    salesReps.push(salesRep);
            }

            salesReps.forEach(id => {
                record.submitFields({
                    type: record.Type.EMPLOYEE, id,
                    values: {custentity_sna_sales_rep_tran_assignedon: new Date()}
                });
            })
        }
    }
    const beforeLoad = (scriptContext) => {
        if (scriptContext.newRecord.type == "customrecord_sna_salesrep_matrix_mapping") {
            scriptContext.form.getField({id: "custrecord_salesrep_mapping_sales_reps"}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            try {
                let params = scriptContext.request.parameters;
                log.debug({title: "params", details: params});
                if (params.hasOwnProperty("editSalesRep")) {
                    scriptContext.form.getField({id: "custrecord_salesrep_mapping_sales_reps"}).updateDisplayType({displayType: serverWidget.FieldDisplayType.NORMAL});
                }
            } catch (error) {
                log.error({title: "Error", details: error});
            }
        }
    }

    const afterSubmit = (scriptContext) => {
        if (scriptContext.newRecord.type == "customrecord_sna_sales_rep_matrix")
            afterSubmitSalesRepMatrix(scriptContext);


        if (scriptContext.newRecord.type == "salesorder")
            afterSubmitSalesOrder(scriptContext);
    }

    return {beforeLoad, afterSubmit, executeMR, getCustomerZipCodes}

});
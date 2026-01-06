/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Suitelet is used for global resync to update sales matrix for all customers
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2025/01/28                        Care Parba          Added Inactive custom field as filter for looking up Address
 * 2024/07/30                        Care Parba          Initial version
 *
 */
define(['N/task', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/ui/message'],
    /**
     * @param{task} task
     * @param{record} record
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{message} message
     */
    (task, record, search, serverWidget, message) => {

        const getActiveDeployments = (stScriptId) => {
            let arrDeployments = [];

            if (!stScriptId) return [];

            let filters = [
                {name: 'scriptid', join: 'script', operator: 'is', values: stScriptId},
                {name: 'isdeployed', operator: 'is', values: true},
                {name: 'status', operator: 'anyof', values: 'NOTSCHEDULED'}
            ];

            let deploySearch = search.create({type: search.Type.SCRIPT_DEPLOYMENT, filters, columns: ['scriptid']});
            let deploySearchObj = getFullResultSet(deploySearch);

            for (let loop1 = 0; loop1 < deploySearchObj.length; loop1++) {
                arrDeployments.push({
                    id: deploySearchObj[loop1].id,
                    name: deploySearchObj[loop1].getValue({name: 'scriptid'})
                });
            }

            return arrDeployments;
        }

        const executeMR = (params) => {
            let scriptId = "customscript_sna_hul_mr_update_all_cust";
            let isSuccess = false, executeFlag = false;

            // Get all active deployments
            let arrDeployments = getActiveDeployments(scriptId);

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
            });

            if (!isSuccess) {
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

        function getFullResultSet(mySearch) {
            var searchResults = [], pagedData;
            pagedData = mySearch.runPaged({ pageSize: 1000 });
            pagedData.pageRanges.forEach(function(pageRange) {
                var page = pagedData.fetch({ index: pageRange.index });
                page.data.forEach(function(result) { searchResults.push(result); });
            });
            return searchResults;
        }

        function findCustomerWithZipCode(objZipCodeArr){
            let objFilterExp = [];
            let objSubZipFilter = [];

            objFilterExp.push(["isinactive","is","F"]);

            for (var a = 0; a < objZipCodeArr.length; a++) {
                objSubZipFilter.push(['zipcode', search.Operator.CONTAINS, objZipCodeArr[a]]); //search.Operator.CONTAINS
                objSubZipFilter.push('OR');
            }
            // Remove last 'OR'
            objSubZipFilter.splice(-1, 1);
            log.debug({title: 'findCustomerWithZipCode', details: objSubZipFilter});

            if (objSubZipFilter.length > 0) {
                if(objFilterExp.length > 0) {
                    objFilterExp.push('AND');
                }
                objFilterExp.push(objSubZipFilter);
                objFilterExp.push('AND');
                objFilterExp.push(["address.custrecord_sn_inactive_address","is","F"]);
            }

            log.debug({title: 'objFilterExp', details: objFilterExp});

            let objCustomerSearch = search.create({
                type: search.Type.CUSTOMER,
                filters: objFilterExp,
                columns: [
                    search.createColumn({name: 'internalid'}),
                    search.createColumn({name: "zipcode", join: "Address"}),
                    //search.createColumn({name: "custrecord_sn_inactive_address", join: "Address"})
                ]});

            let objAllCustomerResults = searchAllResults(objCustomerSearch);

            log.debug({title: 'findCustomerWithZipCode', details: `objAllCustomerResults: ${JSON.stringify(objAllCustomerResults)}` });
            log.debug({title: 'findCustomerWithZipCode', details: `objAllCustomerResults length: ${objAllCustomerResults.length}` });

            return objAllCustomerResults;
        }

        /**
         * Search all results > 1000
         * @param objSearch
         * @param objOption
         * @returns {*|*[]|*[]}
         */
        const searchAllResults = (objSearch, objOption) => {
            if (isEmpty(objOption)) {
                objOption = {};
            }

            var arrResults = [];
            if (objOption.isLimitedResult == true) {
                var rs = objSearch.run();
                arrResults = rs.getRange(0, 1000);

                return arrResults;
            }

            var rp = objSearch.runPaged();
            rp.pageRanges.forEach(function(pageRange) {
                var myPage = rp.fetch({
                    index : pageRange.index
                });
                arrResults = arrResults.concat(myPage.data);
            });

            return arrResults;
        }

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const LOG_TITLE = "onRequest";

            log.debug({title: LOG_TITLE, details: "===========START==========="});

            let objParams = scriptContext.request.parameters;
            log.debug({title: LOG_TITLE, details: `objParams: ${JSON.stringify(objParams)}`});

            if (scriptContext.request.method === 'GET') {
                const METHOD = "GET";

                log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `scriptContext: ${JSON.stringify(scriptContext)}`
                });

                let objForm = serverWidget.createForm({
                    title: 'Global Resync'
                });

                let objZipCodeField = objForm.addField({
                    id: 'custpage_zip_code',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Zip Code (If multilple, separate by comma)'
                });
                objZipCodeField.isMandatory = true;

                objForm.addSubmitButton({
                    label: 'Resync'
                });

                scriptContext.response.writePage(objForm);
            } else {
                const METHOD = "POST";

                log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `${LOG_TITLE} ${METHOD}`
                });

                /*executeMR({
                    custscript_sna_sales_rep_global_resync: true,
                });*/

                let objRequestParams = scriptContext.request.parameters;
                let stZipCode = objRequestParams.custpage_zip_code;

                log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: {stZipCode} });
                log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: `typeof stZipCode: ${typeof stZipCode}` });

                let objZipCodeArr = stZipCode.split(',');
                objZipCodeArr = objZipCodeArr.map(s => s.trim());
                objZipCodeArr = objZipCodeArr.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                })

                log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: {objZipCodeArr} });

                let objCustomerResults = findCustomerWithZipCode(objZipCodeArr);

                log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: {objCustomerResults} });
                log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: `typeof objCustomerResults: ${typeof objCustomerResults}` });

                let objCustomerInternalIdArr = [];

                objCustomerResults.forEach((result) => {
                    let stCustomerInternalId = result.id;

                    objCustomerInternalIdArr.push(stCustomerInternalId);
                    return true;
                });

                log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: {objCustomerInternalIdArr} });
                log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: `typeof objCustomerInternalIdArr: ${typeof objCustomerInternalIdArr}` });

                let objParams = { 'custscript_sna_hul_customer_id': objCustomerInternalIdArr };

                executeMR(objParams);

                let objForm = serverWidget.createForm({
                    title: 'Global Resync in Progress'
                });

                let objZipCodeField = objForm.addField({
                    id: 'custpage_zip_code',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Zip Code (If multilple, separate by comma)'
                });
                objZipCodeField.isMandatory = true;
                objZipCodeField.defaultValue = objZipCodeArr.toString();
                objZipCodeField.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });

                objForm.addPageInitMessage({
                    type: message.Type.CONFIRMATION,
                    message: 'Resync in Progress'
                });

                scriptContext.response.writePage(objForm);
            }

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        return {onRequest}

    });

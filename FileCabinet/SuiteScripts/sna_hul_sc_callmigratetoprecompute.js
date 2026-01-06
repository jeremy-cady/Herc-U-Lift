/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SC script to call FAM Migrate to Precompute SS to create
 * the FAM Asset Values of script-created FAM assets
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/6       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/task'],
    /**
 * @param{search} search
 * @param{task} task
 */
    (search, task) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                var filters = [];
                filters.push(search.createFilter({name: 'custrecord_assetvals', operator: search.Operator.ANYOF, values: '@NONE@'}));
                filters.push(search.createFilter({name: 'custrecord_sna_fa_created', operator: search.Operator.IS, values: 'T'}));

                var fasearch = search.create({type: 'customrecord_ncfar_asset', filters: filters});
                var fares = fasearch.run().getRange({start: 0, end: 1});

                if (!isEmpty(fares)) {
                    var taskSched = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                    taskSched.scriptId = 'customscript_fam_migratetoprecompute_ss';
                    taskSched.deploymentId = 'customdeploy_fam_migratetoprecompute_ss';

                    var taskSchedId = taskSched.submit();
                    var taskStatus = task.checkStatus(taskSchedId);
                    log.debug({title: 'execute', details: 'Deployment Status: ' + taskStatus.status});
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
                return;
            }
        }

        return {execute}

    });

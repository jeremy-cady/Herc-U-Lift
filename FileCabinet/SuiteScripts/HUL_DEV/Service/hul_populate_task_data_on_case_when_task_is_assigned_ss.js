/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/05/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/task", "N/record"], function (require, exports, log, query, task, record) {
    "use strict";
    /**
    * Definition of the Scheduled script trigger point.
    * @param {Object} context
    * @param {string} context.type - The context in which the script is executed.
    *                                It is one of the values from the context.InvocationType enum.
    * @Since 2015.2
    */
    function execute(ctx) {
        try {
            // SuiteQL query to fetch Task records with changes in the last 4 minutes
            var suiteQL = "\n            SELECT \n                t.id AS task_id,\n                t.owner AS task_created_by,\n                sc.id AS case_id,\n                sc.category AS case_category,\n                sc.casenumber AS case_number,\n                sc.custevent_hul_is_assigned AS case_isAssigned,\n                t.startdate AS task_start_date,\n                t.completeddate AS task_completed_date,\n                t.custevent_nxc_task_result AS task_result,\n                t.status AS task_status,\n                t.custevent_nxc_internal_note AS task_internal_note,\n                t.custevent_nx_actions_taken AS task_actions_taken,\n                t.assigned AS task_assigned_to,\n                sn.field AS changed_field -- New column to show the field that was changed\n            FROM \n                task t\n            LEFT JOIN \n                systemnote sn \n                ON sn.recordId = t.id\n            LEFT JOIN \n                supportcase sc\n                ON sc.id = t.supportcase\n            WHERE \n                sn.field IN (\n                    'EVENT.KASSIGNED'        -- Assigned field\n                )\n                AND sn.type IN (2, 4) -- Record updates and field-level changes\n                AND sn.date >= SYSDATE - (1/288) -- Last 4 minutes\n            ORDER BY \n                t.startdate DESC\n        ";
            // Execute the query
            var results = query.runSuiteQL({ query: suiteQL });
            var resultsArray = results.asMappedResults();
            // Map results to TaskDataObject
            var taskDataObjects = resultsArray.map(function (row) {
                return {
                    taskCreatedBy: String(row.task_created_by) || '',
                    caseID: String(row.case_id) || '',
                    caseNumber: String(row.case_number) || '',
                    caseType: String(row.case_category) || '',
                    currentTaskID: String(row.task_id) || '',
                    currentStartDate: String(row.task_start_date) || '',
                    currentCompletedDate: String(row.task_completed_date) || '',
                    currentTaskResult: String(row.task_result) || '',
                    currentStatus: String(row.task_status) || '',
                    currentInternalNote: String(row.task_internal_note) || '',
                    currentActionsTaken: String(row.task_actions_taken) || '',
                    currentAssignedTo: String(row.task_assigned_to) || '',
                    fieldChanged: String(row.changed_field) || '',
                    isAssigned: row.case_isAssigned === 'T' ? true : false
                };
            });
            // Process the mapped objects
            taskDataObjects.forEach(function (task) {
                log.debug('Task Data', task);
                var thisCaseID = Number(task.caseID);
                var isAssigned = task.isAssigned;
                // log.debug('thisCaseID: ', thisCaseID);
                // const taskCreatedBy = String(task.taskCreatedBy);
                // log.debug('taskCreatedBy', taskCreatedBy);
                // const taskID = String(task.currentTaskID);
                // log.debug('taskID', taskID);
                // const department = getDepartment(taskCreatedBy);
                // log.debug('department', department);
                // if (department === '3') {
                if (!thisCaseID) {
                    log.debug('NO CASE ID!!!', thisCaseID);
                }
                else if (thisCaseID) {
                    if (thisCaseID === null) {
                        log.debug('caseID is null', thisCaseID);
                        thisCaseID = String(thisCaseID);
                    }
                    // eslint-disable-next-line max-len
                    if (thisCaseID && !isAssigned || thisCaseID !== 'null' && !isAssigned || thisCaseID !== '' && !isAssigned) {
                        // populate Task data to Case
                        var submit = record.submitFields({
                            type: record.Type.SUPPORT_CASE,
                            id: thisCaseID,
                            values: {
                                custevent_hul_current_start_date: task.currentStartDate,
                                custevent_current_task_date_completed: task.currentCompletedDate,
                                custevent_hul_current_task_status: task.currentStatus,
                                custevent_hul_current_task_result: task.currentTaskResult,
                                custevent_hul_curr_task_action_taken: task.currentActionsTaken,
                                custevent_hul_curr_task_internal_notes: task.currentInternalNote,
                                custevent_hul_curr_task_tech_assigned: task.currentAssignedTo,
                                custevent_hul_is_assigned: true
                            },
                            options: { enableSourcing: false, ignoreMandatoryFields: true }
                        });
                        log.debug('submit', submit);
                    }
                    else if (!thisCaseID || thisCaseID === 'null' || thisCaseID === '') {
                        log.debug('this record was skipped, no caseID', thisCaseID);
                    }
                }
                ;
            });
            scriptScheduler();
        }
        catch (error) {
            log.error('ERROR in execute', error);
            scriptScheduler();
        }
    }
    var scriptScheduler = function () {
        // Pause the script for 4 minutes
        log.debug('Pausing Script', 'Pausing for 4 minutes...');
        var FOUR_MINUTES_IN_MILLISECONDS = 4 * 60 * 1000;
        // Simulate a delay
        var startTime = new Date().getTime();
        var currentTime = startTime;
        while (currentTime - startTime < FOUR_MINUTES_IN_MILLISECONDS) {
            currentTime = new Date().getTime();
        }
        // Reschedule the script
        var scheduledScriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: 'customscript_hul_pop_task_on_case_assign',
            deploymentId: 'customdeploy_hul_pop_task_on_case_assign'
        });
        var taskId = scheduledScriptTask.submit();
        log.debug('Script Rescheduled', "Task ID: ".concat(taskId));
        log.debug('Execution Start', new Date().toISOString());
    };
    return { execute: execute };
});

/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/17/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/record", "N/search"], function (require, exports, log, query, record, search) {
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
            // const numDays = 7;
            var recentTasksQuery = "\n            SELECT \n                sc.id AS caseid,\n                t1.id AS currenttaskid,\n                t1.custevent_nx_start_date AS currenttaskstartdate,\n                t1.custevent_nx_end_date AS currenttaskenddate,\n                t1.custevent_nxc_task_result AS currenttaskresult,\n                t1.status AS currenttaskstatus,\n                t1.custevent_nxc_internal_note AS currenttasknote,\n                t1.custevent_nx_actions_taken AS currenttaskaction,\n                t1.assigned AS currenttaskassignedto,\n                t2.id AS previoustaskid,\n                t2.custevent_nx_start_date AS previoustaskstartdate,\n                t2.custevent_nx_end_date AS previoustaskenddate,\n                t2.custevent_nxc_task_result AS previoustaskresult,\n                t2.status AS previoustaskstatus,\n                t2.custevent_nxc_internal_note AS previoustasknote,\n                t2.custevent_nx_actions_taken AS previoustaskaction,\n                t2.assigned AS previoustaskassignedto\n            FROM \n                supportcase sc\n                LEFT JOIN (\n                    SELECT *,\n                        ROW_NUMBER() OVER (PARTITION BY supportcase ORDER BY id DESC) as rn\n                    FROM task t \n                    WHERE supportcase IS NOT NULL\n                ) t1 ON sc.id = t1.supportcase AND t1.rn = 1\n                LEFT JOIN (\n                    SELECT *,\n                        ROW_NUMBER() OVER (PARTITION BY supportcase ORDER BY id DESC) as rn\n                    FROM task \n                    WHERE supportcase IS NOT NULL\n                ) t2 ON sc.id = t2.supportcase AND t2.rn = 2\n            WHERE \n                sc.custevent_hul_current_task_number IS NULL\n                AND t1.id IS NOT NULL\n            ORDER BY sc.id ASC\n        ";
            var recentTasksQueryResults = query.runSuiteQL({
                query: recentTasksQuery
            });
            var results = recentTasksQueryResults.results;
            log.debug('results', results);
            results.forEach(function (result) {
                var taskDataObject = {
                    caseID: result.values[0],
                    currentTaskID: result.values[1],
                    currentStartDate: result.values[2],
                    currentCompletedDate: result.values[3],
                    currentTaskResult: result.values[4],
                    currentStatus: result.values[5],
                    currentInternalNote: result.values[6],
                    currentActionsTaken: result.values[7],
                    currentAssignedTo: result.values[8],
                    previousTaskID: result.values[9],
                    previousStartDate: result.values[10],
                    previousCompletedDate: result.values[11],
                    previousTaskResult: result.values[12],
                    previousStatus: result.values[13],
                    previousInternalNote: result.values[14],
                    previousActionsTaken: result.values[15],
                    previousAssignedTo: result.values[16],
                };
                // log.debug('taskDataObject', taskDataObject);
                var currentAssignedEmployee = taskDataObject.currentAssignedTo;
                var previousAssignedEmployee = taskDataObject.previousAssignedTo;
                var previousTechFields;
                var currentTechFields;
                // log.debug('currentAssignedEmployee', currentAssignedEmployee);
                // log.debug('previousAssignedEmployee', previousAssignedEmployee);
                // if there is no tech assigned on the current task, set previous tech and not currrent
                if (!currentAssignedEmployee && previousAssignedEmployee) {
                    taskDataObject.currentAssignedTo = null;
                    previousTechFields = search.lookupFields({
                        type: record.Type.EMPLOYEE,
                        id: previousAssignedEmployee,
                        columns: ['isinactive'],
                    });
                    log.debug('no current tech & previous tech is:', previousTechFields);
                    if (previousTechFields.isinactive === true) {
                        taskDataObject.previousAssignedTo = null;
                    }
                }
                // if there is no previous tech assigned, set current tech and not previous
                if (currentAssignedEmployee && !previousAssignedEmployee) {
                    taskDataObject.previousAssignedTo = null;
                    currentTechFields = search.lookupFields({
                        type: record.Type.EMPLOYEE,
                        id: currentAssignedEmployee,
                        columns: ['isinactive'],
                    });
                    log.debug('no previous tech & current tech is:', currentTechFields);
                    if (currentTechFields.isinactive === true) {
                        taskDataObject.currentAssignedTo = null;
                    }
                }
                // if there is no tech assigned to either, set both to null
                if (!currentAssignedEmployee && !previousAssignedEmployee) {
                    taskDataObject.currentAssignedTo = null;
                    taskDataObject.previousAssignedTo = null;
                    log.debug('no techs assigned at all', 0);
                }
                // if there are values for both tech assignments, we need to check if they are both active
                if (currentAssignedEmployee && previousAssignedEmployee) {
                    currentTechFields = search.lookupFields({
                        type: record.Type.EMPLOYEE,
                        id: currentAssignedEmployee,
                        columns: ['isinactive'],
                    });
                    previousTechFields = search.lookupFields({
                        type: record.Type.EMPLOYEE,
                        id: previousAssignedEmployee,
                        columns: ['isinactive'],
                    });
                    // log.debug('current tech is:', currentTechFields);
                    // log.debug('previous tech is:', previousTechFields);
                    if (currentTechFields.isinactive === true) {
                        taskDataObject.currentAssignedTo = null;
                    }
                    if (previousTechFields.isinactive === true) {
                        taskDataObject.previousAssignedTo = null;
                    }
                }
                // log.debug('taskDataObject after', taskDataObject);
                var submit = record.submitFields({
                    type: record.Type.SUPPORT_CASE,
                    id: taskDataObject.caseID,
                    values: {
                        custevent_hul_current_task_number: "".concat(taskDataObject.currentTaskID),
                        custevent_hul_current_start_date: "".concat(taskDataObject.currentStartDate),
                        custevent_current_task_date_completed: "".concat(taskDataObject.currentCompletedDate),
                        custevent_hul_current_task_status: "".concat(taskDataObject.currentStatus),
                        custevent_hul_current_task_result: "".concat(taskDataObject.currentTaskResult),
                        custevent_hul_curr_task_action_taken: "".concat(taskDataObject.currentActionsTaken),
                        custevent_hul_curr_task_internal_notes: "".concat(taskDataObject.currentInternalNote),
                        custevent_hul_curr_task_tech_assigned: "".concat(taskDataObject.currentAssignedTo),
                        custevent_hul_previous_task_number: "".concat(taskDataObject.previousTaskID),
                        custevent_hul_prev_task_start_date: "".concat(taskDataObject.previousStartDate),
                        custevent_hul_prev_task_date_completed: "".concat(taskDataObject.previousCompletedDate),
                        custevent_hul_prev_task_status: "".concat(taskDataObject.previousStatus),
                        custevent_hul_prev_task_result: "".concat(taskDataObject.previousTaskResult),
                        custevent_hul_prev_task_action_taken: "".concat(taskDataObject.previousActionsTaken),
                        custevent_hul_prev_task_internal_notes: "".concat(taskDataObject.previousInternalNote),
                        custevent_hul_prev_task_tech_assigned: "".concat(taskDataObject.previousAssignedTo),
                    }
                });
                log.debug('submit', submit);
            });
        }
        catch (error) {
            log.error('ERROR in execute', error);
        }
    }
    return { execute: execute };
});

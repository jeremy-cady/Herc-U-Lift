/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/05/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as task from 'N/task';
import * as record from 'N/record';
// import * as search from 'N/search';

// declare currentTaskData object interface
interface TaskDataObject {
    taskCreatedBy: string;
    caseID: string;
    caseNumber: string;
    caseType: string;
    currentTaskID: string;
    currentStartDate: string;
    currentCompletedDate: string;
    currentTaskResult: string;
    currentStatus: string;
    currentInternalNote: string;
    currentActionsTaken: string;
    currentAssignedTo: string;
    fieldChanged: string;
    isAssigned: boolean;
}

/**
* Definition of the Scheduled script trigger point.
* @param {Object} context
* @param {string} context.type - The context in which the script is executed.
*                                It is one of the values from the context.InvocationType enum.
* @Since 2015.2
*/
function execute(ctx: EntryPoints.Scheduled.executeContext) {
    try {
        // SuiteQL query to fetch Task records with changes in the last 4 minutes
        const suiteQL = `
            SELECT 
                t.id AS task_id,
                t.owner AS task_created_by,
                sc.id AS case_id,
                sc.category AS case_category,
                sc.casenumber AS case_number,
                sc.custevent_hul_is_assigned AS case_isAssigned,
                t.startdate AS task_start_date,
                t.completeddate AS task_completed_date,
                t.custevent_nxc_task_result AS task_result,
                t.status AS task_status,
                t.custevent_nxc_internal_note AS task_internal_note,
                t.custevent_nx_actions_taken AS task_actions_taken,
                t.assigned AS task_assigned_to,
                sn.field AS changed_field -- New column to show the field that was changed
            FROM 
                task t
            LEFT JOIN 
                systemnote sn 
                ON sn.recordId = t.id
            LEFT JOIN 
                supportcase sc
                ON sc.id = t.supportcase
            WHERE 
                sn.field IN (
                    'EVENT.KASSIGNED'        -- Assigned field
                )
                AND sn.type IN (2, 4) -- Record updates and field-level changes
                AND sn.date >= SYSDATE - (1/288) -- Last 4 minutes
            ORDER BY 
                t.startdate DESC
        `;
        // Execute the query
        const results = query.runSuiteQL({ query: suiteQL });
        const resultsArray = results.asMappedResults();
        // Map results to TaskDataObject
        const taskDataObjects: TaskDataObject[] = resultsArray.map((row) => {
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
        taskDataObjects.forEach((task) => {
            log.debug('Task Data', task);
            let thisCaseID: any = Number(task.caseID);
            const isAssigned = task.isAssigned;
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
            } else if (thisCaseID) {
                if (thisCaseID === null) {
                    log.debug('caseID is null', thisCaseID);
                    thisCaseID = String(thisCaseID);
                }
                // eslint-disable-next-line max-len
                if (thisCaseID && !isAssigned || thisCaseID !== 'null' && !isAssigned || thisCaseID !== '' && !isAssigned) {
                    // populate Task data to Case
                    const submit = record.submitFields({
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
                } else if (!thisCaseID || thisCaseID === 'null' || thisCaseID === '') {
                    log.debug('this record was skipped, no caseID', thisCaseID);
                }
            };
        });
        scriptScheduler();
    } catch (error) {
        log.error('ERROR in execute', error);
        scriptScheduler();
    }
}

const scriptScheduler = () => {
    // Pause the script for 4 minutes
    log.debug('Pausing Script', 'Pausing for 4 minutes...');
    const FOUR_MINUTES_IN_MILLISECONDS = 4 * 60 * 1000;
    // Simulate a delay
    const startTime = new Date().getTime();
    let currentTime = startTime;
    while (currentTime - startTime < FOUR_MINUTES_IN_MILLISECONDS) {
        currentTime = new Date().getTime();
    }
    // Reschedule the script
    const scheduledScriptTask = task.create({
        taskType: task.TaskType.SCHEDULED_SCRIPT,
        scriptId: 'customscript_hul_pop_task_on_case_assign',
        deploymentId: 'customdeploy_hul_pop_task_on_case_assign'
    });
    const taskId = scheduledScriptTask.submit();
    log.debug('Script Rescheduled', `Task ID: ${taskId}`);
    log.debug('Execution Start', new Date().toISOString());
};

// const getDepartment = (taskCreatedBy) => {
//     const department = String(search.lookupFields({
//         type: record.Type.EMPLOYEE,
//         id: taskCreatedBy,
//         columns: 'department'
//     }));
//     return department;
// };

export = { execute };
/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/17/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';
import * as search from 'N/search';

interface TaskDataObject {
    caseID: string;
    currentTaskID: string;
    currentStartDate: string;
    currentCompletedDate: string;
    currentTaskResult: string;
    currentStatus: string;
    currentInternalNote: string;
    currentActionsTaken: string;
    currentAssignedTo: string;
    previousTaskID: string;
    previousStartDate: string;
    previousCompletedDate: string;
    previousTaskResult: string;
    previousStatus: string;
    previousInternalNote: string;
    previousActionsTaken: string;
    previousAssignedTo: string;
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
        // const numDays = 7;
        const recentTasksQuery = `
            SELECT 
                sc.id AS caseid,
                t1.id AS currenttaskid,
                t1.custevent_nx_start_date AS currenttaskstartdate,
                t1.custevent_nx_end_date AS currenttaskenddate,
                t1.custevent_nxc_task_result AS currenttaskresult,
                t1.status AS currenttaskstatus,
                t1.custevent_nxc_internal_note AS currenttasknote,
                t1.custevent_nx_actions_taken AS currenttaskaction,
                t1.assigned AS currenttaskassignedto,
                t2.id AS previoustaskid,
                t2.custevent_nx_start_date AS previoustaskstartdate,
                t2.custevent_nx_end_date AS previoustaskenddate,
                t2.custevent_nxc_task_result AS previoustaskresult,
                t2.status AS previoustaskstatus,
                t2.custevent_nxc_internal_note AS previoustasknote,
                t2.custevent_nx_actions_taken AS previoustaskaction,
                t2.assigned AS previoustaskassignedto
            FROM 
                supportcase sc
                LEFT JOIN (
                    SELECT *,
                        ROW_NUMBER() OVER (PARTITION BY supportcase ORDER BY id DESC) as rn
                    FROM task t 
                    WHERE supportcase IS NOT NULL
                ) t1 ON sc.id = t1.supportcase AND t1.rn = 1
                LEFT JOIN (
                    SELECT *,
                        ROW_NUMBER() OVER (PARTITION BY supportcase ORDER BY id DESC) as rn
                    FROM task 
                    WHERE supportcase IS NOT NULL
                ) t2 ON sc.id = t2.supportcase AND t2.rn = 2
            WHERE 
                sc.custevent_hul_current_task_number IS NULL
                AND t1.id IS NOT NULL
            ORDER BY sc.id ASC
        `;
        const recentTasksQueryResults = query.runSuiteQL({
            query: recentTasksQuery
        });
        const results: any [] = recentTasksQueryResults.results;
        log.debug('results', results);
        results.forEach((result: any) => {
            const taskDataObject: TaskDataObject = {
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

            const currentAssignedEmployee = taskDataObject.currentAssignedTo;
            const previousAssignedEmployee = taskDataObject.previousAssignedTo;
            let previousTechFields;
            let currentTechFields;
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

            const submit = record.submitFields({
                type: record.Type.SUPPORT_CASE,
                id: taskDataObject.caseID,
                values: {
                    custevent_hul_current_task_number: `${taskDataObject.currentTaskID}`,
                    custevent_hul_current_start_date: `${taskDataObject.currentStartDate}`,
                    custevent_current_task_date_completed: `${taskDataObject.currentCompletedDate}`,
                    custevent_hul_current_task_status: `${taskDataObject.currentStatus}`,
                    custevent_hul_current_task_result: `${taskDataObject.currentTaskResult}`,
                    custevent_hul_curr_task_action_taken: `${taskDataObject.currentActionsTaken}`,
                    custevent_hul_curr_task_internal_notes: `${taskDataObject.currentInternalNote}`,
                    custevent_hul_curr_task_tech_assigned: `${taskDataObject.currentAssignedTo}`,
                    custevent_hul_previous_task_number: `${taskDataObject.previousTaskID}`,
                    custevent_hul_prev_task_start_date: `${taskDataObject.previousStartDate}`,
                    custevent_hul_prev_task_date_completed: `${taskDataObject.previousCompletedDate}`,
                    custevent_hul_prev_task_status: `${taskDataObject.previousStatus}`,
                    custevent_hul_prev_task_result: `${taskDataObject.previousTaskResult}`,
                    custevent_hul_prev_task_action_taken: `${taskDataObject.previousActionsTaken}`,
                    custevent_hul_prev_task_internal_notes: `${taskDataObject.previousInternalNote}`,
                    custevent_hul_prev_task_tech_assigned: `${taskDataObject.previousAssignedTo}`,
                }
            });
            log.debug('submit', submit);
        });
    } catch (error) {
        log.error('ERROR in execute', error);
    }
}

export = { execute };
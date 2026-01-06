/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/08/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';

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
* Marks the beginning of the Map/Reduce process and generates input data.
* @typedef {Object} ObjectRef
* @property {number} id - Internal ID of the record instance
* @property {string} type - Record type id
* @return {Array|Object|Search|RecordRef} inputSummary
* @Since 2015.2
*/
function getInputData() {
    try {
        const taskObjectArray: TaskDataObject [] = [];
        const taskObjectQuery = `
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
                CASE WHEN t2.id IS NULL THEN t1.id 
                    ELSE t2.id END AS previoustaskid,  
                CASE WHEN t2.id IS NULL THEN t1.custevent_nx_start_date 
                    ELSE t2.custevent_nx_start_date END AS previoustaskstartdate,
                CASE WHEN t2.id IS NULL THEN t1.custevent_nx_end_date 
                    ELSE t2.custevent_nx_end_date END AS previoustaskenddate,
                CASE WHEN t2.id IS NULL THEN t1.custevent_nxc_task_result 
                    ELSE t2.custevent_nxc_task_result END AS previoustaskresult,
                CASE WHEN t2.id IS NULL THEN t1.status 
                    ELSE t2.status END AS previoustaskstatus,
                CASE WHEN t2.id IS NULL THEN t1.custevent_nxc_internal_note 
                    ELSE t2.custevent_nxc_internal_note END AS previoustasknote,
                CASE WHEN t2.id IS NULL THEN t1.custevent_nx_actions_taken 
                    ELSE t2.custevent_nx_actions_taken END AS previoustaskaction,
                CASE WHEN t2.id IS NULL THEN t1.assigned 
                    ELSE t2.assigned END AS previoustaskassignedto
            FROM
                supportcase sc
            LEFT JOIN
                task t1 ON t1.supportcase = sc.id
            LEFT JOIN 
                task t2 ON t2.supportcase = sc.id AND t2.id < t1.id
            WHERE 
                sc.category = '4'
                AND sc.id > 1000000
                AND t1.id IS NOT NULL 
                AND NOT EXISTS (
                    SELECT 1
                    FROM task t3
                    WHERE t3.supportcase = sc.id
                    AND t3.id > t1.id
                )
                AND (t2.id IS NULL OR NOT EXISTS (
                    SELECT 1
                    FROM task t4
                    WHERE t4.supportcase = sc.id
                    AND t4.id > t2.id AND t4.id < t1.id
                ))
            ORDER BY
                sc.id ASC;
        `;
        const pagedData = query.runSuiteQLPaged({
            query: taskObjectQuery,
            pageSize: 1000
        });
        const pagedDataArray = pagedData.pageRanges;

        pagedDataArray.forEach((pageOfData) => {
            const page: any = pagedData.fetch({
                index: pageOfData.index
            });
            const results = page.data.results;

            results.forEach((result, index) => {
                // log.debug('result', result);
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
                taskObjectArray.push(taskDataObject);
            });
        });
        // log.debug('taskObjectArray', taskObjectArray);
        return taskObjectArray;
    } catch (error) {
        log.debug('ERROR in getInputData', error);
    };
};

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    try {
        const taskObject = JSON.parse(ctx.value);
        // log.debug('taskObject in map', taskObject);
        const caseID = taskObject.caseID;
        ctx.write({
            key: caseID,
            value: taskObject
        });
    } catch (error) {
        log.debug('ERROR in map', error);
    }
}

/**
* Executes when the reduce entry point is triggered and applies to each group.
* @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
* @Since 2015.2
*/
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
    try {
        ctx.values.forEach((value) => {
            const taskObject = JSON.parse(value);
            const caseID = ctx.key;
            // log.debug('caseID in reduce', caseID);
            // log.debug('taskObject in reduce', taskObject);

            const submit = record.submitFields({
                type: record.Type.SUPPORT_CASE,
                id: caseID,
                values: {
                    custevent_hul_current_task_number: `${taskObject.currentTaskID}`,
                    custevent_hul_current_start_date: `${taskObject.currentStartDate}`,
                    custevent_current_task_date_completed: `${taskObject.currentCompletedDate}`,
                    custevent_hul_current_task_status: `${taskObject.currentStatus}`,
                    custevent_hul_current_task_result: `${taskObject.currentTaskResult}`,
                    custevent_hul_curr_task_action_taken: `${taskObject.currentActionsTaken}`,
                    custevent_hul_curr_task_internal_notes: `${taskObject.currentInternalNote}`,
                    custevent_hul_curr_task_tech_assigned: `${taskObject.currentAssignedTo}`,
                    custevent_hul_previous_task_number: `${taskObject.previousTaskID}`,
                    custevent_hul_prev_task_start_date: `${taskObject.previousStartDate}`,
                    custevent_hul_prev_task_date_completed: `${taskObject.previousCompletedDate}`,
                    custevent_hul_prev_task_status: `${taskObject.previousStatus}`,
                    custevent_hul_prev_task_result: `${taskObject.previousTaskResult}`,
                    custevent_hul_prev_task_action_taken: `${taskObject.previousActionsTaken}`,
                    custevent_hul_prev_task_internal_notes: `${taskObject.previousInternalNote}`,
                    custevent_hul_prev_task_tech_assigned: `${taskObject.previousAssignedTo}`,
                }
            });
            log.debug('submit', submit);
        });
    } catch (error) {
        log.debug('ERROR in reduce', error);
    }
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
}

export = { getInputData, map, reduce, summarize };
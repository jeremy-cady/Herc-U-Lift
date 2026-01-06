/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/08/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/record"], function (require, exports, log, query, record) {
    "use strict";
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
            var taskObjectArray_1 = [];
            var taskObjectQuery = "\n            SELECT\n                sc.id AS caseid,\n                t1.id AS currenttaskid,\n                t1.custevent_nx_start_date AS currenttaskstartdate,\n                t1.custevent_nx_end_date AS currenttaskenddate,\n                t1.custevent_nxc_task_result AS currenttaskresult,\n                t1.status AS currenttaskstatus,\n                t1.custevent_nxc_internal_note AS currenttasknote,\n                t1.custevent_nx_actions_taken AS currenttaskaction,\n                t1.assigned AS currenttaskassignedto,\n                CASE WHEN t2.id IS NULL THEN t1.id \n                    ELSE t2.id END AS previoustaskid,  \n                CASE WHEN t2.id IS NULL THEN t1.custevent_nx_start_date \n                    ELSE t2.custevent_nx_start_date END AS previoustaskstartdate,\n                CASE WHEN t2.id IS NULL THEN t1.custevent_nx_end_date \n                    ELSE t2.custevent_nx_end_date END AS previoustaskenddate,\n                CASE WHEN t2.id IS NULL THEN t1.custevent_nxc_task_result \n                    ELSE t2.custevent_nxc_task_result END AS previoustaskresult,\n                CASE WHEN t2.id IS NULL THEN t1.status \n                    ELSE t2.status END AS previoustaskstatus,\n                CASE WHEN t2.id IS NULL THEN t1.custevent_nxc_internal_note \n                    ELSE t2.custevent_nxc_internal_note END AS previoustasknote,\n                CASE WHEN t2.id IS NULL THEN t1.custevent_nx_actions_taken \n                    ELSE t2.custevent_nx_actions_taken END AS previoustaskaction,\n                CASE WHEN t2.id IS NULL THEN t1.assigned \n                    ELSE t2.assigned END AS previoustaskassignedto\n            FROM\n                supportcase sc\n            LEFT JOIN\n                task t1 ON t1.supportcase = sc.id\n            LEFT JOIN \n                task t2 ON t2.supportcase = sc.id AND t2.id < t1.id\n            WHERE \n                sc.category = '4'\n                AND sc.id > 1000000\n                AND t1.id IS NOT NULL \n                AND NOT EXISTS (\n                    SELECT 1\n                    FROM task t3\n                    WHERE t3.supportcase = sc.id\n                    AND t3.id > t1.id\n                )\n                AND (t2.id IS NULL OR NOT EXISTS (\n                    SELECT 1\n                    FROM task t4\n                    WHERE t4.supportcase = sc.id\n                    AND t4.id > t2.id AND t4.id < t1.id\n                ))\n            ORDER BY\n                sc.id ASC;\n        ";
            var pagedData_1 = query.runSuiteQLPaged({
                query: taskObjectQuery,
                pageSize: 1000
            });
            var pagedDataArray = pagedData_1.pageRanges;
            pagedDataArray.forEach(function (pageOfData) {
                var page = pagedData_1.fetch({
                    index: pageOfData.index
                });
                var results = page.data.results;
                results.forEach(function (result, index) {
                    // log.debug('result', result);
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
                    taskObjectArray_1.push(taskDataObject);
                });
            });
            // log.debug('taskObjectArray', taskObjectArray);
            return taskObjectArray_1;
        }
        catch (error) {
            log.debug('ERROR in getInputData', error);
        }
        ;
    }
    ;
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        try {
            var taskObject = JSON.parse(ctx.value);
            // log.debug('taskObject in map', taskObject);
            var caseID = taskObject.caseID;
            ctx.write({
                key: caseID,
                value: taskObject
            });
        }
        catch (error) {
            log.debug('ERROR in map', error);
        }
    }
    /**
    * Executes when the reduce entry point is triggered and applies to each group.
    * @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
    * @Since 2015.2
    */
    function reduce(ctx) {
        try {
            ctx.values.forEach(function (value) {
                var taskObject = JSON.parse(value);
                var caseID = ctx.key;
                // log.debug('caseID in reduce', caseID);
                // log.debug('taskObject in reduce', taskObject);
                var submit = record.submitFields({
                    type: record.Type.SUPPORT_CASE,
                    id: caseID,
                    values: {
                        custevent_hul_current_task_number: "".concat(taskObject.currentTaskID),
                        custevent_hul_current_start_date: "".concat(taskObject.currentStartDate),
                        custevent_current_task_date_completed: "".concat(taskObject.currentCompletedDate),
                        custevent_hul_current_task_status: "".concat(taskObject.currentStatus),
                        custevent_hul_current_task_result: "".concat(taskObject.currentTaskResult),
                        custevent_hul_curr_task_action_taken: "".concat(taskObject.currentActionsTaken),
                        custevent_hul_curr_task_internal_notes: "".concat(taskObject.currentInternalNote),
                        custevent_hul_curr_task_tech_assigned: "".concat(taskObject.currentAssignedTo),
                        custevent_hul_previous_task_number: "".concat(taskObject.previousTaskID),
                        custevent_hul_prev_task_start_date: "".concat(taskObject.previousStartDate),
                        custevent_hul_prev_task_date_completed: "".concat(taskObject.previousCompletedDate),
                        custevent_hul_prev_task_status: "".concat(taskObject.previousStatus),
                        custevent_hul_prev_task_result: "".concat(taskObject.previousTaskResult),
                        custevent_hul_prev_task_action_taken: "".concat(taskObject.previousActionsTaken),
                        custevent_hul_prev_task_internal_notes: "".concat(taskObject.previousInternalNote),
                        custevent_hul_prev_task_tech_assigned: "".concat(taskObject.previousAssignedTo),
                    }
                });
                log.debug('submit', submit);
            });
        }
        catch (error) {
            log.debug('ERROR in reduce', error);
        }
    }
    /**
    * Executes when the summarize entry point is triggered and applies to the result set.
    * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
    * @Since 2015.2
    */
    function summarize(summary) {
    }
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});

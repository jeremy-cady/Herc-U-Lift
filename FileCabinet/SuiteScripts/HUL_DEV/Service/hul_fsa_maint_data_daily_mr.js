/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/26/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/record"], function (require, exports, log, query, record) {
    "use strict";
    ;
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
            // get any recently completed PM tasks and find that equipment asset's next upcoming PM task
            var recentTaskObjectArray = getRecentTaskData();
            // next get any newly created future PM tasks and also the most recently
            // completed PM task for that equipment asset
            var futureTaskObjectArray = getFutureTaskData();
            var combinedArray = recentTaskObjectArray.concat(futureTaskObjectArray);
            // log.debug('recentTaskObjectArray', recentTaskObjectArray);
            // log.debug('futureTaskObjectArray', futureTaskObjectArray);
            // combinedArray.forEach((object) => {
            //     log.debug('value in getInputData', object);
            // });
            // log.debug('combined array length', combinedArray.length);
            return combinedArray;
        }
        catch (error) {
            log.error('ERROR in getInputData', error);
        }
    }
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        // take data objects and map to equipment ID's
        try {
            log.debug('value in map', ctx.value);
            var maintenanceObject = JSON.parse(ctx.value);
            var equipmentID = maintenanceObject.equipment_asset;
            ctx.write({
                key: equipmentID,
                value: maintenanceObject
            });
        }
        catch (error) {
            log.error('ERROR in map', error);
        }
    }
    /**
    * Executes when the reduce entry point is triggered and applies to each group.
    * @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
    * @Since 2015.2
    */
    function reduce(ctx) {
        // take in mapped data objects and use conditionals to populate to record
        try {
            ctx.values.forEach(function (value) {
                log.debug('value in reduce', value);
                var maintenanceDataObject = JSON.parse(value);
                var equipmentID = ctx.key;
                var revenueStream = maintenanceDataObject.revenue_stream;
                var taskCategory = maintenanceDataObject.task_category;
                // log.debug('maintenanceDataObject in reduce', maintenanceDataObject);
                // log.debug('equipmentID in reduce', equipmentID);
                // log.debug('revenueStream in reduce', revenueStream);
                // log.debug('taskCategory in reduce', taskCategory);
                populateFields(equipmentID, maintenanceDataObject, revenueStream, taskCategory);
            });
        }
        catch (error) {
            log.error('ERROR in reduce', error);
        }
    }
    /**
    * Executes when the summarize entry point is triggered and applies to the result set.
    * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
    * @Since 2015.2
    */
    function summarize(summary) {
    }
    var getRecentTaskData = function () {
        var recentTaskQuery = "\n            SELECT\n                ea.id               AS equipment_id,\n                o.id                AS object_id,\n                j.id                AS project_id,\n                t.supportcase       AS case_id,\n                t.id                AS task_id,\n                t.status            AS task_status,\n                CASE \n                    WHEN j.cseg_sna_revenue_st = 263 THEN 'PM'\n                    WHEN j.cseg_sna_revenue_st = 18  THEN 'AN'\n                    WHEN j.cseg_sna_revenue_st = 19  THEN 'CO'\n                    ELSE 'Other'\n                END AS revenue_stream,\n                CASE \n                    WHEN j.custentity_nx_project_type = 4  THEN 'PM 30D'\n                    WHEN j.custentity_nx_project_type = 5  THEN 'PM 60D'\n                    WHEN j.custentity_nx_project_type = 6  THEN 'PM 90D'\n                    WHEN j.custentity_nx_project_type = 7  THEN 'PM 120D'\n                    WHEN j.custentity_nx_project_type = 8  THEN 'PM 180D'\n                    WHEN j.custentity_nx_project_type = 12 THEN 'PM 240D'\n                    WHEN j.custentity_nx_project_type = 13 THEN 'PM 270D'\n                    WHEN j.custentity_nx_project_type = 14 THEN 'PM 360D'\n                    WHEN j.custentity_nx_project_type = 15 THEN 'PM 720D'\n                    WHEN j.custentity_nx_project_type = 10 THEN 'PM Daily'\n                    ELSE 'Other'\n                END AS type,\n                CASE \n                    WHEN j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 10, 12, 13, 14, 15)\n                    THEN\n                        CASE j.custentity_nx_project_type\n                            WHEN 4  THEN '30 days'\n                            WHEN 5  THEN '60 days'\n                            WHEN 6  THEN '90 days'\n                            WHEN 7  THEN '120 days'\n                            WHEN 8  THEN '180 days'\n                            WHEN 10 THEN 'Daily'\n                            WHEN 12 THEN '240 days'\n                            WHEN 13 THEN '270 days'\n                            WHEN 14 THEN '360 days'\n                            WHEN 15 THEN '720 days'\n                        END\n                    ELSE ''\n                END AS frequency,\n                CASE \n                    WHEN NOT REGEXP_LIKE(mr.custrecord_nxc_mr_field_222, '^[0-9.]+$') THEN NULL\n                    ELSE mr.custrecord_nxc_mr_field_222\n                END AS last_maintenance_hours,\n                t.completeddate AS mr_reading_date,\n                CASE \n                    WHEN NOT REGEXP_LIKE(chm.custrecord_sna_hul_actual_reading, '^[0-9.]+$') THEN NULL\n                    ELSE chm.custrecord_sna_hul_actual_reading\n                END AS current_hours_reading,\n                chm.created AS current_hours_date,\n\t            'COMPLETED_TASK' AS task_category\n            FROM \n                task t\n            LEFT JOIN job j\n                ON j.id = t.company\n            LEFT JOIN customrecord_nx_asset ea\n                ON ea.id = j.custentity_hul_nxc_eqiup_asset\n            LEFT JOIN customrecord_sna_objects o\n                ON o.id = j.custentity_hul_nxc_equip_object\n            LEFT JOIN customrecord_nxc_mr mr\n                ON mr.custrecord_nxc_mr_task = t.id\n            LEFT JOIN customrecord_sna_hul_hour_meter chm\n                ON  j.custentity_hul_nxc_equip_object = chm.custrecord_sna_hul_object_ref\n                AND chm.created = (\n                    SELECT MAX(chm2.created)\n                    FROM customrecord_sna_hul_hour_meter chm2\n                    WHERE chm2.custrecord_sna_hul_object_ref = j.custentity_hul_nxc_equip_object\n                )\n            WHERE \n                t.status = 'COMPLETE'\n                AND j.cseg_sna_revenue_st IN (263,18,19)\n                AND j.custentity_nx_project_type IN (4,5,6,7,8,12,13,14,15,10)\n\t\t        AND t.completeddate >= CURRENT_DATE - 1\n            ORDER BY task_id ASC\n    ";
        var pagedData = query.runSuiteQLPaged({
            query: recentTaskQuery,
            pageSize: 1000
        });
        var pagedDataArray = pagedData.pageRanges;
        var resultsArray = [];
        var count = 0;
        pagedDataArray.forEach(function (pageOfData) {
            var _a, _b;
            var page = pagedData.fetch({
                index: pageOfData.index
            });
            (_b = (_a = page.data) === null || _a === void 0 ? void 0 : _a.results) === null || _b === void 0 ? void 0 : _b.forEach(function (row) {
                var value = row.values;
                // log.debug('recent_value', value);
                var equipmentID = value[0];
                var objectID = value[1];
                var projectID = value[2];
                var recentTaskID = value[4];
                var revenueStream = value[6];
                var lastHours = value[9];
                var completedDate = value[10];
                var currentHours = value[11];
                var currentHoursDate = value[12];
                var taskCategory = value[13];
                // log.debug('equipmentID', equipmentID);
                // log.debug('objectID', objectID);
                // log.debug('recent_project_id', projectID);
                // log.debug('recentTaskID', recentTaskID);
                // log.debug('revenueStream', revenueStream);
                // log.debug('lastHours', lastHours);
                // log.debug('completedDate', completedDate);
                // log.debug('currentHours', currentHours);
                // log.debug('currentHoursDate', currentHoursDate);
                // log.debug('taskCategory', taskCategory);
                var futureTaskQuery = "\n                SELECT\n\t                t.id\t\t\tAS task_id,\n\t                t.startdate\t    AS task_start_date\n                FROM\n\t                task t\n                LEFT JOIN job j\n\t                ON j.id = t.company\t\n                WHERE\n\t                t.startdate > CURRENT_DATE\n\t                AND t.createddate = (\n\t\t                SELECT\n\t\t\t                MIN(t2.createddate),\n\t\t                FROM\n\t\t\t                task t2\t\n\t\t                WHERE \n\t\t\t                t2.company = ".concat(projectID, "\n\t\t\t                AND t2.status = 'NOTSTART'\n\t                )\n\t                AND j.custentity_nx_project_type IN (4,5,6,7,8,10,12,13,14,15)\n\t                AND j.cseg_sna_revenue_st IN (18,19,263) \n            ");
                var recentTaskQueryResult = query.runSuiteQL({ query: futureTaskQuery });
                var results = recentTaskQueryResult.asMappedResults();
                if (results.length > 0) {
                    // const nextTask = results[0];
                    var nextTaskID = Number(results[0].task_id);
                    var nextTaskDate = String(results[0].task_start_date);
                    // log.debug('nextTask', nextTask);
                    // build object here
                    var recentDataObject = {
                        equipment_asset: equipmentID,
                        asset_object: objectID,
                        revenue_stream: revenueStream,
                        project_id: projectID,
                        recent_task_id: recentTaskID,
                        recent_task_end_date: completedDate,
                        future_task_id: nextTaskID,
                        future_task_start_date: nextTaskDate,
                        task_category: taskCategory,
                        maintenance_record_hours: lastHours,
                        current_hours: currentHours,
                        current_hours_date: currentHoursDate
                    };
                    resultsArray.push(recentDataObject);
                }
                else {
                    // build object here
                    var recentDataObject = {
                        equipment_asset: equipmentID,
                        asset_object: objectID,
                        revenue_stream: revenueStream,
                        project_id: projectID,
                        recent_task_id: recentTaskID,
                        recent_task_end_date: completedDate,
                        future_task_id: null,
                        future_task_start_date: null,
                        task_category: taskCategory,
                        maintenance_record_hours: lastHours,
                        current_hours: currentHours,
                        current_hours_date: currentHoursDate
                    };
                    resultsArray.push(recentDataObject);
                }
                count = count + 1;
            });
        });
        log.debug('recent count', count);
        return resultsArray;
    };
    var getFutureTaskData = function () {
        var futureTaskQuery = "\n        SELECT\n  \t        ea.id               AS equipment_id,\n            o.id                AS object_id,\n            j.id                AS project_id,\n            t.supportcase       AS case_id,\n            t.id                AS task_id,\n            t.status            AS task_status,\n\t        t.startdate\t\t    AS task_start_date,\n\t        t.createddate\t    AS task_created_date,\n\t        CASE \n          \t    WHEN NOT REGEXP_LIKE(chm.custrecord_sna_hul_actual_reading, '^[0-9.]+$') THEN NULL\n              \tELSE chm.custrecord_sna_hul_actual_reading\n      \t    END AS current_hours_reading,\n     \t    chm.created AS current_hours_date,\n        \tCASE \n         \t    WHEN j.cseg_sna_revenue_st = 263 THEN 'PM'\n               \tWHEN j.cseg_sna_revenue_st = 18  THEN 'AN'\n              \tWHEN j.cseg_sna_revenue_st = 19  THEN 'CO'\n              \tELSE 'Other'\n       \t    END AS revenue_stream,\n\t        'FUTURE_TASK' \tAS task_category\n        FROM \n     \t    task t\n        LEFT JOIN job j\n    \t    ON j.id = t.company\n        LEFT JOIN customrecord_nx_asset ea\n    \t    ON ea.id = j.custentity_hul_nxc_eqiup_asset\n        LEFT JOIN customrecord_sna_objects o\n      \t    ON o.id = j.custentity_hul_nxc_equip_object\n        LEFT JOIN customrecord_sna_hul_hour_meter chm\n      \t    ON  j.custentity_hul_nxc_equip_object = chm.custrecord_sna_hul_object_ref\n       \t    AND chm.created = (\n             \tSELECT MAX(chm2.created)\n               \tFROM customrecord_sna_hul_hour_meter chm2\n              \tWHERE chm2.custrecord_sna_hul_object_ref = j.custentity_hul_nxc_equip_object\n      \t    )\n        WHERE \n       \t    t.status = 'NOTSTART'\n      \t    AND j.cseg_sna_revenue_st IN (263,18,19)\n     \t    AND j.custentity_nx_project_type IN (4,5,6,7,8,12,13,14,15,10)\n\t        AND t.startdate >= CURRENT_DATE - 1\n\t        AND t.createddate >= CURRENT_DATE - 1\n        ORDER BY task_id ASC\n    ";
        var pagedData = query.runSuiteQLPaged({
            query: futureTaskQuery,
            pageSize: 1000
        });
        var pagedDataArray = pagedData.pageRanges;
        var resultsArray = [];
        var count = 0;
        pagedDataArray.forEach(function (pageOfData) {
            var _a, _b;
            var page = pagedData.fetch({
                index: pageOfData.index
            });
            (_b = (_a = page.data) === null || _a === void 0 ? void 0 : _a.results) === null || _b === void 0 ? void 0 : _b.forEach(function (row) {
                var value = row.values;
                // log.debug('future_value', value);
                var equipmentID = value[0];
                var objectID = value[1];
                var projectID = value[2];
                var futureTaskID = value[4];
                var revenueStream = value[10];
                var startDate = value[6];
                var currentHours = value[8];
                var currentHoursDate = value[9];
                var taskCategory = value[11];
                // log.debug('equipmentID', equipmentID);
                // log.debug('objectID', objectID);
                // log.debug('future_projectID', projectID);
                // log.debug('futureTaskID', futureTaskID);
                // log.debug('revenueStream', revenueStream);
                // log.debug('startDate', startDate);
                // log.debug('currentHours', currentHours);
                // log.debug('currentHoursDate', currentHoursDate);
                // log.debug('taskCategory', taskCategory);
                var recentTaskQuery = "\n                SELECT\n   \t                t.id                AS task_id,\n    \t            t.company           AS project_id,\n    \t            t.supportcase      \tAS case_id,\n    \t            t.status            AS task_status,\n    \t            t.completeddate \tAS completed_date,\n    \t            CASE \n        \t            WHEN NOT REGEXP_LIKE(mr.custrecord_nxc_mr_field_222, '^[0-9.]+$') THEN NULL\n        \t            ELSE mr.custrecord_nxc_mr_field_222\n    \t            END                 AS maintenance_hours\n                FROM\n   \t                task t\n                LEFT JOIN customrecord_nxc_mr mr\n      \t            ON mr.custrecord_nxc_mr_task = t.id\n                LEFT JOIN job j\n\t                ON j.id = t.company\n                WHERE\n    \t            t.company = ".concat(projectID, "\n    \t            AND t.status = 'COMPLETE'\n    \t            AND t.completeddate = (\n        \t            SELECT\n            \t\t        MAX(t2.completeddate)\n        \t            FROM\n            \t\t        task t2\n        \t            WHERE\n            \t\t        t2.company = ").concat(projectID, "\n            \t\t        AND t2.status = 'COMPLETE'\n    \t            )\n\t                AND j.custentity_nx_project_type IN (4,5,6,7,8,10,12,13,14,15)\n\t                AND j.cseg_sna_revenue_st IN (18,19,263)    \n            ");
                var recentTaskQueryResult = query.runSuiteQL({ query: recentTaskQuery });
                var results = recentTaskQueryResult.asMappedResults();
                if (results.length > 0) {
                    // const mostRecentTaskData = results[0];
                    var mostRecentTaskID = Number(results[0].task_id);
                    var mostRecentTaskHours = Number(results[0].maintenance_hours);
                    var mostRecentTaskDate = results[0].completed_date;
                    // log.debug('mostRecentTaskData', mostRecentTaskData);
                    // log.debug('mostRecentTaskID', mostRecentTaskID);
                    // log.debug('mostRecentTaskHours', mostRecentTaskHours);
                    // log.debug('mostRecentTaskDate', mostRecentTaskDate);
                    // build object here
                    var futureTaskObject = {
                        equipment_asset: equipmentID,
                        asset_object: objectID,
                        revenue_stream: revenueStream,
                        project_id: projectID,
                        recent_task_id: mostRecentTaskID,
                        recent_task_end_date: mostRecentTaskDate,
                        future_task_id: futureTaskID,
                        future_task_start_date: startDate,
                        task_category: taskCategory,
                        maintenance_record_hours: mostRecentTaskHours,
                        current_hours: currentHours,
                        current_hours_date: currentHoursDate
                    };
                    resultsArray.push(futureTaskObject);
                }
                else {
                    // build object here
                    var futureTaskObject = {
                        equipment_asset: equipmentID,
                        asset_object: objectID,
                        revenue_stream: revenueStream,
                        project_id: projectID,
                        recent_task_id: null,
                        recent_task_end_date: null,
                        future_task_id: futureTaskID,
                        future_task_start_date: startDate,
                        task_category: taskCategory,
                        maintenance_record_hours: null,
                        current_hours: currentHours,
                        current_hours_date: currentHoursDate
                    };
                    resultsArray.push(futureTaskObject);
                }
                count = count + 1;
            });
        });
        log.debug('future count', count);
        return resultsArray;
    };
    // eslint-disable-next-line max-len
    var populateFields = function (equipmentID, maintenanceDataObject, revenueStream, taskCategory) {
        var submit = '';
        switch (revenueStream) {
            case 'PM':
                // Revenue stream: PM
                switch (taskCategory) {
                    case 'CURRENT_TASK':
                        log.debug('Perform logic for: PM + Current Task', equipmentID);
                        submit = record.submitFields({
                            type: 'customrecord_nx_asset',
                            id: equipmentID,
                            values: {
                                custrecord_hul_pm_project: "".concat(maintenanceDataObject.project_id),
                                custrecord_hul_last_pm_task: "".concat(maintenanceDataObject.recent_task_id),
                                custrecord_hul_next_pm_task: "".concat(maintenanceDataObject.future_task_id),
                                custrecord_hul_last_pm_date: "".concat(maintenanceDataObject.recent_task_end_date),
                                custrecord_hul_next_pm_date: "".concat(maintenanceDataObject.future_task_start_date),
                                custrecord_hul_last_pm_hours: "".concat(maintenanceDataObject.maintenance_record_hours),
                                custrecord_hul_current_hours: "".concat(maintenanceDataObject.current_hours),
                                custrecord_hul_current_hours_date: "".concat(maintenanceDataObject.current_hours_date),
                            }
                        });
                        log.debug('submit', submit);
                        break;
                    case 'FUTURE_TASK':
                        log.debug('Perform logic for: PM + Future Task', equipmentID);
                        submit = record.submitFields({
                            type: 'customrecord_nx_asset',
                            id: equipmentID,
                            values: {
                                custrecord_hul_pm_project: "".concat(maintenanceDataObject.project_id),
                                custrecord_hul_last_pm_task: "".concat(maintenanceDataObject.recent_task_id),
                                custrecord_hul_next_pm_task: "".concat(maintenanceDataObject.future_task_id),
                                custrecord_hul_last_pm_date: "".concat(maintenanceDataObject.recent_task_end_date),
                                custrecord_hul_next_pm_date: "".concat(maintenanceDataObject.future_task_start_date),
                                custrecord_hul_last_pm_hours: "".concat(maintenanceDataObject.maintenance_record_hours),
                                custrecord_hul_current_hours: "".concat(maintenanceDataObject.current_hours),
                                custrecord_hul_current_hours_date: "".concat(maintenanceDataObject.current_hours_date),
                            }
                        });
                        log.debug('submit', submit);
                        break;
                }
                break;
            case 'AN':
                // Revenue stream: AN
                switch (taskCategory) {
                    case 'CURRENT_TASK':
                        log.debug('Perform logic for: AN + Current Task', equipmentID);
                        submit = record.submitFields({
                            type: 'customrecord_nx_asset',
                            id: equipmentID,
                            values: {
                                custrecord_hul_an_project: "".concat(maintenanceDataObject.project_id),
                                custrecord_hul_last_an_task: "".concat(maintenanceDataObject.recent_task_id),
                                custrecord_hul_next_an_task: "".concat(maintenanceDataObject.future_task_id),
                                custrecord_hul_last_an_date: "".concat(maintenanceDataObject.recent_task_end_date),
                                custrecord_hul_next_an_date: "".concat(maintenanceDataObject.future_task_start_date),
                                custrecord_hul_last_an_hours: "".concat(maintenanceDataObject.maintenance_record_hours),
                                custrecord_hul_current_hours: "".concat(maintenanceDataObject.current_hours),
                                custrecord_hul_current_hours_date: "".concat(maintenanceDataObject.current_hours_date),
                            }
                        });
                        log.debug('submit', submit);
                        break;
                    case 'FUTURE_TASK':
                        log.debug('Perform logic for: AN + Future Task', equipmentID);
                        submit = record.submitFields({
                            type: 'customrecord_nx_asset',
                            id: equipmentID,
                            values: {
                                custrecord_hul_an_project: "".concat(maintenanceDataObject.project_id),
                                custrecord_hul_last_an_task: "".concat(maintenanceDataObject.recent_task_id),
                                custrecord_hul_next_an_task: "".concat(maintenanceDataObject.future_task_id),
                                custrecord_hul_last_an_date: "".concat(maintenanceDataObject.recent_task_end_date),
                                custrecord_hul_next_an_date: "".concat(maintenanceDataObject.future_task_start_date),
                                custrecord_hul_last_an_hours: "".concat(maintenanceDataObject.maintenance_record_hours),
                                custrecord_hul_current_hours: "".concat(maintenanceDataObject.current_hours),
                                custrecord_hul_current_hours_date: "".concat(maintenanceDataObject.current_hours_date),
                            }
                        });
                        log.debug('submit', submit);
                        break;
                }
                break;
            case 'CO':
                // Revenue stream: CO
                switch (taskCategory) {
                    case 'CURRENT_TASK':
                        log.debug('Perform logic for: CO + Current Task', equipmentID);
                        submit = record.submitFields({
                            type: 'customrecord_nx_asset',
                            id: equipmentID,
                            values: {
                                custrecord_hul_co_project: "".concat(maintenanceDataObject.project_id),
                                custrecord_hul_last_co_task: "".concat(maintenanceDataObject.recent_task_id),
                                custrecord_hul_next_co_task: "".concat(maintenanceDataObject.future_task_id),
                                custrecord_hul_last_co_date: "".concat(maintenanceDataObject.recent_task_end_date),
                                custrecord_hul_next_co_date: "".concat(maintenanceDataObject.future_task_start_date),
                                custrecord_hul_last_co_hours: "".concat(maintenanceDataObject.maintenance_record_hours),
                                custrecord_hul_current_hours: "".concat(maintenanceDataObject.current_hours),
                                custrecord_hul_current_hours_date: "".concat(maintenanceDataObject.current_hours_date),
                            }
                        });
                        log.debug('submit', submit);
                        break;
                    case 'FUTURE_TASK':
                        log.debug('Perform logic for: CO + Future Task', equipmentID);
                        submit = record.submitFields({
                            type: 'customrecord_nx_asset',
                            id: equipmentID,
                            values: {
                                custrecord_hul_co_project: "".concat(maintenanceDataObject.project_id),
                                custrecord_hul_last_co_task: "".concat(maintenanceDataObject.recent_task_id),
                                custrecord_hul_next_co_task: "".concat(maintenanceDataObject.future_task_id),
                                custrecord_hul_last_co_date: "".concat(maintenanceDataObject.recent_task_end_date),
                                custrecord_hul_next_co_date: "".concat(maintenanceDataObject.future_task_start_date),
                                custrecord_hul_last_co_hours: "".concat(maintenanceDataObject.maintenance_record_hours),
                                custrecord_hul_current_hours: "".concat(maintenanceDataObject.current_hours),
                                custrecord_hul_current_hours_date: "".concat(maintenanceDataObject.current_hours_date),
                            }
                        });
                        log.debug('submit', submit);
                        break;
                }
                break;
            default:
                // Fallback if there's some unexpected value
                log.error('Unknown revenue stream:', revenueStream);
                break;
        }
    };
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});

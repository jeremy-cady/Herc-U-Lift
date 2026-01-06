/* eslint-disable max-len */
/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/11/2024
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
            var maintQuery = "\n            WITH MostRecentTask AS (\n                SELECT\n                    t.company AS project_id,\n                    t.id AS recent_task_id,\n                    t.custevent_nx_start_date AS recent_task_start_date,\n                    t.custevent_nx_end_date AS recent_task_end_date\n                FROM\n                    task t\n                WHERE\n                    t.custevent_nx_end_date < CURRENT_DATE\n                    AND t.status = 'COMPLETE'\n                    AND t.custevent_nx_end_date = (\n                        SELECT MAX(t2.custevent_nx_end_date)\n                        FROM task t2\n                        WHERE t2.company = t.company\n                        AND t2.custevent_nx_end_date < CURRENT_DATE\n                        AND t2.status = 'COMPLETE'\n                    )\n            ),\n            NextUpcomingTask AS (\n                SELECT\n                    t.company AS project_id,\n                    t.id AS future_task_id,\n                    t.custevent_nx_start_date AS future_task_start_date,\n                    t.custevent_nx_end_date AS future_task_end_date\n                FROM\n                    task t\n                WHERE\n                    t.custevent_nx_start_date > CURRENT_DATE\n                    AND t.custevent_nx_start_date = (\n                        SELECT MIN(t2.custevent_nx_start_date)\n                        FROM task t2\n                        WHERE t2.company = t.company\n                        AND t2.custevent_nx_start_date > CURRENT_DATE\n                    )\n            ),\n            MaintenanceRecords AS (\n                SELECT\n                    mr.custrecord_nxc_mr_task AS task_id,\n                    mr.id AS maintenance_record_id,\n                    CASE \n                        WHEN NOT REGEXP_LIKE(mr.custrecord_nxc_mr_field_222, '^[0-9.]+$') THEN NULL\n                        ELSE mr.custrecord_nxc_mr_field_222 -- Include valid numeric values\n                    END AS maintenance_hours\n                FROM\n                    customrecord_nxc_mr mr\n            ),\n            MostRecentHourMeter AS (\n                SELECT \n                    chm.custrecord_sna_hul_object_ref AS object_id,\n                    chm.created AS last_reading_date,\n                    CASE \n                        WHEN NOT REGEXP_LIKE(chm.custrecord_sna_hul_actual_reading, '^[0-9.]+$') THEN NULL\n                        ELSE chm.custrecord_sna_hul_actual_reading -- Include valid numeric values\n                    END AS last_reading\n                FROM \n                    customrecord_sna_hul_hour_meter chm\n                WHERE \n                    chm.created = (\n                        SELECT MAX(chm2.created)\n                        FROM customrecord_sna_hul_hour_meter chm2\n                        WHERE chm2.custrecord_sna_hul_object_ref = chm.custrecord_sna_hul_object_ref\n                    )\n            )\n            SELECT\n                j.custentity_hul_nxc_eqiup_asset AS equipment_id,\n                j.custentity_hul_nxc_equip_object AS equipment_object,\n                j.id AS project_id,\n                j.cseg_sna_revenue_st AS revenue_stream_id,\n                CASE \n                    WHEN j.cseg_sna_revenue_st = 263 THEN 'PM'\n                    WHEN j.cseg_sna_revenue_st = 18 THEN 'AN'\n                    WHEN j.cseg_sna_revenue_st = 19 THEN 'CO'\n                    ELSE 'Other'\n                END AS revenue_stream,\n                CASE \n                    WHEN j.custentity_nx_project_type = 4 THEN 'PM 30D'\n                    WHEN j.custentity_nx_project_type = 5 THEN 'PM 60D'\n                    WHEN j.custentity_nx_project_type = 6 THEN 'PM 90D'\n                    WHEN j.custentity_nx_project_type = 7 THEN 'PM 120D'\n                    WHEN j.custentity_nx_project_type = 8 THEN 'PM 180D'\n                    WHEN j.custentity_nx_project_type = 12 THEN 'PM 240D'\n                    WHEN j.custentity_nx_project_type = 13 THEN 'PM 270D'\n                    WHEN j.custentity_nx_project_type = 14 THEN 'PM 360D'\n                    WHEN j.custentity_nx_project_type = 15 THEN 'PM 720D'\n                    WHEN j.custentity_nx_project_type = 10 THEN 'PM Daily'\n                    ELSE 'Other'\n                END AS type,\n                CASE \n                    WHEN j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 12, 13, 14, 15) THEN\n                        CASE j.custentity_nx_project_type\n                            WHEN 4 THEN '30 days'\n                            WHEN 5 THEN '60 days'\n                            WHEN 6 THEN '90 days'\n                            WHEN 7 THEN '120 days'\n                            WHEN 8 THEN '180 days'\n                            WHEN 12 THEN '240 days'\n                            WHEN 13 THEN '270 days'\n                            WHEN 14 THEN '360 days'\n                            WHEN 15 THEN '720 days'\n                        END\n                    ELSE ''\n                END AS frequency,\n                mrt.recent_task_id AS recent_task_id,\n                mrt.recent_task_start_date AS recent_task_start_date,\n                mrt.recent_task_end_date AS recent_task_end_date,\n                nut.future_task_id AS future_task_id,\n                nut.future_task_start_date AS future_task_start_date,\n                nut.future_task_end_date AS future_task_end_date,\n                mr.maintenance_record_id AS maintenance_record_id,\n                mr.maintenance_hours AS maintenance_hours,\n                mrt.recent_task_start_date AS maintenance_hours_date,\n                hr.last_reading AS current_hours,\n                hr.last_reading_date AS current_hours_date\n            FROM\n                job j\n            LEFT JOIN MostRecentTask mrt\n                ON j.id = mrt.project_id\n            LEFT JOIN NextUpcomingTask nut\n                ON j.id = nut.project_id\n            LEFT JOIN MaintenanceRecords mr\n                ON mrt.recent_task_id = mr.task_id\n            LEFT JOIN MostRecentHourMeter hr\n                ON j.custentity_hul_nxc_equip_object = hr.object_id\n            WHERE\n                j.cseg_sna_revenue_st IN (263,18,19) -- Filter for specified revenue streams\n                AND j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 12, 13, 14, 15, 10)\n            ORDER BY\n                j.custentity_hul_nxc_eqiup_asset ASC;\n        ";
            var pagedData_1 = query.runSuiteQLPaged({
                query: maintQuery,
                pageSize: 1000
            });
            var pagedDataArray = pagedData_1.pageRanges;
            var resultsArray_1 = [];
            pagedDataArray.forEach(function (pageOfData) {
                var _a, _b;
                var page = pagedData_1.fetch({
                    index: pageOfData.index
                });
                (_b = (_a = page.data) === null || _a === void 0 ? void 0 : _a.results) === null || _b === void 0 ? void 0 : _b.forEach(function (row) {
                    var value = row.values;
                    var maintenanceDataObject = {
                        equipmentAsset: value[0],
                        assetObject: value[1],
                        projectID: value[2],
                        revenueStreamID: value[3],
                        revenueStream: value[4],
                        projectType: value[5],
                        projectFrequency: value[6],
                        recentTaskID: value[7],
                        recentTaskStartDate: value[8],
                        recentTaskEndDate: value[9],
                        futureTaskID: value[10],
                        futureTaskStartDate: value[11],
                        futureTaskEndDate: value[12],
                        maintenanceRecordID: value[13],
                        maintenanceRecordHours: value[14],
                        maintenanceRecordHoursDate: value[15],
                        currentHours: value[16],
                        currentHoursDate: value[17],
                    };
                    var convertedMaintenanceObject = convertToDate(maintenanceDataObject);
                    log.debug('converted object', convertedMaintenanceObject);
                    resultsArray_1.push(convertedMaintenanceObject);
                });
            });
            log.debug('resultsArray.length', resultsArray_1.length);
            return resultsArray_1;
        }
        catch (error) {
            log.debug('ERROR in getInputData', error);
        }
    }
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        try {
            var maintenanceObject = JSON.parse(ctx.value);
            log.debug('maintenanceObject in map', maintenanceObject);
            var equipmentID = maintenanceObject.equipmentAsset;
            log.debug('equipmentID', equipmentID);
            ctx.write({
                key: equipmentID,
                value: maintenanceObject
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
                var maintenanceDataObjectObject = JSON.parse(value);
                var equipmentID = ctx.key;
                var revenueStream = maintenanceDataObjectObject.revenueStream;
                log.debug('equipmentID in reduce', equipmentID);
                log.debug('maintenanceDataObjectObject in reduce', maintenanceDataObjectObject);
                log.debug('revenueStream in reduce', revenueStream);
                if (revenueStream === 'PM') {
                    var submit = record.submitFields({
                        type: 'customrecord_nx_asset',
                        id: equipmentID,
                        values: {
                            custrecord_hul_pm_project: "".concat(maintenanceDataObjectObject.projectID),
                            custrecord_hul_last_pm_task: "".concat(maintenanceDataObjectObject.recentTaskID),
                            custrecord_hul_next_pm_task: "".concat(maintenanceDataObjectObject.futureTaskID),
                            custrecord_hul_last_pm_date: "".concat(maintenanceDataObjectObject.recentTaskEndDate),
                            custrecord_hul_next_pm_date: "".concat(maintenanceDataObjectObject.futureTaskStartDate),
                            custrecord_hul_last_pm_hours: "".concat(maintenanceDataObjectObject.maintenanceRecordHours),
                            custrecord_hul_current_hours: "".concat(maintenanceDataObjectObject.currentHours),
                            custrecord_hul_current_hours_date: "".concat(maintenanceDataObjectObject.currentHoursDate),
                        }
                    });
                    log.debug('submit', submit);
                }
                else if (revenueStream === 'AN') {
                    var submit = record.submitFields({
                        type: 'customrecord_nx_asset',
                        id: equipmentID,
                        values: {
                            custrecord_hul_an_project: "".concat(maintenanceDataObjectObject.projectID),
                            custrecord_hul_last_an_task: "".concat(maintenanceDataObjectObject.recentTaskID),
                            custrecord_hul_next_an_task: "".concat(maintenanceDataObjectObject.futureTaskID),
                            custrecord_hul_last_an_date: "".concat(maintenanceDataObjectObject.recentTaskEndDate),
                            custrecord_hul_next_an_date: "".concat(maintenanceDataObjectObject.futureTaskStartDate),
                            custrecord_hul_last_an_hours: "".concat(maintenanceDataObjectObject.maintenanceRecordHours),
                            custrecord_hul_current_hours: "".concat(maintenanceDataObjectObject.currentHours),
                            custrecord_hul_current_hours_date: "".concat(maintenanceDataObjectObject.currentHoursDate),
                        }
                    });
                    log.debug('submit', submit);
                }
                else if (revenueStream === 'CO') {
                    var submit = record.submitFields({
                        type: 'customrecord_nx_asset',
                        id: equipmentID,
                        values: {
                            custrecord_hul_co_project: "".concat(maintenanceDataObjectObject.projectID),
                            custrecord_hul_last_co_task: "".concat(maintenanceDataObjectObject.recentTaskID),
                            custrecord_hul_next_co_task: "".concat(maintenanceDataObjectObject.futureTaskID),
                            custrecord_hul_last_co_date: "".concat(maintenanceDataObjectObject.recentTaskEndDate),
                            custrecord_hul_next_co_date: "".concat(maintenanceDataObjectObject.futureTaskStartDate),
                            custrecord_hul_last_co_hours: "".concat(maintenanceDataObjectObject.maintenanceRecordHours),
                            custrecord_hul_current_hours: "".concat(maintenanceDataObjectObject.currentHours),
                            custrecord_hul_current_hours_date: "".concat(maintenanceDataObjectObject.currentHoursDate),
                        }
                    });
                    log.debug('submit', submit);
                }
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
    function convertToDate(maintenanceDataObject) {
        // Create an object to map variable names to date strings
        var dateMap = {
            recentTaskStartDate: maintenanceDataObject.recentTaskStartDate,
            recentTaskEndDate: maintenanceDataObject.recentTaskEndDate,
            futureTaskStartDate: maintenanceDataObject.futureTaskStartDate,
            futureTaskEndDate: maintenanceDataObject.futureTaskEndDate,
            maintenanceRecordHoursDate: maintenanceDataObject.maintenanceRecordHoursDate,
            currentHoursDate: maintenanceDataObject.currentHoursDate,
        };
        // Iterate over the object and convert dates
        Object.keys(dateMap).forEach(function (key) {
            var dateString = dateMap[key];
            if (!dateString) {
                log.debug("Missing date for ".concat(key), key);
                maintenanceDataObject[key] = null;
                return;
            }
            var dateParts = dateString.split('/');
            if (dateParts.length !== 3) {
                log.debug("Invalid date format for ".concat(key, ": ").concat(dateString), key);
                maintenanceDataObject[key] = null;
                return;
            }
            var month = parseInt(dateParts[0], 10) - 1; // JavaScript months are 0-based
            var day = parseInt(dateParts[1], 10);
            var year = parseInt(dateParts[2], 10);
            // Validate the date components
            if (isNaN(month) || isNaN(day) || isNaN(year)) {
                log.debug("Invalid date components for ".concat(key, ": ").concat(dateString), key);
                maintenanceDataObject[key] = null;
                return;
            }
            // Create the JavaScript Date object
            var date = new Date(year, month, day);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                log.debug("Invalid date object for ".concat(key, ": ").concat(dateString), key);
                maintenanceDataObject[key] = null;
            }
            else {
                // Format the date without padStart
                var formattedDate = "".concat((date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1), "/") +
                    "".concat((date.getDate() < 10 ? '0' : '') + date.getDate(), "/") +
                    "".concat(date.getFullYear());
                maintenanceDataObject[key] = formattedDate;
            }
        });
        return maintenanceDataObject;
    }
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});

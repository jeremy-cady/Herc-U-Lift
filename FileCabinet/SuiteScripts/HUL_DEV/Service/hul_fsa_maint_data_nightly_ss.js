/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/03/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query"], function (require, exports, log, query) {
    "use strict";
    ;
    /**
    * Definition of the Scheduled script trigger point.
    * @param {Object} context
    * @param {string} context.type - The context in which the script is executed.
    *                                It is one of the values from the context.InvocationType enum.
    * @Since 2015.2
    */
    function execute(ctx) {
        try {
            var maintQuery = "\n            WITH RecentCompletedTasks AS (\n                SELECT\n                    t.id AS recent_task_id,\n                    t.company AS project_id,\n                    t.custevent_nx_start_date AS recent_task_start_date,\n                    t.custevent_nx_end_date AS recent_task_end_date,\n                    t.status AS recent_task_status,\n                    t.supportcase AS recent_support_case_id\n                FROM\n                    task t\n                WHERE\n                    t.custevent_nx_end_date < CURRENT_DATE\n                    AND t.status = 'COMPLETE'\n            ),\n            UpcomingTasks AS (\n                SELECT\n                    t.id AS future_task_id,\n                    t.company AS project_id,\n                    t.custevent_nx_start_date AS future_task_start_date,\n                    t.custevent_nx_end_date AS future_task_end_date,\n                    t.status AS future_task_status,\n                    t.supportcase AS future_support_case_id\n                FROM\n                    task t\n                WHERE\n                    t.custevent_nx_start_date > CURRENT_DATE\n            ),\n            CaseDetails AS (\n                SELECT\n                    c.id AS case_id,\n                    c.custevent_nxc_equip_asset_hidden AS equip_asset_hidden,\n                    c.cseg_sna_revenue_st AS revenue_stream\n                FROM\n                    supportCase c\n                WHERE\n                    c.cseg_sna_revenue_st IN (263, 18, 19) -- Filter for revenue stream values\n            ),\n            EquipmentAssetDetails AS (\n                SELECT\n                    ea.id AS equip_asset_id,\n                    ea.custrecord_sna_hul_nxcassetobject AS asset_object\n                FROM\n                    customrecord_nx_asset ea\n                WHERE\n                    ea.custrecord_nxc_na_asset_type = 2 -- Filter for asset type\n            ),\n            ObjectHourMeter AS (\n                SELECT \n                    chm.custrecord_sna_hul_object_ref AS object_id,\n                    MAX(chm.created) AS last_reading_date,\n                    MAX(chm.custrecord_sna_hul_actual_reading) AS last_reading\n                FROM \n                    customrecord_sna_hul_hour_meter chm\n                GROUP BY \n                    chm.custrecord_sna_hul_object_ref\n            )\n            SELECT\n                cd.equip_asset_hidden AS equipment_asset,\n                ead.asset_object AS asset_object,\n                r.project_id AS project_id,\n                r.recent_task_id AS recent_task_id,\n                r.recent_task_start_date AS recent_task_start_date,\n                r.recent_task_end_date AS recent_task_end_date,\n                r.recent_task_status AS recent_task_status,\n                r.recent_support_case_id AS recent_support_case_id,\n                CASE \n                    WHEN cd.revenue_stream = 263 THEN 'PM'\n                    WHEN cd.revenue_stream = 18 THEN 'AN'\n                    WHEN cd.revenue_stream = 19 THEN 'CO'\n                    ELSE 'Other'\n                END AS recent_case_revenue_stream,\n                cd.revenue_stream AS revenue_stream_id,\n                u.future_task_id AS future_task_id,\n                u.future_task_start_date AS future_task_start_date,\n                u.future_task_end_date AS future_task_end_date,\n                u.future_task_status AS future_task_status,\n                CASE \n                    WHEN j.custentity_nx_project_type = 4 THEN 'PM 30D'\n                    WHEN j.custentity_nx_project_type = 5 THEN 'PM 60D'\n                    WHEN j.custentity_nx_project_type = 6 THEN 'PM 90D'\n                    WHEN j.custentity_nx_project_type = 7 THEN 'PM 120D'\n                    WHEN j.custentity_nx_project_type = 8 THEN 'PM 180D'\n                    WHEN j.custentity_nx_project_type = 12 THEN 'PM 240D'\n                    WHEN j.custentity_nx_project_type = 13 THEN 'PM 270D'\n                    WHEN j.custentity_nx_project_type = 14 THEN 'PM 360D'\n                    WHEN j.custentity_nx_project_type = 15 THEN 'PM 720D'\n                    WHEN j.custentity_nx_project_type = 10 THEN 'PM Daily'\n                    ELSE 'Other'\n                END AS type,\n                CASE \n                    WHEN j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 12, 13, 14, 15) THEN\n                        CASE j.custentity_nx_project_type\n                            WHEN 4 THEN '30 days'\n                            WHEN 5 THEN '60 days'\n                            WHEN 6 THEN '90 days'\n                            WHEN 7 THEN '120 days'\n                            WHEN 8 THEN '180 days'\n                            WHEN 12 THEN '240 days'\n                            WHEN 13 THEN '270 days'\n                            WHEN 14 THEN '360 days'\n                            WHEN 15 THEN '720 days'\n                        END\n                    ELSE 'N/A'\n                END AS frequency,\n                ohm.last_reading AS hour_meter_reading,\n                ohm.last_reading_date AS hour_meter_date,\n                mr.id AS maintenance_record_id,\n                mr.custrecord_nxc_mr_field_222 AS hours,\n                t.custevent_nx_start_date AS hours_date\n            FROM\n                RecentCompletedTasks r\n            LEFT JOIN CaseDetails cd\n                ON r.recent_support_case_id = cd.case_id\n            LEFT JOIN EquipmentAssetDetails ead\n                ON cd.equip_asset_hidden = ead.equip_asset_id\n            LEFT JOIN UpcomingTasks u\n                ON r.project_id = u.project_id\n            LEFT JOIN job j\n                ON r.project_id = j.id\n            LEFT JOIN ObjectHourMeter ohm\n                ON ead.asset_object = ohm.object_id\n            LEFT JOIN customrecord_nxc_mr mr\n                ON r.recent_task_id = mr.custrecord_nxc_mr_task\n            LEFT JOIN task t\n                ON mr.custrecord_nxc_mr_task = t.id\n            WHERE\n                j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 12, 13, 14, 15, 10)\n                AND cd.revenue_stream IN (263, 18, 19);\n        ";
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
                    log.debug('value', value);
                    // const maintenanceDataObject: MaintenanceDataObject = {
                    //     equipmentAsset: value.equipment_asset;
                    //     assetObject: ;
                    //     projectID: ;
                    //     projectType: string;
                    //     projectFrequency: string;
                    //     recentTaskID: number;
                    //     recentTaskStartDate: Date;
                    //     recentTaskEndDate: Date;
                    //     recentTaskStatus: string;
                    //     recentCaseID: number;
                    //     recentCaseRevenueStream: string;
                    //     recentRevenueStreamID: number;
                    //     futureTaskID: number;
                    //     futureTaskStartDate: Date;
                    //     futureTaskEndDate: Date;
                    //     futureTaskStatus: string;
                    //     currentHours: number;
                    //     currentHoursDate: Date;
                    //     maintenanceRecordID: number;
                    //     maintenanceRecordHours: number;
                    //     maintenanceRecordHoursDate: Date;
                    //     zipcode: number;
                    // }
                    resultsArray_1.push(value);
                });
            });
        }
        catch (error) {
            log.debug('ERROR in execute', error);
        }
    }
    return { execute: execute };
});

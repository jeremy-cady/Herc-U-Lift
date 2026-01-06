/* eslint-disable max-len */
/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/11/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';

interface MaintenanceDataObject {
    equipmentAsset: number;
    assetObject: number;
    revenueStreamID: number;
    revenueStream: string;
    projectID: string;
    projectType: string;
    projectFrequency: string;
    recentTaskID: number;
    recentTaskStartDate: any;
    recentTaskEndDate: any;
    futureTaskID: number;
    futureTaskStartDate: any;
    futureTaskEndDate: any;
    maintenanceRecordID: number;
    maintenanceRecordHours: number;
    maintenanceRecordHoursDate: any;
    currentHours: number;
    currentHoursDate: any;
};

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
        const maintQuery = `
            WITH MostRecentTask AS (
                SELECT
                    t.company AS project_id,
                    t.id AS recent_task_id,
                    t.custevent_nx_start_date AS recent_task_start_date,
                    t.custevent_nx_end_date AS recent_task_end_date
                FROM
                    task t
                WHERE
                    t.custevent_nx_end_date < CURRENT_DATE
                    AND t.status = 'COMPLETE'
                    AND t.custevent_nx_end_date = (
                        SELECT MAX(t2.custevent_nx_end_date)
                        FROM task t2
                        WHERE t2.company = t.company
                        AND t2.custevent_nx_end_date < CURRENT_DATE
                        AND t2.status = 'COMPLETE'
                    )
            ),
            NextUpcomingTask AS (
                SELECT
                    t.company AS project_id,
                    t.id AS future_task_id,
                    t.custevent_nx_start_date AS future_task_start_date,
                    t.custevent_nx_end_date AS future_task_end_date
                FROM
                    task t
                WHERE
                    t.custevent_nx_start_date > CURRENT_DATE
                    AND t.custevent_nx_start_date = (
                        SELECT MIN(t2.custevent_nx_start_date)
                        FROM task t2
                        WHERE t2.company = t.company
                        AND t2.custevent_nx_start_date > CURRENT_DATE
                    )
            ),
            MaintenanceRecords AS (
                SELECT
                    mr.custrecord_nxc_mr_task AS task_id,
                    mr.id AS maintenance_record_id,
                    CASE 
                        WHEN NOT REGEXP_LIKE(mr.custrecord_nxc_mr_field_222, '^[0-9.]+$') THEN NULL
                        ELSE mr.custrecord_nxc_mr_field_222 -- Include valid numeric values
                    END AS maintenance_hours
                FROM
                    customrecord_nxc_mr mr
            ),
            MostRecentHourMeter AS (
                SELECT 
                    chm.custrecord_sna_hul_object_ref AS object_id,
                    chm.created AS last_reading_date,
                    CASE 
                        WHEN NOT REGEXP_LIKE(chm.custrecord_sna_hul_actual_reading, '^[0-9.]+$') THEN NULL
                        ELSE chm.custrecord_sna_hul_actual_reading -- Include valid numeric values
                    END AS last_reading
                FROM 
                    customrecord_sna_hul_hour_meter chm
                WHERE 
                    chm.created = (
                        SELECT MAX(chm2.created)
                        FROM customrecord_sna_hul_hour_meter chm2
                        WHERE chm2.custrecord_sna_hul_object_ref = chm.custrecord_sna_hul_object_ref
                    )
            )
            SELECT
                j.custentity_hul_nxc_eqiup_asset AS equipment_id,
                j.custentity_hul_nxc_equip_object AS equipment_object,
                j.id AS project_id,
                j.cseg_sna_revenue_st AS revenue_stream_id,
                CASE 
                    WHEN j.cseg_sna_revenue_st = 263 THEN 'PM'
                    WHEN j.cseg_sna_revenue_st = 18 THEN 'AN'
                    WHEN j.cseg_sna_revenue_st = 19 THEN 'CO'
                    ELSE 'Other'
                END AS revenue_stream,
                CASE 
                    WHEN j.custentity_nx_project_type = 4 THEN 'PM 30D'
                    WHEN j.custentity_nx_project_type = 5 THEN 'PM 60D'
                    WHEN j.custentity_nx_project_type = 6 THEN 'PM 90D'
                    WHEN j.custentity_nx_project_type = 7 THEN 'PM 120D'
                    WHEN j.custentity_nx_project_type = 8 THEN 'PM 180D'
                    WHEN j.custentity_nx_project_type = 12 THEN 'PM 240D'
                    WHEN j.custentity_nx_project_type = 13 THEN 'PM 270D'
                    WHEN j.custentity_nx_project_type = 14 THEN 'PM 360D'
                    WHEN j.custentity_nx_project_type = 15 THEN 'PM 720D'
                    WHEN j.custentity_nx_project_type = 10 THEN 'PM Daily'
                    ELSE 'Other'
                END AS type,
                CASE 
                    WHEN j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 12, 13, 14, 15) THEN
                        CASE j.custentity_nx_project_type
                            WHEN 4 THEN '30 days'
                            WHEN 5 THEN '60 days'
                            WHEN 6 THEN '90 days'
                            WHEN 7 THEN '120 days'
                            WHEN 8 THEN '180 days'
                            WHEN 12 THEN '240 days'
                            WHEN 13 THEN '270 days'
                            WHEN 14 THEN '360 days'
                            WHEN 15 THEN '720 days'
                        END
                    ELSE ''
                END AS frequency,
                mrt.recent_task_id AS recent_task_id,
                mrt.recent_task_start_date AS recent_task_start_date,
                mrt.recent_task_end_date AS recent_task_end_date,
                nut.future_task_id AS future_task_id,
                nut.future_task_start_date AS future_task_start_date,
                nut.future_task_end_date AS future_task_end_date,
                mr.maintenance_record_id AS maintenance_record_id,
                mr.maintenance_hours AS maintenance_hours,
                mrt.recent_task_start_date AS maintenance_hours_date,
                hr.last_reading AS current_hours,
                hr.last_reading_date AS current_hours_date
            FROM
                job j
            LEFT JOIN MostRecentTask mrt
                ON j.id = mrt.project_id
            LEFT JOIN NextUpcomingTask nut
                ON j.id = nut.project_id
            LEFT JOIN MaintenanceRecords mr
                ON mrt.recent_task_id = mr.task_id
            LEFT JOIN MostRecentHourMeter hr
                ON j.custentity_hul_nxc_equip_object = hr.object_id
            WHERE
                j.cseg_sna_revenue_st IN (263,18,19) -- Filter for specified revenue streams
                AND j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 12, 13, 14, 15, 10)
            ORDER BY
                j.custentity_hul_nxc_eqiup_asset ASC;
        `;

        const pagedData = query.runSuiteQLPaged({
            query: maintQuery,
            pageSize: 1000
        });
        const pagedDataArray = pagedData.pageRanges;
        const resultsArray: MaintenanceDataObject [] = [];

        pagedDataArray.forEach((pageOfData) => {
            const page: any = pagedData.fetch({
                index: pageOfData.index
            });
            page.data?.results?.forEach((row: any) => {
                const value = row.values;
                const maintenanceDataObject: MaintenanceDataObject = {
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
                const convertedMaintenanceObject = convertToDate(maintenanceDataObject);
                log.debug('converted object', convertedMaintenanceObject);
                resultsArray.push(convertedMaintenanceObject);
            });
        });
        log.debug('resultsArray.length', resultsArray.length);
        return resultsArray;
    } catch (error) {
        log.debug('ERROR in getInputData', error);
    }
}

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    try {
        const maintenanceObject = JSON.parse(ctx.value);
        log.debug('maintenanceObject in map', maintenanceObject);
        const equipmentID = maintenanceObject.equipmentAsset;
        log.debug('equipmentID', equipmentID);
        ctx.write({
            key: equipmentID,
            value: maintenanceObject
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
            const maintenanceDataObjectObject = JSON.parse(value);
            const equipmentID = ctx.key;
            const revenueStream = maintenanceDataObjectObject.revenueStream;
            log.debug('equipmentID in reduce', equipmentID);
            log.debug('maintenanceDataObjectObject in reduce', maintenanceDataObjectObject);
            log.debug('revenueStream in reduce', revenueStream);

            if (revenueStream === 'PM') {
                const submit = record.submitFields({
                    type: 'customrecord_nx_asset',
                    id: equipmentID,
                    values: {
                        custrecord_hul_pm_project: `${maintenanceDataObjectObject.projectID}`,
                        custrecord_hul_last_pm_task: `${maintenanceDataObjectObject.recentTaskID}`,
                        custrecord_hul_next_pm_task: `${maintenanceDataObjectObject.futureTaskID}`,
                        custrecord_hul_last_pm_date: `${maintenanceDataObjectObject.recentTaskEndDate}`,
                        custrecord_hul_next_pm_date: `${maintenanceDataObjectObject.futureTaskStartDate}`,
                        custrecord_hul_last_pm_hours: `${maintenanceDataObjectObject.maintenanceRecordHours}`,
                        custrecord_hul_current_hours: `${maintenanceDataObjectObject.currentHours}`,
                        custrecord_hul_current_hours_date: `${maintenanceDataObjectObject.currentHoursDate}`,
                    }
                });
                log.debug('submit', submit);
            } else if (revenueStream === 'AN') {
                const submit = record.submitFields({
                    type: 'customrecord_nx_asset',
                    id: equipmentID,
                    values: {
                        custrecord_hul_an_project: `${maintenanceDataObjectObject.projectID}`,
                        custrecord_hul_last_an_task: `${maintenanceDataObjectObject.recentTaskID}`,
                        custrecord_hul_next_an_task: `${maintenanceDataObjectObject.futureTaskID}`,
                        custrecord_hul_last_an_date: `${maintenanceDataObjectObject.recentTaskEndDate}`,
                        custrecord_hul_next_an_date: `${maintenanceDataObjectObject.futureTaskStartDate}`,
                        custrecord_hul_last_an_hours: `${maintenanceDataObjectObject.maintenanceRecordHours}`,
                        custrecord_hul_current_hours: `${maintenanceDataObjectObject.currentHours}`,
                        custrecord_hul_current_hours_date: `${maintenanceDataObjectObject.currentHoursDate}`,
                    }
                });
                log.debug('submit', submit);
            } else if (revenueStream === 'CO') {
                const submit = record.submitFields({
                    type: 'customrecord_nx_asset',
                    id: equipmentID,
                    values: {
                        custrecord_hul_co_project: `${maintenanceDataObjectObject.projectID}`,
                        custrecord_hul_last_co_task: `${maintenanceDataObjectObject.recentTaskID}`,
                        custrecord_hul_next_co_task: `${maintenanceDataObjectObject.futureTaskID}`,
                        custrecord_hul_last_co_date: `${maintenanceDataObjectObject.recentTaskEndDate}`,
                        custrecord_hul_next_co_date: `${maintenanceDataObjectObject.futureTaskStartDate}`,
                        custrecord_hul_last_co_hours: `${maintenanceDataObjectObject.maintenanceRecordHours}`,
                        custrecord_hul_current_hours: `${maintenanceDataObjectObject.currentHours}`,
                        custrecord_hul_current_hours_date: `${maintenanceDataObjectObject.currentHoursDate}`,
                    }
                });
                log.debug('submit', submit);
            }
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

function convertToDate(maintenanceDataObject: MaintenanceDataObject): MaintenanceDataObject {
    // Create an object to map variable names to date strings
    const dateMap: { [key: string]: string } = {
        recentTaskStartDate: maintenanceDataObject.recentTaskStartDate,
        recentTaskEndDate: maintenanceDataObject.recentTaskEndDate,
        futureTaskStartDate: maintenanceDataObject.futureTaskStartDate,
        futureTaskEndDate: maintenanceDataObject.futureTaskEndDate,
        maintenanceRecordHoursDate: maintenanceDataObject.maintenanceRecordHoursDate,
        currentHoursDate: maintenanceDataObject.currentHoursDate,
    };

    // Iterate over the object and convert dates
    Object.keys(dateMap).forEach((key) => {
        const dateString = dateMap[key];
        if (!dateString) {
            log.debug(`Missing date for ${key}`, key);
            (maintenanceDataObject as any)[key] = null;
            return;
        }

        const dateParts = dateString.split('/');
        if (dateParts.length !== 3) {
            log.debug(`Invalid date format for ${key}: ${dateString}`, key);
            (maintenanceDataObject as any)[key] = null;
            return;
        }

        const month = parseInt(dateParts[0], 10) - 1; // JavaScript months are 0-based
        const day = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);

        // Validate the date components
        if (isNaN(month) || isNaN(day) || isNaN(year)) {
            log.debug(`Invalid date components for ${key}: ${dateString}`, key);
            (maintenanceDataObject as any)[key] = null;
            return;
        }

        // Create the JavaScript Date object
        const date = new Date(year, month, day);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            log.debug(`Invalid date object for ${key}: ${dateString}`, key);
            (maintenanceDataObject as any)[key] = null;
        } else {
            // Format the date without padStart
            const formattedDate = `${(date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1)}/` +
                                  `${(date.getDate() < 10 ? '0' : '') + date.getDate()}/` +
                                  `${date.getFullYear()}`;
            (maintenanceDataObject as any)[key] = formattedDate;
        }
    });

    return maintenanceDataObject;
}

// function formatDateForNetSuite(date: Date | null): string | null {
//     if (!date) return null;
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${month}/${day}/${year}`;
// }

export = { getInputData, map, reduce, summarize };
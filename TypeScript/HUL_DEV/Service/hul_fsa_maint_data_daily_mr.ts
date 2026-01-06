/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/26/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';

interface MaintenanceDataObject {
    equipment_asset: number;
    asset_object: number;
    revenue_stream: string;
    project_id: string;
    recent_task_id: number;
    recent_task_end_date: any;
    future_task_id: number;
    future_task_start_date: any;
    task_category: string;
    maintenance_record_hours: number;
    current_hours: number;
    current_hours_date: any;
};

type RevenueStream = 'PM' | 'AN' | 'CO';
type TaskCategory = 'CURRENT_TASK' | 'FUTURE_TASK';

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
        const recentTaskObjectArray = getRecentTaskData();
        // next get any newly created future PM tasks and also the most recently
        // completed PM task for that equipment asset
        const futureTaskObjectArray = getFutureTaskData();
        const combinedArray = recentTaskObjectArray.concat(futureTaskObjectArray);
        // log.debug('recentTaskObjectArray', recentTaskObjectArray);
        // log.debug('futureTaskObjectArray', futureTaskObjectArray);
        // combinedArray.forEach((object) => {
        //     log.debug('value in getInputData', object);
        // });
        // log.debug('combined array length', combinedArray.length);
        return combinedArray;
    } catch (error) {
        log.error('ERROR in getInputData', error);
    }
}

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    // take data objects and map to equipment ID's
    try {
        log.debug('value in map', ctx.value);
        const maintenanceObject = JSON.parse(ctx.value);
        const equipmentID = maintenanceObject.equipment_asset;
        ctx.write({
            key: equipmentID,
            value: maintenanceObject
        });
    } catch (error) {
        log.error('ERROR in map', error);
    }
}

/**
* Executes when the reduce entry point is triggered and applies to each group.
* @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
* @Since 2015.2
*/
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
    // take in mapped data objects and use conditionals to populate to record
    try {
        ctx.values.forEach((value) => {
            log.debug('value in reduce', value);
            const maintenanceDataObject = JSON.parse(value);
            const equipmentID = ctx.key;
            const revenueStream = maintenanceDataObject.revenue_stream;
            const taskCategory = maintenanceDataObject.task_category;
            // log.debug('maintenanceDataObject in reduce', maintenanceDataObject);
            // log.debug('equipmentID in reduce', equipmentID);
            // log.debug('revenueStream in reduce', revenueStream);
            // log.debug('taskCategory in reduce', taskCategory);

            populateFields(equipmentID, maintenanceDataObject, revenueStream, taskCategory);
        });
    } catch (error) {
        log.error('ERROR in reduce', error);
    }
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
}

const getRecentTaskData = () => {
    const recentTaskQuery = `
            SELECT
                ea.id               AS equipment_id,
                o.id                AS object_id,
                j.id                AS project_id,
                t.supportcase       AS case_id,
                t.id                AS task_id,
                t.status            AS task_status,
                CASE 
                    WHEN j.cseg_sna_revenue_st = 263 THEN 'PM'
                    WHEN j.cseg_sna_revenue_st = 18  THEN 'AN'
                    WHEN j.cseg_sna_revenue_st = 19  THEN 'CO'
                    ELSE 'Other'
                END AS revenue_stream,
                CASE 
                    WHEN j.custentity_nx_project_type = 4  THEN 'PM 30D'
                    WHEN j.custentity_nx_project_type = 5  THEN 'PM 60D'
                    WHEN j.custentity_nx_project_type = 6  THEN 'PM 90D'
                    WHEN j.custentity_nx_project_type = 7  THEN 'PM 120D'
                    WHEN j.custentity_nx_project_type = 8  THEN 'PM 180D'
                    WHEN j.custentity_nx_project_type = 12 THEN 'PM 240D'
                    WHEN j.custentity_nx_project_type = 13 THEN 'PM 270D'
                    WHEN j.custentity_nx_project_type = 14 THEN 'PM 360D'
                    WHEN j.custentity_nx_project_type = 15 THEN 'PM 720D'
                    WHEN j.custentity_nx_project_type = 10 THEN 'PM Daily'
                    ELSE 'Other'
                END AS type,
                CASE 
                    WHEN j.custentity_nx_project_type IN (4, 5, 6, 7, 8, 10, 12, 13, 14, 15)
                    THEN
                        CASE j.custentity_nx_project_type
                            WHEN 4  THEN '30 days'
                            WHEN 5  THEN '60 days'
                            WHEN 6  THEN '90 days'
                            WHEN 7  THEN '120 days'
                            WHEN 8  THEN '180 days'
                            WHEN 10 THEN 'Daily'
                            WHEN 12 THEN '240 days'
                            WHEN 13 THEN '270 days'
                            WHEN 14 THEN '360 days'
                            WHEN 15 THEN '720 days'
                        END
                    ELSE ''
                END AS frequency,
                CASE 
                    WHEN NOT REGEXP_LIKE(mr.custrecord_nxc_mr_field_222, '^[0-9.]+$') THEN NULL
                    ELSE mr.custrecord_nxc_mr_field_222
                END AS last_maintenance_hours,
                t.completeddate AS mr_reading_date,
                CASE 
                    WHEN NOT REGEXP_LIKE(chm.custrecord_sna_hul_actual_reading, '^[0-9.]+$') THEN NULL
                    ELSE chm.custrecord_sna_hul_actual_reading
                END AS current_hours_reading,
                chm.created AS current_hours_date,
	            'COMPLETED_TASK' AS task_category
            FROM 
                task t
            LEFT JOIN job j
                ON j.id = t.company
            LEFT JOIN customrecord_nx_asset ea
                ON ea.id = j.custentity_hul_nxc_eqiup_asset
            LEFT JOIN customrecord_sna_objects o
                ON o.id = j.custentity_hul_nxc_equip_object
            LEFT JOIN customrecord_nxc_mr mr
                ON mr.custrecord_nxc_mr_task = t.id
            LEFT JOIN customrecord_sna_hul_hour_meter chm
                ON  j.custentity_hul_nxc_equip_object = chm.custrecord_sna_hul_object_ref
                AND chm.created = (
                    SELECT MAX(chm2.created)
                    FROM customrecord_sna_hul_hour_meter chm2
                    WHERE chm2.custrecord_sna_hul_object_ref = j.custentity_hul_nxc_equip_object
                )
            WHERE 
                t.status = 'COMPLETE'
                AND j.cseg_sna_revenue_st IN (263,18,19)
                AND j.custentity_nx_project_type IN (4,5,6,7,8,12,13,14,15,10)
		        AND t.completeddate >= CURRENT_DATE - 1
            ORDER BY task_id ASC
    `;
    const pagedData = query.runSuiteQLPaged({
        query: recentTaskQuery,
        pageSize: 1000
    });
    const pagedDataArray = pagedData.pageRanges;
    const resultsArray: MaintenanceDataObject [] = [];
    let count: number = 0;

    pagedDataArray.forEach((pageOfData) => {
        const page: any = pagedData.fetch({
            index: pageOfData.index
        });
        page.data?.results?.forEach((row: any) => {
            const value = row.values;
            // log.debug('recent_value', value);
            const equipmentID = value[0];
            const objectID = value[1];
            const projectID = value[2];
            const recentTaskID = value[4];
            const revenueStream = value[6];
            const lastHours = value[9];
            const completedDate = value[10];
            const currentHours = value[11];
            const currentHoursDate = value[12];
            const taskCategory = value[13];
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
            const futureTaskQuery = `
                SELECT
	                t.id			AS task_id,
	                t.startdate	    AS task_start_date
                FROM
	                task t
                LEFT JOIN job j
	                ON j.id = t.company	
                WHERE
	                t.startdate > CURRENT_DATE
	                AND t.createddate = (
		                SELECT
			                MIN(t2.createddate),
		                FROM
			                task t2	
		                WHERE 
			                t2.company = ${projectID}
			                AND t2.status = 'NOTSTART'
	                )
	                AND j.custentity_nx_project_type IN (4,5,6,7,8,10,12,13,14,15)
	                AND j.cseg_sna_revenue_st IN (18,19,263) 
            `;
            const recentTaskQueryResult = query.runSuiteQL({ query: futureTaskQuery });
            const results = recentTaskQueryResult.asMappedResults();
            if (results.length > 0) {
                // const nextTask = results[0];
                const nextTaskID = Number(results[0].task_id);
                const nextTaskDate = String(results[0].task_start_date);
                // log.debug('nextTask', nextTask);
                // build object here
                const recentDataObject: MaintenanceDataObject = {
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
            } else {
                // build object here
                const recentDataObject: MaintenanceDataObject = {
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

const getFutureTaskData = () => {
    const futureTaskQuery = `
        SELECT
  	        ea.id               AS equipment_id,
            o.id                AS object_id,
            j.id                AS project_id,
            t.supportcase       AS case_id,
            t.id                AS task_id,
            t.status            AS task_status,
	        t.startdate		    AS task_start_date,
	        t.createddate	    AS task_created_date,
	        CASE 
          	    WHEN NOT REGEXP_LIKE(chm.custrecord_sna_hul_actual_reading, '^[0-9.]+$') THEN NULL
              	ELSE chm.custrecord_sna_hul_actual_reading
      	    END AS current_hours_reading,
     	    chm.created AS current_hours_date,
        	CASE 
         	    WHEN j.cseg_sna_revenue_st = 263 THEN 'PM'
               	WHEN j.cseg_sna_revenue_st = 18  THEN 'AN'
              	WHEN j.cseg_sna_revenue_st = 19  THEN 'CO'
              	ELSE 'Other'
       	    END AS revenue_stream,
	        'FUTURE_TASK' 	AS task_category
        FROM 
     	    task t
        LEFT JOIN job j
    	    ON j.id = t.company
        LEFT JOIN customrecord_nx_asset ea
    	    ON ea.id = j.custentity_hul_nxc_eqiup_asset
        LEFT JOIN customrecord_sna_objects o
      	    ON o.id = j.custentity_hul_nxc_equip_object
        LEFT JOIN customrecord_sna_hul_hour_meter chm
      	    ON  j.custentity_hul_nxc_equip_object = chm.custrecord_sna_hul_object_ref
       	    AND chm.created = (
             	SELECT MAX(chm2.created)
               	FROM customrecord_sna_hul_hour_meter chm2
              	WHERE chm2.custrecord_sna_hul_object_ref = j.custentity_hul_nxc_equip_object
      	    )
        WHERE 
       	    t.status = 'NOTSTART'
      	    AND j.cseg_sna_revenue_st IN (263,18,19)
     	    AND j.custentity_nx_project_type IN (4,5,6,7,8,12,13,14,15,10)
	        AND t.startdate >= CURRENT_DATE - 1
	        AND t.createddate >= CURRENT_DATE - 1
        ORDER BY task_id ASC
    `;
    const pagedData = query.runSuiteQLPaged({
        query: futureTaskQuery,
        pageSize: 1000
    });
    const pagedDataArray = pagedData.pageRanges;
    const resultsArray: MaintenanceDataObject [] = [];
    let count: number = 0;

    pagedDataArray.forEach((pageOfData) => {
        const page: any = pagedData.fetch({
            index: pageOfData.index
        });
        page.data?.results?.forEach((row: any) => {
            const value = row.values;
            // log.debug('future_value', value);
            const equipmentID = value[0];
            const objectID = value[1];
            const projectID = value[2];
            const futureTaskID = value[4];
            const revenueStream = value[10];
            const startDate = value[6];
            const currentHours = value[8];
            const currentHoursDate = value[9];
            const taskCategory = value[11];
            // log.debug('equipmentID', equipmentID);
            // log.debug('objectID', objectID);
            // log.debug('future_projectID', projectID);
            // log.debug('futureTaskID', futureTaskID);
            // log.debug('revenueStream', revenueStream);
            // log.debug('startDate', startDate);
            // log.debug('currentHours', currentHours);
            // log.debug('currentHoursDate', currentHoursDate);
            // log.debug('taskCategory', taskCategory);
            const recentTaskQuery = `
                SELECT
   	                t.id                AS task_id,
    	            t.company           AS project_id,
    	            t.supportcase      	AS case_id,
    	            t.status            AS task_status,
    	            t.completeddate 	AS completed_date,
    	            CASE 
        	            WHEN NOT REGEXP_LIKE(mr.custrecord_nxc_mr_field_222, '^[0-9.]+$') THEN NULL
        	            ELSE mr.custrecord_nxc_mr_field_222
    	            END                 AS maintenance_hours
                FROM
   	                task t
                LEFT JOIN customrecord_nxc_mr mr
      	            ON mr.custrecord_nxc_mr_task = t.id
                LEFT JOIN job j
	                ON j.id = t.company
                WHERE
    	            t.company = ${projectID}
    	            AND t.status = 'COMPLETE'
    	            AND t.completeddate = (
        	            SELECT
            		        MAX(t2.completeddate)
        	            FROM
            		        task t2
        	            WHERE
            		        t2.company = ${projectID}
            		        AND t2.status = 'COMPLETE'
    	            )
	                AND j.custentity_nx_project_type IN (4,5,6,7,8,10,12,13,14,15)
	                AND j.cseg_sna_revenue_st IN (18,19,263)    
            `;
            const recentTaskQueryResult = query.runSuiteQL({ query: recentTaskQuery });
            const results = recentTaskQueryResult.asMappedResults();
            if (results.length > 0) {
                // const mostRecentTaskData = results[0];
                const mostRecentTaskID = Number(results[0].task_id);
                const mostRecentTaskHours = Number(results[0].maintenance_hours);
                const mostRecentTaskDate = results[0].completed_date;
                // log.debug('mostRecentTaskData', mostRecentTaskData);
                // log.debug('mostRecentTaskID', mostRecentTaskID);
                // log.debug('mostRecentTaskHours', mostRecentTaskHours);
                // log.debug('mostRecentTaskDate', mostRecentTaskDate);
                // build object here
                const futureTaskObject: MaintenanceDataObject = {
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
            } else {
                // build object here
                const futureTaskObject: MaintenanceDataObject = {
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
const populateFields = (equipmentID: string, maintenanceDataObject: MaintenanceDataObject, revenueStream: RevenueStream, taskCategory: TaskCategory) => {
    let submit: any = '';
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
                            custrecord_hul_pm_project: `${maintenanceDataObject.project_id}`,
                            custrecord_hul_last_pm_task: `${maintenanceDataObject.recent_task_id}`,
                            custrecord_hul_next_pm_task: `${maintenanceDataObject.future_task_id}`,
                            custrecord_hul_last_pm_date: `${maintenanceDataObject.recent_task_end_date}`,
                            custrecord_hul_next_pm_date: `${maintenanceDataObject.future_task_start_date}`,
                            custrecord_hul_last_pm_hours: `${maintenanceDataObject.maintenance_record_hours}`,
                            custrecord_hul_current_hours: `${maintenanceDataObject.current_hours}`,
                            custrecord_hul_current_hours_date: `${maintenanceDataObject.current_hours_date}`,
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
                            custrecord_hul_pm_project: `${maintenanceDataObject.project_id}`,
                            custrecord_hul_last_pm_task: `${maintenanceDataObject.recent_task_id}`,
                            custrecord_hul_next_pm_task: `${maintenanceDataObject.future_task_id}`,
                            custrecord_hul_last_pm_date: `${maintenanceDataObject.recent_task_end_date}`,
                            custrecord_hul_next_pm_date: `${maintenanceDataObject.future_task_start_date}`,
                            custrecord_hul_last_pm_hours: `${maintenanceDataObject.maintenance_record_hours}`,
                            custrecord_hul_current_hours: `${maintenanceDataObject.current_hours}`,
                            custrecord_hul_current_hours_date: `${maintenanceDataObject.current_hours_date}`,
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
                            custrecord_hul_an_project: `${maintenanceDataObject.project_id}`,
                            custrecord_hul_last_an_task: `${maintenanceDataObject.recent_task_id}`,
                            custrecord_hul_next_an_task: `${maintenanceDataObject.future_task_id}`,
                            custrecord_hul_last_an_date: `${maintenanceDataObject.recent_task_end_date}`,
                            custrecord_hul_next_an_date: `${maintenanceDataObject.future_task_start_date}`,
                            custrecord_hul_last_an_hours: `${maintenanceDataObject.maintenance_record_hours}`,
                            custrecord_hul_current_hours: `${maintenanceDataObject.current_hours}`,
                            custrecord_hul_current_hours_date: `${maintenanceDataObject.current_hours_date}`,
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
                            custrecord_hul_an_project: `${maintenanceDataObject.project_id}`,
                            custrecord_hul_last_an_task: `${maintenanceDataObject.recent_task_id}`,
                            custrecord_hul_next_an_task: `${maintenanceDataObject.future_task_id}`,
                            custrecord_hul_last_an_date: `${maintenanceDataObject.recent_task_end_date}`,
                            custrecord_hul_next_an_date: `${maintenanceDataObject.future_task_start_date}`,
                            custrecord_hul_last_an_hours: `${maintenanceDataObject.maintenance_record_hours}`,
                            custrecord_hul_current_hours: `${maintenanceDataObject.current_hours}`,
                            custrecord_hul_current_hours_date: `${maintenanceDataObject.current_hours_date}`,
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
                            custrecord_hul_co_project: `${maintenanceDataObject.project_id}`,
                            custrecord_hul_last_co_task: `${maintenanceDataObject.recent_task_id}`,
                            custrecord_hul_next_co_task: `${maintenanceDataObject.future_task_id}`,
                            custrecord_hul_last_co_date: `${maintenanceDataObject.recent_task_end_date}`,
                            custrecord_hul_next_co_date: `${maintenanceDataObject.future_task_start_date}`,
                            custrecord_hul_last_co_hours: `${maintenanceDataObject.maintenance_record_hours}`,
                            custrecord_hul_current_hours: `${maintenanceDataObject.current_hours}`,
                            custrecord_hul_current_hours_date: `${maintenanceDataObject.current_hours_date}`,
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
                            custrecord_hul_co_project: `${maintenanceDataObject.project_id}`,
                            custrecord_hul_last_co_task: `${maintenanceDataObject.recent_task_id}`,
                            custrecord_hul_next_co_task: `${maintenanceDataObject.future_task_id}`,
                            custrecord_hul_last_co_date: `${maintenanceDataObject.recent_task_end_date}`,
                            custrecord_hul_next_co_date: `${maintenanceDataObject.future_task_start_date}`,
                            custrecord_hul_last_co_hours: `${maintenanceDataObject.maintenance_record_hours}`,
                            custrecord_hul_current_hours: `${maintenanceDataObject.current_hours}`,
                            custrecord_hul_current_hours_date: `${maintenanceDataObject.current_hours_date}`,
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

export = { getInputData, map, reduce, summarize };
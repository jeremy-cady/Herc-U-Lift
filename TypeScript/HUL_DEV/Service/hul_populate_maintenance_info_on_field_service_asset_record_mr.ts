/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/23/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as search from 'N/search';
import * as record from 'N/record';

interface FSAMaintenanceObject {
    equipmentObjectID: number;
    pmProjectID: number;
    pmFSAID: number;
    recentPMCaseID: number;
    recentPMMTaskID: number;
    recentPMMaintRecID: number;
    recentPMMaintRecHours: number;
    recentPMMaintRecDate: string;
    currentHours: number;
    currentHoursDate: string;
    currentHoursRecID: number;
    siteAssetZipCode: number;
    warrantyEndDate: string;
};

interface MostRecentMaintenanceHoursObject {
    mostRecentMaintenanceHoursID: number;
    mostRecentMaintenanceHours: number;
    mostRecentMaintenanceHoursDate: string;
};

// interface MostRecentMaintenanceCaseRecord {
//     mostRecentMaintenanceCaseID: number;
//     mostRecentMaintenanceCaseDate: string;
// }

/**
* Marks the beginning of the Map/Reduce process and generates input data.
* @typedef {Object} ObjectRef
* @property {number} id - Internal ID of the record instance
* @property {string} type - Record type id
* @return {Array|Object|Search|RecordRef} inputSummary
* @Since 2015.2
*/

function getInputData() {
    try{
        const objectQuery = `
            SELECT customrecord_sna_objects.id AS object_id
            FROM customrecord_sna_objects
            JOIN customrecord_nx_asset
            ON customrecord_sna_objects.id = customrecord_nx_asset.custrecord_sna_hul_nxcassetobject
            WHERE customrecord_nx_asset.custrecord_nxc_na_asset_type = '2'
            ORDER BY customrecord_sna_objects.id ASC
        `;
        const pagedData = query.runSuiteQLPaged({
            query: objectQuery,
            pageSize: 1000
        });
        const pagedDataArray = pagedData.pageRanges;
        const resultsArray: { objectID: number } [] = [];

        pagedDataArray.forEach((pageOfData) => {
            const page: any = pagedData.fetch({
                index: pageOfData.index
            });
            page.data?.results?.forEach((row: any) => {
                const value = row.values[0];
                resultsArray.push({ objectID: value as number });
            });
        });

        return resultsArray;
    } catch (error) {
        log.error('ERROR in getData', error);
    }
};

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    try {
        // parse incoming JSON object
        const searchResult = JSON.parse(ctx.value) as { objectID: number };
        // declare variable to hold each object ID
        const equipmentObjID = Number(searchResult.objectID);
        if (equipmentObjID === 1253185376 || equipmentObjID === 1253199340) {
            // get Field Service Asset ID
            const fsaID = Number(getFSAid(equipmentObjID));
            const fsaIDKey = String(fsaID);
            // get projects of type '4, 5, 6, 7, 8, 10, 12, 13, 14, 15'
            const pmProjects = getProjects(fsaID);
            // IF pmProjects is NOT an empty array, get cases related to projects
            const pmProject = Number(pmProjects[0]);
            log.debug('pmProject', pmProject);
            if (pmProjects.length > 0) {
                const relatedPMCase = getCases(pmProjects);
                log.debug('relatedPMCase', relatedPMCase);
                // IF relatedPMCases is NOT an empty array, get tasks related to projects
                if (relatedPMCase) {
                    // get tasks related to cases
                    const relatedPMTask = getTasks(relatedPMCase);
                    log.debug('relatedPMTask', relatedPMTask);
                    // if relatedPMTasks is not an empty array, get related PM Maintenenace records
                    if (relatedPMTask) {
                        // get most recent PM hours and date from maintenance records
                        const mostRecentMaintenanceDataObject = getMostRecentMaintenanceRecordData(fsaID);
                        log.debug('mostRecentMaintenanceDataObject', mostRecentMaintenanceDataObject);
                        const maintenanceRecID = mostRecentMaintenanceDataObject.mostRecentMaintenanceHoursID;
                        const maintenanceHours = mostRecentMaintenanceDataObject.mostRecentMaintenanceHours;
                        const maintenanceDate = mostRecentMaintenanceDataObject.mostRecentMaintenanceHoursDate;
                        // get most recent hour meter reading from hour meter records
                        const mostRecentHourMeterReading = getCurrentHourMeterReading(equipmentObjID);
                        log.debug('mostRecentHourMeterReading', mostRecentHourMeterReading);
                        const equipmentCurrentHours = mostRecentHourMeterReading.currentHourReading;
                        const equipmentCurrentHoursDate = mostRecentHourMeterReading.currentHoursReadingDate;
                        const equipmentCurrentHoursRecID = mostRecentHourMeterReading.currentHoursRecID;
                        log.debug('equipmentCurrentHours', equipmentCurrentHours);
                        log.debug('equipmentCurrentHoursDate', equipmentCurrentHoursDate);
                        log.debug('equipmentCurrentHoursRecID', equipmentCurrentHoursRecID);
                        // get warranty expiration date if there is one?
                        const warrantyExpirationDate: string = getWarrantyExpDate(equipmentObjID);
                        log.debug('warrantyExpirationDate', warrantyExpirationDate);
                        // get 5 digit site zip code (Site asset record)
                        const assetZipcode = getZipcode(fsaID);
                        log.debug('assetZipcode', assetZipcode);
                        // declare object variable to hold all Equipment Asset data
                        const fieldServiceMaintenanceData: FSAMaintenanceObject = {
                            equipmentObjectID: equipmentObjID,
                            pmProjectID: pmProject,
                            pmFSAID: fsaID,
                            recentPMCaseID: relatedPMCase,
                            recentPMMTaskID: relatedPMTask,
                            recentPMMaintRecID: maintenanceRecID,
                            recentPMMaintRecHours: maintenanceHours,
                            recentPMMaintRecDate: maintenanceDate,
                            currentHours: equipmentCurrentHours,
                            currentHoursDate: equipmentCurrentHoursDate,
                            currentHoursRecID: equipmentCurrentHoursRecID,
                            siteAssetZipCode: assetZipcode,
                            warrantyEndDate: warrantyExpirationDate
                        };
                        log.debug('fieldServiceMaintenanceData', fieldServiceMaintenanceData);

                        ctx.write({
                            key: fsaIDKey,
                            value: JSON.stringify(fieldServiceMaintenanceData)
                        });
                    }
                }
            }
        }
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
    // populate values to FSA records
    try {
        ctx.values.forEach((value) => {
            const fsaID = Number(ctx.key);
            const fsaData = JSON.parse(value) as FSAMaintenanceObject;
            log.debug('fsaID', fsaID);
            log.debug('fsaData', fsaData);
            const setRecordData = setValuesOnFSARecord(fsaID, fsaData);
            log.debug('setRecordData', setRecordData);
        });
    } catch (error) {
        log.debug('ERROR in reduce', error);
    };
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
}

// function to get field service asset id
const getFSAid = (equipmentObjectID) => {
    const fsaQuery = `
        SELECT customrecord_nx_asset.id
        FROM customrecord_nx_asset
        JOIN customrecord_sna_objects
        ON  customrecord_nx_asset.custrecord_sna_hul_nxcassetobject = customrecord_sna_objects.id
        WHERE customrecord_sna_objects.id = '${equipmentObjectID}'
    `;
    const fsaQueryResults = query.runSuiteQL({ query: fsaQuery });
    const fsaID = fsaQueryResults.results[0]?.values[0];
    return fsaID;
};

// function to get projects related to field service asset
const getProjects = (fsaID) => {
    const projectArray: string[] = [];
    const jobSearchFilters: SavedSearchFilters = [
        ['custentity_nxc_project_assets.internalidnumber', 'equalto', `${fsaID}`],
        'AND',
        ['custentity_nx_project_type', 'anyof', '7', '6', '8', '12', '13', '4', '14', '5', '15', '10'],
        'AND',
        ['status', 'anyof', '2'],
        'AND',
        ['cseg_sna_revenue_st', 'anyof', '263'],
    ];
    const jobSearchColInternalId = search.createColumn({ name: 'internalid' });
    const jobSearch = search.create({
        type: 'job',
        filters: jobSearchFilters,
        columns: [
            jobSearchColInternalId,
        ],
    });
    const jobSearchPagedData = jobSearch.runPaged({ pageSize: 1000 });
    for (let i = 0; i < jobSearchPagedData.pageRanges.length; i++) {
        const jobSearchPage = jobSearchPagedData.fetch({ index: i });
        jobSearchPage.data.forEach((result: search.Result): void => {
            const internalId = <string>result.getValue(jobSearchColInternalId);
            if(internalId){
                projectArray.push(internalId);
            }
        });
    }
    interface NestedArray<T> extends Array<T | NestedArray<T>> { }
    type SavedSearchFilters = string | NestedArray<string | search.Operator>;
    return projectArray;
};

// get all cases related to a Project
const getCases = (pmProjects) => {
    let mostRecentMaintenanceCaseID: number;
    pmProjects.forEach((project) => {
        const projectNum = project as number;
        log.debug('projectNum', projectNum);
        if (projectNum) {
            const caseQuery = `
                SELECT supportcase.id, MAX(supportcase.enddate)
                FROM supportcase
                WHERE supportcase.company = '${projectNum}'
                AND supportcase.status = '5'
                AND supportcase.custevent_nx_case_type = '3'
                GROUP BY supportcase.id
            `;
            const caseQueryResults = query.runSuiteQL({ query: caseQuery });
            mostRecentMaintenanceCaseID = Number(caseQueryResults.results[0]?.values[0]);
            log.debug(`caseQueryResults for project ${projectNum}`, caseQueryResults);
        };
    });
    return mostRecentMaintenanceCaseID;
};

// get task related to cases
const getTasks = (relatedPMCase) => {
    const taskQuery = `
        SELECT task.id
        FROM task 
        WHERE task.supportcase = '${relatedPMCase}'
    `;
    const taskQueryResults = query.runSuiteQL({ query: taskQuery });
    log.debug(`taskQueryResults for case ${relatedPMCase}`, taskQueryResults);
    const mostCurrentMaintenanceTask = Number(taskQueryResults.results[0]?.values[0]);
    return mostCurrentMaintenanceTask;
};

// get maintenance records related to tasks
const getMostRecentMaintenanceRecordData = (fsaID) => {
    const maintenanceRecordQuery = `
        SELECT customrecord_nxc_mr.id, 
               customrecord_nxc_mr.custrecord_nxc_mr_field_222, 
               task.completeddate AS date_completed
        FROM customrecord_nxc_mr
        JOIN task
        ON customrecord_nxc_mr.custrecord_nxc_mr_case = task.supportcase
	    JOIN supportcase
	    ON task.supportcase = supportcase.id
        WHERE customrecord_nxc_mr.custrecord_nxc_mr_asset = '80532'
	    AND supportcase.custevent_nx_case_type = '3'
        ORDER BY customrecord_nxc_mr.custrecord_nxc_mr_field_222 DESC
        `;
    const maintRecQueryResults = query.runSuiteQL({ query: maintenanceRecordQuery });
    log.debug(`maintRecQueryResults for fsaID ${fsaID}`, maintRecQueryResults);
    const mostRecentMaintenanceResultObject: MostRecentMaintenanceHoursObject = {
        mostRecentMaintenanceHoursID: Number(maintRecQueryResults.results[0].values[0]),
        mostRecentMaintenanceHours: Number(maintRecQueryResults.results[0].values[1]),
        mostRecentMaintenanceHoursDate: String(maintRecQueryResults.results[0].values[2])
    };
    return mostRecentMaintenanceResultObject;
};

// function to get current hour meter reading
const getCurrentHourMeterReading = (equipmentObjectID) => {
    log.debug('in getCurrentHours', equipmentObjectID);
    const hourQuery = `
        SELECT MAX(custrecord_sna_hul_hour_meter_reading) AS "hourReading", 
	    created AS "dateCreated",
	    id AS "hourReadingID"
        FROM customrecord_sna_hul_hour_meter
        WHERE custrecord_sna_hul_object_ref = '1253199340'
        AND custrecord_sna_hul_hour_meter_reading IS NOT NULL
        GROUP BY created, id
    `;
    const hourQueryResults = query.runSuiteQL({ query: hourQuery });
    log.debug('hourQueryResults', hourQueryResults);
    const currentHourReading = Number(hourQueryResults.results[0]?.values[0]);
    const currentHoursReadingDate = String(hourQueryResults.results[0]?.values[1]);
    const currentHoursRecID = Number(hourQueryResults.results[0]?.values[2]);
    return {
        currentHourReading,
        currentHoursReadingDate,
        currentHoursRecID
    };
};

const getWarrantyExpDate = (equipmentObjectID) => {
    const warrantyExpDateQuery = `
        SELECT customrecord_sna_objects.custrecord_sna_warranty_expiration_date
        FROM customrecord_sna_objects
        WHERE customrecord_sna_objects.id = '${equipmentObjectID}'
    `;
    const warrantyExpDateQueryResults = query.runSuiteQL({ query: warrantyExpDateQuery });
    const warrantyExpDate = String(warrantyExpDateQueryResults.results[0]?.values[0]);
    return warrantyExpDate;
};

const getZipcode = (fsaID) => {
    let zipcode: number = 0;
    const zipcodeQuery = `
        SELECT customrecord_nx_asset.custrecord_nx_asset_address_text
        FROM customrecord_nx_asset
        WHERE customrecord_nx_asset.id = '${fsaID}'
    `;
    const zipcodeQueryResults = query.runSuiteQL({ query: zipcodeQuery });
    const assetAddress = String(zipcodeQueryResults.results[0]?.values[0]);
    const zipcodeRegex = /\b\d{5}\b/;
    const match = zipcodeRegex.exec(assetAddress);

    if (match) {
        zipcode = Number(match[0]);
    }
    return zipcode;
};

const setValuesOnFSARecord = (fsaID, fsaData) => {
    try {
        const recordType = 'customrecord_nx_asset';
        const recordID = fsaID;
        const currentPMProj = fsaData.pmProjectID;
        const currentPMCase = fsaData.recentPMCaseID;
        const currentPMTask = fsaData.recentPMMTaskID;
        const currentPMMaintRec = fsaData.recentPMMaintRecID;
        const lastPMHours = fsaData.recentPMMaintRecHours;
        const lastPMDate = fsaData.recentPMMaintRecDate;
        const currentHours = fsaData.currentHours;
        const currentHoursDate = fsaData.currentHoursDate;
        const currentHoursRecID = fsaData.currentHoursRecID;
        const fsaZipcode = fsaData.siteAssetZipCode;
        const warrantyEndDate = fsaData.warrantyEndDate;
        record.submitFields({
            type: recordType,
            id: recordID,
            values: {
                custrecord_hul_current_pm_project: currentPMProj,
                custrecord_hul_current_pm_case: currentPMCase,
                custrecord_hul_recent_pm_task: currentPMTask,
                custrecord_hul_recent_pm_maint_rec: currentPMMaintRec,
                custrecord_hul_last_serviced_hours: lastPMHours,
                custrecord_hul_last_pm_date: lastPMDate,
                custrecord_hul_current_hours: currentHours,
                custrecord_hul_current_hrs_read_date: currentHoursDate,
                custrecord_hul_current_hours_record: currentHoursRecID,
                custrecord_hul_pm_zip: fsaZipcode,
                custrecord_hul_warranty_end_date: warrantyEndDate,
            },
            options: {
                enableSourcing: true,
                ignoreMandatoryFields: true
            }
        });
        return true;
    } catch (error) {
        log.debug('ERROR setting values on FSA record', error);
    }
};

export = { getInputData, map, reduce, summarize };
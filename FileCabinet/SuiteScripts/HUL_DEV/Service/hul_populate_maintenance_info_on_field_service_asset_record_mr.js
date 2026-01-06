/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/23/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/search", "N/record"], function (require, exports, log, query, search, record) {
    "use strict";
    ;
    ;
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
        try {
            var objectQuery = "\n            SELECT customrecord_sna_objects.id AS object_id\n            FROM customrecord_sna_objects\n            JOIN customrecord_nx_asset\n            ON customrecord_sna_objects.id = customrecord_nx_asset.custrecord_sna_hul_nxcassetobject\n            WHERE customrecord_nx_asset.custrecord_nxc_na_asset_type = '2'\n            ORDER BY customrecord_sna_objects.id ASC\n        ";
            var pagedData_1 = query.runSuiteQLPaged({
                query: objectQuery,
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
                    var value = row.values[0];
                    resultsArray_1.push({ objectID: value });
                });
            });
            return resultsArray_1;
        }
        catch (error) {
            log.error('ERROR in getData', error);
        }
    }
    ;
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        try {
            // parse incoming JSON object
            var searchResult = JSON.parse(ctx.value);
            // declare variable to hold each object ID
            var equipmentObjID = Number(searchResult.objectID);
            if (equipmentObjID === 1253185376 || equipmentObjID === 1253199340) {
                // get Field Service Asset ID
                var fsaID = Number(getFSAid(equipmentObjID));
                var fsaIDKey = String(fsaID);
                // get projects of type '4, 5, 6, 7, 8, 10, 12, 13, 14, 15'
                var pmProjects = getProjects(fsaID);
                // IF pmProjects is NOT an empty array, get cases related to projects
                var pmProject = Number(pmProjects[0]);
                log.debug('pmProject', pmProject);
                if (pmProjects.length > 0) {
                    var relatedPMCase = getCases(pmProjects);
                    log.debug('relatedPMCase', relatedPMCase);
                    // IF relatedPMCases is NOT an empty array, get tasks related to projects
                    if (relatedPMCase) {
                        // get tasks related to cases
                        var relatedPMTask = getTasks(relatedPMCase);
                        log.debug('relatedPMTask', relatedPMTask);
                        // if relatedPMTasks is not an empty array, get related PM Maintenenace records
                        if (relatedPMTask) {
                            // get most recent PM hours and date from maintenance records
                            var mostRecentMaintenanceDataObject = getMostRecentMaintenanceRecordData(fsaID);
                            log.debug('mostRecentMaintenanceDataObject', mostRecentMaintenanceDataObject);
                            var maintenanceRecID = mostRecentMaintenanceDataObject.mostRecentMaintenanceHoursID;
                            var maintenanceHours = mostRecentMaintenanceDataObject.mostRecentMaintenanceHours;
                            var maintenanceDate = mostRecentMaintenanceDataObject.mostRecentMaintenanceHoursDate;
                            // get most recent hour meter reading from hour meter records
                            var mostRecentHourMeterReading = getCurrentHourMeterReading(equipmentObjID);
                            log.debug('mostRecentHourMeterReading', mostRecentHourMeterReading);
                            var equipmentCurrentHours = mostRecentHourMeterReading.currentHourReading;
                            var equipmentCurrentHoursDate = mostRecentHourMeterReading.currentHoursReadingDate;
                            var equipmentCurrentHoursRecID = mostRecentHourMeterReading.currentHoursRecID;
                            log.debug('equipmentCurrentHours', equipmentCurrentHours);
                            log.debug('equipmentCurrentHoursDate', equipmentCurrentHoursDate);
                            log.debug('equipmentCurrentHoursRecID', equipmentCurrentHoursRecID);
                            // get warranty expiration date if there is one?
                            var warrantyExpirationDate = getWarrantyExpDate(equipmentObjID);
                            log.debug('warrantyExpirationDate', warrantyExpirationDate);
                            // get 5 digit site zip code (Site asset record)
                            var assetZipcode = getZipcode(fsaID);
                            log.debug('assetZipcode', assetZipcode);
                            // declare object variable to hold all Equipment Asset data
                            var fieldServiceMaintenanceData = {
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
        // populate values to FSA records
        try {
            ctx.values.forEach(function (value) {
                var fsaID = Number(ctx.key);
                var fsaData = JSON.parse(value);
                log.debug('fsaID', fsaID);
                log.debug('fsaData', fsaData);
                var setRecordData = setValuesOnFSARecord(fsaID, fsaData);
                log.debug('setRecordData', setRecordData);
            });
        }
        catch (error) {
            log.debug('ERROR in reduce', error);
        }
        ;
    }
    /**
    * Executes when the summarize entry point is triggered and applies to the result set.
    * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
    * @Since 2015.2
    */
    function summarize(summary) {
    }
    // function to get field service asset id
    var getFSAid = function (equipmentObjectID) {
        var _a;
        var fsaQuery = "\n        SELECT customrecord_nx_asset.id\n        FROM customrecord_nx_asset\n        JOIN customrecord_sna_objects\n        ON  customrecord_nx_asset.custrecord_sna_hul_nxcassetobject = customrecord_sna_objects.id\n        WHERE customrecord_sna_objects.id = '".concat(equipmentObjectID, "'\n    ");
        var fsaQueryResults = query.runSuiteQL({ query: fsaQuery });
        var fsaID = (_a = fsaQueryResults.results[0]) === null || _a === void 0 ? void 0 : _a.values[0];
        return fsaID;
    };
    // function to get projects related to field service asset
    var getProjects = function (fsaID) {
        var projectArray = [];
        var jobSearchFilters = [
            ['custentity_nxc_project_assets.internalidnumber', 'equalto', "".concat(fsaID)],
            'AND',
            ['custentity_nx_project_type', 'anyof', '7', '6', '8', '12', '13', '4', '14', '5', '15', '10'],
            'AND',
            ['status', 'anyof', '2'],
            'AND',
            ['cseg_sna_revenue_st', 'anyof', '263'],
        ];
        var jobSearchColInternalId = search.createColumn({ name: 'internalid' });
        var jobSearch = search.create({
            type: 'job',
            filters: jobSearchFilters,
            columns: [
                jobSearchColInternalId,
            ],
        });
        var jobSearchPagedData = jobSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < jobSearchPagedData.pageRanges.length; i++) {
            var jobSearchPage = jobSearchPagedData.fetch({ index: i });
            jobSearchPage.data.forEach(function (result) {
                var internalId = result.getValue(jobSearchColInternalId);
                if (internalId) {
                    projectArray.push(internalId);
                }
            });
        }
        return projectArray;
    };
    // get all cases related to a Project
    var getCases = function (pmProjects) {
        var mostRecentMaintenanceCaseID;
        pmProjects.forEach(function (project) {
            var _a;
            var projectNum = project;
            log.debug('projectNum', projectNum);
            if (projectNum) {
                var caseQuery = "\n                SELECT supportcase.id, MAX(supportcase.enddate)\n                FROM supportcase\n                WHERE supportcase.company = '".concat(projectNum, "'\n                AND supportcase.status = '5'\n                AND supportcase.custevent_nx_case_type = '3'\n                GROUP BY supportcase.id\n            ");
                var caseQueryResults = query.runSuiteQL({ query: caseQuery });
                mostRecentMaintenanceCaseID = Number((_a = caseQueryResults.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
                log.debug("caseQueryResults for project ".concat(projectNum), caseQueryResults);
            }
            ;
        });
        return mostRecentMaintenanceCaseID;
    };
    // get task related to cases
    var getTasks = function (relatedPMCase) {
        var _a;
        var taskQuery = "\n        SELECT task.id\n        FROM task \n        WHERE task.supportcase = '".concat(relatedPMCase, "'\n    ");
        var taskQueryResults = query.runSuiteQL({ query: taskQuery });
        log.debug("taskQueryResults for case ".concat(relatedPMCase), taskQueryResults);
        var mostCurrentMaintenanceTask = Number((_a = taskQueryResults.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
        return mostCurrentMaintenanceTask;
    };
    // get maintenance records related to tasks
    var getMostRecentMaintenanceRecordData = function (fsaID) {
        var maintenanceRecordQuery = "\n        SELECT customrecord_nxc_mr.id, \n               customrecord_nxc_mr.custrecord_nxc_mr_field_222, \n               task.completeddate AS date_completed\n        FROM customrecord_nxc_mr\n        JOIN task\n        ON customrecord_nxc_mr.custrecord_nxc_mr_case = task.supportcase\n\t    JOIN supportcase\n\t    ON task.supportcase = supportcase.id\n        WHERE customrecord_nxc_mr.custrecord_nxc_mr_asset = '80532'\n\t    AND supportcase.custevent_nx_case_type = '3'\n        ORDER BY customrecord_nxc_mr.custrecord_nxc_mr_field_222 DESC\n        ";
        var maintRecQueryResults = query.runSuiteQL({ query: maintenanceRecordQuery });
        log.debug("maintRecQueryResults for fsaID ".concat(fsaID), maintRecQueryResults);
        var mostRecentMaintenanceResultObject = {
            mostRecentMaintenanceHoursID: Number(maintRecQueryResults.results[0].values[0]),
            mostRecentMaintenanceHours: Number(maintRecQueryResults.results[0].values[1]),
            mostRecentMaintenanceHoursDate: String(maintRecQueryResults.results[0].values[2])
        };
        return mostRecentMaintenanceResultObject;
    };
    // function to get current hour meter reading
    var getCurrentHourMeterReading = function (equipmentObjectID) {
        var _a, _b, _c;
        log.debug('in getCurrentHours', equipmentObjectID);
        var hourQuery = "\n        SELECT MAX(custrecord_sna_hul_hour_meter_reading) AS \"hourReading\", \n\t    created AS \"dateCreated\",\n\t    id AS \"hourReadingID\"\n        FROM customrecord_sna_hul_hour_meter\n        WHERE custrecord_sna_hul_object_ref = '1253199340'\n        AND custrecord_sna_hul_hour_meter_reading IS NOT NULL\n        GROUP BY created, id\n    ";
        var hourQueryResults = query.runSuiteQL({ query: hourQuery });
        log.debug('hourQueryResults', hourQueryResults);
        var currentHourReading = Number((_a = hourQueryResults.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
        var currentHoursReadingDate = String((_b = hourQueryResults.results[0]) === null || _b === void 0 ? void 0 : _b.values[1]);
        var currentHoursRecID = Number((_c = hourQueryResults.results[0]) === null || _c === void 0 ? void 0 : _c.values[2]);
        return {
            currentHourReading: currentHourReading,
            currentHoursReadingDate: currentHoursReadingDate,
            currentHoursRecID: currentHoursRecID
        };
    };
    var getWarrantyExpDate = function (equipmentObjectID) {
        var _a;
        var warrantyExpDateQuery = "\n        SELECT customrecord_sna_objects.custrecord_sna_warranty_expiration_date\n        FROM customrecord_sna_objects\n        WHERE customrecord_sna_objects.id = '".concat(equipmentObjectID, "'\n    ");
        var warrantyExpDateQueryResults = query.runSuiteQL({ query: warrantyExpDateQuery });
        var warrantyExpDate = String((_a = warrantyExpDateQueryResults.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
        return warrantyExpDate;
    };
    var getZipcode = function (fsaID) {
        var _a;
        var zipcode = 0;
        var zipcodeQuery = "\n        SELECT customrecord_nx_asset.custrecord_nx_asset_address_text\n        FROM customrecord_nx_asset\n        WHERE customrecord_nx_asset.id = '".concat(fsaID, "'\n    ");
        var zipcodeQueryResults = query.runSuiteQL({ query: zipcodeQuery });
        var assetAddress = String((_a = zipcodeQueryResults.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
        var zipcodeRegex = /\b\d{5}\b/;
        var match = zipcodeRegex.exec(assetAddress);
        if (match) {
            zipcode = Number(match[0]);
        }
        return zipcode;
    };
    var setValuesOnFSARecord = function (fsaID, fsaData) {
        try {
            var recordType = 'customrecord_nx_asset';
            var recordID = fsaID;
            var currentPMProj = fsaData.pmProjectID;
            var currentPMCase = fsaData.recentPMCaseID;
            var currentPMTask = fsaData.recentPMMTaskID;
            var currentPMMaintRec = fsaData.recentPMMaintRecID;
            var lastPMHours = fsaData.recentPMMaintRecHours;
            var lastPMDate = fsaData.recentPMMaintRecDate;
            var currentHours = fsaData.currentHours;
            var currentHoursDate = fsaData.currentHoursDate;
            var currentHoursRecID = fsaData.currentHoursRecID;
            var fsaZipcode = fsaData.siteAssetZipCode;
            var warrantyEndDate = fsaData.warrantyEndDate;
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
        }
        catch (error) {
            log.debug('ERROR setting values on FSA record', error);
        }
    };
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});

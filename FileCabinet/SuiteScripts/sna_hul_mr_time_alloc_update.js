/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author caranda
*
* Script brief description:
* Completion of Time Allocation computation
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/01/03						            caranda           	Initial version
*
*/

/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/error'],

    (runtime, record, search, error) => {

        function getInputData() {
            var stLoggerTitle = 'execute';
            log.debug(stLoggerTitle, '*** START ***');

            var scriptObj = runtime.getCurrentScript();
            var searchId = scriptObj.getParameter({name: 'custscript_sna_time_alloc_srch'});

            var searchObj = search.load({
                id: searchId
            });

            return searchObj;

        }

        function map(context) {
            var stLoggerTitle = 'map';

            var mapData = JSON.parse(context.value);
            var mapDataValues = mapData.values;
            var stringifyValues = JSON.stringify(mapDataValues);
            var cleanString = stringifyValues.replace(/[()]/g, '');
            var newObject = JSON.parse(cleanString);
            log.debug(stLoggerTitle, 'newObject = ' + JSON.stringify(newObject));

            var entityValue = newObject["GROUPassigned.CUSTRECORD_SNA_TA_TASK"].value;
            var timeAllocIds = newObject.MAXformulatext;

            log.debug(stLoggerTitle, 'timeAllocIds = ' + timeAllocIds);

            var timeAllocIdsArr = timeAllocIds.split(',');

            var mainArr = [];

            if(timeAllocIdsArr.length > 0){
                for(var i = 0; i < timeAllocIdsArr.length; i++){

                    var allocObj = {};
                    var srch = search.lookupFields({
                        type: 'customrecord_sna_time_allocation',
                        id: timeAllocIdsArr[i],
                        columns: ['custrecord_sna_ta_start_time', 'custrecord_sna_ta_arrival_time', 'custrecord_sna_ta_completion_time', 'custrecord_sna_ta_task.custevent_nx_task_type']
                    });

                    var alloc_id = timeAllocIdsArr[i];
                    var alloc_startTime = srch.custrecord_sna_ta_start_time;
                    var alloc_arrivalTime = srch.custrecord_sna_ta_arrival_time;
                    var alloc_completionTime = srch.custrecord_sna_ta_completion_time;
                    var alloc_taskType = srch["custrecord_sna_ta_task.custevent_nx_task_type"][0].value;

                    var alloc_actualTravel = dateTimeDiff(alloc_startTime, alloc_arrivalTime);
                    var alloc_actualService = dateTimeDiff(alloc_completionTime, alloc_arrivalTime);
                    var alloc_allocatedTravel;

                    allocObj.id = alloc_id
                    allocObj.custrecord_sna_ta_actual_travel_time = (alloc_actualTravel).toFixed(2);
                    allocObj.custrecord_sna_ta_actual_service_time = (alloc_actualService).toFixed(2);
                    allocObj.isTravelHome = (alloc_taskType == 20 ? true : false); //20 = Travel Home

                    //log.debug(stLoggerTitle, JSON.stringify(allocObj));

                    mainArr.push(allocObj)

                }
            }

            log.debug(stLoggerTitle, 'mainArr = ' + JSON.stringify(mainArr));

            //Process Allocated Travel Time from mainArr
            var finalArr = [];
            if(mainArr.length > 0){
                var bool = false;
                var notTravelHomeCnt = mainArr.reduce((acc, cur) => cur.isTravelHome === bool ? ++acc : acc, 0);
                var travelHomeIndex = mainArr.findIndex(x => x.isTravelHome ===true);
                log.debug(stLoggerTitle, 'notTravelHomeCnt = ' + notTravelHomeCnt);
                log.debug(stLoggerTitle, 'travelHomeIndex = ' + travelHomeIndex);

                if(travelHomeIndex >= 0){
                    //Get Travel Home - Actual Travel Time
                    var TravelHomeActualTravel = mainArr[travelHomeIndex].custrecord_sna_ta_actual_travel_time;
                    log.debug(stLoggerTitle, 'TravelHomeActualTravel = ' + TravelHomeActualTravel);

                    var alloc_travelTime = parseFloat(TravelHomeActualTravel/notTravelHomeCnt).toFixed(2);
                    log.debug(stLoggerTitle, 'alloc_travelTime = ' + alloc_travelTime);

                    finalArr = mainArr.map(v => ({...v, custrecord_sna_ta_allocated_travel_time: (v.isTravelHome ? '' : alloc_travelTime)}))

                    log.debug(stLoggerTitle, 'finalArr = ' + JSON.stringify(finalArr));

                }

            }

            if(finalArr.length > 0){
                for(var i = 0; i < finalArr.length; i++){
                    var alloc_id = finalArr[i].id;

                    context.write({
                        key: alloc_id,
                        value: finalArr[i]
                    });

                }
            }


        }

        function reduce(context) {
            var stLoggerTitle = 'reduce';

            log.debug(stLoggerTitle, '*** START *** | Time Allocation ID =' + context.key);

            var reduceData = JSON.parse(JSON.parse(JSON.stringify(context.values)));
            log.debug(stLoggerTitle, JSON.stringify(reduceData));

            var timeAllocId = context.key;

            //update Time Allocaion record
            var timeAllocRecObj = record.submitFields({
                type: 'customrecord_sna_time_allocation',
                id: timeAllocId,
                values: {
                    'custrecord_sna_ta_actual_travel_time': reduceData.custrecord_sna_ta_actual_travel_time,
                    'custrecord_sna_ta_actual_service_time': reduceData.custrecord_sna_ta_actual_service_time,
                    'custrecord_sna_ta_allocated_travel_time': reduceData.custrecord_sna_ta_allocated_travel_time
                }
            });

            log.debug(stLoggerTitle, '*** END *** | Time Allocation ID =' + context.key);

        }

        function summarize(context) {
            var stLoggerTitle = 'summarize';

            log.audit({
                title: 'Usage units consumed',
                details: context.usage
            });
            log.audit({
                title: 'Concurrency',
                details: context.concurrency
            });
            log.audit({
                title: 'Number of yields',
                details: context.yields
            });

            handleErrorIfAny(context);

        }

        function dateTimeDiff(d1, d2){
            var d1 = new Date(d1); //Start time
            var d2 = new Date(d2);  //Arrival Time
            var diff = Math.abs(d1-d2);  // difference in milliseconds

            main = Math.floor((diff/1000/60) << 0), dec = Math.floor((diff/1000) % 60);

            var finalMain = parseFloat(main / 60).toFixed(2);
            var finalDec = parseFloat((dec / 60) / 60).toFixed(2);

            var result = Number(finalMain)+Number(finalDec)
            return result;
        }

        function handleErrorIfAny(summary) {
            var inputSummary = summary.inputSummary;
            var mapSummary = summary.mapSummary;
            var reduceSummary = summary.reduceSummary;

            if (inputSummary.error) {
                var e = error.create({
                    name : 'INPUT_STAGE_FAILED',
                    message : inputSummary.error
                });
                //handleErrorAndSendNotification(e, 'getInputData');
            }

            handleErrorInStage('map', mapSummary);
            handleErrorInStage('reduce', reduceSummary);
        }

        function handleErrorInStage(stage, summary) {
            var errorMsg = [];
            summary.errors.iterator().each(function(key, value) {
                if (!isEmpty(JSON.parse(value).message)) {
                    var msg = 'Error was: ' + JSON.parse(value).message + '\n';
                    errorMsg.push(msg);
                }
            });
            if (errorMsg.length > 0) {
                var e = error.create({
                    name : 'ERROR_IN_STAGE',
                    message : JSON.stringify(errorMsg)
                });
                //handleErrorAndSendNotification(e, stage);
            }
        }


        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue))               );
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
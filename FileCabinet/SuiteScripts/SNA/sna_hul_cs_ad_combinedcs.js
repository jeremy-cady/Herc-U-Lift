/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to combine item pricing, rental, temporary item and asset fleet client scripts
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/2/9       		                 aduldulao       Initial version.
 * 2023/2/10       		                 aduldulao       Calculate Rent Cost
 * 2023/2/25       		                 aduldulao       Temporary Items to estimates
 * 2023/3/1       		                 aduldulao       Allow admin override
 * 2023/3/15       		                 aduldulao       New Unit Cost w/o discount
 * 2023/3/17                             nretiro         commented out setSOVendorPrice function call
 * 2023/4/7                              aduldulao       Remove use of main line customer pricing group
 * 2023/4/12                             aduldulao       Lock Rate
 * 2023/5/4                              aduldulao       New item categories
 * 2023/5/23                             aduldulao       Add service code filter
 * 2023/6/08                             aduldulao       Estimated PO Rate
 * 2023/6/13                             aduldulao       Auto Create Time Entries
 * 2023/6/15                             aduldulao       Sublet
 * 2023/6/22                             caranda         validateLine for Service Pricing
 * 2023/7/13                             aduldulao       Rental enhancements
 * 2023/8/18                             caranda         Added Override Rate condition in Service Pricing
 * 2023/8/18                             caranda         Modified finalQty
 * 2023/8/21                             caranda         Converted log.debug to console.log except for saveRecord
 * 2023/9/1                              caranda         Fixed finalQty condition
 * 2023/8/6                              caranda         Updated validateLine for Service Pricing
 * 2023/9/20                             caranda         Service Pricing equipCat update
 * 2023/9/25                             aduldulao       Parts Pricing > Add Revenue Stream
 * 2023/9/27                             aduldulao       Item Price Level of sublet and temporary items
 * 2023/9/28                             aduldulao       Used Equipment Item
 * 2023/10/6                             caranda         Add Estimate to Service Pricing
 * 2023/10/18                            caranda         Removed Object sourcing for Estimate
 * 2023/11/20                            aduldulao       Multiple billing formula
 * 2023/12/13                            aduldulao       Maintenance
 * 2023/12/13                            aduldulao       Set Task in sales order
 * 2023/12/19                            aduldulao       Use existing temporary item
 * 2024/07/05                            aduldulao       PM rate
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/runtime', 'N/search', 'N/url', 'N/format', 'N/http', 'N/xml', 'SuiteScripts/moment.js'],
    /**
     * @param{currentRecord} currentRecord
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    function(currentRecord, record, runtime, search, url, format, http, xml, moment) {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function padLeft(data, number) {
            return data.padStart(number, 0);
        }

        function getDate(date) {
            if (!date) return "";
            date = new Date(date);
            var day = padLeft(date.getDate().toString(), 2);
            var month = padLeft((date.getMonth() + 1).toString(), 2);
            var year = date.getFullYear().toString();
            return [month, day, year].join("/");
        }

        function getProjectType(projectId) {
            if (!projectId) return "";

            try {
                return search.lookupFields({
                    type: search.Type.JOB,
                    id: projectId,
                    columns: ["custentity_nx_project_type"]
                }).custentity_nx_project_type[0];
            } catch (e) {
                return "";
            }
        }

        // Geography
        function getSalesZone(address) {
            var response = [];
            // var address = taskRecord.getValue({fieldId: "custevent_nx_address"});
            // var matches = address.match(/(\d+)/g);
            // var numbers = matches.filter(element => element.length > 3);

            var numbers = [];
            var zipCodes = [];
            var addressArray = address.replace(/\n/g, " ").replace(/\r/g, " ").split(" ");

            for (var x = 0; x < addressArray.length; x++) {
                var element = addressArray[x];
                var matches = element.match(/\d+/g);
                if (!!matches && matches.length != 0 && element.length > 3) {
                    numbers.push(element);
                    zipCodes.push({zipCode: element});
                }
            }

            /*addressArray.forEach(element => {
                var matches = element.match(/\d+/g);
                if (!!matches && matches.length != 0 && element.length > 3) {
                    numbers.push(element);
                    zipCodes.push({zipCode: element});
                }
            })*/

            var filters = [];

            for (var i = 0; i < numbers.length; i++) {
                var zipCode = numbers[i];
                filters.push(["custrecord_sna_st_zip_code", "is", zipCode]);
                if (i != numbers.length - 1)
                    filters.push("OR");
            }

            search.create({
                type: "customrecord_sna_sales_zone", filters: filters,
                columns: [
                    search.createColumn({name: "custrecord_sna_st_zip_code", label: "Zip Code"}),
                    search.createColumn({name: "custrecord_sna_st_description", label: "Description"}),
                    search.createColumn({name: "custrecord_sna_sz_cpg", label: "Customer Pricing Group"})
                ]
            }).run().each(function (result) {
                response.push({
                    id: result.id,
                    zipCode: result.getValue("custrecord_sna_st_zip_code"),
                    custPricingGrp: result.getValue("custrecord_sna_sz_cpg")
                });
                return true;
            });
            if (response.length != 0)
                return response;
            else return zipCodes;
        }

        function getDefaultPMRate() {
            var pmRate = 0;
            search.create({
                type: "customrecord_sna_hul_pmpricingrate",
                filters: [
                    {name: "custrecord_sna_hul_pmpricedefault", operator: "is", values: true},
                    {name: "isinactive", operator: "is", values: false},
                ],
                columns: [
                    search.createColumn({name: "custrecord_sna_hul_pmpricepmrate", label: "PM Rate"})
                ]
            }).run().each(function (result) {
                pmRate = result.getValue("custrecord_sna_hul_pmpricepmrate");
                return true;
            });
            return pmRate;
        }

        function checkPMServiceItem(item) {
            return search.lookupFields({
                type: search.Type.ITEM, id: item, columns: "custitem_sna_hul_itemincludepmrate"
            }).custitem_sna_hul_itemincludepmrate;
        }

        function getEquipmentCategory() {
            var response = [];

            search.create({
                type: "customrecord_cseg_sna_hul_eq_seg",
                filters: [["isinactive", "is", "F"]],
                columns: [
                    search.createColumn({name: "name", label: "Name"}),
                    search.createColumn({name: "parent", label: "Parent"})
                ]
            }).run().each(function (result) {
                response.push({
                    id: result.id, name: result.getValue("name"), parent: result.getValue("parent")
                });
                return true;
            });

            log.debug({title: "getEquipmentCategory response", details: JSON.stringify(response)});

            for (var i = 0; i < response.length; i++) {
                var element = response[i];
                if (!!element.parent) {
                    var flag = true;
                    do {
                        var obj = response.find(function(e){return e.id === element.parent}); //var obj = response.find(e => e.id == element.parent);
                        if (!!obj.parent) {
                            element.parent = obj.parent;
                        } else {
                            response[i].top = obj.id;
                            flag = false;
                        }
                    } while (flag)
                }
            }
            return response;
        }

        function getAllSearchResults (resultSet) {
            var batch, batchResults, results = [], searchStart = 0;
            do {
                batch = resultSet.getRange({start: searchStart, end: searchStart + 1000});
                batchResults = (batch || []).map(function (row) {
                    searchStart++;
                    return row;
                }, this);
                results = results.concat(batchResults);
            } while ((batchResults || []).length === 1000);

            return results;
        }

        function searchPMRates(searchFilters) {
            var response = [];
            var pricingSearchObj = search.create({
                type: "customrecord_sna_hul_pmpricingrate", filters: searchFilters,
                columns: [
                    search.createColumn({name: "custrecord_sna_hul_pmpriceequiptype", label: "Equipment Type"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpriceobjectnum", label: "Object No."}),
                    search.createColumn({name: "custrecord_sna_hul_pmpriceserviceaction", label: "Service Action"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpricefreq", label: "Frequency"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpricecust", label: "Customer Number"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpricezip", label: "Zip Code"}),
                    search.createColumn({name: "custrecord_sna_hul_pmcustpricegroup", label: "Customer Pricing Group"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpriceminqty", label: "Min Quantity"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpricemaxqty", label: "Max Quantity"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpricestartdate", label: "Start Date"}),
                    search.createColumn({name: "custrecord_sna_hul_pmpriceenddate", label: "End Date"}),
                    search.createColumn({
                        name: "custrecord_sna_hul_pmpricepmrate", label: "PM Rate", sort: search.Sort.DESC
                    }),
                    search.createColumn({name: "custrecord_sna_hul_pmpricedefault", label: "Default Rate"}),
                    search.createColumn({
                        name: "parent",
                        join: "custrecord_sna_hul_pmpriceequiptype",
                        label: "Parent Equipment Type"
                    })
                ]
            }).run();

            var results = getAllSearchResults(pricingSearchObj);

            results.forEach(function (result) {
                // log.debug({title:"searchPMRates result", details: result});
                response.push({
                    id: result.id,
                    equipmentType: result.getValue("custrecord_sna_hul_pmpriceequiptype"),
                    objectNo: result.getValue("custrecord_sna_hul_pmpriceobjectnum"),
                    serviceAction: result.getValue("custrecord_sna_hul_pmpriceserviceaction"),
                    frequency: result.getValue("custrecord_sna_hul_pmpricefreq"),
                    zipCode: result.getValue("custrecord_sna_hul_pmpricezip"),
                    customer: result.getValue("custrecord_sna_hul_pmpricecust"),
                    customerPricingGroup: result.getValue("custrecord_sna_hul_pmcustpricegroup"),
                    minQuantity: result.getValue("custrecord_sna_hul_pmpriceminqty"),
                    maxQuantity: result.getValue("custrecord_sna_hul_pmpricemaxqty"),
                    startDate: result.getValue("custrecord_sna_hul_pmpricestartdate"),
                    endDate: result.getValue("custrecord_sna_hul_pmpriceenddate"),
                    pmRate: result.getValue("custrecord_sna_hul_pmpricepmrate"),
                    default: result.getValue("custrecord_sna_hul_pmpricedefault"),
                    parentEquipmentType: result.getValue({name: "parent", join: "custrecord_sna_hul_pmpriceequiptype"}),
                });
                return true;
            });
            return response;
        }

        function getPMRates(requestData, salesZones) {
            var response = [];

            var filters = [];
            var searchFilters = [];

            if (!!requestData.zipCode)
                filters.push({
                    name: "custrecord_sna_hul_pmpricezip",
                    operator: "startswith",
                    values: requestData.zipCode.split("-")[0]
                });
            if (!!requestData.custPricingGrp)
                filters.push({
                    name: "custrecord_sna_hul_pmcustpricegroup",
                    operator: "is",
                    values: requestData.custPricingGrp
                });

            // if (!!requestData.objectNo)
            //     filters.push({
            //         name: "custrecord_sna_hul_pmpriceobjectnum",
            //         operator: "is",
            //         values: requestData.objectNo
            //     });

            // if (!!requestData.quantity) {
            //     filters.push({
            //         name: "custrecord_sna_hul_pmpriceminqty",
            //         operator: "lessthanorequalto",
            //         values: requestData.quantity
            //     });
            //     filters.push({
            //         name: "custrecord_sna_hul_pmpricemaxqty",
            //         operator: "greaterthanorequalto",
            //         values: requestData.quantity
            //     });
            // }
            // if (!!requestData.tranDate) {
            //     filters.push({
            //         name: "custrecord_sna_hul_pmpricestartdate",
            //         operator: "onorbefore",
            //         values: requestData.tranDate
            //     });
            //     filters.push({
            //         name: "custrecord_sna_hul_pmpriceenddate",
            //         operator: "onorafter",
            //         values: requestData.tranDate
            //     });
            // }

            try {
                var zoneFilters = [];
                for (var i = 0; i < salesZones.length; i++) {
                    var salesZone = salesZones[i];

                    var filter = [];
                    if (!!salesZone.zipCode)
                        filter.push(["custrecord_sna_hul_pmpricezip", "startswith", salesZone.zipCode.split("-")[0]]);
                    if (!!salesZone.custPricingGrp) {
                        if (!!salesZone.zipCode) filter.push("AND");
                        filter.push(["custrecord_sna_hul_pmcustpricegroup", "is", salesZone.custPricingGrp]);
                    }
                    zoneFilters.push(filter);

                    if (zoneFilters.length != 0 && i != salesZones.length - 1)
                        zoneFilters.push("OR");
                }
                if (zoneFilters.length != 0)
                    searchFilters.push(zoneFilters);
            } catch (error) {
            }

            for (var i = 0; i < filters.length; i++) {
                var element = filters[i];
                if (searchFilters.length != 0)
                    searchFilters.push("AND");

                searchFilters.push([element.name, element.operator, element.values]);
                // if (i != filters.length - 1)
                //     searchFilters.push("AND");
            }

            // if (requestData.default) {
            //     filters.push({
            //         name: "custrecord_sna_hul_pmpricedefault",
            //         operator: "is",
            //         values: true
            //     });
            // }

            log.debug({title: "getPMRates filters", details: searchFilters});

            // Search PM Rates with Zip Codes & object no
            response = searchPMRates(searchFilters);

            // Search PM Rates without Zip Codes and Only Object No
            if (response.length == 0 && !!requestData.objectNo)
                response = searchPMRates([{
                    name: "custrecord_sna_hul_pmpriceobjectnum",
                    operator: "is",
                    values: requestData.objectNo
                }]);

            // Return all PM Rates
            if (response.length == 0)
                response = searchPMRates([]);

            return response;
        }

        function getRate(requestData, salesZones) {
            var responseRate = getDefaultPMRate();
            // var responseRate = 0; // Add Default Rate
            var rates = getPMRates(requestData, salesZones);
            var equipList = getEquipmentCategory();
            log.audit('equipList', equipList);

            var rateCheck = [];
            for (var i = 0; i < rates.length; i++) {
                var element = rates[i];
                var checkCount = 0, equipmentTypeParent;
                var equipmentObj = equipList.find(function(e){return e.id === element.equipmentType}); //var equipmentObj = equipList.find(e => e.id == element.equipmentType);
                if (!isEmpty(equipmentObj)) {
                    equipmentTypeParent = equipmentObj.top;
                }

                log.audit('equipmentTypeParent', equipmentTypeParent);

                for (var j = 0; j < salesZones.length; j++) {
                    var salesZone = salesZones[j];

                    if ((element.zipCode.includes("-") || salesZone.zipCode.includes("-")) && element.zipCode.split("-")[0] == salesZone.zipCode.split("-")[0])
                        checkCount = checkCount + 2;
                    else if (element.zipCode == salesZone.zipCode)
                        checkCount = checkCount + 2;
                    if (element.customerPricingGroup == salesZone.custPricingGrp)
                        checkCount = checkCount + 2;
                }

                /*salesZones.forEach(salesZone => {
                    if ((element.zipCode.includes("-") || salesZone.zipCode.includes("-")) && element.zipCode.split("-")[0] == salesZone.zipCode.split("-")[0])
                        checkCount = checkCount + 2;
                    else if (element.zipCode == salesZone.zipCode)
                        checkCount = checkCount + 2;
                    if (element.customerPricingGroup == salesZone.custPricingGrp)
                        checkCount = checkCount + 2;
                })*/
                // Also check with Parents
                if (!!requestData.equipmentType && (element.equipmentType == requestData.equipmentType || equipmentTypeParent == requestData.equipmentType))
                    checkCount = checkCount + 10;
                if (!!requestData.serviceAction && element.serviceAction == requestData.serviceAction)
                    checkCount = checkCount + 1;
                if (!!requestData.objectNo && element.objectNo == requestData.objectNo)
                    checkCount = checkCount + 1000;
                if (!!requestData.frequency && element.frequency == requestData.frequency)
                    checkCount = checkCount + 1;
                if (!!requestData.customer && element.customer == requestData.customer)
                    checkCount = checkCount + 100;
                if (!!requestData.quantity && element.minQuantity >= requestData.quantity && requestData.quantity <= element.maxQuantity)
                    checkCount = checkCount + 1;
                if (!!requestData.tranDate && !!element.startDate && !!element.endDate && element.startDate <= requestData.tranDate && requestData.tranDate >= element.endDate)
                    checkCount = checkCount + 20;
                // if (element.pmRate == requestData.pmRate)
                //     checkCount++;
                // if (element.default)
                //     checkCount++;

                rateCheck.push(checkCount);
            }

            log.audit('rateCheck', rateCheck);

            var maxCheck = Math.max.apply(null, rateCheck);//Math.max(...rateCheck);

            var index = rateCheck.indexOf(maxCheck);//rateCheck.findIndex(element => element == maxCheck);

            if (index != -1 && !!rates[index].pmRate)
                responseRate = rates[index].pmRate;

            return responseRate;
        }

        function isArray(value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        }

        function isObject(value) {
            return Object.prototype.toString.call(value) === '[object Object]';
        };

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
            }
            return flValue;
        }

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
        }

        function replaceAll(str, find, replaceString) {
            return str.replace(new RegExp(find, 'g'), replaceString);
        }

        function addDays(dtDate, intDays) {
            if (isEmpty(dtDate)) return '';

            var result = new Date(dtDate);
            result.setDate(result.getDate() + intDays);
            return result;
        }

        function workday_count(start, end) {
            // Validate input
            if (end < start)
                return 0;
            if (isEmpty(end) || isEmpty(start))
                return 0;

            start = moment(start);
            end = moment(end);

            var first = start.clone().endOf('week'); // end of first week
            var last = end.clone().startOf('week'); // start of last week
            var days = last.diff(first,'days') * 5 / 7; // this will always multiply of 7
            var wfirst = first.day() - start.day(); // check first week
            if(start.day() == 0) --wfirst; // -1 if start with sunday
            var wlast = end.day() - last.day(); // check last week
            if(end.day() == 6) --wlast; // -1 if end with saturday
            return wfirst + Math.floor(days) + wlast; // get the total
        }

        function workingDaysBetweenDates(startDate, endDate) {
            // Validate input
            if (endDate < startDate)
                return 0;
            if (isEmpty(endDate) || isEmpty(startDate))
                return 0;

            console.log('2 starting date: ' + startDate + ' | ' + endDate);

            var vTimezoneDiff2 = startDate.getTimezoneOffset() - endDate.getTimezoneOffset();
            var vTimezoneDiff = endDate.getTimezoneOffset() - startDate.getTimezoneOffset(); // startdate is dst
            console.log('1 vTimezoneDiff: ' + vTimezoneDiff + ' | vTimezoneDiff2: ' + vTimezoneDiff2);

            if (vTimezoneDiff > 0) {
                // Handle daylight saving time difference between two dates.
                startDate.setMinutes(startDate.getMinutes() + vTimezoneDiff);
            }
            else if (vTimezoneDiff2 > 0) {
                // Handle daylight saving time difference between two dates.
                endDate.setMinutes(endDate.getMinutes() + vTimezoneDiff);
            }

            var offset = 0;
            if (startDate.toString().includes('Daylight') && !endDate.toString().includes('Daylight')) {
                offset = -1;
            }
            else if (endDate.toString().includes('Daylight') && !startDate.toString().includes('Daylight')) {
                offset = 1;
            }
            console.log('offset: ' + offset);

            console.log('3 actual dates: ' + startDate + ' | ' + endDate);

            // Calculate days between dates
            var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
            startDate.setHours(0,0,0,1);  // Start just after midnight
            endDate.setHours(23,59,59,999);  // End just before midnight
            var diff = endDate - startDate;  // Milliseconds between datetime objects
            var days = Math.ceil(diff / millisecondsPerDay);

            // Subtract two weekend days for every week in between
            var weeks = Math.floor(days / 7);
            days = days - (weeks * 2);

            // Handle special cases
            var startDay = startDate.getDay();
            var endDay = endDate.getDay();

            // 10/19 - this should be ok. issue on last condition only
            //if (offset == 0) {
            // Remove weekend not previously removed.
            if (startDay - endDay > 1)
                days = days - 2;

            // Remove start day if span starts on Sunday but ends before Saturday
            if (startDay == 0 && endDay != 6)
                days = days - 1

            // Remove end day if span ends on Saturday but starts after Sunday
            if (endDay == 6 && startDay != 0)
                days = days - 1

            // start date is DST
            if (endDay == 1 && startDay == 3 && offset == -1)
                days = days + 2; // for some reason, Wed is -1 day so need to add 2 days to counter offset

            // Remove start day if span starts on Sunday but ends before Saturday
            //if (endDay == 6 && startDay != 0)
            //days = days - 1
            //}

            console.log('days: ' + days + ' | ' + (days + offset))
            return days + offset;
        }

        var TEMPITEMCAT = '';
        var allieditemcat = '';
        var rackingitemcat = '';
        var storageitemcat = '';
        var RENTALCHARGE = '';
        var RENTALEQUIPMENT = '';
        var CONVERTTOITEM = '';
        var CONVERTEDROLES = '';
        var CURRENTROLE = '';
        var itemservicecodetype = '';
        var resourceservicecodetype = '';
        var subletitemcat = '';
        var rentalform = '';
        var usedequipment = '';
        var newequipment = '';
        var PLANNED_MAINTENANCE = '';

        var GLOBAL = {
            param_4weekly: '',
            param_weekly: '',
            param_daily: '',
            param_hour: '',
            param_ldw: '',
            param_ot: ''
        }

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            var currentScript = runtime.getCurrentScript();

            // ** START ITEM PRICING **
            TEMPITEMCAT = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
            RENTALCHARGE = currentScript.getParameter({name: 'custscript_sna_rental_serviceitem'});
            RENTALEQUIPMENT = currentScript.getParameter({name: 'custscript_sna_rental_equipment'});
            itemservicecodetype = currentScript.getParameter({name: 'custscript_sna_servicecodetype_item'});
            subletitemcat = currentScript.getParameter({name: 'custscript_sna_itemcat_sublet'});
            // ** END ITEM PRICING **

            // ** START TIME ENTRY **
            resourceservicecodetype = currentScript.getParameter({name: 'custscript_sna_servicetype_resource'});
            // ** END TIME ENTRY **

            // ** START RENTAL **
            GLOBAL.param_4weekly = currentScript.getParameter({name: 'custscript_sna_unit_4weekly'});
            GLOBAL.param_weekly = currentScript.getParameter({name: 'custscript_sna_unit_weekly'});
            GLOBAL.param_daily = currentScript.getParameter({name: 'custscript_sna_unit_daily'});
            GLOBAL.param_hour = currentScript.getParameter({name: 'custscript_sna_unit_hour'});
            GLOBAL.param_ldw = currentScript.getParameter({name: 'custscript_sna_group_ldw'});
            GLOBAL.param_ot = currentScript.getParameter({name: 'custscript_sna_group_overtime'});
            rentalform = currentScript.getParameter({name: 'custscript_sn_hul_sorentalform'});
            usedequipment = currentScript.getParameter({name: 'custscript_sn_hul_used_equipment'});
            newequipment = currentScript.getParameter({name: 'custscript_sn_hul_new_equipment'});
            // ** END RENTAL **

            // ** START TEMPORARY ITEM **
            var userObj = runtime.getCurrentUser();
            if (!isEmpty(userObj)) {
                CURRENTROLE = userObj.role;
            }

            CONVERTEDROLES = currentScript.getParameter({name: 'custscript_sna_hul_converted_roles'}).split(',');
            CONVERTTOITEM = currentScript.getParameter({name: 'custscript_sna_hul_convert_to_item'});
            PLANNED_MAINTENANCE = currentScript.getParameter({name: 'custscript_cs_planned_maintenance'});
            // ** END TEMPORARY ITEM **
        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {
            var sublist = scriptContext.sublistId;
            var rec = currentRecord.get();
            var line = rec.getCurrentSublistIndex({sublistId: sublist});

            disableColumn('custcol_sna_hul_dollar_disc', 'custcol_sna_hul_perc_disc', line);
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;
            var rec = scriptContext.currentRecord;
            var line = scriptContext.line;
            var rectype = rec.type;

            if (isEmpty(sublist)) {
                if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                    // ** START ITEM PRICING **
                    /*if (field == 'custbody_sna_hul_cus_pricing_grp') {
                        rec.cancelLine({sublistId: 'item'}); // loner line

                        log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | setPriceLevel'});
                        setPriceLevel(rec, null, field);
                    }*/
                    if (field == 'custbody_sna_hul_location' || field == 'location') {
                        //log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | setLocationMarkUp'});
                        console.log('-- fieldChanged | field: ' + field + ' | setLocationMarkUp');
                        setLocationMarkUp(rec, null, field);
                    }
                    // ** END ITEM PRICING **

                    // ** START RENTAL **
                    if (field == 'startdate' || field == 'enddate') {
                        var startdate = rec.getValue({fieldId: 'startdate'});
                        var enddate = rec.getValue({fieldId: 'enddate'});

                        var timeqty = workday_count(startdate, enddate); // no need to get rental days because time unit is always Day

                        if (forceFloat(timeqty) < 5) {
                            rec.setValue({fieldId: 'custbody_sn_rental_contract_type', value: GLOBAL.param_daily});
                        }
                        else if (forceFloat(timeqty) >= 5 && forceFloat(timeqty) < 20) {
                            rec.setValue({fieldId: 'custbody_sn_rental_contract_type', value: GLOBAL.param_weekly});
                        }
                        else if (forceFloat(timeqty) >= 20) {
                            rec.setValue({fieldId: 'custbody_sn_rental_contract_type', value: GLOBAL.param_4weekly});
                        }
                    }

                    if (field == 'startdate') {
                        var startdate = rec.getValue({fieldId: 'startdate'});
                        var dateminus = !isEmpty(startdate) ? addDays(startdate, -1) : '';

                        rec.setValue({fieldId: 'custbody_sn_rental_delivery_date', value: dateminus});
                    }
                    // ** END RENTAL **
                }
            }
            if (sublist == 'item') {
                if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                    // ** START ITEM PRICING **
                    // validateline works
                    /*if (field == 'custcol_sna_hul_itemcategory' || field == 'custcol_sna_hul_replacementcost') {
                        log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setPriceLevel'});
                        setPriceLevel(rec, sublist, field);
                    }
                    if (field == 'custcol_sna_hul_markup' || field == 'custcol_sna_hul_markupchange' || field == 'custcol_sna_hul_loc_markupchange') {
                        log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setCumulativeMarkup'});
                        setCumulativeMarkup(rec, sublist, field);
                    }*/
                    if (field == 'custcol_sna_hul_dollar_disc' || field == 'item') {
                        disableColumn('custcol_sna_hul_dollar_disc', 'custcol_sna_hul_perc_disc', line);
                    }
                    if (field == 'custcol_sna_hul_perc_disc') {
                        disableColumn('custcol_sna_hul_perc_disc', 'custcol_sna_hul_dollar_disc', line);
                    }
                    // validateline works
                    /*if (field == 'custcol_sna_hul_dollar_disc' || field == 'custcol_sna_hul_perc_disc' || field == 'custcol_sna_hul_cumulative_markup' || field == 'custcol_sna_hul_basis' || field == 'custcol_sna_hul_list_price' || field == 'custcol_sna_hul_replacementcost' || field == 'custcol_sna_hul_itemcategory' || field == 'custcol_sna_hul_markup' || field == 'porate' || field == 'custcol_sna_hul_estimated_po_rate' || field == 'cseg_sna_revenue_st') {
                        //log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setNewCostUnit'});
                        console.log('-- fieldChanged | field: ' + field + ' | sublist: item | setNewCostUnit');
                        setNewCostUnit(rec, sublist, field);
                    }*/
                    if (field == 'custcol_sna_hul_newunitcost' || field == 'quantity') {
                        //log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setAmount'});
                        console.log('-- fieldChanged | field: ' + field + ' | sublist: item | setAmount');
                        setAmount(rec, sublist, field);
                    }
                    // validateline works
                    /*if (field == 'location') {
                        log.debug({title: '-- fieldChanged', details: 'field: ' + field + ' | sublist: item | setLocationMarkUp'});
                        setLocationMarkUp(rec, sublist, field);
                    }*/
                    if (field == 'quantity' || field == 'item' || field == 'povendor') {
                        var poVendor = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'povendor' });

                        log.debug({ title: '-- sublistChanged', details: 'field: ' + field + ' | sublist: item | setSOVendorPrice' });
                        console.log('-- sublistChanged | field: ' + field + ' | sublist: item | setSOVendorPrice');

                        // setSOVendorPrice(rec, sublist, field, poVendor, line);   // NATO | 03172023 | removed. duplicate functionality
                    }
                    // ** END ITEM PRICING **

                    // ** START RENTAL **
                    if (field == 'custcol_sna_po_fleet_code') {
                        var fleetcode = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'custcol_sna_po_fleet_code' });

                        if (!isEmpty(fleetcode)) {
                            var filters = [search.createFilter({ name: 'custrecord_sna_fleet_code', operator: search.Operator.IS, values: fleetcode })];
                            var columns = [
                                search.createColumn({ name: 'custrecord_sna_equipment_model' })
                            ];

                            var objsearch = search.create({ type: 'customrecord_sna_objects', filters: filters, columns: columns});
                            var objres = objsearch.run().getRange({ start: 0, end: 1 }); // assumed to be 1

                            if (!isEmpty(objres)) {
                                var fleetid = objres[0].id;
                                var objmodel = objres[0].getValue({ name: 'custrecord_sna_equipment_model' });

                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_object', value: fleetid});
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', value: fleetid});
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_obj_model', value: objmodel});
                            }
                            else {
                                alert('Object not found')
                            }
                        }
                        else {
                            alert('Fleet Code is empty');
                        }
                    }
                    if (field == 'custcol_sna_configure_object') {
                        var serviceitem = RENTALCHARGE;

                        var selected = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
                        var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});

                        if (itm == serviceitem || itm == usedequipment || itm == newequipment) {
                            var cust = rec.getValue({fieldId: 'entity'});
                            var custgrp = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
                            var loc = rec.getValue({fieldId: 'location'});
                            var trandate = !isEmpty(rec.getValue({fieldId: 'trandate'})) ? format.format({value: new Date(rec.getValue({fieldId: 'trandate'})), type: format.Type.DATE}) : '';

                            var slconfigurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configureobject', deploymentId: 'customdeploy_sna_hul_sl_configureobject',
                                params: {
                                    selected: selected,
                                    fromline: 'T',
                                    cust: cust,
                                    custgrp: custgrp,
                                    trandate: !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '',
                                    loccode: loc
                                }
                            });

                            window.open(slconfigurl, '_blank','width=1000,height=600,top=300,left=300,menubar=1');
                        }
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_configure_object', value: false, ignoreFieldChange: true});
                    }

                    if (field == 'custcol_sna_rental_rate_card') {
                        var trandate = rec.getValue({fieldId: 'trandate'});
                        var selectedratecard = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_rental_rate_card'});

                        var ratecardsub = getTimeUnitPrice(trandate, selectedratecard);

                        var dailyunitcost = !isEmpty(ratecardsub[GLOBAL.param_daily]) ? ratecardsub[GLOBAL.param_daily] : (!isEmpty(ratecardsub[GLOBAL.param_daily+'_temp']) ? ratecardsub[GLOBAL.param_daily+'_temp'] : '');
                        var weeklyunitcost = !isEmpty(ratecardsub[GLOBAL.param_weekly]) ? ratecardsub[GLOBAL.param_weekly] : (!isEmpty(ratecardsub[GLOBAL.param_weekly+'_temp']) ? ratecardsub[GLOBAL.param_weekly+'_temp'] : '');
                        var fourweekunitcost = !isEmpty(ratecardsub[GLOBAL.param_4weekly]) ? ratecardsub[GLOBAL.param_4weekly] : (!isEmpty(ratecardsub[GLOBAL.param_4weekly+'_temp']) ? ratecardsub[GLOBAL.param_4weekly+'_temp'] : '');

                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_rate', value: dailyunitcost, forceSyncSourcing: true});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_weekly_rate', value: weeklyunitcost, forceSyncSourcing: true});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_4week_rate', value: fourweekunitcost, forceSyncSourcing: true});
                    }

                    if (field == 'custcol_sna_hul_calcrentcost') {
                        var serviceitem = RENTALCHARGE;

                        var selected = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
                        var selectedrc = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_rental_rate_card'});
                        var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
                        var linenum = rec.getCurrentSublistIndex({sublistId: 'item'});

                        if (itm == serviceitem) {
                            var cust = rec.getValue({fieldId: 'entity'});
                            var custgrp = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
                            var loc = rec.getValue({fieldId: 'location'});
                            var trandate = !isEmpty(rec.getValue({fieldId: 'trandate'})) ? format.format({value: new Date(rec.getValue({fieldId: 'trandate'})), type: format.Type.DATE}) : '';

                            var slconfigurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectratecard', deploymentId: 'customdeploy_sna_hul_sl_selectratecard',
                                params: {
                                    selected: selected,
                                    selectedrc: selectedrc,
                                    fromline: 'T',
                                    linenum: linenum,
                                    cust: cust,
                                    custgrp: custgrp,
                                    trandate: !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '',
                                    loccode: loc
                                }
                            });

                            window.open(slconfigurl, '_blank','width=1000,height=600,top=300,left=300,menubar=1');
                        }
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_calcrentcost', value: false, ignoreFieldChange: true});
                    }
                    // ** END RENTAL **
                }

                if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE || rectype == record.Type.PURCHASE_ORDER || rectype == record.Type.OPPORTUNITY) {
                    // ** START ASSET FLEET **
                    if (field == 'custcol_sna_hul_fleet_no') {
                        var rentalitm = RENTALEQUIPMENT;
                        var currform = rec.getValue({fieldId: 'customform'});

                        var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});

                        if (isEmpty(itm)) {
                            if (currform == rentalform) {
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: RENTALCHARGE});
                            }
                            /*else if (currform != rentalform && !isEmpty(rentalitm)) {
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: rentalitm});
                            }*/
                        }
                    }
                    // ** END ASSET FLEET **
                }
            }
        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {
            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;
            var rec = scriptContext.currentRecord;
            var line = scriptContext.line;
            var rectype = rec.type;

            if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                // ** START TEMPORARY ITEM **
                var tempitemcat = TEMPITEMCAT;

                if (field == 'custcol_sna_hul_returns_handling') {
                    var itemhandling = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_returns_handling'});
                    var itmcatcust = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory'});

                    if ((tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat) && itemhandling == CONVERTTOITEM && !isEmpty(CURRENTROLE) && !inArray(CURRENTROLE, CONVERTEDROLES)) {
                        alert('You cannot change the Temp Returns Handling to Convert to Item');
                        return false;
                    }
                }
                // ** END TEMPORARY ITEM **

                // ** START ITEM PRICING **
                if (field == 'custcol_sna_amt_manual') {
                    if (CURRENTROLE != 3
                        && CURRENTROLE != 1155
                        && CURRENTROLE != 1175
                        && CURRENTROLE != 1174
                        && CURRENTROLE != 1185
                        && CURRENTROLE != 1152
                        && CURRENTROLE != 1163
                        && CURRENTROLE != 1168
                        && CURRENTROLE != 1171
                        && CURRENTROLE != 1165
                        && CURRENTROLE != 1178
                        && CURRENTROLE != 1159
                        && CURRENTROLE != 1147) {
                        alert('You cannot override the rate');
                        return false;
                    }
                }
                // ** END ITEM PRICING **

                // ** START TIME ENTRY
                if (field == 'custcol_sna_hul_act_service_hours') {
                    var orderstatus = rec.getValue({fieldId: 'orderstatus'});
                    var timeposted = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_time_posted'});
                    var linkedtime = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_linked_time'});
                    var lineservicetype = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode'});
                    var nxtask = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task'});
                    //log.debug({title: '-- validateField', details: 'field: ' + field + ' | lineservicetype: ' + lineservicetype + ' | orderstatus: ' + orderstatus + ' | timeposted: ' + timeposted + ' | linkedtime: ' + linkedtime + ' | nxtask: ' + nxtask});
                    console.log('-- validateField | field: ' + field + ' | lineservicetype: ' + lineservicetype + ' | orderstatus: ' + orderstatus + ' | timeposted: ' + timeposted + ' | linkedtime: ' + linkedtime + ' | nxtask: ' + nxtask)

                    if (!isEmpty(linkedtime) && !isEmpty(nxtask) && lineservicetype == resourceservicecodetype) {
                        if (timeposted) {
                            alert('Linked time entry is already posted.');
                            return false;
                        }
                        if (orderstatus == 'G') {
                            alert('Sales order is already billed.');
                            return false;
                        }
                        if (orderstatus == 'H') {
                            alert('Sales order is already closed.');
                            return false;
                        }
                    }
                }
                // ** END TIME ENTRY
            }

            return true;
        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {
            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;
            var rec = scriptContext.currentRecord;
            var rectype = rec.type;

            if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                // ** START ITEM PRICING **
                /*if (isEmpty(sublist)) { // originally in postsourcing before custom location field
                    if (field == 'location') {
                        log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | setLocationMarkUp'});
                        setLocationMarkUp(rec, null, field);
                    }
                }*/
                if (sublist == 'item') {
                    /*if (field == 'location') {
                        log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setLocationMarkUp'});
                        setLocationMarkUp(rec, sublist, field);
                    }*/
                    // validateline works
                    /*if (field == 'item') {
                        log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setLocationMarkUp'});
                        setLocationMarkUp(rec, sublist, field);
                        log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | sublist: item | setVendorPrice'});
                        setVendorPrice(rec, sublist, field);
                    }*/
                }
                // ** END ITEM PRICING **

                // ** START RENTAL
                if (field == 'shipaddresslist') {
                    rec.setValue({fieldId: 'custbody_sna_hul_address_changed', value: true});

                    var shipaddrSubrecord = rec.getSubrecord({fieldId: 'shippingaddress'});
                    var prcinggroup = shipaddrSubrecord.getValue({fieldId: 'custrecord_sna_cpg_parts'});
                    //log.debug({title: '-- postSourcing', details: 'prcinggroup: ' + prcinggroup});
                    console.log('-- postSourcing | prcinggroup: ' + prcinggroup)

                    var addressid = rec.getValue({fieldId: 'shipaddresslist'});
                    var entity = rec.getValue({fieldId: 'entity'});

                    //if (!isEmpty(entity) && isEmpty(prcinggroup) && !isEmpty(addressid)) {
                    var custpricinggrp = getCustPricingGrpAddress(entity, addressid);
                    //log.debug({title: '-- postSourcing', details: 'field: ' + field + ' | custpricinggrp: ' + custpricinggrp});
                    console.log('-- postSourcing | field: ' + field + ' | custpricinggrp: ' + custpricinggrp)

                    shipaddrSubrecord.setValue({fieldId: 'custrecord_sna_cpg_parts', value: custpricinggrp});
                    setPriceLevel(rec, null, field);
                    //}
                }
                if (field == 'custbody_nx_task') {
                    var sotask = rec.getValue({fieldId: 'custbody_nx_task'});
                    var socase = rec.getValue({fieldId: 'custbody_nx_case'});
                    console.log('sotask: ' + sotask + ' | socase: ' + socase);

                    rec.setValue({fieldId: 'custbody_nx_case', value: socase});

                    if (!isEmpty(sotask) && isEmpty(socase)) {
                        var taskRecord = record.load({type: record.Type.TASK, id: sotask});
                        var supportCase = taskRecord.getValue({fieldId: 'supportcase'});

                        rec.setValue({fieldId: 'custbody_nx_case', value: supportCase});
                    }
                }
                // ** END RENTAL
            }

            /*if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE || rectype == record.Type.PURCHASE_ORDER || rectype == record.Type.OPPORTUNITY) {
                // ** START ASSET FLEET **
                var fa = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_fam_obj'});
                if (!isEmpty(fa)) {
                    var farec = record.load({type: 'customrecord_ncfar_asset', id: fa, isDynamic: true});
                    var nbv = farec.getValue({fieldId: 'custrecord_assetbookvalue'});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fa_nbv', value: nbv});
                }
                // ** END ASSET FLEET **
            }*/
        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {
            var rec = scriptContext.currentRecord;
            var rectype = rec.type;
            var isCommissionOverride = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_override_recalc_condi'});

            if(isCommissionOverride){
                var percentDiscount = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_perc_disc'});
                var dollarDiscount = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dollar_disc'});
                var itemRate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'rate'});
                console.log('percentDiscount = ' + percentDiscount);
                console.log('typeof percentDiscount = ' + typeof percentDiscount);
                console.log('dollarDiscount = ' + dollarDiscount);
                console.log('typeof dollarDiscount = ' + typeof dollarDiscount);
                console.log('itemRate = ' + itemRate);
                console.log('typeof itemRate = ' + typeof itemRate);

                var finalPrice;

                if(!isEmpty(percentDiscount) && isEmpty(dollarDiscount)){
                    finalPrice = itemRate - (itemRate * (percentDiscount/100));
                    console.log('total discount = ' + (itemRate * percentDiscount));
                } else if(isEmpty(percentDiscount) && !isEmpty(dollarDiscount)){
                    finalPrice = itemRate - dollarDiscount;
                    console.log('total discount = ' + dollarDiscount);
                }

                console.log('finalPrice = ' + finalPrice);

                if(!isEmpty(finalPrice)){
                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: finalPrice
                    });
                }

                return true;
            }

            // ** START SERVICE PRICING FOR SO AND ESTIMATE **
            if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE){
                //alert('Service Pricing!')
                //Responsibility Center, Equipment Posting, Revenue Stream
                var resCenter = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'location'}); //Responsibility Center
                var equipPosting = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'cseg_sna_hul_eq_seg'}); //Equipment Posting
                var revStream = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st'});

                var overrideRate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual'}); //Override Rate
                var isLockRate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate'}); //Lock Rate

                console.log('validateLine | SERVICE PRICING FIELDS : resCenter = ' + resCenter + ' | equipPosting = ' + equipPosting + ' | revStream = ' + revStream + ' | overrideRate = ' + overrideRate + ' | isLockRate = ' + isLockRate);

                var shippingAddress = rec.getSubrecord({
                    fieldId: 'shippingaddress'
                });

                var pricingGroup = shippingAddress.getValue({
                    fieldId: 'custrecord_sna_cpg_service'
                });

                console.log('cpgService = ' + pricingGroup);

                var serviceCodeTypeLine = rec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_service_itemcode'
                });

                if(serviceCodeTypeLine == 2){
                    //if(!isEmpty(revStream)){
                    //Get Responsibility Code
                    if(!isEmpty(resCenter)){
                        var locSearch = search.lookupFields({
                            type: 'location',
                            id: resCenter,
                            columns: 'custrecord_sna_hul_res_cntr_code'
                        });

                        var resCenterCode = locSearch.custrecord_sna_hul_res_cntr_code;
                        console.log('resCenterCode = ' + resCenterCode);
                    }

                    /*if(rectype == record.Type.ESTIMATE){

                        var equipObject = rec.getValue({fieldId: 'custbody_sna_equipment_object'});
                        console.log('validateLine | SERVICE PRICING equipObject = ' + equipObject);
                        var equipObjectSrch = search.lookupFields({
                            type: 'customrecord_sna_objects',
                            id: equipObject,
                            columns: ['cseg_hul_mfg', 'custrecord_sna_responsibility_center', 'cseg_sna_hul_eq_seg']
                        });

                        equipPosting = (!isEmpty(equipObjectSrch.cseg_sna_hul_eq_seg) ? equipObjectSrch.cseg_sna_hul_eq_seg[0].value : '');
                    }*/

                    //Get Parent EquipPosting
                    if(!isEmpty(equipPosting)){
                        var eqPostingSrch = search.lookupFields({
                            type: 'customrecord_cseg_sna_hul_eq_seg',
                            id: equipPosting,
                            columns: ['parent']
                        });

                        equipPosting = (!isEmpty(eqPostingSrch.parent) ? eqPostingSrch.parent[0].value : equipPosting);
                        console.log('validateLine | SERVICE PRICING equipPosting = ' + equipPosting);
                    }


                    var finalQty;

                    var actualQty = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_hul_act_service_hours'
                    });

                    var itemQty = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity'
                    });

                    var qtyExcep = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_used_qty_exc'
                    });

                    var quotedQty = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_quoted_qty'
                    });


                    var timeposted = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_time_posted'
                    });

                    console.log('itemQty = ' + itemQty);
                    console.log('actualQty = ' + actualQty);
                    console.log('quotedQty = ' + quotedQty);
                    console.log('qtyExcep = ' + qtyExcep);
                    console.log('timeposted = ' + timeposted);

                    /*if(!isEmpty(qtyExcep)){
                            finalQty = usedQty > itemQty ? usedQty : itemQty;
                    }else{
                            finalQty = itemQty;
                    }*/


                    if(!isEmpty(actualQty)){
                        if(!isEmpty(quotedQty)){
                            if (quotedQty > actualQty) {
                                finalQty = quotedQty;
                            } else if (actualQty >= quotedQty) {
                                //Actual > Quoted
                                if (isEmpty(qtyExcep)) {
                                    finalQty = actualQty;
                                } else {
                                    finalQty = itemQty;
                                }
                            }
                        }else{
                            if(isEmpty(qtyExcep)){
                                finalQty = actualQty;
                            }else{
                                finalQty = itemQty
                            }
                        }

                    }else{
                        finalQty = itemQty;
                    }

                    console.log('finalQty = ' + finalQty);

                    //Set Quantity
                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: finalQty
                    });

                    //If Revenue Stream is empty - Get the Revenue Stream from the NXC Case Record
                    /*if(isEmpty(revStream)){
                        var nextServiceCase = rec.getValue({
                            fieldId: "custbody_nx_case"
                        });

                        if(!isEmpty(nextServiceCase)){
                            //NX Case Search
                            var nxCaseSearch = search.lookupFields({
                                type: 'supportcase',
                                id: nextServiceCase,
                                columns: ['cseg_sna_revenue_st', 'custevent_nxc_case_assets']
                            });

                            var nxRevenueSeg = (!isEmpty(nxCaseSearch.cseg_sna_revenue_st) ? nxCaseSearch.cseg_sna_revenue_st[0].value : '');

                            console.log('nxRevenueSeg = ' + nxRevenueSeg);

                            revStream = nxRevenueSeg;
                        }
                    }*/


                    if(!overrideRate && !isLockRate){
                        //Proceed if Override Rate = F or null AND if Lock Rate is = F

                        var unitPrice = _getResourcePriceTable(pricingGroup, revStream, equipPosting);
                        console.log('unitPrice = ' + unitPrice);

                        var dollarDisc = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dollar_disc'});
                        var percDisc = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_perc_disc'});

                        var finalPrice = unitPrice - (forceFloat(dollarDisc)) - (unitPrice * forceFloat(percDisc / 100));

                        console.log('finalPrice = ' + finalPrice);

                        // set price level to custom
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'price',
                            value: -1
                        });


                        //Rate
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: finalPrice
                        });

                        var itemAmount = parseFloat(Number(finalQty) * parseFloat(finalPrice).toFixed(2)).toFixed(2);

                        console.log('itemAmount = ' + itemAmount);
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            value: itemAmount
                        });
                    }

                    //}
                }


            }// ** END SERVICE PRICING FOR SO **

            if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                // ** START FULL MAINTENANCE ITEM **
                var revStream = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st'});
                var manual = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual'});
                var lock = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate'});

                if (isEmpty(revStream)) {
                    revStream = rec.getValue({fieldId: 'cseg_sna_revenue_st'});
                }

                console.log('isfullmaintenance revStream = ' + revStream + ' | ' + manual + ' | ' + lock);

                if (!isEmpty(revStream)) {
                    if ((!manual || isEmpty(manual)) && (!lock || isEmpty(lock))) {
                        var srch = search.lookupFields({
                            type: 'customrecord_cseg_sna_revenue_st',
                            id: revStream,
                            columns: ['custrecord_sna_hul_full_maintenance']
                        });

                        var isfullmaintenance = (!isEmpty(srch.custrecord_sna_hul_full_maintenance) ? srch.custrecord_sna_hul_full_maintenance : false);

                        console.log('isfullmaintenance = ' + isfullmaintenance);

                        if (isfullmaintenance) {
                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1});
                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: 0});
                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'amount', value: 0});
                        }
                    }
                }
                // ** END FULL MAINTENANCE ITEM **
            }


            if (rectype == record.Type.SALES_ORDER) {
                // ** START PLANNED MAINTENANCE PRICING **
                var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
                var overrideRate = rec.getCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_sna_amt_manual"
                });
                var lockRate = rec.getCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_sna_hul_lock_rate"
                });

                console.log('Start planned maintenance | ' + itm + ' | ' + overrideRate + ' | ' + lockRate);

                if (!overrideRate && !lockRate) {
                    var customer = rec.getValue({fieldId: "entity"});
                    var tranDate = getDate(rec.getValue({fieldId: "trandate"}));
                    var projectId = rec.getValue({fieldId: "job"});
                    var projectType = getProjectType(projectId);
                    var projectTypeText = projectType.text;

                    // Fetch Revenue Stream and if It has Planned maintenance then add Planned Maintenance line.
                    var revStreams = rec.getValue({fieldId: 'cseg_sna_revenue_st'});

                    if (isEmpty(revStreams)) {
                        var nxtCase = rec.getValue({fieldId: 'custbody_nx_case'});
                        revStreams = search.lookupFields({
                            type: 'supportcase',
                            id: nxtCase,
                            columns: ['cseg_sna_revenue_st']
                        }).cseg_sna_revenue_st[0].value;
                    }

                    var flatRate;
                    if (!isEmpty(revStreams)) {
                        flatRate = search.lookupFields({
                            type: "customrecord_cseg_sna_revenue_st",
                            id: revStreams,
                            columns: "custrecord_sna_hul_flatrate"
                        }).custrecord_sna_hul_flatrate;
                    }

                    var projectTypeValue = projectType.value;
                    var soNxtSerTask = rec.getValue({fieldId: 'custbody_nx_task'});
                    console.log('projectType: ' + projectTypeValue);
                    console.log('soNxtSerTask: ' + soNxtSerTask);
                    console.log('revStreams: ' + revStreams);

                    var shippingAddress = rec.getValue({fieldId: 'shipaddress'});
                    var salesZone = getSalesZone(shippingAddress);
                    console.log('salesZone: ' + JSON.stringify(salesZone));
                    console.log('itm: ' + itm + ' | PLANNED_MAINTENANCE: ' + PLANNED_MAINTENANCE);

                    if (itm == PLANNED_MAINTENANCE) {
                        var responseRate = getDefaultPMRate();
                        console.log('Setting Response Rate: ' + responseRate);
                        rec.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: responseRate});
                    }

                    var taskId = rec.getCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_nx_task"
                    }) || soNxtSerTask;
                    var equipmentType = rec.getCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "cseg_sna_hul_eq_seg"
                    });
                    var objectNo = rec.getCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_sna_object"
                    }) || rec.getCurrentSublistValue({sublistId: "item", fieldId: "custcol_sna_hul_fleet_no"});

                    if (checkPMServiceItem(itm)) {
                        console.log('equipmentType: ' + equipmentType);
                        console.log('serviceAction: ' + revStreams);
                        console.log('object No: ' + objectNo);

                        var frequency = projectTypeValue;
                        console.log('frequency: ' + frequency);

                        // Quantity
                        var quantity = rec.getCurrentSublistValue({sublistId: "item", fieldId: "quantity"});

                        var requestData = {
                            customer: customer,
                            tranDate: tranDate,
                            salesZone: salesZone.id,
                            zipCode: salesZone.zipCode,
                            custPricingGrp: salesZone.custPricingGrp,
                            equipmentType: equipmentType,
                            serviceAction: revStreams,
                            objectNo: objectNo,
                            frequency: frequency,
                            quantity: quantity
                        }

                        console.log('requestData: ' + JSON.stringify(requestData));

                        var rate = getRate(requestData, salesZone);
                        console.log('getRate rate: ' + rate);

                        if (rate != 0)
                            rec.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: rate});

                        if (flatRate)
                            rec.setCurrentSublistValue({sublistId: "item", fieldId: "amount", value: rate});
                    }

                }
                // ** END PLANNED MAINTENANCE PRICING **
            }

            if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                // ** START TEMPORARY ITEM **
                var tempitemcat = TEMPITEMCAT;

                var fields = '';

                var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
                var itmcatcust = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory'});
                var tempvendor = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor'});
                var vendoritmcode = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code'});
                var desc = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'description'});
                var qty = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'quantity'});
                var porate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'porate'});
                var estporate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate'});
                var rate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'rate'});
                var vendorname = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name'});
                var useexistingtemp = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_use_existing_temp'});

                if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat || itmcatcust == subletitemcat) {
                    if (isEmpty(desc)) {
                        fields += 'Description, ';
                    }
                    if (isEmpty(qty)) {
                        fields += 'Quantity, ';
                    }

                    if (!useexistingtemp) {
                        if (isEmpty(itmcatcust)) {
                            fields += 'Item Category, ';
                        }
                        if (isEmpty(rate)) {
                            fields += 'Rate, ';
                        }
                    }

                    if (rectype == record.Type.SALES_ORDER) {
                        //log.debug({title: 'validateLine', details:  'tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname});
                        console.log('validateLine | tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname)

                        if (!useexistingtemp) {
                            if (isEmpty(tempvendor) && isEmpty(vendorname)) {
                                alert('Temporary Item Vendor is missing. Enter Vendor Name to create vendor record');
                                return false;
                            }
                            if (isEmpty(vendoritmcode)) {
                                fields += 'Vendor Item Code, ';
                            }
                        }

                        if (isEmpty(porate)) {
                            fields += 'PO Rate, ';
                        }
                    }
                    else if (rectype == record.Type.ESTIMATE) {
                        if (isEmpty(estporate)) {
                            fields += 'Estimated PO Rate, ';
                        }
                    }

                    if (!isEmpty(fields)) {
                        fields = fields.slice(0, -2); // remove last comma

                        alert('Enter missing sublist fields: ' + fields);
                        return false;
                    }

                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_porate', value: forceFloat(porate)});
                }
                // ** END TEMPORARY ITEM **
            }

            if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                // ** START ITEM PRICING **
                var itmpricelevel = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel'});
                var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
                var genprodgrp = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
                var itmtype = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'itemtype'});
                var manual = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual'});
                var lock = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate'});
                var lineservicetype = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode'});
                var itmcat = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory'});
                console.log('trigger1');
                console.log('genprodgrp = ' + genprodgrp);
                console.log('itm = ' + itm);
                console.log('RENTALCHARGE = ' + RENTALCHARGE);
                console.log('RENTALEQUIPMENT = ' + RENTALEQUIPMENT);
                console.log('lineservicetype = ' + lineservicetype);
                console.log('itemservicecodetype = ' + itemservicecodetype);
                console.log('itmcat = ' + itmcat);
                console.log('subletitemcat = ' + subletitemcat);

                if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) return true;

                console.log('trigger2');
                console.log('manual = ' + manual);
                console.log('lock = ' + lock);
                if ((!manual || isEmpty(manual)) && (!lock || isEmpty(lock))) {
                    console.log('trigger3');
                    // run for all because field change for hidden fields does not work - hidden fields moved to SL page
                    //if (isEmpty(itmpricelevel)) {
                    setLocationMarkUp(rec, 'item', null);
                    setVendorPrice(rec, 'item', null);
                    setPriceLevel(rec, 'item', null);
                    setCumulativeMarkup(rec, 'item', null);
                    setNewCostUnit(rec, 'item', null);
                    setAmount(rec, 'item', null);
                    //}
                }
                // ** END ITEM PRICING **
            }

            return true;
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            var rec = scriptContext.currentRecord;
            var rectype = rec.type;

            if (rectype == record.Type.SALES_ORDER || rectype == record.Type.ESTIMATE) {
                // ** START TEMPORARY ITEM **
                var tempitemcat = TEMPITEMCAT;

                var fields = '';

                var itemcount = rec.getLineCount({sublistId: 'item'});

                for (var i = 0; i < itemcount; i++) {
                    var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                    var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                    var tempvendor = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', line: i});
                    var vendoritmcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code', line: i});
                    var desc = rec.getSublistValue({sublistId: 'item', fieldId: 'description', line: i});
                    var qty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                    var porate = rec.getSublistValue({sublistId: 'item', fieldId: 'porate', line: i});
                    var estporate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', line: i});
                    var rate = rec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                    var vendorname = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name', line: i});
                    var useexistingtemp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_use_existing_temp', line: i});

                    if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat || itmcatcust == subletitemcat) {
                        if (isEmpty(desc)) {
                            fields += 'Description, ';
                        }
                        if (isEmpty(qty)) {
                            fields += 'Quantity, ';
                        }

                        if (!useexistingtemp) {
                            if (isEmpty(itmcatcust)) {
                                fields += 'Item Category, ';
                            }
                            if (isEmpty(rate)) {
                                fields += 'Rate';
                            }
                        }

                        if (rectype == record.Type.SALES_ORDER) {
                            log.debug({title: 'saveRecord', details: 'tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname});
                            //console.log('saveRecord | tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname);

                            if (!useexistingtemp) {
                                if (isEmpty(tempvendor) && isEmpty(vendorname)) {
                                    alert('Temporary Item Vendor is missing. Enter Vendor Name to create vendor record');
                                    return false;
                                }
                                if (isEmpty(vendoritmcode)) {
                                    fields += 'Vendor Item Code, ';
                                }
                            }

                            if (isEmpty(porate)) {
                                fields += 'PO Rate, ';
                            }
                        }
                        else if (rectype == record.Type.ESTIMATE) {
                            if (isEmpty(estporate)) {
                                fields += 'Estimated PO Rate, ';
                            }
                        }

                        if (!isEmpty(fields)) {
                            fields = fields.slice(0, -2); // remove last comma

                            alert('Enter missing sublist fields: ' + fields);
                            return false;
                        }
                    }
                }
                // ** END TEMPORARY ITEM **
            }

            return true;
        }

        // -----------------------------------------------------------------------------------------------------------------

        // ** START ITEM PRICING **

        function disableColumn(origfld, otherfld, line) {
            try {
                var rec = currentRecord.get();

                var sublist = rec.getSublist({ sublistId: 'item'})

                var currfldval = rec.getCurrentSublistValue({sublistId: 'item', fieldId: origfld});
                var otherfldval = rec.getCurrentSublistValue({sublistId: 'item', fieldId: otherfld});

                var currfld = sublist.getColumn({fieldId: origfld})
                var otherfld = sublist.getColumn({fieldId: otherfld});

                if (!isEmpty(otherfld) && !isEmpty(currfld)) {
                    if (isEmpty(currfldval)) {
                        otherfld.isDisabled = false;
                    }
                    else if (!isEmpty(currfldval)) {
                        otherfld.isDisabled = true;
                    }

                    if (isEmpty(otherfldval)) {
                        currfld.isDisabled = false;
                    }
                    else if (!isEmpty(otherfldval))  {
                        currfld.isDisabled = true;
                    }
                }
            }
            catch (error) {
                log.error({title: 'Catch Error', details: error });
            }
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * Amount (Native Field) is populated based on New Unit Cost x Quantity
         * @param rec
         * @param sublist
         * @param field
         */
        function setAmount(rec, sublist, field) {
            var newunitcost = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_newunitcost'});
            var qty = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'quantity'});
            var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
            var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
            var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});
            var lineservicetype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_service_itemcode'});
            var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});

            if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) return;

            if (!isEmpty(itm)) {
                var newamt = forceFloat(newunitcost) * forceFloat(qty);
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'price', value: -1});
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: forceFloat(newunitcost)});
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'amount', value: newamt});
                //log.debug({title: 'setAmount', details: 'newamt: ' + newamt});
                console.log('setAmount | newamt: ' + newamt);
            }
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * New Unit Cost (Custom Field) is populated based on ((1 + Cumulative % Mark Up + % Discount) x List/Item Purchase Price) + $ Discount
         * Basis = SRP, List Price (field in Vendor Price Record) is Used
         * Basis = Replacement Cost, Item Purchase Price is used
         * @param rec
         * @param sublist
         * @param field
         */
        function setNewCostUnit(rec, sublist, field) {
            console.log('trigger')
            var rectype = rec.type;
            var revStream = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st'});
            var cumulative = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_cumulative_markup'});
            var percdiscount = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_perc_disc'});
            var dollardiscount = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_dollar_disc'});
            if (!isEmpty(dollardiscount)) {
                dollardiscount = Math.abs(dollardiscount);
            }
            var basis = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_basis'});
            var listprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price'});
            var purchaseprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost'});
            var prevlistprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price_prev'});
            var prevpurchaseprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost_prev'});
            var initlistprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price_init'});
            var initpurchaseprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost_init'});
            var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
            var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});
            var porate = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'porate'});
            var markup = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_markup'});
            var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
            var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});
            var lineservicetype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_service_itemcode'});
            var linerate = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'rate'});

            var revStreamData = {};
            if (!isEmpty(revStream)) {
                revStreamData = getRevStreamData(revStream, itemservicecodetype);
            }

            //var price = (revStreamData.pricecalc == 1) ? (isEmpty(prevlistprice) ? listprice : prevlistprice) : ((revStreamData.pricecalc == 2) ? (isEmpty(initlistprice) ? listprice : initlistprice) : listprice);
            //var price = (revStreamData.pricecalc == 1) ? (isEmpty(prevpurchaseprice) ? purchaseprice : prevpurchaseprice) : ((revStreamData.pricecalc == 2) ? (isEmpty(initpurchaseprice) ? purchaseprice : initpurchaseprice) : purchaseprice);

            // always use the initial purchase price if cost
            if (revStreamData.pricecalc == 2 || revStreamData.pricecalc == 4) {
                var price = isEmpty(initpurchaseprice) ? purchaseprice : initpurchaseprice;
            }
            else {
                if (basis == 1) { // SRP
                    //var price = isEmpty(prevlistprice) ? listprice : prevlistprice;
                    var price = listprice;
                }
                else { // Replacement Cost
                    //var price = isEmpty(prevpurchaseprice) ? purchaseprice : prevpurchaseprice;
                    var price = purchaseprice;
                }
            }

            if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) return;

            //log.debug({title: 'setNewCostUnit', details: 'cumulative: ' + cumulative + ' | percdiscount: ' + percdiscount + ' | dollardiscount: ' + dollardiscount + ' | basis: ' + basis + ' | price: ' + price + ' | itmcat: ' + itmcat + ' | porate: ' + porate + ' | markup: ' + markup + ' | itmtype: ' + itmtype});
            console.log('setNewCostUnit | cumulative: ' + cumulative + ' | percdiscount: ' + percdiscount
                + ' | dollardiscount: ' + dollardiscount + ' | basis: ' + basis + ' | price: ' + price
                + ' | itmcat: ' + itmcat + ' | porate: ' + porate + ' | markup: ' + markup + ' | itmtype: ' + itmtype + ' | revStream: ' + revStream);

            if (!isEmpty(itm)) {
                if (itmcat == TEMPITEMCAT || itmcat == allieditemcat || itmcat == rackingitemcat || itmcat == storageitemcat || itmcat == subletitemcat) {
                    if (rectype == record.Type.ESTIMATE) {
                        porate = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_estimated_po_rate'});
                    }

                    var finalprice = porate;
                }
                else {
                    var finalprice = price;
                }

                var wodiscount = (1 + (forceFloat(cumulative) / 100)) * forceFloat(finalprice);

                // 1 = Sales Price - Discount
                if (revStreamData.pricecalc == 1) {
                    wodiscount = wodiscount - forceFloat(wodiscount * (forceFloat(revStreamData.surcharge) / 100));
                    console.log('setNewCostUnit | Sales Price - Discount: ' + wodiscount);
                }
                // 2 = Cost Price + Surcharge
                else if (revStreamData.pricecalc == 2) {
                    wodiscount = (1 + (forceFloat(revStreamData.surcharge) / 100)) * forceFloat(finalprice);
                    console.log('setNewCostUnit | Cost Price + Surcharge: ' + wodiscount);
                }
                // 3 = Sales Price + Surcharge
                else if (revStreamData.pricecalc == 3) {
                    wodiscount = (1 + (forceFloat(revStreamData.surcharge) / 100)) * forceFloat(wodiscount);
                    console.log('setNewCostUnit | Sales Price + Surcharge: ' + wodiscount);
                }
                // 4 = Cost Price - Discount
                else if (revStreamData.pricecalc == 4) {
                    wodiscount = finalprice - forceFloat(finalprice * (forceFloat(revStreamData.surcharge) / 100));
                    console.log('setNewCostUnit | Cost Price - Discount: ' + wodiscount);
                }

                var newunitcost = wodiscount - forceFloat(dollardiscount) - forceFloat(wodiscount * (forceFloat(percdiscount) / 100));

                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_newunitcost', value: newunitcost, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcolsna_hul_newunitcost_wodisc', value: wodiscount, forceSyncSourcing: true});

                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price_prev', value: listprice, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost_prev', value: purchaseprice, forceSyncSourcing: true});

                //log.debug({title: 'setNewCostUnit', details: 'newunitcost: ' + newunitcost + ' | wodiscount: ' + wodiscount});
                console.log('setNewCostUnit | newunitcost: ' + newunitcost + ' | wodiscount: ' + wodiscount);
            }
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * Get revenue stream calculations
         * @param revStream
         * @param itemservicecodetype
         * @returns {{}}
         */
        function getRevStreamData(revStream, itemservicecodetype) {
            var revStreamData = {};
            revStreamData.pricecalc = '';
            revStreamData.surcharge = '';

            var filters_ = [];
            filters_.push(search.createFilter({name: 'custrecord_sna_serv_code', operator: search.Operator.IS, values: revStream}));
            filters_.push(search.createFilter({name: 'custrecord_sna_ser_code_type', operator: search.Operator.IS, values: itemservicecodetype}));
            filters_.push(search.createFilter({name: 'custrecord_sna_surcharge', operator: search.Operator.ISNOTEMPTY, values: ''}));
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.DESC})); // get latest
            columns_.push(search.createColumn({name: 'custrecord_sna_price_calculation'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_surcharge'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_service_code_type', filters: filters_, columns: columns_});
            var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});

            if (!isEmpty(cusrecser)) {
                revStreamData.pricecalc = cusrecser[0].getValue({name: 'custrecord_sna_price_calculation'});
                revStreamData.surcharge = cusrecser[0].getValue({name: 'custrecord_sna_surcharge'});
            }

            return revStreamData;
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * Cumulative % Mark Up (Custom Field) field is populated based on the total of: % Mark Up, % Mark Up Change, Location % Mark Up Change
         * @param rec
         * @param sublist
         * @param field
         */
        function setCumulativeMarkup(rec, sublist, field) {
            var markup = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_markup'});
            var markupchange = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_markupchange'});
            var locmarkupchange = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_loc_markupchange'});
            var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
            var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
            var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});
            var lineservicetype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_service_itemcode'});
            var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});

            if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) return;

            //log.debug({title: 'setCumulativeMarkup', details: 'markup: ' + markup + ' | markupchange: ' + markupchange + ' | locmarkupchange: ' + locmarkupchange})
            console.log('setCumulativeMarkup | markup: ' + markup + ' | markupchange: ' + markupchange + ' | locmarkupchange: ' + locmarkupchange)

            if (!isEmpty(itm)) {
                var sum = forceFloat(markup) + forceFloat(markupchange) + forceFloat(locmarkupchange);

                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_cumulative_markup', value: sum, forceSyncSourcing: true});
                //log.debug({title: 'setCumulativeMarkup', details: 'sum: ' + sum});
                console.log('setCumulativeMarkup | sum: ' + sum);
            }
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
         * @param rec
         * @param sublist
         * @param field
         */
        function setVendorPrice(rec, sublist, field) {
            if (!isEmpty(sublist)) {
                var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
                var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
                var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});
                var lineservicetype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_service_itemcode'});
                var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});
                var initlistprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price_init'});
                var initpurchaseprice = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost_init'});

                if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) return;

                //log.debug({title: 'setVendorPrice', details: 'itm: ' + itm});
                console.log('setVendorPrice | itm: ' + itm);

                if (!isEmpty(itm)) {
                    var prices = getVendorPrice(itm);
                    rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price', value: prices.listprice, forceSyncSourcing: true});
                    rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost', value: prices.itmpurchprice, forceSyncSourcing: true});
                    //log.debug({title: 'setVendorPrice', details: 'listprice: ' + prices.listprice + ' | itmpurchprice: ' + prices.itmpurchprice});
                    console.log('setVendorPrice | listprice: ' + prices.listprice + ' | itmpurchprice: ' + prices.itmpurchprice);

                    if (isEmpty(initlistprice)) {
                        rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price_init', value: prices.listprice, forceSyncSourcing: true});
                    }
                    if (isEmpty(initpurchaseprice)) {
                        rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost_init', value: prices.itmpurchprice, forceSyncSourcing: true});
                    }
                }
            }
        }

        /**
         * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
         * @param itm
         * @returns {{}}
         */
        function getVendorPrice(itm) {
            var prices = {};
            prices.listprice = '';
            prices.itmpurchprice = '';

            var filters_ = [];
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm}));
            filters_.push(search.createFilter({name: 'custrecord_sna_hul_primaryvendor', operator: search.Operator.IS, values: true}));
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first combination
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_listprice'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_itempurchaseprice'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_});
            var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});
            if (!isEmpty(cusrecser)) {
                prices.listprice = cusrecser[0].getValue({name: 'custrecord_sna_hul_listprice'});
                prices.itmpurchprice = cusrecser[0].getValue({name: 'custrecord_sna_hul_itempurchaseprice'});
            }

            return prices;
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * Get customer pricing group from customer
         * @param entity
         * @returns {string}
         */
        function getCustomerPricingGrp(entity) {
            var cpg_parts = '';

            if (!isEmpty(entity)) {
                var custflds = search.lookupFields({type: search.Type.CUSTOMER, id: entity, columns: ['custentity_sna_hul_customerpricinggroup']});

                if (!isEmpty(custflds['custentity_sna_hul_customerpricinggroup'])) {
                    cpg_parts = custflds['custentity_sna_hul_customerpricinggroup'][0].value;
                }
            }

            return cpg_parts;
        }

        /**
         * get customer pricing group from address subrecord
         * @param rec
         */
        function getPricingGrpAddress(rec) {
            var shipaddrSubrecord = rec.getSubrecord({fieldId: 'shippingaddress'});
            var prcinggroup = shipaddrSubrecord.getValue({fieldId: 'custrecord_sna_cpg_parts'});

            //log.debug({title: 'getPricingGrpAddress', details: 'prcinggroup: ' + prcinggroup});
            console.log('getPricingGrpAddress | prcinggroup: ' + prcinggroup);

            return prcinggroup;
        }

        /**
         * Get customer pricing group from customer
         * @param entity
         * @param id
         * @returns {string}
         */
        function getCustPricingGrpAddress(entity, addid) {
            //log.debug({title: 'getCustPricingGrpAddress', details: 'entity: ' + entity + ' | addid: ' + addid});
            console.log('getCustPricingGrpAddress | entity: ' + entity + ' | addid: ' + addid);
            var cpg = '';

            if (isEmpty(entity)) return cpg;

            var filters_ = [];

            filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: entity}));
            //filters_.push(search.createFilter({name: 'addressinternalid', join: 'address', operator: search.Operator.IS, values: addid})); // this is not working

            var columns_ = [];
            columns_.push(search.createColumn({name: 'custrecord_sna_cpg_parts', join: 'Address'}));
            columns_.push(search.createColumn({name: 'addressinternalid', join: 'Address'}));

            var cusrecsearch = search.create({type: search.Type.CUSTOMER, filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var resaddressid = result.getValue({name: 'addressinternalid', join: 'Address'});
                //log.debug({title: 'getCustPricingGrpAddress', details: 'resaddressid: ' + resaddressid});
                console.log('getCustPricingGrpAddress | resaddressid: ' + resaddressid);

                if (resaddressid == addid) {
                    cpg = result.getValue({name: 'custrecord_sna_cpg_parts', join: 'Address'});
                    return false;
                }

                return true;
            });

            //log.debug({title: 'getCustPricingGrpAddress', details: 'cpg: ' + cpg});
            console.log('getCustPricingGrpAddress | cpg: ' + cpg);
            return cpg;
        }

        /**
         * Item Price Level is populated based on Item Category-Customer Pricing Group combination.
         * If no Item Category-Customer Pricing Group combination is found, List is selected as default.
         * If Customer Pricing Group = List, and there are multiple under the Item Category,
         * Min Unit Cost and Max Unit Cost are considered and filtered and compared against Item Purchase Price.
         * @param rec
         * @param sublist
         * @param field
         */
        function setPriceLevel(rec, sublist, field) {
            //var prcinggroup = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
            var prcinggroup = getPricingGrpAddress(rec);

            var rectype = rec.type;
            var entity = rec.getValue({fieldId: 'entity'});
            var addressid = rec.getValue({fieldId: 'shipaddresslist'});
            var entity = rec.getValue({fieldId: 'entity'});

            // get from customer record
            if (!isEmpty(entity) && isEmpty(prcinggroup) && !isEmpty(addressid)) {
                prcinggroup = getCustPricingGrpAddress(entity, addressid);
            }

            if (isEmpty(prcinggroup)) {
                prcinggroup = 155; // List
            }

            if (!isEmpty(sublist)) {
                var finalpricelevel = '';

                var itmpurchaseprice = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost'});
                var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});
                var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
                var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
                var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});
                var lineservicetype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_service_itemcode'});
                var porate = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'porate'});

                if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) return;

                //log.debug({title: 'setPriceLevel', details: 'prcinggroup: ' + prcinggroup + ' | itmcat: ' + itmcat + ' | itm: ' + itm + ' | lineservicetype: ' + lineservicetype});
                console.log('setPriceLevel | prcinggroup: ' + prcinggroup + ' | itmcat: ' + itmcat + ' | itm: ' + itm + ' | lineservicetype: ' + lineservicetype)

                if (!isEmpty(itm)) {
                    if (itmcat == TEMPITEMCAT || itmcat == allieditemcat || itmcat == rackingitemcat || itmcat == storageitemcat || itmcat == subletitemcat) {
                        if (rectype == record.Type.ESTIMATE) {
                            porate = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_estimated_po_rate'});
                        }
                        itmpurchaseprice = porate;
                    }

                    var pricelevel = getPriceLevel(itmcat, prcinggroup);
                    if (!isEmpty(pricelevel[itmcat+'-'+prcinggroup])) {
                        var arrrec = pricelevel[itmcat+'-'+prcinggroup];
                        finalpricelevel = getFinalPriceLevel(arrrec, prcinggroup, itmpurchaseprice);
                    }
                    else if (!isEmpty(pricelevel[itmcat+'-155'])) {
                        var arrrec = pricelevel[itmcat+'-155']; // default to list if orig combi is not found
                        finalpricelevel = getFinalPriceLevel(arrrec, 155, itmpurchaseprice);
                    }

                    rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_item_pricelevel', value: finalpricelevel, forceSyncSourcing: true});
                    //log.debug({title: 'setPriceLevel', details: 'finalpricelevel: ' + finalpricelevel});
                    console.log('setPriceLevel | finalpricelevel: ' + finalpricelevel);
                }
            }
            else {
                var allitmcat = [];

                var itmlines = rec.getLineCount({sublistId: 'item'});
                for (var j = 0; j < itmlines; j++) {
                    var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: j});
                    var lineitmcat = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j});
                    var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: j});
                    var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: j});
                    var lineservicetype = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: j});

                    if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && lineitmcat != subletitemcat)) continue;

                    if (!isEmpty(lineitmcat)) {
                        allitmcat.push(lineitmcat);
                    }
                }

                //log.debug({title: 'setPriceLevel', details: 'allitmcat: ' + allitmcat.toString() + ' | prcinggroup: ' + prcinggroup + ' | itmlines: ' + itmlines});
                console.log('setPriceLevel | allitmcat: ' + allitmcat.toString() + ' | prcinggroup: ' + prcinggroup + ' | itmlines: ' + itmlines);

                var pricelevel = getPriceLevel(allitmcat, prcinggroup);
                for (var i = 0; i < itmlines; i++) {
                    var finalpricelevel = '';

                    var lineitmcat = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                    var linepricelevel = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel', line: i});
                    var lineitmpurchaseprice = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_replacementcost', line: i});
                    var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i});
                    var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i});
                    var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
                    var lineservicetype = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: i});
                    var porate = rec.getSublistValue({sublistId: 'item', fieldId: 'porate', line: i});

                    if (!isEmpty(genprodgrp) || lineitm == RENTALCHARGE || lineitm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && lineitmcat != subletitemcat)) continue;

                    if (lineitmcat == TEMPITEMCAT || lineitmcat == allieditemcat || lineitmcat == rackingitemcat || lineitmcat == storageitemcat || lineitmcat == subletitemcat) {
                        if (rectype == record.Type.ESTIMATE) {
                            porate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', line: i});
                        }
                        lineitmpurchaseprice = porate;
                    }

                    if (!isEmpty(pricelevel[lineitmcat+'-'+prcinggroup])) {
                        var arrrec = pricelevel[lineitmcat+'-'+prcinggroup];
                        finalpricelevel = getFinalPriceLevel(arrrec, prcinggroup, lineitmpurchaseprice);
                    }
                    else if (!isEmpty(pricelevel[itmcat+'-155'])) {
                        var arrrec = pricelevel[itmcat+'-155']; // default to list if orig combi is not found
                        finalpricelevel = getFinalPriceLevel(arrrec, 155, itmpurchaseprice);
                    }

                    if (linepricelevel != finalpricelevel && !isEmpty(lineitm)) {
                        rec.selectLine({sublistId: 'item', line: i});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_pricelevel', value: finalpricelevel, forceSyncSourcing: true});
                        rec.commitLine({sublistId: 'item'});
                        //log.debug({title: 'setPriceLevel', details: 'finalpricelevel: ' + finalpricelevel + ' | line: ' + i});
                        console.log('setPriceLevel | finalpricelevel: ' + finalpricelevel + ' | line: ' + i);
                    }
                }
            }
        }

        /**
         * Item Price Level is populated based on Item Category-Customer Pricing Group combination.
         * If no Item Category-Customer Pricing Group combination is found, List is selected as default.
         * If Customer Pricing Group = List, and there are multiple under the Item Category,
         * Min Unit Cost and Max Unit Cost are considered and filtered and compared against Item Purchase Price.
         * @param arrrec
         * @param prcinggroup
         * @param lineitmpurchaseprice
         * @returns {string}
         */
        function getFinalPriceLevel(arrrec, prcinggroup, lineitmpurchaseprice) {
            var finalpricelevel = '';

            for (var x = 0; x < arrrec.length; x++) {
                if (prcinggroup == 155) { // List
                    var min = arrrec[x].mincost;
                    var max = arrrec[x].maxcost;

                    if ((!isEmpty(max) && forceFloat(lineitmpurchaseprice) >= forceFloat(min) && forceFloat(lineitmpurchaseprice) < forceFloat(max)) ||
                        (isEmpty(max) && forceFloat(lineitmpurchaseprice) >= forceFloat(min))) { // min cost is priority
                        finalpricelevel = arrrec[x].id;
                    }
                }
                else {
                    finalpricelevel = arrrec[x].id; // assumed to be 1 if non-List
                }
            }

            return finalpricelevel;
        }

        /**
         * Item Price Level is populated based on Item Category-Customer Pricing Group combination.
         * If no Item Category-Customer Pricing Group combination is found, List is selected as default.
         * If Customer Pricing Group = List, and there are multiple under the Item Category,
         * Min Unit Cost and Max Unit Cost are considered and filtered and compared against Item Purchase Price.
         * @param allitmcat
         * @param prcinggroup
         * @returns {{}}
         */
        function getPriceLevel(allitmcat, prcinggroup) {
            var pricelevel = {};

            var filters_ = [];
            if (!isEmpty(allitmcat)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.ANYOF, values: allitmcat}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: '@NONE@'}));
            }
            // do not filter pricing group
            if (isEmpty(prcinggroup)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: '@NONE@'}));
            }
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Location combination
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_itemcategory'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_customerpricinggroup'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_mincost'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_maxcost'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_itempricelevel', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var curritmcat = result.getValue({name: 'custrecord_sna_hul_itemcategory'});
                var currpricinggrp = result.getValue({name: 'custrecord_sna_hul_customerpricinggroup'});
                var currid = result.getValue({name: 'internalid'});
                var currmincost = result.getValue({name: 'custrecord_sna_hul_mincost'});
                var currmaxcost = result.getValue({name: 'custrecord_sna_hul_maxcost'});

                if (isEmpty(pricelevel[curritmcat+'-'+currpricinggrp])) {
                    pricelevel[curritmcat+'-'+currpricinggrp] = [];
                }

                var obj = {};
                obj.mincost = currmincost;
                obj.maxcost = currmaxcost;
                obj.id = currid;
                pricelevel[curritmcat+'-'+currpricinggrp].push(obj);

                return true;
            });

            return pricelevel;
        }

        // -----------------------------------------------------------------------------------------------------------------

        /**
         * Sales Rep enters Location. If there is a Location Mark Up record that matches the populated Item Category-Location Mark up combination available,
         * Location Mark Up and Location Mark Up % Change record is populated.
         * @param rec
         * @param sublist
         * @param field
         */
        function setLocationMarkUp(rec, sublist, field) {
            if (!isEmpty(sublist)) {
                var finallocmarkup = '';

                var loc = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'location'});
                if (isEmpty(loc)) {
                    loc = rec.getValue({fieldId: 'location'});
                }
                var itmcat = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_itemcategory'});
                var itm = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'item'});
                var genprodgrp = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
                var itmtype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'itemtype'});
                var lineservicetype = rec.getCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_service_itemcode'});

                if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) return;

                //log.debug({title: 'setLocationMarkUp', details: 'loc: ' + loc + ' | itmcat: ' + itmcat + ' | itm: ' + itm + ' | lineservicetype: ' + lineservicetype});
                console.log('setLocationMarkUp | loc: ' + loc + ' | itmcat: ' + itmcat + ' | itm: ' + itm + ' | lineservicetype: ' + lineservicetype);

                if (!isEmpty(itm)) {
                    var locmarkup = getLocationMarkup(itmcat, loc);
                    if (!isEmpty(locmarkup[itmcat+'-'+loc])) {
                        finallocmarkup = locmarkup[itmcat+'-'+loc];
                    }

                    rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_loc_markup', value: finallocmarkup, forceSyncSourcing: true});
                    //log.debug({title: 'setLocationMarkUp', details: 'finallocmarkup: ' + finallocmarkup});
                    console.log('setLocationMarkUp | finallocmarkup: ' + finallocmarkup);
                }
            }
            else {
                var allitmcat = [];
                var allloc = [];

                var loc = rec.getValue({fieldId: 'location'});
                if (!isEmpty(loc)) {
                    allloc.push(loc);
                }
                var custloc = rec.getValue({fieldId: 'custbody_sna_hul_location'});
                if (!isEmpty(custloc)) {
                    allloc.push(custloc);
                }

                var itmlines = rec.getLineCount({sublistId: 'item'});
                for (var j = 0; j < itmlines; j++) {
                    var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: j});
                    var lineloc = rec.getSublistValue({ sublistId: 'item', fieldId: 'location', line: j});
                    if (!isEmpty(lineloc)) {
                        allloc.push(lineloc);
                    }
                    var lineitmcat = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: j});
                    var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: j});
                    var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: j});
                    var lineservicetype = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: j});

                    if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && lineitmcat != subletitemcat)) continue;

                    if (!isEmpty(lineitmcat)) {
                        allitmcat.push(lineitmcat);
                    }
                }

                //log.debug({title: 'setLocationMarkUp', details: 'allloc: ' + allloc.toString() + ' | allitmcat: ' + allitmcat.toString()});
                console.log('setLocationMarkUp | allloc: ' + allloc.toString() + ' | allitmcat: ' + allitmcat.toString());

                var locmarkup = getLocationMarkup(allitmcat, allloc);
                for (var i = 0; i < itmlines; i++) {
                    var finallocmarkup = '';

                    var lineloc = rec.getSublistValue({ sublistId: 'item', fieldId: 'location', line: i});
                    if (isEmpty(lineloc)) {
                        lineloc = loc;
                    }
                    if (isEmpty(lineloc)) {
                        lineloc = custloc;
                    }
                    var lineitmcat = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
                    var linelocmarkup = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_loc_markup', line: i});
                    var lineitm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i});
                    var genprodgrp = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i});
                    var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
                    var lineservicetype = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: i});

                    if (!isEmpty(genprodgrp) || lineitm == RENTALCHARGE || lineitm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && lineitmcat != subletitemcat)) continue;

                    if (!isEmpty(locmarkup[lineitmcat+'-'+lineloc])) {
                        finallocmarkup = locmarkup[lineitmcat+'-'+lineloc];
                    }

                    if (linelocmarkup != finallocmarkup && !isEmpty(lineitm)) {
                        rec.selectLine({sublistId: 'item', line: i});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_loc_markup', value: finallocmarkup, forceSyncSourcing: true});
                        rec.commitLine({sublistId: 'item'});
                        //log.debug({title: 'setLocationMarkUp', details: 'finallocmarkup: ' + finallocmarkup + ' | line: ' + i});
                        console.log('setLocationMarkUp | finallocmarkup: ' + finallocmarkup + ' | line: ' + i)
                    }
                }
            }
        }

        /**
         * Sales Rep enters Location. If there is a Location Mark Up record that matches the populated Item Category-Location Mark up combination available,
         * Location Mark Up and Location Mark Up % Change record is populated.
         * @param itmcat
         * @param loc
         * @returns {{}}
         */
        function getLocationMarkup(itmcat, loc) {
            var locmarkup = {};

            var filters_ = [];
            if (!isEmpty(itmcat)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcat', operator: search.Operator.ANYOF, values: itmcat}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcat', operator: search.Operator.IS, values: '@NONE@'}));
            }
            if (!isEmpty(loc)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.ANYOF, values: loc}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.IS, values: '@NONE@'}));
            }
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Location combination
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_itemcat'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_loc'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_locationmarkup', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var curritmcat = result.getValue({name: 'custrecord_sna_hul_itemcat'});
                var currloc = result.getValue({name: 'custrecord_sna_hul_loc'});
                var currid = result.getValue({name: 'internalid'});

                locmarkup[curritmcat+'-'+currloc] = currid;

                return true;
            });

            return locmarkup;
        }



        //GAP 009
        /**
         * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
         * @param rec
         * @param sublist
         * @param field
         */

        function setSOVendorPrice(rec, sublist, field, buyFromVendor, line) {
            if (!isEmpty(sublist)) {




                var itm = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'item' });
                var itmtype = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'itemtype' });
                var qty = rec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'quantity' });
                var intSumOfQty = 0;



                if (itm == RENTALCHARGE || itm == RENTALEQUIPMENT) return;

                //log.debug({ title: 'setVendorPrice', details: 'itm: ' + itm + '| buyFromVendor: ' + buyFromVendor + '| qty: ' + qty });
                console.log('setVendorPrice | itm: ' + itm + '| buyFromVendor: ' + buyFromVendor + '| qty: ' + qty);

                if (!isEmpty(itm)) {
                    var prices = getSOVendorPrice(itm, buyFromVendor);

                    if (!isEmpty(prices.qtybreakprice)) {
                        //log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });
                        //log.debug({ title: 'setVendorPrice', details: 'qtybreakprice: ' + prices.qtybreakprice });
                        console.log('setVendorPrice | qtybreakprice: ' + prices.qtybreakprice);

                        var qtyBreakPrice = JSON.parse(prices.qtybreakprice);

                        var setPrice;

                        for (var qbpIndex = 0; qbpIndex < qtyBreakPrice.length; qbpIndex++) {
                            var currQty = qtyBreakPrice[qbpIndex].Quantity;
                            var currPrice = qtyBreakPrice[qbpIndex].Price;

                            //log.debug({ title: 'setVendorPrice', details: 'qty: ' + qty + ' vs. ' + 'currQty: ' + currQty + '| currPrice: ' + currPrice});
                            console.log('setVendorPrice | qty: ' + qty + ' vs. ' + 'currQty: ' + currQty + '| currPrice: ' + currPrice);

                            if (qty >= currQty) {
                                setPrice = currPrice;

                                continue;
                            } else {
                                break;
                            }
                        }

                        setTimeout(function(){
                            rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'porate', value: setPrice, ignoreFieldChange: false });
                            //rec.commitLine({ sublistId: sublist });
                        }, 700);




                    } else if (!isEmpty(prices.itmpurchprice)) {
                        //log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });
                        console.log('setVendorPrice | itmpurchprice: ' + prices.itmpurchprice);

                        setTimeout( function(){
                            rec.setCurrentSublistValue({ sublistId: sublist, fieldId: 'porate', value: prices.itmpurchprice, ignoreFieldChange: false });
                            //rec.commitLine({ sublistId: sublist });
                        }, 700);

                    }

                    //rec.selectLine({ sublistId: sublist, line: line });

                }
            }
        }

        /**
         * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
         * @param itm
         * @param buyFromVendor
         * @returns {{}}
         */
        function getSOVendorPrice(itm, buyFromVendor) {
            var prices = {};
            prices.listprice = '';
            prices.itmpurchprice = '';

            var filters_ = [];
            filters_.push(search.createFilter({ name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm }));
            if (!isEmpty(buyFromVendor)) {
                filters_.push(search.createFilter({ name: 'custrecord_sna_hul_vendor', operator: search.Operator.ANYOF, values: buyFromVendor }));
            }
            //filters_.push(search.createFilter({name: 'custrecord_sna_hul_primaryvendor', operator: search.Operator.IS, values: true}));
            var columns_ = [];
            columns_.push(search.createColumn({ name: 'internalid', sort: search.Sort.ASC })); // to get first combination
            columns_.push(search.createColumn({ name: 'custrecord_sna_hul_listprice' }));
            columns_.push(search.createColumn({ name: 'custrecord_sna_hul_itempurchaseprice' }));
            columns_.push(search.createColumn({ name: 'custrecord_sna_hul_qtybreakprices' }));

            var cusrecsearch = search.create({ type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_ });
            var cusrecser = cusrecsearch.run().getRange({ start: 0, end: 1 });

            //log.debug({ title: 'getVendorPrice', details: 'cusrecser: ' + JSON.stringify(cusrecser) });
            console.log('getVendorPrice | cusrecser: ' + JSON.stringify(cusrecser));

            if (!isEmpty(cusrecser)) {
                prices.listprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_listprice' });
                prices.itmpurchprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_itempurchaseprice' });
                prices.qtybreakprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_qtybreakprices' });
            }

            return prices;
        }

        //END  OF GAP009

        // ** END ITEM PRICING **

        // ** START RENTAL **

        /**
         * Get time unit price
         * @param trandate
         * @param selectedratecard
         * @returns {string|{}}
         */
        function getTimeUnitPrice(trandate, selectedratecard) {
            var ratecardsubinfo = {};

            if (isEmpty(selectedratecard) || isEmpty(trandate)) return '';

            var fil = [];
            fil.push(search.createFilter({name: 'custrecord_sna_hul_linked_rate_card', operator: search.Operator.IS, values: selectedratecard}));

            var col = [];
            col.push(search.createColumn({name: 'custrecord_sna_hul_time_unit_price'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_effective_start_date'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_effective_end_date'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_m1_units_included'}));
            col.push(search.createColumn({name: 'custrecord_sna_m1_unit_price'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_rent_time_unit', sort: search.Sort.DESC}));
            col.push(search.createColumn({name: 'internalid', sort: search.Sort.DESC}));

            var res = search.create({type: 'customrecord_sna_hul_rate_card_sublist', filters: fil, columns: col});

            res.run().each(function(result) {
                var res_timeunitprice = result.getValue({name: 'custrecord_sna_hul_time_unit_price'});
                var res_effectivestart = result.getValue({name: 'custrecord_sna_hul_effective_start_date'});
                var res_effectiveend = result.getValue({name: 'custrecord_sna_hul_effective_end_date'});
                var res_unit = result.getValue({name: 'custrecord_sna_hul_rent_time_unit'});
                var res_m1unitsinc = result.getValue({name: 'custrecord_sna_hul_m1_units_included'});
                var res_m1unitprice = result.getValue({name: 'custrecord_sna_m1_unit_price'});

                //log.debug({title: 'getTimeUnitPrice', details: 'res_unit: ' + res_unit + ' | res_effectivestart: ' + res_effectivestart + ' | res_effectiveend: ' + res_effectiveend + ' | res_timeunitprice: ' + res_timeunitprice});
                console.log('getTimeUnitPrice | res_unit: ' + res_unit + ' | res_effectivestart: ' + res_effectivestart + ' | res_effectiveend: ' + res_effectiveend + ' | res_timeunitprice: ' + res_timeunitprice);

                // Tran date within effective start date and effective end date
                if (
                    (!isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart) && new Date(trandate) <= new Date(res_effectiveend)) ||
                    (!isEmpty(res_effectivestart) && isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart)) ||
                    (isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) <= new Date(res_effectiveend))
                ) {
                    // get 1st result always
                    if (isEmpty(ratecardsubinfo[res_unit])) {
                        ratecardsubinfo[res_unit] = res_timeunitprice;
                        ratecardsubinfo[res_unit+'_m1'] = res_m1unitprice;
                    }
                }

                // If there are multiple Rental Rate Card Sublist containing the same Time Unit wherein Effective Dates are Null, select the most recently created.
                else if (isEmpty(res_effectivestart) && isEmpty(res_effectivestart)) {
                    // get 1st result always
                    if (isEmpty(ratecardsubinfo[res_unit + '_temp'])) {
                        ratecardsubinfo[res_unit + '_temp'] = res_timeunitprice;
                        ratecardsubinfo[res_unit + '_temp_m1'] = res_m1unitprice;
                    }
                }

                return true;
            });

            //log.debug({title: 'getTimeUnitPrice', details: 'ratecardsubinfo: ' + JSON.stringify(ratecardsubinfo)});
            console.log('getTimeUnitPrice | ratecardsubinfo: ' + JSON.stringify(ratecardsubinfo))

            return ratecardsubinfo;
        }

        /**
         * Get time unit price for multiple rental rate cards
         * @param timeunit
         * @param startdate
         * @returns {string}
         */
        function getMultipleTimeUnitPrice(trandate, selectedratecard) {
            var ratecardsubinfo = [];

            if (isEmpty(selectedratecard) || isEmpty(trandate)) return '';

            var fil = [];
            fil.push(search.createFilter({name: 'custrecord_sna_hul_linked_rate_card', operator: search.Operator.ANYOF, values: selectedratecard}));

            var col = [];
            col.push(search.createColumn({name: 'custrecord_sna_hul_linked_rate_card'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_time_unit_price'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_effective_start_date'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_effective_end_date'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_m1_units_included'}));
            col.push(search.createColumn({name: 'custrecord_sna_m1_unit_price'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_rent_time_unit', sort: search.Sort.DESC}));
            col.push(search.createColumn({name: 'internalid', sort: search.Sort.DESC}));

            var res = search.create({type: 'customrecord_sna_hul_rate_card_sublist', filters: fil, columns: col});

            res.run().each(function(result) {
                var res_internalid = result.getValue({name: 'custrecord_sna_hul_linked_rate_card'});
                var res_timeunitprice = result.getValue({name: 'custrecord_sna_hul_time_unit_price'});
                var res_effectivestart = result.getValue({name: 'custrecord_sna_hul_effective_start_date'});
                var res_effectiveend = result.getValue({name: 'custrecord_sna_hul_effective_end_date'});
                var res_unit = result.getValue({name: 'custrecord_sna_hul_rent_time_unit'});
                var res_m1unitsinc = result.getValue({name: 'custrecord_sna_hul_m1_units_included'});
                var res_m1unitprice = result.getValue({name: 'custrecord_sna_m1_unit_price'});

                // Tran date within effective start date and effective end date
                if (
                    (!isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart) && new Date(trandate) <= new Date(res_effectiveend)) ||
                    (!isEmpty(res_effectivestart) && isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart)) ||
                    (isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) <= new Date(res_effectiveend))
                ) {
                    if (isEmpty(ratecardsubinfo[res_internalid])) {
                        ratecardsubinfo[res_internalid] = {};
                    }

                    // get 1st result always
                    if (isEmpty(ratecardsubinfo[res_internalid][res_unit])) {
                        ratecardsubinfo[res_internalid][res_unit] = res_timeunitprice;
                        ratecardsubinfo[res_internalid][res_unit+'_m1'] = res_m1unitprice;
                    }
                }

                // If there are multiple Rental Rate Card Sublist containing the same Time Unit wherein Effective Dates are Null, select the most recently created.
                else if (isEmpty(res_effectivestart) && isEmpty(res_effectivestart)) {
                    if (isEmpty(ratecardsubinfo[res_internalid])) {
                        ratecardsubinfo[res_internalid] = {};
                    }

                    // get 1st result always
                    if (isEmpty(ratecardsubinfo[res_internalid][res_unit + '_temp'])) {
                        ratecardsubinfo[res_internalid][res_unit + '_temp'] = res_timeunitprice;
                        ratecardsubinfo[res_internalid][res_unit + '_temp_m1'] = res_m1unitprice;
                    }
                }

                return true;
            });

            return ratecardsubinfo;
        }

        /**
         * Set Time Unit Price and Best Option table
         * @param currrec
         * @param ratecardsub
         * @param timeunit
         * @param timeqty
         * @param selectedbest
         */
        function setBestPriceTable(ratecardsub, param_daily, timeqty, allratecards, param_4weekly, param_weekly) {
            var allfinalunitprice = {};

            for (var a = 0; a < allratecards.length; a++) {
                var ratecard = allratecards[a];
                //log.debug({title: 'getBestPriceFormula', details: 'ratecard: ' + ratecard + ' | ratecardsub[ratecard]: ' + JSON.stringify(ratecardsub[ratecard])});
                console.log('getBestPriceFormula | ratecard: ' + ratecard + ' | ratecardsub[ratecard]: ' + JSON.stringify(ratecardsub[ratecard]));

                allfinalunitprice[ratecard] = {};

                if (isEmpty(ratecardsub[ratecard])) {
                    allfinalunitprice[ratecard].bestpriceunit = '';
                    allfinalunitprice[ratecard].dailyunitcost = '';
                    allfinalunitprice[ratecard].weeklyunitcost = '';
                    allfinalunitprice[ratecard].fourweekunitcost = '';
                    continue;
                }

                // time unit cost based on selected rate card
                var dailyunitcost = !isEmpty(ratecardsub[ratecard][param_daily]) ? ratecardsub[ratecard][param_daily] : (!isEmpty(ratecardsub[ratecard][param_daily+'_temp']) ? ratecardsub[ratecard][param_daily+'_temp'] : '');
                var weeklyunitcost = !isEmpty(ratecardsub[ratecard][param_weekly]) ? ratecardsub[ratecard][param_weekly] : (!isEmpty(ratecardsub[ratecard][param_weekly+'_temp']) ? ratecardsub[ratecard][param_weekly+'_temp'] : '');
                var fourweekunitcost = !isEmpty(ratecardsub[ratecard][param_4weekly]) ? ratecardsub[ratecard][param_4weekly] : (!isEmpty(ratecardsub[ratecard][param_4weekly+'_temp']) ? ratecardsub[ratecard][param_4weekly+'_temp'] : '');

                //log.debug({title: 'setBestPriceTable', details: 'dailyunitcost: ' + dailyunitcost + ' | weeklyunitcost: ' + weeklyunitcost + ' | fourweekunitcost: ' + fourweekunitcost});
                console.log('setBestPriceTable | dailyunitcost: ' + dailyunitcost + ' | weeklyunitcost: ' + weeklyunitcost + ' | fourweekunitcost: ' + fourweekunitcost);

                // get best prices
                //var formula = getBestPriceFormula(fourweeks, days);
                //var bestprice = getBestPrice(days, formula, dailyunitcost, weeklyunitcost, fourweekunitcost);
                var bestprice = getBestPriceFormula(timeqty, dailyunitcost, weeklyunitcost, fourweekunitcost);
                //var bestpriceunit = !isEmpty(bestprice) && !isEmpty(rentaldays) ? forceFloat(forceFloat(bestprice) / rentaldays) : '';

                allfinalunitprice[ratecard].bestpriceunit = bestprice;
                allfinalunitprice[ratecard].dailyunitcost = dailyunitcost;
                allfinalunitprice[ratecard].weeklyunitcost = weeklyunitcost;
                allfinalunitprice[ratecard].fourweekunitcost = fourweekunitcost;
            }

            log.debug({title: 'setBestPriceTable', details: 'allfinalunitprice: ' + JSON.stringify(allfinalunitprice)});
            console.log('setBestPriceTable | allfinalunitprice: ' + JSON.stringify(allfinalunitprice));

            return allfinalunitprice;
        }

        /**
         * Get formula from custom record
         * @param fourweeks
         * @param days
         * @returns {string}
         */
        function getBestPriceFormula(timeqty, dailyunitcost, weeklyunitcost, fourweekunitcost) {
            //log.debug({title: 'getBestPriceFormula', details: 'fourweeks: ' + fourweeks + ' | days: ' + days});
            console.log('dailyunitcost: ' + dailyunitcost + ' | weeklyunitcost: ' + weeklyunitcost + ' | fourweekunitcost: ' + fourweekunitcost);

            var filters = [];
            var fourweeks = 0;

            if (isObject(timeqty)) {
                for (var indx in timeqty) {
                    // get rental days
                    var rentaldays = timeqty[indx];
                    var days = 0;

                    // get number of 20 days and remaining days
                    if (rentaldays <= 20) {
                        days = rentaldays;
                    }
                    else {
                        var total20days = rentaldays / 20;
                        fourweeks = Math.trunc(total20days);
                        days = rentaldays - (fourweeks * 20);
                    }

                    // days is always <= 20
                    if (!isEmpty(days) && forceFloat(days) > 0) {
                        console.log('days-1: ' + days);

                        filters.push(['custrecord_sna_hul_no_of_day', search.Operator.EQUALTO, days]);
                        filters.push('or');
                    }
                }
            }
            else {
                // get rental days
                var rentaldays = timeqty;
                var days = 0;

                // get number of 20 days and remaining days
                if (rentaldays <= 20) {
                    days = rentaldays;
                }
                else {
                    var total20days = rentaldays / 20;
                    fourweeks = Math.trunc(total20days);
                    days = rentaldays - (fourweeks * 20);
                }

                // days is always <= 20
                if (!isEmpty(days) && forceFloat(days) > 0) {
                    console.log('days-2: ' + days);

                    filters.push(['custrecord_sna_hul_no_of_day', search.Operator.EQUALTO, days]);
                    filters.push('or');
                }
            }

            // Remove last 'OR'
            filters.splice(-1, 1);

            if (!isEmpty(fourweeks) && forceFloat(fourweeks) > 0) {
                console.log('days-3: 20');

                filters.push('or');
                filters.push(['custrecord_sna_hul_no_of_day', search.Operator.EQUALTO, '20']);
            }

            var allformula = {};

            var columns = [];
            columns.push(search.createColumn({name: 'custrecord_sna_hul_formula'}));
            columns.push(search.createColumn({name: 'custrecord_sna_hul_no_of_day'}));

            var sear = search.create({type: 'customrecord_sna_hul_rental_best_price', filters: filters, columns: columns});
            sear.run().each(function(result) {
                var numdays = result.getValue({name: 'custrecord_sna_hul_no_of_day'});
                var formla = result.getValue({name: 'custrecord_sna_hul_formula'});

                if (isEmpty(allformula[numdays])) {
                    allformula[numdays] = [];
                }

                allformula[numdays].push(formla);

                return true;
            });

            console.log('allformula: ' + JSON.stringify(allformula));

            var minprices = {};

            for (var numday in allformula) {
                var dayprices = []; var weekprices = [];

                for (var a = 0; a < allformula[numday].length; a++) {
                    if (numday < 20) {
                        dayprices.push(getBestPrice(numday, allformula[numday][a], dailyunitcost, weeklyunitcost, fourweekunitcost));
                        minprices[numday] = Math.min.apply(Math, dayprices);
                    }
                    else {
                        weekprices.push(getBestPrice(20, allformula[numday][a], dailyunitcost, weeklyunitcost, fourweekunitcost));
                        minprices[numday] = Math.min.apply(Math, weekprices);
                    }
                }

                console.log('numday: ' + numday + ' | dayprices: ' + dayprices.toString() + ' | weekprices: ' + weekprices.toString() + ' | minprices: ' + minprices[numday]);
            }

            return minprices;
        }

        /**
         * Call library to convert string formula to mathematical expression
         * @param days
         * @param formula
         * @param dailyunitcost
         * @param weeklyunitcost
         * @param fourweekunitcost
         * @returns {number}
         */
        function getBestPrice(days, formula, dailyunitcost, weeklyunitcost, fourweekunitcost) {
            var bestprice = 0;

            dailyunitcost = '(' + dailyunitcost + ')';
            weeklyunitcost = '(' + weeklyunitcost + ')';
            fourweekunitcost = '(' + fourweekunitcost + ')';
            days = '(' + days + ')';

            var replacedformula = replaceAll(formula, 'a', dailyunitcost);
            replacedformula = replaceAll(replacedformula, 'b', weeklyunitcost);
            replacedformula = replaceAll(replacedformula, 'c', fourweekunitcost);
            replacedformula = replaceAll(replacedformula, 'n', days);

            //log.debug({title: 'getBestPrice', details: 'replacedformula: ' + replacedformula});
            console.log('replacedformula: ' + replacedformula + ' | formula: ' + formula);

            var response = http.get({ url: 'http://api.mathjs.org/v4/?expr='+encodeURIComponent(xml.escape({xmlText: replacedformula})) });
            if (response.code === 200) {
                bestprice = !isEmpty(response.body) && response.body != 'undefined' ? response.body : '';
                //log.debug({title: 'getBestPrice', details: 'response.body: ' + bestprice});
            }

            return bestprice;
        }

        /**
         * Open Select Object suitelet
         * @param cust
         * @param custgrp
         * @param trandate
         * @param loc
         */
        function showPrompt(cust, custgrp, trandate, loc) {
            var rec = currentRecord.get();
            var cust = rec.getValue({fieldId: 'entity'});
            var custgrp = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
            var loc = rec.getValue({fieldId: 'location'});
            var trandate = !isEmpty(rec.getValue({fieldId: 'trandate'})) ? format.format({value: new Date(rec.getValue({fieldId: 'trandate'})), type: format.Type.DATE}) : '';

            if (isEmpty(cust) || isEmpty(loc)) {
                alert('Customer and Location cannot be empty');
                return;
            }

            var slurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectobject', deploymentId: 'customdeploy_sna_hul_sl_selectobject',
                params : {'cust': cust, 'custgrp' : custgrp, 'trandate' : trandate, 'loccode' : loc, 'respcenter' : loc, 'newcall' : 'T'}
            });

            var params = 'width=1000,height=600,top=300,left=300,menubar=1';
            window.open(slurl, '_blank', params);
        }

        /**
         * Add temporary items
         */
        function redirectToSL() {
            var rec = currentRecord.get();
            var rectype = rec.type;
            var cust = rec.getValue({fieldId: 'entity'});;
            var loc = rec.getValue({fieldId: 'location'});

            if (isEmpty(cust) || isEmpty(loc)) {
                alert('Customer and Location cannot be empty');
                return;
            }

            var slurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_temporary_item', deploymentId: 'customdeploy_sna_hul_sl_temporary_item',params: {rectype: rectype}});

            var params = 'width=800,height=500,top=300,left=300,menubar=1';
            window.open(slurl, 'newwindow', params);
        }

        /**
         * Calculate rental costs
         */
        function calculateRental() {
            var rentalitem = RENTALCHARGE;
            var param_daily = GLOBAL.param_daily;
            var param_4weekly = GLOBAL.param_4weekly;
            var param_weekly = GLOBAL.param_weekly;
            var param_ldw = GLOBAL.param_ldw;

            var rec = currentRecord.get();

            var startdate = rec.getValue({fieldId: 'startdate'});
            var enddate = rec.getValue({fieldId: 'enddate'}); // should be mandatory
            var trandate = rec.getValue({fieldId: 'trandate'});
            var allowMultDates = rec.getValue({fieldId: 'custbody_sna_allow_mult_rental'});

            var timeqty = '';
            var finalnohr = '';

            if (!allowMultDates) {
                timeqty = workday_count(startdate, enddate); // no need to get rental days because time unit is always Day
                finalnohr = forceFloat(timeqty) * 8;
                console.log('timeqty: ' + timeqty);
            }

            var allratecards = [];
            var alltimeqty = {};

            var itemcount = rec.getLineCount({sublistId: 'item'});

            for (var i = 0; i < itemcount; i++) {
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});

                if (itm != rentalitem) continue;

                var lnestartdate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_start_date', line: i});
                var lneenddate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', line: i});
                var lneratecard = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_rental_rate_card', line: i});

                if (!inArray(lneratecard, allratecards) && !isEmpty(lneratecard)) {
                    allratecards.push(lneratecard);
                }

                if (allowMultDates) {
                    alltimeqty[i] = workday_count(lnestartdate, lneenddate);
                }
            }

            console.log('allratecards: ' + JSON.stringify(allratecards) + ' | alltimeqty: ' + JSON.stringify(alltimeqty));

            if (!isEmpty(allratecards)) {
                var ratecardsub = getMultipleTimeUnitPrice(trandate, allratecards);

                if (!isEmpty(alltimeqty)) {
                    var allfinalunitprice = setBestPriceTable(ratecardsub, param_daily, alltimeqty, allratecards, param_4weekly, param_weekly);
                }
                else {
                    var allfinalunitprice = setBestPriceTable(ratecardsub, param_daily, timeqty, allratecards, param_4weekly, param_weekly);
                }

                console.log('allfinalunitprice: ' + JSON.stringify(allfinalunitprice));

                var rentalchargeamt = '';
                var rentalinithour = '';
                var rentallasthour = '';

                // set new line fields
                for (var j = 0; j < itemcount; j++) {
                    var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: j});
                    if (isEmpty(itm)) continue;
                    var lneratecard = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_rental_rate_card', line: j});
                    var timeunit = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_time_unit', line: j});
                    var lnestartdate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_start_date', line: j});
                    var lneenddate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', line: j});
                    var lockline = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate', line: j});

                    if (allowMultDates) {
                        timeqty = !isEmpty(alltimeqty[j]) ? alltimeqty[j] : 0;//workday_count(lnestartdate, lneenddate); // no need to get rental days because time unit is always Day
                        finalnohr = forceFloat(timeqty) * 8;
                        console.log('line: ' + j + ' | timeqty: ' + timeqty);
                    }

                    var min_weekprice = 0;
                    var min_dayprice = 0;

                    // get rental days
                    var rentaldays = timeqty;
                    var fourweeks = 0;
                    var days = 0;

                    // get number of 20 days and remaining days
                    if (rentaldays <= 20) {
                        days = rentaldays;
                    }
                    else {
                        var total20days = rentaldays / 20;
                        fourweeks = Math.trunc(total20days);
                        days = rentaldays - (fourweeks * 20);
                    }

                    var bestprices = !isEmpty(allfinalunitprice[lneratecard]) ? allfinalunitprice[lneratecard].bestpriceunit : {};
                    console.log('bestprices: ' + JSON.stringify(bestprices));

                    var newrate = 0;

                    if (!isEmpty(fourweeks) && forceFloat(fourweeks) > 0 && !isEmpty(bestprices[20])) {
                        newrate = bestprices[20] * fourweeks;

                        min_weekprice = bestprices[20];

                        if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(bestprices[days])) {
                            newrate += bestprices[days];

                            min_dayprice = bestprices[days];
                        }
                    }
                    else if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(bestprices[days])) {
                        newrate = bestprices[days];
                        min_dayprice = bestprices[days];
                    }

                    newrate = forceFloat(forceFloat(newrate) / rentaldays);

                    console.log('newrate: ' + newrate);

                    rec.selectLine({sublistId: 'item', line: j});

                    if (itm == rentalitem) {
                        rentalinithour = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_initial_hourmeter', line: j});
                        rentallasthour = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_last_hourmeter', line: j});

                        if (!lockline) {
                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: timeqty, forceSyncSourcing: true});
                        }

                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rental_hrs', value: finalnohr, forceSyncSourcing: true});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_bestprice', value: min_dayprice, forceSyncSourcing: true});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_week_bestprice', value: min_weekprice, forceSyncSourcing: true});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_extra_days', value: days, forceSyncSourcing: true});

                        if (!isEmpty(allfinalunitprice[lneratecard])) {
                            if (!isEmpty(allfinalunitprice[lneratecard].bestpriceunit) && !lockline) {
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: newrate, forceSyncSourcing: true});
                            }
                            if (!isEmpty(allfinalunitprice[lneratecard].dailyunitcost)) {
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_rate', value: allfinalunitprice[lneratecard].dailyunitcost, forceSyncSourcing: true});
                            }
                            if (!isEmpty(allfinalunitprice[lneratecard].weeklyunitcost)) {
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_weekly_rate', value: allfinalunitprice[lneratecard].weeklyunitcost, forceSyncSourcing: true});
                            }
                            if (!isEmpty(allfinalunitprice[lneratecard].fourweekunitcost)) {
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_4week_rate', value: allfinalunitprice[lneratecard].fourweekunitcost, forceSyncSourcing: true});
                            }
                        }

                        var rte = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'rate'});
                        rentalchargeamt = forceFloat(rte) * timeqty;
                    }

                    console.log('rentalchargeamt: ' + rentalchargeamt + ' | rentalinithour: ' + rentalinithour + ' | rentallasthour: ' + rentallasthour);

                    // charge items
                    if (!isEmpty(timeunit)) {
                        if (!allowMultDates && !lockline) {
                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_start_date', value: startdate, forceSyncSourcing: true});
                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', value: enddate, forceSyncSourcing: true});
                        }

                        var itmgroup = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp'});
                        var perc = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sn_hul_othercharge_percent'});
                        var chargeamt = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'amount'});

                        if (itmgroup == param_ldw && !lockline) {
                            if (!isEmpty(rentalchargeamt)) {
                                chargeamt = forceFloat(rentalchargeamt) * 0.12; // must be 12% of rental charge
                            }

                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: timeqty, forceSyncSourcing: true});
                            var newrate = forceFloat(chargeamt) / forceFloat(timeqty);
                            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: newrate, forceSyncSourcing: true});
                        }
                        else {
                            console.log('itmgroup: ' + itmgroup + ' | GLOBAL.param_ot: ' + GLOBAL.param_ot);

                            if (itmgroup == GLOBAL.param_ot && !lockline) {
                                var otqty = forceFloat(rentallasthour) - forceFloat(rentalinithour) - forceFloat(finalnohr);
                                console.log('otqty: ' + otqty);
                                if (otqty < 0) {
                                    otqty = 0;
                                }

                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: otqty, forceSyncSourcing: true});
                            }

                            if (!isEmpty(perc) && !isEmpty(rentalchargeamt) && !lockline) {
                                chargeamt = forceFloat(rentalchargeamt) * (forceFloat(perc) / 100);
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: chargeamt, forceSyncSourcing: true});
                            }
                        }
                    }

                    rec.commitLine({sublistId: 'item'});
                }

                alert('Order is updated');
            }
        }

        // ** END RENTAL **

        // ** START SERVICE PRICING **

        /**
         * Get time unit price
         * @param priceGrp
         * @param revStream
         * @param resCenter
         * @param equipCat
         * @returns {number|0}
         */
        function _getResourcePriceTable(priceGrp, revStream, equipCat) {
            //Get Unit Price
            var stLoggerTitle = '_getResourcePriceTable';

            var currRevStream = revStream || '@NONE@';
            equipCat = equipCat || '@NONE@';
            priceGrp = priceGrp || '@NONE@';

            console.log(stLoggerTitle + ': first level - priceGrp = ' + priceGrp +'\ncurrRevStream = '+currRevStream+'\nequipCat = '+equipCat);

            var resourcePriceSrch = search.create({
                type: 'customrecord_sna_hul_resrcpricetable',
                filters: [{
                    name: 'custrecord_sna_rpt_cust_price_grp',
                    operator: 'anyof',
                    values: priceGrp
                },
                    {
                        name: 'custrecord_sna_rev_stream',
                        operator: 'anyof',
                        values: [currRevStream]
                    },
                    {
                        name: 'custrecord_sna_rpt_manufacturer',
                        operator: 'anyof',
                        values: [equipCat]
                    }
                ],
                columns: ['custrecord_sna_rpt_unit_price']
            });

            var unitPrice;

            resourcePriceSrch.run().each(function(result) {
                unitPrice = result.getValue({
                    name: 'custrecord_sna_rpt_unit_price'
                });
            });


            if (isEmpty(unitPrice)) {
                console.log(stLoggerTitle + ': 2nd level - if CPG is null');
                // If CPG is null
                var resourcePriceSrch2 = search.create({
                    type: 'customrecord_sna_hul_resrcpricetable',
                    filters: [{
                        name: 'custrecord_sna_rpt_cust_price_grp',
                        operator: 'anyof',
                        values: ['@NONE@']
                    },
                        {
                            name: 'custrecord_sna_rev_stream',
                            operator: 'anyof',
                            values: [currRevStream]
                        },
                        {
                            name: 'custrecord_sna_rpt_manufacturer',
                            operator: 'anyof',
                            values: [equipCat]
                        }
                    ],
                    columns: ['custrecord_sna_rpt_unit_price']
                });


                resourcePriceSrch2.run().each(function(result) {
                    unitPrice = result.getValue({
                        name: 'custrecord_sna_rpt_unit_price'
                    });
                });

                if (isEmpty(unitPrice)) {
                    console.log(stLoggerTitle + ': 3rd level - Exact CPG, MFG is Null');
                    //Exact CPG, MFG is Null
                    var resourcePriceSrch3 = search.create({
                        type: 'customrecord_sna_hul_resrcpricetable',
                        filters: [{
                            name: 'custrecord_sna_rpt_cust_price_grp',
                            operator: 'anyof',
                            values: [priceGrp]
                        },
                            {
                                name: 'custrecord_sna_rev_stream',
                                operator: 'anyof',
                                values: [currRevStream]
                            },
                            {
                                name: 'custrecord_sna_rpt_manufacturer',
                                operator: 'anyof',
                                values: ['@NONE@']
                            }
                        ],
                        columns: ['custrecord_sna_rpt_unit_price']
                    });


                    resourcePriceSrch3.run().each(function(result) {
                        unitPrice = result.getValue({
                            name: 'custrecord_sna_rpt_unit_price'
                        });
                    });

                    //[01.10.2024] caranda - commented out ANY OF None criteria for the meantime

                    if (isEmpty(unitPrice)) {
                        console.log(stLoggerTitle + ': 4th level - CPG Null, MPG Null');
                        // MFG is null
                        var resourcePriceSrch4 = search.create({
                            type: 'customrecord_sna_hul_resrcpricetable',
                            filters: [/*{
                                name: 'custrecord_sna_rpt_cust_price_grp',
                                operator: 'anyof',
                                values: ['@NONE@']
                            },*/
                                {
                                    name: 'custrecord_sna_rev_stream',
                                    operator: 'anyof',
                                    values: [currRevStream]
                                },
                                /*{
                                    name: 'custrecord_sna_rpt_manufacturer',
                                    operator: 'anyof',
                                    values: ['@NONE@']
                                }*/
                            ],
                            columns: ['custrecord_sna_rpt_unit_price']
                        });



                        resourcePriceSrch4.run().each(function(result) {
                            unitPrice = result.getValue({
                                name: 'custrecord_sna_rpt_unit_price'
                            });
                        });

                        if (isEmpty(unitPrice)) {
                            console.log(stLoggerTitle + ': 5th level - Get Rev Stream Parent');

                            if (!isEmpty(currRevStream) && currRevStream != '@NONE@') {
                                currRevStream = _getRevenueStreamParent(currRevStream)
                            }
                            //currRevStream = _getRevenueStreamParent(currRevStream) || '';
                            if (!isEmpty(currRevStream) && currRevStream != '@NONE@') {
                                unitPrice = _getResourcePriceTable(priceGrp, currRevStream, equipCat);

                                if(isEmpty(unitPrice)){
                                    unitPrice = 0;
                                }
                            }
                            else {
                                unitPrice = 0;
                            }
                        }
                    }
                }
            }


            //log.debug(stLoggerTitle, 'unitPrice = ' + unitPrice);
            console.log(stLoggerTitle + ' | unitPrice = ' + unitPrice);
            return unitPrice;

        }

        function _getRevenueStreamParent(revStream) {
            var TITLE = '_getRevenueStreamParent(' + revStream + ')';

            var srch = search.lookupFields({
                type: 'customrecord_cseg_sna_revenue_st',
                id: revStream,
                columns: ['parent']
            });

            var parentRevSteam = (!isEmpty(srch.parent) ? srch.parent[0].value : '');

            console.log(TITLE + ': parentRevSteam = ' + parentRevSteam);

            return parentRevSteam;
        }
        // ** END SERVICE PRICING **

        return {
            pageInit: pageInit,
            lineInit: lineInit,
            fieldChanged: fieldChanged,
            validateField: validateField,
            postSourcing: postSourcing,
            validateLine: validateLine,
            saveRecord: saveRecord,
            showPrompt: showPrompt,
            redirectToSL: redirectToSL,
            calculateRental: calculateRental
        };

    });
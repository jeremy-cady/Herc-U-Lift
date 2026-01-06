/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This User Event script is deployed on Sales Order and updates rate field by looking up in PM Price Matrix
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/03/29                           Vishal Pitale       Using 'NEXTSERVICE TASK' from SO body, if the NextService Task in sublist is empty.
 * 2023/03/29                           Vishal Pitale       Added filter for Customer Pricing Group in getPMRates function.
 * 2023/02/24                           Amol Jagkar         Initial version
 *
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (record, runtime, search) => {

        const getEquipmentCategory = () => {
            let response = [];

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

            for (let i = 0; i < response.length; i++) {
                let element = response[i];
                if (!!element.parent) {
                    let flag = true;
                    do {
                        let obj = response.find(e => e.id == element.parent);
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

        const ITEMS = {
            PLANNED_MAINTENANCE: 92466
        }

        const REVENUE_STREAMS = {
            // Time and Material (CPMTM)
            TIME_AND_MATERIAL_CPMTM: 214
        }

        const formatLookupObject = (data) => {
            let response = {};
            for (let key in data) {
                try {
                    if (data[key].constructor == Array && data[key].length == 1) response[key] = data[key][0].value;
                    else if (data[key].constructor == Array && data[key].length > 1) {
                        let array = [];
                        data[key].forEach(element => {
                            array.push(element)
                        });
                        response[key] = array;
                    } else response[key] = data[key];
                } catch (error) {
                }
            }
            return response;
        }

        // Geography
        const getSalesZone = (address) => {
            let response = [];
            // let address = taskRecord.getValue({fieldId: "custevent_nx_address"});
            // let matches = address.match(/(\d+)/g);
            // let numbers = matches.filter(element => element.length > 3);

            let numbers = [];
            let zipCodes = [];
            let addressArray = address.replace(/\n/g, " ").replace(/\r/g, " ").split(" ");

            addressArray.forEach(element => {
                let matches = element.match(/\d+/g);
                if (!!matches && matches.length != 0 && element.length > 3) {
                    numbers.push(element);
                    zipCodes.push({zipCode: element});
                }
            })

            let filters = [];

            for (let i = 0; i < numbers.length; i++) {
                let zipCode = numbers[i];
                filters.push(["custrecord_sna_st_zip_code", "is", zipCode]);
                if (i != numbers.length - 1)
                    filters.push("OR");
            }

            let salesZoneSearchObj = search.create({
                type: "customrecord_sna_sales_zone", filters,
                columns: [
                    search.createColumn({name: "custrecord_sna_st_zip_code", label: "Zip Code"}),
                    search.createColumn({name: "custrecord_sna_st_description", label: "Description"}),
                    search.createColumn({name: "custrecord_sna_sz_cpg", label: "Customer Pricing Group"})
                ]
            }).run();

            let results = getAllSearchResults(salesZoneSearchObj);

            results.forEach(function (result) {
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

        const getCaseData = (caseId) => {
            let data = search.lookupFields({
                type: search.Type.SUPPORT_CASE,
                id: caseId,
                columns: ["custevent_nxc_case_assets.cseg_sna_hul_eq_seg", "custevent_nxc_case_assets.custrecord_sna_hul_nxcassetobject", "cseg_sna_revenue_st", "cseg_sna_revenue_st.custrecord_sna_hul_flatrate"]
            });

            return formatLookupObject(data);
        }

        const getProjectType = (projectId) => {
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

        const getAllSearchResults = (resultSet) => {
            let batch, batchResults, results = [], searchStart = 0;
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

        const searchPMRates = (searchFilters) => {
            let response = [];
            let pricingSearchObj = search.create({
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

            let results = getAllSearchResults(pricingSearchObj);

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

        const getPMRates = (requestData, salesZones) => {
            let response = [];

            let filters = [];
            let searchFilters = [];

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
                let zoneFilters = [];
                for (let i = 0; i < salesZones.length; i++) {
                    let salesZone = salesZones[i];

                    let filter = [];
                    if (!!salesZone.zipCode)
                        filter.push(["custrecord_sna_hul_pmpricezip", "startswith", salesZone.zipCode.split("-")[0]]);
                    if (!!salesZone.custPricingGrp) {
                        if (!!salesZone.zipCode) filter.push("AND");
                        filter.push(["custrecord_sna_hul_pmcustpricegroup", "is", salesZone.custPricingGrp]);
                    }
                    if (filter.length !== 0) zoneFilters.push(filter);

                    if (zoneFilters.length != 0 && i != salesZones.length - 1)
                        zoneFilters.push("OR");
                }
                if (zoneFilters.length != 0)
                    searchFilters.push(zoneFilters);
            } catch (error) {
            }

            for (let i = 0; i < filters.length; i++) {
                let element = filters[i];
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

        const getRate = (requestData, salesZones) => {
            let responseRate = getDefaultPMRate();
            // let responseRate = 0; // Add Default Rate
            let rates = getPMRates(requestData, salesZones);
            let equipList = getEquipmentCategory();
            log.audit('equipList', equipList);

            let rateCheck = [];
            for (let i = 0; i < rates.length; i++) {
                let element = rates[i];
                let checkCount = 0, equipmentTypeParent;
                let equipmentObj = equipList.find(e => e.id == element.equipmentType);
                if (!isEmpty(equipmentObj)) {
                    equipmentTypeParent = equipmentObj.top;
                }

                salesZones.forEach(salesZone => {
                    if ((element.zipCode.includes("-") || salesZone.zipCode.includes("-")) && element.zipCode.split("-")[0] == salesZone.zipCode.split("-")[0])
                        checkCount = checkCount + 2;
                    else if (element.zipCode == salesZone.zipCode)
                        checkCount = checkCount + 2;
                    if (element.customerPricingGroup == salesZone.custPricingGrp)
                        checkCount = checkCount + 2;
                })
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

            let maxCheck = Math.max(...rateCheck);

            let index = rateCheck.findIndex(element => element == maxCheck);

            if (index != -1 && !!rates[index].pmRate)
                responseRate = rates[index].pmRate;

            return responseRate;
        }

        const padLeft = (data, number) => {
            return data.padStart(number, 0);
        }

        const getDate = (date) => {
            if (!date) return "";
            date = new Date(date);
            let day = padLeft(date.getDate().toString(), 2);
            let month = padLeft((date.getMonth() + 1).toString(), 2);
            let year = date.getFullYear().toString();
            return [month, day, year].join("/");
        }

        const getDefaultPMRate = () => {
            let pmRate = 0;
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

        const checkPMServiceItem = (item) => {
            try {
                return search.lookupFields({
                    type: search.Type.ITEM, id: item, columns: "custitem_sna_hul_itemincludepmrate"
                }).custitem_sna_hul_itemincludepmrate;
            } catch (e) {
                return false;
            }
        }

        const getTotalServiceQuantity = (newRecord) => {
            let totQuantity = 0;
            for (let line = 0; line < newRecord.getLineCount("item"); line++) {
                let item = newRecord.getSublistValue({sublistId: "item", fieldId: "item", line});
                let itemType = newRecord.getSublistValue({sublistId: "item", fieldId: "itemtype", line});
                let quantity = Number(newRecord.getSublistValue({sublistId: "item", fieldId: "quantity", line}));
                if (itemType === "Service" && item != ITEMS.PLANNED_MAINTENANCE) totQuantity += quantity;
            }

            if (totQuantity === 0) totQuantity = 1;

            return totQuantity;
        }

        const getTotalServiceAmounts = (newRecord) => {
            let totAmount = 0;
            for (let line = 0; line < newRecord.getLineCount("item"); line++) {
                let item = newRecord.getSublistValue({sublistId: "item", fieldId: "item", line});
                let itemType = newRecord.getSublistValue({sublistId: "item", fieldId: "itemtype", line});
                let amount = Number(newRecord.getSublistValue({sublistId: "item", fieldId: "amount", line}));
                let originalServiceAmount = Number(newRecord.getSublistValue({
                    sublistId: "item", fieldId: "custcol_sna_original_service_amount", line
                }));
                if (itemType === "Service" && item != ITEMS.PLANNED_MAINTENANCE) {
                    if (amount !== originalServiceAmount && amount !== 0/* && originalServiceAmount === 0*/) {
                        newRecord.setSublistValue({
                            sublistId: "item", fieldId: "custcol_sna_original_service_amount", value: amount, line
                        });
                        totAmount += amount;
                    } else {
                        totAmount += originalServiceAmount;
                    }
                }
            }

            return totAmount;
        }

        const checkFlatRate = (revenueStream) => {
            try {
                return search.lookupFields({
                    type: "customrecord_cseg_sna_revenue_st", id: revenueStream, columns: "custrecord_sna_hul_flatrate"
                }).custrecord_sna_hul_flatrate;
            } catch (error) {
                return null;
            }
        }

        const pmPricingBeforeSubmit = (scriptContext) => {
            let newRecord = scriptContext.newRecord;
            let addPlannedMaintenance = false;
            let totalServiceQuantity = 0, totalServiceAmount = 0;
            let orderStatus = newRecord.getValue({fieldId: "orderstatus"});
            if (["G", "H"].includes(orderStatus)) return;

            // if (runtime.executionContext != runtime.ContextType.SUITELET)
            //     return;

            ITEMS.PLANNED_MAINTENANCE = runtime.getCurrentScript().getParameter("custscript_pricemtrx_planned_maintenance");

            try {
                let customer = newRecord.getValue({fieldId: "entity"});
                let tranDate = getDate(newRecord.getValue({fieldId: "trandate"}));
                let projectId = newRecord.getValue({fieldId: "job"});
                let projectType = getProjectType(projectId);
                let projectTypeText = projectType.text;
                // if (!!projectTypeText && projectTypeText.includes("PM"))
                //     addPlannedMaintenance = true;

                // Fetch Revenue Stream and if It has Planned maintenance then add Planned Maintenance line.
                let revStreams = newRecord.getValue({fieldId: 'cseg_sna_revenue_st'});

                if (isEmpty(revStreams)) {
                    let nxtCase = newRecord.getValue({fieldId: 'custbody_nx_case'});

                    if (!isEmpty(nxtCase)) {
                        revStreams = search.lookupFields({
                            type: 'supportcase',
                            id: nxtCase,
                            columns: ['cseg_sna_revenue_st']
                        }).cseg_sna_revenue_st[0].value;
                    }
                }

                let flatRate;
                if (!isEmpty(revStreams)) {
                    let plannedMain = search.lookupFields({
                        type: 'customrecord_cseg_sna_revenue_st',
                        id: revStreams,
                        columns: ['custrecord_sna_hul_pnrevstream']
                    });
                    if (!isEmpty(plannedMain)) {
                        let flag = plannedMain.custrecord_sna_hul_pnrevstream;
                        if (flag) {
                            addPlannedMaintenance = true;
                        }
                    }

                    flatRate = checkFlatRate(revStreams);
                }

                let projectTypeValue = projectType.value;
                let soNxtSerTask = newRecord.getValue({fieldId: 'custbody_nx_task'});
                log.debug({title: "projectType", details: projectTypeValue});
                log.debug({title: "soNxtSerTask", details: soNxtSerTask});
                log.debug({title: "revStreams", details: {revStreams, addPlannedMaintenance}});

                let lineCount = newRecord.getLineCount({sublistId: "item"});

                let shippingAddress = newRecord.getValue({fieldId: 'shipaddress'});
                let salesZone = getSalesZone(shippingAddress);
                log.debug({title: "salesZone", details: salesZone});

                for (let line = 0; line < lineCount && addPlannedMaintenance; line++) {
                    let item = newRecord.getSublistValue({sublistId: "item", fieldId: "item", line});
                    if (item == ITEMS.PLANNED_MAINTENANCE) {
                        addPlannedMaintenance = false;
                        let rate = newRecord.getSublistValue({sublistId: "item", fieldId: "rate", line});
                        let overrideRate = newRecord.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_amt_manual",
                            line
                        });
                        let lockRate = false;

                        if ([runtime.ContextType.USER_INTERFACE, runtime.ContextType.CUSTOM_MASSUPDATE, runtime.ContextType.CSV_IMPORT].includes(runtime.executionContext)) {
                            lockRate = newRecord.getSublistValue({
                                sublistId: "item",
                                fieldId: "custcol_sna_hul_lock_rate",
                                line
                            });
                            log.audit('planned maintenance overrideRate & lockRate', {overrideRate, lockRate});
                        }

                        if (!!rate && !overrideRate && !lockRate) {
                            let responseRate = getDefaultPMRate();
                            log.debug({title: "Setting Response Rate", details: responseRate});
                            newRecord.setSublistValue({sublistId: "item", fieldId: "rate", value: responseRate, line});
                        }
                        break;
                    }
                }
                totalServiceQuantity = getTotalServiceQuantity(newRecord);
                totalServiceAmount = getTotalServiceAmounts(newRecord);

                log.debug({
                    title: "addPlannedMaintenance",
                    details: {addPlannedMaintenance, totalServiceQuantity, totalServiceAmount}
                });

                if (addPlannedMaintenance) {
                    newRecord.setSublistValue({
                        sublistId: "item",
                        fieldId: "item",
                        value: ITEMS.PLANNED_MAINTENANCE,
                        line: lineCount
                    });
                    newRecord.setSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        value: totalServiceQuantity,
                        line: lineCount
                    });
                    newRecord.setSublistValue({
                        sublistId: "item",
                        fieldId: "price",
                        value: -1,
                        line: lineCount
                    });

                    newRecord.setValue({fieldId: "custbody_sna_pm_added", value: true});
                    /*newRecord.setSublistValue({
                        sublistId: "item",
                        fieldId: "rate",
                        value: 0,
                        line: lineCount
                    });
                    newRecord.setSublistValue({
                        sublistId: "item",
                        fieldId: "amount",
                        value: 0,
                        line: lineCount
                    });*/

                    let nextServiceFields = ["custcol_sna_work_code", "custcol_sna_repair_code", "custcol_sna_group_code", "custcol_nxc_case", "custcol_nx_task", "custcol_nx_asset", "custcol_nxc_equip_asset", "custcol_sna_sales_description", "custcol_sna_so_service_code_type", "custcol_sna_hul_fleet_no"];

                    nextServiceFields.forEach(fieldId => {
                        let value = newRecord.getSublistValue({sublistId: "item", fieldId, line: lineCount - 1});
                        // log.debug({title: fieldId + " value", details: value});
                        if (!!value)
                            newRecord.setSublistValue({sublistId: "item", fieldId, value, line: lineCount});
                    });

                    lineCount++;
                } else {
                    let lineNumber = newRecord.findSublistLineWithValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: ITEMS.PLANNED_MAINTENANCE,
                    });

                    let pmQuantity = Number(newRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: 'quantity',
                        line: lineNumber
                    }));

                    if (totalServiceQuantity !== pmQuantity) {
                        newRecord.setSublistValue({
                            sublistId: "item",
                            fieldId: "quantity",
                            value: totalServiceQuantity,
                            line: lineNumber
                        });
                    }

                    newRecord.setValue({fieldId: "custbody_sna_pm_added", value: false});
                }

                log.debug({title: "lineCount", details: lineCount});
                for (let line = 0; line < lineCount; line++) {
                    let taskId = newRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_nx_task",
                        line
                    }) || soNxtSerTask;
                    let item = newRecord.getSublistValue({sublistId: "item", fieldId: "item", line});
                    let rate = newRecord.getSublistValue({sublistId: "item", fieldId: "rate", line});
                    let overrideRate = newRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_sna_amt_manual",
                        line
                    });
                    let lockRate = false;

                    if ([runtime.ContextType.USER_INTERFACE, runtime.ContextType.CUSTOM_MASSUPDATE, runtime.ContextType.CSV_IMPORT].includes(runtime.executionContext)) {
                        lockRate = newRecord.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_hul_lock_rate",
                            line
                        });
                    }
                    // let itemRecord = record.load({type: 'serviceitem', id: item});
                    // let includeCheckbox = itemRecord.getValue({fieldId: "custitem_sna_hul_itemincludepmrate"});

                    let equipmentType = newRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "cseg_sna_hul_eq_seg",
                        line
                    });
                    let objectNo = newRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_sna_object",
                        line
                    }) || newRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_sna_hul_fleet_no",
                        line
                    }) || newRecord.getValue({fieldId: "custbody_sna_equipment_object"});

                    // if (includeCheckbox == true) {
                    if (checkPMServiceItem(item) && !overrideRate && !lockRate) {
                        // if (!!taskId) {
                        /*log.debug({title: "taskId", details: taskId});

                        let taskRecord = record.load({type: record.Type.TASK, id: taskId});
                        let supportCase = taskRecord.getValue({fieldId: "supportcase"});

                        log.debug({title: "supportCase", details: supportCase});

                        // Case Details
                        let caseDetails = getCaseData(supportCase);
                        log.debug({title: "caseDetails", details: caseDetails});*/

                        // Geography - Zip
                        // let salesZone = getSalesZone(taskRecord);
                        // log.debug({title: "salesZone", details: salesZone});

                        // Equipment type
                        // let equipmentType = caseDetails["custevent_nxc_case_assets.cseg_sna_hul_eq_seg"];
                        log.debug({title: "equipmentType", details: equipmentType});

                        // Service Action
                        // let serviceAction = caseDetails["cseg_sna_revenue_st"];
                        log.debug({title: "serviceAction", details: revStreams});

                        // Object No
                        // let objectNo = caseDetails["custevent_nxc_case_assets.custrecord_sna_hul_nxcassetobject"];
                        log.debug({title: "object No", details: objectNo});

                        // Frequency
                        let frequency = projectTypeValue;
                        log.debug({title: "frequency", details: frequency});

                        // Quantity
                        let quantity = newRecord.getSublistValue({sublistId: "item", fieldId: "quantity", line});

                        // if (serviceAction != REVENUE_STREAMS.TIME_AND_MATERIAL_CPMTM) {

                        let requestData = {
                            customer,
                            tranDate,
                            salesZone: salesZone.id,
                            zipCode: salesZone.zipCode,
                            custPricingGrp: salesZone.custPricingGrp,
                            equipmentType,
                            serviceAction: revStreams,
                            objectNo,
                            frequency,
                            quantity
                        };

                        log.debug({title: "requestData " + line, details: requestData});

                        let rate = getRate(requestData, salesZone);
                        let pmRate = newRecord.setSublistValue({sublistId: "item", fieldId: "rate", line: line});
                        let pmAdded = newRecord.getValue({fieldId: "custbody_sna_pm_added"});
                        log.debug({title: "getRate rate " + line, details: {rate, pmRate}});
                        log.debug({
                            title: "beforeSubmit " + line, details: {
                                flatRate, addPlannedMaintenance, pmAdded, totalServiceQuantity, totalServiceAmount
                            }
                        });

                        if (flatRate) {
                            // newRecord.setSublistValue({sublistId: "item", fieldId: "rate", value: rate / quantity, line});
                            newRecord.setSublistValue({
                                sublistId: "item", fieldId: "quantity", value: totalServiceQuantity, line
                            });
                            newRecord.setSublistValue({sublistId: "item", fieldId: "rate", value: rate, line});
                            newRecord.setSublistValue({sublistId: "item", fieldId: "amount", value: rate, line});
                        } else if (!flatRate) {
                            newRecord.setSublistValue({
                                sublistId: "item",
                                fieldId: "rate",
                                value: (totalServiceAmount / totalServiceQuantity),
                                line
                            });
                        } else if (rate != 0)
                            newRecord.setSublistValue({sublistId: "item", fieldId: "rate", value: rate, line});

                        if (rate != 0 || !!flatRate)
                            newRecord.setSublistValue({
                                sublistId: "item", fieldId: "custcol_sna_hul_lock_rate", value: true, line
                            });

                        // }
                        // }
                    }
                }


            } catch (error) {
                log.error({title: "Error", details: error});
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            let newRecord = scriptContext.newRecord;
            let orderStatus = newRecord.getValue({fieldId: "orderstatus"});
            log.emergency({title: "beforeSubmit", details: {orderStatus, flag: (!["G", "H"].includes(orderStatus))}});
            if (!["G", "H"].includes(orderStatus))
                pmPricingBeforeSubmit(scriptContext);
        }

        const pmPricingAfterSubmit = (scriptContext) => {
            try {
                let updateFlag = false, pmItemFound = false, pmItemLine = 0, pmRate = 0, totalServiceAmount = 0,
                    totalServiceQuantity = 0,
                    lockRate = false;
                let newRecord = scriptContext.newRecord;
                let orderStatus = newRecord.getValue({fieldId: "orderstatus"});
                if (["G", "H"].includes(orderStatus)) return;

                let currentRecord = record.load({type: newRecord.type, id: newRecord.id});
                let revStreams = currentRecord.getValue({fieldId: 'cseg_sna_revenue_st'});
                ITEMS.PLANNED_MAINTENANCE = runtime.getCurrentScript().getParameter("custscript_pricemtrx_planned_maintenance");

                totalServiceAmount = getTotalServiceAmounts(newRecord);

                let flatRate = checkFlatRate(revStreams);
                log.debug({title: "After Submit Flat Rate", details: flatRate});

                /*for (let line = 0; line < currentRecord.getLineCount({sublistId: "item"}); line++) {
                    let item = currentRecord.getSublistValue({sublistId: "item", fieldId: "item", line});
                    if (item == ITEMS.PLANNED_MAINTENANCE) {
                        totalServiceAmount = currentRecord.getSublistValue({
                            sublistId: "item", fieldId: "amount", line
                        });
                        pmRate = Number(currentRecord.getSublistValue({sublistId: "item", fieldId: "rate", line}));
                    }
                }*/

                for (let line = 0; line < currentRecord.getLineCount({sublistId: "item"}); line++) {
                    let item = currentRecord.getSublistValue({sublistId: "item", fieldId: "item", line});
                    let quantity = Number(currentRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        line
                    }));
                    let rate = Number(currentRecord.getSublistValue({sublistId: "item", fieldId: "rate", line}));
                    let amount = Number(currentRecord.getSublistValue({sublistId: "item", fieldId: "amount", line}));
                    let itemType = currentRecord.getSublistValue({sublistId: "item", fieldId: "itemtype", line});

                    log.debug({
                        title: "After Submit line data",
                        details: {item, quantity, rate, amount, itemType, line}
                    });

                    if (item == ITEMS.PLANNED_MAINTENANCE) {
                        pmItemLine = line;
                        pmItemFound = true;
                        // pmRate = Number(currentRecord.getSublistValue({sublistId: "item", fieldId: "rate", line}));
                        if ([runtime.ContextType.USER_INTERFACE, runtime.ContextType.CUSTOM_MASSUPDATE, runtime.ContextType.CSV_IMPORT].includes(runtime.executionContext)) {
                            lockRate = currentRecord.getSublistValue({
                                sublistId: "item", fieldId: "custcol_sna_hul_lock_rate", line
                            });
                        }
                        /*totalServiceAmount += Number(currentRecord.getSublistValue({
                            sublistId: "item", fieldId: "amount", line
                        }));*/
                    }

                    if (item == ITEMS.PLANNED_MAINTENANCE && !!flatRate) {

                        if (scriptContext.type === scriptContext.UserEventType.EDIT) {
                            let oldRecord = scriptContext.oldRecord;
                            let oldAmount = oldRecord.getSublistValue({sublistId: "item", fieldId: "amount", line});

                            if (oldAmount !== rate) {
                                currentRecord.setSublistValue({
                                    sublistId: "item",
                                    fieldId: "amount",
                                    value: rate,
                                    line
                                });
                                pmItemFound = true;
                                pmItemLine = line;
                                updateFlag = true;
                            }
                        } else if (scriptContext.type === scriptContext.UserEventType.CREATE) {
                            if (amount !== rate) {
                                currentRecord.setSublistValue({
                                    sublistId: "item",
                                    fieldId: "amount",
                                    value: rate,
                                    line
                                });
                                pmItemFound = true;
                                pmItemLine = line;
                                updateFlag = true;
                            }
                        }

                    } else if (itemType === "Service" && item != ITEMS.PLANNED_MAINTENANCE) {
                        log.debug({
                            title: "After Submit inside service",
                            details: {item, quantity, rate, amount, itemType, line}
                        });

                        totalServiceQuantity += quantity;

                        /*totalServiceAmount += Number(currentRecord.getSublistValue({
                            sublistId: "item", fieldId: "amount", line
                        }));*/
                        if (rate > 0)
                            pmRate = rate;
                        updateFlag = true;
                        currentRecord.setSublistValue({sublistId: "item", fieldId: "rate", value: 0, line});
                        currentRecord.setSublistValue({sublistId: "item", fieldId: "amount", value: 0, line});
                    }

                    if (lockRate) {
                        updateFlag = false;
                    }
                }

                log.debug({
                    title: "PM Service Rate",
                    details: {pmRate, pmItemFound, pmItemLine, updateFlag, totalServiceAmount, totalServiceQuantity}
                });

                if (pmItemFound && !flatRate && pmRate > 0) {
                    let quantity = Number(currentRecord.getSublistValue({
                        sublistId: "item", fieldId: "quantity", line: pmItemLine
                    }));

                    /*currentRecord.setSublistValue({
                        sublistId: "item", fieldId: "rate", value: pmRate, line: pmItemLine
                    });*/
                    currentRecord.setSublistValue({
                        sublistId: "item",
                        fieldId: "rate",
                        value: totalServiceAmount / totalServiceQuantity,
                        line: pmItemLine
                    });
                    currentRecord.setSublistValue({
                        sublistId: "item", fieldId: "amount", value: totalServiceAmount, line: pmItemLine
                    });
                    // currentRecord.setSublistValue({
                    //     sublistId: "item", fieldId: "amount", value: totalServiceAmount, line: pmItemLine
                    // });
                    currentRecord.setSublistValue({
                        sublistId: "item", fieldId: "quantity", value: totalServiceQuantity, line: pmItemLine
                    });
                }
                if (pmItemFound && updateFlag)
                    currentRecord.save();
            } catch (error) {
                log.error({title: "After Submit Error", details: error});
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            let newRecord = scriptContext.newRecord;
            let orderStatus = newRecord.getValue({fieldId: "orderstatus"});
            log.emergency({title: "afterSubmit", details: {orderStatus, flag: (!["G", "H"].includes(orderStatus))}});
            if (!["G", "H"].includes(orderStatus))
                pmPricingAfterSubmit(scriptContext);
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {
            beforeSubmit,
            afterSubmit,
            getPMRates,
            getRate,
            getSalesZone,
            checkPMServiceItem,
            getProjectType,
            getDefaultPMRate,
            getTotalServiceQuantity,
            getDate,
            pmPricingBeforeSubmit,
            pmPricingAfterSubmit
        }

    });
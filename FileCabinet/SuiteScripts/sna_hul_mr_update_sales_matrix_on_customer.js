/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Map/Reduce script updates Sales Rep Matrix & Sales Rep Matrix mapping
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2022/10/26                           Amol Jagkar         Initial version
 *
 */
define(["N/runtime", "N/search", "N/record", "./sna_hul_ue_sales_rep_matrix_config"], (runtime, search, record, library) => {

    const getAllSearchResults = (resultSet) => {
        let batch, batchResults, results = [], searchStart = 0;
        do {
            batch = resultSet.getRange({ start: searchStart, end: searchStart + 1000 });
            batchResults = (batch || []).map(function (row) {
                searchStart++;
                return row;
            }, this);
            results = results.concat(batchResults);
        } while ((batchResults || []).length === 1000);

        return results;
    }

    const parseJSON = (data) => {
        if (typeof data == "string") data = JSON.parse(data);
        return data;
    }

    const formatLookupObject = (data) => {
        let response = {};
        for (let key in data) {
            try {
                if (data[key].constructor == Array && data[key].length == 1) response[key] = data[key][0].value;
                else if (data[key].constructor == Array && data[key].length > 1) {
                    let dataArr = [];
                    data[key].forEach(element => dataArr.push(element.value));
                    response[key] = dataArr;
                } else if (data[key].constructor == Array && data[key].length > 1) {
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

    const getSalesRepMatrixArray = (zipCodes) => {
        let response = [];
        let filters = [], cnt = 0;

        for (let i = 0; i < zipCodes.length; i++) {
            filters.push([ ["custrecord_sna_zip_code", "is", zipCodes[i]], 'AND', ['custrecord_sna_hul_srm_country_not_us', 'is', true] ]);
            filters.push("OR");
            filters.push([ ["custrecord_sna_zip_code", "startswith", zipCodes[i].substring(0,5)], 'AND', ['custrecord_sna_hul_srm_country_not_us', 'is', false] ]);


            if (i != zipCodes.length - 1)
                filters.push("OR");
        }
log.audit('filters', filters);
        if (filters.length == 0)
            return response;

        let searchObject = search.create({
            type: "customrecord_sna_sales_rep_matrix",
            filters: filters,
            columns: ["custrecord_sna_state", "custrecord_sna_county", "custrecord_sna_zip_code", "custrecord_sna_rep_matrix_equipment_cat", "custrecord_sna_revenue_streams", "custrecord_sna_hul_manufacturer_cs", "custrecord_sna_rep_matrix_sales_reps", "custrecord_sna_hul_sales_rep_comm_plan", "custrecord_sna_hul_comm_plan_end_date"]
        }).run();
        let results = getAllSearchResults(searchObject);
        results.forEach(function (result) {
            response.push({
                id: result.id,
                state: result.getValue("custrecord_sna_state"),
                county: result.getValue("custrecord_sna_county"),
                zipCode: result.getValue("custrecord_sna_zip_code"),
                equipmentCategory: result.getValue("custrecord_sna_rep_matrix_equipment_cat"),
                revenueStream: result.getValue("custrecord_sna_revenue_streams"),
                manufacturer: result.getValue("custrecord_sna_hul_manufacturer_cs"),
                salesReps: result.getValue("custrecord_sna_rep_matrix_sales_reps").split(","),
                commissionPlan: result.getValue("custrecord_sna_hul_sales_rep_comm_plan"),
                commissionPlanEndDate: result.getValue("custrecord_sna_hul_comm_plan_end_date")
            });
            return true;
        });
        return response;
    }

    const getSalesRepCustomerMatrix = (customerId, matrixId) => {
        let response = [];
        /*let filters = [
            ["custrecord_salesrep_mapping_customer", "anyof", customerId]/!*, "AND",
            ["custrecord_salesrep_mapping_override", "is", "F"]*!/
        ];
        let zipCodeFilters = [];

        if (zipCodes.length != 0)
            filters.push("AND");

        for (let i = 0; i < zipCodes.length; i++) {
            zipCodeFilters.push(["custrecord_salesrep_mapping_zipcode", "is", zipCodes[i]]);
            if (i != zipCodes.length - 1)
                zipCodeFilters.push("OR");
        }

        if (zipCodeFilters.length > 0)
            filters.push(zipCodeFilters);*/

        search.create({
            type: "customrecord_sna_salesrep_matrix_mapping",
            filters:  [
                {name: "custrecord_salesrep_mapping_customer", operator: "anyof", values: customerId},
                {name: "custrecord_salesrep_mapping_sales_matrix", operator: "anyof", values: matrixId}
            ],
            columns: [
                "custrecord_salesrep_mapping_state", "custrecord_salesrep_mapping_county", "custrecord_salesrep_mapping_zipcode", "custrecord_salesrep_mapping_equipment", "custrecord_salesrep_mapping_rev_stream", "custrecord_salesrep_mapping_manufacturer", "custrecord_salesrep_mapping_sales_reps", "custrecord_salesrep_mapping_override"
            ]
        }).run().each(function (result) {
            response.push({
                id: result.id,
                state: result.getValue("custrecord_salesrep_mapping_state"),
                county: result.getValue("custrecord_salesrep_mapping_county"),
                zipCode: result.getValue("custrecord_salesrep_mapping_zipcode"),
                equipmentCategory: result.getValue("custrecord_salesrep_mapping_equipment"),
                revenueStream: result.getValue("custrecord_salesrep_mapping_rev_stream"),
                manufacturer: result.getValue("custrecord_salesrep_mapping_manufacturer"),
                salesReps: result.getValue("custrecord_salesrep_mapping_sales_reps").split(","),
                override: result.getValue("custrecord_salesrep_mapping_override")
            });
            return true;
        });
        return response;
    }

    const processMap = (matrix, customer) => {
        let customerMatrixArray = getSalesRepCustomerMatrix(customer, matrix.id);

        let customerMatrixRecord;
        if (customerMatrixArray.length == 0)
            customerMatrixRecord = record.create({type: "customrecord_sna_salesrep_matrix_mapping"});
        else {
            customerMatrixRecord = record.load({
                type: "customrecord_sna_salesrep_matrix_mapping",
                id: customerMatrixArray[0].id
            });
            let override = customerMatrixArray[0].override;
            if (override)
                return true;
        }

        let values = {
            "custrecord_salesrep_mapping_customer": customer,
            "custrecord_salesrep_mapping_state": matrix.state,
            "custrecord_salesrep_mapping_county": matrix.county,
            "custrecord_salesrep_mapping_zipcode": matrix.zipCode,
            "custrecord_salesrep_mapping_equipment": matrix.equipmentCategory,
            "custrecord_salesrep_mapping_rev_stream": matrix.revenueStream,
            "custrecord_salesrep_mapping_manufacturer": matrix.manufacturer,
            "custrecord_salesrep_mapping_sales_reps": matrix.salesReps,
            "custrecord_salesrep_mapping_override": false,
            "isinactive": false,
            "custrecord_salesrep_mapping_sales_matrix": matrix.id,
            "custrecord_sna_hul_sales_rep_comm_plan_2": matrix.commissionPlan,
            "custrecord_sna_hul_comm_plan_end_date_2": matrix.commissionPlanEndDate
        }
        log.debug({
            title: "customerMatrixArray", details: {values}
        });

        for (let fieldId in values)
            customerMatrixRecord.setValue({fieldId, value: values[fieldId]});

        customerMatrixRecord.save();
    }

    const getInputData = (inputContext) => {
        let matrixRecordId = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_matrix"});
        let customer = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_customer"});
        let zipCode = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_zip_code"});
        let inactivateMapping = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_inactivate"});
        let addUpdateFlag = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_add_upd_matrix"});
        let fromSuitelet = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_global_resync"});

        log.audit({
            title: "GetInputData", details: {matrixRecordId, customer, zipCode, inactivateMapping, addUpdateFlag}
        });

        if (addUpdateFlag) {
            let zipCodes = library.getCustomerZipCodes(customer);
log.audit('zipCodes before empty value removal', zipCodes);
            zipCodes = zipCodes.filter(Boolean);
            log.audit('zipCodes after empty value removal', zipCodes);
            let matrixArray = getSalesRepMatrixArray(zipCodes);
log.audit('matrixArray', matrixArray);
            return matrixArray;
        } else {
            let filters = [];

            if(!fromSuitelet) {
                if (!!customer && !!zipCode && inactivateMapping) {
                    filters.push({name: "custrecord_salesrep_mapping_customer", operator: "anyof", values: customer});
                    filters.push({name: "custrecord_salesrep_mapping_zipcode", operator: "is", values: zipCode});
                } else {
                    /*zipCode = search.lookupFields({
                        type: "customrecord_sna_sales_rep_matrix",
                        id: matrixRecordId,
                        columns: "custrecord_sna_zip_code"
                    }).custrecord_sna_zip_code;*/
                    filters.push({
                        name: "custrecord_salesrep_mapping_sales_matrix",
                        operator: "is",
                        values: matrixRecordId
                    });
                    filters.push({name: "custrecord_salesrep_mapping_override", operator: "is", values: "F"});
                    // filters.push({name: "custrecord_salesrep_mapping_zipcode", operator: "is", values: zipCode});
                }
            }

            log.audit('filters', filters);
            log.audit('filters length', filters.length);

            return search.create({type: "customrecord_sna_salesrep_matrix_mapping", filters: filters});
        }
    }

    const map = (mapContext) => {
        let customer = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_customer"});
        let matrixRecordId = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_matrix"});
        let inactivateMapping = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_inactivate"});
        let addUpdateFlag = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_add_upd_matrix"});
        let fromSuitelet = runtime.getCurrentScript().getParameter({name: "custscript_sna_sales_rep_global_resync"});

        if (addUpdateFlag) {
            let matrix = parseJSON(mapContext.value);
            log.audit({title: "matrix", details: matrix});
            try {
                processMap(matrix, customer);
            } catch (error) {
                log.error({title: "Process Map error", details: error});
            }
        } else {
            try {
                let customerMatrixRecord = record.load({
                    type: "customrecord_sna_salesrep_matrix_mapping",
                    id: mapContext.key
                });

                if(fromSuitelet){
                    matrixRecordId = customerMatrixRecord.getValue({ fieldId: 'custrecord_salesrep_mapping_sales_matrix' });
                }
                log.audit({title: "matrixRecordId", details: matrixRecordId});

                if (inactivateMapping) {
                    customerMatrixRecord.setValue({fieldId: "isinactive", value: true});
                } else {
                    let matrixValues = formatLookupObject(search.lookupFields({
                        type: "customrecord_sna_sales_rep_matrix",
                        id: matrixRecordId,
                        columns: ["custrecord_sna_state", "custrecord_sna_county", "custrecord_sna_zip_code", "custrecord_sna_rep_matrix_equipment_cat", "custrecord_sna_revenue_streams", "custrecord_sna_hul_manufacturer_cs", "custrecord_sna_rep_matrix_sales_reps"]
                    }));

                    let values = {
                        "custrecord_salesrep_mapping_state": matrixValues.custrecord_sna_state,
                        "custrecord_salesrep_mapping_county": matrixValues.custrecord_sna_county,
                        "custrecord_salesrep_mapping_zipcode": matrixValues.custrecord_sna_zip_code,
                        "custrecord_salesrep_mapping_equipment": matrixValues.custrecord_sna_rep_matrix_equipment_cat,
                        "custrecord_salesrep_mapping_rev_stream": matrixValues.custrecord_sna_revenue_streams,
                        "custrecord_salesrep_mapping_manufacturer": matrixValues.custrecord_sna_hul_manufacturer_cs,
                        "custrecord_salesrep_mapping_sales_reps": matrixValues.custrecord_sna_rep_matrix_sales_reps,
                        "isinactive": false
                    }

                    for (let fieldId in values) {
                        if (!isEmpty(values[fieldId]))
                            customerMatrixRecord.setValue({fieldId, value: values[fieldId]});
                    }
                    // customerMatrixRecord.setValue({fieldId: "isinactive", value: false});
                }
                customerMatrixRecord.save();

                log.debug({title: `Sales Rep Matrix updated from Customer: ${customerMatrixRecord.getValue({fieldId: "custrecord_salesrep_mapping_customer"})}`});
            } catch (error) {
                log.error({title: "Map error", details: error});
            }
        }
    }

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    return {getInputData, map}

});
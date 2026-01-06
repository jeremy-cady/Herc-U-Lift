/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Client script updates Sales Reps on item lines from Sales Order
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2022/10/26                           Amol Jagkar         Initial version
 *
 */
define(['N/search'], (search) => {

    const COMMISSION_TYPE = {
        GROSS_MARGIN: 1,
        REVENUE: 2
    }

    let zipCode;
    let customerMatrix = [];

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

    const getCustomerMatrix = (customerId) => {
        let response = [];
        search.create({
            type: "customrecord_sna_salesrep_matrix_mapping",
            filters: [
                {name: "custrecord_salesrep_mapping_customer", operator: "anyof", values: customerId},
                {name: "isinactive", operator: "is", values: false},
            ],
            columns: [
                search.createColumn({name: "custrecord_salesrep_mapping_customer", label: "Customer"}),
                search.createColumn({name: "custrecord_salesrep_mapping_state", label: "State"}),
                search.createColumn({name: "custrecord_salesrep_mapping_county", label: "County"}),
                search.createColumn({name: "custrecord_salesrep_mapping_zipcode", label: "Zip Code"}),
                search.createColumn({name: "custrecord_salesrep_mapping_equipment", label: "Equipment Category"}),
                search.createColumn({name: "custrecord_salesrep_mapping_rev_stream", label: "Revenue Stream"}),
                search.createColumn({name: "custrecord_salesrep_mapping_manufacturer", label: "HUL Manufacturer"}),
                search.createColumn({name: "custrecord_salesrep_mapping_sales_reps", label: "Sales Rep(s)"}),
                search.createColumn({name: "custrecord_salesrep_mapping_override", label: "Override Sales Rep Matrix"}),
                search.createColumn({
                    name: "custrecord_sna_hul_sales_rep_comm_plan_2", label: "Sales Rep Commission Plan"
                }),
                search.createColumn({
                    name: "custrecord_sna_hul_comm_rate",
                    join: "CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2",
                    label: "Commission Rate"
                }),
                search.createColumn({
                    name: "custrecord_sna_hul_comm_type",
                    join: "CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2",
                    label: "Commission Type"
                })
            ]
        }).run().each(result => {
            response.push({
                id: result.id,
                customer: result.getValue("custrecord_salesrep_mapping_customer"),
                state: result.getValue("custrecord_salesrep_mapping_state"),
                county: result.getValue("custrecord_salesrep_mapping_county"),
                zipCode: result.getValue("custrecord_salesrep_mapping_zipcode"),
                equipmentCategory: result.getValue("custrecord_salesrep_mapping_equipment"),
                revenueStream: result.getValue("custrecord_salesrep_mapping_rev_stream"),
                manufacturer: result.getValue("custrecord_salesrep_mapping_manufacturer"),
                salesReps: result.getValue("custrecord_salesrep_mapping_sales_reps").split(","),
                commissionPlan: result.getValue("custrecord_sna_hul_sales_rep_comm_plan_2"),
                commissionPlanRate: result.getValue({
                    name: "custrecord_sna_hul_comm_rate", join: "CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2"
                }).replace("%", ""),
                commissionPlanType: result.getValue({
                    name: "custrecord_sna_hul_comm_type", join: "CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2"
                }),
            });
            return true;
        });
        return response;
    }

    const getItemDetails = (itemId) => {
        let itemData = formatLookupObject(search.lookupFields({
            type: search.Type.ITEM,
            id: itemId,
            columns: ["cseg_sna_hul_eq_seg", "cseg_sna_revenue_st", "cseg_hul_mfg", "custitem_sna_hul_eligible_for_comm"]
        }));
        return {
            equipmentCategory: itemData.cseg_sna_hul_eq_seg,
            revenueStream: itemData.cseg_sna_revenue_st,
            manufacturer: itemData.cseg_hul_mfg,
            eligibleForCommission: itemData.custitem_sna_hul_eligible_for_comm
        };
    }

    const getSalesRep = (salesReps) => {
        let salesRep;
        search.create({
            type: search.Type.EMPLOYEE,
            filters: [{name: "internalid", operator: "anyof", values: salesReps}],
            columns: [search.createColumn({name: "custentity_sna_sales_rep_tran_assignedon", sort: search.Sort.ASC})]
        }).run().each(function (result) {
            salesRep = result.id;
            // return true;
        });
        return salesRep;
    }

    const customerAddress = (customer, addressId) => {
        let zipCode;
        search.create({
            type: search.Type.CUSTOMER,
            filters: [
                {name: "internalid", operator: "anyof", values: customer}
            ],
            columns: [
                search.createColumn({name: "addressinternalid", join: "Address", label: "Address Internal ID"}),
                search.createColumn({name: "zipcode", join: "Address", label: "Zip Code"})
            ]
        }).run().each(function (result) {
            let addressInternalId = result.getValue({name: "addressinternalid", join: "Address"});
            if (addressInternalId == addressId)
                zipCode = result.getValue({name: "zipcode", join: "Address"});
            return true;
        });
        return zipCode;
    }

    const pageInit = (scriptContext) => {
        try {
            let currentRecord = scriptContext.currentRecord;
            if (scriptContext.mode == "edit") {
                let customer = currentRecord.getValue({fieldId: "entity"});
                customerMatrix = getCustomerMatrix(customer);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fieldChanged = (scriptContext) => {
        try {
            let currentRecord = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            let fieldId = scriptContext.fieldId;

            if (sublistId == "item" && fieldId == "rate") {
                let commissionPlanType = currentRecord.getCurrentSublistValue({
                    sublistId, fieldId: "custcol_sna_hul_sales_rep_comm_type"
                });
                let amount = Number(currentRecord.getCurrentSublistValue({sublistId, fieldId: "amount"}));
                let costEstimate = Number(currentRecord.getCurrentSublistValue({sublistId, fieldId: "costestimate"}));

                let commissionRate = Number(currentRecord.getCurrentSublistValue({
                    sublistId, fieldId: "custcol_sna_hul_comm_rate"
                }).replace("%", ""));

                /*if (commissionPlanType == COMMISSION_TYPE.GROSS_MARGIN) {
                    let grossProfit = amount - costEstimate;
                    let commissionAmount = grossProfit * commissionRate / 100;
                    currentRecord.setCurrentSublistValue({
                        sublistId, fieldId: "custcol_sna_commission_amount", value: commissionAmount
                    });
                } else if (commissionPlanType == COMMISSION_TYPE.REVENUE) {
                    let commissionAmount = amount * commissionRate / 100;
                    currentRecord.setCurrentSublistValue({
                        sublistId, fieldId: "custcol_sna_commission_amount", value: commissionAmount
                    });
                }*/
            }
        } catch (error) {
            console.error(error);
        }
    }

    const postSourcing = (scriptContext) => {
        let currentRecord = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;
        let line = scriptContext.line;
        try {
            if (fieldId == "entity") {
                let customer = currentRecord.getValue({fieldId: "entity"});
                customerMatrix = getCustomerMatrix(customer);
                let addressId = currentRecord.getValue({fieldId: "shipaddresslist"});
                zipCode = customerAddress(customer, addressId);
            }

            if (sublistId == "item" && fieldId == "item" && customerMatrix.length != 0) {
                let itemId = currentRecord.getCurrentSublistValue({sublistId, fieldId});
                if (!!itemId) {
                    let itemDetails = getItemDetails(itemId);

                    console.log({customerMatrix, itemDetails});

                    //Zip,Equipment Category,Revenue Stream,HUL Manufacturer
                    // Zip Search
                    let dataMatrix = customerMatrix.filter(element => element.zipCode == zipCode && element.equipmentCategory == itemDetails.equipmentCategory && element.revenueStream == itemDetails.revenueStream);

                    let customerMatrixObject;
                    if (!!itemDetails.manufacturer)
                        customerMatrixObject = dataMatrix.find(element => element.manufacturer == itemDetails.manufacturer);

                    console.log("customerMatrixObject", customerMatrixObject);

                    if (!isEmpty(customerMatrixObject)) {
                        let salesReps = customerMatrixObject.salesReps;
                        currentRecord.setCurrentSublistValue({
                            sublistId, fieldId: "custcol_sna_sales_rep", value: getSalesRep(salesReps)
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId, fieldId: "custcol_sna_sales_rep_matrix", value: customerMatrixObject.id
                        });

                        if (itemDetails.eligibleForCommission) {
                            currentRecord.setCurrentSublistValue({
                                sublistId,
                                fieldId: "custcol_sna_hul_eligible_for_comm",
                                value: itemDetails.eligibleForCommission
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId,
                                fieldId: "custcol_sna_hul_comm_rate",
                                value: customerMatrixObject.commissionPlanRate
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId,
                                fieldId: "custcol_sna_hul_sales_rep_comm_type",
                                value: customerMatrixObject.commissionPlanType
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId,
                                fieldId: "custcol_sna_commission_plan",
                                value: customerMatrixObject.commissionPlan
                            });
                        }

                        let amount = Number(currentRecord.getCurrentSublistValue({sublistId, fieldId: "amount"}));
                        let costEstimate = Number(currentRecord.getCurrentSublistValue({
                            sublistId, fieldId: "costestimate"
                        }));

                        if (customerMatrixObject.commissionPlanType == COMMISSION_TYPE.GROSS_MARGIN) {
                            let grossProfit = amount - costEstimate;
                            let commissionAmount = grossProfit * customerMatrixObject.commissionPlanRate / 100;
                            currentRecord.setCurrentSublistValue({
                                sublistId, fieldId: "custcol_sna_commission_amount", value: commissionAmount
                            });
                        } else if (customerMatrixObject.commissionPlanType == COMMISSION_TYPE.REVENUE) {
                            let commissionAmount = amount * customerMatrixObject.commissionPlanRate / 100;
                            currentRecord.setCurrentSublistValue({
                                sublistId, fieldId: "custcol_sna_commission_amount", value: commissionAmount
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
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

    return {pageInit, fieldChanged, postSourcing};
});

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This UserEvent script updates Sales Reps on item lines from Sales Order
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/09/22                        Vishal Pitale          Initial version
 */

define(['N/search', 'N/record'], (search, record) => {

    const COMMISSION_TYPE = {
        GROSS_MARGIN: 1,
        REVENUE: 2
    }

    let zipCode;
    let customerMatrix = [];
    let revenueStreams = [];
    let equipmentCategories = [];
    let itemListData = [];

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
            type: 'customrecord_sna_salesrep_matrix_mapping',
            filters: [
                {name: 'custrecord_salesrep_mapping_customer', operator: 'anyof', values: customerId},
                {name: 'isinactive', operator: 'is', values: false},
            ],
            columns: [
                search.createColumn({name: 'custrecord_salesrep_mapping_customer', label: 'Customer'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_state', label: 'State'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_county', label: 'County'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_zipcode', label: 'Zip Code'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_equipment', label: 'Equipment Category'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_rev_stream', label: 'Revenue Stream'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_manufacturer', label: 'HUL Manufacturer'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_sales_reps', label: 'Sales Rep(s)'}),
                search.createColumn({name: 'custrecord_salesrep_mapping_override', label: 'Override Sales Rep Matrix'}),
                search.createColumn({
                    name: 'custrecord_sna_hul_sales_rep_comm_plan_2', label: 'Sales Rep Commission Plan'
                }),
                search.createColumn({
                    name: 'custrecord_sna_hul_comm_rate',
                    join: 'CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2',
                    label: 'Commission Rate'
                }),
                search.createColumn({
                    name: 'custrecord_sna_hul_comm_type',
                    join: 'CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2',
                    label: 'Commission Type'
                })
            ]
        }).run().each(result => {
            response.push({
                id: result.id,
                customer: result.getValue('custrecord_salesrep_mapping_customer'),
                state: result.getValue('custrecord_salesrep_mapping_state'),
                county: result.getValue('custrecord_salesrep_mapping_county'),
                zipCode: result.getValue('custrecord_salesrep_mapping_zipcode'),
                equipmentCategory: result.getValue('custrecord_salesrep_mapping_equipment'),
                revenueStream: result.getValue('custrecord_salesrep_mapping_rev_stream'),
                manufacturer: result.getValue('custrecord_salesrep_mapping_manufacturer'),
                salesReps: result.getValue('custrecord_salesrep_mapping_sales_reps').split(','),
                commissionPlan: result.getValue('custrecord_sna_hul_sales_rep_comm_plan_2'),
                commissionPlanRate: result.getValue({
                    name: 'custrecord_sna_hul_comm_rate', join: 'CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2'
                }).replace('%', ''),
                commissionPlanType: result.getValue({
                    name: 'custrecord_sna_hul_comm_type', join: 'CUSTRECORD_SNA_HUL_SALES_REP_COMM_PLAN_2'
                }),
            });
            return true;
        });
        return response;
    }

    const getRevenueStreams = () => {
        let response = [];
        search.create({
            type: 'customrecord_cseg_sna_revenue_st',
            filters: [{name: 'isinactive', operator: 'is', values: 'F'}],
            columns: [
                search.createColumn({name: 'name', label: 'Name'}),
                search.createColumn({name: 'parent', label: 'Parent'})
            ]
        }).run().each(function (result) {
            response.push({id: result.id, parent: Number(result.getValue('parent'))});
            return true;
        });

        for (let i = 0; i < response.length; i++) {
            let element = response[i];
            if (!!element.parent) {
                let flag = true;
                let iterator = 0;
                let parent = element.parent;
                do {
                    let obj = response.find(e => e.id == parent);
                    iterator++;
                    if (!!obj.parent) {
                        element['parent' + iterator] = Number(obj.parent);
                        parent = obj.parent;
                    } else flag = false;
                } while (flag)
            }
        }
        return response;
    }

    const getEquipmentCategory = () => {
        let response = [];

        search.create({
            type: 'customrecord_cseg_sna_hul_eq_seg',
            filters: [['isinactive', 'is', 'F']],
            columns: [
                search.createColumn({name: 'name', label: 'Name'}),
                search.createColumn({name: 'parent', label: 'Parent'})
            ]
        }).run().each(function (result) {
            response.push({
                id: result.id, name: result.getValue('name'), parent: result.getValue('parent')
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

    const getItemDetails = (newRec) => {

        let itemList = new Array();
        let itemLineCount = newRec.getLineCount({sublistId: 'item'});
        log.audit('itemLineCount', itemLineCount);

        // Traversing through the list to update the Item Detail List.
        for (let loop1 = 0; loop1 < itemLineCount; loop1++) {
            let itemId = newRec.getSublistValue({sublistId: 'item', fieldId: 'item', line: loop1});
            itemList[loop1] = itemId;
        }
        log.audit('itemList', itemList);

        var itemSearch = search.create({
            type: search.Type.ITEM,
            filters: [['internalid', 'anyof', itemList]],
            columns: [search.createColumn({name: 'itemid', sort: search.Sort.ASC}),
                'cseg_sna_hul_eq_seg', 'cseg_sna_revenue_st', 'cseg_hul_mfg', 'custitem_sna_hul_eligible_for_comm']
        }).run().getRange(0, 999);
        log.audit('itemSearch', itemSearch);

        // Traversing through the search to populate the itemListData array.
        for (let loop1 = 0; loop1 < itemSearch.length; loop1++) {
            let itemId = itemSearch[loop1].id;
            let equipmentCategory = itemSearch[loop1].getValue({name: 'cseg_sna_hul_eq_seg'});
            let revenueStream = itemSearch[loop1].getValue({name: 'cseg_sna_revenue_st'});
            let manufacturer = itemSearch[loop1].getValue({name: 'cseg_hul_mfg'});
            let eligibleForCommission = itemSearch[loop1].getValue({name: 'custitem_sna_hul_eligible_for_comm'});

            itemListData.push({
                'itemId': itemId,
                'equipmentCategory': equipmentCategory,
                'revenueStream': revenueStream,
                'manufacturer': manufacturer,
                'eligibleForCommission': eligibleForCommission,
            });
        }
    }

    const getSalesRep = (salesReps) => {
        let salesRep;
        search.create({
            type: search.Type.EMPLOYEE,
            filters: [{name: 'internalid', operator: 'anyof', values: salesReps}],
            columns: [search.createColumn({name: 'custentity_sna_sales_rep_tran_assignedon', sort: search.Sort.ASC})]
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
                {name: 'internalid', operator: 'anyof', values: customer}
            ],
            columns: [
                search.createColumn({name: 'addressinternalid', join: 'Address', label: 'Address Internal ID'}),
                search.createColumn({name: 'zipcode', join: 'Address', label: 'Zip Code'})
            ]
        }).run().each(function (result) {
            let addressInternalId = result.getValue({name: 'addressinternalid', join: 'Address'});
            if (addressInternalId == addressId)
                zipCode = result.getValue({name: 'zipcode', join: 'Address'});
            return true;
        });
        return zipCode;
    }


    /**
     * Function used to get the data
     * @param {Record} scriptContext.newRecord - New record
     */
    const updateSalesRepAndCommissionPlan = (currentRecord) => {

        var itemLineCount = currentRecord.getLineCount({sublistId: 'item'});

        for (let loop1 = 0; loop1 < itemLineCount; loop1++) {
            let itemId = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: loop1});
            let equipmentCategory = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'cseg_sna_hul_eq_seg',
                line: loop1
            }) || currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_equipment_category',
                line: loop1
            });
            let revenueStream = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'cseg_sna_revenue_st',
                line: loop1
            });
            let manufacturer = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'cseg_hul_mfg', line: loop1});
            let overrideCommission = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_override_commission',
                line: loop1
            });
            // equipmentCategory = 9;
log.audit('itemId', itemId);
log.audit('!!itemId', !!itemId);
log.audit('equipmentCategory', equipmentCategory);
log.audit('!!equipmentCategory', !!equipmentCategory);
log.audit('revenueStream', revenueStream);
log.audit('!!revenueStream', !!revenueStream);
log.audit('overrideCommission', overrideCommission);
log.audit('!overrideCommission', !overrideCommission);
log.audit('itemListData', itemListData);

            if (!!itemId /*&& !!equipmentCategory && !!revenueStream*/ && !overrideCommission) {
                let itemDetails = itemListData.find(element => element.itemId == itemId);
                log.audit('Inside Loop line:' + loop1);
                // Traversing through the array to get the item data.
                /*for(let loop2 = 0; loop2 < itemListData.length; loop2++) {
                    var arrItemId = itemListData[loop2].itemId;

                    if(itemId == arrItemId) {
                        itemDetails.equipmentCategory = itemListData[loop2].equipmentCategory;
                        itemDetails.revenueStream = itemListData[loop2].revenueStream;
                        itemDetails.manufacturer = itemListData[loop2].manufacturer;
                        itemDetails.eligibleForCommission = itemListData[loop2].eligibleForCommission;
                    }
                }*/
                log.audit('customerMatrix', customerMatrix);
                log.audit('itemDetails line:' + loop1, itemDetails);

                let equipmentCategoryData = new Array(), revenueStreamData = new Array();

                if(!isEmpty(equipmentCategory))
                    equipmentCategoryData = equipmentCategories.find(element => Number(element.id) == Number(equipmentCategory));

                if(!isEmpty(revenueStream))
                    revenueStreamData = revenueStreams.find(element => Number(element.id) == Number(revenueStream));

                let shipAddressList = currentRecord.getValue({fieldId: 'shipaddresslist'});
                let shipAddress = currentRecord.getValue({fieldId: 'shipaddress'});
                if (!!shipAddressList)
                    zipCode = customerAddress(currentRecord.getValue({fieldId: 'entity'}), shipAddressList);
                else zipCode = currentRecord.getValue({fieldId: 'shipzip'});

                let zipCodes = [];

                if (isEmpty(zipCode)) {
                    let numbers = [];
                    let addressArray = shipAddress.replace(/\n/g, ' ').replace(/\r/g, ' ').split(' ');

                    addressArray.forEach(element => {
                        let matches = element.match(/\d+/g);
                        if (!!matches && matches.length != 0 && element.length > 3) {
                            numbers.push(element);
                            zipCodes.push(Number(element));
                        }
                    })
                }

                log.audit('revenueStreamData', revenueStreamData);
                log.audit('equipmentCategoryData', equipmentCategoryData);
                log.audit('zipCode', zipCode);
                log.audit('zipCode', zipCode.split('-'));
                log.audit('zipCode', zipCode.split('-')[0]);
                //Zip,Equipment Category,Revenue Stream,HUL Manufacturer
                // Zip Search
                let dataMatrix = [];


                // if (!isEmpty(zipCode))
                //     dataMatrix = customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) &&
                //         (Number(element.equipmentCategory) == Number(equipmentCategoryData.id) || Number(element.equipmentCategory) == Number(equipmentCategoryData.top)) &&
                //         // (Number(element.revenueStream) == Number(revenueStreamData.id) || Number(element.revenueStream) == Number(revenueStreamData.parent))
                //         ([Number(revenueStreamData.parent), Number(revenueStreamData.parent1), Number(revenueStreamData.parent2), Number(revenueStreamData.parent3), Number(revenueStreamData.parent4), Number(revenueStreamData.parent5)].includes(Number(element.revenueStream)))
                //     );
                // else {
                //     zipCodes.forEach(zipCode => {
                //         dataMatrix = dataMatrix.concat(customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) &&
                //             (Number(element.equipmentCategory) == Number(equipmentCategoryData.id) || Number(element.equipmentCategory) == Number(equipmentCategoryData.top)) &&
                //             // (Number(element.revenueStream) == Number(revenueStreamData.id) || Number(element.revenueStream) == Number(revenueStreamData.parent))
                //             ([Number(revenueStreamData.parent), Number(revenueStreamData.parent1), Number(revenueStreamData.parent2), Number(revenueStreamData.parent3), Number(revenueStreamData.parent4), Number(revenueStreamData.parent5)].includes(Number(element.revenueStream)))
                //         ));
                //     });
                // }

                // Adding the Child Filter for Revenue Stream.
                if (!isEmpty(zipCode))

                    if(!isEmpty(equipmentCategoryData) && !isEmpty(revenueStreamData)) {
                        dataMatrix = customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) &&
                            (Number(element.equipmentCategory) == Number(equipmentCategoryData.id) || Number(element.equipmentCategory) == Number(equipmentCategoryData.top)) &&
                            // (Number(element.revenueStream) == Number(revenueStreamData.id) || Number(element.revenueStream) == Number(revenueStreamData.parent))
                            ([Number(revenueStreamData.parent), Number(revenueStreamData.parent1), Number(revenueStreamData.parent2), Number(revenueStreamData.parent3), Number(revenueStreamData.parent4), Number(revenueStreamData.parent5), Number(revenueStreamData.id)].includes(Number(element.revenueStream))) );
                    }

                    if(!isEmpty(equipmentCategoryData) && isEmpty(revenueStreamData)) {
                        dataMatrix = customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) && (Number(element.revenueStream) == '') &&
                            (Number(element.equipmentCategory) == Number(equipmentCategoryData.id) || Number(element.equipmentCategory) == Number(equipmentCategoryData.top)) );
                    }

                    if(isEmpty(equipmentCategoryData) && !isEmpty(revenueStreamData)) {
                        dataMatrix = customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) && (Number(element.equipmentCategory) == '') &&
                            ([Number(revenueStreamData.parent), Number(revenueStreamData.parent1), Number(revenueStreamData.parent2), Number(revenueStreamData.parent3), Number(revenueStreamData.parent4), Number(revenueStreamData.parent5), Number(revenueStreamData.id)].includes(Number(element.revenueStream))) );
                    }

                    if(isEmpty(equipmentCategoryData) && isEmpty(revenueStreamData)) {
                        dataMatrix = customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) &&
                            (Number(element.equipmentCategory) == '') &&(Number(element.revenueStream) == ''));
                    }

                else {
                    zipCodes.forEach(zipCode => {
                        if(!isEmpty(equipmentCategoryData) && !isEmpty(revenueStreamData)) {
                            dataMatrix = dataMatrix.concat(customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) &&
                                (Number(element.equipmentCategory) == Number(equipmentCategoryData.id) || Number(element.equipmentCategory) == Number(equipmentCategoryData.top)) &&
                                // (Number(element.revenueStream) == Number(revenueStreamData.id) || Number(element.revenueStream) == Number(revenueStreamData.parent))
                                ([Number(revenueStreamData.parent), Number(revenueStreamData.parent1), Number(revenueStreamData.parent2), Number(revenueStreamData.parent3), Number(revenueStreamData.parent4), Number(revenueStreamData.parent5), Number(revenueStreamData.id)].includes(Number(element.revenueStream)))
                            ));
                        }

                        if(!isEmpty(equipmentCategoryData) && isEmpty(revenueStreamData)) {
                            dataMatrix = dataMatrix.concat(customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) && (Number(element.revenueStream) == '') &&
                                (Number(element.equipmentCategory) == Number(equipmentCategoryData.id) || Number(element.equipmentCategory) == Number(equipmentCategoryData.top))));
                        }

                        if(isEmpty(equipmentCategoryData) && !isEmpty(revenueStreamData)) {
                            dataMatrix = dataMatrix.concat(customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) && (Number(element.equipmentCategory) == '') &&
                                ([Number(revenueStreamData.parent), Number(revenueStreamData.parent1), Number(revenueStreamData.parent2), Number(revenueStreamData.parent3), Number(revenueStreamData.parent4), Number(revenueStreamData.parent5), Number(revenueStreamData.id)].includes(Number(element.revenueStream)))
                            ));
                        }

                        if(isEmpty(equipmentCategoryData) && isEmpty(revenueStreamData)) {
                            dataMatrix = dataMatrix.concat(customerMatrix.filter(element => (element.zipCode == zipCode || element.zipCode == zipCode.split('-')[0]) &&
                                (Number(element.equipmentCategory) == '') &&(Number(element.revenueStream) == '') ));
                        }
                    });
                }

                log.audit('dataMatrix', dataMatrix);

                let customerMatrixObject;

                if (dataMatrix.length == 1)
                    customerMatrixObject = dataMatrix[0];

                if (!isEmpty(manufacturer))
                    customerMatrixObject = dataMatrix.find(element => element.manufacturer == manufacturer);

                if (isEmpty(customerMatrixObject)) customerMatrixObject = dataMatrix[0];
                log.audit('dataMatrix after Manufacturer', dataMatrix);

                if (dataMatrix.length > 1) {
                    let dataMatrixFilterByEquip = customerMatrix.filter(element => (Number(element.equipmentCategory) == Number(equipmentCategoryData.id)));

                    if (dataMatrixFilterByEquip.length == 1) customerMatrixObject = dataMatrixFilterByEquip[0];
                    else {
                        let dataMatrixFilterByCat = customerMatrix.filter(element => (Number(element.revenueStream) == Number(revenueStreamData.id)));
                        if (dataMatrixFilterByCat.length == 1) customerMatrixObject = dataMatrixFilterByCat[0];
                    }
                }

                log.audit('customerMatrixObject', customerMatrixObject);

                if (!isEmpty(customerMatrixObject)) {
                    let salesReps = customerMatrixObject.salesReps;
                    let salesRep = getSalesRep(salesReps);
                    log.audit('salesRep', salesRep);
                    currentRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_sales_rep',
                        value: salesRep,
                        line: loop1
                    });
                    currentRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_sales_rep_matrix',
                        value: customerMatrixObject.id,
                        line: loop1
                    });

                    if (itemDetails.eligibleForCommission) {
                        currentRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_sna_hul_eligible_for_comm',
                            value: itemDetails.eligibleForCommission,
                            line: loop1
                        });
                        currentRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_sna_hul_comm_rate',
                            value: customerMatrixObject.commissionPlanRate,
                            line: loop1
                        });
                        currentRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_sna_hul_sales_rep_comm_type',
                            value: customerMatrixObject.commissionPlanType,
                            line: loop1
                        });
                        currentRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_sna_commission_plan',
                            value: customerMatrixObject.commissionPlan,
                            line: loop1
                        });


                        let amount = Number(currentRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: loop1
                        }));
                        let costEstimate = Number(currentRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_hul_so_commissionable_bv',
                                line: loop1
                            })) ||
                            Number(currentRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'costestimate',
                                line: loop1
                            }));

                        if (customerMatrixObject.commissionPlanType == COMMISSION_TYPE.GROSS_MARGIN) {
                            let grossProfit = amount - costEstimate;
                            let commissionAmount = grossProfit * customerMatrixObject.commissionPlanRate / 100;
                            currentRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_commission_amount',
                                value: commissionAmount,
                                line: loop1
                            });
                        } else if (customerMatrixObject.commissionPlanType == COMMISSION_TYPE.REVENUE) {
                            let commissionAmount = amount * customerMatrixObject.commissionPlanRate / 100;
                            currentRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_commission_amount',
                                value: commissionAmount,
                                line: loop1
                            });
                        }
                    }
                }
            }
        }
    }


    /**
     * Check if value is empty (null, undefined, empty array, empty object)
     * @param {string|[]|{}} stValue
     * @returns {boolean} - Returns true if the input value is empty
     */
    const isEmpty = (stValue) => {
        var result, k;
        result = (
            (stValue === '' || stValue == null || stValue == undefined || stValue == 'undefined' || false) ||
            (stValue.constructor === Array && stValue.length === 0) ||
            (stValue.constructor === Object && (function (v) {
                for (k in v) {
                    return false
                }
                return true;
            })(stValue))
        );
        return result;
    }

    /**
     * Function used to get the data
     * @param {Record} scriptContext.newRecord - New record
     */
    const getSOData = (newRec) => {
        let customer = newRec.getValue({fieldId: 'entity'});
        customerMatrix = getCustomerMatrix(customer);
        revenueStreams = getRevenueStreams();
        equipmentCategories = getEquipmentCategory();
        getItemDetails(newRec);
    }

    /**
     * Defines the function definition that is executed before record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    const afterSubmit = (scriptContext) => {

        // Code to verify for Execution Context verify with Amol.
        // if(runtime.executionContext == 'USERINTERFACE' || runtime.executionContext == 'CSVIMPORT')

        // Executing the code only when on the CREATE and the EDIT Events.
        if (scriptContext.type === scriptContext.UserEventType.CREATE ||
            scriptContext.type === scriptContext.UserEventType.EDIT ||
            scriptContext.type === scriptContext.UserEventType.COPY) {

            try {
                let newRec = record.load({ type: scriptContext.newRecord.type, id: scriptContext.newRecord.id });
                getSOData(newRec);

                // Executing the code only when the Customer Matrix has values.
                if (customerMatrix.length != 0) {
                    updateSalesRepAndCommissionPlan(newRec);
                    let saveSO = newRec.save({ ignoreMandatoryFields: true });
                }
            } catch (e) {
                log.error('Error', e);
            }
        }
    }

    return {afterSubmit};
});
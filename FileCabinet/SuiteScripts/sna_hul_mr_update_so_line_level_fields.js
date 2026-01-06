/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Map/Reduce script updates Sales Order Line Level fields
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/06/14                           Care Parba          Initial version
 *
 */
define(["N/runtime", "N/search", "N/record"], (runtime, search, record) => {

    const parseJSON = (data) => {
        if (typeof data == "string") data = JSON.parse(data);
        return data;
    }

    const getInputData = (inputContext) => {
        const LOG_TITLE = "getInputData";
        let stSavedSearchId = runtime.getCurrentScript().getParameter({name: "custscript_sna_saved_search"});

        log.debug({title: LOG_TITLE, details: "===========START==========="});
        log.debug({
            title: LOG_TITLE, details: {stSavedSearchId}
        });

        if (!isEmpty(stSavedSearchId)) {
            log.debug({title: LOG_TITLE, details: "===========END==========="});
            return search.load({id: stSavedSearchId});
        }
    }

    const map = (mapContext) => {
        const LOG_TITLE = "map";
        let bLocation = runtime.getCurrentScript().getParameter({name: "custscript_sna_location"});
        let bRevStream = runtime.getCurrentScript().getParameter({name: "custscript_sna_revenue_stream"});
        let bNxcSiteAsset = runtime.getCurrentScript().getParameter({name: "custscript_sna_ns_asset"});
        let bNxcEquipAsset = runtime.getCurrentScript().getParameter({name: "custscript_sna_nxc_eq_asset"});
        let bDepartment = runtime.getCurrentScript().getParameter({name: "custscript_sna_department"});
        let bNxcServiceTask = runtime.getCurrentScript().getParameter({name: "custscript_sna_nxc_srvc_task"});
        let bNxcServiceCase = runtime.getCurrentScript().getParameter({name: "custscript_sna_nxc_srvc_case"});
        let bEquipmentObject = runtime.getCurrentScript().getParameter({name: "custscript_sna_equip_object"});
        let bEmptyColumns = runtime.getCurrentScript().getParameter({name: "custscript_sna_empty_columns"});

        log.debug({title: LOG_TITLE, details: "===========START==========="});
        log.debug({
            title: LOG_TITLE, details: {bLocation, bRevStream, bNxcSiteAsset, bNxcEquipAsset, bDepartment, bNxcServiceTask, bNxcServiceCase, bEquipmentObject, bEmptyColumns}
        });

        let objParseValues = parseJSON(mapContext.value);
        try{
            if(bLocation || bRevStream || bNxcSiteAsset || bNxcEquipAsset || bDepartment || bNxcServiceTask || bNxcServiceCase || bEquipmentObject) {
                let stSalesOrderId = objParseValues.values['GROUP(internalid)'].value;
                let stRecordType = objParseValues.values['GROUP(type)'].text;
                let stMainRecType;
                log.debug({
                    title: LOG_TITLE, details: `objParseValues = ${JSON.stringify(objParseValues)}`
                });
                log.debug({
                    title: LOG_TITLE, details: `stSalesOrderId = ${stSalesOrderId}`
                });

                if (stRecordType === 'Invoice') {
                    stMainRecType = search.Type.INVOICE;
                } else if (stRecordType === 'Sales Order') {
                    stMainRecType = search.Type.SALES_ORDER;
                }

                if (stMainRecType){
                    let recSalesOrder = record.load({
                        type: stMainRecType,
                        id: stSalesOrderId
                    });

                    let stLocation = recSalesOrder.getValue({fieldId: 'location'});
                    let stRevStream = recSalesOrder.getValue({fieldId: 'cseg_sna_revenue_st'});
                    let stNxcSiteAsset = recSalesOrder.getValue({fieldId: 'custbody_nx_asset'});
                    let stNxcEquipmentAsset = recSalesOrder.getValue({fieldId: 'custbody_sna_hul_nxc_eq_asset'});
                    let stDepartment = recSalesOrder.getValue({fieldId: 'department'});
                    let stNxcServiceTask = recSalesOrder.getValue({fieldId: 'custbody_nx_task'});
                    let stNxcServiceCase = recSalesOrder.getValue({fieldId: 'custbody_nx_case'});
                    let stEquipmentObject = recSalesOrder.getValue({fieldId: 'custbody_sna_equipment_object'});
                    let objValues = {};

                    if (bLocation) {
                        objValues.location = stLocation;
                    }
                    if (bRevStream) {
                        objValues.cseg_sna_revenue_st = stRevStream;
                    }
                    if (bNxcSiteAsset) {
                        objValues.custcol_nx_asset = stNxcSiteAsset;
                    }
                    if (bNxcEquipAsset) {
                        objValues.custcol_nxc_equip_asset = stNxcEquipmentAsset;
                    }
                    if (bDepartment) {
                        objValues.department = stDepartment;
                    }
                    if (bNxcServiceTask) {
                        objValues.custcol_nx_task = stNxcServiceTask;
                    }
                    if (bNxcServiceCase) {
                        objValues.custcol_nxc_case = stNxcServiceCase;
                    }
                    if (bEquipmentObject) {
                        objValues.custcol_sna_hul_fleet_no = stEquipmentObject;
                    }

                    log.debug({
                        title: LOG_TITLE, details: `objValues = ${JSON.stringify(objValues)}`
                    });

                    let itemLineCount = recSalesOrder.getLineCount({sublistId: 'item'});

                    log.debug({
                        title: LOG_TITLE, details: `itemLineCount = ${itemLineCount}`
                    });

                    for (let i = 0; i < itemLineCount; i++) {
                        for (let stFieldId in objValues) {
                            if (!isEmpty(objValues[stFieldId])) {
                                if (bEmptyColumns) {
                                    let stLineFieldValue = recSalesOrder.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: stFieldId,
                                        line: i
                                    });
                                    if (isEmpty(stLineFieldValue)) {
                                        recSalesOrder.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: stFieldId,
                                            line: i,
                                            value: objValues[stFieldId]
                                        });
                                    }
                                } else {
                                    recSalesOrder.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: stFieldId,
                                        line: i,
                                        value: objValues[stFieldId]
                                    });
                                }
                            }
                        }
                    }

                    recSalesOrder.save();
                }
            }

        } catch (error) {
            log.error({title: "Map error", details: error});
        }

        log.debug({title: LOG_TITLE, details: "===========END==========="});
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

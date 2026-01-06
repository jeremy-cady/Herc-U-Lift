/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Map/Reduce script recalculates Line Rate and recalculates Line Rate based on the Line's selected Revenue Stream
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/08/28                           Care Parba          Initial version
 *
 */
define(["N/runtime", "N/search", "N/record", "./sna_hul_ue_pm_pricing_matrix", './sna_hul_mod_sales_tax.js'], (runtime, search, record, pm_lib, mod_tax) => {

    const parseJSON = (data) => {
        if (typeof data == "string") data = JSON.parse(data);
        return data;
    }

    const PROCESS_STATUS = {
        'completed': 2,
        'inProgress': 3,
        'failed': 1
    };

    const NOT_TAXABLE = -7;

    var TEMPITEMCAT = '';
    var allieditemcat = '';
    var rackingitemcat = '';
    var storageitemcat = '';
    var subletitemcat = '';
    var RENTALCHARGE = '';
    var RENTALEQUIPMENT = '';
    var itemservicecodetype = '';
    var PLANNED_MAINTENANCE = '';

    const getInputData = (inputContext) => {
        const LOG_TITLE = "getInputData";
        let stSOId = runtime.getCurrentScript().getParameter({name: "custscript_sna_hul_so_id"});
        log.debug({title: LOG_TITLE, details: {stSOId}});

        log.debug({title: LOG_TITLE, details: "===========START==========="});

        let objSOSearch = search.create({
            type: "salesorder",
            filters: [
                ["type","anyof","SalesOrd"],
                "AND",
                ["mainline","is","T"],
                "AND",
                ["internalid","anyof",stSOId]
            ],
            columns: [
                search.createColumn({name: "internalid", label: "Internal ID"})
            ]
        });
        log.debug({title: LOG_TITLE, details: "===========END==========="});
        return objSOSearch;
    }

    const reduce = (reduceContext) => {
        const LOG_TITLE = "reduce";
        TEMPITEMCAT = runtime.getCurrentScript().getParameter({name: 'custscript_sna_hul_tempitemcat'});
        allieditemcat = runtime.getCurrentScript().getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
        rackingitemcat = runtime.getCurrentScript().getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
        storageitemcat = runtime.getCurrentScript().getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});
        subletitemcat = runtime.getCurrentScript().getParameter({name: 'custscript_sna_itemcat_sublet'});
        RENTALCHARGE = runtime.getCurrentScript().getParameter({name: 'custscript_sna_rental_serviceitem'});
        RENTALEQUIPMENT = runtime.getCurrentScript().getParameter({name: 'custscript_sna_rental_equipment'});
        itemservicecodetype = runtime.getCurrentScript().getParameter({name: 'custscript_sna_servicecodetype_item'});
        PLANNED_MAINTENANCE = runtime.getCurrentScript().getParameter({name: 'custscript_mr_planned_maintenance'});

        log.debug({title: LOG_TITLE, details: "===========START==========="});

        let stActionType = runtime.getCurrentScript().getParameter({name: "custscript_sna_hul_action_type"});
        let stCustomRecId = runtime.getCurrentScript().getParameter({name: "custscript_sna_hul_customrec_id"});

        log.debug({title: LOG_TITLE, details: {stActionType}});
        log.debug({title: LOG_TITLE, details: {stCustomRecId}});

        let objParseValues = parseJSON(reduceContext.values[0]);
        log.debug({title: LOG_TITLE, details: `reduceContext: ${reduceContext}`});
        log.debug({title: LOG_TITLE, details: `objParseValues: ${JSON.stringify(objParseValues)}`});
        log.debug({title: LOG_TITLE, details: `objParseValues id: ${objParseValues.id}`});

        let objSalesOrderRec = record.load({
            type: record.Type.SALES_ORDER,
            id: objParseValues.id,
            isDynamic: true
        });

        let processedLineCount = 0;
        let soLineCount = objSalesOrderRec.getLineCount({sublistId: 'item'});
        let stRevenueStream, pricingGroup;

        try {
            // ** START PLANNED MAINTENANCE PRICING **
            let customer = objSalesOrderRec.getValue({fieldId: "entity"});
            let tranDate = pm_lib.getDate(objSalesOrderRec.getValue({fieldId: "trandate"}));
            let projectId = objSalesOrderRec.getValue({fieldId: "job"});
            let projectType = pm_lib.getProjectType(projectId);
            let addPlannedMaintenance = false;
            log.debug({title: "getProjectType", details: projectType});

            let projectTypeText = projectType.text;
            // if (!!projectTypeText && projectTypeText.includes("PM"))
            //     addPlannedMaintenance = true;

            // Fetch Revenue Stream and if It has Planned maintenance then add Planned Maintenance line.
            let revStreams = objSalesOrderRec.getValue({fieldId: 'cseg_sna_revenue_st'});

            if (isEmpty(revStreams)) {
                let nxtCase = objSalesOrderRec.getValue({fieldId: 'custbody_nx_case'});
              
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

                flatRate = search.lookupFields({
                    type: "customrecord_cseg_sna_revenue_st",
                    id: revStreams,
                    columns: "custrecord_sna_hul_flatrate"
                }).custrecord_sna_hul_flatrate;
            }

            let projectTypeValue = projectType.value;
            let soNxtSerTask = objSalesOrderRec.getValue({fieldId: 'custbody_nx_task'});
            log.debug({title: "projectType", details: projectTypeValue});
            log.debug({title: "soNxtSerTask", details: soNxtSerTask});
            log.debug({title: "revStreams", details: {revStreams, addPlannedMaintenance}});

            let lineCount = objSalesOrderRec.getLineCount({sublistId: "item"});

            let shippingAddress = objSalesOrderRec.getValue({fieldId: 'shipaddress'});
            let salesZone = pm_lib.getSalesZone(shippingAddress);
            log.debug({title: "salesZone", details: salesZone});

            for (let line = 0; line < lineCount && addPlannedMaintenance; line++) {
                let item = objSalesOrderRec.getSublistValue({sublistId: "item", fieldId: "item", line});
                if (item == PLANNED_MAINTENANCE) {
                    addPlannedMaintenance = false;
                    let rate = objSalesOrderRec.getSublistValue({sublistId: "item", fieldId: "rate", line});

                    if (!!rate) {
                        let responseRate = pm_lib.getDefaultPMRate();
                        log.debug({title: "Setting Response Rate", details: responseRate});

                        objSalesOrderRec.selectLine({sublistId: 'item', line: line});
                        objSalesOrderRec.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: responseRate});
                        objSalesOrderRec.commitLine({sublistId: 'item'});
                    }
                    break;
                }
            }
            log.debug({title: "addPlannedMaintenance", details: addPlannedMaintenance});

            if (addPlannedMaintenance) {
                objSalesOrderRec.selectNewLine({sublistId: 'item'});
                objSalesOrderRec.setCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    value: PLANNED_MAINTENANCE
                });
                objSalesOrderRec.setCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    value: pm_lib.getTotalServiceQuantity(objSalesOrderRec)
                });

                let nextServiceFields = ["custcol_sna_work_code", "custcol_sna_repair_code", "custcol_sna_group_code", "custcol_nxc_case", "custcol_nx_task", "custcol_nx_asset", "custcol_nxc_equip_asset", "custcol_sna_sales_description", "custcol_sna_so_service_code_type", "custcol_sna_hul_fleet_no"];

                nextServiceFields.forEach(fieldId => {
                    let value = objSalesOrderRec.getSublistValue({sublistId: "item", fieldId, line: lineCount - 1});
                    log.debug({title: fieldId + " value", details: value});
                    if (!!value)
                        objSalesOrderRec.setCurrentSublistValue({sublistId: "item", fieldId, value});
                });

                objSalesOrderRec.commitLine({sublistId: 'item'});
                lineCount++;
            }

            log.debug({title: "lineCount", details: lineCount});

            let pmObjs = {
                soNxtSerTask,
                revStreams,
                projectTypeValue,
                customer,
                tranDate,
                salesZone,
                flatRate
            }
            // ** END PLANNED MAINTENANCE PRICING **

            if (stActionType == 'recalculateRate') {
                for (let i = 0; i < soLineCount; i++) {
                    setPrice(objSalesOrderRec, i, pmObjs);
                    /*objSalesOrderRec.selectLine({sublistId: 'item', line: i});
                    log.debug({title: LOG_TITLE, details: {i}});
                    objSalesOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_hul_lock_rate',
                        value: false
                    });
                    objSalesOrderRec.commitLine({sublistId: 'item'});*/
                    /*objSalesOrderRec.selectLine({sublistId: 'item', line: i});
                    let revStream = objSalesOrderRec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'cseg_sna_revenue_st'
                    });

                    let equipPosting = objSalesOrderRec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'cseg_sna_hul_eq_seg'
                    });
                    let shippingAddress = objSalesOrderRec.getSubrecord({fieldId: 'shippingaddress'});
                    let pricingGroup = shippingAddress.getValue({fieldId: 'custrecord_sna_cpg_service'});

                    //Get Parent EquipPosting
                    if (!isEmpty(equipPosting)) {
                        let eqPostingSrch = search.lookupFields({
                            type: 'customrecord_cseg_sna_hul_eq_seg',
                            id: equipPosting,
                            columns: ['parent']
                        });

                        equipPosting = (!isEmpty(eqPostingSrch.parent) ? eqPostingSrch.parent[0].value : equipPosting);
                        log.debug({
                            title: LOG_TITLE,
                            details: `inside if(!isEmpty(equipPosting)) --> equipPosting: ${equipPosting}`
                        });
                    }
                    log.debug({title: LOG_TITLE, details: {equipPosting}});
                    log.debug({title: LOG_TITLE, details: {pricingGroup}});
                    log.debug({title: LOG_TITLE, details: {revStream}});

                    let unitPrice = _getResourcePriceTable(pricingGroup, revStream, equipPosting);
                    log.debug({title: LOG_TITLE, details: {unitPrice}});

                    let dollarDisc = objSalesOrderRec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_hul_dollar_disc'
                    });
                    let percDisc = objSalesOrderRec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_hul_perc_disc'
                    });
                    log.debug({title: LOG_TITLE, details: {dollarDisc}});
                    log.debug({title: LOG_TITLE, details: {percDisc}});

                    let finalPrice = unitPrice - (forceFloat(dollarDisc)) - (unitPrice * forceFloat(percDisc / 100));
                    log.debug({title: LOG_TITLE, details: {finalPrice}});

                    objSalesOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        value: -1
                    });
                    objSalesOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: finalPrice
                    });
                    objSalesOrderRec.commitLine({sublistId: 'item'});*/
                    processedLineCount++;

                    let moduloLines = processedLineCount % 5;
                    log.debug({title: LOG_TITLE, details: {moduloLines}});

                    if (moduloLines === 0) {
                        log.debug({title: LOG_TITLE, details: `inside if(moduloLines === 0)`});

                        record.submitFields({
                            type: 'customrecord_sna_hul_so_lines_processed',
                            id: stCustomRecId,
                            values: {'custrecord_sna_hul_so_lines_processed': processedLineCount}
                        });
                    }
                }

                objSalesOrderRec.save();
                record.submitFields({
                    type: 'customrecord_sna_hul_so_lines_processed',
                    id: stCustomRecId,
                    values: {
                        'custrecord_sna_hul_so_lines_processed': processedLineCount,
                        'custrecord_sna_hul_process_status': PROCESS_STATUS.completed
                    }
                });
            } else if (stActionType == 'updateRevStreamRecalcRate') {
                stRevenueStream = objSalesOrderRec.getValue({fieldId: 'cseg_sna_revenue_st'});
                //let revStream = stRevenueStream;
                //let finalRate = 0;

                // aduldulao 11/19/24 - move Internal tax here
                // var internal = false;
                let internal = mod_tax.updateLines(objSalesOrderRec, true);
                objSalesOrderRec.setValue({fieldId: 'custbody_ava_disable_tax_calculation', value: false});

                for (let i = 0; i < soLineCount; i++) {
                    objSalesOrderRec.selectLine({sublistId: 'item', line: i});
                    objSalesOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'cseg_sna_revenue_st',
                        value: stRevenueStream
                    });

                    if (internal) {
                        log.debug({ title: 'internal tax', details: 'setting line ' + i + ' to internal' });
                        objSalesOrderRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            value: NOT_TAXABLE,
                            forceSyncSourcing: true,
                        });
                        objSalesOrderRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ava_taxamount',
                            value: 0,
                            forceSyncSourcing: true,
                        });
                    }
                    objSalesOrderRec.commitLine({sublistId: 'item'});

                    setPrice(objSalesOrderRec, i, pmObjs);

                    processedLineCount++;

                    let moduloLines = processedLineCount % 5;
                    log.debug({title: LOG_TITLE, details: {moduloLines}});

                    if (moduloLines === 0) {
                        log.debug({title: LOG_TITLE, details: `inside if(moduloLines === 0)`});

                        record.submitFields({
                            type: 'customrecord_sna_hul_so_lines_processed',
                            id: stCustomRecId,
                            values: {'custrecord_sna_hul_so_lines_processed': processedLineCount}
                        });
                    }
                }

                if (internal) {
                    objSalesOrderRec.setValue({fieldId: 'taxamountoverride', value: 0});
                    objSalesOrderRec.setValue({fieldId: 'custbody_ava_disable_tax_calculation', value: true});
                }

                objSalesOrderRec.save();
                record.submitFields({
                    type: 'customrecord_sna_hul_so_lines_processed',
                    id: stCustomRecId,
                    values: {
                        'custrecord_sna_hul_so_lines_processed': processedLineCount,
                        'custrecord_sna_hul_process_status': PROCESS_STATUS.completed
                    }
                });
            }
        } catch (err) {
            log.error({title: LOG_TITLE, details: {err} });
            record.submitFields({
                type: 'customrecord_sna_hul_so_lines_processed',
                id: stCustomRecId,
                values: { 'custrecord_sna_hul_process_status': PROCESS_STATUS.failed }
            });
        }

        log.debug({title: LOG_TITLE, details: runtime.getCurrentScript().getRemainingUsage()});

        log.debug({title: LOG_TITLE, details: "===========END==========="});
    }

    /*const summarize = (x) => {

        log.debug('Usage consumed', x.usage);
        log.debug('concurrency consumed', x.concurrency);
        log.debug('yields consumed', x.yields);

        x.reduceSummary.errors.iterator().each(function (key, error, executionNo){
            log.error({
                title: 'Reduce error for key: ' + key + ', execution no.  ' + executionNo,
                details: error
            });
            return true;
        });


    }*/

    function setPrice(rec, currentLine, pmObjs){
        var rectype = rec.type;
        rec.selectLine({ sublistId: 'item', line: currentLine });

        // ** START SERVICE PRICING FOR SO **
        if (rectype == record.Type.SALES_ORDER) {
            //Responsibility Center, Equipment Posting, Revenue Stream
            var resCenter = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'location'}); //Responsibility Center
            var equipPosting = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'cseg_sna_hul_eq_seg'}); //Equipment Posting
            var revStream = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st'});

            var overrideRate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual'}); //Override Rate
            var isLockRate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate'}); //Lock Rate


            log.debug('setPrice', 'validateLine | SERVICE PRICING FIELDS : resCenter = ' + resCenter + ' | equipPosting = ' + equipPosting + ' | revStream = ' + revStream + ' | overrideRate = ' + overrideRate + ' | isLockRate = ' + isLockRate);

            var shippingAddress = rec.getSubrecord({
                fieldId: 'shippingaddress'
            });

            var pricingGroup = shippingAddress.getValue({
                fieldId: 'custrecord_sna_cpg_service'
            });

            log.debug('setPrice', 'cpgService = ' + pricingGroup);

            var serviceCodeTypeLine = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_service_itemcode'
            });

            if (serviceCodeTypeLine == 2) {
                //Get Responsibility Code
                if (!isEmpty(resCenter)) {
                    var locSearch = search.lookupFields({
                        type: 'location',
                        id: resCenter,
                        columns: 'custrecord_sna_hul_res_cntr_code'
                    });

                    var resCenterCode = locSearch.custrecord_sna_hul_res_cntr_code;
                    log.debug('setPrice', 'resCenterCode = ' + resCenterCode);
                }

                //Get Parent EquipPosting
                if (!isEmpty(equipPosting)) {
                    var eqPostingSrch = search.lookupFields({
                        type: 'customrecord_cseg_sna_hul_eq_seg',
                        id: equipPosting,
                        columns: ['parent']
                    });

                    equipPosting = (!isEmpty(eqPostingSrch.parent) ? eqPostingSrch.parent[0].value : equipPosting);
                    log.debug('setPrice', 'validateLine | SERVICE PRICING equipPosting = ' + equipPosting);
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

                log.debug('setPrice', 'itemQty = ' + itemQty);
                log.debug('setPrice', 'actualQty = ' + actualQty);
                log.debug('setPrice', 'quotedQty = ' + quotedQty);
                log.debug('setPrice', 'qtyExcep = ' + qtyExcep);
                log.debug('setPrice', 'timeposted = ' + timeposted);

                if (!isEmpty(actualQty)) {
                    if (!isEmpty(quotedQty)) {
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
                    } else {
                        if (isEmpty(qtyExcep)) {
                            finalQty = actualQty;
                        } else {
                            finalQty = itemQty
                        }
                    }

                } else {
                    finalQty = itemQty;
                }

                log.debug('setPrice', 'finalQty = ' + finalQty);

                //Set Quantity
                rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: finalQty
                });

                if (!overrideRate) {
                    //Proceed if Override Rate = F or null AND if Lock Rate is = F

                    var unitPrice = _getResourcePriceTable(pricingGroup, revStream, equipPosting);
                    log.debug('setPrice', 'unitPrice = ' + unitPrice);

                    var dollarDisc = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_hul_dollar_disc'
                    });
                    var percDisc = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_hul_perc_disc'
                    });

                    var finalPrice = unitPrice - (forceFloat(dollarDisc)) - (unitPrice * forceFloat(percDisc / 100));

                    log.debug('setPrice', 'finalPrice = ' + finalPrice);

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

                    log.debug('setPrice', 'itemAmount = ' + itemAmount);
                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        value: itemAmount
                    });
                    //rec.commitLine({ sublistId: 'item' });
                    //log.debug('commitLine', 'commitLine');
                }
            }
        }
        // ** END SERVICE PRICING FOR SO **

        // ** START FULL MAINTENANCE ITEM **
        /*if (rectype == record.Type.SALES_ORDER) {
            var revStream = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'cseg_sna_revenue_st'});
            var manual = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual'});
            var lock = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate'});

            if (isEmpty(revStream)) {
                revStream = rec.getValue({fieldId: 'cseg_sna_revenue_st'});
            }

            log.debug('setPrice', 'isfullmaintenance revStream = ' + revStream + ' | ' + manual + ' | ' + lock);

            if (!isEmpty(revStream)) {
                if ((!manual || isEmpty(manual))) {
                    var srch = search.lookupFields({
                        type: 'customrecord_cseg_sna_revenue_st',
                        id: revStream,
                        columns: ['custrecord_sna_hul_full_maintenance']
                    });

                    var isfullmaintenance = (!isEmpty(srch.custrecord_sna_hul_full_maintenance) ? srch.custrecord_sna_hul_full_maintenance : false);

                    log.debug('setPrice', 'isfullmaintenance = ' + isfullmaintenance);

                    if (isfullmaintenance) {
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: 0});
                        rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'amount', value: 0});
                        //rec.commitLine({ sublistId: 'item' });
                        //log.debug('commitLine', 'commitLine');
                    }
                }
            }
        }*/
        // ** END FULL MAINTENANCE ITEM **

        // ** START PLANNED MAINTENANCE PRICING **
        if (rectype == record.Type.SALES_ORDER) {
            let taskId = rec.getCurrentSublistValue({
                sublistId: "item",
                fieldId: "custcol_nx_task"
            }) || pmObjs.soNxtSerTask;
            let item = rec.getCurrentSublistValue({sublistId: "item", fieldId: "item"});

            // let itemRecord = record.load({type: 'serviceitem', id: item});
            // let includeCheckbox = itemRecord.getValue({fieldId: "custitem_sna_hul_itemincludepmrate"});

            let equipmentType = rec.getCurrentSublistValue({
                sublistId: "item",
                fieldId: "cseg_sna_hul_eq_seg"
            });
            let objectNo = rec.getCurrentSublistValue({
                sublistId: "item",
                fieldId: "custcol_sna_object"
            }) || rec.getCurrentSublistValue({sublistId: "item", fieldId: "custcol_sna_hul_fleet_no"});

            // if (includeCheckbox == true) {
            if (pm_lib.checkPMServiceItem(item)) {
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
                log.debug({title: "serviceAction", details: pmObjs.revStreams});

                // Object No
                // let objectNo = caseDetails["custevent_nxc_case_assets.custrecord_sna_hul_nxcassetobject"];
                log.debug({title: "object No", details: objectNo});

                // Frequency
                let frequency = pmObjs.projectTypeValue;
                log.debug({title: "frequency", details: frequency});

                // Quantity
                let quantity = rec.getCurrentSublistValue({sublistId: "item", fieldId: "quantity"});

                // if (serviceAction != REVENUE_STREAMS.TIME_AND_MATERIAL_CPMTM) {

                log.debug({title: "pmObjs", details: pmObjs});

                let requestData = {
                    customer: pmObjs.customer,
                    tranDate: pmObjs.tranDate,
                    salesZone: !isEmpty(pmObjs.salesZone.id) ? pmObjs.salesZone.id : '',
                    zipCode: !isEmpty(pmObjs.salesZone.zipCode) ? pmObjs.salesZone.zipCode : '',
                    custPricingGrp: !isEmpty(pmObjs.salesZone.custPricingGrp) ? pmObjs.salesZone.custPricingGrp : '',
                    equipmentType,
                    serviceAction: pmObjs.revStreams,
                    objectNo,
                    frequency,
                    quantity
                };

                log.debug({title: "requestData ", details: requestData});

                let rate = pm_lib.getRate(requestData, pmObjs.salesZone);
                log.debug({title: "getRate rate ", details: rate});

                if (pmObjs.flatRate) {
                    // rec.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: rate / quantity});
                    rec.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: rate});
                    rec.setCurrentSublistValue({sublistId: "item", fieldId: "amount", value: rate});
                } else if (rate != 0)
                    rec.setCurrentSublistValue({sublistId: "item", fieldId: "rate", value: rate});

                // }
                // }
            }
        }
        // ** END PLANNED MAINTENANCE PRICING **

        // ** START TEMPORARY ITEM **
        if (rectype == record.Type.SALES_ORDER) {
            var tempitemcat = TEMPITEMCAT;

            var fields = '';

            var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
            var itmcatcust = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory'});
            var tempvendor = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor'});
            var vendoritmcode = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_hul_vendor_item_code'
            });
            var desc = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'description'});
            var qty = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'quantity'});
            var porate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'porate'});
            var estporate = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_hul_estimated_po_rate'
            });
            var rate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'rate'});
            var vendorname = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name'});
            var useexistingtemp = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_use_existing_temp'
            });

            if (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat || itmcatcust == subletitemcat) {
                log.debug('setPrice', 'tempItem = ' + tempitemcat);
                /*if (isEmpty(desc)) {
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
                    log.debug('setPrice', 'validateLine | tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname)

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

                if (!isEmpty(fields)) {
                    fields = fields.slice(0, -2); // remove last comma

                    alert('Enter missing sublist fields: ' + fields);
                    return false;
                }*/

                rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_hul_temp_porate',
                    value: forceFloat(porate)
                });
                //rec.commitLine({ sublistId: 'item' });
                //log.debug('commitLine', 'commitLine');
            }
        }
        // ** END TEMPORARY ITEM **

        // ** START ITEM PRICING **
        if (rectype == record.Type.SALES_ORDER) {
            var itmpricelevel = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_hul_item_pricelevel'
            });
            var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
            var genprodgrp = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_hul_gen_prodpost_grp'
            });
            var itmtype = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'itemtype'});
            var manual = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_amt_manual'});
            var lock = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_lock_rate'});
            var lineservicetype = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_service_itemcode'
            });
            var itmcat = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory'});

            if (!isEmpty(genprodgrp) || itm == RENTALCHARGE || itm == RENTALEQUIPMENT || (lineservicetype != itemservicecodetype && itmcat != subletitemcat)) {
            }
            else {
                if ((!manual || isEmpty(manual))) {
                    // run for all because field change for hidden fields does not work - hidden fields moved to SL page
                    //if (isEmpty(itmpricelevel)) {
                    setLocationMarkUp(rec, 'item', null);
                    setVendorPrice(rec, 'item', null);
                    setPriceLevel(rec, 'item', null);
                    setCumulativeMarkup(rec, 'item', null);
                    setNewCostUnit(rec, 'item', null);
                    setAmount(rec, 'item', null);
                    //rec.commitLine({ sublistId: 'item' });
                    //log.debug('commitLine', 'commitLine');
                    //}
                }
            }
        }
        // ** END ITEM PRICING **

        rec.commitLine({ sublistId: 'item' });
        log.debug('commitLine', 'commitLine');
    }

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
            log.debug('setLocationMarkUp | loc: ' + loc + ' | itmcat: ' + itmcat + ' | itm: ' + itm + ' | lineservicetype: ' + lineservicetype);

            if (!isEmpty(itm)) {
                var locmarkup = getLocationMarkup(itmcat, loc);
                if (!isEmpty(locmarkup[itmcat+'-'+loc])) {
                    finallocmarkup = locmarkup[itmcat+'-'+loc];
                }

                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_loc_markup', value: finallocmarkup, forceSyncSourcing: true});
                //log.debug({title: 'setLocationMarkUp', details: 'finallocmarkup: ' + finallocmarkup});
                log.debug('setLocationMarkUp | finallocmarkup: ' + finallocmarkup);
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
            log.debug('setLocationMarkUp | allloc: ' + allloc.toString() + ' | allitmcat: ' + allitmcat.toString());

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
                    log.debug('setLocationMarkUp | finallocmarkup: ' + finallocmarkup + ' | line: ' + i)
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
            log.debug('setVendorPrice | itm: ' + itm);

            if (!isEmpty(itm)) {
                var prices = getVendorPrice(itm);
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price', value: prices.listprice, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost', value: prices.itmpurchprice, forceSyncSourcing: true});
                //log.debug({title: 'setVendorPrice', details: 'listprice: ' + prices.listprice + ' | itmpurchprice: ' + prices.itmpurchprice});
                log.debug('setVendorPrice | listprice: ' + prices.listprice + ' | itmpurchprice: ' + prices.itmpurchprice);

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
            log.debug('setPriceLevel | prcinggroup: ' + prcinggroup + ' | itmcat: ' + itmcat + ' | itm: ' + itm + ' | lineservicetype: ' + lineservicetype)

            if (!isEmpty(itm)) {
                if (itmcat == TEMPITEMCAT || itmcat == allieditemcat || itmcat == rackingitemcat || itmcat == storageitemcat || itmcat == subletitemcat) {
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
                log.debug('setPriceLevel | finalpricelevel: ' + finalpricelevel);
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
            log.debug('setPriceLevel | allitmcat: ' + allitmcat.toString() + ' | prcinggroup: ' + prcinggroup + ' | itmlines: ' + itmlines);

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
                    log.debug('setPriceLevel | finalpricelevel: ' + finalpricelevel + ' | line: ' + i);
                }
            }
        }
    }

    /**
     * get customer pricing group from address subrecord
     * @param rec
     */
    function getPricingGrpAddress(rec) {
        var shipaddrSubrecord = rec.getSubrecord({fieldId: 'shippingaddress'});
        var prcinggroup = shipaddrSubrecord.getValue({fieldId: 'custrecord_sna_cpg_parts'});

        //log.debug({title: 'getPricingGrpAddress', details: 'prcinggroup: ' + prcinggroup});
        log.debug('getPricingGrpAddress | prcinggroup: ' + prcinggroup);

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
        log.debug('getCustPricingGrpAddress | entity: ' + entity + ' | addid: ' + addid);
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
            log.debug('getCustPricingGrpAddress | resaddressid: ' + resaddressid);

            if (resaddressid == addid) {
                cpg = result.getValue({name: 'custrecord_sna_cpg_parts', join: 'Address'});
                return false;
            }

            return true;
        });

        //log.debug({title: 'getCustPricingGrpAddress', details: 'cpg: ' + cpg});
        log.debug('getCustPricingGrpAddress | cpg: ' + cpg);
        return cpg;
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
        log.debug('setCumulativeMarkup | markup: ' + markup + ' | markupchange: ' + markupchange + ' | locmarkupchange: ' + locmarkupchange)

        if (!isEmpty(itm)) {
            var sum = forceFloat(markup) + forceFloat(markupchange) + forceFloat(locmarkupchange);

            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_cumulative_markup', value: sum, forceSyncSourcing: true});
            //log.debug({title: 'setCumulativeMarkup', details: 'sum: ' + sum});
            log.debug('setCumulativeMarkup | sum: ' + sum);
        }
    }

    /**
     * New Unit Cost (Custom Field) is populated based on ((1 + Cumulative % Mark Up + % Discount) x List/Item Purchase Price) + $ Discount
     * Basis = SRP, List Price (field in Vendor Price Record) is Used
     * Basis = Replacement Cost, Item Purchase Price is used
     * @param rec
     * @param sublist
     * @param field
     */
    function setNewCostUnit(rec, sublist, field) {
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
        log.debug('setNewCostUnit | cumulative: ' + cumulative + ' | percdiscount: ' + percdiscount
            + ' | dollardiscount: ' + dollardiscount + ' | basis: ' + basis + ' | price: ' + price
            + ' | itmcat: ' + itmcat + ' | porate: ' + porate + ' | markup: ' + markup + ' | itmtype: ' + itmtype + ' | revStream: ' + revStream);

        if (!isEmpty(itm)) {
            if (itmcat == TEMPITEMCAT || itmcat == allieditemcat || itmcat == rackingitemcat || itmcat == storageitemcat || itmcat == subletitemcat) {
                var finalprice = porate;
            }
            else {
                var finalprice = price;
            }

            var wodiscount = (1 + (forceFloat(cumulative) / 100)) * forceFloat(finalprice);

            // 1 = Sales Price - Discount
            if (revStreamData.pricecalc == 1) {
                wodiscount = wodiscount - forceFloat(wodiscount * (forceFloat(revStreamData.surcharge) / 100));
                log.debug('setNewCostUnit | Sales Price - Discount: ' + wodiscount);
            }
            // 2 = Cost Price + Surcharge
            else if (revStreamData.pricecalc == 2) {
                wodiscount = (1 + (forceFloat(revStreamData.surcharge) / 100)) * forceFloat(finalprice);
                log.debug('setNewCostUnit | Cost Price + Surcharge: ' + wodiscount);
            }
            // 3 = Sales Price + Surcharge
            else if (revStreamData.pricecalc == 3) {
                wodiscount = (1 + (forceFloat(revStreamData.surcharge) / 100)) * forceFloat(wodiscount);
                log.debug('setNewCostUnit | Sales Price + Surcharge: ' + wodiscount);
            }
            // 4 = Cost Price - Discount
            else if (revStreamData.pricecalc == 4) {
                wodiscount = finalprice - forceFloat(finalprice * (forceFloat(revStreamData.surcharge) / 100));
                log.debug('setNewCostUnit | Cost Price - Discount: ' + wodiscount);
            }

            var newunitcost = wodiscount - forceFloat(dollardiscount) - forceFloat(wodiscount * (forceFloat(percdiscount) / 100));

            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_newunitcost', value: newunitcost, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcolsna_hul_newunitcost_wodisc', value: wodiscount, forceSyncSourcing: true});

            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_list_price_prev', value: listprice, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: sublist, fieldId: 'custcol_sna_hul_replacementcost_prev', value: purchaseprice, forceSyncSourcing: true});

            //log.debug({title: 'setNewCostUnit', details: 'newunitcost: ' + newunitcost + ' | wodiscount: ' + wodiscount});
            log.debug('setNewCostUnit | newunitcost: ' + newunitcost + ' | wodiscount: ' + wodiscount);
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
            log.debug('setAmount | newamt: ' + newamt);
        }
    }

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

        log.debug(stLoggerTitle + ': first level - priceGrp = ' + priceGrp +'\ncurrRevStream = '+currRevStream+'\nequipCat = '+equipCat);

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
            log.debug(stLoggerTitle + ': 2nd level - if CPG is null');
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
                log.debug(stLoggerTitle + ': 3rd level - Exact CPG, MFG is Null');
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

                if (isEmpty(unitPrice)) {
                    log.debug(stLoggerTitle + ': 4th level - CPG Null, MPG Null');
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
                        log.debug(stLoggerTitle + ': 5th level - Get Rev Stream Parent');

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
        log.debug(stLoggerTitle + ' | unitPrice = ' + unitPrice);
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

        log.debug(TITLE + ': parentRevSteam = ' + parentRevSteam);

        return parentRevSteam;
    }

    function forceFloat(stValue) {
        var flValue = parseFloat(stValue);
        if (isNaN(flValue) || (stValue == 'Infinity')) {
            return 0.00;
        }
        return flValue;
    }

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    return {getInputData, reduce} //, summarize

});

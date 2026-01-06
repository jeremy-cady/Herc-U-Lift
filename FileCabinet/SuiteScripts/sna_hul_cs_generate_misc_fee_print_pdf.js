/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Client script shows a button that generates a PDF from the Invoice before saving it
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2023/07/14                        Care Parba          Initial version
 * 2023/12/12                        Cindy Aranda        Added replace in description
 * 2025/1/30       252983            apalad              Change Task Search to search all cases/task related to the Sales Order, not just the NXC Case Field
 *
 */
define(['N/search', 'N/url', 'N/xml', 'N/currentRecord'],
    /**
     * @param{search} search
     * @param{url} url
     * @param{xml} xml
     * @param{currentRecord} currentRecord
     */
    function(search, url, xml, currentRecord) {

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        function _getServiceCodeRevStream(revStreams, serviceType){
            var TITLE = '_getServiceCodeRevStream('+revStreams+', '+serviceType+')';

            var srch = search.create({
                type: 'customrecord_sna_service_code_type',
                filters: [
                    {
                        name: 'custrecord_sna_serv_code',
                        operator: 'anyof',
                        values: [revStreams]
                    },
                    {
                        name: 'custrecord_sna_ser_code_type',
                        operator: 'anyof',
                        values: [serviceType]
                    }
                ],
                columns: ['custrecord_sna_shop_fee_code_item', 'custrecord_sna_shop_fee_percent', 'custrecord_sna_min_shop_fee', 'custrecord_sna_max_shop_fee']
            });

            var serviceCodeRevStreamObj = {};
            srch.run().each(function(result){
                serviceCodeRevStreamObj.id = result.id;
                serviceCodeRevStreamObj.otherChargeItem = result.getValue({name: 'custrecord_sna_shop_fee_code_item'});
                serviceCodeRevStreamObj.shopFee = result.getValue({name: 'custrecord_sna_shop_fee_percent'});
                serviceCodeRevStreamObj.minShopFee = result.getValue({name: 'custrecord_sna_min_shop_fee'});
                serviceCodeRevStreamObj.maxShopFee = result.getValue({name: 'custrecord_sna_max_shop_fee'});
            });

            log.audit(TITLE, 'serviceCodeRevStreamObj = ' + JSON.stringify(serviceCodeRevStreamObj));

            return serviceCodeRevStreamObj;
        }

        function _getFinalAmt(num, min, max){
            var TITLE = '_getFinalAmt('+num+', '+min+', '+max+')';
            var finalAmt;
            var isBetween = (num >= min && num <= max);

            if(isBetween){
                //num is within min and max
                finalAmt = num;
            }else{

                if(num < min){
                    //num is below min
                    finalAmt = min;
                }else if(num > max){
                    //num is above max
                    finalAmt = max;
                }
            }

            log.debug(TITLE, 'finalAmt = ' + finalAmt);
            return finalAmt;
        }

        const generateMiscFee = () => {
            const LOG_TITLE = "generateMiscFee";
            console.log(LOG_TITLE);
            log.debug({title: LOG_TITLE, details: "===========START==========="});

            let objInvoiceRec = currentRecord.get();

            let bMiscFeeAllowed = objInvoiceRec.getValue({ fieldId: 'custbody_sna_misc_fee_allowed' });
            let bMiscFeeGenerated = objInvoiceRec.getValue({ fieldId: 'custbody_sna_misc_fee_generated' });

            if(!bMiscFeeAllowed)
                return;

            if(bMiscFeeGenerated) {
                alert('Cannot generate MISC Fee because it was already generated.');
                return;
            }

            let iLineCount = objInvoiceRec.getLineCount({ sublistId: 'item' });

            let arrInvoiceLine = [];

            for(let i = 0; i < iLineCount; i++){
                console.log(`i = ${i}`);
                let lineServiceType = objInvoiceRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', line: i});
                let lineRevStreams = objInvoiceRec.getSublistValue({ sublistId: 'item', fieldId: 'cseg_sna_revenue_st', line: i});
                let lineAmt = parseFloat(objInvoiceRec.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i}));

                if(!isEmpty(lineServiceType) && !isEmpty(lineRevStreams)){
                    if(arrInvoiceLine.length == 0){
                        arrInvoiceLine.push({
                            'lineServiceType': lineServiceType,
                            'lineRevStreams': lineRevStreams,
                            'lineAmt': lineAmt
                        });
                    } else {
                        let iServiceTypeIndex = arrInvoiceLine.findIndex(object => {
                            return object.lineServiceType === lineServiceType;
                        });

                        if(iServiceTypeIndex !== -1){
                            let stCurrentRevStreams = arrInvoiceLine[iServiceTypeIndex].lineRevStreams;

                            if(stCurrentRevStreams == lineRevStreams){
                                let numCurrentAmount = parseFloat(arrInvoiceLine[iServiceTypeIndex].lineAmt);
                                let numUpdatedAmount = numCurrentAmount + parseFloat(lineAmt);
                                arrInvoiceLine[iServiceTypeIndex].lineAmt = numUpdatedAmount;
                            } else {
                                arrInvoiceLine.push({
                                    'lineServiceType': lineServiceType,
                                    'lineRevStreams': lineRevStreams,
                                    'lineAmt': lineAmt
                                });
                            }
                        } else {
                            arrInvoiceLine.push({
                                'lineServiceType': lineServiceType,
                                'lineRevStreams': lineRevStreams,
                                'lineAmt': lineAmt
                            });
                        }
                    }
                }
            }

            console.log(`arrInvoiceLine: ${JSON.stringify(arrInvoiceLine)}`);
            console.log(`arrInvoiceLine length: ${arrInvoiceLine.length}`);

            const setLineFields = async () => {

                const objCurrentInvoiceRec = await currentRecord.get.promise();

                //This part of the code is based from Cindy's script - variable naming might be different
                for (let i = 0; i < arrInvoiceLine.length; i++) {
                    var lineServiceType = arrInvoiceLine[i].lineServiceType;
                    var lineRevStreams = arrInvoiceLine[i].lineRevStreams;
                    var lineAmt = arrInvoiceLine[i].lineAmt;

                    log.audit(LOG_TITLE, 'lineServiceType = ' + lineServiceType);
                    log.audit(LOG_TITLE, 'lineRevStreams = ' + lineRevStreams);
                    log.audit(LOG_TITLE, 'lineAmt = ' + lineAmt);

                    var serviceCodeObj = _getServiceCodeRevStream(lineRevStreams, lineServiceType);

                    console.log('serviceCodeObj = ' + JSON.stringify(serviceCodeObj));

                    if (!isEmpty(serviceCodeObj)) {
                        var compVal = (parseFloat(serviceCodeObj.shopFee) / 100) * parseFloat(lineAmt);
                        log.audit(LOG_TITLE, 'compVal = ' + compVal);
                        console.log('compVal = ' + compVal);

                        var finalAmt = _getFinalAmt(compVal, serviceCodeObj.minShopFee, serviceCodeObj.maxShopFee);
                        log.audit(LOG_TITLE, 'finalAmt = ' + finalAmt);
                        console.log('finalAmt = ' + finalAmt);


                        if (!isEmpty(finalAmt) && !isEmpty(serviceCodeObj.otherChargeItem)) {
                            //Add Other Charge Item
                            objCurrentInvoiceRec.selectNewLine({sublistId: 'item'});
                            objCurrentInvoiceRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: serviceCodeObj.otherChargeItem,
                                forceSyncSourcing: true
                            });
                            objCurrentInvoiceRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_so_service_code_type',
                                value: lineServiceType,
                                forceSyncSourcing: true
                            });
                            objCurrentInvoiceRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'cseg_sna_revenue_st',
                                value: lineRevStreams,
                                forceSyncSourcing: true
                            });
                            //objCurrentInvoiceRec.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1, forceSyncSourcing: true});
                            objCurrentInvoiceRec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: 1, forceSyncSourcing: true});
                            objCurrentInvoiceRec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: finalAmt, forceSyncSourcing: true});
                            //objInvoiceRec.setCurrentSublistValue({sublistId: 'item', fieldId: 'amount', value: finalAmt});
                            objCurrentInvoiceRec.commitLine({sublistId: 'item'});

                            objCurrentInvoiceRec.setValue({ fieldId: 'custbody_sna_misc_fee_generated', value: true});
                            //objInvoiceRec.setValue({ fieldId: 'custbody_sna_misc_fee_allowed', value: true});
                        }
                    }
                }
            }
            setLineFields();

            console.log("===========END===========");
            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        const getDate = (dateStr) => {
            let dateArr = dateStr.split("-");
            let data = [dateArr[1], dateArr[2], dateArr[0]].join("/")
            // let date = new Date(data);
            return data;
        }

        const getInvoiceLineItems = (objInvoiceRec) => {
            let response = [];

            let customFormId = parseInt(objInvoiceRec.getValue({fieldId: "customform"}));

            switch (customFormId){
                case 101: //HUL Service Invoice
                    for (let i = 0; i < objInvoiceRec.getLineCount({sublistId: "item"}); i++) {
                        let doNotPrint = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_do_not_print",
                            line: i
                        });
                        let defRevStream = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_default_rev_stream",
                            line: i
                        });
                        let description = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "description",
                            line: i
                        });
                        description = description.replace(/\u0005/gi, '\n');
                        let item = objInvoiceRec.getSublistText({sublistId: "item", fieldId: "item", line: i});
                        let itemType = objInvoiceRec.getSublistValue({sublistId: "item", fieldId: "itemtype", line: i});

                        let quantity = objInvoiceRec.getSublistValue({sublistId: "item", fieldId: "quantity", line: i});
                        let rate = objInvoiceRec.getSublistValue({sublistId: "item", fieldId: "rate", line: i});
                        let amount = objInvoiceRec.getSublistValue({sublistId: "item", fieldId: "amount", line: i});
                        let avaTaxAmt = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_ava_taxamount",
                            line: i
                        });

                        response.push({
                            custcol_sna_do_not_print: doNotPrint,
                            custcol_sna_default_rev_stream: defRevStream,
                            description: description? xml.escape(description) : '',
                            item: item? xml.escape(item) : '',
                            itemtype: itemType? xml.escape(itemType) : '',
                            quantity: quantity,
                            rate: rate,
                            amount: amount,
                            custcol_ava_taxamount: avaTaxAmt
                        });
                    }
                    break;
                case 114: //Parts and Object Invoice
                    break;
                case 138: //HUL Rental Invoice
                    for (let i = 0; i < objInvoiceRec.getLineCount({sublistId: "item"}); i++) {
                        let doNotPrint = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_do_not_print",
                            line: i
                        });
                        let defRevStream = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_default_rev_stream",
                            line: i
                        });
                        let description = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "description",
                            line: i
                        });
                        description = description.replace(/\u0005/gi, '\n');
                        let item = objInvoiceRec.getSublistText({sublistId: "item", fieldId: "item", line: i});
                        let rentStartDate = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_hul_rent_start_date",
                            line: i
                        });
                        let rentEndDate = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_hul_rent_end_date",
                            line: i
                        });
                        let snaObject = objInvoiceRec.getSublistText({
                            sublistId: "item",
                            fieldId: "custcol_sna_object",
                            line: i
                        });
                        let hulMFG = objInvoiceRec.getSublistText({
                            sublistId: "item",
                            fieldId: "cseg_hul_mfg",
                            line: i
                        });
                        let hulObjModel = objInvoiceRec.getSublistText({
                            sublistId: "item",
                            fieldId: "custcol_sna_hul_obj_model",
                            line: i
                        });
                        let objSerialNo = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_obj_serialno",
                            line: i
                        });
                        let hulFleetNo = objInvoiceRec.getSublistText({
                            sublistId: "item",
                            fieldId: "custcol_sna_hul_fleet_no",
                            line: i
                        });
                        let quantity = objInvoiceRec.getSublistValue({sublistId: "item", fieldId: "quantity", line: i});
                        let rate = objInvoiceRec.getSublistValue({sublistId: "item", fieldId: "rate", line: i});
                        let amount = objInvoiceRec.getSublistValue({sublistId: "item", fieldId: "amount", line: i});
                        let avaTaxAmt = objInvoiceRec.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_ava_taxamount",
                            line: i
                        });

                        response.push({
                            doNotPrint: doNotPrint,
                            defRevStream: defRevStream,
                            description: description? xml.escape(description) : '',
                            item: item? xml.escape(item) : '',
                            custcol_sna_hul_rent_end_date: rentStartDate,
                            custcol_sna_hul_rent_end_date: rentEndDate,
                            custcol_sna_object: snaObject? xml.escape(snaObject) : '',
                            cseg_hul_mfg: hulMFG? xml.escape(hulMFG) : '',
                            custcol_sna_hul_obj_model: hulObjModel? xml.escape(hulObjModel) : '',
                            custcol_sna_obj_serialno: objSerialNo? xml.escape(objSerialNo) : '',
                            custcol_sna_hul_fleet_no: hulFleetNo? xml.escape(hulFleetNo) : '',
                            quantity: quantity,
                            rate: rate,
                            amount: amount,
                            custcol_ava_taxamount: avaTaxAmt
                        });
                    }
                    break;
                case 139: //HUL Lease Invoice
                    break;
                case 144: //HUL Equipment Invoice
                    break;
            }

            return response;
        }

        const getAllInvoiceFields = (objInvoiceRec) => {
            const LOG_TITLE = "getAllInvoiceFields";

            let customFormId = parseInt(objInvoiceRec.getValue({fieldId: "customform"}));
            log.debug({title: LOG_TITLE, details: `customFormId: ${customFormId}`});
            log.debug({title: LOG_TITLE, details: `typeof customFormId: ${typeof customFormId}`});


            let tranId, dateStr, tranDate, billAddress, shipAddress, otherRefNum, terms, shipMethod, cpEmailPaylink, subTotal, taxTotal,
                notPaid, total, entityId, locationHULCode, contactEntityId, contactPhone, salesRep, memo, equipmentInfo, equipmentInfoModel,
                equipmentInfoMake, equipmentInfoSerialNo, equipmentInfoFleet, caseAssets, meterReading, nxcEquipAsset, nxcEquipAssetObjModel,
                nxcEquipAssetMfg, nxcEquipAssetSerial, nxcEquipAssetFleetCode, taskList, internalId;

            let items, objInvoice;

            //tranId = objInvoiceRec.getValue({fieldId: "tranid"});
            tranId = objInvoiceRec.getText({fieldId: "createdfrom"});
            internalId = objInvoiceRec.id;
            notPaid = objInvoiceRec.getValue({fieldId: "custpage_notpaid"});
            total = objInvoiceRec.getValue({fieldId: "total"});
            log.debug({title: LOG_TITLE, details: `internalId: ${internalId}`});

            if (objInvoiceRec.getValue({fieldId: "entity"}))
                entityId = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: objInvoiceRec.getValue({fieldId: "entity"}),
                    columns: "entityid"
                })["entityid"];
            log.debug({title: LOG_TITLE, details: `entityId: ${entityId}`});

            dateStr = JSON.stringify(objInvoiceRec.getValue({fieldId: "trandate"})).replaceAll("\"", "").split("T")[0];
            tranDate = getDate(dateStr);
            log.debug({
                title: LOG_TITLE,
                details: `not formatted tranDate: ${objInvoiceRec.getValue({fieldId: "trandate"})}`
            });
            log.debug({title: LOG_TITLE, details: `dateStr: ${dateStr}`});
            log.debug({title: LOG_TITLE, details: `tranDate: ${tranDate}`});

            billAddress = objInvoiceRec.getValue({fieldId: "billaddress"});
            shipAddress = objInvoiceRec.getValue({fieldId: "shipaddress"});
            otherRefNum = objInvoiceRec.getValue({fieldId: "otherrefnum"});
            terms = objInvoiceRec.getText({fieldId: "terms"});

            if (objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}))
                contactEntityId = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}),
                    columns: "entityid"
                })["entityid"];
            log.debug({title: LOG_TITLE, details: `contactEntityId: ${contactEntityId}`});

            if (objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}))
                contactPhone = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}),
                    columns: "phone"
                })["phone"];
            log.debug({title: LOG_TITLE, details: `contactPhone: ${contactPhone}`});

            shipMethod = objInvoiceRec.getValue({fieldId: "shipmethod"});
            salesRep = objInvoiceRec.getText({fieldId: "salesrep"});
            memo = objInvoiceRec.getValue({fieldId: "memo"});

            if (objInvoiceRec.getValue({fieldId: "location"}))
                locationHULCode = search.lookupFields({
                    type: search.Type.LOCATION,
                    id: objInvoiceRec.getValue({fieldId: "location"}),
                    columns: "custrecord_hul_code"
                })["custrecord_hul_code"];
            log.debug({title: LOG_TITLE, details: `locationHULCode: ${locationHULCode}`});

            equipmentInfo = objInvoiceRec.getValue({fieldId: "custpage_equipmentinfo"});

            if (objInvoiceRec.getValue({fieldId: "custbody_nx_case"}))
                caseAssets = search.lookupFields({
                    type: search.Type.SUPPORT_CASE,
                    id: objInvoiceRec.getValue({fieldId: "custbody_nx_case"}),
                    columns: "custevent_nxc_case_assets"
                })["custevent_nxc_case_assets"];
            log.debug({title: LOG_TITLE, details: `caseAssets: ${JSON.stringify(caseAssets)}`});

            if (caseAssets && caseAssets != undefined) {
                if (caseAssets.length > 0) {
                    if (!isEmpty(caseAssets[0].value)) {
                        let objSNAObjectSearch = search.lookupFields({
                            type: 'customrecord_nx_asset',
                            id: caseAssets[0].value,
                            columns: ["custrecord_sna_hul_nxc_object_model", "cseg_hul_mfg", "custrecord_nx_asset_serial", "custrecord_sna_hul_fleetcode"]
                        });

                        equipmentInfoModel = objSNAObjectSearch["custrecord_sna_hul_nxc_object_model"];
                        log.debug({
                            title: LOG_TITLE,
                            details: `equipmentInfoModel: ${JSON.stringify(equipmentInfoModel)}`
                        });

                        equipmentInfoMake = objSNAObjectSearch["cseg_hul_mfg"];
                        log.debug({
                            title: LOG_TITLE,
                            details: `equipmentInfoMake: ${JSON.stringify(equipmentInfoMake)}`
                        });

                        equipmentInfoSerialNo = objSNAObjectSearch["custrecord_nx_asset_serial"];
                        log.debug({title: LOG_TITLE, details: `equipmentInfoSerialNo: ${equipmentInfoSerialNo}`});

                        equipmentInfoFleet = objSNAObjectSearch["custrecord_sna_hul_fleetcode"];
                        log.debug({title: LOG_TITLE, details: `equipmentInfoFleet: ${equipmentInfoFleet}`});
                    }
                }
            }

            log.debug({title: LOG_TITLE, details: `test: test`});

            meterReading = objInvoiceRec.getValue({fieldId: "custpage_meterreading"});
            nxcEquipAsset = objInvoiceRec.getText({fieldId: "custbody_sna_hul_nxc_eq_asset"});

            if (objInvoiceRec.getValue({fieldId: "custbody_sna_hul_nxc_eq_asset"})) {
                let objNXCAssetSearch = search.lookupFields({
                    type: 'customrecord_nx_asset',
                    id: objInvoiceRec.getValue({fieldId: "custbody_sna_hul_nxc_eq_asset"}),
                    columns: ["custrecord_sna_hul_nxc_object_model", "cseg_hul_mfg", "custrecord_nx_asset_serial", "custrecord_sna_hul_fleetcode"]
                });

                nxcEquipAssetObjModel = objNXCAssetSearch["custrecord_sna_hul_nxc_object_model"];
                log.debug({title: LOG_TITLE, details: `nxcEquipAssetObjModel: ${nxcEquipAssetObjModel}`});

                nxcEquipAssetMfg = objNXCAssetSearch["cseg_hul_mfg"];
                log.debug({title: LOG_TITLE, details: `nxcEquipAssetMfg: ${nxcEquipAssetMfg}`});

                nxcEquipAssetSerial = objNXCAssetSearch["custrecord_nx_asset_serial"];
                log.debug({title: LOG_TITLE, details: `nxcEquipAssetSerial: ${nxcEquipAssetSerial}`});

                nxcEquipAssetFleetCode = objNXCAssetSearch["custrecord_sna_hul_fleetcode"];
                log.debug({title: LOG_TITLE, details: `nxcEquipAssetFleetCode: ${nxcEquipAssetFleetCode}`});
            }

            cpEmailPaylink = objInvoiceRec.getValue({fieldId: "custbody_sna_cp_email_paylink"});
            subTotal = objInvoiceRec.getValue({fieldId: "subtotal"});
            taxTotal = objInvoiceRec.getValue({fieldId: "taxtotal"});
            taskList = objInvoiceRec.getValue({fieldId: "custpage_tasklist"});

            items = getInvoiceLineItems(objInvoiceRec);
            log.debug({title: LOG_TITLE, details: `items: ${JSON.stringify(items)}`});

            let tasks = [];

            let stInvoiceCase = objInvoiceRec.getValue({fieldId: "custbody_nx_case"});

            //1.30.2025 START Case Task 252983  apalad
            let arrCaseId = new Array();
            let intSalesOrderId = objInvoiceRec.getValue({fieldId: "createdfrom"});
            let objCaseSearch = search.create({
                type: 'supportcase',
                filters: [[
                    'custevent_nx_case_transaction', 'anyof', intSalesOrderId]]
            });

            objCaseSearch.run().each(function(result) {
                arrCaseId.push(result.id)
                return true;
            });

            log.debug('arrCaseId',arrCaseId);
            //1.30.2025 END Case Task 252983  apalad

            if(arrCaseId) {
                let objTaskSearch = search.create({
                    type: 'task',
                    filters: [
                        ["case.internalid","anyof", arrCaseId]
                    ],
                    columns: ['duedate', 'custevent_nx_actions_taken', 'custevent_nx_task_number']
                }).run().getRange({ start: 0, end: 1000 });

                for(let i = 0; i < objTaskSearch.length; i++){
                    let stTaskId = objTaskSearch[i].id;
                    let stTaskNum = objTaskSearch[i].getValue({name: 'custevent_nx_task_number'});

                    let dueDateStr = JSON.stringify(objTaskSearch[i].getValue({name: 'duedate'})).replaceAll("\"", "").split("T")[0];
                    let dueDate = getDate(dueDateStr);

                    let stActionTaken = objTaskSearch[i].getValue({name: 'custevent_nx_actions_taken'});
                    let stHrMeterReading;

                    let objMaintenanceRecSrch = search.create({
                        type: 'customrecord_nxc_mr',
                        filters: [
                            {
                                name: 'custrecord_nxc_mr_case',
                                operator: 'anyof',
                                values: [stInvoiceCase]
                            }, {
                                name: 'custrecord_nxc_mr_task',
                                operator: 'anyof',
                                values: [stTaskId]
                            },
                        ],
                        columns: ['custrecord_nxc_mr_field_222']
                    }).run().getRange({ start: 0, end: 1 });

                    if(objMaintenanceRecSrch.length > 0)
                        stHrMeterReading = objMaintenanceRecSrch[0].getValue({name: 'custrecord_nxc_mr_field_222'});

                    tasks.push({
                        task_num: stTaskNum,
                        date: dueDate.slice(2, dueDate.length),
                        hr_meter_reading: stHrMeterReading? stHrMeterReading : '',
                        action_taken: stActionTaken? xml.escape(stActionTaken) : '',
                    });
                }
            }

            log.debug({title: LOG_TITLE, details: `tasks: ${JSON.stringify(tasks)}`});
            log.debug({title: LOG_TITLE, details: `caseAssets: ${JSON.stringify(caseAssets)}`});

            objInvoice = {
                internalid: internalId,
                custpage_notpaid: notPaid,
                total: total,
                otherrefnum: otherRefNum ? xml.escape(otherRefNum) : '',
                tranid: xml.escape(tranId),
                entityid: xml.escape(entityId),
                trandate: xml.escape(tranDate),
                billaddress: billAddress ? xml.escape(billAddress) : '',//xml.escape(billAddress.replace(/\n/g, "")) : '',
                shipaddress: shipAddress ? xml.escape(shipAddress) : '',//xml.escape(shipAddress.replace(/\n/g, "")) : '',
                terms: terms ? xml.escape(terms) : '',
                salesrep: salesRep ? xml.escape(salesRep) : '',
                memo: memo ? xml.escape(memo) : '',
                //custpage_equipmentinfo: equipmentInfo ? xml.escape(JSON.stringify(equipmentInfo)) : '',
                caseAssets: caseAssets ? caseAssets.length > 0  ? xml.escape(caseAssets[0].text) : '' : '',
                equipmentInfoModel: (equipmentInfoModel && equipmentInfoModel.length > 0) ? xml.escape(equipmentInfoModel[0].text) : '',
                equipmentInfoMake: (equipmentInfoMake && equipmentInfoMake.length > 0) ? xml.escape(equipmentInfoMake[0].text) : '',
                equipmentInfoSerialNo: equipmentInfoSerialNo ? xml.escape(equipmentInfoSerialNo) : '',
                equipmentInfoFleet: equipmentInfoFleet ? xml.escape(equipmentInfoFleet) : '',
                custpage_meterreading: meterReading ? xml.escape(meterReading) : '',
                custbody_sna_hul_nxc_eq_asset: nxcEquipAsset ? xml.escape(nxcEquipAsset) : '',
                nxcEquipAssetObjModel: (nxcEquipAssetObjModel && nxcEquipAssetObjModel.length > 0) ? xml.escape(nxcEquipAssetObjModel[0].text) : '',
                nxcEquipAssetMfg: (nxcEquipAssetMfg && nxcEquipAssetMfg.length > 0) ? xml.escape(nxcEquipAssetMfg[0].text) : '',
                nxcEquipAssetSerial: nxcEquipAssetSerial ? xml.escape(nxcEquipAssetSerial) : '',
                nxcEquipAssetFleetCode: nxcEquipAssetFleetCode ? xml.escape(nxcEquipAssetFleetCode) : '',
                locationHulCode: locationHULCode ? xml.escape(locationHULCode) : '',
                contactEntityid: contactEntityId ? xml.escape(contactEntityId) : '',
                shipmethod: shipMethod ? xml.escape(shipMethod) : '',
                contactPhone: contactPhone ? xml.escape(contactPhone) : '',
                custbody_sna_cp_email_paylink: cpEmailPaylink ? xml.escape(cpEmailPaylink) : '',
                subtotal: subTotal,
                taxtotal: taxTotal
            };
            objInvoice.lines = items;
            objInvoice.tasks = tasks;

            log.debug({title: LOG_TITLE, details: `objInvoice: ${JSON.stringify(objInvoice)}`});

            return objInvoice;

            /*switch(customFormId) {
                case 101: //HUL Service Invoice
                    //tranId = objInvoiceRec.getValue({fieldId: "tranid"});
                    tranId = objInvoiceRec.getText({fieldId: "createdfrom"});
                    notPaid = objInvoiceRec.getValue({fieldId: "custpage_notpaid"});
                    total = objInvoiceRec.getValue({fieldId: "total"});

                    if (objInvoiceRec.getValue({fieldId: "entity"}))
                        entityId = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: objInvoiceRec.getValue({fieldId: "entity"}),
                            columns: "entityid"
                        })["entityid"];
                    log.debug({title: LOG_TITLE, details: `entityId: ${entityId}`});

                    dateStr = JSON.stringify(objInvoiceRec.getValue({fieldId: "trandate"})).replaceAll("\"", "").split("T")[0];
                    tranDate = getDate(dateStr);
                    log.debug({
                        title: LOG_TITLE,
                        details: `not formatted tranDate: ${objInvoiceRec.getValue({fieldId: "trandate"})}`
                    });
                    log.debug({title: LOG_TITLE, details: `dateStr: ${dateStr}`});
                    log.debug({title: LOG_TITLE, details: `tranDate: ${tranDate}`});

                    billAddress = objInvoiceRec.getValue({fieldId: "billaddress"});
                    shipAddress = objInvoiceRec.getValue({fieldId: "shipaddress"});
                    otherRefNum = objInvoiceRec.getValue({fieldId: "otherrefnum"});
                    terms = objInvoiceRec.getText({fieldId: "terms"});

                    if (objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}))
                        contactEntityId = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}),
                            columns: "entityid"
                        })["entityid"];
                    log.debug({title: LOG_TITLE, details: `contactEntityId: ${contactEntityId}`});

                    if (objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}))
                        contactPhone = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}),
                            columns: "phone"
                        })["phone"];
                    log.debug({title: LOG_TITLE, details: `contactPhone: ${contactPhone}`});

                    shipMethod = objInvoiceRec.getValue({fieldId: "shipmethod"});
                    salesRep = objInvoiceRec.getText({fieldId: "salesrep"});
                    memo = objInvoiceRec.getValue({fieldId: "memo"});

                    if (objInvoiceRec.getValue({fieldId: "location"}))
                        locationHULCode = search.lookupFields({
                            type: search.Type.LOCATION,
                            id: objInvoiceRec.getValue({fieldId: "location"}),
                            columns: "custrecord_hul_code"
                        })["custrecord_hul_code"];
                    log.debug({title: LOG_TITLE, details: `locationHULCode: ${locationHULCode}`});

                    equipmentInfo = objInvoiceRec.getValue({fieldId: "custpage_equipmentinfo"});

                    if (objInvoiceRec.getValue({fieldId: "custbody_nx_case"}))
                        caseAssets = search.lookupFields({
                            type: search.Type.SUPPORT_CASE,
                            id: objInvoiceRec.getValue({fieldId: "custbody_nx_case"}),
                            columns: "custevent_nxc_case_assets"
                        })["custevent_nxc_case_assets"];
                    log.debug({title: LOG_TITLE, details: `caseAssets: ${JSON.stringify(caseAssets)}`});

                    if (caseAssets.length > 0) {
                        if(!isEmpty(caseAssets[0].value)) {
                            let objSNAObjectSearch = search.lookupFields({
                                type: 'customrecord_nx_asset',
                                id: caseAssets[0].value,
                                columns: ["custrecord_sna_hul_nxc_object_model", "cseg_hul_mfg", "custrecord_nx_asset_serial", "custrecord_sna_hul_fleetcode"]
                            });

                            equipmentInfoModel = objSNAObjectSearch["custrecord_sna_hul_nxc_object_model"];
                            log.debug({title: LOG_TITLE, details: `equipmentInfoModel: ${JSON.stringify(equipmentInfoModel)}`});

                            equipmentInfoMake = objSNAObjectSearch["cseg_hul_mfg"];
                            log.debug({title: LOG_TITLE, details: `equipmentInfoMake: ${JSON.stringify(equipmentInfoMake)}`});

                            equipmentInfoSerialNo = objSNAObjectSearch["custrecord_nx_asset_serial"];
                            log.debug({title: LOG_TITLE, details: `equipmentInfoSerialNo: ${equipmentInfoSerialNo}`});

                            equipmentInfoFleet = objSNAObjectSearch["custrecord_sna_hul_fleetcode"];
                            log.debug({title: LOG_TITLE, details: `equipmentInfoFleet: ${equipmentInfoFleet}`});
                        }
                    }

                    meterReading = objInvoiceRec.getValue({fieldId: "custpage_meterreading"});
                    nxcEquipAsset = objInvoiceRec.getText({fieldId: "custbody_sna_hul_nxc_eq_asset"});

                    if (objInvoiceRec.getValue({fieldId: "custbody_sna_hul_nxc_eq_asset"})) {
                        let objNXCAssetSearch = search.lookupFields({
                            type: 'customrecord_nx_asset',
                            id: objInvoiceRec.getValue({fieldId: "custbody_sna_hul_nxc_eq_asset"}),
                            columns: ["custrecord_sna_hul_nxc_object_model", "cseg_hul_mfg", "custrecord_nx_asset_serial", "custrecord_sna_hul_fleetcode"]
                        });

                        nxcEquipAssetObjModel = objNXCAssetSearch["custrecord_sna_hul_nxc_object_model"];
                        log.debug({title: LOG_TITLE, details: `nxcEquipAssetObjModel: ${nxcEquipAssetObjModel}`});

                        nxcEquipAssetMfg = objNXCAssetSearch["cseg_hul_mfg"];
                        log.debug({title: LOG_TITLE, details: `nxcEquipAssetMfg: ${nxcEquipAssetMfg}`});

                        nxcEquipAssetSerial = objNXCAssetSearch["custrecord_nx_asset_serial"];
                        log.debug({title: LOG_TITLE, details: `nxcEquipAssetSerial: ${nxcEquipAssetSerial}`});

                        nxcEquipAssetFleetCode = objNXCAssetSearch["custrecord_sna_hul_fleetcode"];
                        log.debug({title: LOG_TITLE, details: `nxcEquipAssetFleetCode: ${nxcEquipAssetFleetCode}`});
                    }

                    cpEmailPaylink = objInvoiceRec.getValue({fieldId: "custbody_sna_cp_email_paylink"});
                    subTotal = objInvoiceRec.getValue({fieldId: "subtotal"});
                    taxTotal = objInvoiceRec.getValue({fieldId: "taxtotal"});
                    taskList = objInvoiceRec.getValue({fieldId: "custpage_tasklist"});

                    items = getInvoiceLineItems(objInvoiceRec);
                    log.debug({title: LOG_TITLE, details: `items: ${JSON.stringify(items)}`});

                    let tasks = [];

                    let stInvoiceCase = objInvoiceRec.getValue({fieldId: "custbody_nx_case"});

                    if(stInvoiceCase) {
                        let objTaskSearch = search.create({
                            type: 'task',
                            filters: [
                                ["case.internalid","anyof", stInvoiceCase]
                            ],
                            columns: ['duedate', 'custevent_nx_actions_taken', 'custevent_nx_task_number']
                        }).run().getRange({ start: 0, end: 1000 });

                        for(let i = 0; i < objTaskSearch.length; i++){
                            let stTaskId = objTaskSearch[i].id;
                            let stTaskNum = objTaskSearch[i].getValue({name: 'custevent_nx_task_number'});

                            let dueDateStr = JSON.stringify(objTaskSearch[i].getValue({name: 'duedate'})).replaceAll("\"", "").split("T")[0];
                            let dueDate = getDate(dueDateStr);

                            let stActionTaken = objTaskSearch[i].getValue({name: 'custevent_nx_actions_taken'});
                            let stHrMeterReading;

                            let objMaintenanceRecSrch = search.create({
                                type: 'customrecord_nxc_mr',
                                filters: [
                                    {
                                        name: 'custrecord_nxc_mr_case',
                                        operator: 'anyof',
                                        values: [stInvoiceCase]
                                    }, {
                                        name: 'custrecord_nxc_mr_task',
                                        operator: 'anyof',
                                        values: [stTaskId]
                                    },
                                ],
                                columns: ['custrecord_nxc_mr_field_222']
                            }).run().getRange({ start: 0, end: 1 });

                            if(objMaintenanceRecSrch.length > 0)
                                stHrMeterReading = objMaintenanceRecSrch[0].getValue({name: 'custrecord_nxc_mr_field_222'});

                            tasks.push({
                                task_num: stTaskNum,
                                date: dueDate.slice(2, dueDate.length),
                                hr_meter_reading: stHrMeterReading? stHrMeterReading : '',
                                action_taken: stActionTaken? xml.escape(stActionTaken) : '',
                            });
                        }
                    }

                    log.debug({title: LOG_TITLE, details: `tasks: ${JSON.stringify(tasks)}`});
                    log.debug({title: LOG_TITLE, details: `caseAssets: ${JSON.stringify(caseAssets)}`});

                    objInvoice = {
                        custpage_notpaid: notPaid,
                        total: total,
                        otherrefnum: otherRefNum ? xml.escape(otherRefNum) : '',
                        tranid: xml.escape(tranId),
                        entityid: xml.escape(entityId),
                        trandate: xml.escape(tranDate),
                        billaddress: billAddress ? xml.escape(billAddress) : '',//xml.escape(billAddress.replace(/\n/g, "")) : '',
                        shipaddress: shipAddress ? xml.escape(shipAddress) : '',//xml.escape(shipAddress.replace(/\n/g, "")) : '',
                        terms: terms ? xml.escape(terms) : '',
                        salesrep: salesRep ? xml.escape(salesRep) : '',
                        memo: memo ? xml.escape(memo) : '',
                        //custpage_equipmentinfo: equipmentInfo ? xml.escape(JSON.stringify(equipmentInfo)) : '',
                        caseAssets: caseAssets.length > 0 ? xml.escape(caseAssets[0].text) : '',
                        equipmentInfoModel: (equipmentInfoModel && equipmentInfoModel.length > 0) ? xml.escape(equipmentInfoModel[0].text) : '',
                        equipmentInfoMake: (equipmentInfoMake && equipmentInfoMake.length > 0) ? xml.escape(equipmentInfoMake[0].text) : '',
                        equipmentInfoSerialNo: equipmentInfoSerialNo ? xml.escape(equipmentInfoSerialNo) : '',
                        equipmentInfoFleet: equipmentInfoFleet ? xml.escape(equipmentInfoFleet) : '',
                        custpage_meterreading: meterReading ? xml.escape(meterReading) : '',
                        custbody_sna_hul_nxc_eq_asset: nxcEquipAsset ? xml.escape(nxcEquipAsset) : '',
                        nxcEquipAssetObjModel: (nxcEquipAssetObjModel && nxcEquipAssetObjModel.length > 0) ? xml.escape(nxcEquipAssetObjModel[0].text) : '',
                        nxcEquipAssetMfg: (nxcEquipAssetMfg && nxcEquipAssetMfg.length > 0) ? xml.escape(nxcEquipAssetMfg[0].text) : '',
                        nxcEquipAssetSerial: nxcEquipAssetSerial ? xml.escape(nxcEquipAssetSerial) : '',
                        nxcEquipAssetFleetCode: nxcEquipAssetFleetCode ? xml.escape(nxcEquipAssetFleetCode) : '',
                        locationHulCode: locationHULCode ? xml.escape(locationHULCode) : '',
                        contactEntityid: contactEntityId ? xml.escape(contactEntityId) : '',
                        shipmethod: shipMethod ? xml.escape(shipMethod) : '',
                        contactPhone: contactPhone ? xml.escape(contactPhone) : '',
                        custbody_sna_cp_email_paylink: cpEmailPaylink ? xml.escape(cpEmailPaylink) : '',
                        subtotal: subTotal,
                        taxtotal: taxTotal
                    };
                    objInvoice.lines = items;
                    objInvoice.tasks = tasks;

                    log.debug({title: LOG_TITLE, details: `objInvoice: ${JSON.stringify(objInvoice)}`});

                    return objInvoice;
                case 114: //Parts and Object Invoice
                    break;
                case 138: //HUL Rental Invoice
                    //tranId = objInvoiceRec.getValue({fieldId: "tranid"});
                    tranId = objInvoiceRec.getText({fieldId: "createdfrom"});

                    if (objInvoiceRec.getValue({fieldId: "entity"}))
                        entityId = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: objInvoiceRec.getValue({fieldId: "entity"}),
                            columns: "entityid"
                        })["entityid"];
                    log.debug({title: LOG_TITLE, details: `entityId: ${entityId}`});


                    dateStr = JSON.stringify(objInvoiceRec.getValue({fieldId: "trandate"})).replaceAll("\"", "").split("T")[0];
                    tranDate = getDate(dateStr);
                    log.debug({
                        title: LOG_TITLE,
                        details: `not formatted tranDate: ${objInvoiceRec.getValue({fieldId: "trandate"})}`
                    });
                    log.debug({title: LOG_TITLE, details: `dateStr: ${dateStr}`});
                    log.debug({title: LOG_TITLE, details: `tranDate: ${tranDate}`});

                    billAddress = objInvoiceRec.getValue({fieldId: "billaddress"});
                    shipAddress = objInvoiceRec.getValue({fieldId: "shipaddress"});
                    otherRefNum = objInvoiceRec.getValue({fieldId: "otherrefnum"});
                    terms = objInvoiceRec.getText({fieldId: "terms"});

                    if (objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}))
                        contactPhone = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}),
                            columns: "phone"
                        })["phone"];
                    log.debug({title: LOG_TITLE, details: `contactPhone: ${contactPhone}`});

                    if (objInvoiceRec.getValue({fieldId: "location"}))
                        locationHULCode = search.lookupFields({
                            type: search.Type.LOCATION,
                            id: objInvoiceRec.getValue({fieldId: "location"}),
                            columns: "custrecord_hul_code"
                        })["custrecord_hul_code"];
                    log.debug({title: LOG_TITLE, details: `locationHULCode: ${locationHULCode}`});

                    if (objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}))
                        contactEntityId = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}),
                            columns: "entityid"
                        })["entityid"];
                    log.debug({title: LOG_TITLE, details: `contactEntityId: ${contactEntityId}`});

                    shipMethod = objInvoiceRec.getValue({fieldId: "shipmethod"});

                    if (objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}))
                        contactPhone = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: objInvoiceRec.getValue({fieldId: "custbody_sna_contact"}),
                            columns: "phone"
                        })["phone"];
                    log.debug({title: LOG_TITLE, details: `contactPhone: ${contactPhone}`});

                    cpEmailPaylink = objInvoiceRec.getValue({fieldId: "custbody_sna_cp_email_paylink"});
                    subTotal = objInvoiceRec.getValue({fieldId: "subtotal"});
                    taxTotal = objInvoiceRec.getValue({fieldId: "taxtotal"});

                    items = getInvoiceLineItems(objInvoiceRec);
                    log.debug({title: LOG_TITLE, details: `items: ${JSON.stringify(items)}`});

                    objInvoice = {
                        otherrefnum: otherRefNum ? xml.escape(otherRefNum) : '',
                        tranid: xml.escape(tranId),
                        entityid: xml.escape(entityId),
                        trandate: xml.escape(tranDate),
                        billaddress: billAddress ? xml.escape(billAddress.replace(/\n/g, '')) : '',
                        shipaddress: shipAddress ? xml.escape(shipAddress.replace(/\n/g, '')) : '',
                        terms: terms ? xml.escape(terms) : '',
                        locationHulCode: locationHULCode ? xml.escape(locationHULCode) : '',
                        contactEntityid: contactEntityId ? xml.escape(contactEntityId) : '',
                        shipmethod: shipMethod ? xml.escape(shipMethod) : '',
                        contactPhone: contactPhone ? xml.escape(contactPhone) : '',
                        custbody_sna_cp_email_paylink: cpEmailPaylink ? xml.escape(cpEmailPaylink) : '',
                        subtotal: subTotal,
                        taxtotal: taxTotal
                    };
                    objInvoice.item = items;

                    log.debug({title: LOG_TITLE, details: `objInvoice: ${JSON.stringify(objInvoice)}`});

                    return objInvoice;
                case 139: //HUL Lease Invoice
                    break;
                case 144: //HUL Equipment Invoice
                    break;
                default:
                    return 0;
            }*/
        }

        const generatePDF = () => {
            const LOG_TITLE = "generatePDF";
            log.debug({title: LOG_TITLE, details: "===========START==========="});
            console.log('11')

            let objInvoiceRec = currentRecord.get();

            let bMiscFeeGenerated = objInvoiceRec.getValue({ fieldId: 'custbody_sna_misc_fee_generated' });

            if(!bMiscFeeGenerated) {
                let bIsConfirm = confirm('MISC Fee is not yet generated. Are you sure you want to continue?');

                if(!bIsConfirm)
                    return;
            }

            let objInvoice= getAllInvoiceFields(objInvoiceRec);

            if(objInvoice === 0){
                log.error({
                    title: LOG_TITLE,
                    details: 'Error: This custom form is not handled in script.'
                })
                alert('This custom form is not captured by the script. Please contact your administrator.');
                return;
            }

            objInvoiceRec.setValue({ fieldId: 'custbody_sna_invoice_json', value: JSON.stringify(objInvoice) });

            let printUrl = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_misc_fee_pdf',
                deploymentId: 'customdeploy_sna_hul_sl_misc_fee_pdf',
                //params: { 'objInvoice': JSON.stringify(objInvoice) },
                returnExternalUrl: false
            });

            log.debug({title: LOG_TITLE, details: `printUrl: ${JSON.stringify(printUrl)}`});

            if(printUrl)
                window.open(printUrl, "_blank");

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        const FORM_TEMPLATE = [{
            'customFormId': 101, //HUL Service Invoice
            'templateFile': 'sna_hul_service_invoice_template.xml'
        }, {
            'customFormId': 114, //Parts and Object Invoice
            'templateFile': 'sna_parts_invoice_template.xml'
        }, {
            'customFormId': 138, //HUL Rental Invoice
            'templateFile': 'sna_hul_rental_invoice_template.xml'
        }, {
            'customFormId': 139, //HUL Lease Invoice
            'templateFile': 'sna_hul_lease_invoice_template.xml'
        }, {
            'customFormId': 144, //HUL Equipment  Invoice
            'templateFile': 'sna_hul_equipment_invoice_template.xml'
        }];

        const pageInit = (scriptContext) => {
            const LOG_TITLE = "pageInit";
            console.log("Page Init");

            let objInvoice = JSON.parse(window.opener.nlapiGetFieldValue("custbody_sna_invoice_json"));
            let stInvCustomForm = JSON.parse(window.opener.nlapiGetFieldValue("customform"));

            console.log(`stInvCustomForm: ${stInvCustomForm}`);

            let templateFileId = 'sna_hul_service_invoice_template.xml'; //Default Service Invoice Template

            let iCustomFormIndex = FORM_TEMPLATE.findIndex(object => {
                return object.customFormId == stInvCustomForm;
            });

            //if(iCustomFormIndex !== -1)
            //    templateFileId = FORM_TEMPLATE[iCustomFormIndex].templateFile;

            let currentObjInvoice = currentRecord.get();

            console.log(`objInvoice: ${JSON.stringify(objInvoice)}`);
            console.log(`templateFileId: ${templateFileId}`);

            currentObjInvoice.setValue({ fieldId: 'custpage_inv_json_format', value: JSON.stringify(objInvoice)});
            currentObjInvoice.setValue({ fieldId: 'custpage_template_id', value: templateFileId});
        }

        return {
            generateMiscFee: generateMiscFee,
            generatePDF: generatePDF,
            pageInit: pageInit
        };

    });

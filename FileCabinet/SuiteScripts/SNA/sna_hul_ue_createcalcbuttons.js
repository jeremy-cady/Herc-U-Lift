/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
* (BRIEF DESCRIPTION)
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2022/05/16						            natoretiro      	Initial version
* 2022/07/06                                    nretiro             Added functionality for sales order tiered handling fee
* 2023/01/30                                    nretiro             adjustment to open manifest suitelet in order to print label/s
* 2023/06/20                                    nretiro             removed minimum shipping cost logic
* 
*/


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */



define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/format', 'N/https'],
    (record, widget, search, runtime, url, file, format, https) => {

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (objContext) => {
            var stLoggerTitle = 'beforeLoad';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var stParamSpeeDeeShipMethodId = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeeshipmethod'});
            var stClientSideScriptId = runtime.getCurrentScript().getParameter({name: 'custscript_param_clientsidescriptid'});
            var stSpeeDeeToken = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeetoken'});
            var stSpeeDeeCarrierAccount = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeecarrieraccount'});

            try {

                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;
                var sublistParcel = {};

                log.debug(stLoggerTitle, 'stParamSpeeDeeShipMethodId = ' + stParamSpeeDeeShipMethodId +
                    ' | stClientSideScriptId = ' + stClientSideScriptId +
                    ' | stSpeeDeeToken = ' + stSpeeDeeToken +
                    ' | stSpeeDeeCarrierAccount = ' + stSpeeDeeCarrierAccount);

                objForm.clientScriptFileId = stClientSideScriptId;


                if(objContext.type == 'edit' || objContext.type == 'create' || objContext.type == 'view')
                {
                    if(objContext.type != 'view')
                    {

                        objForm.addButton({ id: 'custpage_btn_calc', label: 'Calculate Shipping Rate', functionName: 'calculateShippingCost("' + stParamSpeeDeeShipMethodId + '", "' + stSpeeDeeToken + '", "' + stSpeeDeeCarrierAccount + '")' });
                    }

                    log.debug(stLoggerTitle, 'objCurrentRecord.type = ' + objCurrentRecord.type);
                    if(objCurrentRecord.type == 'itemfulfillment')
                    {
                        //create subtab and sublist for parcel
                        objForm.addTab({id: 'custpage_tab_parcel', label: 'Parcel (SCRIPT)'});
                        log.debug(stLoggerTitle, 'oobjContext.type = ' + objContext.type);
                        if(objContext.type == 'view')
                        {

                            sublistParcel = objForm.addSublist({id : 'custpage_sublist_parcel', label : 'Parcel (SCRIPT)', type : widget.SublistType.LIST, tab: 'custpage_tab_parcel'});

                        }
                        else
                        {

                            sublistParcel = objForm.addSublist({id : 'custpage_sublist_parcel', label : 'Parcel (SCRIPT)', type : widget.SublistType.EDITOR, tab: 'custpage_tab_parcel'});
                        }

                        objForm.addButton({ id: 'custpage_btn_printparcels', label: 'Print Parcel(s)', functionName: 'printParcel()'});

                        sublistParcel.addField({id: 'custpage_sl_parcelid', label: 'Parcel Id', type: widget.FieldType.INTEGER}).updateDisplayType({displayType: 'hidden'});

                        sublistParcel.addField({id: 'custpage_sl_contentsdesc', label: 'Package Content Description', type: widget.FieldType.TEXTAREA});//.updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_weightinlbs', label: 'Weight In Lbs', type: widget.FieldType.FLOAT });
                        sublistParcel.addField({id: 'custpage_sl_declaredvalue', label: 'Declared Value', type: widget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_lengthininches', label: 'Length In Inches', type: widget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_widthininches', label: 'Width In Inches', type: widget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_heightininches', label: 'Height In Inches', type: widget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});


                        sublistParcel.addField({id: 'custpage_sl_shipmentid', label: 'Shipment Id', type: widget.FieldType.TEXT }).updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_postagelabel', label: 'Postage Label', type: widget.FieldType.TEXT }).updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_trackingnumber', label: 'Tracking Number', type: widget.FieldType.TEXT }).updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_shippingcost', label: 'Shipping Cost', type: widget.FieldType.FLOAT}).updateDisplayType({displayType: 'disabled'});
                        sublistParcel.addField({id: 'custpage_sl_remarks', label: 'Remarks', type: widget.FieldType.TEXTAREA}).updateDisplayType({displayType: 'disabled'});

                        // sublistParcel.addButton({ id: 'custpage_sl_btn_printparcels', label: 'Print Parcel(s)', functionName: 'printParcel()'});

                        var stParcelJSON = objCurrentRecord.getValue({ fieldId: 'custbody_sna_parceljson' });

                        if(!isEmpty(stParcelJSON))
                        {
                            var objParcelJSON = JSON.parse(stParcelJSON);
                            log.debug(stLoggerTitle, 'objParcelJSON = ' + JSON.stringify(objParcelJSON));

                            for(var index in objParcelJSON)
                            {
                                var stLabelURL = '';

                                if(objContext.type == 'view')
                                {
                                    stLabelURL = '<a href = "' + objParcelJSON[index].postageLabel + '">' + objParcelJSON[index].postageLabel + '</a>';

                                    if(objParcelJSON[index].postageLabel == undefined)
                                    {
                                        stLabelURL = null;
                                    }
                                }
                                else
                                {
                                    stLabelURL = objParcelJSON[index].postageLabel;
                                }


                                sublistParcel.setSublistValue({ id: 'custpage_sl_parcelid', value: objParcelJSON[index].parcelId || null, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_weightinlbs', value: objParcelJSON[index].weightInLbs || null, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_contentsdesc', value: objParcelJSON[index].contentDesc || null, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_shipmentid', value: objParcelJSON[index].shippingId || null, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_postagelabel', value: stLabelURL || null, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_trackingnumber', value: objParcelJSON[index].trackingNumber || null, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_declaredvalue', value: objParcelJSON[index].declaredValue || 0, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_lengthininches', value: objParcelJSON[index].lengthInInches || 0, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_widthininches', value: objParcelJSON[index].widthInInches || 0, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_heightininches', value: objParcelJSON[index].heightInInches || 0, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_shippingcost', value: objParcelJSON[index].shippingCost || 0, line: parseInt(index) });
                                sublistParcel.setSublistValue({ id: 'custpage_sl_remarks', value: objParcelJSON[index].remarks || null, line: parseInt(index) });

                            }
                        }


                    }



                }




            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        function afterSubmit_saveParcelDetails(context)
        {
            var stLoggerTitle = 'afterSubmit_saveParcelDetails';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            var stWCSO = runtime.getCurrentScript().getParameter({name: 'custscript_param_sm_willcallshoporder'});
            var obj = {};
            var objParcel = {};
            try
            {

                log.debug(stLoggerTitle, 'context.type = ' + context.type + ' | context.UserEventType.EDIT = ' + context.UserEventType.EDIT);
                if(context.type != context.UserEventType.EDIT && context.type != context.UserEventType.CREATE
                    && context.type != 'pack' && context.type != 'ship')
                {
                    log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + '. ' + context.type + ' is not supported for this operation. <<---|');
                    return;
                }


                var rec = context.newRecord;
                log.debug(stLoggerTitle, 'rec = ' + JSON.stringify(rec));

                var recId = rec.id;
                var recType = rec.type;
                log.debug(stLoggerTitle, 'recId = '+ recId + ' | recType = '+recType);

                var recTrans = record.load({
                    type : recType,
                    id : recId
                });

                if(recType == 'itemfulfillment')
                {
                    var stStatus = recTrans.getValue({ fieldId: 'shipstatus' })

                    var bIsGenerateReturnLabel = recTrans.getValue({ fieldId: 'generatereturnlabel' })
                    log.debug(stLoggerTitle, 'bIsGenerateReturnLabel = ' + bIsGenerateReturnLabel);



                    var stParcel = recTrans.getValue({ fieldId: 'custbody_sna_parceljson' });

                    if(!isEmpty(stParcel))
                    {
                        objParcel = JSON.parse(stParcel);
                        log.debug(stLoggerTitle, 'objParcel = ' + JSON.stringify(objParcel));
                    }


                    log.debug(stLoggerTitle, 'stStatus = ' + stStatus);
                    if(stStatus == 'B' || stStatus == 'C')
                    {
                        // buy order
                        var stSpeeDeeOrderId = recTrans.getValue({ fieldId: 'custbody_sna_speedeeorderid' });

                        if(!isEmpty(stSpeeDeeOrderId))
                        {
                            var objOrder = buyOrder(stSpeeDeeOrderId);

                            obj = JSON.parse(objOrder.body);

                            if(obj.error == undefined)
                            {
                                recTrans.setValue({ fieldId: 'custbody_sna_speedeeorderreturn', value: JSON.stringify(obj)})
                                recTrans.setValue({ fieldId: 'custbody_sna_speedeeorderbought', value: true });
                            }

                            // convert shipping label from PNG to ZPL
                            convertShippingLabel(obj);


                            //retrieve order and repopulate speedee order return field
                            objOrder = retrieveOrder(stSpeeDeeOrderId);
                            obj = JSON.parse(objOrder.body);

                            if(obj.error == undefined)
                            {
                                recTrans.setValue({ fieldId: 'custbody_sna_speedeeorderreturn', value: JSON.stringify(obj)})
                            }

                            for(var i in objParcel)
                            {
                                var stShipmentId = objParcel[i].shippingId;
                                var objShipments = obj.shipments;
                                log.debug(stLoggerTitle, 'objShipments = ' + JSON.stringify(objShipments));
                                for(var ii in objShipments)
                                {
                                    var stShipmentsId = objShipments[ii].id;


                                    if(stShipmentsId == stShipmentId)
                                    {

                                        objParcel[i].postageLabel = objShipments[ii].postage_label.label_zpl_url;
                                        objParcel[i].trackingNumber = objShipments[ii].tracker.tracking_code;
                                        objParcel[i].shippingCost = objShipments[ii].rates[0].rate;
                                    }
                                }
                            }

                        }





                    }

                    for(var index in objParcel)
                    {
                        log.debug(stLoggerTitle, 'modifying item line [' + index + '].');

                        var recParcel = {};
                        //getter
                        var flShippingCost = objParcel[index].shippingCost;
                        var flWeightInLbs = objParcel[index].weightInLbs;
                        var stContentDesc = objParcel[index].contentDesc;
                        var stPostageLabel = objParcel[index].postageLabel;
                        var stShippingId = objParcel[index].shippingId;
                        var stTrackingNumber = objParcel[index].trackingNumber;
                        var flDeclaredValue = objParcel[index].declaredValue;
                        var flLengthInInches = objParcel[index].lengthInInches;
                        var flWidthInInches = objParcel[index].widthInInches;
                        var flHeightInInches = objParcel[index].heightInInches;

                        var intParcelId = objParcel[index].parcelId;

                        log.debug(stLoggerTitle, 'intParcelId = ' + intParcelId);
                        if(isEmpty(intParcelId))
                        {
                            recParcel = record.create({
                                type: 'customrecord_sna_parcel'

                            });
                        }
                        else
                        {
                            recParcel = record.load({ type: 'customrecord_sna_parcel', id: intParcelId });
                        }



                        log.debug(stLoggerTitle, 'flWeightInLbs = '+ flWeightInLbs + ' | stContentDesc = ' + stContentDesc + ' | stTrackingNumber = ' + stTrackingNumber
                            + ' | flDeclaredValue = ' + flDeclaredValue + ' | flLengthInInches = ' + flLengthInInches + ' | flWidthInInches = ' +
                            flWidthInInches + ' | flHeightInInches = ' + flHeightInInches + ' | flShippingCost = ' + flShippingCost +
                            ' | stShippingId = ' + stShippingId + ' | stPostageLabel = ' + stPostageLabel);

                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_ifparcellineid', value: index });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_createdfrom', value: recTrans.getValue({ fieldId: 'createdfrom'}) });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_weightinlbs', value: flWeightInLbs });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_contentsdesc', value: stContentDesc });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_shippingid', value: stShippingId });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_postagelabel', value: stPostageLabel });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_trackingnumber', value: stTrackingNumber });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_declaredvalue', value: flDeclaredValue });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_lengthinches', value: flLengthInInches });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_widthinches', value: flWidthInInches });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_heightinches', value: flHeightInInches });
                        recParcel.setValue({ fieldId: 'custrecord_sna_pc_shippinngcost', value: flShippingCost });

                        var stParcelId = recParcel.save();
                        log.debug(stLoggerTitle, 'stParcelId = '+ stParcelId);

                        if(!isEmpty(stParcelId))
                        {
                            log.debug(stLoggerTitle, 'adding parcel [' + stParcelId + '] to object...');
                            objParcel[index].parcelId = stParcelId;
                        }




                    }


                    log.debug(stLoggerTitle, 'objParcel = '+ JSON.stringify(objParcel));
                    recTrans.setValue({ fieldId: 'custbody_sna_parceljson', value: JSON.stringify(objParcel) });

                    var flCurrRate = recTrans.getValue({ fieldId: 'shippingcost' });

                    log.debug(stLoggerTitle, 'obj.rates = '+ obj.rates);

                    if(obj.rates != undefined)
                    {
                        recTrans.setValue({ fieldId: 'shippingcost', value: obj.rates[0].rate || flCurrRate });
                    }

                    var stShippingMethod = recTrans.getValue({ fieldId: 'shipmethod' });
                    log.debug(stLoggerTitle, 'stShippingMethod = '+ stShippingMethod + ' | stWCSO = ' + stWCSO);
                    if(stShippingMethod == stWCSO)
                    {
                        recTrans.setValue({ fieldId: 'shippingcost', value: 0 });
                    }

                    // re-setting shipping cost to 0
                    // 06/20/2023 - remove minimum shipping cost in IF
                    // remove this line if client wants to revert to the minimum shipping cost logic
                    recTrans.setValue({ fieldId: 'shippingcost', value: 0 });

                }
                else if(recType == 'salesorder')
                {
                    // get sales order amount excluding shipping fee
                    var flSOAmount = recTrans.getValue({ fieldId: 'subtotal' });
                    var flHandlingFee = 0;

                    if(!isEmpty(flSOAmount))
                    {
                        //get handling fee
                        flHandlingFee = getHandlingFee(flSOAmount);
                        log.debug(stLoggerTitle, 'flHandlingFee = '+ flHandlingFee);
                        recTrans.setValue({ fieldId: 'handlingcost', value: flHandlingFee });

                    }
                }


                var stRecId = recTrans.save({ ignoreMandatoryFields: true, enableSourcing: false });
                log.debug(stLoggerTitle, 'stRecId = '+ stRecId);




            }
            catch(err)
            {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }
            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }


        function getHandlingFee(flAmount) {
            var stLoggerTitle = 'getHandlingFee';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');
            var arrFilters = [];
            var objData = {};

            try
            {
                log.debug(stLoggerTitle, 'flAmount = ' + flAmount);
                arrFilters.push(["custrecord_hf_fromamount","lessthanorequalto",flAmount]);



                var objTranSearch = search.create({
                    type: "customrecord_speedee_handlingfeemap",
                    filters: arrFilters,
                    columns:
                        [
                            search.createColumn({
                                name: "custrecord_hf_fromamount",
                                summary: "MAX"
                            }),
                            search.createColumn({
                                name: "custrecord_hf_toamount",
                                summary: "MAX"
                            }),
                            search.createColumn({
                                name: "custrecord_hf_handlingfee",
                                summary: "MAX"
                            })
                        ]
                });

                var searchResultCount = objTranSearch.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                objTranSearch.run().each(function(result) {
                    log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));

                    objData = {

                        fromAmount: result.getValue({ name: 'custrecord_hf_fromamount',summary: "MAX" }),
                        toAmount: result.getValue({ name: 'custrecord_hf_toamount',summary: "MAX" }),
                        handlingFee: result.getValue({ name: 'custrecord_hf_handlingfee',summary: "MAX" })
                    };



                    return false;

                });

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });


            }
            log.debug(stLoggerTitle, 'objData = ' + JSON.stringify(objData));
            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return objData.handlingFee;

        }


        function beforeSubmit_saveParcelDetails(context)
        {
            var stLoggerTitle = 'beforeSubmit_saveParcelDetails';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            try
            {

                var objParcel = {};
                var recTrans = context.newRecord;

                var bIsGenerateReturnLabel = recTrans.getValue({ fieldId: 'generatereturnlabel' })
                log.debug(stLoggerTitle, 'bIsGenerateReturnLabel = ' + bIsGenerateReturnLabel);

                //count item sublist
                var intParcelCount = recTrans.getLineCount({ sublistId: 'custpage_sublist_parcel'});
                log.debug(stLoggerTitle, 'intParcelCount = '+ intParcelCount);

                for(var intPLine = 0; intPLine < intParcelCount; intPLine++)
                {
                    log.debug(stLoggerTitle, 'getting item line [' + intPLine + '].');

                    //getter
                    var flWeightInLbs = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_weightinlbs', line: intPLine });
                    var stContentDesc = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_contentsdesc', line: intPLine });
                    var stShippingId = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_shipmentid', line: intPLine });
                    var stPostageLabel = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custrecord_sna_pc_postagelabel', line: intPLine });
                    var stTrackingNumber = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_trackingnumber', line: intPLine });
                    var flDeclaredValue = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_declaredvalue', line: intPLine });
                    var flLengthInInches = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_lengthininches', line: intPLine });
                    var flWidthInInches = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_widthininches', line: intPLine });
                    var flHeightInInches = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_heightininches', line: intPLine });
                    var flShippingCost = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_shippingcost', line: intPLine });
                    var stRemarks = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_remarks', line: intPLine });
                    var intParcelId = recTrans.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_parcelid', line: intPLine });

                    log.debug(stLoggerTitle, 'flWeightInLbs = ' + flWeightInLbs + ' | stContentDesc = ' + stContentDesc + ' | stShippingId = ' + stShippingId +
                        ' | stTrackingNumber = ' +stTrackingNumber + ' | flDeclaredValue = ' + flDeclaredValue +
                        ' | flLengthInInches = ' + flLengthInInches + ' | flWidthInInches = ' + flWidthInInches +
                        ' | flHeightInInches = ' + flHeightInInches + ' | flShippingCost = ' + flShippingCost +
                        ' | stRemarks = ' + stRemarks + ' | intParcelId = ' + intParcelId);

                    objParcel[intPLine] = {
                        weightInLbs: flWeightInLbs,
                        contentDesc: stContentDesc,
                        shippingId: stShippingId,
                        postageLabel: stPostageLabel,
                        trackingNumber: stTrackingNumber,
                        declaredValue: flDeclaredValue,
                        lengthInInches: flLengthInInches,
                        widthInInches: flWidthInInches,
                        heightInInches: flHeightInInches,
                        shippingCost: flShippingCost,
                        remarks: stRemarks,
                        parcelId: intParcelId
                    };

                    log.debug(stLoggerTitle, 'objParcel = ' + JSON.stringify(objParcel));

                }

                log.debug(stLoggerTitle, 'objParcel = ' + JSON.stringify(objParcel));
                recTrans.setValue({ fieldId: 'custbody_sna_parceljson', value: JSON.stringify(objParcel)});

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });

                throw e;
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        function buyOrder(stSpeeDeeOrderId)
        {
            var stLoggerTitle = 'buyOrder';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var stSpeeDeeToken = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeetoken'});


            try
            {
                var objParam = {
                    "carrier" : "SpeeDee",
                    "service" : "SpeeDeeDelivery"
                };

                var stSpeeDeeAPIURL = 'https://www.easypost.com/api/v2/orders/';
                stSpeeDeeAPIURL += stSpeeDeeOrderId;
                stSpeeDeeAPIURL += '/buy';

                var headers = {
                    'Authorization': "Bearer " + stSpeeDeeToken,
                    'Content-Type': 'application/json'

                };

                log.debug(stLoggerTitle, 'stSpeeDeeAPIURL = ' + stSpeeDeeAPIURL);

                var response = https.post({
                    url: stSpeeDeeAPIURL,
                    body: JSON.stringify(objParam),
                    headers: headers
                });

                log.debug(stLoggerTitle, 'response = ' + JSON.stringify(response));

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });

                throw e;
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return response;
        }

        function convertShippingLabel(obj)
        {
            var stLoggerTitle = 'convertShippingLabel';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var stSpeeDeeToken = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeetoken'});


            try
            {


                var objShipments  = obj.shipments;

                for(var i in objShipments)
                {
                    var stShipmentId = objShipments[i].id;

                    var stSpeeDeeAPIURL = 'https://www.easypost.com/api/v2/shipments/';
                    stSpeeDeeAPIURL += stShipmentId;
                    stSpeeDeeAPIURL += '/label/?file_format=ZPL';

                    log.debug(stLoggerTitle, 'stSpeeDeeAPIURL = ' + stSpeeDeeAPIURL);

                    var headers = {
                        'Authorization': "Bearer " + stSpeeDeeToken,
                        'Content-Type': 'application/json'

                    };

                    var response = https.get({
                        url: stSpeeDeeAPIURL,
                        headers: headers

                    });

                }




                log.debug(stLoggerTitle, 'response = ' + JSON.stringify(response));

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });

                throw e;
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');


        }

        function retrieveOrder(stSpeeDeeOrderId)
        {
            var stLoggerTitle = 'retrieveOrder';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var stSpeeDeeToken = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeetoken'});


            try
            {

                var stSpeeDeeAPIURL = 'https://www.easypost.com/api/v2/orders/';
                stSpeeDeeAPIURL += stSpeeDeeOrderId;


                var headers = {
                    'Authorization': "Bearer " + stSpeeDeeToken,
                    'Content-Type': 'application/json'

                };

                log.debug(stLoggerTitle, 'stSpeeDeeAPIURL = ' + stSpeeDeeAPIURL);

                var response = https.get({
                    url: stSpeeDeeAPIURL,
                    headers: headers
                });

                log.debug(stLoggerTitle, 'response = ' + JSON.stringify(response));

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });

                throw e;
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return response;
        }


        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit_saveParcelDetails,
            afterSubmit: afterSubmit_saveParcelDetails
        }

    });
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
* 2023/01/26						            natoretiro      	Initial version
* 2023/01/30                                    nretiro             adjustment to accommodate execution from item fulfillment
* 
*/


/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */


define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/render'],
    /**
     * @param{file} file
     * @param{format} format
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, format, record, runtime, search, serverWidget, url, render) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var stLoggerTitle = 'onRequest';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');


            try {
                var objRequest = scriptContext.request;
                var objResponse = scriptContext.response;

                var form = serverWidget.createForm({
                    title: 'Shipment Manifest',
                    hideNavbar: false
                });

                form = createForm(form, objRequest);


                form.clientScriptModulePath = './sna_hul_cs_speedeemanifestreport.js';



                objResponse.writePage(form);


                // objResponse.writeFile({    file: objFile,    isInline: true });

            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }


        function createForm(form, objRequest) {
            var stLoggerTitle = 'createForm';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');



            var stDateFrom = objRequest.parameters.dateFrom || new Date();
            var stDateTo = objRequest.parameters.dateTo || new Date();

            stDateFrom = format.format({ value: stDateFrom, type: format.Type.DATE });
            stDateTo = format.format({ value: stDateTo, type: format.Type.DATE });

            log.debug(stLoggerTitle, 'stDateFrom = ' + stDateFrom + ' | stDateTo = ' + stDateTo);

            var stIFId = objRequest.parameters.ifId;
            log.debug(stLoggerTitle, 'stIFId = ' + stIFId);






            if(isEmpty(stIFId))
            {
                form.addButton({id: 'custpage_btn_filter', label: 'Search', functionName: 'processFilter()'});

                var fgDateFilter = form.addFieldGroup({id: 'custpage_fg_datefilter', label: 'Date Filter'});

                var fldDateFrom = form.addField({
                    id: 'custpage_datefrom',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date From',
                    container: 'custpage_fg_datefilter'
                });

                fldDateFrom.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                fldDateFrom.isMandatory = true;

                if (!isEmpty(stDateFrom)) {
                    var dt = new Date(stDateFrom);
                    var dtMonth = dt.getMonth();
                    var dtDay = dt.getDate();
                    var dtYear = dt.getFullYear();

                    stDateFrom = new Date(dtMonth + 1 + '/' + dtDay + '/' + dtYear);

                    fldDateFrom.defaultValue = format.format({
                        value: format.parse({
                            value: stDateFrom,
                            type: format.Type.DATE
                        }), type: format.Type.DATE
                    });
                } else {
                    fldDateFrom.defaultValue = new Date();
                }


                var fldDateTo = form.addField({
                    id: 'custpage_dateto',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date To',
                    container: 'custpage_fg_datefilter'
                });

                fldDateTo.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                fldDateTo.isMandatory = true;

                if (!isEmpty(stDateTo)) {
                    var dt = new Date(stDateTo);
                    var dtMonth = dt.getMonth();
                    var dtDay = dt.getDate();
                    var dtYear = dt.getFullYear();

                    stDateTo = new Date(dtMonth + 1 + '/' + dtDay + '/' + dtYear);

                    fldDateTo.defaultValue = format.format({
                        value: format.parse({
                            value: stDateTo,
                            type: format.Type.DATE
                        }), type: format.Type.DATE
                    });
                } else {
                    fldDateTo.defaultValue = new Date();
                }
            }

            var fgShipmentList = form.addFieldGroup({id: 'custpage_fg_shipmentlist', label: 'Shipment List'});


            form.addButton({ id: 'custpage_sl_btn_printparcels', label: 'Print Parcel(s)', functionName: 'printParcel()'});
            form.addButton({ id: 'custpage_sl_btn_printmanifest', label: 'Print Manifest', functionName: 'printManifest()'});


            if((!isEmpty(stDateFrom) && !isEmpty(stDateTo)))
            {
                log.debug(stLoggerTitle, 'stDateFrom = ' + stDateFrom + ' | stDateTo = ' + stDateTo + ' | stIFId = ' + stIFId);
                form = createSummaryData(form, stDateFrom, stDateTo, stIFId);

            }


            log.debug(stLoggerTitle, '|---> ' + 'Exiting ' + stLoggerTitle + ' <---|');

            return form;
        }

        function createSummaryData(form, stDateFrom, stDateTo, stIFId)
        {
            var stLoggerTitle = 'createSummaryData';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');

            log.debug(stLoggerTitle, 'stDateFrom = ' + stDateFrom + ' | stDateTo = ' + stDateTo + ' | stIFId = ' + stIFId);

            var fgSpdManifestRpt = form.addFieldGroup({id: 'custpage_fg_spdmanifestreport', label: 'SpeeDee Manifest Report' });


            //create subtab and sublist for parcel
            form.addTab({id: 'custpage_tab_parcel', label: 'Parcel (SCRIPT)'});


            var sublistParcel = form.addSublist({id : 'custpage_sublist_parcel', label : 'Parcel (SCRIPT)', type : serverWidget.SublistType.LIST, tab: 'custpage_tab_parcel'});


            sublistParcel.addField({id: 'custpage_sl_parcelid', label: 'Parcel Id', type: serverWidget.FieldType.INTEGER}).updateDisplayType({displayType: 'hidden'});

            sublistParcel.addField({id: 'custpage_sl_contentsdesc', label: 'Package Content Description', type: serverWidget.FieldType.TEXTAREA});//.updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_weightinlbs', label: 'Weight In Lbs', type: serverWidget.FieldType.FLOAT });
            sublistParcel.addField({id: 'custpage_sl_declaredvalue', label: 'Declared Value', type: serverWidget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_lengthininches', label: 'Length In Inches', type: serverWidget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_widthininches', label: 'Width In Inches', type: serverWidget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_heightininches', label: 'Height In Inches', type: serverWidget.FieldType.FLOAT});//.updateDisplayType({displayType: 'disabled'});


            sublistParcel.addField({id: 'custpage_sl_shipmentid', label: 'Shipment Id', type: serverWidget.FieldType.TEXT }).updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_postagelabel', label: 'Postage Label', type: serverWidget.FieldType.TEXT }).updateDisplayType({displayType: 'hidden'});
            sublistParcel.addField({id: 'custpage_sl_postagelabel_link', label: 'Postage Label', type: serverWidget.FieldType.TEXT }).updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_trackingnumber', label: 'Tracking Number', type: serverWidget.FieldType.TEXT }).updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_shippingcost', label: 'Shipping Cost', type: serverWidget.FieldType.FLOAT}).updateDisplayType({displayType: 'disabled'});
            sublistParcel.addField({id: 'custpage_sl_remarks', label: 'Remarks', type: serverWidget.FieldType.TEXTAREA}).updateDisplayType({displayType: 'disabled'});



            // search transaction with Parcel

            var objIF = searchItemFulfillments(stDateFrom, stDateTo, stIFId);
            log.debug(stLoggerTitle, 'objIF = ' + JSON.stringify(objIF) );


            var intLine = 0;
            for(var i in objIF)
            {
                var objParcelJSON = JSON.parse(objIF[i].parcelJSON);
                log.debug(stLoggerTitle, 'objParcelJSON = ' + JSON.stringify(objParcelJSON));

                for(var index in objParcelJSON)
                {
                    var stLabelURL = '';


                    stLabelURL = '<a href = "' + objParcelJSON[index].postageLabel + '">' + objParcelJSON[index].postageLabel + '</a>';




                    sublistParcel.setSublistValue({ id: 'custpage_sl_parcelid', value: objParcelJSON[index].parcelId || null, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_weightinlbs', value: objParcelJSON[index].weightInLbs || null, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_contentsdesc', value: objParcelJSON[index].contentDesc || null, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_shipmentid', value: objParcelJSON[index].shippingId || null, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_postagelabel', value: objParcelJSON[index].postageLabel || null, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_postagelabel_link', value: stLabelURL || null, line: parseInt(intLine) });

                    sublistParcel.setSublistValue({ id: 'custpage_sl_trackingnumber', value: objParcelJSON[index].trackingNumber || null, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_declaredvalue', value: objParcelJSON[index].declaredValue || 0, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_lengthininches', value: objParcelJSON[index].lengthInInches || 0, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_widthininches', value: objParcelJSON[index].widthInInches || 0, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_heightininches', value: objParcelJSON[index].heightInInches || 0, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_shippingcost', value: objParcelJSON[index].shippingCost || 0, line: parseInt(intLine) });
                    sublistParcel.setSublistValue({ id: 'custpage_sl_remarks', value: objParcelJSON[index].remarks || null, line: parseInt(intLine) });

                    intLine++;
                }
            }




            return form;
        }

        function searchItemFulfillments(stDateFrom, stDateTo, stIFId)
        {
            var stLoggerTitle = 'searchItemFulfillments';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');
            var arrFilters = [];
            var objData = {};
            var arrData = [];
            try
            {
                stDateFrom = format.format({ value: stDateFrom, type: format.Type.DATE });
                stDateTo = format.format({ value: stDateTo, type: format.Type.DATE });

                log.debug(stLoggerTitle, 'stDateFrom = ' + stDateFrom + ' | stDateTo = ' + stDateTo + ' | stIFId = ' + stIFId);

                arrFilters.push(["custbody_sna_parceljson","isnotempty",""]);
                arrFilters.push("AND");
                arrFilters.push(["custbody_sna_parceljson","isnot","{}"]);
                arrFilters.push("AND");
                arrFilters.push(["type","anyof","ItemShip"]);

                if(isEmpty(stIFId))
                {
                    arrFilters.push("AND");
                    arrFilters.push(["datecreated","within",stDateFrom,stDateTo]);
                }
                else
                {
                    arrFilters.push("AND");
                    arrFilters.push(["internalid","anyof", stIFId]);
                }

                var objTranSearch = search.create({
                    type: "transaction",
                    filters: arrFilters,
                    columns:
                        [
                            search.createColumn({
                                name: "internalid",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "datecreated",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "transactionnumber",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "custbody_sna_parceljson",
                                summary: "GROUP"
                            })
                        ]
                });

                var searchResultCount = objTranSearch.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                objTranSearch.run().each(function(result) {
                    // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));


                    var internalId = result.getValue({ name: 'internalid', summary: 'GROUP' });

                    objData[internalId] = {

                        dateCreated: result.getValue({ name: 'datecreated', summary: 'GROUP' }),
                        transactionNumber: result.getValue({ name: 'transactionnumber', summary: 'GROUP' }),
                        parcelJSON: result.getValue({ name: 'custbody_sna_parceljson', summary: 'GROUP' })
                    };

                    return true;

                });

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });


            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return objData;

        }


        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }


        return {onRequest}
    });
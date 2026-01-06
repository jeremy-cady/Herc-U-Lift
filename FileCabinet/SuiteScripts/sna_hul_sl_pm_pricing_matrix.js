/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Suitelet script creates Ui to set Item, Quantity, Rate by looking up in PM Price Matrix on Estimate
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/02/24                           Amol Jagkar         Initial version
 * 2023/03/16                           Faye Ang            Updated Quantity field display type = Disable and Quantity = 1 if Service Action's Flat Rate is true
 * 2023/03/16                           Faye Ang            Equipment Type filter will include its children when showing results on sublist
 *
 */
define(['N/record', 'N/search', 'N/ui/serverWidget', './sna_hul_ue_pm_pricing_matrix'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{serverWidget} ui
     */
    (record, search, ui, library) => {

        class PricingMatrix {
            constructor(params) {
                this.params = params;
                this.results = this.fetchResults();

                log.debug('constructor this.results', this.results);
            }

            createUi() {
                let form = ui.createForm({title: 'Pricing Matrix'});

                form.clientScriptFileId = getClientScriptFileId();

                let bodyFields = [{
                    id: 'custpage_sna_customer',
                    type: ui.FieldType.SELECT,
                    source: 'customer',
                    label: 'Customer',
                    defaultValue: this.params["customer"],
                    displayType: ui.FieldDisplayType.DISABLED
                }, {
                    id: 'custpage_sna_trandate',
                    type: ui.FieldType.TEXT,
                    label: 'Transaction Date',
                    defaultValue: this.params["tranDate"],
                    displayType: ui.FieldDisplayType.DISABLED
                }, {
                    id: 'custpage_sna_line',
                    type: ui.FieldType.TEXT,
                    label: 'Line',
                    defaultValue: this.params["line"],
                    displayType: ui.FieldDisplayType.HIDDEN
                }, {
                    id: 'custpage_sna_item',
                    type: ui.FieldType.SELECT,
                    label: 'Item',
                    source: 'item',
                    defaultValue: this.params["item"],
                    isMandatory: true,
                    displayType: ui.FieldDisplayType.ENTRY
                }];

                let bodyFields2 = [{
                    id: 'custpage_sna_geography',
                    type: ui.FieldType.TEXT,
                    label: 'Geography/Zip Code',
                    defaultValue: this.params["zipCode"],
                    displayType: ui.FieldDisplayType.ENTRY
                }, {
                    id: 'custpage_sna_equipment_type',
                    type: ui.FieldType.SELECT,
                    label: 'Equipment Type',
                    source: 'customrecord_cseg_sna_hul_eq_seg',
                    defaultValue: this.params["equipmentType"],
                    displayType: ui.FieldDisplayType.ENTRY
                }, {
                    id: 'custpage_sna_service_action',
                    type: ui.FieldType.SELECT,
                    label: 'Service Action',
                    source: 'customrecord_cseg_sna_revenue_st',
                    defaultValue: this.params["serviceAction"],
                    displayType: ui.FieldDisplayType.ENTRY
                },{
                    id: 'custpage_sna_object',
                    type: ui.FieldType.SELECT,
                    label: 'Object No.',
                    source: 'customrecord_sna_objects',
                    defaultValue: this.params["objectNo"],
                    displayType: ui.FieldDisplayType.ENTRY
                }, {
                    id: 'custpage_sna_frequency',
                    type: ui.FieldType.SELECT,
                    label: 'Frequency',
                    source: 'customrecord_nx_project_type',
                    defaultValue: this.params["frequency"],
                    displayType: ui.FieldDisplayType.ENTRY
                }, {
                    //     id: 'custpage_sna_quantity',
                    //     type: ui.FieldType.INTEGER,
                    //     label: 'Quantity',
                    //     defaultValue: this.params["quantity"],
                    //     displayType: ui.FieldDisplayType.ENTRY,
                    //     isMandatory: true
                    // }, {
                    id: 'custpage_sna_customer_number',
                    type: ui.FieldType.SELECT,
                    label: 'Customer Number',
                    source: 'customer',
                    displayType: ui.FieldDisplayType.ENTRY
                }, {
                    id: 'custpage_sna_pm_rate',
                    type: ui.FieldType.TEXT,
                    label: 'PM Rate',
                    defaultValue: this.params["rate"],
                    displayType: ui.FieldDisplayType.INLINE
                }];

                let bodyFields3 = {
                    id: 'custpage_sna_quantity',
                    type: ui.FieldType.INTEGER,
                    label: 'Quantity',
                    defaultValue: this.params["quantity"],
                    displayType: ui.FieldDisplayType.ENTRY,
                    isMandatory: true
                }

                let serviceActionID = this.params["serviceAction"];
                log.debug('serviceActionID', serviceActionID);

                if (!isEmpty(serviceActionID)) {
                    var flatRateLookup = search.lookupFields({
                        type: 'customrecord_cseg_sna_revenue_st',
                        id: serviceActionID,
                        columns: 'custrecord_sna_hul_flatrate'
                    }).custrecord_sna_hul_flatrate;

                    log.debug('flatRateLookup', flatRateLookup);

                    if (flatRateLookup) {
                        bodyFields3 = {
                            id: 'custpage_sna_quantity',
                            type: ui.FieldType.INTEGER,
                            label: 'Quantity',
                            defaultValue: 1,
                            displayType: ui.FieldDisplayType.DISABLED,
                            isMandatory: true
                        }
                    }
                }

                let displaySublist = false;
                if (!!this.params["item"]) {
                    bodyFields = bodyFields.concat(bodyFields2);
                    bodyFields = bodyFields.concat(bodyFields3);
                    displaySublist = true;
                }

                bodyFields.forEach(options => {
                    let field = form.addField(options);
                    if (!!options.defaultValue)
                        field.defaultValue = options.defaultValue;
                    if (!!options.displayType)
                        field.updateDisplayType({displayType: options.displayType});
                    if (!!options.isMandatory)
                        field.isMandatory = true;
                });

                let sublistFields = [
                    {id: 'list_sna_line', type: ui.FieldType.TEXT, label: 'Line #'},
                    {id: 'list_sna_select', type: ui.FieldType.TEXTAREA, label: 'Select'},
                    {id: 'list_sna_zip_code', type: ui.FieldType.TEXT, label: 'Zip Code'},
                    {
                        id: 'list_sna_equipment_type',
                        type: ui.FieldType.SELECT,
                        label: 'Equipment Type',
                        source: 'customrecord_cseg_sna_hul_eq_seg'
                    },
                    {
                        id: 'list_sna_service_action',
                        type: ui.FieldType.SELECT,
                        label: 'Service Action',
                        source: 'customrecord_cseg_sna_revenue_st'
                    },
                    {
                        id: 'list_sna_object',
                        type: ui.FieldType.SELECT,
                        label: 'Object No.',
                        source: 'customrecord_sna_objects'
                    },
                    {
                        id: 'list_sna_frequency',
                        type: ui.FieldType.SELECT,
                        label: 'Frequency',
                        source: 'customrecord_nx_project_type'
                    },
                    {id: 'list_sna_min_quantity', type: ui.FieldType.TEXT, label: 'Min Quantity'},
                    {id: 'list_sna_max_quantity', type: ui.FieldType.TEXT, label: 'Max Quantity'},
                    {id: 'list_sna_start_date', type: ui.FieldType.TEXT, label: 'Start Date'},
                    {id: 'list_sna_end_date', type: ui.FieldType.TEXT, label: 'End Date'},
                    {id: 'list_sna_rate', type: ui.FieldType.TEXT, label: 'Rate'},
                ];

                log.debug('displaySublist', displaySublist);

                if (displaySublist) {
                    // Sublist Fields
                    let sublistData = form.addSublist({
                        id: 'custpage_sna_ratedetails', type: ui.SublistType.LIST, label: 'PM Price Matrix'
                    });

                    sublistFields.forEach(element => {
                        sublistData.addField(element).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});
                    });

                    log.debug('this.results.length', this.results.length);

                    for (let index = 0; index < this.results.length; index++) {
                        log.debug({title: "Results " + index, details: this.results[index]});
                        sublistData.setSublistValue({
                            id: `list_sna_line`, line: index, value: index + 1
                        });

                        let selectFunction = `function updateRate() {var url = window.location.href + '&rate=${this.results[index]["rate"]}';window.onbeforeunload = null;window.document.location = url;}updateRate();`;

                        sublistData.setSublistValue({
                            id: `list_sna_select`,
                            line: index,
                            value: `<button type="button" onclick="${selectFunction}">Select</button>`
                        });
                        for (let key in this.results[index]) {
                            try {
                                let value = isEmpty(this.results[index][key]) ? null : this.results[index][key];
                                sublistData.setSublistValue({id: `list_sna_${key}`, line: index, value});
                            } catch (e) {
                            }
                        }
                    }
                }
                // form.addButton({id: 'custpage_btn_submit', label: 'Submit', functionName: 'submitLine()'});

                return form;
            }

            fetchResults() {
                let rates = library.getPMRates(this.params);

                log.debug('rates', rates);

                for (let i = 0; i < rates.length; i++) {
                    rates[i].zip_code = rates[i].zipCode;
                    rates[i].equipment_type = rates[i].equipmentType;
                    rates[i].service_action = rates[i].serviceAction;
                    rates[i].object = rates[i].objectNo;
                    rates[i].min_quantity = rates[i].minQuantity;
                    rates[i].max_quantity = rates[i].maxQuantity;
                    rates[i].start_date = rates[i].startDate;
                    rates[i].end_date = rates[i].endDate;
                    rates[i].rate = rates[i].pmRate;
                    rates[i].parent_equipment_type = rates[i].parentEquipmentType;
                }

                log.debug('this.params.equipmentType', this.params.equipmentType);

                if (!!this.params.equipmentType) {
                    log.debug('inside this.params.equipmentType');

                    let equipmentType = this.params.equipmentType;

                    //rates = rates.filter(element => element.equipmentType == this.params.equipmentType || this.params.parentEquipmentType == this.params.equipmentType );
                    rates = rates.filter(function (element) {
                        log.debug('element.equipmentType', element.equipmentType);
                        if (!isEmpty(element.parentEquipmentType)) {
                            log.debug('element.parentEquipmentType', element.parentEquipmentType);
                        }

                        log.debug('equipmentType', equipmentType);

                        return element.equipmentType == equipmentType || element.parentEquipmentType == equipmentType;
                    })

                    log.debug('rates after equipment filter', rates);
                }

                log.debug('this.params.serviceAction', this.params.serviceAction);
                if (!!this.params.serviceAction) {
                    rates = rates.filter(element => element.serviceAction == this.params.serviceAction);
                    log.debug('rates after service action filter', rates);
                }
                if (!!this.params.frequency) {
                    rates = rates.filter(element => element.frequency == this.params.frequency);
                }
                if (!!this.params.objectNo) {
                    rates = rates.filter(element => element.objectNo == this.params.objectNo);
                }

                return rates;
            }

            processRequest() {
            }
        }

        const getClientScriptFileId = () => {
            return search.create({
                type: "file", filters: [{name: "name", operator: "is", values: "sna_hul_cs_pm_pricing_matrix.js"}]
            }).run().getRange(0, 1000)[0].id;
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            // Reading Parameters
            let params = scriptContext.request.parameters;
            log.debug({title: "Params", details: params});

            let pricingMatrix = new PricingMatrix(params);
            if (scriptContext.request.method === 'GET') {
                scriptContext.response.writePage(pricingMatrix.createUi());
            } else {
                let purchaseOrders = pricingMatrix.processRequest(scriptContext.request);

                /*redirect.toSuitelet({
                    scriptId: 'customscript_sna_hul_sl_req_worksheet',
                    deploymentId: 'customdeploy_sna_hul_sl_req_worksheet',
                    parameters: {
                        'purchaseOrders': purchaseOrders.join(",")
                    }
                });*/
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

        return {onRequest}

    });

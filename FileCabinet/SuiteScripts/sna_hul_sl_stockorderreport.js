/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Fetches and combines the data based on the following saved searches and selected filters by the user:
 * - SCRIPT USE - SNA Stock Order Saved Search Main [original] - revised
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/7/2          191788              caranda         Initial version
 * 2024/8/23         191788              caranda         Updated the Saved Search used
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/error', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/redirect', 'N/task'],
    /**
     * @param{error} error
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (error, record, runtime, search, ui, url, redirect, task) => {

        const searchSummaryObj = {
            'GROUP': search.Summary.GROUP,
            'MIN': search.Summary.MIN,
            'MAX': search.Summary.MAX,
            'AVG': search.Summary.AVG,
            'SUM': search.Summary.SUM,
        }
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            const LOG_TITLE = 'GET';

            const itemSrchFields = {
                'filters' : ['custpage_filter_itemcat', 'custpage_filter_vendor', 'custpage_filter_loc', 'custpage_filter_diffmin', 'custpage_filter_diffmax'],
                'columns' : ['custpage_list_item', 'custpage_list_desc', 'custpage_list_itemcat', 'custpage_list_prodcode', 'custpage_list_vendorno', 'custpage_list_manufcode', 'custpage_list_fixedbin', 'custpage_list_unitcost', 'custpage_list_roqty', 'custpage_list_ropoint']
            };

            try{

                if(scriptContext.request.method == 'GET'){

                    let scriptObj = runtime.getCurrentScript();
                    let remainingUsage = scriptObj.getRemainingUsage();

                    log.audit('GET', 'Start Usage = ' + remainingUsage);

                    let requestParamFilter = getFilterFlds(scriptContext.request.parameters);

                    let form = ui.createForm({
                        title: 'Stock Order Report'
                    });

                    form.clientScriptModulePath = './sna_hul_cs_lib_stockordereport.js';

                    let warningField = form.addField({
                        id: 'custpage_warning',
                        type: ui.FieldType.INLINEHTML,
                        label: 'Warning'
                    });

                    //Field Group
                    let filtersFldGrp = form.addFieldGroup({
                        id: 'filtersfldgrp',
                        label: 'Filters'
                    });

                    //Fields for Filters
                    //Item Category
                    let itemCat = form.addField({
                        id: 'custpage_filter_itemcat',
                        type: ui.FieldType.SELECT,
                        source: 'customrecord_sna_hul_itemcategory',
                        label: 'Item Category',
                        container: 'filtersfldgrp'
                    });

                    //Vendor List
                    let vendorList = form.addField({
                        id: 'custpage_filter_vendor',
                        type: ui.FieldType.SELECT,
                        source: 'vendor',
                        label: 'Vendor List',
                        container: 'filtersfldgrp'
                    });

                    //Location
                    let locList = form.addField({
                        id: 'custpage_filter_loc',
                        type: ui.FieldType.SELECT,
                        source: 'location',
                        label: 'Location',
                        container: 'filtersfldgrp'
                    });

                    let locListInclChild = form.addField({
                        id: 'custpage_filter_loc_child',
                        type: ui.FieldType.CHECKBOX,
                        label: 'Include Children',
                        container: 'filtersfldgrp'
                    });

                    //Location Text = hidden
                    let locName = form.addField({
                        id: 'custpage_filter_locname',
                        type: ui.FieldType.TEXT,
                        label: 'Location Name',
                        container: 'filtersfldgrp'
                    });

                    locName.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                    //Demand Period (Start)
                    let demandPeriod = form.addField({
                        id: 'custpage_filter_demper',
                        type: ui.FieldType.DATE,
                        label: 'Demand Period (Start)',
                        container: 'filtersfldgrp'
                    });

                    demandPeriod.isMandatory = true;

                    //Demand Period (End)
                    let demandPeriodEnd = form.addField({
                        id: 'custpage_filter_demper_end',
                        type: ui.FieldType.DATE,
                        label: 'Demand Period (End)',
                        container: 'filtersfldgrp'
                    });

                    demandPeriodEnd.isMandatory = true;

                    //Purchase Order Period
                    let poPeriod = form.addField({
                        id: 'custpage_filter_poper',
                        type: ui.FieldType.DATE,
                        label: 'Purchase Order Period (Start)',
                        container: 'filtersfldgrp'
                    });

                    poPeriod.isMandatory = true;

                    //Purchase Order Period
                    let poPeriodEnd = form.addField({
                        id: 'custpage_filter_poper_end',
                        type: ui.FieldType.DATE,
                        label: 'Purchase Order Period (End)',
                        container: 'filtersfldgrp'
                    });

                    poPeriodEnd.isMandatory = true;

                    //Difference (Min)
                    let diffMin = form.addField({
                        id: 'custpage_filter_diffmin',
                        type: ui.FieldType.INTEGER,
                        label: 'Difference (Min)',
                        container: 'filtersfldgrp'
                    });

                    //Difference (Max)
                    let diffMax = form.addField({
                        id: 'custpage_filter_diffmax',
                        type: ui.FieldType.INTEGER,
                        label: 'Difference (Max)',
                        container: 'filtersfldgrp'
                    });

                    //Greater than, less than or specific ROP Qty
                    let ropQtyTitle  = form.addField({
                        id: 'custpage_filter_ropqtytitle',
                        type: ui.FieldType.INLINEHTML,
                        label: 'ROP Qty',
                        container: 'filtersfldgrp'
                    });
                    ropQtyTitle.defaultValue = '<span class="labelSpanEdit smallgraytextnolink"><b class="smallgraytextnolink">ROP Quantity</b></span>'

                    let ropQtyOperator  = form.addField({
                        id: 'custpage_filter_ropqtyop',
                        type: ui.FieldType.SELECT,
                        label: 'Operator',
                        container: 'filtersfldgrp'
                    }); //Subject to change

                    ropQtyOperator.addSelectOption({
                        value: 'equalsto',
                        text: 'Is'
                    });
                    ropQtyOperator.addSelectOption({
                        value: 'lessthan',
                        text: 'Is Less Than'
                    });
                    ropQtyOperator.addSelectOption({
                        value: 'greaterthan',
                        text: 'Is Greater Than'
                    });
                    let ropQty = form.addField({
                        id: 'custpage_filter_ropqty',
                        type: ui.FieldType.INTEGER,
                        label: 'ROP Qty',
                        container: 'filtersfldgrp'
                    }); //Subject to change

                    //Data Table
                    /*let dataTable = form.addSublist({
                        id: 'custpage_sub_list',
                        type: ui.SublistType.STATICLIST,
                        label: 'Data Table'
                    });*/

                    /*let selectCb = dataTable.addField({
                        id: 'custpage_list_select',
                        type: ui.FieldType.CHECKBOX,
                        label: 'Select'
                    });
                    selectCb.updateDisplayType({displayType: ui.FieldDisplayType.ENTRY});*/


                    //dataTable.addMarkAllButtons();
                    //dataTable.addButton({id: 'custpage_markall', label: 'Mark All'});

                    //form.addSubmitButton({label: 'Fetch Data'});
                    //form.addButton({id: 'custpage_genpo', label: 'Generate PO'});
                    //form.addButton({id: 'custpage_gencsv', label: 'Generate CSV', functionName: 'generateCSV'});

                    form.addSubmitButton({label: 'Generate CSV'});
                    scriptContext.response.writePage(form);

                }else{
                    //POST

                    let params = scriptContext.request.parameters;
                    log.debug('POST', 'params = ' + JSON.stringify(params));

                    let fetchFilters = getFilterFlds(params);

                    log.debug('POST Call MR Parameters', JSON.stringify(fetchFilters));
                    // Create Map/Reduce task
                    log.debug('POST', 'Generate CSV MR')
                    let mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_sna_hul_mr_stockorderrepcsv',
                        //deploymentId: 'customdeploy_sna_hul_mr_stockorderrepcsv',
                        params: {
                            'custscript_sna_form_filters' : JSON.stringify(fetchFilters),
                            'custscript_sna_form_currentuser_id' : runtime.getCurrentUser().id
                        }
                    });

                    // Submit the task
                    let taskId = mrTask.submit();

                    let scriptObj = runtime.getCurrentScript();

                    let initialSubmit = url.resolveScript({
                        scriptId: scriptObj.id,
                        deploymentId: scriptObj.deploymentId,
                        returnExternalUrl: false,
                        params: fetchFilters
                    });

                    redirect.redirect({ url: initialSubmit });

                }


            }catch (e) {
                let stErrorMsg =
                    e.name !== null && e.name !== '' ? `${e.name}: ${e.message}` : `UnexpectedError: ${e.message}`;
                log.error({ title: LOG_TITLE, details: stErrorMsg });
                throw error.create({
                    name: `Error: ${LOG_TITLE}`,
                    message: stErrorMsg
                });
            }

        }

        const getQtyVal = (diff, ropQty) => {
            const LOG_TITLE = getQtyVal;

            ropQty = (isEmpty(ropQty) ? 0 : Number(ropQty));
            diff = (isEmpty(diff) ? 0 : Number(diff));
            let finalQty;

            if(ropQty >= diff){
                finalQty = ropQty
            }else if(diff < 0){
                let newDiff = -diff;

                if(ropQty >= newDiff) {
                    finalQty = ropQty
                }else{
                    finalQty = newDiff;
                }

            }else{
                finalQty = diff
            }

            return finalQty
        }

        const getFilterFlds = (params) => {
            let searchText = "custpage_filter_"; // text to search in keys
            let filteredObject = {};

            for (let key in params) {
                if (key.includes(searchText) && !(key.includes('inpt_')) && !(key.includes('_display'))) {
                    if(!isEmpty(params[key])){
                        filteredObject[key] = params[key];
                    }
                }
            }

            return filteredObject;
        }

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        return {onRequest}

    });

/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script for first suitelet of Rental page
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/6       		                 aduldulao       Initial version.
 * 2022/9/1       		                 aduldulao       Move SO data
 * 2022/9/6       		                 aduldulao       Layout changes
 * 2022/9/13       		                 aduldulao       Change segment ID
 * 2022/9/21       		                 aduldulao       Add filters
 * 2023/1/19       		                 aduldulao       Owner Status and Posting Status
 * 2023/1/19       		                 aduldulao       Dynamic Filtering based on Parent Segment
 * 2023/5/9       		                 aduldulao       Filter for Object Fleet Code
 * 2023/5/16       		                 aduldulao       Remove dummy default
 * 2023/7/11       		                 aduldulao       Rental enhancements
 * 2025/2/27                             elausin         Case #263982
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/redirect', 'N/search', 'N/ui/serverWidget', 'N/format', 'N/runtime'],
    /**
 * @param{redirect} redirect
 * @param{search} search
 */
    (redirect, search, serverWidget, format, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceInt(stValue) {
            var flValue = parseInt(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0;
            }
            return flValue;
        }

        function searchAllResults(objSearch, objOption) {
            if (isEmpty(objOption)) {
                objOption = {};
            }

            var arrResults = [];
            if (objOption.isLimitedResult == true) {
                var rs = objSearch.run();
                arrResults = rs.getRange(0, 1000);

                return arrResults;
            }

            var rp = objSearch.runPaged();
            rp.pageRanges.forEach(function(pageRange) {
                var myPage = rp.fetch({
                    index : pageRange.index
                });
                arrResults = arrResults.concat(myPage.data);
            });

            return arrResults;
        }

        var GLOBAL = {
            PAGESIZE: 50, // number of objects in 1 page. min of 5
        };

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var method = scriptContext.request.method;
            log.debug('method', method);
            // GET
            if (method == 'GET') {
                var params = scriptContext.request.parameters;
                log.debug({title: 'GET - params', details: JSON.stringify(params)});

                var pageId = params.page;
                var objno = params.objno;
                var fleetno = params.fleetno;
                var segm = params.segm;
                var segmtxt = params.segmtxt;
                var segmkey = params.segmkey;
                var dummy = (params.dummy == 'true' ? 'T' : 'F');
                var model = params.model;
                var manuf = params.manuf;
                var selected = params.selected;
                var cust = params.cust;
                var custgrp = params.custgrp;
                var trandate = params.trandate;
                var loccode = params.loccode;
                var respcenter = params.respcenter;
                var newcall = params.newcall;
                var earliest = params.earliest;

                var userObj = runtime.getCurrentUser();
                log.debug({title: 'userObj', details: userObj});

                if (!isEmpty(userObj.id) && newcall == 'T') {
                    var empflds = search.lookupFields({type: search.Type.EMPLOYEE, id: userObj.id, columns: 'location'});
                    log.debug({title: 'empflds', details: empflds});

                    if (!isEmpty(empflds.location)) {
                        var emploc = empflds.location[0].value;
                        if (!isEmpty(emploc)) {
                            respcenter = emploc; // default to user's location
                        }
                    }
                }

                // create form
                var form = serverWidget.createForm({title: 'Available Objects', hideNavBar: true});
                form.clientScriptModulePath = './sna_hul_cs_selectobjects.js';

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add field groups
                var generalfg = form.addFieldGroup({id: 'custpage_generalfg', label: 'General'});
                var filtersfg = form.addFieldGroup({id: 'custpage_filtersfg', label: 'Search Filters'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // create header fields
                var objfld = form.addField({id: 'custpage_objfld', type: serverWidget.FieldType.SELECT, label: 'Object', source: 'customrecord_sna_objects', container: 'custpage_filtersfg'});
                objfld.defaultValue = objno;

                var fleetnofld = form.addField({id: 'custpage_fleetnofld', type: serverWidget.FieldType.TEXT, label: 'Fleet Code', container: 'custpage_filtersfg'});
                fleetnofld.defaultValue = fleetno;

                var segmfld = form.addField({id: 'custpage_segmfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Posting/Category/Group', source: 'customrecord_cseg_sna_hul_eq_seg', container: 'custpage_filtersfg'});
                segmfld.defaultValue = segm;

                var segmkeyfld = form.addField({id: 'custpage_segmkeyfld', type: serverWidget.FieldType.TEXT, label: 'Equipment Posting/Category/Group Keyword', container: 'custpage_filtersfg'});
                segmkeyfld.defaultValue = segmkey;

                var manuffld = form.addField({id: 'custpage_manuffld', type: serverWidget.FieldType.SELECT, label: 'Manufacturer', source: 'customrecord_cseg_hul_mfg', container: 'custpage_filtersfg'});
                manuffld.defaultValue = manuf;

                var modelfld = form.addField({id: 'custpage_modelfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Model', source: 'customlist_sna_equipment_model', container: 'custpage_filtersfg'});
                modelfld.defaultValue = model;

                var respcenterfld = form.addField({id: 'custpage_respcenterfld', type: serverWidget.FieldType.SELECT, label: 'Responsibility Center', source: 'location', container: 'custpage_filtersfg'});
                respcenterfld.defaultValue = respcenter;

                var earliestfld = form.addField({id: 'custpage_earliestfld', type: serverWidget.FieldType.DATE, label: 'Earliest Available Date', container: 'custpage_filtersfg'});
                earliestfld.defaultValue = earliest;

                var dummyfld = form.addField({id: 'custpage_dummyfld', type: serverWidget.FieldType.CHECKBOX, label: 'Dummy', container: 'custpage_filtersfg'});
                dummyfld.defaultValue = dummy;

                var selectedfld = form.addField({id: 'custpage_selectedfld', type: serverWidget.FieldType.LONGTEXT, label: 'Selected List'});
                selectedfld.defaultValue = selected;
                selectedfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var custfld = form.addField({id: 'custpage_custfld', type: serverWidget.FieldType.SELECT, label: 'Customer', source: 'customer', container: 'custpage_generalfg'});
                custfld.defaultValue = cust;
                custfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var trandtefld = form.addField({id: 'custpage_trandtefld', type: serverWidget.FieldType.DATE, label: 'Transaction Date', container: 'custpage_generalfg'});
                trandtefld.defaultValue = !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '';
                trandtefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var custprgrpfld = form.addField({id: 'custpage_custprgrpfld', type: serverWidget.FieldType.SELECT, label: 'Customer Price Group', source: 'customrecord_sna_hul_customerpricinggrou', container: 'custpage_generalfg'});
                custprgrpfld.defaultValue = custgrp;
                custprgrpfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var loccodefld = form.addField({id: 'custpage_loccodefld', type: serverWidget.FieldType.SELECT, label: 'Location', source: 'location', container: 'custpage_generalfg'});
                loccodefld.defaultValue = loccode;
                loccodefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add buttons
                form.addButton({id: 'custpage_backbtn', label: 'Cancel', functionName: 'cancelButton()'});

                // add submit button
                form.addSubmitButton({label: 'Select Object'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // create sublist
                var equipsublist = form.addSublist({id: 'custpage_equipsublist', type: serverWidget.SublistType.LIST, label: 'Objects'});

                // create sublist fields
                var selectsubfld = equipsublist.addField({id: 'custpage_selectsubfld', type: serverWidget.FieldType.RADIO, label: 'Select'});
                selectsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});

                var fleetcodesubfld = equipsublist.addField({id: 'custpage_fleetcodesubfld', type: serverWidget.FieldType.TEXT, label: 'Fleet Code'});
                fleetcodesubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var objidsubfld = equipsublist.addField({id: 'custpage_objidsubfld', type: serverWidget.FieldType.SELECT, label: 'Object', source: 'customrecord_sna_objects'});
                objidsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var segmsubfld = equipsublist.addField({id: 'custpage_segmsubfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Posting/Category Group', source: 'customrecord_cseg_sna_hul_eq_seg'});
                segmsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var manufsegmsubfld = equipsublist.addField({id: 'custpage_manufsegmsubfld', type: serverWidget.FieldType.SELECT, label: 'Manufacturer', source: 'customrecord_cseg_hul_mfg'});
                manufsegmsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var modelsubfld = equipsublist.addField({id: 'custpage_modelsubfld', type: serverWidget.FieldType.SELECT, label: 'Model', source: 'customlist_sna_equipment_model'});
                modelsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var respcentersubfld = equipsublist.addField({id: 'custpage_respcentersubfld', type: serverWidget.FieldType.SELECT, label: 'Responsibility Center', source: 'location'});
                respcentersubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var statusubfld = equipsublist.addField({id: 'custpage_statusubfld', type: serverWidget.FieldType.SELECT, label: 'Status', source: 'customlist_sna_rental_status'});
                statusubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var datesubfld = equipsublist.addField({id: 'custpage_datesubfld', type: serverWidget.FieldType.DATE, label: 'Earliest Available Date'});
                datesubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // run search
                var retrievesearch = runSearch(GLOBAL.PAGESIZE, objno, segmtxt, segmkey, respcenter, model, manuf, dummy, earliest, fleetno);
                var pagecount = Math.ceil(forceInt(retrievesearch.count) / GLOBAL.PAGESIZE);
                log.debug({title: 'GET - pagecount', details: 'retrievesearch.count: ' + forceInt(retrievesearch.count) + ' / GLOBAL.PAGESIZE: ' + GLOBAL.PAGESIZE + ' = ' + pagecount});

                // Set pageId to correct value if out of index
                if (isEmpty(pageId) || pageId < 0)
                    pageId = 0;
                else if (pageId >= pagecount)
                    pageId = pagecount - 1;

                log.debug({title: 'GET - final pageId', details: pageId});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add sublist buttons
                var prevbtn = equipsublist.addButton({id: 'custpage_previous', label: 'Previous', functionName: 'redirectSuitelet(' + (Number(pageId) - 1) + ',' + true + ',' + true + ')'});
                if (pageId == 0) prevbtn.isDisabled = true;

                var nextbtn = equipsublist.addButton({id: 'custpage_next', label: 'Next', functionName: 'redirectSuitelet(' + (Number(pageId) + 1) + ',' + true + ',' + true + ')'});
                if (pageId == pagecount - 1) nextbtn.isDisabled = true;

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add page field
                var selectOptions = form.addField({id: 'custpage_sna_pageid', label: 'Page (' + pagecount + ')', type: serverWidget.FieldType.SELECT});
                selectOptions.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                for (i = 0; i < pagecount; i++) {
                    if (i == pageId) {
                        selectOptions.addSelectOption({value: 'pageid_' + i, text: ((i * GLOBAL.PAGESIZE) + 1) + ' - ' + ((i + 1) * GLOBAL.PAGESIZE), isSelected: true});
                    } else {
                        selectOptions.addSelectOption({value: 'pageid_' + i, text: ((i * GLOBAL.PAGESIZE) + 1) + ' - ' + ((i + 1) * GLOBAL.PAGESIZE)});
                    }
                }

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // set sublist values
                var addResults = pagecount > 0 ? fetchSearchResult(retrievesearch, pageId, selected) : [];

                for (var a = 0; a < addResults.length; a++) {
                    for (var ind in addResults[a]) {
                        if (!isEmpty(addResults[a][ind])) {
                            equipsublist.setSublistValue({id: ind, line: a, value: addResults[a][ind]});
                        }
                    }
                }

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                scriptContext.response.writePage(form);
            }
            // POST
            else {
                var request = scriptContext.request;
                var arrselected = request.parameters.custpage_selectedfld;
                var cust = request.parameters.custpage_custfld;
                var custgrp = request.parameters.custpage_custprgrpfld;
                var trandate = request.parameters.custpage_trandtefld;
                var loccode = request.parameters.custpage_loccodefld;

                redirect.toSuitelet({scriptId: 'customscript_sna_hul_sl_configureobject', deploymentId: 'customdeploy_sna_hul_sl_configureobject',
                    parameters: {
                        selected: arrselected.toString(),
                        cust: cust,
                        custgrp: custgrp,
                        trandate: trandate,
                        loccode: loccode
                    }
                });
            }
        }

        /**
         * Initial search of objects
         * @param searchPageSize
         * @param objno
         * @param segm
         * @param segmkey
         * @param respcenter
         * @param model
         * @param manuf
         * @param dummy
         * @param earliest
         * @param fleetno
         * @returns {SearchPagedData}
         */
        function runSearch(searchPageSize, objno, segm, segmkey, respcenter, model, manuf, dummy, earliest, fleetno) {
            var sametoday = false;
            var today = format.format({value: new Date(), type: format.Type.DATE});
            var dteearliest = !isEmpty(earliest) ? format.parse({value: earliest, type: format.Type.DATE}) : '';
            var temp = !isEmpty(earliest) ?  new Date(dteearliest) : '';

            var expectedreturn = !isEmpty(temp) ? format.format({value: new Date(temp.setDate(temp.getDate() - 1)), type: format.Type.DATE}) : ''//!isEmpty(temp) ? format.format({value: new Date(temp.setDate(temp.getDate() - 1)), type: format.Type.DATE}) : '';
            if (today == earliest) {
                sametoday = true;
            }

            log.debug({title: 'runSearch', details: 'today: ' + today + ' | earliest: ' + earliest + ' | expectedreturn: ' + expectedreturn + ' | sametoday: ' + sametoday});

            var filters = [];
            filters.push(['custrecord_sna_owner_status', search.Operator.ANYOF, ['3', '2']]);
            filters.push('and');
            filters.push(['custrecord_sna_posting_status', search.Operator.ANYOF, ['2', '3', '4', '5']]);

            if (!isEmpty(objno)) {
                filters.push('and');
                filters.push(['internalid', search.Operator.IS, objno]);
            }
            if (!isEmpty(fleetno)) {
                filters.push('and');
                filters.push(['custrecord_sna_fleet_code', search.Operator.CONTAINS, fleetno]);
            }
            if (!isEmpty(segm)) {
                var parentsegm = segm + ' : ';

                var _filters = [];
                _filters.push(['formulatext: {cseg_sna_hul_eq_seg.parent}', search.Operator.CONTAINS, parentsegm]);
                _filters.push('or');
                _filters.push(['formulatext: {cseg_sna_hul_eq_seg.name}', search.Operator.CONTAINS, parentsegm]);
                _filters.push('or');
                _filters.push(['formulatext: {cseg_sna_hul_eq_seg.name}', search.Operator.IS, segm]);

                filters.push('and');
                filters.push(_filters);
            }
            if (!isEmpty(respcenter) && respcenter != 0) {
                /*if (dummy == 'T') {
                    filters.push('and');
                    filters.push(['custrecord_sna_hul_rent_dummy', search.Operator.IS, dummy]);
                }*/
                //else {
                    filters.push('and');
                    filters.push(['custrecord_sna_responsibility_center', search.Operator.IS, respcenter]);
                //}
            }
            //else if (isEmpty(respcenter) || respcenter == 0) {
                filters.push('and');
                filters.push(['custrecord_sna_hul_rent_dummy', search.Operator.IS, dummy]);
            //}
            if (!isEmpty(model)) {
                filters.push('and');
                filters.push(['custrecord_sna_equipment_model', search.Operator.IS, model]);
            }
            if (!isEmpty(manuf)) {
                filters.push('and');
                filters.push(['cseg_hul_mfg', search.Operator.IS, manuf]);
            }
            if (!isEmpty(segmkey)) {
                var _filters = [];
                _filters.push(['formulatext: {cseg_sna_hul_eq_seg.parent}', search.Operator.CONTAINS, segmkey]);
                _filters.push('or');
                _filters.push(['formulatext: {cseg_sna_hul_eq_seg.name}', search.Operator.CONTAINS, segmkey]);

                filters.push('and');
                filters.push(_filters);
            }
            if (!isEmpty(expectedreturn)) {
                var _filters = [];
                _filters.push(['custrecord_sna_exp_rental_return_date', search.Operator.ONORBEFORE, expectedreturn]);

                if (sametoday) {
                    _filters.push('or');
                    _filters.push(['custrecord_sna_exp_rental_return_date', search.Operator.ISEMPTY, '']);
                }

                filters.push('and');
                filters.push(_filters);
            }

            log.debug({title: 'runSearch', details: JSON.stringify(filters)});

            var columns = [];
            columns.push(search.createColumn({name: 'internalid'}));
            columns.push(search.createColumn({name: 'cseg_sna_hul_eq_seg'}));
            columns.push(search.createColumn({name: 'cseg_hul_mfg'}));
            columns.push(search.createColumn({name: 'custrecord_sna_responsibility_center'}));
            columns.push(search.createColumn({name: 'name', join: 'CUSTRECORD_SNA_RESPONSIBILITY_CENTER', sort: search.Sort.ASC}));
            columns.push(search.createColumn({name: 'custrecord_sna_rental_status'}));
            columns.push(search.createColumn({name: 'custrecord_sna_exp_rental_return_date', sort: search.Sort.ASC}));
            columns.push(search.createColumn({name: 'custrecord_sna_equipment_model'}));
            columns.push(search.createColumn({name: 'custrecord_sna_fleet_code'}));

            var objsearch = search.create({type: 'customrecord_sna_objects', filters: filters, columns: columns});

            return objsearch.runPaged({
                pageSize: searchPageSize
            });
        }

        /**
         * Build the rows from the saved search results
         * @param pagedData
         * @param pageIndex
         * @param selected
         * @returns {*[]}
         */
        function fetchSearchResult(pagedData, pageIndex, selected) {
            var searchPage = pagedData.fetch({
                index: pageIndex
            });

            var arrselected =  !isEmpty(selected) ? selected.split(',') : [];
            var results = [];
            var sercols = [];

            searchPage.data.forEach(function (result) {
                var objid = result.id;
                var objno = result.getValue({name: 'internalid'});
                var segm = result.getValue({name: 'cseg_sna_hul_eq_seg'});
                var manufsegm = result.getValue({name: 'cseg_hul_mfg'});
                var respcenter = result.getValue({name: 'custrecord_sna_responsibility_center'});
                var model = result.getValue({name: 'custrecord_sna_equipment_model'});
                var status = result.getValue({name: 'custrecord_sna_rental_status'});
                var date = result.getValue({name: 'custrecord_sna_exp_rental_return_date'});
                if (!isEmpty(date)) {
                    date = format.parse({value: result.getValue({name: 'custrecord_sna_exp_rental_return_date'}), type: format.Type.DATE});
                    date = format.format({value: new Date(date.setDate(date.getDate() + 1)), type: format.Type.DATE});
                }
                var selected = (arrselected.indexOf(objid) != -1) ? 'T' : 'F';
                var fleetcode = result.getValue({name: 'custrecord_sna_fleet_code'});

                var objvalues = {};
                objvalues['custpage_objidsubfld'] = !isEmpty(objid) ? objid : '';
                objvalues['custpage_fleetcodesubfld'] = !isEmpty(fleetcode) ? fleetcode : '';
                objvalues['custpage_segmsubfld'] = !isEmpty(segm) ? segm : '';
                objvalues['custpage_manufsegmsubfld'] = !isEmpty(manufsegm) ? manufsegm : '';
                objvalues['custpage_respcentersubfld'] = !isEmpty(respcenter) ? respcenter : '';
                objvalues['custpage_modelsubfld'] = !isEmpty(model) ? model : '';
                objvalues['custpage_statusubfld'] = !isEmpty(status) ? status : '';
                objvalues['custpage_datesubfld'] = !isEmpty(date) ? date : format.format({value: new Date(), type: format.Type.DATE});
                objvalues['custpage_selectsubfld'] = selected;

                results.push(objvalues);
            });

            return results;
        }

        return {onRequest}

    });
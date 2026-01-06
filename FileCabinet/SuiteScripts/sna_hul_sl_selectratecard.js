/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script of the 3rd suitelet page of the rental module
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/12       		                 aduldulao       Initial version.
 * 2022/8/30       		                 aduldulao       Update filters of rate cards
 * 2022/9/13       		                 aduldulao       Change segment ID
 * 2022/9/21       		                 aduldulao       Add new filters
 * 2022/10/9       		                 aduldulao       Pagination
 * 2023/2/10       		                 aduldulao       Calculate Rent Cost
 * 2023/2/20       		                 aduldulao       Prioritization Rate Card Sublist
 * 2023/7/11       		                 aduldulao       Rental enhancements
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/format', 'N/search', 'N/ui/serverWidget', 'N/runtime', 'N/redirect', 'N/xml'],
    /**
 * @param{format} format
 * @param{search} search
 * @param{serverWidget} serverWidget
 */

    (format, search, serverWidget, runtime, redirect, xml) => {

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

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
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

            // GET
            if (method == 'GET') {
                var params = scriptContext.request.parameters;
                log.debug({title: 'GET - params', details: JSON.stringify(params)});

                var pageId = params.page;
                var selectedrc = params.selectedrc;
                var fromline = params.fromline;
                var linenum = params.linenum;
                var objid = params.selected;
                var pricegrp = params.custgrp;
                var cust = params.cust;
                var trandate = params.trandate;
                var loccode = params.loccode;
                var showall = params.showall;
                var rentalcomments = params.rentalcomments;

                // create form
                var form = serverWidget.createForm({title: 'Select Rental Rate Card', hideNavBar: true});
                form.clientScriptModulePath = './sna_hul_cs_selectratecard.js';

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add field groups
                var generalfg = form.addFieldGroup({id: 'custpage_generalfg', label: 'General'});
                var objfg = form.addFieldGroup({id: 'custpage_objfg', label: 'Object'});
                var ratecardsfg = form.addFieldGroup({id: 'custpage_ratecardsfg', label: 'Rental Rate Cards'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // create header fields
                var configcommentsfld = form.addField({id: 'custpage_configcommentsfld', type: serverWidget.FieldType.TEXTAREA, label: 'Rental Configuration Comments', container: 'custpage_generalfg'});
                configcommentsfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                configcommentsfld.defaultValue = rentalcomments;

                var objidfld = form.addField({id: 'custpage_objidfld', type: serverWidget.FieldType.SELECT, label: 'Object', source: 'customrecord_sna_objects', container: 'custpage_objfg'});
                objidfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                objidfld.defaultValue = objid;

                var segmfld = form.addField({id: 'custpage_segmfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Posting/Category/Group', source: 'customrecord_cseg_sna_hul_eq_seg', container: 'custpage_objfg'});
                segmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var manufsegmfld = form.addField({id: 'custpage_manufsegmfld', type: serverWidget.FieldType.SELECT, label: 'Manufacturer', source: 'customrecord_cseg_hul_mfg', container: 'custpage_objfg'});
                manufsegmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var modelfld = form.addField({id: 'custpage_modelfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Model', source: 'customlist_sna_equipment_model', container: 'custpage_objfg'});
                modelfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var heightfld = form.addField({id: 'custpage_heightfld', type: serverWidget.FieldType.TEXT, label: 'Height', container: 'custpage_objfg'});
                heightfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var capacityfld = form.addField({id: 'custpage_capacityfld', type: serverWidget.FieldType.TEXT, label: 'Capacity', container: 'custpage_objfg'});
                capacityfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var custfld = form.addField({id: 'custpage_custfld', type: serverWidget.FieldType.SELECT, label: 'Customer', source: 'customer', container: 'custpage_generalfg'});
                custfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                custfld.defaultValue = cust;

                var trandtefld = form.addField({id: 'custpage_trandtefld', type: serverWidget.FieldType.DATE, label: 'Transaction Date', container: 'custpage_generalfg'});
                trandtefld.defaultValue = !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '';
                trandtefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var custpricegrpfld = form.addField({id: 'custpage_custpricegrpfld', type: serverWidget.FieldType.SELECT, label: 'Customer Price Group', source: 'customrecord_sna_hul_customerpricinggrou', container: 'custpage_generalfg'});
                custpricegrpfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                custpricegrpfld.defaultValue = pricegrp;

                var loccodefld = form.addField({id: 'custpage_loccodefld', type: serverWidget.FieldType.SELECT, label: 'Location', source: 'location', container: 'custpage_generalfg'});
                loccodefld.defaultValue = loccode;
                loccodefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var selectedfld = form.addField({id: 'custpage_selectedfld', type: serverWidget.FieldType.LONGTEXT, label: 'Selected List'});
                selectedfld.defaultValue = selectedrc;
                selectedfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var fromlinefld = form.addField({id: 'custpage_fromlinefld', type: serverWidget.FieldType.TEXT, label: 'From Line'});
                fromlinefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                fromlinefld.defaultValue = fromline;

                var linenumfld = form.addField({id: 'custpage_linenumfld', type: serverWidget.FieldType.TEXT, label: 'Line Num'});
                linenumfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                linenumfld.defaultValue = linenum;

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add buttons
                if (fromline != 'T') { // from SO or quote line
                    form.addButton({id: 'custpage_backbtn', label: 'Back', functionName: 'backButton()'});
                }
                // add submit button
                form.addSubmitButton({label: 'Next'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // create sublist
                var ratesublist = form.addSublist({id: 'custpage_ratesublist', type: serverWidget.SublistType.LIST, label: 'Rental Rate Cards'});

                // create sublist fields
                var selectsubfld = ratesublist.addField({id: 'custpage_selectsubfld', type: serverWidget.FieldType.RADIO, label: 'Select'});
                selectsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});

                var rateidsubfld = ratesublist.addField({id: 'custpage_rateidsubfld', type: serverWidget.FieldType.SELECT, label: 'Rate Card', source: 'customrecord_sna_hul_rental_rate_card'});
                rateidsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var ratenamesubfld = ratesublist.addField({id: 'custpage_ratenamesubfld', type: serverWidget.FieldType.TEXT, label: 'ID'});
                ratenamesubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var objsubfld = ratesublist.addField({id: 'custpage_objsubfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Object', source: 'customrecord_sna_objects'});
                objsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var segsubfld = ratesublist.addField({id: 'custpage_segsubfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Posting/Category Group', source: 'customrecord_cseg_sna_hul_eq_seg'});
                segsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var manufsegmsubfld = ratesublist.addField({id: 'custpage_manufsegmsubfld', type: serverWidget.FieldType.SELECT, label: 'Manufacturer', source: 'customrecord_cseg_hul_mfg'});
                manufsegmsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var custprgrpsubfld = ratesublist.addField({id: 'custpage_custprgrpsubfld', type: serverWidget.FieldType.SELECT, label: 'Customer Price Group', source: 'customrecord_sna_hul_customerpricinggrou'});
                custprgrpsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var custnosubfld = ratesublist.addField({id: 'custpage_custnosubfld', type: serverWidget.FieldType.SELECT, label: 'Customer No', source: 'customer'});
                custnosubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var modelsubfld = ratesublist.addField({id: 'custpage_modelsubfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Model', source: 'customlist_sna_equipment_model'});
                modelsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var respcentersubfld = ratesublist.addField({id: 'custpage_respcentersubfld', type: serverWidget.FieldType.SELECT, label: 'Responsibility Center', source: 'location'});
                respcentersubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var heightsubfld = ratesublist.addField({id: 'custpage_heightsubfld', type: serverWidget.FieldType.TEXT, label: 'Height'});
                heightsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var mincapsubfld = ratesublist.addField({id: 'custpage_mincapsubfld', type: serverWidget.FieldType.TEXT, label: 'Min Capacity'});
                mincapsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var maxcapsubfld = ratesublist.addField({id: 'custpage_maxcapsubfld', type: serverWidget.FieldType.TEXT, label: 'Max Capacity'});
                maxcapsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var countersubfld = ratesublist.addField({id: 'custpage_countersubfld', type: serverWidget.FieldType.TEXT, label: 'Parameters Met'});
                countersubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var descsubfld = ratesublist.addField({id: 'custpage_descsubfld', type: serverWidget.FieldType.TEXT, label: 'Description'});
                descsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var termssubfld = ratesublist.addField({id: 'custpage_termssubfld', type: serverWidget.FieldType.TEXT, label: 'Terms and Rates'});
                termssubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // search by filter counters
                var dataCounters = getDataWithCounters(pricegrp, cust, objid, segmfld, manufsegmfld, modelfld, loccode, selectedrc, showall, heightfld, capacityfld);

                if (!isEmpty(dataCounters)) {
                    // sort by counters (descending)
                    dataCounters.sort(function(a, b) {
                        return (forceInt(a.custpage_countersubfld) < forceInt(b.custpage_countersubfld)) ? 1 : -1
                    });
                }
                log.debug({title: 'GET - getDataWithCounters', details: JSON.stringify(dataCounters)});

                var pagecount = Math.ceil(forceInt(dataCounters.length) / GLOBAL.PAGESIZE);
                log.debug({title: 'GET - pagecount', details: 'dataCounters.length: ' + forceInt(dataCounters.length) + ' / GLOBAL.PAGESIZE: ' + GLOBAL.PAGESIZE + ' = ' + pagecount});

                // Set pageId to correct value if out of index
                if (isEmpty(pageId) || pageId < 0)
                    pageId = 0;
                else if (pageId >= pagecount)
                    pageId = pagecount - 1;

                log.debug({title: 'GET - final pageId', details: pageId});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add sublist buttons
                var prevbtn = ratesublist.addButton({id: 'custpage_previous', label: 'Previous', functionName: 'redirectSuitelet(' + (Number(pageId) - 1) + ',' + true + ',' + true + ')'});
                if (pageId == 0) prevbtn.isDisabled = true;

                var nextbtn = ratesublist.addButton({id: 'custpage_next', label: 'Next', functionName: 'redirectSuitelet(' + (Number(pageId) + 1) + ',' + true + ',' + true + ')'});
                if (pageId == pagecount - 1) nextbtn.isDisabled = true;

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add checkbox
                var showallfld = form.addField({id: 'custpage_showallfld', label: 'Show All Rental Rate Cards', type: serverWidget.FieldType.CHECKBOX, container: 'custpage_ratecardsfg'});
                showallfld.defaultValue = (showall == 'true') ? 'T' : 'F';

                // add page field
                var selectOptions = form.addField({id: 'custpage_sna_pageid', label: 'Page (' + pagecount + ')', type: serverWidget.FieldType.SELECT, container: 'custpage_ratecardsfg'});
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
                var addResults = pagecount > 0 ? fetchResultsRange(dataCounters, pageId, GLOBAL.PAGESIZE, selectedrc) : [];

                for (var a = 0; a < addResults.length; a++) {
                    for (var ind in addResults[a]) {
                        if (!isEmpty(addResults[a][ind])) {
                            ratesublist.setSublistValue({id: ind, line: a, value: addResults[a][ind]});
                        }
                    }
                }

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                scriptContext.response.writePage(form);
            }

            // POST
            else {
                var request = scriptContext.request;

                var selectedratecard = request.parameters.custpage_selectedfld;
                var objid = request.parameters.custpage_objidfld;
                var cust = request.parameters.custpage_custfld;
                var custgrp = request.parameters.custpage_custpricegrpfld;
                var trandate = request.parameters.custpage_trandtefld;
                var loccode = request.parameters.custpage_loccodefld;
                var fromline = request.parameters.custpage_fromlinefld;
                var linenum = request.parameters.custpage_linenumfld;
                var rentalcomments = request.parameters.custpage_configcommentsfld;

                redirect.toSuitelet({scriptId: 'customscript_sna_hul_sl_costingpage', deploymentId: 'customdeploy_sna_hul_sl_costingpage',
                    parameters: {
                        objid: objid,
                        selectedratecard: selectedratecard,
                        fromline: fromline,
                        linenum: linenum,
                        cust: cust,
                        custgrp: custgrp,
                        trandate: trandate,
                        loccode: loccode,
                        rentalcomments: rentalcomments
                    }
                });
            }
        }

        /**
         * Get counters of search results
         * @param pricegrp
         * @param cust
         * @param objid
         * @param segmfld
         * @param manufsegmfld
         * @param modelfld
         * @param loccode
         * @param selectedrc
         * @param showall
         * @param heightfld
         * @param capacityfld
         * @returns {*[]}
         */
        function getDataWithCounters(pricegrp, cust, objid, segmfld, manufsegmfld, modelfld, loccode, selectedrc, showall, heightfld, capacityfld) {
            var finaldata = [];

            var objsegment = '';
            var objmodel = '';
            var objresp = '';
            var objmanuf = '';
            var objheight = '';
            var objcapacity = '';
            var objdummy = false;

            var arrselected =  !isEmpty(selectedrc) ? selectedrc.split(',') : [];

            if (!isEmpty(objid)) {
                var objflds = search.lookupFields({type: 'customrecord_sna_objects', id: objid, columns: ['custrecord_sna_equipment_model', 'custrecord_sna_hul_rent_dummy', 'cseg_sna_hul_eq_seg', 'cseg_hul_mfg', 'custrecord_sna_work_height', 'custrecord_sna_capacity_new']});

                if (!isEmpty(objflds.cseg_sna_hul_eq_seg)) {
                    objsegment = objflds.cseg_sna_hul_eq_seg[0].value;
                    segmfld.defaultValue = objsegment;
                }
                if (!isEmpty(objflds.custrecord_sna_equipment_model)) {
                    objmodel = objflds.custrecord_sna_equipment_model[0].value;
                    modelfld.defaultValue = objmodel;
                }
                if (!isEmpty(objflds.custrecord_sna_hul_rent_dummy)) {
                    objdummy = objflds.custrecord_sna_hul_rent_dummy;
                }
                if (!isEmpty(objflds.cseg_hul_mfg)) {
                    objmanuf = objflds.cseg_hul_mfg[0].value;
                    manufsegmfld.defaultValue = objmanuf;
                }
                if (!isEmpty(objflds.custrecord_sna_work_height)) {
                    objheight = objflds.custrecord_sna_work_height;
                    heightfld.defaultValue = objheight;
                }
                if (!isEmpty(objflds.custrecord_sna_capacity_new)) {
                    objcapacity = objflds.custrecord_sna_capacity_new;
                    capacityfld.defaultValue = objcapacity;
                }
            }

            var searchres = search.load({id: 'customsearch_sna_hul_ratecard'});
            var filterexp = searchres.filterExpression;
            var subfilters = [];

            // Show all Rental Rate Cards where HUL Segment Matches other Rental Rate Card HUL Segment
            var segfil = [];
            if (!isEmpty(objsegment)) {
                segfil.push(['cseg_sna_hul_eq_seg', search.Operator.ANYOF, objsegment]);
                segfil.push('or');
            }
            segfil.push(['cseg_sna_hul_eq_seg', search.Operator.ANYOF, ["@NONE@"]]);

            subfilters.push(segfil);
            subfilters.push('and');

            // If Rental Rate Card has a Customer Pricing Group, only show them if it matches the Customer Pricing Group on the Sales Order else show other Rental Rate Cards
            var prcefil = [];
            if (!isEmpty(pricegrp)) {
                prcefil.push(['custrecord_sna_hul_ratecard_custpricegrp', search.Operator.ANYOF, pricegrp]);
                prcefil.push('or');
            }
            prcefil.push(['custrecord_sna_hul_ratecard_custpricegrp', search.Operator.ANYOF, ["@NONE@"]]);

            subfilters.push(prcefil);
            subfilters.push('and');

            // If Rental Rate Card has an Equipment Object, only show them if it matches the Object Selected else show other Rental Cards
            var objfil = [];
            if (!isEmpty(objid)) {
                objfil.push(['custrecord_sna_hul_ratecard_object', search.Operator.IS, objid]);
                objfil.push('or');
            }
            objfil.push(['custrecord_sna_hul_ratecard_object', search.Operator.ANYOF, ["@NONE@"]]);

            subfilters.push(objfil);
            subfilters.push('and');

            // If Rental Rate Card has a Customer No, only show them if it matches the Customer on the Sales Order
            var custfil = [];
            if (!isEmpty(cust)) {
                custfil.push(['custrecord_sna_hul_ratecard_customer', search.Operator.ANYOF, cust]);
                custfil.push('or');
            }
            custfil.push(['custrecord_sna_hul_ratecard_customer', search.Operator.ANYOF, ["@NONE@"]]);

            subfilters.push(custfil);
            subfilters.push('and');

            // If Rental Rate Card has a Model, only show them it it Matches the Object Model
            var modelfil = [];
            if (!isEmpty(objmodel)) {
                modelfil.push(['custrecord_sna_hul_ratecard_eqmodel', search.Operator.ANYOF, objmodel]);
                modelfil.push('or');
            }
            modelfil.push(['custrecord_sna_hul_ratecard_eqmodel', search.Operator.ANYOF, ["@NONE@"]]);

            subfilters.push(modelfil);
            subfilters.push('and');

            // If Rental Rate Card has a Manufacturer, only show them it it Matches the Object Manufacturer
            var manuffil = [];
            if (!isEmpty(objmanuf)) {
                manuffil.push(['cseg_hul_mfg', search.Operator.ANYOF, objmanuf]);
                manuffil.push('or');
            }
            manuffil.push(['cseg_hul_mfg', search.Operator.ANYOF, ["@NONE@"]]);

            subfilters.push(manuffil);
            subfilters.push('and');

            // If Rental Rate Card has a Responsibility Center, only show them if it matches the Location on the Sales Order
            var respcenfil = [];
            if (!isEmpty(loccode)) {
                respcenfil.push(['custrecord_sna_hul_ratecard_respcenter', search.Operator.ANYOF, loccode]);
                respcenfil.push('or');
            }
            respcenfil.push(['custrecord_sna_hul_ratecard_respcenter', search.Operator.ANYOF, ["@NONE@"]]);

            subfilters.push(respcenfil);
            subfilters.push('and');

            // Height field in Rate Card VS Object (equal)
            var heightfil = [];
            if (!isEmpty(objheight)) {
                heightfil.push(['custrecord_sna_hul_ratecard_height', search.Operator.IS, objheight]);
                heightfil.push('or');
            }
            heightfil.push(['custrecord_sna_hul_ratecard_height', search.Operator.ISEMPTY, '']);

            subfilters.push(heightfil);
            subfilters.push('and');

            // MIN and Max Capacity in RATE Card vs Object Capacity (Within)
            var capfil = [];
            if (!isEmpty(objcapacity)) {
                // min filters
                var minfil = [];
                minfil.push(['custrecord_sna_hul_ratecard_min_cap', search.Operator.LESSTHANOREQUALTO, forceFloat(objcapacity)]);
                minfil.push('or');
                minfil.push(['custrecord_sna_hul_ratecard_min_cap', search.Operator.ISEMPTY, '']);

                // max filters
                var maxfil = [];
                maxfil.push(['custrecord_sna_hul_ratecard_max_cap', search.Operator.GREATERTHANOREQUALTO, forceFloat(objcapacity)]);
                maxfil.push('or');
                maxfil.push(['custrecord_sna_hul_ratecard_max_cap', search.Operator.ISEMPTY, '']);

                // final capacity filters
                capfil.push(minfil);
                capfil.push('and');
                capfil.push(maxfil);
            }

            if (!isEmpty(capfil)) {
                subfilters.push(capfil);
                subfilters.push('and');
            }

            // Remove last 'and'
            subfilters.splice(-1, 1);
            log.debug({title: 'getSublsitValues', details: 'subfilters: ' + JSON.stringify(subfilters)});

            log.debug({title: 'getSublsitValues', details: 'showall: ' + showall});
            if (!isEmpty(subfilters) && showall != 'true') {
                filterexp.push(subfilters);

                searchres.filterExpression = filterexp;
            }

            log.debug({title: 'getSublsitValues', details: 'filterexp: ' + JSON.stringify(filterexp)});

            var searchall = searchAllResults(searchres);

            for (var i = 0; i < searchall.length; i++) {
                var counter = 0;
                var result = searchall[i];

                var rrid = result.getValue({name: 'internalid', summary: 'GROUP'});
                var rrname = result.getValue({name: 'name', summary: 'GROUP'});
                var rrseg = result.getValue({name: 'cseg_sna_hul_eq_seg', summary: 'GROUP'});
                var rrcustpricegrp = result.getValue({name: 'custrecord_sna_hul_ratecard_custpricegrp', summary: 'GROUP'});
                var rrobj = result.getValue({name: 'custrecord_sna_hul_ratecard_object', summary: 'GROUP'});
                rrobj = !isEmpty(rrobj) && rrobj != '- None -' ? rrobj : '';
                var rrcust = result.getValue({name: 'custrecord_sna_hul_ratecard_customer', summary: 'GROUP'});
                rrcust = !isEmpty(rrcust) && rrobj != '- None -' ? rrcust : '';
                var rreqmodel = result.getValue({name: 'custrecord_sna_hul_ratecard_eqmodel', summary: 'GROUP'});
                var rrmanufseg = result.getValue({name: 'cseg_hul_mfg', summary: 'GROUP'});
                var rrrespcen = result.getValue({name: 'custrecord_sna_hul_ratecard_respcenter', summary: 'GROUP'});
                var rrdesc = result.getValue({name: 'custrecord_sna_hul_ratecard_description', summary: 'GROUP'});
                var rrterms = result.getValue({name: 'formulatext', summary: search.Summary.MAX});
                var rrmodel = result.getValue({name: 'custrecord_sna_hul_ratecard_eqmodel', summary: 'GROUP'});
                var rrheight = result.getValue({name: 'custrecord_sna_hul_ratecard_height', summary: 'GROUP'});
                var rrmincap = result.getValue({name: 'custrecord_sna_hul_ratecard_min_cap', summary: 'GROUP'});
                var rrmaxcap = result.getValue({name: 'custrecord_sna_hul_ratecard_max_cap', summary: 'GROUP'});
                var selected = (arrselected.indexOf(rrid) != -1) ? 'T' : 'F';

                var objvalues = {};
                objvalues['custpage_rateidsubfld'] = !isEmpty(rrid) && rrid != '- None -' ? rrid : '';
                objvalues['custpage_ratenamesubfld'] = !isEmpty(rrname) && rrname != '- None -' ? rrname : '';
                objvalues['custpage_respcentersubfld'] = !isEmpty(rrrespcen) && rrrespcen != '- None -' ? rrrespcen : '';
                objvalues['custpage_descsubfld'] = !isEmpty(rrdesc) && rrdesc != '- None -' ? rrdesc : '';
                objvalues['custpage_segsubfld'] = !isEmpty(rrseg) && rrseg != '- None -' ? rrseg : '';
                objvalues['custpage_manufsegmsubfld'] = !isEmpty(rrmanufseg) && rrmanufseg != '- None -' ? rrmanufseg : '';
                objvalues['custpage_termssubfld'] = !isEmpty(rrterms) && rrterms != '- None -' ? rrterms : '';
                objvalues['custpage_custprgrpsubfld'] = !isEmpty(rrcustpricegrp) && rrcustpricegrp != '- None -' ? rrcustpricegrp : '';
                objvalues['custpage_custnosubfld'] = !isEmpty(rrcust) && rrcust != '- None -' ? rrcust : '';
                objvalues['custpage_modelsubfld'] = !isEmpty(rrmodel) && rrmodel != '- None -' ? rrmodel : '';
                objvalues['custpage_selectsubfld'] = selected;
                objvalues['custpage_objsubfld'] = !isEmpty(rrobj) && rrobj != '- None -' ? rrobj : '';
                objvalues['custpage_heightsubfld'] = !isEmpty(rrheight) && rrheight != '- None -' ? rrheight : '';
                objvalues['custpage_mincapsubfld'] = !isEmpty(rrmincap) && rrmincap != '- None -' ? rrmincap : '';
                objvalues['custpage_maxcapsubfld'] = !isEmpty(rrmaxcap) && rrmaxcap != '- None -' ? rrmaxcap : '';

                if (objvalues['custpage_segsubfld'] == objsegment) {
                    counter++;
                }

                if (objvalues['custpage_custprgrpsubfld'] == pricegrp) {
                    counter++;
                }

                if (rrobj == objid) {
                    counter++;
                }

                if (rrcust == cust) {
                    counter++;
                }

                if (objvalues['custpage_modelsubfld'] == objmodel) {
                    counter++;
                }

                if (objvalues['custpage_manufsegmsubfld'] == objmanuf) {
                    counter++;
                }

                if (objvalues['custpage_respcentersubfld'] == loccode) {
                    counter++;
                }

                if (objvalues['custpage_heightsubfld'] == objheight) {
                    counter++;
                }

                var hasmin = false;
                var hasmax = false;

                if (forceFloat(objcapacity) >= forceFloat(rrmincap) && !isEmpty(rrmincap)) {
                    hasmin = true;
                }
                if (forceFloat(objcapacity) <= forceFloat(rrmaxcap) && !isEmpty(rrmaxcap)) {
                    hasmax = true;
                }

                // commented out to not consider empty capacity, min and max as parameter met
                if (hasmax || hasmin /*|| (isEmpty(objcapacity) && isEmpty(rrmincap) && isEmpty(rrmaxcap))*/) {
                    counter++;
                }


                objvalues['custpage_countersubfld'] = counter;
                finaldata.push(objvalues);
            }

            return finaldata;
        }

        /**
         * Fetch results within range
         * @param dataCounters
         * @param pageId
         * @param pageSize
         * @param selectedrc
         * @returns {*[]}
         */
        function fetchResultsRange(dataCounters, pageId, pageSize, selectedrc) {
            var start = pageId * pageSize;
            var end = (forceInt(pageId) + 1) * pageSize;

            if (forceInt(dataCounters.length) < forceInt(end)) {
                end = dataCounters.length;
            }
            log.debug({title: 'fetchResultsRange', details: 'start: ' + start + ' | end: ' + end});

            var results = [];

            // loop through start counter to end counter
            for (var i = start; i < end; i++) {
                var objvalues = dataCounters[i];

                // first result has highest counter
                if (i == start && isEmpty(selectedrc)) {
                    objvalues['custpage_selectsubfld'] = 'T'
                }

                results.push(objvalues);
            }

            return results;
        }

        return {onRequest}

    });
/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script of the second suitelet of the rental module order entry
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/11       		                 aduldulao       Initial version.
 * 2022/8/25       		                 aduldulao       Rental Object Configurator Rule
 * 2022/9/8       		                 aduldulao       Consider rule without matching segment
 * 2022/9/13       		                 aduldulao       Change segment ID
 * 2022/9/19       		                 aduldulao       Handle checkbox and date object fields
 * 2022/9/21       		                 aduldulao       Add general fields
 * 2022/9/28       		                 aduldulao       From SO or quote line
 * 2022/11/1       		                 aduldulao       Act_Config
 * 2023/2/15       		                 aduldulao       Locked fields logic
 * 2023/7/11       		                 aduldulao       Rental enhancements
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/redirect', 'N/record', 'N/format'],
    /**
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (search, serverWidget, redirect, record, format) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
            }
            return flValue;
        }

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                var val = 'custpage_'+arrValue[i];
                if (stValue == val) {
                    break;
                }
            }
            return (i > -1);
        }

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

                var objno = params.selected;
                var fromselectratecard = params.fromselectratecard;
                var fromline = params.fromline;
                var cust = params.cust;
                var custgrp = params.custgrp;
                var trandate = params.trandate;
                var loccode = params.loccode;
                var rentalcomments = params.rentalcomments;

                // create form
                var form = serverWidget.createForm({title: 'Configure Object', hideNavBar: true});
                form.clientScriptModulePath = './sna_hul_cs_configureobject.js';

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add field groups
                var generalfg = form.addFieldGroup({id: 'custpage_generalfg', label: 'General'});
                var configfg = form.addFieldGroup({id: 'custpage_configfg', label: 'Configuration'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // create header fields
                var fldidsfld = form.addField({id: 'custpage_fldidsfld', type: serverWidget.FieldType.LONGTEXT, label: 'Rules', container: 'custpage_generalfg'});
                fldidsfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var lockedfldidsfld = form.addField({id: 'custpage_lockedfldidsfld', type: serverWidget.FieldType.LONGTEXT, label: 'Locked Fields', container: 'custpage_generalfg'});
                lockedfldidsfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var fldconfigfld = form.addField({id: 'custpage_fldconfigfld', type: serverWidget.FieldType.LONGTEXT, label: 'Field Configured', container: 'custpage_generalfg'});
                fldconfigfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var fromratecardfld = form.addField({id: 'custpage_fromratecardfld', type: serverWidget.FieldType.TEXT, label: 'From Select Rate Card Page', container: 'custpage_generalfg'});
                fromratecardfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                fromratecardfld.defaultValue = fromselectratecard;

                var fromlinefld = form.addField({id: 'custpage_fromlinefld', type: serverWidget.FieldType.TEXT, label: 'From Line', container: 'custpage_generalfg'});
                fromlinefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                fromlinefld.defaultValue = fromline;

                var objidfld = form.addField({id: 'custpage_objidfld', type: serverWidget.FieldType.SELECT, label: 'Object', source: 'customrecord_sna_objects', container: 'custpage_generalfg'});
                objidfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                objidfld.defaultValue = objno;

                var segmfld = form.addField({id: 'custpage_segmfld', type: serverWidget.FieldType.SELECT, label: 'Equipment Posting/Category/Group', source: 'customrecord_cseg_sna_hul_eq_seg', container: 'custpage_generalfg'});
                segmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var ruletypfld = form.addField({id: 'custpage_ruletypfld', type: serverWidget.FieldType.SELECT, label: 'Config Rule Type', source: 'customlist_sna_hul_config_rule_list', container: 'custpage_generalfg'});
                ruletypfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var configcommentsfld = form.addField({id: 'custpage_configcommentsfld', type: serverWidget.FieldType.TEXTAREA, label: 'Rental Configuration Comments', container: 'custpage_generalfg'});
                configcommentsfld.defaultValue = rentalcomments;

                var custfld = form.addField({id: 'custpage_custfld', type: serverWidget.FieldType.SELECT, label: 'Customer', source: 'customer', container: 'custpage_generalfg'});
                custfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                custfld.defaultValue = cust;
                custfld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                var trandtefld = form.addField({id: 'custpage_trandtefld', type: serverWidget.FieldType.DATE, label: 'Transaction Date', container: 'custpage_generalfg'});
                trandtefld.defaultValue = !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '';
                trandtefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var custpricegrpfld = form.addField({id: 'custpage_custpricegrpfld', type: serverWidget.FieldType.SELECT, label: 'Customer Price Group', source: 'customrecord_sna_hul_customerpricinggrou', container: 'custpage_generalfg'});
                custpricegrpfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                custpricegrpfld.defaultValue = custgrp;

                var loccodefld = form.addField({id: 'custpage_loccodefld', type: serverWidget.FieldType.SELECT, label: 'Location', source: 'location', container: 'custpage_generalfg'});
                loccodefld.defaultValue = loccode;
                loccodefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                //loccodefld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // get dynamic fields
                var objfldconfigrules = getObjectConfigRule(objno, ruletypfld, lockedfldidsfld);
                var objfldrules = objfldconfigrules.arrfinalflds;
                var objfldlocked = objfldconfigrules.arrfinallockedflds;
                log.debug({title: 'GET - objfldrules', details: objfldrules});
                log.debug({title: 'GET - objfldlocked', details: objfldlocked});

                var fieldinfo = {};
                var ruleids = {};

                if (!isEmpty(objno)) {
                    var recobj = record.load({type: 'customrecord_sna_objects', id: objno, isDynamic: true});
                    var segment = recobj.getValue({fieldId: 'cseg_sna_hul_eq_seg'});
                    segmfld.defaultValue = segment;

                    for (var d = 0; d < objfldrules.length; d++) {
                        var fldobj = recobj.getField({fieldId: objfldrules[d]});

                        if (!isEmpty(fldobj) && isEmpty(ruleids[objfldrules[d]])) {
                            log.debug({title: 'GET - fldobj', details: objfldrules[d] + ' | ' + JSON.stringify(fldobj)});

                            ruleids[objfldrules[d]] = 'yes'; // for duplicate field IDs

                            var currfld = form.addField({id: 'custpage_'+objfldrules[d], type: fldobj.type, label: fldobj.label, container: 'custpage_configfg'});

                            if (fldobj.type == 'select') {
                                var selectOptions = fldobj.getSelectOptions();
                                log.debug({title: 'GET - selectOptions', details: selectOptions});

                                currfld.addSelectOption({value: '', text: ''});
                                for (var v = 0; v < selectOptions.length; v++) {
                                    currfld.addSelectOption({value: selectOptions[v].value, text: selectOptions[v].text});
                                }
                            }

                            var fldval = recobj.getValue({fieldId: objfldrules[d]});
                            if (fldobj.type == 'checkbox') {
                                fldval = !fldval ? 'F' : 'T';
                            }
                            currfld.defaultValue = fldval;

                            // check if must be disabled
                            if (inArray('custpage_'+objfldrules[d], objfldlocked)) {
                                currfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                            }

                            // to be used for setting the Object Configuration in the SO line
                            fieldinfo[fldobj.label] = {
                                id: 'custpage_'+objfldrules[d],
                                type: fldobj.type
                            };
                        }
                    }
                }

                fldidsfld.defaultValue = JSON.stringify(fieldinfo);

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // from SO or quote line
                if (fromline == 'T') {
                    form.addSubmitButton({label: 'Submit'});
                }
                else {
                    // add buttons
                    form.addButton({id: 'custpage_backbtn', label: 'Back', functionName: 'backButton()'});

                    // add submit button
                    form.addSubmitButton({label: 'Next'});
                }

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                scriptContext.response.writePage(form);
            }
            // POST
            else {
                var request = scriptContext.request;
                var selected = request.parameters.custpage_objidfld;
                var cust = request.parameters.custpage_custfld;
                var custgrp = request.parameters.custpage_custpricegrpfld;
                var trandate = request.parameters.custpage_trandtefld;
                var loccode = request.parameters.custpage_loccodefld;
                var fromline = request.parameters.custpage_fromlinefld;
                var rentalcomments = request.parameters.custpage_configcommentsfld;

                // from SO or quote line
                if (fromline == 'T') {
                    var stfieldconfigured = request.parameters.custpage_fldconfigfld;
                    var stfieldidobj = request.parameters.custpage_fldidsfld;

                    var fieldconfigured = !isEmpty(stfieldconfigured) ? JSON.parse(stfieldconfigured) : {};
                    var fieldidobj = !isEmpty(stfieldidobj) ? JSON.parse(stfieldidobj) : {};

                    var arrobj = [];

                    // loop through obj rules
                    for (var fieldid in fieldidobj) {
                        var val = request.parameters[fieldidobj[fieldid].id];

                        if (fieldidobj[fieldid].type == 'select') {
                            val = request.parameters['inpt_'+fieldidobj[fieldid].id];
                        }
                        else if (fieldidobj[fieldid].type == 'checkbox') {
                            val = (val == 'false') ? 'F' : 'T';
                        }
                        else if (fieldidobj[fieldid].type == 'date') {
                            val = !isEmpty(val) ? format.format({value: new Date(val), type: format.Type.DATE}) : '';
                        }

                        var obj = {
                            'ELEMENT': fieldid,
                            'REQUESTED_CONFIG': val,
                            'ACT_CONFIG': '',
                            'CONFIGURED': !isEmpty(fieldconfigured[fieldid]) ? fieldconfigured[fieldid] : 'F' // need to check if T or F
                        }

                        arrobj.push(obj);
                    }

                    var configfields = JSON.stringify(arrobj);
                    var config2fields = '';

                    // split the config
                    if (!isEmpty(arrobj)) {
                        var parsedconfig = arrobj;
                        var parsedlen = forceFloat(parsedconfig.length);
                        var configlen = forceFloat(JSON.stringify(parsedconfig).length);

                        var currlen = forceFloat(configlen);
                        var newconfig = [];

                        // 4000 character max for text area
                        if (configlen > 4000) {
                            for (var i = parsedlen - 1; i >= 0; i--) {
                                var element = parsedconfig[i];
                                var elemlen = forceFloat(JSON.stringify(element).length);

                                if (currlen > 3900) {
                                    newconfig.push(element);
                                    parsedconfig.splice(i, 1);

                                }
                                else {
                                    break;
                                }

                                currlen = currlen - elemlen;
                            }

                            configfields = JSON.stringify(parsedconfig);
                            config2fields = JSON.stringify(newconfig);
                        }
                    }

                    var stHtml = '<script language="JavaScript">';
                    stHtml += 'if (window.opener)';
                    stHtml += '{';
                    stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','custcol_sna_hul_object_configurator','" + configfields + "');"
                    stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','custcol_sna_hul_object_configurator_2','" + config2fields + "');"
                    stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','custcol_sna_hul_rental_config_comment','" + rentalcomments + "');"
                    stHtml += '}';
                    stHtml += 'window.close();';
                    stHtml += '</script>';

                    scriptContext.response.write({output: stHtml});
                }

                // from order entry suitelet
                else {
                    redirect.toSuitelet({scriptId: 'customscript_sna_hul_sl_selectratecard', deploymentId: 'customdeploy_sna_hul_sl_selectratecard',
                        parameters: {
                            selected: selected,
                            cust: cust,
                            custgrp: custgrp,
                            trandate: trandate,
                            loccode: loccode,
                            rentalcomments: rentalcomments
                        }
                    });
                }
            }
        }

        /**
         * Get the object field IDs on the Rental Object Configurator Rule
         * @param objno
         * @param ruletypfld
         * @param lockedfldidsfld
         * @returns {string}
         */
        function getObjectConfigRule(objno, ruletypfld, lockedfldidsfld) {
            var temp_ruletype = '';
            var segment = '';

            var arrfinalflds = '';
            var temp_arrfinalflds = '';

            var arrfinallockedflds = '';
            var temp_arrfinallockedflds = '';

            if (!isEmpty(objno)) {
                var objflds = search.lookupFields({type: 'customrecord_sna_objects', id: objno, columns: ['cseg_sna_hul_eq_seg']});

                if (!isEmpty(objflds['cseg_sna_hul_eq_seg'])) {
                    segment = objflds['cseg_sna_hul_eq_seg'][0].text; // FORKLIFT : CLASS IV : Mid-Size Cushion Forklift
                }
            }

            log.debug({title: 'getObjectConfigRule', details: 'segment: ' + segment});

            var columns = [];
            columns.push(search.createColumn({name: 'custrecord_sna_hul_configurable_fields'}));
            columns.push(search.createColumn({name: 'cseg_sna_hul_eq_seg'}));
            columns.push(search.createColumn({name: 'custrecord_sna_config_rule_type'}));
            columns.push(search.createColumn({name: 'custrecord_hul_locked_fields'}));

            var srch = search.create({type: 'customrecord_sna_object_config_rule', columns: columns});

            srch.run().each(function(result) {
                var ruletype = result.getValue({name: 'custrecord_sna_config_rule_type'});
                var finalflds = result.getValue({name: 'custrecord_sna_hul_configurable_fields'});
                var finallockedflds = result.getValue({name: 'custrecord_hul_locked_fields'});
                var seg = result.getText({name: 'cseg_sna_hul_eq_seg'}); // FORKLIFT : CLASS IV

                // When the Rental Object Configurator Rule Segment String is within the HUL Category Segment String of the Object selected, display all Object Record fields based on the Internal Ids listed under configurable field Text box
                if (segment.includes(seg) && !isEmpty(segment) && !isEmpty(seg)) {
                    arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                    arrfinallockedflds = finallockedflds.replace(/\r\n/g, '').split(',');

                    lockedfldidsfld.defaultValue = JSON.stringify(arrfinallockedflds);
                    ruletypfld.defaultValue = ruletype;

                    return false; // get first
                }

                // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
                if (isEmpty(seg) && isEmpty(segment)) {
                    arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                    arrfinallockedflds = finallockedflds.replace(/\r\n/g, '').split(',');

                    lockedfldidsfld.defaultValue = JSON.stringify(arrfinallockedflds);
                    ruletypfld.defaultValue = ruletype;

                    return false; // get first
                }

                // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
                if (isEmpty(seg) && !isEmpty(segment)) {
                    temp_arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                    temp_arrfinallockedflds = finallockedflds.replace(/\r\n/g, '').split(',');
                    temp_ruletype = ruletype;
                }

               return true;
            });

            // no match found
            if (isEmpty(arrfinalflds)) {
                arrfinalflds = temp_arrfinalflds;
                arrfinallockedflds = temp_arrfinallockedflds;

                lockedfldidsfld.defaultValue = JSON.stringify(arrfinallockedflds);
                ruletypfld.defaultValue = temp_ruletype;
            }

            return {arrfinalflds: arrfinalflds, arrfinallockedflds: arrfinallockedflds};
        }

        return {onRequest}

    });

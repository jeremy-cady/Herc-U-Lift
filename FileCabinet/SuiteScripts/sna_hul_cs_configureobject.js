/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script of sna_hul_sl_configureobjects.js
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/11       		                 aduldulao       Initial version.
 * 2022/8/29       		                 aduldulao       Rental Object Configurator Rule
 * 2022/9/8       		                 aduldulao       Format date
 * 2022/9/19       		                 aduldulao       Handle checkbox and date object fields
 * 2022/9/28       		                 aduldulao       From SO or quote line
 * 2022/11/1       		                 aduldulao       Act_Config
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/format'],
/**
 * @param{currentRecord} currentRecord
 */
function(currentRecord, url, format) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
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
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var currrec = currentRecord.get();
        var fromratecard = currrec.getValue({fieldId: 'custpage_fromratecardfld'});
        var fromline = currrec.getValue({fieldId: 'custpage_fromlinefld'});
        var stfieldidobj = currrec.getValue({fieldId: 'custpage_fldidsfld'});
        var stlockedfieldidobj = currrec.getValue({fieldId: 'custpage_lockedfldidsfld'});
        var arrlockedflds = !isEmpty(stlockedfieldidobj) ? JSON.parse(stlockedfieldidobj) : [];

        window.opener.require(['N/currentRecord'], function() {

            var rec = window.opener.require('N/currentRecord').get();

            // already existing - from select rate card page
            if (fromratecard == 'T') {
                var configfields = rec.getValue({fieldId: 'custbody_sna_hul_rental_temp_config_id'});

                if (!isEmpty(configfields)) {
                    var tconfigfields = JSON.parse(configfields);

                    for (var ind in tconfigfields) {
                        var fieldvalue = tconfigfields[ind];
                        var fieldid = ind;

                        if (!isEmpty(fieldid)) {
                            currrec.setValue({fieldId: fieldid, value: fieldvalue});
                        }
                    }
                }
            }

            // from SO or quote line
            else if (fromline == 'T') {
                var objconfig = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator'});
                var objconfig2 = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator_2'});

                var parsedconfigfields = !isEmpty(objconfig) ? JSON.parse(objconfig) : [];
                var parsedconfig2fields = !isEmpty(objconfig2) ? JSON.parse(objconfig2) : [];
                var combined = parsedconfigfields.concat(parsedconfig2fields);

                var fieldidobj = !isEmpty(stfieldidobj) ? JSON.parse(stfieldidobj) : {};
                var fieldconfigured = {};

                // loop through obj rules
                for (var fieldid in fieldidobj) {
                    // skip empty label
                    if (!isEmpty(fieldid)) {
                        var currentid = !isEmpty(fieldidobj[fieldid]) ? fieldidobj[fieldid].id : '';
                        var currenttype = !isEmpty(fieldidobj[fieldid]) ? fieldidobj[fieldid].type : '';

                        // loop through SO configuration
                       inner: for (var i = 0; i < combined.length; i++) {
                            var dataelement = combined[i].ELEMENT;
                            var configured = combined[i].CONFIGURED;
                            var requested = combined[i].REQUESTED_CONFIG;

                            if (fieldid == dataelement) {
                                if (currenttype == 'select') {
                                    currrec.setText({fieldId: currentid, text: requested});
                                }
                                else {
                                    currrec.setValue({fieldId: currentid, value: requested});
                                }

                                // disable field if already configured or locked field
                                if (configured == 'T' || inArray(currentid, arrlockedflds)) {
                                    var fld = currrec.getField({fieldId: currentid});
                                    fld.isDisabled = true;
                                }

                                // to be used for setting the Configured element in the SO line
                                fieldconfigured[fieldid] = configured;

                                break inner;
                            }
                        }
                    }
                }

                currrec.setValue({fieldId: 'custpage_fldconfigfld', value: JSON.stringify(fieldconfigured)});
            }
        });
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var currrec = currentRecord.get();

        var fieldidobj = JSON.parse(currrec.getValue({fieldId: 'custpage_fldidsfld'}));
        var stlockedfieldidobj = currrec.getValue({fieldId: 'custpage_lockedfldidsfld'});
        var arrlockedflds = !isEmpty(stlockedfieldidobj) ? JSON.parse(stlockedfieldidobj) : [];

        var arrobj = [];
        var objidval = {};

        for (var ind in fieldidobj) {
            var val = currrec.getValue({fieldId: fieldidobj[ind].id});

            if (fieldidobj[ind].type == 'select') {
                val = currrec.getText({fieldId: fieldidobj[ind].id});
            }
            else if (fieldidobj[ind].type == 'checkbox') {
                val = (val == 'false') ? 'F' : 'T';
            }
            else if (fieldidobj[ind].type == 'date') {
                val = !isEmpty(val) ? format.format({value: new Date(val), type: format.Type.DATE}) : '';
            }

            var obj = {
                'ELEMENT': ind,
                'REQUESTED_CONFIG': val,
                'ACT_CONFIG': inArray(fieldidobj[ind].id, arrlockedflds) ? val : '',
                'CONFIGURED': 'F'
            }

            objidval[fieldidobj[ind].id] = currrec.getValue({fieldId: fieldidobj[ind].id}); // used when page is from select rental rate card page

            arrobj.push(obj);
        }

        window.opener.require(['N/currentRecord'], function() {
            var rec = window.opener.require('N/currentRecord').get();
            rec.setValue({fieldId: 'custbody_sna_hul_rental_temp_config', value: JSON.stringify(arrobj)});
            rec.setValue({fieldId: 'custbody_sna_hul_rental_temp_config_id', value: JSON.stringify(objidval)});
        });

        return true;
    }

    /**
     * Goes back to the page's previous state
     */
    function backButton() {
        var currrec = currentRecord.get();
        var cust = currrec.getValue({fieldId: 'custpage_custfld'});
        var custgrp = currrec.getValue({fieldId: 'custpage_custpricegrpfld'});
        var trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
        var loccode = currrec.getValue({fieldId: 'custpage_loccodefld'});
        var respcenter = currrec.getValue({fieldId: 'custpage_respcenterfld'});

        var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectobject', deploymentId: 'customdeploy_sna_hul_sl_selectobject',
            params : {'cust': cust, 'custgrp': custgrp, 'trandate': !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '', 'loccode': loccode, 'respcenter': loccode, 'newcall': 'T'}
        });

        // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
        window.onbeforeunload = null;
        window.document.location = fullURL;
    }

    return {
        saveRecord: saveRecord,
        backButton: backButton,
        pageInit: pageInit
    };

});

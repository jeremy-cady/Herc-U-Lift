/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script of sna_hul_sl_selectratecard.js
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/12       		                 aduldulao       Initial version.
 * 2022/9/1       		                 aduldulao       Move SO data
 * 2022/9/8       		                 aduldulao       Format date
 * 2022/10/9       		                 aduldulao       Pagination
 * 2023/2/10       		                 aduldulao       Calculate Rent Cost
 * 2023/7/11       		                 aduldulao       Rental enhancements
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
 * @param{redirect} redirect
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

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    var GLOBAL = {
        selectedrc: '',
        cust: '',
        custgrp: '',
        trandate: '',
        loccode: '',
        objid: '',
        fromline: '',
        linenum: '',
        showall: ''
    };

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
        var currrec = scriptContext.currentRecord;

        var arrselected = getSelected(currrec);
        var objcount = arrselected.length;

        if (objcount > 0) {
            currrec.setValue({fieldId: 'custpage_selectedfld', value: arrselected.join(',')});
        }
        else {
            currrec.setValue({fieldId: 'custpage_selectedfld', value: ''});
        }

        return true;
    }

    /**
     * Goes back to the page's previous state
     */
    function backButton() {
        var currrec = currentRecord.get();
        var selected = currrec.getValue({fieldId: 'custpage_objidfld'});
        var cust = currrec.getValue({fieldId: 'custpage_custfld'});
        var custgrp = currrec.getValue({fieldId: 'custpage_custpricegrpfld'});
        var trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
        var loccode = currrec.getValue({fieldId: 'custpage_loccodefld'});
        var rentalcomments = currrec.getValue({fieldId: 'custpage_configcommentsfld'});

        var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configureobject', deploymentId: 'customdeploy_sna_hul_sl_configureobject',
            params: {
                selected: selected,
                fromselectratecard: 'T',
                cust: cust,
                custgrp: custgrp,
                trandate: !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '',
                loccode: loccode,
                rentalcomments: rentalcomments
            }
        });

        // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
        window.onbeforeunload = null;
        window.document.location = fullURL;
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
        var currrec = scriptContext.currentRecord;

        // Track original field values
        GLOBAL.selectedrc = currrec.getValue({fieldId: 'custpage_selectedfld'});
        GLOBAL.objid = currrec.getValue({fieldId: 'custpage_objidfld'});
        GLOBAL.cust = currrec.getValue({fieldId: 'custpage_custfld'});
        GLOBAL.custgrp = currrec.getValue({fieldId: 'custpage_custpricegrpfld'});
        GLOBAL.trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
        GLOBAL.loccode = currrec.getValue({fieldId: 'custpage_loccodefld'});
        GLOBAL.fromline = currrec.getValue({fieldId: 'custpage_fromlinefld'});
        GLOBAL.linenum = currrec.getValue({fieldId: 'custpage_linenumfld'});
        GLOBAL.showall = currrec.getValue({fieldId: 'custpage_showallfld'});
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        // Navigate to selected page
        if (scriptContext.fieldId == 'custpage_sna_pageid') {
            var currrec = scriptContext.currentRecord;

            var page = currrec.getValue({fieldId : 'custpage_sna_pageid'});
            page = parseInt(page.split('_')[1]);

            redirectSuitelet(page, true, true);
        }
        else if (scriptContext.fieldId == 'custpage_showallfld') {
            redirectSuitelet(0, false, false);
        }
    }

    /**
     * Redirects to current suitelet with parameters used to filter sublist
     * @param page
     * @param retainselected
     * @param frompagechange
     */
    function redirectSuitelet(page, retainselected, frompagechange) {
        var currrec = currentRecord.get();

        var arrselected = [];
        var selectedrc = currrec.getValue({fieldId: 'custpage_selectedfld'});
        var objid = currrec.getValue({fieldId: 'custpage_objidfld'});
        var custgrp = currrec.getValue({fieldId: 'custpage_custpricegrpfld'});
        var trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
        var loccode = currrec.getValue({fieldId: 'custpage_loccodefld'});
        var cust = currrec.getValue({fieldId: 'custpage_custfld'});
        var fromline = currrec.getValue({fieldId: 'custpage_fromlinefld'});
        var linenum = currrec.getValue({fieldId: 'custpage_linenumfld'});
        var showall = currrec.getValue({fieldId: 'custpage_showallfld'});

        if (retainselected) {
            arrselected = getSelected(currrec);
        }

        // Return filters back when changing pages
        if (frompagechange){
            if (selectedrc != GLOBAL.selectedrc || objid != GLOBAL.objid || cust != GLOBAL.cust || custgrp != GLOBAL.custgrp || trandate != GLOBAL.trandate || loccode != GLOBAL.loccode || showall != GLOBAL.showall) {
                selectedrc = GLOBAL.selectedrc;
                objid = GLOBAL.objid;
                cust = GLOBAL.cust;
                custgrp = GLOBAL.custgrp;
                trandate = GLOBAL.trandate;
                loccode = GLOBAL.loccode;
                showall = GLOBAL.showall;
            }
        }

        var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectratecard', deploymentId: 'customdeploy_sna_hul_sl_selectratecard',
            params: {
                selectedrc: arrselected.toString(),
                fromline: fromline,
                linenum: linenum,
                selected: objid,
                page: page,
                cust: cust,
                custgrp: custgrp,
                trandate: !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '',
                loccode: loccode,
                showall: showall
            }
        });

        // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
        window.onbeforeunload = null;
        window.document.location = fullURL;
    }

    /**
     * Get selected rate card
     * @param currrec
     * @returns {*[]}
     */
    function getSelected(currrec) {
        var arrselected = [];
        var temp = [];

        var selected = currrec.getValue({fieldId: 'custpage_selectedfld'});
        if (!isEmpty(selected)){
            arrselected = selected.split(',');
        }

        var sublistcount = currrec.getLineCount({sublistId: 'custpage_ratesublist'});

        for (i = 0; i < sublistcount; i++) {
            var isselected = currrec.getSublistValue({ sublistId: 'custpage_ratesublist', fieldId: 'custpage_selectsubfld', line: i});
            var ratacrd = currrec.getSublistValue({ sublistId: 'custpage_ratesublist', fieldId: 'custpage_rateidsubfld', line: i});
            temp = arrselected.indexOf(ratacrd.toString());

            // radio box
            if (isselected == 'T') {
                if (temp == -1) {
                    arrselected = [ratacrd];
                }
            } else {
                if (temp != -1) {
                    arrselected.splice(temp,1);
                }
            }
        }

        return arrselected;
    }

    return {
        backButton: backButton,
        fieldChanged: fieldChanged,
        redirectSuitelet: redirectSuitelet,
        saveRecord: saveRecord,
        pageInit: pageInit
    };
    
});
/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script of sna_hul_sl_selectobjects.js
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/7       		                 aduldulao       Initial version.
 * 2022/9/1       		                 aduldulao       Move SO data
 * 2022/9/6       		                 aduldulao       Layout changes
 * 2022/9/21       		                 aduldulao       Add filters
 * 2022/10/16       		             aduldulao       Update select object
 * 2023/1/19       		                 aduldulao       Dynamic Filtering based on Parent Segment
 * 2023/5/9       		                 aduldulao       Filter for Object Fleet Code
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
 * @param{url} url
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

    var GLOBAL = {
        selected: '',
        objno: '',
        fleetno: '',
        segm: '',
        segmtxt: '',
        segmkey: '',
        respcenter: '',
        manuf: '',
        model: '',
        cust: '',
        custgrp: '',
        trandate: '',
        loccode: '',
        dummy: 'T',
        earliest: '',
    };

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
        GLOBAL.selected = currrec.getValue({fieldId: 'custpage_selectedfld'});
        GLOBAL.objno = currrec.getValue({fieldId: 'custpage_objfld'});
        GLOBAL.fleetno = currrec.getValue({fieldId: 'custpage_fleetnofld'});
        GLOBAL.segm = currrec.getValue({fieldId: 'custpage_segmfld'});
        GLOBAL.segmtxt = currrec.getText({fieldId: 'custpage_segmfld'});
        GLOBAL.segmkey = currrec.getValue({fieldId: 'custpage_segmkeyfld'});
        GLOBAL.respcenter = currrec.getValue({fieldId: 'custpage_respcenterfld'});
        GLOBAL.manuf = currrec.getValue({fieldId: 'custpage_manuffld'});
        GLOBAL.model = currrec.getValue({fieldId: 'custpage_modelfld'});
        GLOBAL.cust = currrec.getValue({fieldId: 'custpage_custfld'});
        GLOBAL.custgrp = currrec.getValue({fieldId: 'custpage_custprgrpfld'});
        GLOBAL.trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
        GLOBAL.loccode = currrec.getValue({fieldId: 'custpage_loccodefld'});
        GLOBAL.dummy = currrec.getValue({fieldId: 'custpage_dummyfld'});
        GLOBAL.earliest = currrec.getValue({fieldId: 'custpage_earliestfld'});

        window.opener.require(['N/currentRecord'], function() {

            var rec = window.opener.require('N/currentRecord').get();

            if (isEmpty(GLOBAL.cust)) {
                GLOBAL.cust = rec.getValue({fieldId: 'entity'});
                currrec.setValue({fieldId: 'custpage_custfld', value: GLOBAL.cust});
            }

            if (isEmpty(GLOBAL.custgrp)) {
                GLOBAL.custgrp = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
                currrec.setValue({fieldId: 'custpage_custprgrpfld', value: GLOBAL.custgrp});
            }

            if (isEmpty(GLOBAL.trandate)) {
                GLOBAL.trandate = rec.getValue({fieldId: 'trandate'});
                currrec.setValue({fieldId: 'custpage_trandtefld', value: GLOBAL.trandate});
            }

            if (isEmpty(GLOBAL.loccode)) {
                GLOBAL.loccode = rec.getValue({fieldId: 'location'});
                currrec.setValue({fieldId: 'custpage_loccodefld', value: GLOBAL.loccode});
            }
        });
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
        if (scriptContext.fieldId == 'custpage_objfld' || scriptContext.fieldId == 'custpage_fleetnofld' || scriptContext.fieldId == 'custpage_segmfld' || scriptContext.fieldId == 'custpage_segmkeyfld' || scriptContext.fieldId == 'custpage_respcenterfld' || scriptContext.fieldId == 'custpage_manuffld' || scriptContext.fieldId == 'custpage_modelfld' || scriptContext.fieldId == 'custpage_dummyfld' || scriptContext.fieldId == 'custpage_earliestfld') {
            var currrec = scriptContext.currentRecord;

            redirectSuitelet(0, false, false);
        }
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
        var currrec = scriptContext.currentRecord;

        var arrselected = getSelectedObj(currrec);
        var objcount = arrselected.length;

        if (objcount > 0) {
            currrec.setValue({fieldId: 'custpage_selectedfld', value: arrselected.join(',')});
        }
        else {
            currrec.setValue({fieldId: 'custpage_selectedfld', value: ''});
            alert('Please select an object');

            return false;
        }

        return true;
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
        var selected = currrec.getValue({fieldId: 'custpage_selectedfld'});
        var objno = currrec.getValue({fieldId: 'custpage_objfld'});
        var fleetno = currrec.getValue({fieldId: 'custpage_fleetnofld'});
        var segm = currrec.getValue({fieldId: 'custpage_segmfld'});
        var segmtxt = currrec.getText({fieldId: 'custpage_segmfld'});
        var segmkey = currrec.getValue({fieldId: 'custpage_segmkeyfld'});
        var respcenter = currrec.getValue({fieldId: 'custpage_respcenterfld'});
        var manuf = currrec.getValue({fieldId: 'custpage_manuffld'});
        var model = currrec.getValue({fieldId: 'custpage_modelfld'});
        var cust = currrec.getValue({fieldId: 'custpage_custfld'});
        var custgrp = currrec.getValue({fieldId: 'custpage_custprgrpfld'});
        var trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
        var loccode = currrec.getValue({fieldId: 'custpage_loccodefld'});
        var dummy = currrec.getValue({fieldId: 'custpage_dummyfld'});
        var earliest = currrec.getValue({fieldId: 'custpage_earliestfld'});

        if (retainselected) {
            arrselected = getSelectedObj(currrec);
        }

        // Return filters back when changing pages
        if (frompagechange){
            if (selected != GLOBAL.selected || objno != GLOBAL.objno || fleetno != GLOBAL.fleetno || segm != GLOBAL.segm || segmkey != GLOBAL.segmkey || respcenter != GLOBAL.respcenter || manuf != GLOBAL.manuf || model != GLOBAL.model || cust != GLOBAL.cust || custgrp != GLOBAL.custgrp || trandate != GLOBAL.trandate || loccode != GLOBAL.loccode || dummy != GLOBAL.dummy || earliest != GLOBAL.earliest) {
                selected = GLOBAL.selected;
                objno = GLOBAL.objno;
                fleetno = GLOBAL.fleetno;
                segm = GLOBAL.segm;
                segmtxt = GLOBAL.segmtxt;
                segmkey = GLOBAL.segmkey;
                respcenter = GLOBAL.respcenter;
                manuf = GLOBAL.manuf;
                model = GLOBAL.model;
                cust = GLOBAL.cust;
                custgrp = GLOBAL.custgrp;
                trandate = GLOBAL.trandate;
                loccode = GLOBAL.loccode;
                dummy = GLOBAL.dummy;
                earliest = GLOBAL.earliest;
            }
        }

        var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectobject', deploymentId: 'customdeploy_sna_hul_sl_selectobject',
            params: {
                selected: arrselected.toString(),
                objno: objno,
                fleetno: fleetno,
                segm: segm,
                segmtxt: segmtxt,
                segmkey: segmkey,
                respcenter: respcenter,
                manuf: manuf,
                model: model,
                page: page,
                cust: cust,
                custgrp: custgrp,
                trandate: !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '',
                loccode: loccode,
                dummy: dummy,
                earliest: !isEmpty(earliest) ? format.format({value: new Date(earliest), type: format.Type.DATE}) : ''
            }
        });

        // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
        window.onbeforeunload = null;
        window.document.location = fullURL;
    }

    /**
     * Get selcted object
     * @param currrec
     * @returns {*[]}
     */
    function getSelectedObj(currrec) {
        var arrselected = [];
        var temp = [];

        var selected = currrec.getValue({fieldId: 'custpage_selectedfld'});
        if (!isEmpty(selected)){
            arrselected = selected.split(',');
        }

        var sublistcount = currrec.getLineCount({sublistId: 'custpage_equipsublist'});

        for (i = 0; i < sublistcount; i++) {
            var isselected = currrec.getSublistValue({ sublistId: 'custpage_equipsublist', fieldId: 'custpage_selectsubfld', line: i});
            var objid = currrec.getSublistValue({ sublistId: 'custpage_equipsublist', fieldId: 'custpage_objidsubfld', line: i});
            temp = arrselected.indexOf(objid.toString());

            // radio box
            if (isselected == 'T') {
                if (temp == -1) {
                    arrselected = [objid];
                }
            } else {
                if (temp != -1) {
                    arrselected.splice(temp,1);
                }
            }
        }

        return arrselected;
    }

    /**
     * Close window
     */
    function cancelButton() {
        window.onbeforeunload = null;
        window.close();
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        redirectSuitelet: redirectSuitelet,
        saveRecord: saveRecord,
        cancelButton: cancelButton,
    };
    
});

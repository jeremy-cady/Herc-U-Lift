/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS sript of sna_hul_sl_rentalconfigurator.js
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/8/1       		                 aduldulao       Initial version.
 * 2022/9/2       		                 aduldulao       Rental Contract ID list
 * 2022/9/8       		                 aduldulao       Check if dummy
 * 2022/9/19       		                 aduldulao       Validate fields
 * 2022/11/3       		                 aduldulao       Act_Config
 * 2023/3/22       		                 aduldulao       Add Fleet No.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/search', 'N/record', 'N/https', 'N/runtime', 'N/xml'],
/**
 * @param{currentRecord} currentRecord
 * @param{url} url
 */
function(currentRecord, url, search, record, https, runtime, xml) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    var externalUrl = '';
    var externalUrlMain = '';

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
        var currentScript = runtime.getCurrentScript();

        externalUrl = currentScript.getParameter({name: 'custscript_sn_so_externalurl'});
        externalUrlMain = currentScript.getParameter({name: 'custscript_sn_rental_externalurl'});
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

        var objid = currrec.getValue({fieldId: 'custpage_objid'});
        var actualobj = currrec.getValue({fieldId: 'custpage_actualobjfld'});
        var rentalid = currrec.getValue({fieldId: 'custpage_contractid'});
        var soid = currrec.getValue({fieldId: 'custpage_soid'});

        var objdummy = false;

        if (isEmpty(actualobj)) {
            // check if rental object is dummy
            if (!isEmpty(objid)) {
                //var slUrl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configuratorso', deploymentId: 'customdeploy_sna_hul_sl_configuratorso', returnExternalUrl: true});
                slUrl = externalUrl;
                slUrl += '&objid=' + objid;
                slUrl += '&changed=checkdummy';
                console.log('saveRecord : ' + slUrl);

                // Perform HTTP POST call
                var resp = https.get({url: slUrl});

                objval = JSON.parse(resp.body);
                objdummy = objval.objdummy
            }

            if (objdummy) {
                alert('Please enter an Actual Rental Object');
                return false;
            }

            actualobj = objid;
        }

        if (isEmpty(actualobj) && isEmpty(objid)) {
            alert('Please enter an Actual Rental Object');
            return false;
        }

        var linecount = currrec.getLineCount({sublistId: 'custpage_configsublist'});
        if (linecount <= 0) {
            alert('Please configure a line');
            return false;
        }
        else {
            var lineactual = currrec.getSublistValue({sublistId: 'custpage_configsublist', fieldId: 'custpage_actualobjsubfld', line: 0});
            var linerentalid = currrec.getSublistValue({sublistId: 'custpage_configsublist', fieldId: 'custpage_rentalidsubfld', line: 0});

            if (rentalid != linerentalid || (lineactual != objid && isEmpty(actualobj)) || (lineactual != actualobj && !isEmpty(actualobj))) {
                alert('Click Search button to update the lines');
                return false;
            }
        }

        return true;
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
        var fldid = scriptContext.fieldId;
        var sublst = scriptContext.sublistId;

        var currrec = scriptContext.currentRecord;

        if (fldid == 'custpage_fleetnofld') {
            var soid = currrec.getValue({fieldId: 'custpage_soid'});
            var contractid = currrec.getValue({fieldId: 'custpage_contractid'});
            var objid = currrec.getValue({fieldId: 'custpage_objid'});
            var actualobj = currrec.getValue({fieldId: 'custpage_actualobjfld'});
            var fleetno = currrec.getValue({fieldId: 'custpage_fleetnofld'});

            var fullURL = externalUrlMain;
            fullURL += '&soid=' + soid;
            fullURL += '&contractid=' + contractid;
            fullURL += '&actualobjid=' + actualobj;
            fullURL += '&objid=' + objid;
            fullURL += '&fleetno=' + fleetno;
            fullURL += '&fleetnochange=T';
            console.log('custpage_fleetnofld : ' + fullURL);

            /*var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_rentalconfigurat', deploymentId: 'customdeploy_sna_hul_sl_rentalconfigurat', returnExternalUrl: true,
                params: {
                    soid: soid,
                    contractid: contractid,
                    actualobjid: actualobj,
                    objid: objid,
                    fleetno: fleetno,
                    fleetnochange: 'T'
                }
            });*/

            // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
            window.onbeforeunload = null;
            window.document.location = fullURL;
        }

        if (fldid == 'custpage_contractid') {
            var objval = {};

            var actlfld = currrec.getField({fieldId: 'custpage_actualobjfld'});
            actlfld.isDisabled = true;
            actlfld.isMandatory = false;
            currrec.setValue({fieldId: 'custpage_actualobjfld', value: '', ignoreFieldChange: true});

            var rentalcontractid = currrec.getValue({fieldId: 'custpage_contractid'});

            if (!isEmpty(rentalcontractid)) {
                //var slUrl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configuratorso', deploymentId: 'customdeploy_sna_hul_sl_configuratorso', returnExternalUrl: true});
                slUrl = externalUrl;
                slUrl += '&rentalcontractid=' + rentalcontractid;
                slUrl += '&changed=rentalcontractid';
                console.log('custpage_contractid : ' + slUrl);

                // Perform HTTP POST call
                var resp = https.get({url: slUrl});

                objval = JSON.parse(resp.body);
                var obj = !isEmpty(objval) ? objval.obj : '';
                var dummy = !isEmpty(objval) ? objval.dummy : '';
                var comments = !isEmpty(objval) ? objval.comments : ''; 

                currrec.setValue({fieldId: 'custpage_objid', value: obj, ignoreFieldChange: true});
                currrec.setValue({fieldId: 'custpage_configcommentsfld', value: comments, ignoreFieldChange: true});

                if (dummy) {
                    actlfld.isDisabled = false;
                    actlfld.isMandatory = true;
                }
            }
        }

        if (fldid == 'custpage_soid') {
            var rentalcontractids = {};

            var soid = currrec.getValue({fieldId: 'custpage_soid'});

            if (!isEmpty(soid)) {
                //var slUrl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configuratorso', deploymentId: 'customdeploy_sna_hul_sl_configuratorso', returnExternalUrl: true});
                slUrl = externalUrl;
                slUrl += '&soid=' + soid;
                slUrl += '&changed=so';
                console.log('custpage_soid : ' + slUrl);

                // Perform HTTP POST call
                var resp = https.get({url: slUrl});

                rentalcontractids = JSON.parse(resp.body);
            }

            var contractidfld = currrec.getField({fieldId: 'custpage_contractid'});

            if (!isEmpty(contractidfld)) {
                contractidfld.removeSelectOption({value: null});
                contractidfld.insertSelectOption({value: '', text: ''});

                for (var id in rentalcontractids) {
                    contractidfld.insertSelectOption({value: id, text: rentalcontractids[id]});
                }
            }
        }

        if (sublst == 'custpage_configsublist') {
            if (fldid == 'custpage_actualsubfld') {
                var err = false;

                var lne = currrec.getCurrentSublistIndex({sublistId: sublst});
                var val = currrec.getSublistValue({sublistId: sublst, fieldId: fldid, line: lne});
                var tempval = currrec.getSublistValue({sublistId: sublst, fieldId: 'custpage_tempactualsubfld', line: lne});

                var fldtype = currrec.getSublistValue({sublistId: sublst, fieldId: 'custpage_fieldtypesubfld', line: lne});

                if (!isEmpty(val)) {
                    if (fldtype == 'date') {
                        var tempdte = new Date(val).getTime();

                        if (isNaN(tempdte)) {
                            alert('Invalid date value (must be MM/DD/YYYY)');
                            currrec.setCurrentSublistValue({sublistId: sublst, fieldId: fldid, value: tempval, ignoreFieldChange: true});
                            err = true;
                        }
                    }
                    else if (fldtype == 'checkbox') {
                        if (val != 'T' && val != 'F') {
                            alert('You may only enter T or F into this field');
                            currrec.setCurrentSublistValue({sublistId: sublst, fieldId: fldid, value: tempval, ignoreFieldChange: true});
                            err = true;
                        }
                    }
                    else if (fldtype == 'float' || fldtype == 'integer' || fldtype == 'currency') {
                        if (isNaN(val)) {
                            alert('You may only enter numbers into this field ');
                            currrec.setCurrentSublistValue({sublistId: sublst, fieldId: fldid, value: tempval, ignoreFieldChange: true});
                            err = true;
                        }
                    }
                }

                if (!err) {
                    currrec.setCurrentSublistValue({sublistId: sublst, fieldId: 'custpage_tempactualsubfld', value: val, ignoreFieldChange: true});
                }
            }
        }
    }

    /**
     * Search object configuration on the SO lines
     */
    function searchButton() {
        var currrec = currentRecord.get();

        var soid = currrec.getValue({fieldId: 'custpage_soid'});
        var contractid = currrec.getValue({fieldId: 'custpage_contractid'});
        var objid = currrec.getValue({fieldId: 'custpage_objid'});
        var actualobj = currrec.getValue({fieldId: 'custpage_actualobjfld'});
        var fleetno = currrec.getValue({fieldId: 'custpage_fleetnofld'});
        var comments = currrec.getValue({fieldId: 'custpage_configcommentsfld'});

        var objdummy = false;

        if (isEmpty(contractid)) {
            alert('Please enter a Rental Contract ID');
            return;
        }

        if (isEmpty(actualobj)) {
            // check if rental object is dummy
            if (!isEmpty(objid)) {
                //var slUrl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configuratorso', deploymentId: 'customdeploy_sna_hul_sl_configuratorso', returnExternalUrl: true});
                slUrl = externalUrl;
                slUrl += '&objid=' + objid;
                slUrl += '&changed=checkdummy';
                console.log('searchButton 1 : ' + slUrl);

                // Perform HTTP POST call
                var resp = https.get({url: slUrl});

                objval = JSON.parse(resp.body);
                objdummy = objval.objdummy
            }

            if (objdummy) {
                alert('Please enter an Actual Rental Object');
                return;
            }

            actualobj = objid;
        }

        if (isEmpty(actualobj) && isEmpty(objid)) {
            alert('Please enter an Actual Rental Object');
            return;
        }

        var fullURL = externalUrlMain;
        fullURL += '&soid=' + soid;
        fullURL += '&contractid=' + contractid;
        fullURL += '&actualobjid=' + actualobj;
        fullURL += '&objid=' + objid;
        fullURL += '&fleetno=' + fleetno;
        fullURL += '&comments=' + encodeURIComponent(xml.escape({xmlText: comments}));
        console.log('searchButton 2 : ' + fullURL);

        /*var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_rentalconfigurat', deploymentId: 'customdeploy_sna_hul_sl_rentalconfigurat', returnExternalUrl: true,
            params: {
                soid: soid,
                contractid: contractid,
                actualobjid: actualobj,
                objid: objid,
                fleetno: fleetno
            }
        });*/

        // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
        window.onbeforeunload = null;
        window.document.location = fullURL;
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        searchButton: searchButton,
        fieldChanged: fieldChanged
    };
    
});
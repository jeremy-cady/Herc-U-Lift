/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Library script of the "SNA HUL SL Stock Order Report" Suitelet Script
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/7/13         191788              caranda         Initial version.
 *
 */
define(['N/https', 'N/record', 'N/runtime', 'N/search', 'N/ui/message', 'N/url', 'N/currentRecord', 'N/ui/dialog'],
/**
 * @param{https} https
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
function(https, record, runtime, search, message, url, currentRecord, dialog) {
    
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
        console.log('do nothing')
    }

    function fieldChanged(scriptContext){
        let currRecord = scriptContext.currentRecord;
        let fieldName = scriptContext.fieldId;
        let sublistName = scriptContext.sublistId;
        let lineNo = scriptContext.line;

        if(fieldName == 'custpage_filter_loc'){
            let locName = currRecord.getText({fieldId:'custpage_filter_loc'});
            locName = locName.split(' : ');
            currRecord.setText({fieldId:'custpage_filter_locname', text:locName[locName.length-1]});
        }
    }

    function saveRecord(context){
        let currRecord = context.currentRecord;
        let filterFlds = ['custpage_filter_itemcat', 'custpage_filter_vendor', 'custpage_filter_loc', 'custpage_filter_demper', 'custpage_filter_demper_end', 'custpage_filter_poper', 'custpage_filter_poper_end', 'custpage_filter_diffmin', 'custpage_filter_diffmax', 'custpage_filter_ropqty'];

        let showAlert = false;
        let fieldValueArr = [];

        for(let i = 0 ; i < filterFlds.length ; i++){
            let fieldName = filterFlds[i];

            if(fieldName.startsWith('custpage_filter_')){
                let fieldValue = currRecord.getValue({fieldId: fieldName});

                if(isEmpty(fieldValue)){
                    //Add Field without values
                    fieldValueArr.push(fieldName);
                }
            }

        }

        if(filterFlds.length == fieldValueArr.length){
            showAlert = true;
        }

        if(showAlert){
            dialog.confirm({
                title: "Warning",
                message: "Fetching Data without filters will cause a timeout.\n\nClick 'OK' if you wish to generate the results via CSV instead."
            }).then(success).catch(failure);
        }else{
            return true;
        }

    }

    function success(result) {
        console.log("Success with value " + result);

        if(result){
            generateCSV()
            return true;
        }else{
            return false;
        }

    }

    function failure(reason) {
        console.log("Failure: " + reason);
        return true;
    }


    const generateCSV = () => {

        //try {

        const queryString = searchToObject();
        console.log(queryString);

            let suiteletUrl = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_stockorderreport', // Replace with your Suitelet script ID
                deploymentId: 'customdeploy_sna_hul_sl_stockorderreport', // Replace with your Suitelet deployment ID
                params: { isCSV: 'true', schedParams: JSON.stringify(queryString) }
            });

            // Example of making a POST request to the Suitelet
            https.post({
                url: suiteletUrl//,
                //body: JSON.stringify({ isCSV: 'true' })
            })


            // Display confirmation message
            message.create({
                title: 'Success',
                message: 'Generating CSV. Please wait as it may take a while. Thank you!',
                type: message.Type.CONFIRMATION
            }).show();

            location.reload();
        /*} catch (e) {
            // Display error message
            message.create({
                title: 'Error',
                message: 'Failed to trigger Map/Reduce script: ' + e.message,
                type: message.Type.ERROR
            }).show();
        }*/
    }

    const searchToObject = () => {
        let pairs = window.location.search.substring(1).split("&"),
            obj = {},
            pair,
            i;

        for ( i in pairs ) {
            if ( pairs[i] === "" ) continue;

            pair = pairs[i].split("=");
            obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
        }

        return obj;
    }

    const isEmpty = (stValue) => {
        return ((stValue === '' || stValue == null || stValue == undefined) ||
            (stValue.constructor === Array && stValue.length == 0) ||
            (stValue.constructor === Object && (function(v) {
                for (var k in v) return false;
                return true;
            })(stValue)));
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        generateCSV: generateCSV
    };
    
});

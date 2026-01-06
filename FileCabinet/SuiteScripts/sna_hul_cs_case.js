/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script of case record
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/3/28       		                 aduldulao       Initial version.
 * 2023/4/28       		                 aduldulao       custrecord_sna_hul_from_save_and_create
 * 2023/10/22                            fang            Autopopulate the following fields based on Equipment Asset selected: Case Object, Owner Status, Posting Status, Warranty Expiration Date
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/search'],
/**
 * @param{currentRecord} currentRecord
 */
function(currentRecord, url, search) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for ( var k in v)
                return false;
            return true;
        })(stValue)));
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
        var currentRecord = scriptContext.currentRecord;

        var query = (window.location.search.substring(1));
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');

            if (pair[0] == 'custevent_nx_case_asset') {
                currentRecord.setValue({fieldId: 'custevent_nx_case_asset', value: pair[1]});
            }
        }
    }

    function fieldChanged(scriptContext) {
        var currRec = scriptContext.currentRecord;
        var fieldId = scriptContext.fieldId;

        if (fieldId == 'custevent_nxc_case_assets') {
            var equipAssetId = currRec.getValue({
                fieldId: fieldId
            }); //Multiselect field = Array

            console.log('equipAssetId', equipAssetId);
            console.log('isEmpty(equipAssetId[0])', isEmpty(equipAssetId[0]));

            if (!isEmpty(equipAssetId) && !isEmpty(equipAssetId[0])) {
                console.log('Equipment Asset has value');

                var caseObjectIdLookup = search.lookupFields({
                    type: 'customrecord_nx_asset',
                    id: equipAssetId,
                    columns: 'custrecord_sna_hul_nxcassetobject'
                }).custrecord_sna_hul_nxcassetobject;

                console.log('caseObjectIdLookup', caseObjectIdLookup);

                if (!isEmpty(caseObjectIdLookup)) {
                    var caseObjectId = caseObjectIdLookup[0].value;

                    console.log('caseObjectId', caseObjectId);

                    currRec.setValue({
                        fieldId: 'custevent_sna_hul_case_object',
                        value: caseObjectId
                    });

                    var caseObjectFldsLookup = search.lookupFields({
                        type: 'customrecord_sna_objects',
                        id: caseObjectId,
                        columns: ['custrecord_sna_owner_status', 'custrecord_sna_posting_status', 'custrecord_sna_warranty_expiration_date']
                    });

                    console.log('caseObjectFldsLookup', caseObjectFldsLookup);

                    var ownerStatus = caseObjectFldsLookup.custrecord_sna_owner_status;
                    var postingStatus = caseObjectFldsLookup.custrecord_sna_posting_status;
                    var warrantyExpiration = caseObjectFldsLookup.custrecord_sna_warranty_expiration_date;

                    console.log('ownerStatus', ownerStatus);
                    console.log('postingStatus', postingStatus);
                    console.log('warrantyExpiration', warrantyExpiration);

                    if (!isEmpty(ownerStatus)) {
                        currRec.setValue({
                            fieldId: 'custevent_sna_hul_owner_status',
                            value: ownerStatus[0].value
                        });
                    }

                    if (!isEmpty(postingStatus)) {
                        currRec.setValue({
                            fieldId: 'custevent_sna_hul_posting_status',
                            value: postingStatus[0].value
                        });
                    }

                    if (!isEmpty(warrantyExpiration)) {
                        currRec.setValue({
                            fieldId: 'custevent_sna_hul_warranty_expiration',
                            value: new Date (warrantyExpiration)
                        });
                    }

                }

            }
        }
    }

    function showPrompt(siteform, sitetype) {
        var rec = currentRecord.get();
        var siteasset = rec.getValue({fieldId: 'custevent_nx_case_asset'});
        var siteassettxt = rec.getText({fieldId: 'custevent_nx_case_asset'});
        var cust = rec.getValue({fieldId: 'custevent_nx_customer'});
        var subj = rec.getValue({fieldId: 'title'});

        if (!isEmpty(siteasset) && siteassettxt != 'To Be Generated') {
            alert('NextService Site Asset is not empty');
            return;
        }

        document.getElementById('submitter').click();

        var path = url.resolveRecord({
            recordType: 'customrecord_nx_asset',
            recordId: null,
            isEditMode: true,
            params: {
                'cf': siteform,
                'record.custrecord_nxc_na_asset_type': sitetype,
                'record.custrecord_nx_asset_customer': cust,
                'record.custrecord_sna_related_case': subj,
                'record.custrecord_sna_hul_from_save_and_create': 'T'
            }
        });

        // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
        window.onbeforeunload = null;
        window.document.location = path;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        showPrompt: showPrompt
    };
    
});

/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * Client script of the temporary item suitelet
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/6/23       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/https', 'N/search', 'N/url'],
/**
 * @param{currentRecord} currentRecord
 * @param{https} https
 * @param{search} search
 * @param{url} url
 */
function(currentRecord, https, search, url) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    function createNewVendor() {
        /*var sloptions = 'https://6952227-sb1.app.netsuite.com/app/common/entity/vendor.nl?target=main:custpage_vendorfld&label=Vendor';
        var linkMain = '<button onclick="window.open(\''+sloptions+'\', \'newwindow2\', \'width=400,height=300\'); return false;">Select</button>';*/
    }

    function submitAgain() {
        var currrec = currentRecord.get();

        var rectype = currrec.getValue({fieldId: 'custpage_rectypefld'});
        var item = currrec.getValue({fieldId: 'custpage_itemfld'});
        var vendor = currrec.getValue({fieldId: 'custpage_vendorfld'});
        var vendoritmcode = currrec.getValue({fieldId: 'custpage_vendoritmcodefld'});
        var qty = currrec.getValue({fieldId: 'custpage_qtyfld'});
        var porate = currrec.getValue({fieldId: 'custpage_poratefld'});
        var desc = currrec.getValue({fieldId: 'custpage_descfld'});
        var shipmethod =  currrec.getValue({fieldId: 'custpage_shipmethodfld'});

        if (isEmpty(item) || isEmpty(vendor) || isEmpty(vendoritmcode) || isEmpty(qty) || isEmpty(porate) || isEmpty(desc)) {
            alert('Please enter value(s) for: Item, Vendor, Vendor Item Code, Quantity, PO Rate, and Description');
            return;
        }

        window.opener.require(['N/currentRecord'], function() {
            var rec = window.opener.require('N/currentRecord').get();

            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: item, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_ship_meth_vendor', value: shipmethod, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', value: vendor, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code', value: vendoritmcode, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: qty, forceSyncSourcing: true});
            if (rectype == 'salesorder') {
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'porate', value: porate, forceSyncSourcing: true});
            }
            else {
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', value: porate, forceSyncSourcing: true});
            }
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'description', value: desc, forceSyncSourcing: true});
            rec.commitLine({sublistId: 'item'});
        });

        var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_temporary_item', deploymentId: 'customdeploy_sna_hul_sl_temporary_item',
            params: {addednew: true, rectype: rectype}
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
    function pageInit(scriptContext) {}

    return {
        pageInit: pageInit,
        submitAgain: submitAgain
    };
    
});

/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Purpose:  This Client script executes on Edit, Create and View of Sales Order and Invoice.
*           It takes the Customer ID, finds the associated Customer record, checks for
*           the value of the checkbox labeled 'PO Required'. If TRUE, custom warning banner is
*           disaplyed using SweetAlerts to alert the user that a PO number needs to be entered
*           on the SO. If FALSE, no action.
* Initial Date: 07/03/2024
* Revision Date: M/D/YYYY
* Version: 1.0x
*/
define(["require", "exports", "N/search", "SuiteScripts/Third_Party_Applications/sweetalert2.all.js"], function (require, exports, search, Swal) {
    "use strict";
        /**
    * Defines the function that is executed after the page completes loading or when the form is reset.
    * The following sample tasks can be performed:
    *  - Populate field defaults.
    *  - Disable or enable fields.
    *  - Change field availability or values depending on the data available for the record.
    *  - Add flags to set initial values of fields.
    *  - Provide alerts where the data being loaded is inconsistent or corrupt.
    *  - Retrieve user login information and change field availability or values accordingly.
    *  - Validate that fields required for your custom code (but not necessarily required for the form) exist
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.mode - The mode in which the record is being accessed ('create' | 'copy' | 'edit' | 'view')
    * @returns {void}
    * @since 2015.2
    */
        var pageInit = function (ctx) {
            // 1. determine the record type
            console.log('fieldChanged: ', JSON.stringify(ctx));
            var thisRecord = ctx.currentRecord;
            console.log('thisRecord: ', thisRecord);
            var recType = thisRecord.type;
            console.log('recType: ', recType);
            // 2. determine the mode for the SO
            var recMode = ctx.mode;
            console.log('recMode: ', recMode);
            // 3. get customer id from field
            var customerID = thisRecord.getValue({ fieldId: 'entity' });
            console.log('customerID: ', customerID);
            // 4. find customer record based on id
            // 5. get value from 'custentity_sna_hul_po_required'
            try {
                var poReqValue = getPOReqValue(customerID);
                // 6. IF recType = 'salesorder' OR 'invoice' AND recMode = 'view'
                //    OR 'edit' OR 'create' AND poReqValue = true
                //    display warning banner
                if (poReqValue === true) {
                    console.log('poReqValue is true', poReqValue);
                    displayAlert(Swal);
                }
                // 7. if value is FALSE, exit
            }
            catch (error) {
                console.error('ERROR in pageInit: ', error);
            }
        };
    /**
    * Defines the function that is executed when a field is changed by a user or client side call.
    * This event may also execute directly through beforeLoad user event scripts.
    * The following sample tasks can be performed:
    *  - Provide the user with additional information based on user input.
    *  - Disable or enable fields based on user input.
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - The sublist ID name.
    * @param {string} ctx.fieldId - The field ID name.
    * @param {number} ctx.lineNum - Line number. Will be undefined if not a sublist or matrix field
    * @param {number} ctx.columnNum - Line number. Will be undefined if not a matrix field
    * @returns {void}
    * @Since 2015.2
    */
    var fieldChanged = function (ctx) {
        /**
         * we want to determine the record type, mode, PO Num?, PO Required?
         * construct conditionals based on those variables to display
         * warning banner appropriately
         */
        // 1. determine the record type
        console.log('fieldChanged: ', JSON.stringify(ctx));
        var thisRecord = ctx.currentRecord;
        console.log('thisRecord: ', thisRecord);
        var recType = thisRecord.type;
        console.log('recType: ', recType);
        // 2. determine the mode for the record
        // 3. get customer id from field in edit or create mode when the field is changed
        // 4. find customer record based on id
        // 5. get value from 'custentity_sna_hul_po_required'
        // 6. if value if TRUE, display warning banner
        // 7. if value is FALSE, exit
    };
    var getPOReqValue = function (customerID) {
        console.log('in getPOReqValue', customerID);
        var lookupFieldsParams = {
            type: 'customer',
            id: customerID,
            columns: ['custentity_sna_hul_po_required']
        };
        var poReqValue = search.lookupFields(lookupFieldsParams).custentity_sna_hul_po_required;
        console.log('poReqValue: ', poReqValue);
        return poReqValue;
    };
    var displayAlert = (Swal) => {
        console.log('in displayAlert');
        var alert = Swal.fire({
            title: 'WARNING',
            text: 'This customer requires a PO',
            icon: 'warning',
            iconColor: '#CC0000',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#CC0000'
        });
        return alert;
    }
    return {
        fieldChanged: fieldChanged,
        pageInit: pageInit,
    };
});

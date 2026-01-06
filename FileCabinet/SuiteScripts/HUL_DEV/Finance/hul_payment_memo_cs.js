/**
* @NApiVersion 2.0
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 04/28/2025
* Revision Date: 04/28/2025
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query"], function (require, exports, log, query) {
    "use strict";
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
        var currentRecord = ctx.currentRecord;
        var changedFieldId = ctx.fieldId;
        try {
            // Example 1: Responding to a change in a body field
            if (changedFieldId === 'paymentoption') { // Replace 'entity' with the actual field ID
                var paymentInstrumentID = String(currentRecord.getValue({ fieldId: 'paymentoption' }));
                log.debug('paymentInstrumentID', paymentInstrumentID);
                if (paymentInstrumentID) {
                    var memoQuery = "\n                    SELECT pct.memo\n                    FROM paymentCardToken pct\n                    WHERE pct.id = ".concat(paymentInstrumentID, "\n                ");
                    var memoResult = query.runSuiteQL({ query: memoQuery });
                    var memoRow = memoResult.asMappedResults();
                    if (memoRow.length > 0) {
                        var memo = memoRow[0].memo;
                        log.debug('memo', memo);
                        currentRecord.setValue({
                            fieldId: 'custbody_hul_payment_memo',
                            value: memo
                        });
                    }
                }
            }
        }
        catch (error) {
            log.error({
                title: 'fieldChanged Error',
                details: error
            });
        }
    };
    /**
    * Defines the function that is executed when an existing line is selected.
    * This event can behave like a pageInit event for line items in an inline editor sublist or editor sublist
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - The sublist ID name.
    * @returns {void}
    * @Since 2015.2
    */
    var lineInit = function (ctx) {
    };
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
    };
    /**
    * Defines the function that is executed executed when a field that sources information from another
    * field is modified. Executes on transaction forms only.
    * This event behaves like a fieldChanged event after all dependent field values have been set. The
    * event waits for any cascaded field changes to complete before calling the user defined function.
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - The sublist ID name.
    * @param {string} ctx.fieldId - The field ID name.
    * @returns {void}
    * @Since 2015.2
    */
    var postSourcing = function (ctx) {
    };
    /**
    * Defines the function that is executed when a record is saved (after the submit button is pressed but
    * before the form is submitted).
    * The following sample tasks can be performed:
    *  - Provide alerts before committing the data.
    *  - Enable fields that were disabled with other functions.
    *  - Redirect the user to a specified URL.
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @returns {boolean} true if the record is valid and is saved. false otherwise.
    * @Since 2015.2
    */
    var saveRecord = function (ctx) {
        return true;
    };
    /**
    * Defines the function that is executed after a sublist is inserted, removed, or edited.
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - The sublist ID name.
    * @returns {void}
    * @Since 2015.2
    */
    var sublistChanged = function (ctx) {
    };
    /**
    * Defines the validation function that is executed when a field is changed by a user or client side call.
    * This event executes on fields added in beforeLoad user event scripts.
    * The following sample tasks can be performed:
    *  - Validate field lengths.
    *  - Restrict field entries to a predefined format.
    *  - Restrict submitted values to a specified range
    *  - Validate the submission against entries made in an associated field
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - The sublist ID name.
    * @param {string} ctx.fieldId - The field ID name.
    * @param {number} ctx.lineNum - Line number. Will be undefined if not a sublist or matrix field
    * @param {number} ctx.columnNum - Line number. Will be undefined if not a matrix field
    * @returns {boolean} true if the field is valid and the change is successful. false otherwise.
    * @Since 2015.2
    */
    var validateField = function (ctx) {
        return true;
    };
    /**
    * Defines the validation function that is executed before a line is added to an inline editor sublist or
    * editor sublist.
    * This event can behave like a saveRecord event for line items in an inline editor sublist or editor
    * sublist
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    * @returns {boolean} true if the sublist line is valid and the insertion is successful. false otherwise.
    * @Since 2015.2
    */
    var validateLine = function (ctx) {
        return true;
    };
    /**
    * Defines the validation function that is executed when a sublist line is inserted into an edit sublist.
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    * @returns {boolean} true if the sublist line is valid and the insertion is successful. false otherwise.
    * @Since 2015.2
    */
    var validateInsert = function (ctx) {
        return true;
    };
    /**
    * Defines the validation function that is executed when an existing line in an edit sublist is deleted.
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    * @returns {boolean} true if the sublist line is valid and the delete is successful. false otherwise.
    * @Since 2015.2
    */
    var validateDelete = function (ctx) {
        return true;
    };
    /**
     * Defines the function that is executed  when the record enters the localization context that is
     * specified on the script deployment record.
     *
     * If a script deployment is localized on the Context Filtering tab, the pageInit entry point of the script is
     * ignored, and no other entry points of the script are called before localizationContextEnter or after
     * localizationContextExit.  It is possible that the record may never enter a localization context. In this
     * case, no callbacks of the script are executed.
     * @param {Object} ctx
     * @param {Record} ctx.currentRecord - Current form record
     * @param {string} ctx.locale - The list of countries that represent the new localization context.
     * @returns {void}
     * @since 2020.1
     */
    var localizationContextEnter = function (ctx) {
    };
    /**
     * Defines the function that is executed  when the record exits that context.
     *
     * If a script deployment is localized on the Context Filtering tab, the pageInit entry point of the script is
     * ignored, and no other entry points of the script are called before localizationContextEnter or after
     * localizationContextExit.  It is possible that the record may never enter a localization context. In this
     * case, no callbacks of the script are executed.
     * @param {Object} ctx
     * @param {Record} ctx.currentRecord - Current form record
     * @param {string} ctx.locale - The list of countries that represent the new localization context.
     * @returns {void}
     * @since 2020.1
     */
    var localizationContextExit = function (ctx) {
    };
    return {
        fieldChanged: fieldChanged,
        lineInit: lineInit,
        pageInit: pageInit,
        postSourcing: postSourcing,
        saveRecord: saveRecord,
        sublistChanged: sublistChanged,
        validateDelete: validateDelete,
        validateField: validateField,
        validateInsert: validateInsert,
        validateLine: validateLine,
        localizationContextEnter: localizationContextEnter,
        localizationContextExit: localizationContextExit
    };
});

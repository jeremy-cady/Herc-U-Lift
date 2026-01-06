/**
* @NApiVersion 2.0
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 04/28/2025
* Revision Date: 04/28/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
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
const fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    const currentRecord = ctx.currentRecord;
    const changedFieldId = ctx.fieldId;

    try {
        if (changedFieldId === 'paymentoption') {
            const paymentInstrumentID = String(currentRecord.getValue({ fieldId: 'paymentoption' }));
            if (paymentInstrumentID) {
                log.debug('we have a payment instrument ID', paymentInstrumentID);
                const paymentMethod = findPaymentMethod(paymentInstrumentID);
                log.debug('paymentMethod', paymentMethod);
                if (paymentMethod) {
                    const memo = getPaymentMemo(String(paymentMethod), Number(paymentInstrumentID));
                    log.debug('memo', memo);
                    currentRecord.setValue({
                        fieldId: 'custbody_hul_payment_memo',
                        value: memo
                    });
                }
            }
        }
    } catch (error) {
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
const lineInit = (ctx: EntryPoints.Client.lineInitContext) => {

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
const pageInit = (ctx: EntryPoints.Client.pageInitContext) => {

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
const postSourcing = (ctx: EntryPoints.Client.postSourcingContext) => {

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
const saveRecord = (ctx: EntryPoints.Client.saveRecordContext) => {
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
const sublistChanged = (ctx: EntryPoints.Client.sublistChangedContext) => {

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
const validateField = (ctx: EntryPoints.Client.validateFieldContext) => {
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
const validateLine = (ctx: EntryPoints.Client.validateLineContext) => {
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
const validateInsert = (ctx: EntryPoints.Client.validateInsertContext) => {
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
const validateDelete = (ctx: EntryPoints.Client.validateDeleteContext) => {
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
const localizationContextEnter = (ctx) => {

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
const localizationContextExit = (ctx) => {

};

const findPaymentMethod = (paymentInstrumentID: string) => {
    const paymentMethodQuery = `
        SELECT pi.paymentmethod
        FROM paymentInstrument pi
        WHERE pi.id = ${paymentInstrumentID}
    `;
    const paymentMethodResult = query.runSuiteQL({ query: paymentMethodQuery });
    const paymentMethodRow = paymentMethodResult.asMappedResults();
    log.debug('paymentMethodRow', paymentMethodRow);
    if (paymentMethodRow.length > 0) {
        const paymentMethod = paymentMethodRow[0].paymentmethod;
        return paymentMethod;
    }
};

const getPaymentMemo = (paymentMethod: string, paymentInstrumentID: number) => {
    let memo: string;
    switch (paymentMethod) {
        case '1':
            log.debug('paymentMethod is CASH', paymentMethod);
            memo = 'Cash Payment';
            break;
        case '2':
            log.debug('paymentMethod is CHECK', paymentMethod);
            memo = 'Check Payment';
            break;
        case '3':
            log.debug('paymentMethod is DISCOVER', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '4':
            log.debug('paymentMethod is MASTERCARD', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '5':
            log.debug('paymentMethod is VISA', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '6':
            log.debug('paymentMethod is AMERICAN EXPRESS', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '7':
            log.debug('paymentMethod is SCALEAPP PAYMENTS', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '107':
            log.debug('paymentMethod is EFT', paymentMethod);
            memo = String('EFT Payment');
            break;
        case '108':
            log.debug('paymentMethod is PAYMENTCARDTOKEN', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '109':
            log.debug('paymentMethod is GENERALTOKEN', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '110':
            log.debug('paymentMethod is CC Terminal - Des Moines', paymentMethod);
            memo = String('Terminal Payment at Des Moines');
            break;
        case '111':
            log.debug('paymentMethod is CC Terminal - Grand Rapids', paymentMethod);
            memo = String('Terminal Payment at Grand Rapids');
            break;
        case '112':
            log.debug('paymentMethod is CC Terminal - Sioux Falls', paymentMethod);
            memo = String('Terminal Payment at Sioux Falls');
            break;
        case '113':
            log.debug('paymentMethod is VERSAPAY REFUND', paymentMethod);
            memo = String('Versapay Refund');
            break;
        case '114':
            log.debug('paymentMethod is ACH', paymentMethod);
            memo = String(getMemoText(paymentMethod, paymentInstrumentID));
            break;
        case '115':
            log.debug('paymentMethod is CC Terminal - Maple Plain', paymentMethod);
            memo = String('Terminal Payment at Maple Plain');
            break;
        case '116':
            log.debug('paymentMethod is Internal Billing', paymentMethod);
            memo = String('Internal Billing Payment');
            break;
        case '117':
            log.debug('paymentMethod is Versapay Manual Entry', paymentMethod);
            memo = String('Versapay Manual Entry Payment');
            break;
    }
    return memo;
};

const getMemoText = (paymentMethod, paymentInstrumentID) => {
    // eslint-disable-next-line max-len
    if (paymentMethod === '3' || paymentMethod === '4' || paymentMethod === '5' || paymentMethod === '6' || paymentMethod === '7') {
        const memoQuery = `
            SELECT pc.memo
            FROM paymentCard pc
            WHERE pc.id = ${paymentInstrumentID}
        `;
        const memoQueryResult = query.runSuiteQL({ query: memoQuery });
        const memoQueryRow = memoQueryResult.asMappedResults();
        log.debug('memoQueryRow', memoQueryRow);
        if (memoQueryRow.length > 0) {
            const memo = memoQueryRow[0].memo;
            return memo;
        }
    } else if (paymentMethod === '108') {
        const memoQuery = `
            SELECT pct.memo
            FROM paymentCardToken pct
            WHERE pct.id = ${paymentInstrumentID}
        `;
        const memoQueryResult = query.runSuiteQL({ query: memoQuery });
        const memoQueryRow = memoQueryResult.asMappedResults();
        log.debug('memoQueryRow', memoQueryRow);
        if (memoQueryRow.length > 0) {
            const memo = memoQueryRow[0].memo;
            return memo;
        }
    } else if (paymentMethod === '109') {
        const memoQuery = `
            SELECT gt.memo
            FROM generalToken gt
            WHERE gt.id = ${paymentInstrumentID}
        `;
        const memoQueryResult = query.runSuiteQL({ query: memoQuery });
        const memoQueryRow = memoQueryResult.asMappedResults();
        log.debug('memoQueryRow', memoQueryRow);
        if (memoQueryRow.length > 0) {
            const memo = memoQueryRow[0].memo;
            return memo;
        }
    } else if (paymentMethod === '114') {
        const memoQuery = `
            SELECT ach.memo
            FROM AutomatedClearingHouse ach
            WHERE ach.id = ${paymentInstrumentID}
        `;
        const memoQueryResult = query.runSuiteQL({ query: memoQuery });
        const memoQueryRow = memoQueryResult.asMappedResults();
        log.debug('memoQueryRow', memoQueryRow);
        if (memoQueryRow.length > 0) {
            const memo = memoQueryRow[0].memo;
            return memo;
        }
    }
};

export = {
    fieldChanged,
    lineInit,
    pageInit,
    postSourcing,
    saveRecord,
    sublistChanged,
    validateDelete,
    validateField,
    validateInsert,
    validateLine,
    localizationContextEnter,
    localizationContextExit
};
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/record", "SuiteScripts/HUL_DEV/Global/hul_swal"], function (require, exports, record, swal) {
    "use strict";
    /** ===== CONFIG ===== */
    const FORM_ID = '121';
    const TERMS_REQUIRE_CC = new Set(['8']);
    const DEBOUNCE_MS = 250;
    /** ===== INTERNAL STATE ===== */
    let debounceId = null; // for warnings/checks
    let debounceLogId = null; // for unconditional PI logging
    let lastWarnedKey = '';
    /** ===== LOGGING (client-safe) ===== */
    function clog(...args) {
        try {
            // eslint-disable-next-line no-console
            console.log('[CC-CHECK]', ...args);
        }
        catch {
            /* no-op */
        }
    }
    /** ===== UTILS ===== */
    function getStr(currentRecord, fieldId) {
        try {
            const v = currentRecord.getValue({ fieldId });
            return v == null ? '' : String(v);
        }
        catch {
            return '';
        }
    }
    /** Log all paymentinstruments.instrumenttype values (unconditional, when customer is known). */
    function logPaymentInstruments(custRec) {
        try {
            const n = custRec.getLineCount({ sublistId: 'paymentinstruments' }) || 0;
            clog('PI.count =', n);
            for (let i = 0; i < n; i += 1) {
                const tId = String(custRec.getSublistValue({
                    sublistId: 'paymentinstruments',
                    fieldId: 'instrumenttype',
                    line: i
                }) ?? '');
                clog(`PI[${i}].instrumenttype =`, tId);
            }
        }
        catch (e) {
            clog('PI.log error:', e?.message || e);
        }
    }
    function hasCreditCard(custRec) {
        try {
            const n = custRec.getLineCount({ sublistId: 'paymentinstruments' }) || 0;
            for (let i = 0; i < n; i += 1) {
                const tId = String(custRec.getSublistValue({
                    sublistId: 'paymentinstruments',
                    fieldId: 'instrumenttype',
                    line: i
                }) ?? '');
                // ID-only check: instrumenttype must be '1' or '3'
                if (tId === '1' || tId === '3')
                    return true;
            }
        }
        catch {
            /* no-op */
        }
        return false;
    }
    /**
     * Returns:
     *  - required=false => nothing to do
     *  - required=true, missing=false => OK to proceed
     *  - required=true, missing=true  => show/ block
     */
    function evaluate(currentRecord) {
        // Guard: correct form and a customer selected
        const formId = getStr(currentRecord, 'customform');
        if (formId !== FORM_ID)
            return { required: false, missing: false };
        const entityId = getStr(currentRecord, 'entity');
        if (!entityId)
            return { required: false, missing: false };
        // First check SO terms
        const soTermsId = getStr(currentRecord, 'terms');
        let requires = TERMS_REQUIRE_CC.has(soTermsId);
        // If SO terms don't force it, check the customer's terms
        const cust = record.load({ type: record.Type.CUSTOMER, id: entityId });
        if (!requires) {
            const custTermsId = String(cust.getValue({ fieldId: 'terms' }) ?? '');
            requires = TERMS_REQUIRE_CC.has(custTermsId);
            if (!requires)
                return { required: false, missing: false };
        }
        // If required, make sure they actually have a card
        const ok = hasCreditCard(cust);
        return { required: true, missing: !ok };
    }
    function warnOnce(currentRecord) {
        const key = `${getStr(currentRecord, 'entity')}|${getStr(currentRecord, 'terms')}|${getStr(currentRecord, 'customform')}`;
        if (key === lastWarnedKey)
            return;
        lastWarnedKey = key;
        try {
            // Uses your hul_swal helper (which lazy-loads SweetAlert internally).
            swal.customerCreditCardRequiredMessage();
        }
        catch {
            // Fallback if the helper/library can’t load for any reason.
            alert('This customer requires a credit card on file based on their terms, ' +
                'but no card was found. Please add a Payment Card.');
        }
    }
    function runCheck(mode, currentRecord) {
        try {
            const res = evaluate(currentRecord);
            if (!res.required)
                return true;
            if (res.missing) {
                // Always show a message; only block on save.
                if (mode === 'warn') {
                    warnOnce(currentRecord);
                }
                else {
                    // show again when blocking, so user knows why the save failed
                    try {
                        swal.customerCreditCardRequiredMessage();
                    }
                    catch {
                        alert('Credit Card required on file for this customer.');
                    }
                    return false;
                }
            }
            return true;
        }
        catch {
            // Fail open to avoid accidental hard locks if something throws.
            return true;
        }
    }
    /** Debounced warning gate. */
    function scheduleWarn(currentRecord) {
        if (debounceId)
            window.clearTimeout(debounceId);
        debounceId = window.setTimeout(() => {
            debounceId = null;
            void runCheck('warn', currentRecord);
        }, DEBOUNCE_MS);
    }
    /** Debounced, unconditional PI logging when Customer is known (form 121). */
    function scheduleLogPI(currentRecord) {
        if (debounceLogId)
            window.clearTimeout(debounceLogId);
        debounceLogId = window.setTimeout(() => {
            debounceLogId = null;
            try {
                const formId = getStr(currentRecord, 'customform');
                if (formId !== FORM_ID)
                    return;
                const entityId = getStr(currentRecord, 'entity');
                if (!entityId)
                    return;
                const cust = record.load({ type: record.Type.CUSTOMER, id: entityId });
                clog('Logging payment instruments for customer', entityId);
                logPaymentInstruments(cust);
            }
            catch (e) {
                clog('scheduleLogPI error:', e?.message || e);
            }
        }, DEBOUNCE_MS);
    }
    /** ===== ENTRY POINTS ===== */
    const pageInit = (ctx) => {
        try {
            // If the SO is created from the Customer, entity may already be populated.
            // Debounced operations so we don’t race initial sourcing.
            scheduleLogPI(ctx.currentRecord); // <-- unconditional PI logging when customer is known
            scheduleWarn(ctx.currentRecord); // existing warn (gated by terms)
        }
        catch {
            /* no-op */
        }
    };
    const postSourcing = (ctx) => {
        try {
            // Only react to BODY fields we care about.
            if (!ctx.sublistId) {
                if (ctx.fieldId === 'entity') {
                    // Customer became known/changed: log PIs unconditionally.
                    scheduleLogPI(ctx.currentRecord);
                }
                if (ctx.fieldId === 'entity' || ctx.fieldId === 'terms') {
                    // Maintain existing warn behavior.
                    scheduleWarn(ctx.currentRecord);
                }
            }
        }
        catch {
            /* no-op */
        }
    };
    // Intentionally do nothing here to avoid storms from NetSuite UI wizardry.
    const fieldChanged = (_ctx) => true;
    // Final gate — block save if required & missing.
    const saveRecord = (ctx) => runCheck('block', ctx.currentRecord);
    return { pageInit, postSourcing, fieldChanged, saveRecord };
});

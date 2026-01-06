/* eslint-disable max-len */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Shift-click range selection for sublist checkboxes:
 * - Hold Shift and click another checkbox in the same column to toggle the whole range.
 * - Works for: hide_line, dismiss, apply_email on sublist 'custpage_results'.
 * - Operates on the current visible page only (does not span pages).
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fieldChanged = exports.pageInit = void 0;
    const SUBLIST_ID = 'custpage_results';
    const CHECKBOX_FIELDS = ['hide_line', 'dismiss', 'apply_email'];
    let shiftDown = false;
    let batching = false; // prevents recursive fieldChanged while we programmatically toggle a range
    const lastLineByField = {
        hide_line: null,
        dismiss: null,
        apply_email: null
    };
    /** Track Shift key globally so we can detect Shift-clicks. */
    function pageInit(_) {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift')
                shiftDown = true;
        }, true);
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift')
                shiftDown = false;
        }, true);
    }
    exports.pageInit = pageInit;
    /** Read checkbox value on a given line as a boolean. */
    function readCheckbox(rec, fieldId, line) {
        const raw = rec.getSublistValue({ sublistId: SUBLIST_ID, fieldId, line });
        return typeof raw === 'boolean' ? raw : String(raw).toUpperCase() === 'T';
    }
    /** Set checkbox on a given line; try setSublistValue, else selectLine→setCurrentSublistValue→commitLine. */
    function setCheckbox(rec, fieldId, line, value) {
        try {
            if (typeof rec.setSublistValue === 'function') {
                rec.setSublistValue({ sublistId: SUBLIST_ID, fieldId, line, value });
                return;
            }
        }
        catch (_e) {
            // fall through to dynamic path
        }
        // Fallback path
        rec.selectLine({ sublistId: SUBLIST_ID, line });
        rec.setCurrentSublistValue({ sublistId: SUBLIST_ID, fieldId, value });
        rec.commitLine({ sublistId: SUBLIST_ID });
    }
    /**
     * When a checkbox changes on the LIST sublist:
     * - If Shift is held and we have a previous line for this column, toggle the entire range to match.
     * - Then remember the current line as the last anchor.
     */
    function fieldChanged(ctx) {
        if (batching)
            return; // avoid re-entrancy while we toggle a range
        const rec = ctx.currentRecord;
        const { sublistId, fieldId, line } = ctx;
        if (sublistId !== SUBLIST_ID)
            return;
        if (!CHECKBOX_FIELDS.includes(fieldId))
            return;
        const lc = rec.getLineCount({ sublistId: SUBLIST_ID });
        const checked = readCheckbox(rec, fieldId, line);
        const col = fieldId;
        const last = lastLineByField[col];
        if (shiftDown && last != null && lc > 0) {
            const start = Math.max(0, Math.min(line, last));
            const end = Math.min(lc - 1, Math.max(line, last));
            batching = true;
            try {
                for (let i = start; i <= end; i += 1) {
                    setCheckbox(rec, col, i, checked);
                }
            }
            finally {
                batching = false;
            }
        }
        lastLineByField[col] = line;
    }
    exports.fieldChanged = fieldChanged;
});

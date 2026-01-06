/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * Title: Lease Dataset Viewer – Button handlers
 * Version: 1.3
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRebuildClick = exports.onDownloadCsv = exports.pageInit = void 0;
    function pageInit(_context) {
        // no-op; required entry point
    }
    exports.pageInit = pageInit;
    function getHiddenValue(id) {
        const el = document.getElementById(id);
        return el?.value?.trim() ?? '';
    }
    function onDownloadCsv() {
        try {
            const href = getHiddenValue('custpage_csv_url');
            if (!href)
                throw new Error('CSV URL not found on page.');
            window.location.href = href;
        }
        catch (e) {
            alert(`Download failed: ${e?.message ?? String(e)}`);
        }
    }
    exports.onDownloadCsv = onDownloadCsv;
    function onRebuildClick() {
        try {
            const href = getHiddenValue('custpage_rebuild_url');
            if (!href)
                throw new Error('Rebuild URL not found on page.');
            window.location.href = href;
        }
        catch (e) {
            alert(`Rebuild failed: ${e?.message ?? String(e)}`);
        }
    }
    exports.onRebuildClick = onRebuildClick;
    exports.default = { pageInit, onDownloadCsv, onRebuildClick };
});

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * Author: Jeremy Cady
 * Date: 11/11/2025
 * Version: 1.7
 *
 * Changes (v1.7):
 *   - After saving the dataset file, write fileId to N/cache using key "run_<token>".
 *   - Suitelet will read this exact fileId; no file-search/index lag.
 */
define(["require", "exports", "N/record", "N/log", "N/search", "N/file", "N/runtime", "N/cache"], function (require, exports, record, log, search, file, runtime, cache) {
    "use strict";
    /* -------------------------- Entry Points ------------------------- */
    function getInputData() {
        try {
            var filters = [
                search.createFilter({ name: 'type', operator: search.Operator.ANYOF, values: ['SalesOrd'] }),
                search.createFilter({ name: 'mainline', operator: search.Operator.IS, values: ['T'] }),
                search.createFilter({ name: 'cseg_sna_revenue_st', operator: search.Operator.ANYOF, values: ['441'] }),
                search.createFilter({ name: 'status', operator: search.Operator.NONEOF, values: ['SalesOrd:C'] })
            ];
            var soSearch = search.create({
                type: 'transaction',
                filters: filters,
                columns: [
                    search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
                    search.createColumn({ name: 'tranid' }),
                    search.createColumn({ name: 'trandate' }),
                    search.createColumn({ name: 'entity' }),
                    search.createColumn({ name: 'memo' }),
                    search.createColumn({ name: 'custbody1' })
                ]
            });
            try {
                var paged = soSearch.runPaged({ pageSize: 1000 });
                log.audit('getInputData', { description: 'SO search created (Revenue Stream 441, exclude Closed)', estimatedCount: paged.count });
            }
            catch (e) {
                log.debug('getInputData:runPaged (non-fatal)', (e === null || e === void 0 ? void 0 : e.message) || String(e));
            }
            return soSearch;
        }
        catch (error) {
            log.error('getInputData failed', (error === null || error === void 0 ? void 0 : error.message) || error);
            throw error;
        }
    }
    function map(context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        try {
            var res = JSON.parse(context.value);
            var soId = Number(res.id);
            var fromSearch = {
                tranid: (_a = colVal(res, 'tranid')) !== null && _a !== void 0 ? _a : '',
                trandate: (_b = colVal(res, 'trandate')) !== null && _b !== void 0 ? _b : '',
                customer: colText(res, 'entity'),
                memo: (_c = colVal(res, 'memo')) !== null && _c !== void 0 ? _c : null,
                custbody1: (_d = colVal(res, 'custbody1')) !== null && _d !== void 0 ? _d : null
            };
            var so_1 = record.load({ type: record.Type.SALES_ORDER, id: soId, isDynamic: false });
            var total = (_e = so_1.getValue({ fieldId: 'total' })) !== null && _e !== void 0 ? _e : null;
            var locationText = so_1.getText({ fieldId: 'location' }) || null;
            var firstBillDate = null;
            var lastBillDate = null;
            try {
                var bsVal = (_g = (_f = so_1).getValue) === null || _g === void 0 ? void 0 : _g.call(_f, { fieldId: 'billingschedule' });
                if (Array.isArray(bsVal) && bsVal.length) {
                    firstBillDate = normalizeDate(String(bsVal[0]));
                    lastBillDate = normalizeDate(String(bsVal[bsVal.length - 1]));
                }
                else {
                    var sublistId_1 = 'billingschedule';
                    var count = (_o = (_k = (_j = (_h = so_1).getLineCount) === null || _j === void 0 ? void 0 : _j.call(_h, { sublistId: sublistId_1 })) !== null && _k !== void 0 ? _k : (_m = (_l = so_1).getLineItemCount) === null || _m === void 0 ? void 0 : _m.call(_l, sublistId_1)) !== null && _o !== void 0 ? _o : 0;
                    if (count > 0) {
                        var readDate = function (line) {
                            var _a, _b, _c, _d, _e, _f;
                            return (_f = (_c = (_b = (_a = so_1).getSublistValue) === null || _b === void 0 ? void 0 : _b.call(_a, { sublistId: sublistId_1, fieldId: 'billdate', line: line })) !== null && _c !== void 0 ? _c : (_e = (_d = so_1).getLineItemValue) === null || _e === void 0 ? void 0 : _e.call(_d, sublistId_1, 'billdate', line + 1)) !== null && _f !== void 0 ? _f : null;
                        };
                        var firstRaw = readDate(0);
                        var lastRaw = readDate(count - 1);
                        if (firstRaw)
                            firstBillDate = normalizeDate(String(firstRaw));
                        if (lastRaw)
                            lastBillDate = normalizeDate(String(lastRaw));
                    }
                }
            }
            catch (e) {
                log.debug('map:billingschedule-error', { soId: soId, message: (e === null || e === void 0 ? void 0 : e.message) || String(e) });
            }
            var out = {
                id: soId,
                tranid: String(fromSearch.tranid),
                trandate: String(fromSearch.trandate),
                customer: fromSearch.customer || null,
                memo: fromSearch.memo || null,
                custbody1: fromSearch.custbody1,
                total: total,
                location: locationText,
                firstBillDate: firstBillDate,
                lastBillDate: lastBillDate
            };
            context.write({ key: String(soId), value: JSON.stringify(out) });
        }
        catch (error) {
            log.error('map:ERROR', (error === null || error === void 0 ? void 0 : error.message) || error);
        }
    }
    function reduce(context) {
        try {
            var key = context.key;
            var val = context.values && context.values[0] ? String(context.values[0]) : '';
            if (val) {
                context.write({ key: key, value: val });
            }
        }
        catch (error) {
            log.error('reduce:ERROR', (error === null || error === void 0 ? void 0 : error.message) || error);
        }
    }
    function summarize(summary) {
        var _a;
        try {
            log.audit('summarize:stats', { usage: summary.usage, concurrency: summary.concurrency, yields: summary.yields });
            if ((_a = summary.inputSummary) === null || _a === void 0 ? void 0 : _a.error)
                log.error('summarize:input-error', summary.inputSummary.error);
            summary.mapSummary.errors.iterator().each(function (k, e) { log.error('summarize:map-error', { key: k, error: e }); return true; });
            summary.reduceSummary.errors.iterator().each(function (k, e) { log.error('summarize:reduce-error', { key: k, error: e }); return true; });
            var rows_1 = [];
            summary.output.iterator().each(function (k, v) {
                try {
                    rows_1.push(JSON.parse(v));
                }
                catch (e) {
                    log.error('summarize:parse-output-row-failed', { key: k, message: (e === null || e === void 0 ? void 0 : e.message) || String(e) });
                }
                return true;
            });
            log.audit('summarize:rows-collected', { count: rows_1.length });
            var rawFolderParam = runtime.getCurrentScript().getParameter({ name: 'custscript_hul_output_folder' });
            var folderId = toIntSafe(rawFolderParam);
            if (!folderId) {
                log.error('summarize:no-output-folder', 'Set custscript_hul_output_folder to a valid File Cabinet Folder internal ID (integer).');
                return;
            }
            var incomingToken = runtime.getCurrentScript().getParameter({ name: 'custscript_hul_run_token' });
            var token = (incomingToken && String(incomingToken).trim()) || String(new Date().getTime());
            var json = JSON.stringify(rows_1, null, 2);
            var f = file.create({
                name: "hul_lease_so_dataset_".concat(token, ".json"),
                fileType: file.Type.JSON,
                contents: json,
                folder: folderId
            });
            var fileId = f.save();
            // Hand off the new fileId deterministically to the Suitelet
            try {
                var c = cache.getCache({ name: 'hul_dataset_runs' });
                c.put({ key: "run_".concat(token), value: String(fileId), ttl: 3600 });
                log.audit('cache-put', { token: token, fileId: fileId });
            }
            catch (ce) {
                log.error('cache-put-failed', (ce === null || ce === void 0 ? void 0 : ce.message) || String(ce));
            }
            log.audit('summarize:file-saved', { token: token, fileId: fileId, folderId: folderId, rows: rows_1.length });
        }
        catch (e) {
            log.error('summarize:ERROR', (e === null || e === void 0 ? void 0 : e.message) || String(e));
        }
    }
    /* ----------------------------- Helpers ---------------------------- */
    function colVal(res, col) {
        var _a;
        try {
            var v = (_a = res.values) === null || _a === void 0 ? void 0 : _a[col];
            if (v && typeof v === 'object' && 'value' in v)
                return v.value;
            return v !== null && v !== void 0 ? v : null;
        }
        catch (_b) {
            return null;
        }
    }
    function colText(res, col) {
        var _a;
        try {
            var v = (_a = res.values) === null || _a === void 0 ? void 0 : _a[col];
            if (v && typeof v === 'object') {
                if ('text' in v && v.text != null)
                    return String(v.text);
                if ('name' in v && v.name != null)
                    return String(v.name);
            }
            return v != null ? String(v) : null;
        }
        catch (_b) {
            return null;
        }
    }
    function toIntSafe(v) {
        var cleaned = String(v == null ? '' : v).replace(/[^\d]/g, '');
        return cleaned ? parseInt(cleaned, 10) : NaN;
    }
    function l2(v) {
        var s = String(v == null ? '' : v);
        return s.length < 2 ? "0".concat(s) : s;
    }
    function normalizeDate(v) {
        if (!v)
            return v;
        if (/^\d{4}-\d{2}-\d{2}$/.test(v))
            return v;
        var mdy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        var m = mdy.exec(v);
        if (m)
            return "".concat(m[3], "-").concat(l2(m[1]), "-").concat(l2(m[2]));
        var dmy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        m = dmy.exec(v);
        if (m)
            return "".concat(m[3], "-").concat(l2(m[2]), "-").concat(l2(m[1]));
        var d = new Date(v);
        if (!isNaN(d.getTime()))
            return "".concat(d.getFullYear(), "-").concat(l2(d.getMonth() + 1), "-").concat(l2(d.getDate()));
        return v;
    }
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});

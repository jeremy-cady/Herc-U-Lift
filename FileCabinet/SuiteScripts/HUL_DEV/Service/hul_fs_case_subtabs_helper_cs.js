/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 09/12/2025
 * Version: 3.7 (SweetAlert guide w/ robust diagnostics + FORCE_NOTIFY for testing)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "N/currentRecord", "SuiteScripts/HUL_DEV/Global/hul_swal"], function (require, exports, currentRecord, swal) {
    "use strict";
    var FIELD_ASSETS = 'custevent_nxc_case_assets';
    var FIELD_CUSTOMER = 'custevent_nx_customer';
    var SUITELET_URL_FIELD_ID = 'custpage_oc_sl_url';
    var OPEN_CASES_TOP_TAB_ID = 'custpage_open_cases_tab';
    var OPEN_CASES_SUBTAB_ID = 'custpage_open_cases_subtab';
    var LIST_HOST_ID = 'openCasesList';
    // ===== DEBUG TOGGLE: set to false after we confirm behavior =====
    var FORCE_NOTIFY = true;
    // One-time notification guard per unique selection (customer|assetIds)
    var notifiedKeys = new Set();
    function dbg(title, details) {
        try {
            // eslint-disable-next-line no-console
            console.log('[OpenCases CS]', title, details !== undefined ? details : '');
        }
        catch ( /* no-op */_a) { /* no-op */ }
    }
    dbg('module loaded');
    /* ---------------- DOM utils ---------------- */
    function qsel(id) {
        return document.getElementById(id);
    }
    function findFieldEl(fieldId) {
        var byId = document.getElementById(fieldId);
        if (byId)
            return byId;
        var byName = document.querySelector("[name=\"".concat(fieldId, "\"]"));
        if (byName)
            return byName;
        var byEndsWith = document.querySelector("input[id$=\"".concat(fieldId, "\"], select[id$=\"").concat(fieldId, "\"]"));
        return (byEndsWith || null);
    }
    /* ---------------- data helpers ---------------- */
    function getMultiIds(val) {
        if (!val)
            return [];
        if (Array.isArray(val)) {
            var first = val[0];
            if (first && typeof first === 'object' && 'value' in first) {
                return val.map(function (v) { return String(v.value); });
            }
            return val.map(function (v) { return String(v); });
        }
        var s = String(val);
        if (!s)
            return [];
        if (s.indexOf(',') >= 0)
            return s.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        return [s];
    }
    function onlyDigits(v) {
        var s = v === null || v === undefined ? '' : String(v);
        return s.replace(/[^\d]/g, '');
    }
    function getCustomerId(rec) {
        var id = rec.getValue({ fieldId: FIELD_CUSTOMER });
        if (!id)
            id = rec.getValue({ fieldId: 'company' }); // fallback when launched from Customer
        return onlyDigits(id);
    }
    function buildUrl(base, customerId, assetIds) {
        var qs = "customerId=".concat(encodeURIComponent(customerId), "&assetIds=").concat(encodeURIComponent(assetIds.map(function (a) { return onlyDigits(a); }).filter(function (a) { return a.length > 0; }).join(',')));
        if (!base)
            return '';
        return base.indexOf('?') >= 0 ? ("".concat(base, "&").concat(qs)) : ("".concat(base, "?").concat(qs));
    }
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    /* ---------------- rendering ---------------- */
    function renderRows(rows) {
        var host = qsel(LIST_HOST_ID);
        if (!host) {
            dbg('renderRows: host not found');
            return;
        }
        if (!rows || rows.length === 0) {
            host.innerHTML = '<div id="openCasesListEmpty" style="color:#666;">No related cases.</div>';
            dbg('renderRows: 0 rows');
            return;
        }
        var html = '<table id="openCasesTable"><thead><tr>';
        html += '<th>Open</th><th>Case ID</th><th>Case #</th><th>Start Date</th><th>Customer (ID)</th><th>Assigned To</th><th>Revenue Stream</th><th>Subject</th>';
        html += '</tr></thead><tbody>';
        for (var i = 0; i < rows.length; i += 1) {
            var r = rows[i] || {};
            var openUrl = String(r.open_url || '');
            var caseId = escapeHtml(String(r.case_id || ''));
            var caseNo = escapeHtml(String(r.case_number || ''));
            var start = escapeHtml(String(r.case_start_date || ''));
            var cust = escapeHtml(String(r.custevent_nx_customer || ''));
            var assigned = escapeHtml(String(r.case_assigned_to || ''));
            var revenue = escapeHtml(String(r.revenue_stream || ''));
            var subject = escapeHtml(String(r.subject || ''));
            var link = openUrl ? "<a href=\"".concat(openUrl, "\" target=\"_blank\" rel=\"noopener\">Open</a>") : '';
            html += "<tr><td>".concat(link, "</td><td>").concat(caseId, "</td><td>").concat(caseNo, "</td><td>").concat(start, "</td><td>").concat(cust, "</td><td>").concat(assigned, "</td><td>").concat(revenue, "</td><td>").concat(subject, "</td></tr>");
        }
        html += '</tbody></table>';
        host.innerHTML = html;
        dbg('renderRows: rendered rows', rows.length);
    }
    /* ---------------- fetch (with XHR fallback) ---------------- */
    function fetchJson(url) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(typeof fetch === 'function')) return [3 /*break*/, 3];
                        dbg('fetchJson(fetch):', url);
                        return [4 /*yield*/, fetch(url, { method: 'GET', credentials: 'same-origin' })];
                    case 1:
                        resp = _a.sent();
                        dbg('fetchJson(fetch): status', resp.status);
                        return [4 /*yield*/, resp.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        dbg('fetchJson(fetch) error', String((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, new Promise(function (resolve) {
                            try {
                                // eslint-disable-next-line no-undef
                                var xhr_1 = new XMLHttpRequest();
                                xhr_1.open('GET', url, true);
                                xhr_1.onreadystatechange = function () {
                                    if (xhr_1.readyState === 4) {
                                        dbg('fetchJson(XHR): status', xhr_1.status);
                                        if (xhr_1.status >= 200 && xhr_1.status < 300) {
                                            try {
                                                resolve(JSON.parse(xhr_1.responseText || '{}'));
                                            }
                                            catch (e) {
                                                dbg('fetchJson(XHR) parse error', String((e === null || e === void 0 ? void 0 : e.message) || e));
                                                resolve(null);
                                            }
                                        }
                                        else {
                                            resolve(null);
                                        }
                                    }
                                };
                                xhr_1.send();
                            }
                            catch (e) {
                                dbg('fetchJson(XHR) error', String((e === null || e === void 0 ? void 0 : e.message) || e));
                                resolve(null);
                            }
                        })];
                }
            });
        });
    }
    /* ---------------- tab activation + scroll ---------------- */
    function clickFirst(selectors) {
        for (var i = 0; i < selectors.length; i += 1) {
            var el = document.querySelector(selectors[i]);
            if (el) {
                el.click();
                return true;
            }
        }
        return false;
    }
    function activateOpenCasesTabAndScroll() {
        var tabSelectors = [
            "#".concat(OPEN_CASES_TOP_TAB_ID),
            "#".concat(OPEN_CASES_TOP_TAB_ID, "_txt"),
            "[id$=\"".concat(OPEN_CASES_TOP_TAB_ID, "\"]"),
            "[id$=\"".concat(OPEN_CASES_TOP_TAB_ID, "_txt\"]")
        ];
        var subtabSelectors = [
            "#".concat(OPEN_CASES_SUBTAB_ID),
            "#".concat(OPEN_CASES_SUBTAB_ID, "_txt"),
            "[id$=\"".concat(OPEN_CASES_SUBTAB_ID, "\"]"),
            "[id$=\"".concat(OPEN_CASES_SUBTAB_ID, "_txt\"]")
        ];
        var tabClicked = clickFirst(tabSelectors);
        var subtabClicked = clickFirst(subtabSelectors);
        dbg('activateOpenCasesTabAndScroll: clicked', { tabClicked: tabClicked, subtabClicked: subtabClicked });
        setTimeout(function () {
            var host = qsel(LIST_HOST_ID);
            if (host && typeof host.scrollIntoView === 'function') {
                host.scrollIntoView({ behavior: 'smooth', block: 'start' });
                dbg('activateOpenCasesTabAndScroll: scrolled to list');
            }
            else {
                dbg('activateOpenCasesTabAndScroll: host not found for scroll');
            }
        }, 60);
    }
    /* ---------------- notify user (one-time per selection) ---------------- */
    function maybeNotify(customerId, assetIds, rowsCount) {
        return __awaiter(this, void 0, void 0, function () {
            var key, already, Swal, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        dbg('maybeNotify: ENTER', { customerId: customerId, assetIds: assetIds, rowsCount: rowsCount, FORCE_NOTIFY: FORCE_NOTIFY });
                        if (!customerId || assetIds.length === 0 || rowsCount <= 0) {
                            dbg('maybeNotify: prerequisites not met');
                            return [2 /*return*/];
                        }
                        key = "".concat(customerId, "|").concat(assetIds.slice().sort().join(','));
                        already = notifiedKeys.has(key);
                        dbg('maybeNotify: key status', { key: key, already: already });
                        if (!FORCE_NOTIFY && already) {
                            dbg('maybeNotify: suppressed (already notified)');
                            return [2 /*return*/];
                        }
                        if (!already)
                            notifiedKeys.add(key);
                        dbg('maybeNotify: ensuring Swal…');
                        return [4 /*yield*/, swal.ensureSwal()];
                    case 1:
                        _a.sent();
                        Swal = window.Swal;
                        if (!Swal) {
                            dbg('maybeNotify: Swal undefined after ensure');
                            return [2 /*return*/];
                        }
                        dbg('maybeNotify: firing Swal.fire()');
                        return [4 /*yield*/, Swal.fire({
                                icon: 'info',
                                title: 'Related cases found',
                                html: "We found <b>".concat(rowsCount, "</b> related case").concat(rowsCount === 1 ? '' : 's', ".<br><br>Click <b>Show me</b> to jump to the \u201COpen Cases\u201D tab."),
                                confirmButtonText: 'Show me',
                                showCancelButton: true,
                                cancelButtonText: 'Dismiss',
                                focusConfirm: true,
                                allowOutsideClick: true,
                                zIndex: 999999
                            })];
                    case 2:
                        _a.sent();
                        dbg('maybeNotify: user confirmed (or closed) – activating tab/scroll');
                        activateOpenCasesTabAndScroll();
                        dbg('maybeNotify: EXIT');
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        dbg('maybeNotify error', String((e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || e_2));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /* ---------------- main loader ---------------- */
    function refreshList() {
        return __awaiter(this, void 0, void 0, function () {
            var rec, customerId, assetIds, baseUrlFld, baseUrl, host, fullUrl, data, rows, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        dbg('refreshList: ENTER');
                        rec = currentRecord.get();
                        customerId = getCustomerId(rec);
                        assetIds = getMultiIds(rec.getValue({ fieldId: FIELD_ASSETS }))
                            .map(function (v) { return onlyDigits(v); }).filter(function (v) { return v.length > 0; });
                        dbg('refreshList: values', { customerId: customerId, assetIdsCount: assetIds.length });
                        baseUrlFld = document.getElementById(SUITELET_URL_FIELD_ID);
                        baseUrl = baseUrlFld ? baseUrlFld.value : '';
                        dbg('refreshList: baseUrl', baseUrl || '(empty)');
                        host = qsel(LIST_HOST_ID);
                        if (host)
                            host.innerHTML = '<div style="color:#666;">Loading…</div>';
                        if (!baseUrl || !customerId || assetIds.length === 0) {
                            dbg('refreshList: prerequisites not met');
                            renderRows([]);
                            return [2 /*return*/];
                        }
                        fullUrl = buildUrl(baseUrl, customerId, assetIds);
                        dbg('refreshList: fullUrl', fullUrl);
                        return [4 /*yield*/, fetchJson(fullUrl)];
                    case 1:
                        data = _a.sent();
                        if (!data || !data.ok) {
                            dbg('refreshList: bad response', data);
                            renderRows([]);
                            return [2 /*return*/];
                        }
                        rows = Array.isArray(data.rows) ? data.rows : [];
                        dbg('refreshList: rows count', rows.length);
                        renderRows(rows);
                        // Notify (now with FORCE_NOTIFY for testing)
                        return [4 /*yield*/, maybeNotify(customerId, assetIds, rows.length)];
                    case 2:
                        // Notify (now with FORCE_NOTIFY for testing)
                        _a.sent();
                        dbg('refreshList: EXIT');
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        dbg('refreshList: ERROR', String((e_3 === null || e_3 === void 0 ? void 0 : e_3.message) || e_3));
                        renderRows([]);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /* ---------------- initialization ---------------- */
    function initDomListeners() {
        try {
            var custEl = findFieldEl(FIELD_CUSTOMER) || findFieldEl('company');
            if (custEl) {
                custEl.addEventListener('change', function () { dbg('DOM change: customer'); refreshList(); });
                dbg('initDomListeners: bound customer change');
            }
            else {
                dbg('initDomListeners: customer field not found');
            }
            var assetsEl = findFieldEl(FIELD_ASSETS);
            if (assetsEl) {
                assetsEl.addEventListener('change', function () { dbg('DOM change: assets'); refreshList(); });
                dbg('initDomListeners: bound assets change');
            }
            else {
                dbg('initDomListeners: assets field not found');
            }
        }
        catch (e) {
            dbg('initDomListeners error', String((e === null || e === void 0 ? void 0 : e.message) || e));
        }
    }
    // Observe for lazy-loaded container; init once it appears
    (function observeContainer() {
        var existing = qsel(LIST_HOST_ID);
        if (existing) {
            dbg('observer: container already present');
            initDomListeners();
            refreshList();
            return;
        }
        try {
            var obs_1 = new MutationObserver(function () {
                var host = qsel(LIST_HOST_ID);
                if (host) {
                    dbg('observer: container appeared');
                    obs_1.disconnect();
                    initDomListeners();
                    refreshList();
                }
            });
            obs_1.observe(document.documentElement, { childList: true, subtree: true });
            dbg('observer: started');
        }
        catch (e) {
            dbg('observer error', String((e === null || e === void 0 ? void 0 : e.message) || e));
        }
    })();
    /* ---------------- CS entry points ---------------- */
    var pageInit = function (_ctx) {
        dbg('pageInit');
        // Preload SweetAlert so it’s ready for immediate use
        swal.preload();
        // If fields already have values (editing an existing record), load immediately
        refreshList();
    };
    var fieldChanged = function (ctx) {
        dbg('fieldChanged', ctx.fieldId);
        if (ctx.fieldId === FIELD_CUSTOMER || ctx.fieldId === FIELD_ASSETS) {
            refreshList();
        }
    };
    return { pageInit: pageInit, fieldChanged: fieldChanged };
});

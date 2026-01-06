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

import type { EntryPoints } from 'N/types';
import * as currentRecord from 'N/currentRecord';
import * as swal from 'SuiteScripts/HUL_DEV/Global/hul_swal';

const FIELD_ASSETS = 'custevent_nxc_case_assets';
const FIELD_CUSTOMER = 'custevent_nx_customer';
const SUITELET_URL_FIELD_ID = 'custpage_oc_sl_url';

const OPEN_CASES_TOP_TAB_ID = 'custpage_open_cases_tab';
const OPEN_CASES_SUBTAB_ID = 'custpage_open_cases_subtab';
const LIST_HOST_ID = 'openCasesList';

// ===== DEBUG TOGGLE: set to false after we confirm behavior =====
const FORCE_NOTIFY = true;

// One-time notification guard per unique selection (customer|assetIds)
const notifiedKeys = new Set<string>();

function dbg(title: string, details?: unknown) {
    try {
        // eslint-disable-next-line no-console
        console.log('[OpenCases CS]', title, details !== undefined ? details : '');
    } catch { /* no-op */ }
}

dbg('module loaded');

/* ---------------- DOM utils ---------------- */

function qsel(id: string): HTMLElement | null {
    return document.getElementById(id);
}

function findFieldEl(fieldId: string): HTMLInputElement | HTMLSelectElement | null {
    const byId = document.getElementById(fieldId) as any;
    if (byId) return byId;
    const byName = document.querySelector(`[name="${fieldId}"]`) as any;
    if (byName) return byName;
    const byEndsWith = document.querySelector(`input[id$="${fieldId}"], select[id$="${fieldId}"]`) as any;
    return (byEndsWith || null);
}

/* ---------------- data helpers ---------------- */

function getMultiIds(val: unknown): string[] {
    if (!val) return [];
    if (Array.isArray(val)) {
        const first = (val as any[])[0] as any;
        if (first && typeof first === 'object' && 'value' in first) {
            return (val as Array<{ value: string }>).map((v) => String(v.value));
        }
        return (val as Array<string | number>).map((v) => String(v));
    }
    const s = String(val);
    if (!s) return [];
    if (s.indexOf(',') >= 0) return s.split(',').map((x) => x.trim()).filter(Boolean);
    return [s];
}

function onlyDigits(v: unknown): string {
    const s = v === null || v === undefined ? '' : String(v);
    return s.replace(/[^\d]/g, '');
}

function getCustomerId(rec: any): string {
    let id = rec.getValue({ fieldId: FIELD_CUSTOMER });
    if (!id) id = rec.getValue({ fieldId: 'company' }); // fallback when launched from Customer
    return onlyDigits(id);
}

function buildUrl(base: string, customerId: string, assetIds: string[]): string {
    const qs = `customerId=${encodeURIComponent(customerId)}&assetIds=${encodeURIComponent(assetIds.map((a) => onlyDigits(a)).filter((a) => a.length > 0).join(','))}`;
    if (!base) return '';
    return base.indexOf('?') >= 0 ? (`${base}&${qs}`) : (`${base}?${qs}`);
}

function escapeHtml(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ---------------- rendering ---------------- */

function renderRows(rows: Array<any>) {
    const host = qsel(LIST_HOST_ID);
    if (!host) { dbg('renderRows: host not found'); return; }

    if (!rows || rows.length === 0) {
        host.innerHTML = '<div id="openCasesListEmpty" style="color:#666;">No related cases.</div>';
        dbg('renderRows: 0 rows');
        return;
    }

    let html = '<table id="openCasesTable"><thead><tr>';
    html += '<th>Open</th><th>Case ID</th><th>Case #</th><th>Start Date</th><th>Customer (ID)</th><th>Assigned To</th><th>Revenue Stream</th><th>Subject</th>';
    html += '</tr></thead><tbody>';

    for (let i = 0; i < rows.length; i += 1) {
        const r = rows[i] || {};
        const openUrl = String(r.open_url || '');
        const caseId = escapeHtml(String(r.case_id || ''));
        const caseNo = escapeHtml(String(r.case_number || ''));
        const start = escapeHtml(String(r.case_start_date || ''));
        const cust = escapeHtml(String(r.custevent_nx_customer || ''));
        const assigned = escapeHtml(String(r.case_assigned_to || ''));
        const revenue = escapeHtml(String(r.revenue_stream || ''));
        const subject = escapeHtml(String(r.subject || ''));
        const link = openUrl ? `<a href="${openUrl}" target="_blank" rel="noopener">Open</a>` : '';
        html += `<tr><td>${link}</td><td>${caseId}</td><td>${caseNo}</td><td>${start}</td><td>${cust}</td><td>${assigned}</td><td>${revenue}</td><td>${subject}</td></tr>`;
    }

    html += '</tbody></table>';
    host.innerHTML = html;
    dbg('renderRows: rendered rows', rows.length);
}

/* ---------------- fetch (with XHR fallback) ---------------- */

async function fetchJson(url: string): Promise<any | null> {
    try {
        if (typeof fetch === 'function') {
            dbg('fetchJson(fetch):', url);
            const resp = await fetch(url, { method: 'GET', credentials: 'same-origin' });
            dbg('fetchJson(fetch): status', resp.status);
            return await resp.json();
        }
    } catch (e) {
        dbg('fetchJson(fetch) error', String((e as Error)?.message || e));
    }

    return new Promise((resolve) => {
        try {
            // eslint-disable-next-line no-undef
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    dbg('fetchJson(XHR): status', xhr.status);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try { resolve(JSON.parse(xhr.responseText || '{}')); } catch (e) { dbg('fetchJson(XHR) parse error', String((e as Error)?.message || e)); resolve(null); }
                    } else {
                        resolve(null);
                    }
                }
            };
            xhr.send();
        } catch (e) {
            dbg('fetchJson(XHR) error', String((e as Error)?.message || e));
            resolve(null);
        }
    });
}

/* ---------------- tab activation + scroll ---------------- */

function clickFirst(selectors: string[]): boolean {
    for (let i = 0; i < selectors.length; i += 1) {
        const el = document.querySelector(selectors[i]) as HTMLElement | null;
        if (el) { el.click(); return true; }
    }
    return false;
}

function activateOpenCasesTabAndScroll() {
    const tabSelectors = [
        `#${OPEN_CASES_TOP_TAB_ID}`,
        `#${OPEN_CASES_TOP_TAB_ID}_txt`,
        `[id$="${OPEN_CASES_TOP_TAB_ID}"]`,
        `[id$="${OPEN_CASES_TOP_TAB_ID}_txt"]`
    ];
    const subtabSelectors = [
        `#${OPEN_CASES_SUBTAB_ID}`,
        `#${OPEN_CASES_SUBTAB_ID}_txt`,
        `[id$="${OPEN_CASES_SUBTAB_ID}"]`,
        `[id$="${OPEN_CASES_SUBTAB_ID}_txt"]`
    ];

    const tabClicked = clickFirst(tabSelectors);
    const subtabClicked = clickFirst(subtabSelectors);
    dbg('activateOpenCasesTabAndScroll: clicked', { tabClicked, subtabClicked });

    setTimeout(() => {
        const host = qsel(LIST_HOST_ID);
        if (host && typeof host.scrollIntoView === 'function') {
            host.scrollIntoView({ behavior: 'smooth', block: 'start' });
            dbg('activateOpenCasesTabAndScroll: scrolled to list');
        } else {
            dbg('activateOpenCasesTabAndScroll: host not found for scroll');
        }
    }, 60);
}

/* ---------------- notify user (one-time per selection) ---------------- */

async function maybeNotify(customerId: string, assetIds: string[], rowsCount: number) {
    try {
        dbg('maybeNotify: ENTER', { customerId, assetIds, rowsCount, FORCE_NOTIFY });

        if (!customerId || assetIds.length === 0 || rowsCount <= 0) {
            dbg('maybeNotify: prerequisites not met');
            return;
        }

        const key = `${customerId}|${assetIds.slice().sort().join(',')}`;
        const already = notifiedKeys.has(key);
        dbg('maybeNotify: key status', { key, already });

        if (!FORCE_NOTIFY && already) {
            dbg('maybeNotify: suppressed (already notified)');
            return;
        }

        if (!already) notifiedKeys.add(key);

        dbg('maybeNotify: ensuring Swal…');
        await swal.ensureSwal();
        const Swal = (window as any).Swal;
        if (!Swal) { dbg('maybeNotify: Swal undefined after ensure'); return; }

        dbg('maybeNotify: firing Swal.fire()');
        await Swal.fire({
            icon: 'info',
            title: 'Related cases found',
            html: `We found <b>${rowsCount}</b> related case${rowsCount === 1 ? '' : 's'}.<br><br>Click <b>Show me</b> to jump to the “Open Cases” tab.`,
            confirmButtonText: 'Show me',
            showCancelButton: true,
            cancelButtonText: 'Dismiss',
            focusConfirm: true,
            allowOutsideClick: true,
            zIndex: 999999
        });

        dbg('maybeNotify: user confirmed (or closed) – activating tab/scroll');
        activateOpenCasesTabAndScroll();
        dbg('maybeNotify: EXIT');
    } catch (e) {
        dbg('maybeNotify error', String((e as Error)?.message || e));
    }
}

/* ---------------- main loader ---------------- */

async function refreshList() {
    try {
        dbg('refreshList: ENTER');
        const rec = currentRecord.get();
        const customerId = getCustomerId(rec);
        const assetIds = getMultiIds(rec.getValue({ fieldId: FIELD_ASSETS }))
            .map((v) => onlyDigits(v)).filter((v) => v.length > 0);

        dbg('refreshList: values', { customerId, assetIdsCount: assetIds.length });

        const baseUrlFld = document.getElementById(SUITELET_URL_FIELD_ID) as HTMLInputElement | null;
        const baseUrl = baseUrlFld ? baseUrlFld.value : '';
        dbg('refreshList: baseUrl', baseUrl || '(empty)');

        const host = qsel(LIST_HOST_ID);
        if (host) host.innerHTML = '<div style="color:#666;">Loading…</div>';

        if (!baseUrl || !customerId || assetIds.length === 0) {
            dbg('refreshList: prerequisites not met');
            renderRows([]);
            return;
        }

        const fullUrl = buildUrl(baseUrl, customerId, assetIds);
        dbg('refreshList: fullUrl', fullUrl);

        const data = await fetchJson(fullUrl);
        if (!data || !data.ok) {
            dbg('refreshList: bad response', data);
            renderRows([]);
            return;
        }

        const rows = Array.isArray(data.rows) ? data.rows : [];
        dbg('refreshList: rows count', rows.length);
        renderRows(rows);

        // Notify (now with FORCE_NOTIFY for testing)
        await maybeNotify(customerId, assetIds, rows.length);

        dbg('refreshList: EXIT');
    } catch (e) {
        dbg('refreshList: ERROR', String((e as Error)?.message || e));
        renderRows([]);
    }
}

/* ---------------- initialization ---------------- */

function initDomListeners() {
    try {
        const custEl = findFieldEl(FIELD_CUSTOMER) || findFieldEl('company');
        if (custEl) {
            custEl.addEventListener('change', () => { dbg('DOM change: customer'); refreshList(); });
            dbg('initDomListeners: bound customer change');
        } else {
            dbg('initDomListeners: customer field not found');
        }

        const assetsEl = findFieldEl(FIELD_ASSETS);
        if (assetsEl) {
            assetsEl.addEventListener('change', () => { dbg('DOM change: assets'); refreshList(); });
            dbg('initDomListeners: bound assets change');
        } else {
            dbg('initDomListeners: assets field not found');
        }
    } catch (e) {
        dbg('initDomListeners error', String((e as Error)?.message || e));
    }
}

// Observe for lazy-loaded container; init once it appears
(function observeContainer() {
    const existing = qsel(LIST_HOST_ID);
    if (existing) {
        dbg('observer: container already present');
        initDomListeners();
        refreshList();
        return;
    }
    try {
        const obs = new MutationObserver(() => {
            const host = qsel(LIST_HOST_ID);
            if (host) {
                dbg('observer: container appeared');
                obs.disconnect();
                initDomListeners();
                refreshList();
            }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
        dbg('observer: started');
    } catch (e) {
        dbg('observer error', String((e as Error)?.message || e));
    }
})();

/* ---------------- CS entry points ---------------- */

const pageInit: EntryPoints.Client.pageInit = (_ctx) => {
    dbg('pageInit');
    // Preload SweetAlert so it’s ready for immediate use
    swal.preload();
    // If fields already have values (editing an existing record), load immediately
    refreshList();
};

const fieldChanged: EntryPoints.Client.fieldChanged = (ctx) => {
    dbg('fieldChanged', ctx.fieldId);
    if (ctx.fieldId === FIELD_CUSTOMER || ctx.fieldId === FIELD_ASSETS) {
        refreshList();
    }
};

export = { pageInit, fieldChanged };

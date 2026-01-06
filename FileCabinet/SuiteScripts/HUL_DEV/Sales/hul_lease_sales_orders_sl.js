/* eslint-disable max-len */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * Title: Lease Sales Orders Summary (Material-esque UI + static progress + filters)
 * Version: 3.1.3
 * Date: 2025-11-13
 */
define(["require", "exports", "N/ui/serverWidget", "N/http", "N/task", "N/search", "N/file", "N/record", "N/log", "N/url", "N/runtime"], function (require, exports, serverWidget, http, task, search, file, record, log, url, runtime) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    /* ------------------------------- CONSTANTS ------------------------------- */
    const MR_SCRIPT_ID = 'customscript_hul_lease_so_mr';
    const MR_DEPLOY_ID = 'customdeploy_hul_lease_so_mr';
    const OUTPUT_FOLDER_ID = 5940799;
    const FILE_PREFIX = 'hul_lease_so_dataset_';
    const SCRIPT_PARAM_FILEID = 'custscript_hul_dataset_fileid';
    const SCRIPT_PARAM_LAST_REBUILD = 'custscript_hul_last_rebuild_iso';
    const POLL_INTERVAL_MS = 10000;
    const CS_FILE_ID = 8441113;
    /* ---------------------------- TABLE PRESENTATION ---------------------------- */
    const COLUMN_ORDER = [
        'tranid',
        'trandate',
        'customer',
        'location',
        'total',
        'firstBillDate',
        'lastBillDate',
        'memo',
        'custbody1',
        'id'
    ];
    const HEADER_LABELS = {
        id: 'Internal ID',
        tranid: 'Order #',
        trandate: 'Transaction Date',
        customer: 'Customer',
        memo: 'Memo',
        custbody1: 'Finance Terms',
        total: 'Order Total',
        location: 'Location',
        firstBillDate: 'Lease Start Date',
        lastBillDate: 'Lease End Date'
    };
    /* --------------------------------- UTILS --------------------------------- */
    function audit(title, details) {
        try {
            log.audit(title, details);
        }
        catch {
            /* no-op */
        }
    }
    function errorLog(title, details) {
        try {
            log.error(title, details);
        }
        catch {
            /* no-op */
        }
    }
    function toIntSafe(v) {
        try {
            const s = String(v ?? '').trim();
            const n = parseInt(s, 10);
            return Number.isFinite(n) ? n : NaN;
        }
        catch {
            return NaN;
        }
    }
    function escapeHtml(v) {
        try {
            return String(v ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
        catch {
            return '';
        }
    }
    function toIso(s) {
        try {
            const d = new Date(s);
            return isNaN(d.getTime()) ? String(s) : d.toISOString();
        }
        catch {
            return String(s);
        }
    }
    function formatUtcIsoToMMDDYYYY(iso) {
        try {
            if (!iso)
                return '';
            const d = new Date(iso);
            if (isNaN(d.getTime()))
                return '';
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(d.getUTCDate()).padStart(2, '0');
            const yyyy = d.getUTCFullYear();
            return `${mm}/${dd}/${yyyy}`;
        }
        catch {
            return '';
        }
    }
    function formatCurrency(v) {
        const n = Number(v);
        if (!isFinite(n))
            return '';
        const abs = Math.abs(n);
        const hasCents = Math.round(abs * 100) % 100 !== 0;
        const opts = {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0
        };
        const body = abs.toLocaleString('en-US', opts);
        return n < 0 ? `-$${body}` : `$${body}`;
    }
    function formatDateMMDDYYYY(v) {
        try {
            if (!v)
                return '';
            let d;
            const s = String(v);
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
            if (m) {
                d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
            }
            else {
                d = new Date(s);
            }
            if (isNaN(d.getTime()))
                return '';
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(d.getUTCDate()).padStart(2, '0');
            const yyyy = d.getUTCFullYear();
            return `${mm}/${dd}/${yyyy}`;
        }
        catch {
            return '';
        }
    }
    function csvCell(v) {
        try {
            const s = String(v ?? '');
            const needs = /[",\n]/.test(s);
            const esc = s.replace(/"/g, '""');
            return needs ? `"${esc}"` : esc;
        }
        catch {
            return '';
        }
    }
    /* ---------------------------- FILTER HELPERS ---------------------------- */
    function readFiltersFromParams(p) {
        const get = (id) => {
            const raw = p[id];
            return raw == null ? '' : String(raw).trim();
        };
        const f = {
            tranid: get('custpage_f_tranid'),
            trandateFrom: get('custpage_f_trandate_from'),
            trandateTo: get('custpage_f_trandate_to'),
            customer: get('custpage_f_customer'),
            location: get('custpage_f_location')
        };
        if (!f.tranid)
            delete f.tranid;
        if (!f.trandateFrom)
            delete f.trandateFrom;
        if (!f.trandateTo)
            delete f.trandateTo;
        if (!f.customer)
            delete f.customer;
        if (!f.location)
            delete f.location;
        audit('Filters:read', f);
        return f;
    }
    function containsInsensitive(hay, needle) {
        if (!needle)
            return true;
        const n = needle.trim().toLowerCase();
        if (!n)
            return true;
        const h = String(hay ?? '').toLowerCase();
        return h.indexOf(n) !== -1;
    }
    function parseDateLoose(v) {
        if (v == null)
            return NaN;
        const d = new Date(String(v));
        return isNaN(d.getTime()) ? NaN : d.getTime();
    }
    function applyFilters(rows, filters) {
        try {
            if (!rows || rows.length === 0)
                return rows || [];
            const hasDateRange = Boolean(filters.trandateFrom && filters.trandateFrom.trim()) ||
                Boolean(filters.trandateTo && filters.trandateTo.trim());
            const fromMs = filters.trandateFrom ? parseDateLoose(filters.trandateFrom) : NaN;
            const toMs = filters.trandateTo ? parseDateLoose(filters.trandateTo) : NaN;
            const filtered = rows.filter((row) => {
                if (filters.tranid && !containsInsensitive(row.tranid, filters.tranid)) {
                    return false;
                }
                if (filters.customer && !containsInsensitive(row.customer, filters.customer)) {
                    return false;
                }
                if (filters.location && !containsInsensitive(row.location, filters.location)) {
                    return false;
                }
                if (hasDateRange) {
                    const rowMs = parseDateLoose(row.trandate);
                    if (!isNaN(rowMs)) {
                        if (!isNaN(fromMs) && rowMs < fromMs)
                            return false;
                        if (!isNaN(toMs) && rowMs > toMs)
                            return false;
                    }
                }
                return true;
            });
            audit('Filters:apply', { before: rows.length, after: filtered.length });
            return filtered;
        }
        catch (e) {
            errorLog('Filters:apply:error', e?.message ?? String(e));
            return rows || [];
        }
    }
    /* ---------------------------- ENTRY POINT ---------------------------- */
    function onRequest(ctx) {
        try {
            const p = ctx.request.parameters || {};
            const action = String(p.action || '').toLowerCase();
            const urlFileId = toIntSafe(p.fileid);
            const defaultFileId = readParamFileId();
            const effectiveFileId = Number.isFinite(urlFileId) ? urlFileId : defaultFileId;
            const filters = readFiltersFromParams(p);
            audit('SL:start', { action, urlFileId, defaultFileId, effectiveFileId });
            if (action === 'csv') {
                writeCsv(ctx, effectiveFileId, filters);
                return;
            }
            if (action === 'rebuild') {
                const runToken = p.runtoken ? String(p.runtoken) : String(Date.now());
                handleRebuildRequest(ctx, effectiveFileId, runToken);
                return;
            }
            if (action === 'poll') {
                const oldFileId = toIntSafe(p.oldfileid);
                handlePoll(ctx, oldFileId);
                return;
            }
            renderMainPage(ctx, effectiveFileId, filters);
        }
        catch (e) {
            errorLog('SL:error', e?.message ?? String(e));
            ctx.response.write(`Unexpected error: ${e?.message ?? String(e)}`);
        }
    }
    exports.onRequest = onRequest;
    /* --------------------------- ACTION HANDLERS --------------------------- */
    function handleRebuildRequest(ctx, oldFileId, runToken) {
        try {
            const t = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: MR_SCRIPT_ID,
                deploymentId: MR_DEPLOY_ID,
                params: { custscript_hul_run_token: runToken }
            });
            const jobId = t.submit();
            audit('MR:submitted', { jobId, runToken, oldFileId });
            const cur = runtime.getCurrentScript();
            const pollUrl = url.resolveScript({
                scriptId: String(cur.id),
                deploymentId: String(cur.deploymentId),
                params: {
                    action: 'poll',
                    jobid: jobId,
                    oldfileid: Number.isFinite(oldFileId) ? String(oldFileId) : '',
                    runtoken: runToken,
                    ts: String(Date.now())
                }
            });
            const html = `
            <div style="font:13px/1.4 Arial;margin:12px;">
                <div><b>Rebuilding dataset…</b></div>
                <div>Task ID: ${jobId}</div>
                <div>Token: ${runToken}</div>
                <div style="margin-top:8px;">Redirecting to status…</div>
                <script>
                    setTimeout(function () { location.href = '${pollUrl}'; }, ${POLL_INTERVAL_MS});
                </script>
            </div>
        `;
            ctx.response.write(html);
        }
        catch (e) {
            errorLog('MR:start:error', e?.message ?? String(e));
            ctx.response.write(`Error starting rebuild: ${e?.message ?? String(e)}`);
        }
    }
    function handlePoll(ctx, oldFileIdParam) {
        try {
            const jobId = String(ctx.request.parameters.jobid || '');
            if (!jobId)
                throw new Error('Missing jobid parameter');
            const st = task.checkStatus({ taskId: jobId });
            const stage = String(st?.stage || '');
            const statusText = String(st.status);
            const pctRaw = st?.percentage ??
                st?.percentageCompleted ??
                st?.percentCompleted;
            const pctFromNs = Number(pctRaw);
            const hasPct = Number.isFinite(pctFromNs) && pctFromNs >= 0 && pctFromNs <= 100;
            const pct = hasPct ? Math.round(pctFromNs) : stageToPercent(stage);
            audit('MR:poll', { jobId, status: st.status, stage, pct: hasPct ? pctFromNs : `derived=${pct}` });
            if (st.status !== task.TaskStatus.COMPLETE) {
                try {
                    ctx.response.addHeader({ name: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' });
                    ctx.response.addHeader({ name: 'Pragma', value: 'no-cache' });
                }
                catch {
                    /* ignore header issues */
                }
                const form = serverWidget.createForm({ title: 'Rebuilding Dataset…' });
                injectThemeAndToolbarJs(form);
                const fld = form.addField({
                    id: 'custpage_progress',
                    label: 'Progress',
                    type: serverWidget.FieldType.INLINEHTML
                });
                fld.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE });
                const pctLabel = Number.isFinite(pct) ? `${pct}%` : '—';
                const stageLabel = stage ? ` — ${escapeHtml(stage)}` : '';
                fld.defaultValue = `
                <div class="hul-lease-ui">
                    <div class="hul-card">
                        <div class="hul-card-title">Rebuilding Dataset</div>
                        <div class="hul-card-subtle">Task ID</div>
                        <div class="hul-card-metric" style="font-size:16px;">${escapeHtml(jobId)}</div>

                        <div class="hul-space-b"></div>
                        <div class="hul-card-subtle">Status</div>
                        <div style="font-weight:600;margin-bottom:8px;">${escapeHtml(statusText)}${stageLabel}</div>

                        <div class="hul-progress">
                            <div class="hul-progress-bar" style="width:${Number.isFinite(pct) ? pct : 0}%"></div>
                        </div>
                        <div class="hul-progress-caption">${escapeHtml(pctLabel)}</div>

                        <div style="color:#6b7280;margin-top:10px;">
                            This page refreshes every ${(POLL_INTERVAL_MS / 1000)} seconds.
                        </div>
                    </div>
                </div>
                <script>
                    setTimeout(function () {
                        location.href = location.href.replace(/([?&])ts=\\d+/, '$1ts=' + Date.now());
                    }, ${POLL_INTERVAL_MS});
                </script>
            `;
                ctx.response.writePage(form);
                return;
            }
            // 1) Delete old file (best-effort)
            try {
                const canDelete = Number.isFinite(oldFileIdParam) && Boolean(oldFileIdParam);
                audit('File:delete:attempt', { oldFileIdParam, valid: canDelete });
                if (canDelete) {
                    file.delete({ id: oldFileIdParam });
                    audit('File:deleted:old', { oldFileIdParam });
                }
                else {
                    audit('File:delete:skip', { reason: 'no-old-id' });
                }
            }
            catch (delErr) {
                errorLog('File:delete:error', {
                    idTried: oldFileIdParam,
                    error: delErr?.message ?? String(delErr)
                });
            }
            // 2) Find newest dataset JSON by internalid DESC
            let newFileId = null;
            let newestModifiedIso = null;
            try {
                const res = search.create({
                    type: 'file',
                    filters: [
                        ['folder', 'anyof', String(OUTPUT_FOLDER_ID)],
                        'AND',
                        ['name', 'startswith', FILE_PREFIX]
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid', sort: search.Sort.DESC }),
                        'name',
                        search.createColumn({ name: 'modified' })
                    ]
                })
                    .run()
                    .getRange({ start: 0, end: 1 });
                if (res && res[0]) {
                    newFileId = Number(res[0].getValue({ name: 'internalid' }));
                    const modified = String(res[0].getValue({ name: 'modified' }) || '');
                    newestModifiedIso = modified ? toIso(modified) : new Date().toISOString();
                    audit('File:newest', { newFileId, newestModifiedIso });
                }
                else {
                    audit('File:newest:none', { folder: OUTPUT_FOLDER_ID, prefix: FILE_PREFIX });
                }
            }
            catch (findErr) {
                errorLog('File:newest:error', findErr?.message ?? String(findErr));
            }
            // 3) Update deployment params and redirect back with new file
            if (Number.isFinite(newFileId) && newFileId > 0) {
                const dInfo = getDeploymentInfo();
                audit('Deploy:info', dInfo);
                if (dInfo.internalId) {
                    try {
                        record.submitFields({
                            type: 'scriptdeployment',
                            id: dInfo.internalId,
                            values: { [SCRIPT_PARAM_FILEID]: String(newFileId) }
                        });
                        audit('DeploymentParam:update:ok', {
                            deployInternalId: dInfo.internalId,
                            field: SCRIPT_PARAM_FILEID,
                            newFileId
                        });
                    }
                    catch (e) {
                        errorLog('DeploymentParam:update:error', e?.message ?? String(e));
                    }
                    try {
                        const iso = newestModifiedIso || new Date().toISOString();
                        record.submitFields({
                            type: 'scriptdeployment',
                            id: dInfo.internalId,
                            values: { [SCRIPT_PARAM_LAST_REBUILD]: String(iso) }
                        });
                        const dRec = record.load({ type: 'scriptdeployment', id: dInfo.internalId });
                        const readBack = String(dRec.getValue({ fieldId: SCRIPT_PARAM_LAST_REBUILD }) || '').trim();
                        audit('LastRebuild:update:ok', {
                            deployInternalId: dInfo.internalId,
                            field: SCRIPT_PARAM_LAST_REBUILD,
                            isoUtc: iso
                        });
                        audit('LastRebuild:update:verify', {
                            deploymentInternalId: dInfo.internalId,
                            wrote: iso,
                            readBack
                        });
                    }
                    catch (e) {
                        errorLog('LastRebuild:update:error', e?.message ?? String(e));
                    }
                }
                else {
                    errorLog('Deploy:resolve:error', 'Could not resolve deployment internalId; parameters not updated.');
                }
            }
            else {
                audit('Deploy:param:update:skip', { reason: 'no-new-file-id' });
            }
            const cur = runtime.getCurrentScript();
            const redirectOpts = {
                type: http.RedirectType.SUITELET,
                identifier: String(cur.id),
                id: String(cur.deploymentId),
                parameters: {
                    fileid: newFileId ? String(newFileId) : '',
                    action: ''
                }
            };
            audit('SL:redirect', redirectOpts.parameters);
            ctx.response.sendRedirect(redirectOpts);
        }
        catch (e) {
            errorLog('Poll:error', e?.message ?? String(e));
            ctx.response.write(`Polling error: ${e?.message ?? String(e)}`);
        }
    }
    /* ---------------------------------- UI ---------------------------------- */
    function renderMainPage(ctx, fileIdParam, filters) {
        try {
            const form = serverWidget.createForm({ title: 'Lease Sales Orders Summary' });
            // Hard-wire the client script
            form.clientScriptFileId = CS_FILE_ID;
            // Theme + toolbar JS
            injectThemeAndToolbarJs(form);
            // Last rebuild banner + toolbar
            const lastIso = readLastRebuildFromDeployment();
            const lastDisplay = formatUtcIsoToMMDDYYYY(lastIso);
            const banner = form.addField({
                id: 'custpage_last_rebuild',
                label: 'Last Rebuild',
                type: serverWidget.FieldType.INLINEHTML
            });
            banner.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE });
            banner.defaultValue = `
            <div class="hul-lease-ui">
                <div class="hul-card hul-space-b">
                    <div class="hul-card-title">Dataset Status</div>
                    <div class="hul-card-subtle">Last dataset rebuild</div>
                    <div class="hul-card-metric">${escapeHtml(lastDisplay || '—')}</div>
                </div>
                ${renderToolbarHtml()}
            </div>
        `;
            // Filter group + fields
            const filterGroupId = 'custpage_fg_filters';
            form.addFieldGroup({
                id: filterGroupId,
                label: 'Filters'
            });
            const fldOrder = form.addField({
                id: 'custpage_f_tranid',
                label: 'Order # (contains)',
                type: serverWidget.FieldType.TEXT,
                container: filterGroupId
            });
            fldOrder.defaultValue = filters.tranid || '';
            fldOrder.updateDisplaySize({
                width: 40,
                height: 1
            });
            const fldDateFrom = form.addField({
                id: 'custpage_f_trandate_from',
                label: 'Transaction Date From',
                type: serverWidget.FieldType.DATE,
                container: filterGroupId
            });
            fldDateFrom.defaultValue = filters.trandateFrom || '';
            fldDateFrom.updateDisplaySize({
                width: 40,
                height: 1
            });
            const fldDateTo = form.addField({
                id: 'custpage_f_trandate_to',
                label: 'Transaction Date To',
                type: serverWidget.FieldType.DATE,
                container: filterGroupId
            });
            fldDateTo.defaultValue = filters.trandateTo || '';
            fldDateTo.updateDisplaySize({
                width: 40,
                height: 1
            });
            const fldCustomer = form.addField({
                id: 'custpage_f_customer',
                label: 'Customer (contains)',
                type: serverWidget.FieldType.TEXT,
                container: filterGroupId
            });
            fldCustomer.defaultValue = filters.customer || '';
            fldCustomer.updateDisplaySize({
                width: 40,
                height: 1
            });
            const fldLocation = form.addField({
                id: 'custpage_f_location',
                label: 'Location (contains)',
                type: serverWidget.FieldType.TEXT,
                container: filterGroupId
            });
            fldLocation.defaultValue = filters.location || '';
            fldLocation.updateDisplaySize({
                width: 40,
                height: 1
            });
            // Hidden URLs for client-side toolbar buttons
            const cur = runtime.getCurrentScript();
            const runToken = String(Date.now());
            const rebuildUrl = url.resolveScript({
                scriptId: String(cur.id),
                deploymentId: String(cur.deploymentId),
                params: {
                    action: 'rebuild',
                    oldfileid: Number.isFinite(fileIdParam) ? String(fileIdParam) : '',
                    runtoken: runToken,
                    ts: String(Date.now())
                }
            });
            const csvParams = {
                action: 'csv',
                fileid: Number.isFinite(fileIdParam) ? String(fileIdParam) : ''
            };
            if (filters.tranid)
                csvParams.custpage_f_tranid = filters.tranid;
            if (filters.trandateFrom)
                csvParams.custpage_f_trandate_from = filters.trandateFrom;
            if (filters.trandateTo)
                csvParams.custpage_f_trandate_to = filters.trandateTo;
            if (filters.customer)
                csvParams.custpage_f_customer = filters.customer;
            if (filters.location)
                csvParams.custpage_f_location = filters.location;
            const csvUrl = url.resolveScript({
                scriptId: String(cur.id),
                deploymentId: String(cur.deploymentId),
                params: csvParams
            });
            // Clear Filters URL: same Suitelet, same file, no filter/action params
            const clearUrl = url.resolveScript({
                scriptId: String(cur.id),
                deploymentId: String(cur.deploymentId),
                params: {
                    fileid: Number.isFinite(fileIdParam) ? String(fileIdParam) : ''
                }
            });
            const fldRebuild = form.addField({
                id: 'custpage_rebuild_url',
                label: 'Rebuild URL',
                type: serverWidget.FieldType.LONGTEXT
            });
            fldRebuild.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            fldRebuild.defaultValue = rebuildUrl;
            const fldCsv = form.addField({
                id: 'custpage_csv_url',
                label: 'CSV URL',
                type: serverWidget.FieldType.LONGTEXT
            });
            fldCsv.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            fldCsv.defaultValue = csvUrl;
            const fldClear = form.addField({
                id: 'custpage_clear_url',
                label: 'Clear URL',
                type: serverWidget.FieldType.LONGTEXT
            });
            fldClear.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            fldClear.defaultValue = clearUrl;
            // Results
            const htmlFld = form.addField({
                id: 'custpage_data',
                label: 'Dataset',
                type: serverWidget.FieldType.INLINEHTML
            });
            if (Number.isFinite(fileIdParam)) {
                try {
                    const f = file.load({ id: fileIdParam });
                    const text = f.getContents() || '[]';
                    const data = JSON.parse(text);
                    const filtered = applyFilters(data, filters);
                    htmlFld.defaultValue = `
                    <div class="hul-lease-ui">
                        <div class="hul-card">
                            <div class="hul-card-title hul-space-b">
                                Results (${filtered.length} row${filtered.length === 1 ? '' : 's'})
                            </div>
                            ${renderHtmlTable(filtered)}
                        </div>
                    </div>
                `;
                }
                catch (e) {
                    errorLog('Render:load:error', e?.message ?? String(e));
                    htmlFld.defaultValue = `
                    <div class="hul-lease-ui">
                        <div class="hul-card hul-error">
                            Failed to load dataset file ${escapeHtml(String(fileIdParam))}.
                        </div>
                    </div>
                `;
                }
            }
            else {
                htmlFld.defaultValue = `
                <div class="hul-lease-ui">
                    <div class="hul-card hul-empty">No dataset selected.</div>
                </div>
            `;
            }
            ctx.response.writePage(form);
        }
        catch (e) {
            errorLog('Render:error', e?.message ?? String(e));
            ctx.response.write(`Render error: ${e?.message ?? String(e)}`);
        }
    }
    /* -------------------------- CSV + TABLE RENDER -------------------------- */
    function writeCsv(ctx, fileIdParam, filters) {
        try {
            if (!Number.isFinite(fileIdParam)) {
                throw new Error('No dataset file selected.');
            }
            const f = file.load({ id: fileIdParam });
            const text = f.getContents() || '[]';
            const data = JSON.parse(text);
            const filtered = applyFilters(data, filters);
            if (!Array.isArray(filtered) || filtered.length === 0) {
                ctx.response.addHeader({ name: 'Content-Type', value: 'text/plain; charset=utf-8' });
                ctx.response.write('No rows to export.');
                return;
            }
            const headers = COLUMN_ORDER.filter((k) => k in (filtered[0] || {}));
            const headerLine = headers.map((h) => csvCell(HEADER_LABELS[h] || h)).join(',');
            const lines = [headerLine];
            for (const row of filtered) {
                const vals = headers.map((h) => csvCell(formatCell(h, row[h])));
                lines.push(vals.join(','));
            }
            const body = lines.join('\n');
            ctx.response.addHeader({ name: 'Content-Type', value: 'text/csv; charset=utf-8' });
            ctx.response.addHeader({
                name: 'Content-Disposition',
                value: 'attachment; filename="lease_so_filtered.csv"'
            });
            ctx.response.write(body);
        }
        catch (e) {
            errorLog('CSV:error', e?.message ?? String(e));
            ctx.response.addHeader({ name: 'Content-Type', value: 'text/plain; charset=utf-8' });
            ctx.response.write(`CSV error: ${e?.message ?? String(e)}`);
        }
    }
    function renderHtmlTable(data) {
        try {
            if (!data || data.length === 0) {
                return '<div class="hul-card hul-empty">No records found.</div>';
            }
            const headers = COLUMN_ORDER.filter((k) => k in (data[0] || {}));
            const thead = `
            <tr>
                ${headers.map((h) => `<th>${escapeHtml(HEADER_LABELS[h] || h)}</th>`).join('')}
            </tr>
        `;
            const rows = data
                .map((row) => {
                const cells = headers
                    .map((h) => {
                    const raw = row[h];
                    const val = formatCell(h, raw);
                    const tdClass = h === 'total' ? ' class="hul-td-right"' : '';
                    // Make the Order # column clickable
                    if (h === 'tranid') {
                        // Prefer the explicit id field; fall back to whatever is in this cell
                        const soIdRaw = row.id != null ? row.id : raw;
                        const safeId = escapeHtml(String(soIdRaw ?? ''));
                        const safeText = escapeHtml(val);
                        // If we have *anything* that looks like an id, build the link
                        if (safeId) {
                            const linkHtml = `<a href="/app/accounting/transactions/salesord.nl?id=${safeId}" target="_blank">${safeText}</a>`;
                            return `<td${tdClass}>${linkHtml}</td>`;
                        }
                        // Fallback: just render the text
                        return `<td${tdClass}>${safeText}</td>`;
                    }
                    return `<td${tdClass}>${escapeHtml(val)}</td>`;
                })
                    .join('');
                return `<tr>${cells}</tr>`;
            })
                .join('');
            return `
            <div class="hul-table-wrap">
                <table class="hul-table">
                    <thead>${thead}</thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
        }
        catch (e) {
            errorLog('Render:table:error', e?.message ?? String(e));
            return '<div class="hul-card hul-error">Failed to render table.</div>';
        }
    }
    function formatCell(key, value) {
        try {
            if (value == null)
                return '';
            switch (key) {
                case 'total':
                    return formatCurrency(value);
                case 'trandate':
                case 'firstBillDate':
                case 'lastBillDate':
                    return formatDateMMDDYYYY(value);
                default:
                    return String(value);
            }
        }
        catch {
            return String(value ?? '');
        }
    }
    /* --------------------------- THEME / TOOLBAR JS --------------------------- */
    function injectThemeAndToolbarJs(form) {
        try {
            const cssAndJs = `
<style>
/* ---------- Global layout / title ---------- */
.uir-page-title,
.uir-page-title h1,
.page-title,
.page-title * {
    font-family: ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial !important;
    font-size: 24px !important;
    font-weight: 700 !important;
    color: #111827 !important;
}

/* Make NetSuite's main content cells span full width */
.uir-table-fields-wrapper {
    width: 100% !important;
}
.uir-table-fields-wrapper .table_fields {
    width: 100% !important;
}

/* ---------- Core HUL card + table theme ---------- */
.hul-lease-ui{
    font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;
    color:#1f2937;
    width:100%;
    max-width:none;
}
.hul-space-b{margin-bottom:10px}
.hul-card{
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:14px;
    padding:16px 18px;
    box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px -12px rgba(0,0,0,.12);
    width:100%;
    box-sizing:border-box;
}
.hul-card-title{font-size:16px;font-weight:600;color:#111827}
.hul-card-subtle{font-size:12px;color:#6b7280;margin-top:2px}
.hul-card-metric{font-size:22px;font-weight:700;color:#111827;margin-top:6px;letter-spacing:.2px}
.hul-card.hul-error{color:#991b1b;background:#fff1f2;border-color:#fecaca}
.hul-card.hul-empty{color:#6b7280;background:#f9fafb}

/* Toolbar buttons centered in one row */
.hul-toolbar{
    display:flex;
    flex-wrap:nowrap;
    justify-content:center;
    gap:10px;
    margin:12px 0 18px 0;
}
.hul-btn{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:10px 18px;
    border-radius:10px;
    user-select:none;
    cursor:pointer;
    font-weight:600;
    border:1px solid transparent;
    transition:transform .03s ease,box-shadow .15s ease,background .15s ease,color .15s ease;
}
.hul-btn:active{transform:translateY(1px)}
.hul-btn--primary{background:#2563eb;color:#fff}
.hul-btn--primary:hover{background:#1d4ed8;box-shadow:0 6px 18px -10px rgba(37,99,235,.8)}
.hul-btn--ghost{background:#fff;color:#111827;border:1px solid #e5e7eb}
.hul-btn--ghost:hover{background:#f9fafb;box-shadow:0 6px 18px -10px rgba(0,0,0,.15)}
.hul-ic{
    width:18px;
    height:18px;
    display:inline-block;
    border-radius:9999px;
    background:currentColor;
    opacity:.18;
}

/* Results table */
.hul-table-wrap{
    overflow:auto;
    max-height:70vh;
    border-radius:12px;
    border:1px solid #e5e7eb;
    width:100%;
    box-sizing:border-box;
}
.hul-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0;
    font-size:14px;
}
.hul-table thead th{
    position:sticky;
    top:0;
    z-index:2;
    background:#f3f4f6;
    color:#111827;
    text-align:left;
    font-weight:700;
    padding:12px 12px;
    border-bottom:1px solid #e5e7eb;
}
.hul-table tbody td{
    padding:12px 12px;
    border-bottom:1px solid #f1f5f9;
    color:#111827;
}
.hul-table tbody tr:nth-child(even) td{background:#fbfdff}
.hul-table tbody tr:hover td{background:#f3f8ff}
.hul-table a{text-decoration:none;color:#2563eb;font-weight:600}
.hul-td-right{text-align:right}
.hul-progress{
    position:relative;
    height:10px;
    background:#e5e7eb;
    border-radius:9999px;
    overflow:hidden;
}
.hul-progress-bar{
    position:absolute;
    height:100%;
    background:#2563eb;
    width:0%;
    transition:width .3s ease;
}
.hul-progress-caption{font-size:12px;color:#6b7280;margin-top:6px}

/* ---------- Filters: header + content as a card ---------- */
/* Header cell (was orange) */
#fg_custpage_fg_filters {
    background:#fff !important;
    border:1px solid #e5e7eb !important;
    border-radius:14px 14px 0 0 !important;
    padding:10px 16px !important;
    box-sizing:border-box !important;
    font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial !important;
    font-size:13px !important;
    font-weight:600 !important;
    color:#111827 !important;
}

/* Remove leftover NS chrome */
#fg_custpage_fg_filters .fgroup_title {
    background:transparent !important;
    border:none !important;
}

/* Content row under the header */
#tr_fg_custpage_fg_filters {
    background:#fff !important;
    border:1px solid #e5e7eb !important;
    border-top:none !important;
    border-radius:0 0 14px 14px !important;
    box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px -12px rgba(0,0,0,.12);
}

/* Make each filter column wider */
#tr_fg_custpage_fg_filters td {
    width:50% !important;
}

/* Layout of individual filter fields */
#tr_fg_custpage_fg_filters .uir-field-wrapper {
    display:inline-block;
    vertical-align:top;
    width:360px !important;
    max-width:none !important;
    margin-right:24px;
    margin-bottom:12px;
}

/* Filter labels */
#tr_fg_custpage_fg_filters .smalltextnolink{
    display:block;
    font-size:11px;
    font-weight:600;
    color:#6b7280;
    margin-bottom:4px;
}

/* Filter inputs */
#tr_fg_custpage_fg_filters input,
#tr_fg_custpage_fg_filters select{
    border-radius:10px;
    border:1px solid #d1d5db;
    padding:6px 10px;
    font-size:13px;
    width:100% !important;
    max-width:none !important;
    box-sizing:border-box;
}
#tr_fg_custpage_fg_filters input:focus,
#tr_fg_custpage_fg_filters select:focus{
    outline:none;
    border-color:#2563eb;
    box-shadow:0 0 0 1px rgba(37,99,235,.45);
}
</style>
<script>
(function(){
    function getVal(id){
        var el = document.getElementById(id);
        return (el && (el.value || el.textContent) || '').trim();
    }
    window.HUL_onRebuild = function(){
        var href = getVal('custpage_rebuild_url');
        if(!href){ alert('Rebuild URL not found.'); return; }
        window.location.href = href;
    };
    window.HUL_onCsv = function(){
        var href = getVal('custpage_csv_url');
        if(!href){ alert('CSV URL not found.'); return; }
        window.location.href = href;
    };
    window.HUL_clearFilters = function(){
        var href = getVal('custpage_clear_url');
        if(!href){ alert('Clear URL not found.'); return; }
        window.location.href = href;
    };
    window.HUL_applyFilters = function(){
        // Suppress "leave page" prompts from NetSuite/client scripts
        try {
            if (typeof window.onbeforeunload === 'function') {
                window._hulPrevOnBeforeUnload = window.onbeforeunload;
                window.onbeforeunload = null;
            }
            if (typeof window.NLBeforeUnload === 'function') {
                window._hulPrevNLBeforeUnload = window.NLBeforeUnload;
                window.NLBeforeUnload = null;
            }
        } catch (e) {
            // best-effort only; ignore errors
        }

        var form = document.forms && document.forms[0];
        if(!form){
            alert('Form not found.');
            return;
        }
        form.submit();
    };
})();
</script>
        `.trim();
            const fld = form.addField({
                id: 'custpage_theme_css',
                label: 'Theme',
                type: serverWidget.FieldType.INLINEHTML
            });
            fld.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE });
            fld.defaultValue = cssAndJs;
        }
        catch (e) {
            errorLog('Theme:inject:error', e?.message ?? String(e));
        }
    }
    function renderToolbarHtml() {
        return `
        <div class="hul-toolbar">
            <button type="button" class="hul-btn hul-btn--primary" onclick="HUL_onRebuild()">
                <span class="hul-ic"></span> Rebuild Dataset
            </button>
            <button type="button" class="hul-btn hul-btn--ghost" onclick="HUL_onCsv()">
                <span class="hul-ic"></span> Download CSV
            </button>
            <button type="button" class="hul-btn hul-btn--ghost" onclick="HUL_applyFilters()">
                <span class="hul-ic"></span> Apply Filters
            </button>
            <button type="button" class="hul-btn hul-btn--ghost" onclick="HUL_clearFilters()">
                <span class="hul-ic"></span> Clear Filters
            </button>
        </div>
    `;
    }
    /* -------------------------- PARAM + LOOKUPS -------------------------- */
    function readParamFileId() {
        try {
            const raw = runtime.getCurrentScript().getParameter({ name: SCRIPT_PARAM_FILEID });
            const n = toIntSafe(raw);
            audit('Param:fileId', { raw, parsed: n });
            return Number.isFinite(n) ? n : NaN;
        }
        catch (e) {
            errorLog('Param:fileId:error', e?.message ?? String(e));
            return NaN;
        }
    }
    function readLastRebuildFromDeployment() {
        try {
            const d = getDeploymentInfo();
            if (!d.internalId) {
                audit('LastRebuild:read:skip', { reason: 'no deployment internalId' });
                return '';
            }
            const dep = record.load({ type: 'scriptdeployment', id: d.internalId });
            const iso = String(dep.getValue({ fieldId: SCRIPT_PARAM_LAST_REBUILD }) || '').trim();
            audit('LastRebuild:read:ok', { deploymentInternalId: d.internalId, iso });
            return iso;
        }
        catch (e) {
            errorLog('LastRebuild:read:error', e?.message ?? String(e));
            return '';
        }
    }
    /**
     * NOTE (ESLint member-delimiter-style): semicolons inside the type literal.
     */
    function getDeploymentInfo() {
        try {
            const cur = runtime.getCurrentScript();
            const deployScriptId = String(cur.deploymentId);
            const res = search.create({
                type: 'scriptdeployment',
                filters: [['scriptid', 'is', deployScriptId]],
                columns: ['internalid', 'scriptid']
            })
                .run()
                .getRange({ start: 0, end: 1 });
            if (!res || !res[0]) {
                errorLog('Deploy:resolve:notfound', { deployScriptId });
                return { scriptId: String(cur.id), deploymentId: deployScriptId, internalId: null };
            }
            const internalId = Number(res[0].getValue({ name: 'internalid' }));
            audit('Deploy:resolve:ok', { deployScriptId, internalId });
            return {
                scriptId: String(cur.id),
                deploymentId: deployScriptId,
                internalId: Number.isFinite(internalId) ? internalId : null
            };
        }
        catch (e) {
            errorLog('Deploy:resolve:error', e?.message ?? String(e));
            return { scriptId: '', deploymentId: '', internalId: null };
        }
    }
    /* -------------------------- PERCENTAGE HEURISTIC -------------------------- */
    function stageToPercent(stage) {
        const s = (stage || '').toUpperCase();
        if (s.includes('GET_INPUT'))
            return 10;
        if (s.includes('MAP'))
            return 50;
        if (s.includes('SHUFFLE'))
            return 75;
        if (s.includes('REDUCE'))
            return 90;
        if (s.includes('SUMMARIZE'))
            return 98;
        return 15;
    }
});

/* eslint-disable max-len */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 09/12/2025
 * Version: 6.1 (clean indent; spacing/card wrapper; AMD-free inline)
 */

import type { EntryPoints } from 'N/types';
import * as serverWidget from 'N/ui/serverWidget';
import * as url from 'N/url';
import * as log from 'N/log';

const TOP_TAB_ID = 'custpage_open_cases_tab';
const TOP_TAB_LABEL = 'Open Cases';

const SUBTAB_ID = 'custpage_open_cases_subtab';
const SUBTAB_LABEL = 'Related Cases';

const HTML_CONTAINER_ID = 'custpage_oc_container';
const SUITELET_URL_FIELD_ID = 'custpage_oc_sl_url';

const SL_SCRIPT_ID = 'customscript4392';
const SL_DEPLOY_ID = 'customdeploy1';

const SWAL_MEDIA_URL =
    'https://6952227.app.netsuite.com/core/media/media.nl?id=7717996&c=6952227&h=c9TCa3iCK--JqE6VSKvsZxYdE5tYTk-nLcIKYxn2-61HWDRj&_xt=.js';

function getSuiteletUrl(): string {
    try {
        const u =
            url.resolveScript({
                scriptId: SL_SCRIPT_ID,
                deploymentId: SL_DEPLOY_ID,
                returnExternalUrl: false
            }) || '';
        log.debug({ title: 'resolveScript OK', details: u || '(empty)' });
        return u;
    } catch (e) {
        log.error({ title: 'resolveScript FAILED', details: String((e as Error)?.message || e) });
        return '';
    }
}

function addInlineClientBootstrap(form: serverWidget.Form): void {
    const js = [
        '(function(){',
        '    function dbg(){ try{ console.log.apply(console, ["[OpenCases INLINE]"].concat([].slice.call(arguments))); }catch(_e){} }',
        '    if (window.__ocBooted){ dbg("already booted"); return; }',
        '    window.__ocBooted = true;',
        '    dbg("boot");',

        // SweetAlert2 self-loader (no module deps)
        `    var SWAL_URL = ${JSON.stringify(SWAL_MEDIA_URL)};`,
        '    var SWAL_TAG_ID = "hul-swal2-js";',
        '    function ensureSwal(cb){',
        '        try {',
        '            if (window.Swal){ cb(true); return; }',
        '            var existing = document.getElementById(SWAL_TAG_ID);',
        '            if (existing){',
        '                existing.addEventListener("load", function(){ cb(!!window.Swal); });',
        '                existing.addEventListener("error", function(){ cb(false); });',
        '                return;',
        '            }',
        '            var s = document.createElement("script");',
        '            s.id = SWAL_TAG_ID;',
        '            s.defer = true;',
        '            s.src = SWAL_URL;',
        '            s.addEventListener("load", function(){ cb(!!window.Swal); });',
        '            s.addEventListener("error", function(){ cb(false); });',
        '            (document.head||document.documentElement).appendChild(s);',
        '        } catch(_e){ cb(false); }',
        '    }',
        '    function showFoundModalOnce(sig){',
        '        if (!showFoundModalOnce._last) showFoundModalOnce._last = "";',
        '        if (showFoundModalOnce._last === sig) return;',
        '        showFoundModalOnce._last = sig;',
        '        ensureSwal(function(ok){',
        '            if (!ok){ dbg("Swal failed to load; skipping modal"); return; }',
        '            try {',
        '                window.Swal.fire({',
        '                    icon: "info",',
        '                    title: "Related cases found",',
        '                    html: "Review the <b>Open Cases</b> tab to see details.",',
        '                    confirmButtonText: "OK",',
        '                    allowOutsideClick: true,',
        '                    allowEscapeKey: true,',
        '                    heightAuto: false',
        '                });',
        '            } catch(_e){ dbg("Swal.fire error", _e && _e.message || _e); }',
        '        });',
        '    }',

        // DOM helpers
        '    function qsel(id){ return document.getElementById(id); }',
        '    function onlyDigits(v){ var s=(v==null)?"":String(v); return s.replace(/[^\\d]/g,""); }',
        '    function getMultiIdsFromValue(val){',
        '        if (!val) return [];',
        '        if (Array.isArray(val)){ return val.map(function(v){ return String(v && v.value != null ? v.value : v); }); }',
        '        var s = String(val); if (!s) return [];',
        '        if (s.indexOf(",")>=0) return s.split(",").map(function(x){return x.trim();}).filter(Boolean);',
        '        return [s];',
        '    }',
        '    function findFieldEl(fieldId){',
        '        var byId = document.getElementById(fieldId); if (byId) return byId;',
        '        var byName = document.querySelector("[name=\\"" + fieldId + "\\"]"); if (byName) return byName;',
        '        var byTail = document.querySelector(\'input[id$="\' + fieldId + \'"], select[id$="\' + fieldId + \'"]\');',
        '        return byTail || null;',
        '    }',
        '    function readCustomerId(){',
        '        var el = findFieldEl("custevent_nx_customer") || findFieldEl("company");',
        '        if (!el) return "";',
        '        var v = (el && ("value" in el)) ? el.value : "";',
        '        return onlyDigits(v);',
        '    }',
        '    function readAssetIds(){',
        '        var el = findFieldEl("custevent_nxc_case_assets");',
        '        if (!el) return [];',
        '        var raw = (el && ("value" in el)) ? el.value : "";',
        '        return getMultiIdsFromValue(raw).map(onlyDigits).filter(function(x){return x.length>0;});',
        '    }',
        '    function readSuiteletBaseUrl(){',
        '        var el = document.getElementById("custpage_oc_sl_url");',
        '        return (el && ("value" in el)) ? (el.value || "") : "";',
        '    }',
        '    function buildUrl(base, customerId, assetIds){',
        '        var qs = "customerId=" + encodeURIComponent(customerId) + "&assetIds=" + encodeURIComponent(assetIds.join(","));',
        '        if (!base) return "";',
        '        return base.indexOf("?")>=0 ? (base + "&" + qs) : (base + "?" + qs);',
        '    }',
        '    function escapeHtml(s){',
        '        return String(s)',
        '            .replace(/&/g,"&amp;")',
        '            .replace(/</g,"&lt;")',
        '            .replace(/>/g,"&gt;")',
        '            .replace(/"/g,"&quot;")',
        '            .replace(/\\x27/g,"&#39;")',
        '            .replace(/\'/g,"&#39;");',
        '    }',
        '    function renderRows(rows){',
        '        var host = qsel("openCasesList");',
        '        if (!host) return;',
        '        if (!rows || rows.length===0){',
        '            host.innerHTML = \'<div id="openCasesListEmpty" class="oc-muted">No related cases.</div>\';',
        '            return;',
        '        }',
        '        var html = \'<table id="openCasesTable"><thead><tr>\' +',
        '                  \'<th>Open</th><th>Case ID</th><th>Case #</th><th>Start Date</th><th>Customer (ID)</th><th>Assigned To</th><th>Revenue Stream</th><th>Subject</th>\' +',
        '                  \'</tr></thead><tbody>\';',
        '        for (var i=0;i<rows.length;i++){',
        '            var r = rows[i] || {};',
        '            var openUrl = String(r.open_url || "");',
        '            var caseId = escapeHtml(String(r.case_id || ""));',
        '            var caseNo = escapeHtml(String(r.case_number || ""));',
        '            var start  = escapeHtml(String(r.case_start_date || ""));',
        '            var cust   = escapeHtml(String(r.custevent_nx_customer || ""));',
        '            var assigned = escapeHtml(String(r.case_assigned_to || ""));',
        '            var revenue = escapeHtml(String(r.revenue_stream || ""));',
        '            var subject = escapeHtml(String(r.subject || ""));',
        '            var link = openUrl ? (\'<a href="\' + openUrl + \'" target="_blank" rel="noopener">Open</a>\') : "";',
        '            html += \'<tr><td>\' + link + \'</td><td>\' + caseId + \'</td><td>\' + caseNo + \'</td><td>\' + start + \'</td><td>\' + cust + \'</td><td>\' + assigned + \'</td><td>\' + revenue + \'</td><td>\' + subject + \'</td></tr>\';',
        '        }',
        '        html += \'</tbody></table>\';',
        '        host.innerHTML = html;',
        '    }',
        '    function fetchJson(url, cb){',
        '        try {',
        '            if (typeof fetch==="function"){',
        '                fetch(url, {method:"GET", credentials:"same-origin"})',
        '                    .then(function(r){ return r.json(); })',
        '                    .then(function(j){ cb(j); })',
        '                    .catch(function(){ cb(null); });',
        '                return;',
        '            }',
        '        } catch(_e){}',
        '        try {',
        '            var xhr = new XMLHttpRequest();',
        '            xhr.open("GET", url, true);',
        '            xhr.onreadystatechange = function(){',
        '                if (xhr.readyState===4){',
        '                    if (xhr.status>=200 && xhr.status<300){',
        '                        try { cb(JSON.parse(xhr.responseText||"{}")); } catch(_e){ cb(null); }',
        '                    } else { cb(null); }',
        '                }',
        '            };',
        '            xhr.send();',
        '        } catch(_e){ cb(null); }',
        '    }',

        '    function signature(){',
        '        var c = readCustomerId();',
        '        var a = readAssetIds();',
        '        return c + "|" + a.join(",");',
        '    }',

        '    function refreshList(){',
        '        try {',
        '            var c = readCustomerId();',
        '            var a = readAssetIds();',
        '            var base = readSuiteletBaseUrl();',
        '            var host = qsel("openCasesList");',
        '            if (host) host.innerHTML = \'<div class="oc-muted">Loading…</div>\';',
        '            if (!base || !c || a.length===0){ renderRows([]); return; }',
        '            var url = buildUrl(base, c, a);',
        '            fetchJson(url, function(data){',
        '                if (!data || !data.ok){ renderRows([]); return; }',
        '                var rows = Array.isArray(data.rows) ? data.rows : [];',
        '                renderRows(rows);',
        '                if (rows.length>0){ showFoundModalOnce(signature()); }',
        '            });',
        '        } catch(_e){ renderRows([]); }',
        '    }',

        '    function bindFieldChanges(){',
        '        var custEl = findFieldEl("custevent_nx_customer") || findFieldEl("company");',
        '        if (custEl){ custEl.addEventListener("change", refreshList); }',
        '        var assetsEl = findFieldEl("custevent_nxc_case_assets");',
        '        if (assetsEl){ assetsEl.addEventListener("change", refreshList); }',
        '    }',

        '    (function waitForContainer(){',
        '        var tries = 0;',
        '        var timer = setInterval(function(){',
        '            tries++;',
        '            if (qsel("openCasesList")){',
        '                clearInterval(timer);',
        '                bindFieldChanges();',
        '                refreshList();',
        '            }',
        '            if (tries > 50){ clearInterval(timer); }',
        '        }, 120);',
        '    })();',

        '})();'
    ].join('\n');

    const inline = form.addField({
        id: 'custpage_oc_inline_boot',
        type: serverWidget.FieldType.INLINEHTML,
        label: 'Open Cases Boot',
        container: SUBTAB_ID
    });
    inline.defaultValue = `<script>${js}</script>`;
}

export function beforeLoad(ctx: EntryPoints.UserEvent.beforeLoadContext) {
    try {
        log.debug({ title: 'UE beforeLoad ENTER', details: `type=${String(ctx.type)}` });

        const isCreate = ctx.type === ctx.UserEventType.CREATE;
        if (!isCreate) {
            log.debug({ title: 'UE EXIT', details: 'Not CREATE' });
            return;
        }

        const form = ctx.form;

        form.addTab({ id: TOP_TAB_ID, label: TOP_TAB_LABEL });
        form.addSubtab({ id: SUBTAB_ID, label: SUBTAB_LABEL, tab: TOP_TAB_ID });

        // Hidden Suitelet URL
        const baseUrl = getSuiteletUrl();
        const slField = form.addField({
            id: SUITELET_URL_FIELD_ID,
            type: serverWidget.FieldType.TEXT,
            label: 'Open Cases Suitelet URL',
            container: SUBTAB_ID
        });
        slField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        slField.defaultValue = baseUrl || '';

        // Card wrapper + table CSS (prevents margin collapse / spacing drift)
        const html = [
            '<div id="openCasesCard">',
            '  <div id="openCasesList">',
            '    <div class="oc-muted">Select Customer and Assets to load related cases…</div>',
            '  </div>',
            '</div>',
            '<style>',
            '  #openCasesCard{',
            '    margin-top:8px;',
            '    padding:10px 12px;',
            '    border:1px solid #e3e3e3;',
            '    border-radius:6px;',
            '    background:#fff;',
            '  }',
            '  #openCasesList{ overflow-x:auto; }',
            '  #openCasesTable{',
            '    border-collapse:separate;',
            '    border-spacing:0;',
            '    width:100%;',
            '    min-width:720px;',
            '    table-layout:fixed;',
            '  }',
            '  #openCasesTable thead th{',
            '    position:sticky; top:0; z-index:1;',
            '    background:#f7f7f9;',
            '    border-bottom:1px solid #dcdcdc;',
            '    font-weight:600; font-size:12px; letter-spacing:.02em;',
            '    padding:8px 10px; text-align:left;',
            '  }',
            '  #openCasesTable tbody td{',
            '    border-bottom:1px solid #eee;',
            '    padding:7px 10px; font-size:12px; vertical-align:middle;',
            '    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;',
            '  }',
            '  #openCasesTable tbody tr:nth-child(odd){ background:#fafafa; }',
            '  #openCasesTable tbody tr:hover{ background:#f0f7ff; }',
            '  #openCasesTable th:nth-child(1), #openCasesTable td:nth-child(1){ width:72px; }',
            '  #openCasesTable th:nth-child(2), #openCasesTable td:nth-child(2){ width:110px; font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }',
            '  #openCasesTable th:nth-child(3), #openCasesTable td:nth-child(3){ width:110px; }',
            '  #openCasesTable th:nth-child(4), #openCasesTable td:nth-child(4){ width:120px; }',
            '  #openCasesTable th:nth-child(5), #openCasesTable td:nth-child(5){ width:180px; }',
            '  #openCasesTable th:nth-child(6), #openCasesTable td:nth-child(6){ width:180px; }',
            '  #openCasesTable th:nth-child(7), #openCasesTable td:nth-child(7){ width:180px; }',
            '  #openCasesTable th:nth-child(8), #openCasesTable td:nth-child(8){ width:260px; }',
            '  #openCasesTable td:first-child a{',
            '    display:inline-block; padding:4px 10px; border:1px solid #1e66f5;',
            '    border-radius:999px; text-decoration:none; font-size:12px; line-height:1;',
            '  }',
            '  #openCasesTable td:first-child a:hover{ background:#1e66f5; color:#fff; }',
            '  .oc-muted{ color:#666; font-size:12px; padding:6px 2px; }',
            '</style>'
        ].join('\n');

        const htmlField = form.addField({
            id: HTML_CONTAINER_ID,
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Related Cases',
            container: SUBTAB_ID
        });
        htmlField.defaultValue = html;

        // Inline client bootstrap
        addInlineClientBootstrap(form);

        log.debug({ title: 'UE beforeLoad EXIT', details: 'UI + inline client set' });
    } catch (e) {
        log.error({ title: 'UE beforeLoad FATAL', details: String((e as Error)?.message || e) });
    }
}

export function beforeSubmit(_ctx: EntryPoints.UserEvent.beforeSubmitContext) {}
export function afterSubmit(_ctx: EntryPoints.UserEvent.afterSubmitContext) {}

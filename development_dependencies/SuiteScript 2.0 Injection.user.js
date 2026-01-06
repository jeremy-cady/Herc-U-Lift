// ==UserScript==
// @name         HUL NetSuite Probes (N/* + SuiteQL)
// @namespace    https://hul.dev/
// @version      0.6
// @description  Safely expose NetSuite N/* modules and handy SuiteQL probes in window.hul
// @match        https://*.netsuite.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ----- Config -----
  const SHOW_UI = true;              // set false to hide the floating buttons
  const NS_TIMEOUT_MS = 15000;
  const POLL_MS = 250;

  // Change your prefix here if you like (e.g., window.nsDbg)
  const NS = (window.hul = window.hul || {});

  // ----- tiny utils -----
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, timeout = NS_TIMEOUT_MS, step = POLL_MS) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      try { if (fn()) return true; } catch (_) {}
      await sleep(step);
    }
    return false;
  };

  const safeModule = (mod, fn) => (mod && (!fn || typeof mod[fn] === 'function')) ? mod : null;

  // ----- module loader -----
  async function loadModules() {
    const ok = await waitFor(() => typeof window.require === 'function');
    if (!ok) {
      console.warn('[HUL] NetSuite require() not available on this page');
      return null;
    }
    return new Promise((resolve) => {
      window.require(
        ['N/currentRecord','N/record','N/search','N/runtime','N/format','N/query','N/https'],
        (currentRecord, record, search, runtime, format, query, https) => {
          resolve({
            currentRecord: safeModule(currentRecord, 'get'),
            record      : safeModule(record, 'load'),
            search      : safeModule(search, 'create'),
            runtime     : safeModule(runtime, 'getCurrentScript'),
            format      : safeModule(format, 'format'),
            query       : safeModule(query, 'runSuiteQL'),
            https       : safeModule(https, 'get')
          });
        },
        (err) => {
          console.warn('[HUL] require() error', err);
          resolve(null);
        }
      );
    });
  }

  // ----- SuiteQL runner -----
  async function runSuiteQL(sql, params = []) {
    if (!NS.modules || !NS.modules.query) {
      console.warn('[HUL] N/query unavailable for SuiteQL');
      return null;
    }
    try {
      const rs = NS.modules.query.runSuiteQL({ query: sql, params });
      return typeof rs.asMappedResults === 'function' ? rs.asMappedResults() : rs;
    } catch (e) {
      console.warn('[HUL] runSuiteQL failed:', e);
      return { error: String(e && e.message || e) };
    }
  }

  // ----- Probes exposed under window.hul -----
  NS.getCurrentRecord = () => {
    try {
      if (NS.modules && NS.modules.currentRecord) {
        const rec = NS.modules.currentRecord.get();
        if (rec) { console.info('[HUL] currentRecord:', rec); return rec; }
      }
      if (typeof window.nlapiGetRecordType === 'function' &&
          typeof window.nlapiGetRecordId === 'function' &&
          typeof window.nlapiLoadRecord === 'function') {
        const t = window.nlapiGetRecordType(); const id = window.nlapiGetRecordId();
        if (t && id) { const r = window.nlapiLoadRecord(t, id); console.info('[HUL] 1.0 record:', r); return r; }
      }
    } catch (e) { console.warn('[HUL] getCurrentRecord error:', e); }
    console.info('[HUL] No record context on this page.');
    return null;
  };

  NS.probeTransactionColumns = async () => {
    const sql = `
      SELECT table_name, column_name, data_type
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'transaction'
      ORDER BY column_name
      FETCH FIRST 500 ROWS ONLY
    `;
    const rows = await runSuiteQL(sql, []);
    console.table?.(rows);
    return rows;
  };

  NS.detectFinanceTerm = async () => {
    const sql = `
      SELECT column_name, data_type
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'transaction'
        AND LOWER(column_name) LIKE 'custbody%fin%term%'
      ORDER BY column_name
      FETCH FIRST 50 ROWS ONLY
    `;
    const rows = await runSuiteQL(sql, []);
    if (!rows || rows.length === 0) {
      console.info('[HUL] No custbody finance term-like field found.');
    } else {
      console.table?.(rows);
    }
    return rows;
  };

  NS.sampleHeaderRows = async (limit = 5) => {
    const sql = `
      SELECT t.id, t.tranid, t.trandate, t.status,
             BUILTIN.DF(t.entity) AS entity_name,
             t.mainline, t.amount
      FROM transaction t
      WHERE t.type IN ('SalesOrd','CustInvc')
        AND t.mainline = 'T'
      ORDER BY t.trandate DESC
      FETCH NEXT ${Number(limit)} ROWS ONLY
    `;
    const rows = await runSuiteQL(sql, []);
    console.table?.(rows);
    return rows;
  };

  NS.copyToClipboard = async (data) => {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(text);
      console.info('[HUL] Copied to clipboard.');
      return true;
    } catch (e) {
      console.warn('[HUL] Clipboard copy failed:', e);
      return false;
    }
  };

  // ----- Minimal floating UI (optional) -----
  function addUI() {
    if (!SHOW_UI) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:fixed; right:12px; bottom:12px; z-index:999999;
      display:flex; gap:8px; font:12px/1.2 -apple-system,Segoe UI,Roboto,Arial;
    `;
    const btn = (label, fn) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = `
        padding:6px 10px; border:1px solid #ccc; border-radius:8px;
        background:#fff; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,.12)
      `;
      b.onclick = fn;
      return b;
    };
    wrap.appendChild(btn('Probe Txn Columns', async () => {
      const rows = await NS.probeTransactionColumns();
      NS.copyToClipboard(rows);
    }));
    wrap.appendChild(btn('Detect Finance Term', async () => {
      const rows = await NS.detectFinanceTerm();
      NS.copyToClipboard(rows);
    }));
    wrap.appendChild(btn('Sample Headers', async () => {
      const rows = await NS.sampleHeaderRows(10);
      NS.copyToClipboard(rows);
    }));
    document.body.appendChild(wrap);
  }

  // ----- boot -----
  (async function boot() {
    NS.modules = await loadModules();
    if (!NS.modules) {
      console.info('[HUL] Modules not available on this page — SuiteQL may be restricted.');
    } else {
      console.info('[HUL] Modules loaded:', Object.keys(NS.modules).filter(k => NS.modules[k]));
    }
    addUI();
    // quick smoke test
    if (NS.modules && NS.modules.query) {
      // light ping to verify SuiteQL works
      await NS.sampleHeaderRows(1);
    }
  }());
})();
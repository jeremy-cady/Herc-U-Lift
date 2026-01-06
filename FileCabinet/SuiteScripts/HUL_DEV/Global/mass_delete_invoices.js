/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record','N/log','N/runtime','N/file'], (record, log, runtime, file) => {

  // PARAMETERS
  const P_IDS_TEXT = 'custscript_inv_ids_text';   // Long Text area (comma/newline-separated IDs)
  const P_IDS_FILE = 'custscript_inv_ids_file';   // File (internal file ID of CSV/TXT)
  const P_DRYRUN   = 'custscript_inv_delete_dryrun'; // Checkbox (T/F)

  // --- helpers ---
  function parseIdsFromText(raw) {
    if (!raw) return [];
    // Accept: commas, newlines, tabs; strip quotes/spaces
    const parts = raw.replace(/\r/g,'\n').split(/[\n,\t]+/);
    const out = [];
    const seen = new Set();
    for (let p of parts) {
      if (!p) continue;
      p = String(p).replace(/["']/g,'').trim();
      if (!p) continue;
      // keep numeric-ish only
      if (!/^\d+$/.test(p)) continue;
      if (!seen.has(p)) { seen.add(p); out.push(p); }
    }
    return out;
  }

  function parseIdsFromFile(fileId) {
    if (!fileId) return [];
    const f = file.load({ id: fileId });
    const contents = f.getContents();
    // allow CSV with header "internalid" OR just a column of numbers
    // remove first token if it's non-numeric header
    let ids = parseIdsFromText(contents);
    return ids;
  }

  function getAllIds() {
    const script = runtime.getCurrentScript();
    const txt = script.getParameter({ name: P_IDS_TEXT }) || '';
    const fileId = script.getParameter({ name: P_IDS_FILE });
    let ids = [];

    // Prefer file (good for large lists)
    if (fileId) {
      ids = parseIdsFromFile(fileId);
      log.audit('Source', `Loaded ${ids.length} id(s) from file ${fileId}`);
    }

    // Append any pasted text IDs
    const extra = parseIdsFromText(txt);
    if (extra.length) {
      const set = new Set(ids);
      for (const x of extra) if (!set.has(x)) { ids.push(x); set.add(x); }
      log.audit('Source', `Appended ${extra.length} id(s) from text param`);
    }

    if (ids.length === 0) throw Error('No invoice IDs found. Provide IDs via file or text parameter.');
    return ids;
  }

  function getInputData() {
    const ids = getAllIds();
    // Map input wants an iterable; wrap each as object to future-proof
    return ids.map(id => ({ id }));
  }

  function map(context) {
    const script = runtime.getCurrentScript();
    const dryRun = script.getParameter({ name: P_DRYRUN });
    const val = JSON.parse(context.value);
    const id = val.id;

    if (dryRun === true || dryRun === 'T') {
      log.audit('DRY RUN — would delete invoice', id);
      return;
    }

    try {
      record.delete({ type: record.Type.INVOICE, id });
      log.audit('Deleted invoice', id);
    } catch (e) {
      log.error(`Failed to delete invoice ${id}`, e && e.message ? e.message : String(e));
    }
  }

  function summarize(summary) {
    if (summary.inputSummary.error) log.error('Input error', summary.inputSummary.error);
    let deleted = 0, failed = 0, dry = 0;
    summary.output.map; // (no outputs used)
    summary.mapSummary.errors.iterator().each((k, err) => { failed++; return true; });
    // Count audits heuristically
    summary.mapSummary.steps.iterator().each((k, v) => true);
    log.audit('Mass Delete Complete', 'Review execution log for per-ID results.');
  }

  return { getInputData, map, summarize };
});

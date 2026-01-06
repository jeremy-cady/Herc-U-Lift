/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record','N/log','N/runtime','N/file'], (record, log, runtime, file) => {

  const P_IDS_TEXT = 'custscript_inv_ids_text';         // Long Text (IDs separated by comma/newline)
  const P_IDS_FILE = 'custscript_inv_ids_file';         // File ID (CSV/TXT)
  const P_DRYRUN   = 'custscript_inv_delete_dryrun';    // Checkbox

  function parseIdsFromText(raw) {
    if (!raw) return [];
    const parts = String(raw).replace(/\r/g,'\n').split(/[\n,\t,]+/);
    const out = []; const seen = new Set();
    for (let p of parts) {
      p = (p || '').replace(/["']/g,'').trim();
      if (!p || !/^\d+$/.test(p)) continue;
      if (!seen.has(p)) { seen.add(p); out.push(p); }
    }
    return out;
  }

  function parseIdsFromFile(fileId) {
    if (!fileId) return [];
    const f = file.load({ id: fileId });
    return parseIdsFromText(f.getContents());
  }

  function getAllIds() {
    const script = runtime.getCurrentScript();
    const txt = script.getParameter({ name: P_IDS_TEXT }) || '';
    const fileId = script.getParameter({ name: P_IDS_FILE });
    let ids = [];

    if (fileId) {
      ids = parseIdsFromFile(fileId);
      log.audit('Source', `Loaded ${ids.length} id(s) from file ${fileId}`);
    }
    const extra = parseIdsFromText(txt);
    if (extra.length) {
      const set = new Set(ids);
      for (const x of extra) if (!set.has(x)) { ids.push(x); set.add(x); }
      log.audit('Source', `Appended ${extra.length} id(s) from text param`);
    }
    if (!ids.length) throw Error('No invoice IDs found. Provide IDs via file or text parameter.');
    return ids;
  }

  function getInputData() {
    return getAllIds().map(id => ({ id })); // simple array input
  }

  function map(context) {
    const script = runtime.getCurrentScript();
    const dryRun = script.getParameter({ name: P_DRYRUN });
    const id = JSON.parse(context.value).id;

    try {
      if (dryRun === true || dryRun === 'T') {
        log.audit('DRY RUN — would delete invoice', id);
        return;
      }
      record.delete({ type: record.Type.INVOICE, id });
      log.audit('Deleted invoice', id);
    } catch (e) {
      // log full detail to see *which* dependency/script throws the 4000 error
      const msg = (e && e.message) ? e.message : String(e);
      log.error(`Failed to delete invoice ${id}`, msg);
      if (e && e.stack) log.error('Stack', e.stack);
    }
  }

  function summarize(summary) {
    try {
      if (summary.inputSummary && summary.inputSummary.error) {
        log.error('Input error', summary.inputSummary.error);
      }
      if (summary.mapSummary && summary.mapSummary.errors && summary.mapSummary.errors.iterator) {
        summary.mapSummary.errors.iterator().each((k, err) => {
          log.error(`Map error: ${k}`, err);
          return true;
        });
      }
    } catch (e) {
      log.error('Summarize guard', (e && e.message) ? e.message : String(e));
    }
    log.audit('Mass Delete Complete', 'Review logs for deleted/skipped ids.');
  }

  return { getInputData, map, summarize };
});

define(["require", "exports", "N/query", "N/log"], function (require, exports, query, log) {
    "use strict";
    const REVENUE_SEGMENTS = ['106', '107', '108', '263', '18', '19', '204', '205', '206'];
    const STATUS_VALUES = ['1', '2', '4'];
    function onlyDigits(v) {
        const s = v === null || v === undefined ? '' : String(v);
        return s.replace(/[^\d]/g, '');
    }
    function buildInListNumeric(ids) {
        return ids.map((v) => onlyDigits(v)).filter((x) => x.length > 0).join(',');
    }
    function writeJson(res, payload) {
        try {
            res.addHeader({ name: 'Content-Type', value: 'application/json' });
        }
        catch { /* ignore */ }
        res.write(JSON.stringify(payload));
    }
    const onRequest = (ctx) => {
        const req = ctx.request;
        const res = ctx.response;
        try {
            if ((req.method || '') !== 'GET') {
                writeJson(res, { ok: false, error: 'Only GET allowed' });
                return;
            }
            const customerId = onlyDigits(req.parameters.customerId);
            const assetCsv = String(req.parameters.assetIds || '');
            const assetIds = assetCsv.split(',').map((s) => onlyDigits(s.trim())).filter((s) => s.length > 0);
            const revenueIn = buildInListNumeric(REVENUE_SEGMENTS);
            const statusIn = buildInListNumeric(STATUS_VALUES);
            const assetIn = buildInListNumeric(assetIds);
            log.debug({
                title: 'Suitelet params',
                details: JSON.stringify({ customerId, assetCount: assetIds.length })
            });
            if (!customerId || !assetIn || !revenueIn || !statusIn) {
                writeJson(res, { ok: true, rows: [] });
                return;
            }
            const sql = [
                'SELECT DISTINCT',
                '  sc.id AS case_id,',
                '  sc.casenumber AS case_number,',
                '  sc.startdate AS case_start_date,',
                '  sc.custevent_nx_customer,',
                '  BUILTIN.DF(sc.assigned) AS case_assigned_to,',
                '  BUILTIN.DF(sc.cseg_sna_revenue_st) AS revenue_stream,',
                '  sc.title AS subject',
                'FROM supportcase sc',
                `WHERE sc.custevent_nx_customer = ${customerId}`,
                `  AND sc.cseg_sna_revenue_st IN (${revenueIn})`,
                `  AND sc.status IN (${statusIn})`,
                '  AND EXISTS (',
                '      SELECT 1',
                '      FROM MAP_supportcase_custevent_nxc_case_assets m',
                '      WHERE m.mapone = sc.id',
                `        AND m.maptwo IN (${assetIn})`,
                '  )',
                'ORDER BY sc.id ASC'
            ].join(' ');
            log.debug({ title: 'Suitelet SQL', details: sql });
            let rows = [];
            try {
                rows = query.runSuiteQL({ query: sql }).asMappedResults();
            }
            catch (e) {
                log.error({ title: 'SuiteQL error', details: String(e?.message || e) });
                writeJson(res, { ok: false, error: 'Query failed' });
                return;
            }
            const out = (rows || []).map((r) => {
                const id = String(r.case_id || '');
                return {
                    case_id: id,
                    case_number: String(r.case_number || ''),
                    case_start_date: String(r.case_start_date || ''),
                    custevent_nx_customer: String(r.custevent_nx_customer || ''),
                    case_assigned_to: String(r.case_assigned_to || ''),
                    revenue_stream: String(r.revenue_stream || ''),
                    subject: String(r.subject || ''),
                    open_url: id ? `/app/crm/support/supportcase.nl?id=${id}` : ''
                };
            });
            log.debug({ title: 'Suitelet row count', details: out.length });
            writeJson(res, { ok: true, rows: out });
        }
        catch (e) {
            log.error({ title: 'Suitelet top-level error', details: String(e?.message || e) });
            writeJson(res, { ok: false, error: 'Unhandled Suitelet error' });
        }
    };
    return { onRequest };
});

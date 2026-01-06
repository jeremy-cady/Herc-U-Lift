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

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as log from 'N/log';
import * as search from 'N/search';
import * as file from 'N/file';
import * as runtime from 'N/runtime';
import * as cache from 'N/cache';

/* ----------------------------- Types ----------------------------- */

type OutRow = {
    id: number;
    tranid: string;
    trandate: string;
    customer: string | null;
    memo: string | null;
    custbody1: string | number | null;
    total: number | string | null;
    location: string | null;
    firstBillDate: string | null;
    lastBillDate: string | null;
};

/* -------------------------- Entry Points ------------------------- */

function getInputData(): search.Search {
    try {
        const filters: search.Filter[] = [
            search.createFilter({ name: 'type', operator: search.Operator.ANYOF, values: ['SalesOrd'] }),
            search.createFilter({ name: 'mainline', operator: search.Operator.IS, values: ['T'] }),
            search.createFilter({ name: 'cseg_sna_revenue_st', operator: search.Operator.ANYOF, values: ['441'] }),
            search.createFilter({ name: 'status', operator: search.Operator.NONEOF, values: ['SalesOrd:C'] })
        ];

        const soSearch = search.create({
            type: 'transaction',
            filters,
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
            const paged = soSearch.runPaged({ pageSize: 1000 });
            log.audit('getInputData', { description: 'SO search created (Revenue Stream 441, exclude Closed)', estimatedCount: paged.count });
        } catch (e: any) {
            log.debug('getInputData:runPaged (non-fatal)', e?.message || String(e));
        }

        return soSearch;
    } catch (error: any) {
        log.error('getInputData failed', error?.message || error);
        throw error;
    }
}

function map(context: EntryPoints.MapReduce.mapContext): void {
    try {
        const res = JSON.parse(context.value) as { id: string; values: Record<string, any> };
        const soId = Number(res.id);

        const fromSearch = {
            tranid: colVal(res, 'tranid') ?? '',
            trandate: colVal(res, 'trandate') ?? '',
            customer: colText(res, 'entity'),
            memo: colVal(res, 'memo') ?? null,
            custbody1: colVal(res, 'custbody1') ?? null
        };

        const so = record.load({ type: record.Type.SALES_ORDER, id: soId, isDynamic: false });

        const total = (so.getValue({ fieldId: 'total' }) as number | string) ?? null;
        const locationText = (so.getText({ fieldId: 'location' }) as string) || null;

        let firstBillDate: string | null = null;
        let lastBillDate: string | null = null;

        try {
            const bsVal = (so as any).getValue?.({ fieldId: 'billingschedule' });
            if (Array.isArray(bsVal) && bsVal.length) {
                firstBillDate = normalizeDate(String(bsVal[0]));
                lastBillDate = normalizeDate(String(bsVal[bsVal.length - 1]));
            } else {
                const sublistId = 'billingschedule';
                const count =
                    (so as any).getLineCount?.({ sublistId }) ??
                    (so as any).getLineItemCount?.(sublistId) ??
                    0;

                if (count > 0) {
                    const readDate = (line: number) =>
                        (so as any).getSublistValue?.({ sublistId, fieldId: 'billdate', line }) ??
                        (so as any).getLineItemValue?.(sublistId, 'billdate', line + 1) ??
                        null;

                    const firstRaw = readDate(0);
                    const lastRaw = readDate(count - 1);
                    if (firstRaw) firstBillDate = normalizeDate(String(firstRaw));
                    if (lastRaw) lastBillDate = normalizeDate(String(lastRaw));
                }
            }
        } catch (e: any) {
            log.debug('map:billingschedule-error', { soId, message: e?.message || String(e) });
        }

        const out: OutRow = {
            id: soId,
            tranid: String(fromSearch.tranid),
            trandate: String(fromSearch.trandate),
            customer: (fromSearch.customer as string) || null,
            memo: (fromSearch.memo as string) || null,
            custbody1: fromSearch.custbody1 as any,
            total,
            location: locationText,
            firstBillDate,
            lastBillDate
        };

        context.write({ key: String(soId), value: JSON.stringify(out) });
    } catch (error: any) {
        log.error('map:ERROR', error?.message || error);
    }
}

function reduce(context: EntryPoints.MapReduce.reduceContext): void {
    try {
        const key = context.key;
        const val = context.values && context.values[0] ? String(context.values[0]) : '';
        if (val) {
            context.write({ key, value: val });
        }
    } catch (error: any) {
        log.error('reduce:ERROR', error?.message || error);
    }
}

function summarize(summary: EntryPoints.MapReduce.summarizeContext): void {
    try {
        log.audit('summarize:stats', { usage: summary.usage, concurrency: summary.concurrency, yields: summary.yields });

        if ((summary.inputSummary as any)?.error) log.error('summarize:input-error', (summary.inputSummary as any).error);
        summary.mapSummary.errors.iterator().each((k: string, e: string) => { log.error('summarize:map-error', { key: k, error: e }); return true; });
        summary.reduceSummary.errors.iterator().each((k: string, e: string) => { log.error('summarize:reduce-error', { key: k, error: e }); return true; });

        const rows: OutRow[] = [];
        summary.output.iterator().each((k: string, v: string) => {
            try {
                rows.push(JSON.parse(v) as OutRow);
            } catch (e: any) {
                log.error('summarize:parse-output-row-failed', { key: k, message: e?.message || String(e) });
            }
            return true;
        });
        log.audit('summarize:rows-collected', { count: rows.length });

        const rawFolderParam = runtime.getCurrentScript().getParameter({ name: 'custscript_hul_output_folder' });
        const folderId = toIntSafe(rawFolderParam);
        if (!folderId) {
            log.error('summarize:no-output-folder', 'Set custscript_hul_output_folder to a valid File Cabinet Folder internal ID (integer).');
            return;
        }

        const incomingToken = runtime.getCurrentScript().getParameter({ name: 'custscript_hul_run_token' });
        const token = (incomingToken && String(incomingToken).trim()) || String(new Date().getTime());

        const json = JSON.stringify(rows, null, 2);
        const f = file.create({
            name: `hul_lease_so_dataset_${token}.json`,
            fileType: file.Type.JSON,
            contents: json,
            folder: folderId
        });
        const fileId = f.save();

        // Hand off the new fileId deterministically to the Suitelet
        try {
            const c = cache.getCache({ name: 'hul_dataset_runs' });
            c.put({ key: `run_${token}`, value: String(fileId), ttl: 3600 });
            log.audit('cache-put', { token, fileId });
        } catch (ce: any) {
            log.error('cache-put-failed', ce?.message || String(ce));
        }

        log.audit('summarize:file-saved', { token, fileId, folderId, rows: rows.length });
    } catch (e: any) {
        log.error('summarize:ERROR', e?.message || String(e));
    }
}

/* ----------------------------- Helpers ---------------------------- */

function colVal(res: { values: Record<string, any> }, col: string): any {
    try {
        const v = res.values?.[col];
        if (v && typeof v === 'object' && 'value' in v) return (v as any).value;
        return v ?? null;
    } catch { return null; }
}

function colText(res: { values: Record<string, any> }, col: string): string | null {
    try {
        const v = res.values?.[col];
        if (v && typeof v === 'object') {
            if ('text' in v && (v as any).text != null) return String((v as any).text);
            if ('name' in v && (v as any).name != null) return String((v as any).name);
        }
        return v != null ? String(v) : null;
    } catch { return null; }
}

function toIntSafe(v: unknown): number {
    const cleaned = String(v == null ? '' : v).replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : NaN;
}

function l2(v: any): string {
    const s = String(v == null ? '' : v);
    return s.length < 2 ? `0${s}` : s;
}

function normalizeDate(v: string): string {
    if (!v) return v;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const mdy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    let m = mdy.exec(v);
    if (m) return `${m[3]}-${l2(m[1])}-${l2(m[2])}`;
    const dmy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    m = dmy.exec(v);
    if (m) return `${m[3]}-${l2(m[2])}-${l2(m[1])}`;
    const d = new Date(v);
    if (!isNaN(d.getTime())) return `${d.getFullYear()}-${l2(d.getMonth() + 1)}-${l2(d.getDate())}`;
    return v;
}

/* ----------------------------- Exports ---------------------------- */

export = { getInputData, map, reduce, summarize };
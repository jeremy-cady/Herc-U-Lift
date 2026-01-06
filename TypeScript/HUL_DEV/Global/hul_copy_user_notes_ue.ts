/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as search from 'N/search';
import * as log from 'N/log';

interface NestedArray<T> extends Array<T | NestedArray<T>> {}
type SavedSearchFilters = string | NestedArray<string | search.Operator>;

type NoteRow = {
    internalid: string;              // Note internal ID
    date: string | null;             // notedate (for ordering)
    title: string | null;
    memo: string | null;
    notetypeNum: number | null;      // 1..8
    directionNum: number | null;     // 1..2
    company: string | number | null; // entity internalid (optional on copy)
};

const ALLOWED_NOTETYPE_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
const ALLOWED_DIRECTION_IDS = new Set([1, 2]);

/* ------------------------------- utils ---------------------------------- */

function coerceToIntOrNull(v: unknown): number | null {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isInteger(n) ? n : null;
}

function normalizeSelectFromLookup(val: any): number | null {
    // lookupFields may return: {value:'1',text:'X'} | [{value:'1'}] | '1' | null
    if (val == null) return null;
    if (Array.isArray(val)) {
        if (!val.length) return null;
        const raw = val[0]?.value ?? val[0]?.id ?? val[0];
        return coerceToIntOrNull(raw);
    }
    if (typeof val === 'object') {
        const raw = (val as any).value ?? (val as any).id;
        return coerceToIntOrNull(raw);
    }
    return coerceToIntOrNull(val);
}

/** Normalize text so tiny differences (extra spaces/newlines) don't create dupes. */
function normalizeText(input: string | null | undefined, opts?: { lowercase?: boolean }): string {
    const s = (input ?? '')
        .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')  // zero-width chars
        .replace(/\r\n?/g, '\n')                      // CRLF/CR → LF
        .replace(/\s+/g, ' ')                         // collapse whitespace
        .trim();
    return opts?.lowercase ? s.toLowerCase() : s;
}

/** Build a stable signature used for de-duping. */
function makeSignature(
    title: string | null,
    memo: string | null,
    notetypeNum: number | null,
    directionNum: number | null
): string {
    const t = normalizeText(title, { lowercase: false });
    const m = normalizeText(memo, { lowercase: false });
    const nt = notetypeNum ?? 0;
    const dn = directionNum ?? 0;
    return `${t}||${m}||${nt}||${dn}`;
}

/* ---- log helpers (accept unknown; stringify safely; short lines) ---- */

function toDetails(payload: unknown): string {
    if (typeof payload === 'string') return payload;
    try { return JSON.stringify(payload); } catch { return String(payload); }
}
function logDebug(title: string, payload: unknown): void {
    log.debug({ title, details: toDetails(payload) });
}
function logAudit(title: string, payload: unknown): void {
    log.audit({ title, details: toDetails(payload) });
}
function logError(title: string, payload: unknown): void {
    log.error({ title, details: toDetails(payload) });
}

/* -------------------------- fetch source notes -------------------------- */

function fetchSoNotesViaSavedSearch(soId: number): NoteRow[] {
    const baseFilters: SavedSearchFilters = [
        ['transaction.type', 'anyof', 'SalesOrd'],
        'AND',
        ['transaction.mainline', 'is', 'T']
    ];

    const colDate = search.createColumn({ name: 'notedate', sort: search.Sort.ASC });
    const colTitle = search.createColumn({ name: 'title' });
    const colMemo = search.createColumn({ name: 'note' });
    const colType = search.createColumn({ name: 'notetype' });
    const colDirection = search.createColumn({ name: 'direction' });
    const colCompany = search.createColumn({ name: 'company' });

    const filtersWithSo: any[] = [
        ...(baseFilters as any[]),
        'AND',
        ['transaction.internalid', 'anyof', soId]
    ];

    logDebug('SO→Invoice Notes: Building Saved Search', { soId, filters: filtersWithSo });

    const s = search.create({
        type: 'note',
        filters: filtersWithSo,
        columns: [colDate, colTitle, colMemo, colType, colDirection, colCompany]
    });

    const rows: NoteRow[] = [];
    const paged = s.runPaged({ pageSize: 1000 });

    for (let i = 0; i < paged.pageRanges.length; i++) {
        const page = paged.fetch({ index: i });
        page.data.forEach((res: search.Result) => {
            let nt = coerceToIntOrNull(res.getValue(colType) as any);
            if (nt !== null && !ALLOWED_NOTETYPE_IDS.has(nt)) nt = null;

            let dn = coerceToIntOrNull(res.getValue(colDirection) as any);
            if (dn !== null && !ALLOWED_DIRECTION_IDS.has(dn)) dn = null;

            rows.push({
                internalid: String(res.id ?? ''),
                date: (res.getValue(colDate) as string) ?? null,
                title: (res.getValue(colTitle) as string) ?? null,
                memo: (res.getValue(colMemo) as string) ?? null,
                notetypeNum: nt,
                directionNum: dn,
                company: (res.getValue(colCompany) as string) ?? null
            });
        });
    }

    logDebug('SO→Invoice Notes: Rows fetched (Saved Search)', { count: rows.length });
    return rows;
}

/* ---------------------- hydrate selects with logging -------------------- */

function hydrateFromLookup(row: NoteRow): NoteRow {
    try {
        const looked = search.lookupFields({
            type: 'note',
            id: Number(row.internalid),
            columns: ['notetype', 'direction']
        }) as Record<string, any>;

        const updated = { ...row };
        let hydrated = false;

        if (row.notetypeNum === null) {
            const nt = normalizeSelectFromLookup(looked.notetype);
            if (nt !== null && ALLOWED_NOTETYPE_IDS.has(nt)) {
                updated.notetypeNum = nt;
                hydrated = true;
            }
        }
        if (row.directionNum === null) {
            const dn = normalizeSelectFromLookup(looked.direction);
            if (dn !== null && ALLOWED_DIRECTION_IDS.has(dn)) {
                updated.directionNum = dn;
                hydrated = true;
            }
        }

        if (hydrated) {
            logDebug('SO→Invoice Notes: Hydrated via lookupFields', {
                noteId: row.internalid,
                notetypeNum: updated.notetypeNum,
                directionNum: updated.directionNum
            });
        }
        return updated;
    } catch (e: any) {
        logAudit('SO→Invoice Notes: lookupFields failed; continuing', {
            noteId: row.internalid,
            message: e?.message || e
        });
        return row;
    }
}

function hydrateFromRecordLoad(row: NoteRow): NoteRow {
    try {
        const rec = record.load({ type: record.Type.NOTE, id: Number(row.internalid) });

        const ntLoaded = coerceToIntOrNull(rec.getValue({ fieldId: 'notetype' }) as any);
        const dnLoaded = coerceToIntOrNull(rec.getValue({ fieldId: 'direction' }) as any);

        const notetypeNum =
            row.notetypeNum === null && ntLoaded !== null && ALLOWED_NOTETYPE_IDS.has(ntLoaded)
                ? ntLoaded
                : row.notetypeNum;

        const directionNum =
            row.directionNum === null && dnLoaded !== null && ALLOWED_DIRECTION_IDS.has(dnLoaded)
                ? dnLoaded
                : row.directionNum;

        const updated = { ...row, notetypeNum, directionNum };

        if (updated.notetypeNum !== row.notetypeNum || updated.directionNum !== row.directionNum) {
            logDebug('SO→Invoice Notes: Hydrated via record.load', {
                noteId: row.internalid,
                notetypeNum: updated.notetypeNum,
                directionNum: updated.directionNum
            });
        }
        return updated;
    } catch (e: any) {
        logAudit('SO→Invoice Notes: record.load fallback failed; continuing', {
            noteId: row.internalid,
            message: e?.message || e
        });
        return row;
    }
}

function hydrateMissingSelects(rows: NoteRow[]): NoteRow[] {
    return rows.map((r) => {
        if (r.notetypeNum !== null && r.directionNum !== null) return r;
        const viaLookup = hydrateFromLookup(r);
        if (viaLookup.notetypeNum !== null && viaLookup.directionNum !== null) return viaLookup;
        return hydrateFromRecordLoad(viaLookup);
    });
}

/* ------------- build existing signatures on the Invoice (robust) ------------- */

function buildExistingNoteSignatureSet(invoiceId: number): Set<string> {
    const sigs = new Set<string>();
    const s = search.create({
        type: 'note',
        filters: [['transaction.internalid', 'anyof', invoiceId]],
        columns: ['title', 'note', 'notetype', 'direction']
    });

    const paged = s.runPaged({ pageSize: 1000 });
    for (let i = 0; i < paged.pageRanges.length; i++) {
        const page = paged.fetch({ index: i });
        page.data.forEach((res) => {
            const id = String(res.id ?? '');
            const title = (res.getValue({ name: 'title' }) as string) || '';
            const memo = (res.getValue({ name: 'note' }) as string) || '';

            let ntNum = coerceToIntOrNull(res.getValue({ name: 'notetype' }) as any);
            let dirNum = coerceToIntOrNull(res.getValue({ name: 'direction' }) as any);

            // Hydrate if either is missing so we match creation signatures exactly
            if (ntNum === null || dirNum === null) {
                try {
                    const looked = search.lookupFields({
                        type: 'note',
                        id: Number(id),
                        columns: ['notetype', 'direction']
                    }) as Record<string, any>;
                    if (ntNum === null) ntNum = normalizeSelectFromLookup(looked.notetype);
                    if (dirNum === null) dirNum = normalizeSelectFromLookup(looked.direction);
                } catch (e) {
                    // ignore; will try record.load next
                }
            }
            if (ntNum === null || dirNum === null) {
                try {
                    const rec = record.load({ type: record.Type.NOTE, id: Number(id) });
                    if (ntNum === null) ntNum = coerceToIntOrNull(rec.getValue({ fieldId: 'notetype' }) as any);
                    if (dirNum === null) dirNum = coerceToIntOrNull(rec.getValue({ fieldId: 'direction' }) as any);
                } catch (e) {
                    // ignore; leave as nulls → will become 0s in signature
                }
            }

            const sig = makeSignature(title, memo, ntNum ?? 0, dirNum ?? 0);
            sigs.add(sig);
        });
    }
    return sigs;
}

/* ------------------------------- main copy ------------------------------ */

function copySoNotesToInvoice(invoiceId: number, soId: number): void {
    try {
        let rows = fetchSoNotesViaSavedSearch(soId);
        if (!rows.length) {
            logAudit('SO→Invoice Notes: No notes to copy', { soId });
            return;
        }

        // Hydrate notetype/direction with explicit path logs
        rows = hydrateMissingSelects(rows);

        // Collapse duplicate source rows by normalized signature
        const seen = new Set<string>();
        const uniqueRows: NoteRow[] = [];
        for (const r of rows) {
            const sig = makeSignature(r.title, r.memo, r.notetypeNum, r.directionNum);
            if (!seen.has(sig)) {
                seen.add(sig);
                uniqueRows.push(r);
            } else {
                logAudit('SO→Invoice Notes: Skipping duplicate source note', {
                    noteId: r.internalid,
                    sig
                });
            }
        }

        const existingTarget = buildExistingNoteSignatureSet(invoiceId);

        logDebug('SO→Invoice Notes: de-dupe stats', {
            fetched: rows.length,
            uniqueBySignature: uniqueRows.length,
            existingOnInvoice: existingTarget.size
        });

        let createdCount = 0;

        for (const r of uniqueRows) {
            try {
                const noteTitle = r.title ?? '';
                const body = r.memo ?? '';
                const companyVal =
                    r.company != null &&
                    r.company !== '' &&
                    Number.isFinite(Number(r.company))
                        ? Number(r.company)
                        : null;

                const sig = makeSignature(noteTitle, body, r.notetypeNum, r.directionNum);
                if (existingTarget.has(sig)) {
                    logAudit('SO→Invoice Notes: Skip create (already exists on Invoice)', { sig });
                    continue;
                }

                const prep = {
                    sourceNoteId: r.internalid,
                    noteTitle: noteTitle.slice(0, 120),
                    hasBody: body.length > 0,
                    notetypeNum: r.notetypeNum,
                    directionNum: r.directionNum,
                    company: companyVal
                };
                logDebug('SO→Invoice Notes: Preparing note', prep);

                const n = record.create({ type: record.Type.NOTE });
                n.setValue({ fieldId: 'title', value: noteTitle });
                n.setValue({ fieldId: 'note', value: body });
                if (r.notetypeNum !== null) n.setValue({ fieldId: 'notetype', value: r.notetypeNum });
                if (r.directionNum !== null) n.setValue({ fieldId: 'direction', value: r.directionNum });
                if (companyVal != null) n.setValue({ fieldId: 'company', value: companyVal });
                n.setValue({ fieldId: 'transaction', value: invoiceId });

                const newId = n.save({ enableSourcing: false, ignoreMandatoryFields: true });
                createdCount += 1;

                // Guard against duplicates in the same run
                existingTarget.add(sig);

                logAudit('SO→Invoice Notes: Created note on Invoice', {
                    invoiceId,
                    newNoteId: newId,
                    fromSoNoteId: r.internalid
                });
            } catch (inner) {
                logError('SO→Invoice Notes: Failed to create a note', inner);
            }
        }

        logAudit('SO→Invoice Notes: Copy complete', { invoiceId, soId, createdCount });
    } catch (e) {
        logError('SO→Invoice Notes: Search/loop failure', e);
    }
}

/* --------------------------------- UE ---------------------------------- */

const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx) => {
    try {
        logAudit('SO→Invoice Notes: afterSubmit enter', { type: ctx.type });

        if (ctx.type !== ctx.UserEventType.CREATE) {
            logDebug('SO→Invoice Notes: Skip (not CREATE)', { type: ctx.type });
            return;
        }

        const inv = ctx.newRecord;
        const invoiceId = Number(inv.id) || 0;
        logDebug('SO→Invoice Notes: Invoice ID', { invoiceId });
        if (!invoiceId) {
            logError('SO→Invoice Notes: Missing invoiceId', 'newRecord.id was falsy');
            return;
        }

        const soId = Number(inv.getValue({ fieldId: 'createdfrom' }) || 0);
        logDebug('SO→Invoice Notes: createdfrom (sourceId)', { soId });
        if (!soId) {
            logAudit('SO→Invoice Notes: No createdfrom', 'Standalone invoice, nothing to copy');
            return;
        }

        copySoNotesToInvoice(invoiceId, soId);
    } catch (e) {
        logError('SO→Invoice Notes: afterSubmit failure', e);
    }
};

export = { afterSubmit };

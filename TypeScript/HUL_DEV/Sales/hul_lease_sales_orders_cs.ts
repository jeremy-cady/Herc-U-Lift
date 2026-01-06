/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * Title: Lease Dataset Viewer – Button handlers
 * Version: 1.3
 */

import { EntryPoints } from 'N/types';

export function pageInit(_context: EntryPoints.Client.pageInitContext): void {
    // no-op; required entry point
}

function getHiddenValue(id: string): string {
    const el = document.getElementById(id) as (HTMLInputElement | HTMLTextAreaElement | null);
    return el?.value?.trim() ?? '';
}

export function onDownloadCsv(): void {
    try {
        const href = getHiddenValue('custpage_csv_url');
        if (!href) throw new Error('CSV URL not found on page.');
        window.location.href = href;
    } catch (e: any) {
        alert(`Download failed: ${e?.message ?? String(e)}`);
    }
}

export function onRebuildClick(): void {
    try {
        const href = getHiddenValue('custpage_rebuild_url');
        if (!href) throw new Error('Rebuild URL not found on page.');
        window.location.href = href;
    } catch (e: any) {
        alert(`Rebuild failed: ${e?.message ?? String(e)}`);
    }
}

export default { pageInit, onDownloadCsv, onRebuildClick };
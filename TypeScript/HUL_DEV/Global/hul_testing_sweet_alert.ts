/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * Version: 0.7 (load SweetAlert2 via File Cabinet media URL; verbose diagnostics)
 */
import type { EntryPoints } from 'N/types';

const MEDIA_URL = 'https://6952227.app.netsuite.com/core/media/media.nl?id=7717996&c=6952227&h=c9TCa3iCK--JqE6VSKvsZxYdE5tYTk-nLcIKYxn2-61HWDRj&_xt=.js';
const PATH_FALLBACK = '/SuiteScripts/HUL_DEV/Third_Party_Applications/sweetalert2.all.js';

const TAG_ID = 'hul-swal2-js';
const LOADED_ATTR = 'data-hul-loaded';

function log(...a: unknown[]) {
    try { console.log('[HUL Swal test]', ...a); } catch {}
}

function addScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            if ((window as any).Swal) { log('Swal already defined'); resolve(); return; }

            const existing = document.getElementById(TAG_ID) as HTMLScriptElement | null;
            if (existing) {
                if (existing.getAttribute(LOADED_ATTR) === '1') { log('existing tag already loaded'); resolve(); return; }
                existing.addEventListener('load', () => { log('existing tag load ok'); resolve(); });
                existing.addEventListener('error', (e) => { log('existing tag load error', e); reject(new Error('load error')); });
                return;
            }

            const s = document.createElement('script');
            s.id = TAG_ID;
            s.defer = true;
            s.src = url;
            s.addEventListener('load', () => { s.setAttribute(LOADED_ATTR, '1'); log('loaded', url); resolve(); });
            s.addEventListener('error', (e) => { log('error loading', url, e); reject(new Error('load error')); });
            document.head.appendChild(s);
        } catch (e) {
            reject(e as Error);
        }
    });
}

async function ensureSwal(): Promise<void> {
    const origin = `${window.location.origin}`;
    const candidates = [
        MEDIA_URL,
        `${MEDIA_URL}&_=${Date.now()}`,
        PATH_FALLBACK,
        `${origin}${PATH_FALLBACK}`,
        `${PATH_FALLBACK}?_=${Date.now()}`,
        `${origin}${PATH_FALLBACK}?_=${Date.now()}`
    ];

    for (let i = 0; i < candidates.length; i += 1) {
        const url = candidates[i];
        log('attempt', i + 1, url);
        try {
            await addScript(url);
            if ((window as any).Swal) return;
            log('loaded but Swal missing after', url);
        } catch {
            // try next candidate
        }
    }
    throw new Error('SweetAlert2 load error (all URL attempts failed)');
}

async function showToast(where: string) {
    try {
        await ensureSwal();
        const Swal = (window as any).Swal;
        if (!Swal) { log('Swal still undefined'); return; }
        Swal.fire({
            icon: 'success',
            title: `SweetAlert2 loaded (${where})`,
            text: 'Dynamic script load succeeded.',
            timer: 1400,
            showConfirmButton: false,
            zIndex: 999999
        });
    } catch (e) {
        log('showToast error', String((e as Error)?.message || e));
    }
}

const pageInit = async (_ctx: EntryPoints.Client.pageInitContext) => {
    log('pageInit fired');
    await showToast('pageInit');
};

try {
    window.addEventListener('load', () => { log('window.load'); showToast('window.load'); });
} catch {}

export = { pageInit };

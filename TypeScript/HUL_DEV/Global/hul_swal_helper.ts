/* eslint-disable max-len */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * File: hul_swal_helper.ts
 *
 * Purpose:
 *  - Ensure SweetAlert2 (window.Swal) is available on the page.
 *  - If missing, inject <script src="...sweetalert2.all.js"> once and wait until ready.
 *  - Provide a simple API: ready() and show(options).
 */

declare global {
    interface Window {
        Swal?: any;
        hulSwalLoading?: boolean;
        hulSwalReady?: boolean;
    }
}

export interface SwalOptions {
    // Common SweetAlert2 options (not exhaustive; accepts any extras as well)
    icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
    title?: string;
    html?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    heightAuto?: boolean;
    // Accept any additional SweetAlert2 option without type errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// CHANGE ONLY IF YOUR MEDIA URL CHANGES
const SWAL_MEDIA_URL = 'https://6952227.app.netsuite.com/core/media/media.nl?id=7717996&c=6952227&h=c9TCa3iCK--JqE6VSKvsZxYdE5tYTk-nLcIKYxn2-61HWDRj&_xt=.js';

function waitFor(predicate: () => boolean, timeoutMs = 10000, intervalMs = 100): Promise<boolean> {
    return new Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
            try {
                if (predicate()) { resolve(true); return; }
            } catch (_e) { /* ignore */ }
            if (Date.now() - start >= timeoutMs) { resolve(false); return; }
            setTimeout(tick, intervalMs);
        };
        tick();
    });
}

function injectScriptOnce(src: string): Promise<void> {
    return new Promise((resolve) => {
        try {
            const head = document.getElementsByTagName('head')[0] || document.documentElement;
            // If a matching script tag is already present, don’t add another.
            const existing = head.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
            if (existing) { resolve(); return; }

            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => resolve(); // resolve even on error to avoid blocking callers
            head.appendChild(s);
        } catch (_e) {
            resolve();
        }
    });
}

/** Ensure SweetAlert2 is available on the page. */
export async function ready(): Promise<void> {
    if (typeof window !== 'undefined' && window.Swal) { window.hulSwalReady = true; return; }
    if (window.hulSwalReady) { return; }

    if (!window.hulSwalLoading) {
        window.hulSwalLoading = true;
        await injectScriptOnce(SWAL_MEDIA_URL);
    }

    // Wait until window.Swal appears (up to 10s)
    const ok = await waitFor(() => typeof window !== 'undefined' && !!window.Swal, 10000, 100);
    window.hulSwalReady = ok;
}

/** Show a SweetAlert2 modal (ensures library is loaded first). */
export async function show(options: SwalOptions): Promise<void> {
    try {
        await ready();
        if (window.Swal && typeof window.Swal.fire === 'function') {
            window.Swal.fire(options);
        }
    } catch (_e) {
        // no-op: don’t throw from UI helper
    }
}

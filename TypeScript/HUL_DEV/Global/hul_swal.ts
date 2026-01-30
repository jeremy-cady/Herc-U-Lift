/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 *
 * File: hul_swal.ts
 * Purpose:
 *  - Single-file SweetAlert2 helper for NetSuite Client Scripts.
 *  - Lazily loads SweetAlert2 (from File Cabinet Media URL) exactly once.
 *  - Provides generic APIs: setSrc(), ready()/ensureSwal(), preload(), isReady(),
 *    show(), alert(), confirm(), toast().
 *  - Provides business wrappers:
 *      - doNotInvoiceDummyItemSwalMessage()
 *      - partsIsEligibleSwalMessage(altPartName?)
 *      - customerCreditCardRequiredMessage()
 *      - rollupRevenueStreamSelectedMessage()
 *
 * Notes:
 *  - Keep this SuiteScript JSDoc header at the very top (no BOM/whitespace).
 *  - Compatible with SweetAlert2 v11+ (filters unsupported options like zIndex).
 */

type SwalLike = {
    fire: (options: Record<string, any>) => Promise<any>;
    [key: string]: any;
};

declare global {
    interface Window {
        Swal?: SwalLike;
    }
}

export interface SwalOptions {
    icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
    title?: string;
    html?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    allowOutsideClick?: boolean | (() => boolean);
    allowEscapeKey?: boolean | (() => boolean);
    heightAuto?: boolean;
    toast?: boolean;
    position?:
        | 'top'
        | 'top-start'
        | 'top-end'
        | 'center'
        | 'center-start'
        | 'center-end'
        | 'bottom'
        | 'bottom-start'
        | 'bottom-end';
    timer?: number;
    timerProgressBar?: boolean;
    zIndex?: number;
    [key: string]: any;
}

/* ===== Loader configuration ===== */

let SWAL_MEDIA_URL = 'https://6952227-sb1.app.netsuite.com/core/media/media.nl?id=7919729&c=6952227_SB1&h=8nOt774yeFRJO4DUBrE2qo3LNJym_dEj8hOvZf0654AK1vg_&_xt=.js';

const PATH_FALLBACK = '/SuiteScripts/HUL_DEV/Third_Party_Applications/sweetalert2.all.min.js';
const TAG_ID = 'hul-swal2-js';
const LOADED_ATTR = 'data-hul-loaded';

/** Optional: switch the SweetAlert2 source at runtime (e.g., SB vs PROD). */
export function setSrc(url: string): void {
    SWAL_MEDIA_URL = url;
}

/* ===== Internal utils ===== */

function log(...a: unknown[]): void {
    try {
        // eslint-disable-next-line no-console
        console.log('[HUL Swal]', ...a);
    } catch {
        /* no-op */
    }
}

/**
 * Create/update a single <style> that forces the container to the desired z-index.
 * SA2 v11 has no zIndex option, so we control stacking via CSS.
 */
function ensureTopmostStyle(z?: number): void {
    try {
        const id = 'hul-swal2-topmost';
        let el = document.getElementById(id) as HTMLStyleElement | null;
        if (!el) {
            el = document.createElement('style');
            el.id = id;
            (document.head || document.documentElement).appendChild(el);
        }
        const zval = typeof z === 'number' ? z : 999_999;
        el.textContent = `.swal2-container{z-index:${zval} !important}`;
    } catch {
        /* no-op */
    }
}

/**
 * Load Roboto font and apply it to SweetAlert
 */
function ensureCustomFonts(): void {
    try {
        const id = 'hul-swal2-custom-fonts';
        let linkEl = document.getElementById(id) as HTMLLinkElement | null;

        if (!linkEl) {
            linkEl = document.createElement('link');
            linkEl.id = id;
            linkEl.rel = 'stylesheet';
            linkEl.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
            (document.head || document.documentElement).appendChild(linkEl);
        }

        const styleId = 'hul-swal2-font-styles';
        let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            (document.head || document.documentElement).appendChild(styleEl);
        }

        // Aggressive CSS with higher specificity to override defaults
        styleEl.textContent = `
            .swal2-popup,
            .swal2-popup * {
                font-family: 'Roboto', Arial, sans-serif !important;
            }
            .swal2-title,
            .swal2-title * {
                font-family: 'Roboto', Arial, sans-serif !important;
                font-weight: 500 !important;
            }
            .swal2-html-container,
            .swal2-html-container * {
                font-family: 'Roboto', Arial, sans-serif !important;
            }
            .swal2-confirm,
            .swal2-cancel,
            button.swal2-confirm,
            button.swal2-cancel {
                font-family: 'Roboto', Arial, sans-serif !important;
                font-weight: 500 !important;
            }
            div.swal2-popup {
                font-family: 'Roboto', Arial, sans-serif !important;
            }
        `;
    } catch (e) {
        log('ensureCustomFonts failed:', String((e as Error)?.message || e));
    }
}

function addScriptOnce(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            // If already present via global, we're done.
            if (window.Swal) {
                resolve();
                return;
            }

            const existing = document.getElementById(TAG_ID) as HTMLScriptElement | null;
            if (existing) {
                // If it already finished loading, resolve; otherwise hook events.
                if (existing.getAttribute(LOADED_ATTR) === '1') {
                    resolve();
                    return;
                }
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', () =>
                    reject(new Error('SweetAlert2 load error (existing)'))
                );
                return;
            }

            const s = document.createElement('script');
            s.id = TAG_ID;
            s.async = true;
            s.defer = true;
            s.src = url;
            s.addEventListener('load', () => {
                s.setAttribute(LOADED_ATTR, '1');
                resolve();
            });
            s.addEventListener('error', () =>
                reject(new Error('SweetAlert2 load error'))
            );
            (document.head || document.documentElement).appendChild(s);
        } catch (e) {
            reject(e as Error);
        }
    });
}

/** Ensure SweetAlert2 is available (idempotent). */
export async function ready(): Promise<void> {
    if (window.Swal) {
        ensureTopmostStyle();
        ensureCustomFonts();
        return;
    }

    const origin = window.location.origin;
    const candidates = [
        SWAL_MEDIA_URL,
        `${SWAL_MEDIA_URL}&_=${Date.now()}`,
        PATH_FALLBACK,
        `${origin}${PATH_FALLBACK}`,
        `${PATH_FALLBACK}?_=${Date.now()}`,
        `${origin}${PATH_FALLBACK}?_=${Date.now()}`
    ];

    for (let i = 0; i < candidates.length; i += 1) {
        try {
            await addScriptOnce(candidates[i]);
            if (window.Swal) {
                ensureTopmostStyle();
                ensureCustomFonts();
                return;
            }
        } catch {
            // try the next candidate
        }
    }

    throw new Error('SweetAlert2 could not be loaded');
}

/** Alias for back-compat with older callers. */
export const ensureSwal = ready;

/** Fire-and-forget preload (call in pageInit). */
export function preload(): void {
    void ready().catch((e) =>
        log('preload failed:', String((e as Error)?.message || e))
    );
}

export function isReady(): boolean {
    return !!window.Swal;
}

/* ===== Generic API (preferred for new code) ===== */

export async function show(options: SwalOptions): Promise<any | null> {
    try {
        await ready();
        if (window.Swal && typeof window.Swal.fire === 'function') {
            const { zIndex, ...rest } = options || {};
            if (typeof zIndex === 'number') ensureTopmostStyle(zIndex);

            const merged = {
                heightAuto: false,
                allowOutsideClick: false,
                allowEscapeKey: true,
                ...rest
            };

            return await window.Swal.fire(merged);
        }
    } catch (e) {
        log('show() failed:', String((e as Error)?.message || e));
    }

    if (options?.title || options?.text) {
        alert(String(options.title ?? options.text));
    }
    return null;
}

export async function alert(input: string | SwalOptions): Promise<void> {
    const opts: SwalOptions =
        typeof input === 'string'
            ? { icon: 'info', text: input, confirmButtonText: 'OK' }
            : input;
    await show(opts);
}

export async function confirm(
    options: SwalOptions & {
        confirmButtonText?: string;
        cancelButtonText?: string;
    } = {}
): Promise<boolean> {
    const res = await show({
        icon: options.icon ?? 'question',
        showCancelButton: true,
        confirmButtonText: options.confirmButtonText ?? 'OK',
        cancelButtonText: options.cancelButtonText ?? 'Cancel',
        focusCancel: true,
        reverseButtons: true,
        ...options
    });
    return !!(res && res.isConfirmed);
}

/** Lightweight toast-style notification. */
export async function toast(
    message: string,
    opts: Partial<SwalOptions> = {}
): Promise<void> {
    await show({
        toast: true,
        position: opts.position ?? 'top-end',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: typeof opts.timer === 'number' ? opts.timer : 2000,
        icon: opts.icon ?? 'success',
        title: message,
        ...opts
    });
}

/* ===== Business-specific wrappers (void return for drop-in use) ===== */

export function doNotInvoiceDummyItemSwalMessage(): void {
    void show({
        icon: 'warning',
        title: 'BOGUS Item Cannot Be Invoiced',
        html:
            'Bogus Item is an invalid item and must be removed before invoicing. ' +
            'Please see Parts to have removed.',
        confirmButtonText: 'OK'
    });
}

export function partsIsEligibleSwalMessage(altPartName?: string): void {
    const htmlMessage = altPartName
        ? `Item is not eligible for sale.<br>Please add the following part instead:<br><span style="color:red">${altPartName}</span>`
        : 'Item is not eligible for sale.<br>Check User Notes On Item Record';

    void show({
        icon: 'warning',
        title: 'Not Eligible For Resale',
        html: htmlMessage,
        confirmButtonText: 'OK'
    });
}

export function customerCreditCardRequiredMessage(): void {
    void show({
        icon: 'warning',
        title: 'Credit Card Required',
        html:
            'This Customer does not have a Credit Card on file. Their purchasing terms require that a ' +
            'Credit Card be on file. Please add a Payment Card before continuing.',
        confirmButtonText: 'OK'
    });
}

/** NEW: Revenue Stream rollup warning (warning-only, stateless) */
export function rollupRevenueStreamSelectedMessage(): void {
    void show({
        icon: 'warning',
        title: 'Rollup Revenue Stream Selected',
        html:
            'A rollup Revenue Stream was selected.<br>' +
            'Please select a child Revenue Stream to continue.',
        confirmButtonText: 'OK'
    });
}
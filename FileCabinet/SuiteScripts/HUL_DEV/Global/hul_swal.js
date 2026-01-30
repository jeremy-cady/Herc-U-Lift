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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rollupRevenueStreamSelectedMessage = exports.customerCreditCardRequiredMessage = exports.partsIsEligibleSwalMessage = exports.doNotInvoiceDummyItemSwalMessage = exports.toast = exports.confirm = exports.alert = exports.show = exports.isReady = exports.preload = exports.ensureSwal = exports.ready = exports.setSrc = void 0;
    /* ===== Loader configuration ===== */
    var SWAL_MEDIA_URL = 'https://6952227-sb1.app.netsuite.com/core/media/media.nl?id=7919729&c=6952227_SB1&h=8nOt774yeFRJO4DUBrE2qo3LNJym_dEj8hOvZf0654AK1vg_&_xt=.js';
    var PATH_FALLBACK = '/SuiteScripts/HUL_DEV/Third_Party_Applications/sweetalert2.all.min.js';
    var TAG_ID = 'hul-swal2-js';
    var LOADED_ATTR = 'data-hul-loaded';
    /** Optional: switch the SweetAlert2 source at runtime (e.g., SB vs PROD). */
    function setSrc(url) {
        SWAL_MEDIA_URL = url;
    }
    exports.setSrc = setSrc;
    /* ===== Internal utils ===== */
    function log() {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        try {
            // eslint-disable-next-line no-console
            console.log.apply(console, __spreadArray(['[HUL Swal]'], a, false));
        }
        catch (_a) {
            /* no-op */
        }
    }
    /**
     * Create/update a single <style> that forces the container to the desired z-index.
     * SA2 v11 has no zIndex option, so we control stacking via CSS.
     */
    function ensureTopmostStyle(z) {
        try {
            var id = 'hul-swal2-topmost';
            var el = document.getElementById(id);
            if (!el) {
                el = document.createElement('style');
                el.id = id;
                (document.head || document.documentElement).appendChild(el);
            }
            var zval = typeof z === 'number' ? z : 999999;
            el.textContent = ".swal2-container{z-index:".concat(zval, " !important}");
        }
        catch (_a) {
            /* no-op */
        }
    }
    /**
     * Load Roboto font and apply it to SweetAlert
     */
    function ensureCustomFonts() {
        try {
            var id = 'hul-swal2-custom-fonts';
            var linkEl = document.getElementById(id);
            if (!linkEl) {
                linkEl = document.createElement('link');
                linkEl.id = id;
                linkEl.rel = 'stylesheet';
                linkEl.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
                (document.head || document.documentElement).appendChild(linkEl);
            }
            var styleId = 'hul-swal2-font-styles';
            var styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                (document.head || document.documentElement).appendChild(styleEl);
            }
            // Aggressive CSS with higher specificity to override defaults
            styleEl.textContent = "\n            .swal2-popup,\n            .swal2-popup * {\n                font-family: 'Roboto', Arial, sans-serif !important;\n            }\n            .swal2-title,\n            .swal2-title * {\n                font-family: 'Roboto', Arial, sans-serif !important;\n                font-weight: 500 !important;\n            }\n            .swal2-html-container,\n            .swal2-html-container * {\n                font-family: 'Roboto', Arial, sans-serif !important;\n            }\n            .swal2-confirm,\n            .swal2-cancel,\n            button.swal2-confirm,\n            button.swal2-cancel {\n                font-family: 'Roboto', Arial, sans-serif !important;\n                font-weight: 500 !important;\n            }\n            div.swal2-popup {\n                font-family: 'Roboto', Arial, sans-serif !important;\n            }\n        ";
        }
        catch (e) {
            log('ensureCustomFonts failed:', String((e === null || e === void 0 ? void 0 : e.message) || e));
        }
    }
    function addScriptOnce(url) {
        return new Promise(function (resolve, reject) {
            try {
                // If already present via global, we're done.
                if (window.Swal) {
                    resolve();
                    return;
                }
                var existing = document.getElementById(TAG_ID);
                if (existing) {
                    // If it already finished loading, resolve; otherwise hook events.
                    if (existing.getAttribute(LOADED_ATTR) === '1') {
                        resolve();
                        return;
                    }
                    existing.addEventListener('load', function () { return resolve(); });
                    existing.addEventListener('error', function () {
                        return reject(new Error('SweetAlert2 load error (existing)'));
                    });
                    return;
                }
                var s_1 = document.createElement('script');
                s_1.id = TAG_ID;
                s_1.async = true;
                s_1.defer = true;
                s_1.src = url;
                s_1.addEventListener('load', function () {
                    s_1.setAttribute(LOADED_ATTR, '1');
                    resolve();
                });
                s_1.addEventListener('error', function () {
                    return reject(new Error('SweetAlert2 load error'));
                });
                (document.head || document.documentElement).appendChild(s_1);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /** Ensure SweetAlert2 is available (idempotent). */
    function ready() {
        return __awaiter(this, void 0, void 0, function () {
            var origin, candidates, i, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (window.Swal) {
                            ensureTopmostStyle();
                            ensureCustomFonts();
                            return [2 /*return*/];
                        }
                        origin = window.location.origin;
                        candidates = [
                            SWAL_MEDIA_URL,
                            "".concat(SWAL_MEDIA_URL, "&_=").concat(Date.now()),
                            PATH_FALLBACK,
                            "".concat(origin).concat(PATH_FALLBACK),
                            "".concat(PATH_FALLBACK, "?_=").concat(Date.now()),
                            "".concat(origin).concat(PATH_FALLBACK, "?_=").concat(Date.now())
                        ];
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < candidates.length)) return [3 /*break*/, 6];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, addScriptOnce(candidates[i])];
                    case 3:
                        _b.sent();
                        if (window.Swal) {
                            ensureTopmostStyle();
                            ensureCustomFonts();
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        i += 1;
                        return [3 /*break*/, 1];
                    case 6: throw new Error('SweetAlert2 could not be loaded');
                }
            });
        });
    }
    exports.ready = ready;
    /** Alias for back-compat with older callers. */
    exports.ensureSwal = ready;
    /** Fire-and-forget preload (call in pageInit). */
    function preload() {
        void ready().catch(function (e) {
            return log('preload failed:', String((e === null || e === void 0 ? void 0 : e.message) || e));
        });
    }
    exports.preload = preload;
    function isReady() {
        return !!window.Swal;
    }
    exports.isReady = isReady;
    /* ===== Generic API (preferred for new code) ===== */
    function show(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, zIndex, rest, merged, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, ready()];
                    case 1:
                        _c.sent();
                        if (!(window.Swal && typeof window.Swal.fire === 'function')) return [3 /*break*/, 3];
                        _b = options || {}, zIndex = _b.zIndex, rest = __rest(_b, ["zIndex"]);
                        if (typeof zIndex === 'number')
                            ensureTopmostStyle(zIndex);
                        merged = __assign({ heightAuto: false, allowOutsideClick: false, allowEscapeKey: true }, rest);
                        return [4 /*yield*/, window.Swal.fire(merged)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_1 = _c.sent();
                        log('show() failed:', String((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1));
                        return [3 /*break*/, 5];
                    case 5:
                        if ((options === null || options === void 0 ? void 0 : options.title) || (options === null || options === void 0 ? void 0 : options.text)) {
                            alert(String((_a = options.title) !== null && _a !== void 0 ? _a : options.text));
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    }
    exports.show = show;
    function alert(input) {
        return __awaiter(this, void 0, void 0, function () {
            var opts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opts = typeof input === 'string'
                            ? { icon: 'info', text: input, confirmButtonText: 'OK' }
                            : input;
                        return [4 /*yield*/, show(opts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.alert = alert;
    function confirm(options) {
        var _a, _b, _c;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, show(__assign({ icon: (_a = options.icon) !== null && _a !== void 0 ? _a : 'question', showCancelButton: true, confirmButtonText: (_b = options.confirmButtonText) !== null && _b !== void 0 ? _b : 'OK', cancelButtonText: (_c = options.cancelButtonText) !== null && _c !== void 0 ? _c : 'Cancel', focusCancel: true, reverseButtons: true }, options))];
                    case 1:
                        res = _d.sent();
                        return [2 /*return*/, !!(res && res.isConfirmed)];
                }
            });
        });
    }
    exports.confirm = confirm;
    /** Lightweight toast-style notification. */
    function toast(message, opts) {
        var _a, _b;
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, show(__assign({ toast: true, position: (_a = opts.position) !== null && _a !== void 0 ? _a : 'top-end', showConfirmButton: false, timerProgressBar: true, timer: typeof opts.timer === 'number' ? opts.timer : 2000, icon: (_b = opts.icon) !== null && _b !== void 0 ? _b : 'success', title: message }, opts))];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.toast = toast;
    /* ===== Business-specific wrappers (void return for drop-in use) ===== */
    function doNotInvoiceDummyItemSwalMessage() {
        void show({
            icon: 'warning',
            title: 'BOGUS Item Cannot Be Invoiced',
            html: 'Bogus Item is an invalid item and must be removed before invoicing. ' +
                'Please see Parts to have removed.',
            confirmButtonText: 'OK'
        });
    }
    exports.doNotInvoiceDummyItemSwalMessage = doNotInvoiceDummyItemSwalMessage;
    function partsIsEligibleSwalMessage(altPartName) {
        var htmlMessage = altPartName
            ? "Item is not eligible for sale.<br>Please add the following part instead:<br><span style=\"color:red\">".concat(altPartName, "</span>")
            : 'Item is not eligible for sale.<br>Check User Notes On Item Record';
        void show({
            icon: 'warning',
            title: 'Not Eligible For Resale',
            html: htmlMessage,
            confirmButtonText: 'OK'
        });
    }
    exports.partsIsEligibleSwalMessage = partsIsEligibleSwalMessage;
    function customerCreditCardRequiredMessage() {
        void show({
            icon: 'warning',
            title: 'Credit Card Required',
            html: 'This Customer does not have a Credit Card on file. Their purchasing terms require that a ' +
                'Credit Card be on file. Please add a Payment Card before continuing.',
            confirmButtonText: 'OK'
        });
    }
    exports.customerCreditCardRequiredMessage = customerCreditCardRequiredMessage;
    /** NEW: Revenue Stream rollup warning (warning-only, stateless) */
    function rollupRevenueStreamSelectedMessage() {
        void show({
            icon: 'warning',
            title: 'Rollup Revenue Stream Selected',
            html: 'A rollup Revenue Stream was selected.<br>' +
                'Please select a child Revenue Stream to continue.',
            confirmButtonText: 'OK'
        });
    }
    exports.rollupRevenueStreamSelectedMessage = rollupRevenueStreamSelectedMessage;
});

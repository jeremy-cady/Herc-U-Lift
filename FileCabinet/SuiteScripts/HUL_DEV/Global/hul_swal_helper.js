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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.show = exports.ready = void 0;
    // CHANGE ONLY IF YOUR MEDIA URL CHANGES
    var SWAL_MEDIA_URL = 'https://6952227.app.netsuite.com/core/media/media.nl?id=7717996&c=6952227&h=c9TCa3iCK--JqE6VSKvsZxYdE5tYTk-nLcIKYxn2-61HWDRj&_xt=.js';
    function waitFor(predicate, timeoutMs, intervalMs) {
        if (timeoutMs === void 0) { timeoutMs = 10000; }
        if (intervalMs === void 0) { intervalMs = 100; }
        return new Promise(function (resolve) {
            var start = Date.now();
            var tick = function () {
                try {
                    if (predicate()) {
                        resolve(true);
                        return;
                    }
                }
                catch (_e) { /* ignore */ }
                if (Date.now() - start >= timeoutMs) {
                    resolve(false);
                    return;
                }
                setTimeout(tick, intervalMs);
            };
            tick();
        });
    }
    function injectScriptOnce(src) {
        return new Promise(function (resolve) {
            try {
                var head = document.getElementsByTagName('head')[0] || document.documentElement;
                // If a matching script tag is already present, don’t add another.
                var existing = head.querySelector("script[src=\"".concat(src, "\"]"));
                if (existing) {
                    resolve();
                    return;
                }
                var s = document.createElement('script');
                s.src = src;
                s.async = true;
                s.onload = function () { return resolve(); };
                s.onerror = function () { return resolve(); }; // resolve even on error to avoid blocking callers
                head.appendChild(s);
            }
            catch (_e) {
                resolve();
            }
        });
    }
    /** Ensure SweetAlert2 is available on the page. */
    function ready() {
        return __awaiter(this, void 0, void 0, function () {
            var ok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof window !== 'undefined' && window.Swal) {
                            window.hulSwalReady = true;
                            return [2 /*return*/];
                        }
                        if (window.hulSwalReady) {
                            return [2 /*return*/];
                        }
                        if (!!window.hulSwalLoading) return [3 /*break*/, 2];
                        window.hulSwalLoading = true;
                        return [4 /*yield*/, injectScriptOnce(SWAL_MEDIA_URL)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, waitFor(function () { return typeof window !== 'undefined' && !!window.Swal; }, 10000, 100)];
                    case 3:
                        ok = _a.sent();
                        window.hulSwalReady = ok;
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.ready = ready;
    /** Show a SweetAlert2 modal (ensures library is loaded first). */
    function show(options) {
        return __awaiter(this, void 0, void 0, function () {
            var _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ready()];
                    case 1:
                        _a.sent();
                        if (window.Swal && typeof window.Swal.fire === 'function') {
                            window.Swal.fire(options);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    exports.show = show;
});

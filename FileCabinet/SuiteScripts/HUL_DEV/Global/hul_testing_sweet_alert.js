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
    var MEDIA_URL = 'https://6952227.app.netsuite.com/core/media/media.nl?id=7717996&c=6952227&h=c9TCa3iCK--JqE6VSKvsZxYdE5tYTk-nLcIKYxn2-61HWDRj&_xt=.js';
    var PATH_FALLBACK = '/SuiteScripts/HUL_DEV/Third_Party_Applications/sweetalert2.all.js';
    var TAG_ID = 'hul-swal2-js';
    var LOADED_ATTR = 'data-hul-loaded';
    function log() {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        try {
            console.log.apply(console, __spreadArray(['[HUL Swal test]'], a, false));
        }
        catch (_a) { }
    }
    function addScript(url) {
        return new Promise(function (resolve, reject) {
            try {
                if (window.Swal) {
                    log('Swal already defined');
                    resolve();
                    return;
                }
                var existing = document.getElementById(TAG_ID);
                if (existing) {
                    if (existing.getAttribute(LOADED_ATTR) === '1') {
                        log('existing tag already loaded');
                        resolve();
                        return;
                    }
                    existing.addEventListener('load', function () { log('existing tag load ok'); resolve(); });
                    existing.addEventListener('error', function (e) { log('existing tag load error', e); reject(new Error('load error')); });
                    return;
                }
                var s_1 = document.createElement('script');
                s_1.id = TAG_ID;
                s_1.defer = true;
                s_1.src = url;
                s_1.addEventListener('load', function () { s_1.setAttribute(LOADED_ATTR, '1'); log('loaded', url); resolve(); });
                s_1.addEventListener('error', function (e) { log('error loading', url, e); reject(new Error('load error')); });
                document.head.appendChild(s_1);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    function ensureSwal() {
        return __awaiter(this, void 0, void 0, function () {
            var origin, candidates, i, url, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        origin = "".concat(window.location.origin);
                        candidates = [
                            MEDIA_URL,
                            "".concat(MEDIA_URL, "&_=").concat(Date.now()),
                            PATH_FALLBACK,
                            "".concat(origin).concat(PATH_FALLBACK),
                            "".concat(PATH_FALLBACK, "?_=").concat(Date.now()),
                            "".concat(origin).concat(PATH_FALLBACK, "?_=").concat(Date.now())
                        ];
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < candidates.length)) return [3 /*break*/, 6];
                        url = candidates[i];
                        log('attempt', i + 1, url);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, addScript(url)];
                    case 3:
                        _b.sent();
                        if (window.Swal)
                            return [2 /*return*/];
                        log('loaded but Swal missing after', url);
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        i += 1;
                        return [3 /*break*/, 1];
                    case 6: throw new Error('SweetAlert2 load error (all URL attempts failed)');
                }
            });
        });
    }
    function showToast(where) {
        return __awaiter(this, void 0, void 0, function () {
            var Swal, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ensureSwal()];
                    case 1:
                        _a.sent();
                        Swal = window.Swal;
                        if (!Swal) {
                            log('Swal still undefined');
                            return [2 /*return*/];
                        }
                        Swal.fire({
                            icon: 'success',
                            title: "SweetAlert2 loaded (".concat(where, ")"),
                            text: 'Dynamic script load succeeded.',
                            timer: 1400,
                            showConfirmButton: false,
                            zIndex: 999999
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        log('showToast error', String((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    var pageInit = function (_ctx) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('pageInit fired');
                    return [4 /*yield*/, showToast('pageInit')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    try {
        window.addEventListener('load', function () { log('window.load'); showToast('window.load'); });
    }
    catch (_a) { }
    return { pageInit: pageInit };
});

/**
 * test_library
 * @NApiVersion 2.x
 */
define(["require", "exports", "N/ui/dialog"], function (require, exports, dialog) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sayTheThing = function () {
        dialog.alert({
            title: 'HOLY CRAP IT WORKED',
            message: 'I can\'t believe this actually worked'
        });
        return sayTheThing;
    };
});

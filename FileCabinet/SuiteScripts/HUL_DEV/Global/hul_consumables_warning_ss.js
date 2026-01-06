/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/06/2024
* Version: 1.0
*/
define(["require", "exports", "N/search", "N/email", "N/log"], function (require, exports, search, email, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execute = void 0;
    function execute(context) {
        var TARGET_COUNT = 20; // Define target count
        var CONSUMABLES_CLOSED_TASKS_WO_SO_UPLOAD = 'customsearch1833'; // Replace with your Saved Search ID
        var CONSUMABLES_CLOSED_TASKS_WO_SO_TODAY = 'customsearch1865'; // Replace with your Saved Search ID
        var EMAIL_MEGAN = 'mrinsem@herculift.com'; // Megan Email
        var EMAIL_TOM = 'tshowalterjr@herculift.com'; // Tom Email
        var EMAIL_JEREMY = 'jcady@herculift.com'; // Jeremy email
        var EMAIL_BETH = 'bherder@herculift.com'; // Beth Email
        var EMAIL_SENDER = 2363377; // Jeremy Employee ID
        try {
            // Load Search 1
            var mySearch = search.load({ id: CONSUMABLES_CLOSED_TASKS_WO_SO_UPLOAD });
            // Run Search 1
            var resultSet = mySearch.runPaged();
            // Get result count for use in conditional
            var resultCount = resultSet.count;
            log.debug('Search Result Count', resultCount);
            // conditional code block to check if result count is greater than or equal to target count
            // If result count is greater than or equal to target count, send email
            if (resultCount === TARGET_COUNT || resultCount > TARGET_COUNT) {
                email.send({
                    author: EMAIL_SENDER,
                    recipients: "".concat(EMAIL_MEGAN, ", ").concat(EMAIL_TOM, ", ").concat(EMAIL_JEREMY, ", ").concat(EMAIL_BETH),
                    // eslint-disable-next-line max-len
                    subject: "Alert: Saved Search \"SNA - Consumables Closed Tasks without SO (Upload)\" is now at ".concat(resultCount, " results"),
                    // eslint-disable-next-line max-len
                    body: "The saved search \"SNA - Consumables Closed Tasks without SO (Upload)\" now has exactly ".concat(resultCount, " results. Please review.")
                });
                log.audit('Email Sent', "Email sent because count surpassed ".concat(TARGET_COUNT));
            }
            // Load Search 2
            var mySearch02 = search.load({ id: CONSUMABLES_CLOSED_TASKS_WO_SO_TODAY });
            // Run Search 2
            var resultSet02 = mySearch02.runPaged();
            // Get result count for use in conditional
            var resultCount02 = resultSet02.count;
            log.debug('Search Result Count', resultCount);
            // conditional code block to check if result count is greater than or equal to target count
            // If result count is greater than or equal to target count, send email
            if (resultCount02 === TARGET_COUNT || resultCount02 > TARGET_COUNT) {
                email.send({
                    author: EMAIL_SENDER,
                    recipients: "".concat(EMAIL_MEGAN, ", ").concat(EMAIL_TOM, ", ").concat(EMAIL_JEREMY, ", ").concat(EMAIL_BETH),
                    // eslint-disable-next-line max-len
                    subject: "Alert: Saved Search \"SNA - Consumable Closed Tasks without SO Today\" is now at ".concat(resultCount02, " results"),
                    // eslint-disable-next-line max-len
                    body: "The saved search \"SNA - Consumable Closed Tasks without SO Today\" now has exactly ".concat(resultCount02, " results. Please review.")
                });
                log.audit('Email Sent', "Email sent because count surpassed ".concat(TARGET_COUNT));
            }
        }
        catch (e) {
            log.error('Error in Scheduled Script', e.toString());
        }
    }
    exports.execute = execute;
});

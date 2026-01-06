define(["require", "exports", "N/search", "N/email", "N/log"], function (require, exports, search, email, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execute = void 0;
    function execute(context) {
        var TARGET_COUNT = 20; // Define target count
        var CONSUMABLES_CLOSED_TASKS_WO_SO_UPLOAD = 'customsearch1833'; // Replace with your Saved Search ID
        var CONSUMABLES_CLOSED_TASKS_WO_SO_TODAY = 'customsearch1865'; // Replace with your Saved Search ID
        var EMAIL_MEGAN = 'mrinsem@herculift.com@example.com'; // Megan Email
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
                    subject: "Alert: Saved Search ".concat(CONSUMABLES_CLOSED_TASKS_WO_SO_UPLOAD, " has reached ").concat(TARGET_COUNT, " results"),
                    body: "The saved search \"".concat(mySearch.title, "\" now has exactly ").concat(TARGET_COUNT, " results. Please review.")
                });
                log.audit('Email Sent', "Email sent because count reached ".concat(TARGET_COUNT));
            }
            // Load Search 2
            var mySearch02 = search.load({ id: CONSUMABLES_CLOSED_TASKS_WO_SO_TODAY });
            // Run Search 2
            var resultSet02 = mySearch.runPaged();
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
                    subject: "Alert: Saved Search ".concat(CONSUMABLES_CLOSED_TASKS_WO_SO_TODAY, " has reached ").concat(TARGET_COUNT, " results"),
                    body: "The saved search \"".concat(mySearch02.title, "\" now has exactly ").concat(TARGET_COUNT, " results. Please review.")
                });
                log.audit('Email Sent', "Email sent because count reached ".concat(TARGET_COUNT));
            }
        }
        catch (e) {
            log.error('Error in Scheduled Script', e.toString());
        }
    }
    exports.execute = execute;
});

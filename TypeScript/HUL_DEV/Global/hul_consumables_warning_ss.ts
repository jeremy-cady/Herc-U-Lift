/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/06/2024
* Version: 1.0
*/

import * as search from 'N/search';
import * as email from 'N/email';
import * as log from 'N/log';

export function execute(context: any): void {
    const TARGET_COUNT = 20; // Define target count
    const CONSUMABLES_CLOSED_TASKS_WO_SO_UPLOAD = 'customsearch1833'; // Replace with your Saved Search ID
    const CONSUMABLES_CLOSED_TASKS_WO_SO_TODAY = 'customsearch1865'; // Replace with your Saved Search ID
    const EMAIL_MEGAN = 'mrinsem@herculift.com'; // Megan Email
    const EMAIL_TOM = 'tshowalterjr@herculift.com'; // Tom Email
    const EMAIL_JEREMY = 'jcady@herculift.com'; // Jeremy email
    const EMAIL_BETH = 'bherder@herculift.com'; // Beth Email
    const EMAIL_SENDER = 2363377; // Jeremy Employee ID

    try {
        // Load Search 1
        const mySearch = search.load({ id: CONSUMABLES_CLOSED_TASKS_WO_SO_UPLOAD });
        // Run Search 1
        const resultSet = mySearch.runPaged();
        // Get result count for use in conditional
        const resultCount = resultSet.count;

        log.debug('Search Result Count', resultCount);

        // conditional code block to check if result count is greater than or equal to target count
        // If result count is greater than or equal to target count, send email
        if (resultCount === TARGET_COUNT || resultCount > TARGET_COUNT) {
            email.send({
                author: EMAIL_SENDER,
                recipients: `${EMAIL_MEGAN}, ${EMAIL_TOM}, ${EMAIL_JEREMY}, ${EMAIL_BETH}`,
                // eslint-disable-next-line max-len
                subject: `Alert: Saved Search "SNA - Consumables Closed Tasks without SO (Upload)" is now at ${resultCount} results`,
                // eslint-disable-next-line max-len
                body: `The saved search "SNA - Consumables Closed Tasks without SO (Upload)" now has exactly ${resultCount} results. Please review.`
            });
            log.audit('Email Sent', `Email sent because count surpassed ${TARGET_COUNT}`);
        }
        // Load Search 2
        const mySearch02 = search.load({ id: CONSUMABLES_CLOSED_TASKS_WO_SO_TODAY });
        // Run Search 2
        const resultSet02 = mySearch02.runPaged();
        // Get result count for use in conditional
        const resultCount02 = resultSet02.count;

        log.debug('Search Result Count', resultCount);

        // conditional code block to check if result count is greater than or equal to target count
        // If result count is greater than or equal to target count, send email
        if (resultCount02 === TARGET_COUNT || resultCount02 > TARGET_COUNT) {
            email.send({
                author: EMAIL_SENDER,
                recipients: `${EMAIL_MEGAN}, ${EMAIL_TOM}, ${EMAIL_JEREMY}, ${EMAIL_BETH}`,
                // eslint-disable-next-line max-len
                subject: `Alert: Saved Search "SNA - Consumable Closed Tasks without SO Today" is now at ${resultCount02} results`,
                // eslint-disable-next-line max-len
                body: `The saved search "SNA - Consumable Closed Tasks without SO Today" now has exactly ${resultCount02} results. Please review.`
            });
            log.audit('Email Sent', `Email sent because count surpassed ${TARGET_COUNT}`);
        }

    } catch (e: any) {
        log.error('Error in Scheduled Script', e.toString());
    }
}
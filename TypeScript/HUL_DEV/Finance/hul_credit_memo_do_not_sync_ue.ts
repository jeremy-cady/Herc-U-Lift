/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Jeremy Cady
 * @date 08/04/2025
 * @version 1.0
 */

import type { EntryPoints } from 'N/types';
import * as log from 'N/log';

const revStreamInternalValues = [
    2, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 131, 132, 133, 134, 135, 136, 137,
    138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 210, 211, 212, 213, 214, 215, 216,
    217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233,
    234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250,
    251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 303, 304, 305, 306, 307,
    308, 405, 406, 426, 427, 428, 429, 430, 436, 437, 438, 439, 442, 443, 444, 445, 446, 447
];

function beforeSubmit(ctx: EntryPoints.UserEvent.beforeSubmitContext): void {
    try {
        if (ctx.type === ctx.UserEventType.CREATE) {
            const creditMemo = ctx.newRecord;
            const doNotSync = creditMemo.getValue({ fieldId: 'custbody_versapay_do_not_sync' });
            const revStreamRaw = creditMemo.getValue({ fieldId: 'cseg_sna_revenue_st' });
            const revStream = Number(revStreamRaw);

            log.debug('custbody_versapay_do_not_sync', `Current value: ${doNotSync}`);
            log.debug('cseg_sna_revenue_st', `Current value: ${revStreamRaw}`);

            if (!isNaN(revStream) && revStreamInternalValues.indexOf(revStream) !== -1) {
                log.debug('Setting Do Not Sync to true', `Revenue Stream ${revStream} requires Do Not Sync`);
                creditMemo.setValue({
                    fieldId: 'custbody_versapay_do_not_sync',
                    value: true
                });
            } else {
                log.debug('Leaving Do Not Sync unchanged/false', `Revenue Stream ${revStreamRaw} not in list`);
            }
        }
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : JSON.stringify(e);
        log.error('Error in beforeSubmit', msg);
    }
}

export = {
    beforeSubmit
};

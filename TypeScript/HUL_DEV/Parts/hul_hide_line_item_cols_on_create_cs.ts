/**
 * hul_hide_line_item_cols_on_create_cs.ts
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 08/23/2024
* Revision Date: 01/29/2026
* Version: 1.2 - Support multiple columns
*/

import { EntryPoints } from 'N/types';
import * as runtime from 'N/runtime';

// Roles that should have columns hidden
const RESTRICTED_ROLES: number[] = [3, 1175, 1174, 1185, 1163, 1168, 1152];

// Columns to hide for restricted roles
const COLUMNS_TO_HIDE: string[] = [
    'custcol_sna_hul_act_service_hours',
    // Add more column IDs here as needed
    // 'custcol_another_column',
    // 'custcol_yet_another_column',
];

/**
 * Function to be executed after page is initialized.
 */
const pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
    try {
        // Only run on create mode
        if (ctx.mode !== 'create') {
            return;
        }

        const currentUser = runtime.getCurrentUser();
        const userRole = currentUser.role;

        // Check if user's role is in the restricted list
        if (!RESTRICTED_ROLES.includes(userRole)) {
            return;
        }

        // Hide all configured columns
        hideColumns(ctx.currentRecord);
    } catch (error) {
        console.error('[HIDE-COLUMNS] ERROR in pageInit', error);
    }
};

const hideColumns = (currentRecord: any) => {
    try {
        let hiddenCount = 0;

        COLUMNS_TO_HIDE.forEach((fieldId) => {
            try {
                const thisField = currentRecord.getSublistField({
                    sublistId: 'item',
                    fieldId,
                });

                if (thisField) {
                    thisField.isDisplay = false;
                    hiddenCount++;
                } else {
                    console.warn(`[HIDE-COLUMNS] Field not found: ${fieldId}`);
                }
            } catch (fieldError) {
                console.error(`[HIDE-COLUMNS] Error hiding field ${fieldId}:`, fieldError);
            }
        });

        console.log(`[HIDE-COLUMNS] Successfully hidden ${hiddenCount} columns`);
    } catch (error) {
        console.error('[HIDE-COLUMNS] ERROR in hideColumns', error);
    }
};

export = {
    pageInit,
};
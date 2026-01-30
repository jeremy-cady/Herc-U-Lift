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
define(["require", "exports", "N/runtime"], function (require, exports, runtime) {
    "use strict";
    // Roles that should have columns hidden
    var RESTRICTED_ROLES = [3, 1175, 1174, 1185, 1163, 1168, 1152];
    // Columns to hide for restricted roles
    var COLUMNS_TO_HIDE = [
        'custcol_sna_hul_act_service_hours',
        // Add more column IDs here as needed
        // 'custcol_another_column',
        // 'custcol_yet_another_column',
    ];
    /**
     * Function to be executed after page is initialized.
     */
    var pageInit = function (ctx) {
        try {
            // Only run on create mode
            if (ctx.mode !== 'create') {
                return;
            }
            var currentUser = runtime.getCurrentUser();
            var userRole = currentUser.role;
            // Check if user's role is in the restricted list
            if (!RESTRICTED_ROLES.includes(userRole)) {
                return;
            }
            // Hide all configured columns
            hideColumns(ctx.currentRecord);
        }
        catch (error) {
            console.error('[HIDE-COLUMNS] ERROR in pageInit', error);
        }
    };
    var hideColumns = function (currentRecord) {
        try {
            var hiddenCount_1 = 0;
            COLUMNS_TO_HIDE.forEach(function (fieldId) {
                try {
                    var thisField = currentRecord.getSublistField({
                        sublistId: 'item',
                        fieldId: fieldId,
                    });
                    if (thisField) {
                        thisField.isDisplay = false;
                        hiddenCount_1++;
                    }
                    else {
                        console.warn("[HIDE-COLUMNS] Field not found: ".concat(fieldId));
                    }
                }
                catch (fieldError) {
                    console.error("[HIDE-COLUMNS] Error hiding field ".concat(fieldId, ":"), fieldError);
                }
            });
            console.log("[HIDE-COLUMNS] Successfully hidden ".concat(hiddenCount_1, " columns"));
        }
        catch (error) {
            console.error('[HIDE-COLUMNS] ERROR in hideColumns', error);
        }
    };
    return {
        pageInit: pageInit,
    };
});

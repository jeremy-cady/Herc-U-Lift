/**
 * hul_hide_line_item_cols_on_create_cs.js
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 08/23/2024
* Revision Date: 08/23/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as runtime from 'N/runtime';

/**
 * Function to be executed after page is initialized.
 *
 * @param {Object} ctx
 * @param {Record} ctx.currentRecord - Current form record
 * @param {string} ctx.mode - The mode in which the record is being accessed (create, copy, or edit)
 *
 * @since 2015.2
 */
const pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
    try {
        const mode = ctx.mode;
        console.log('hide columns CS script fired', mode);
        // if mode === 'create' then we execute the code
        if (mode === 'create') {
            // array of roles for which to hide sublist fields
            const roleIDArray: number [] = [3, 1175, 1174, 1185, 1163, 1168, 1152];
            // find the current user's role
            const currentUser = runtime.getCurrentUser();
            const userRole = currentUser.role;
            console.log('userRole', userRole);
            // for each role in the array, if current user's role matches then execute code to hide columns
            roleIDArray.forEach((role) => {
                if (role === userRole) {
                    hideColumn(ctx);
                }
            });
        }
    } catch (error) {
        console.log('ERROR in pageInit', error);
    }
};

const hideColumn = (ctx) => {
    try {
        const thisRecord = ctx.currentRecord;
        const sublist = thisRecord.getSublist({
            sublistId: 'item'
        });
        console.log('sublist', sublist);
        const thisField = thisRecord.getSublistField({
            sublistId: 'item',
            fieldId: 'custcol_sna_hul_act_service_hours',
            line: 0
        });
        console.log('thisField', thisField);
        thisField.isVisible = false;
        // const lineCount = thisRecord.getLineCount({
        //     sublistId: 'item'
        // });
        // console.log('lineCount', lineCount);
        // for (let i = 0; i < lineCount; i++) {
        //     const thisField = thisRecord.getSublistField({
        //         sublistId: 'item',
        //         fieldId: 'custcol_sna_hul_act_service_hours',
        //         line: i
        //     });
        //     console.log('thisField', thisField);
        //     thisField.isDisplay = false;
        // };
    } catch (error) {
        console.log('ERROR in hideColumn CS', error);
    }
};

export = {
    pageInit,
};
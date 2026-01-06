/**
 * @NApiVersion 2.1
 * @NScriptType workflowactionscript
 */

define(['N/record', 'N/search', '/SuiteScripts/sn_hul_mod_reclasswipaccount.js'], function (record, search, mod_reclasswip) {

    function onAction(context) {
        try {
            log.debug('onAction context', JSON.stringify(context));
            var newRec = JSON.parse(JSON.stringify(context)).newRecord;

            mod_reclasswip.reclassWIPAccount(newRec, 'itemfulfillment');
        } catch (e) {
            log.error('Error', e.toString());
        }
    }

    return {
        onAction: onAction
    };
});
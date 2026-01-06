/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['SuiteScripts/HUL_DEV/Parts/hul_dummy_item_warning_cs.js',
], 
    
    function(dummyItemWarning) {
            /**
            * Validation function to be executed when sublist line is committed.
            *
            * @param {Object} scriptContext
            * @param {Record} scriptContext.currentRecord - Current form record
            * @param {string} scriptContext.sublistId - Sublist name
            *
            * @returns {boolean} Return true if sublist line is valid
            *
            * @since 2015.2
            */

        function pageInit(scriptContext) {
            try {
                console.log('made it to the invoice dispatcher!');
            } catch (error) {
                console.log('ERROR in Dispatcher Script', error);
            }
        }

        function fieldChanged(scriptContext) {
            try {
                console.log('dispatcher fieldChanged');
                return true;
            } catch (error) {
                console.log('ERROR in fieldChanged dispatcher', error);
                return true;
            }
        }

        function saveRecord(scriptContext) {
            try {
                console.log('dispatcher saveRecord');
                let shouldBlock = false;
                const dummyItemReturn = dummyItemWarning.saveRecord(scriptContext);
                if (dummyItemReturn === false) {
                    shouldBlock = true;
                }
                return !shouldBlock;
            } catch (error) {
                console.log('ERROR in saveRecord dispatcher', error);
                return true;
            }
        }

        return {
            pageInit,
            fieldChanged,
            saveRecord,
        }
});
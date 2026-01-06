/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/09/2025
* Version: 1.0
*/
define(["require", "exports", "SuiteScripts/HUL_DEV/Global/hul_swal"], function (require, exports, sweetAlert) {
    "use strict";
    /**
    * Function to be executed after page is initialized.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.mode - The mode in which the record is being accessed (create, copy, or edit)
    *
    * @since 2015.2
    */
    function pageInit(ctx) {
        sweetAlert.preload();
    }
    /**
    * Function to be executed when field is changed.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    * @param {string} ctx.fieldId - Field name
    * @param {number} ctx.lineNum - Line number. Will be undefined if not a sublist or matrix field
    * @param {number} ctx.columnNum - Line number. Will be undefined if not a matrix field
    *
    * @since 2015.2
    */
    function fieldChanged(ctx) {
    }
    /**
    * Function to be executed when a sublist is inserted, removed, or edited.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    *
    * @since 2015.2
    */
    function sublistChanged(ctx) {
    }
    /**
    * Function to be executed after sublist is inserted, removed, or edited.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    *
    * @since 2015.2
    */
    function postSourcing(ctx) {
    }
    /**
    * Function to be executed after line is selected.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    *
    * @since 2015.2
    */
    function lineInit(ctx) {
    }
    /**
    * Validation function to be executed when sublist line is committed.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    * @since 2015.2
    */
    function validateLine(ctx) {
        return true;
    }
    /**
    * Validation function to be executed when field is changed.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    * @param {string} ctx.fieldId - Field name
    * @param {number} ctx.lineNum - Line number. Will be undefined if not a sublist or matrix field
    * @param {number} ctx.columnNum - Line number. Will be undefined if not a matrix field
    *
    * @returns {boolean} Return true if field is valid
    *
    * @since 2015.2
    */
    function validateField(ctx) {
        return true;
    }
    /**
    * Validation function to be executed when record is deleted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    *
    * @returns {boolean} Return true if record is valid
    *
    * @since 2015.2
    */
    function validateDelete(ctx) {
        return true;
    }
    /**
    * Validation function to be executed when record is inserted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    * @since 2015.2
    */
    function validateInsert(ctx) {
        return true;
    }
    /**
    * Validation function to be executed when record is saved.
    *
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    *
    * @returns {boolean} Return true if record is valid
    *
    * @since 2015.2
    */
    function saveRecord(ctx) {
        try {
            var currentRecord = ctx.currentRecord;
            var targetItemIDs = ['88727', '86344', '94479'];
            var foundLine = findItemInSublist(currentRecord, targetItemIDs);
            console.log('Found line:', foundLine);
            if (foundLine !== null) {
                // Show SweetAlert and block the action
                sweetAlert.doNotInvoiceDummyItemSwalMessage();
                return false; // This blocks the save/bill action
            }
            return true; // Allow the action to proceed
        }
        catch (error) {
            console.log('Error in saveRecord', error);
            return true; // Allow to proceed on error to avoid blocking legitimate saves
        }
    }
    var findItemInSublist = function (currentRecord, targetItemIDs) {
        try {
            var lineCount = currentRecord.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < lineCount; i++) {
                var itemID = String(currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                }));
                if (targetItemIDs.indexOf(itemID) !== -1) {
                    console.log('Item Found', "Item ID ".concat(itemID, " found in sublist at line ").concat(i, "."));
                    return i;
                }
            }
            return null;
        }
        catch (error) {
            console.log('Error in findItemInSublist', error);
            return null;
        }
    };
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        sublistChanged: sublistChanged,
        postSourcing: postSourcing,
        lineInit: lineInit,
        validateLine: validateLine,
        validateField: validateField,
        validateDelete: validateDelete,
        validateInsert: validateInsert,
        saveRecord: saveRecord
    };
});

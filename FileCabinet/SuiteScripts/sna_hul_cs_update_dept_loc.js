/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * CS script to default Department and Location from User
 *
 * Revision History:
 *
 * Date              Issue/Case          Author             Issue Fix Summary
 * =============================================================================================
 * 2023/03/16       		             Amol Jagkar        Initial Version
 *
 */

define(['N/runtime'],
    /**
     * @param{runtime} runtime
     */
    (runtime) => {
        let mode;

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        const pageInit = (scriptContext) => {
            mode = scriptContext.mode;
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        const fieldChanged = (scriptContext) => {
            if (scriptContext.fieldId == "entity" && mode == "create") {
                let currentRecord = scriptContext.currentRecord;
                let userObj = runtime.getCurrentUser();
                console.log("userObj", {department: userObj.department, location: userObj.location});
                currentRecord.setValue({fieldId: "department", value: userObj.department});
                currentRecord.setValue({fieldId: "location", value: userObj.location});
            }
        }


        return {pageInit, fieldChanged};

    });

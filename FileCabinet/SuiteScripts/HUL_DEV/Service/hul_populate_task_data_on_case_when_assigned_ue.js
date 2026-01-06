/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 12/5/2024
* Version: 1.0
*/
define(["require", "exports", "N/log"], function (require, exports, log) {
    "use strict";
    // declare currentTaskData object interface
    // interface TaskDataObject {
    //     caseID: string;
    //     caseType: string;
    //     currentTaskID: string;
    //     currentStartDate: string;
    //     currentCompletedDate: string;
    //     currentTaskResult: string;
    //     currentStatus: string;
    //     currentInternalNote: string;
    //     currentActionsTaken: string;
    //     currentAssignedTo: string;
    // }
    /**
    * Function definition to be triggered before record is loaded.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {string} ctx.type - Trigger type
    * @param {Form} ctx.form - Form
    * @Since 2015.2
    */
    function beforeLoad(ctx) {
    }
    /**
    * Function definition to be triggered before record is submitted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {Record} ctx.oldRecord - Old record
    * @param {string} ctx.type - Trigger type
    * @Since 2015.2
    */
    function beforeSubmit(ctx) {
    }
    /**
    * Function definition to be triggered after a record is submitted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {Record} ctx.oldRecord - Old record
    * @param {string} ctx.type - Trigger type
    * @Since 2015.2
    */
    function afterSubmit(ctx) {
        var taskRecord = ctx.newRecord;
        var assignedTo = taskRecord.getValue({
            fieldId: 'assigned'
        });
        if (assignedTo) {
            log.debug('found a person', assignedTo);
            // gather other data points
            // caseID
            // taskID
            // taskStartDate
            // taskCompleteDate
            // taskStatus
            // taskResult
            // currentTaskAction
            // taskInternalNote
            // taskAssigned
            // set values on Case record
            // first gather currentvalues for each data point
            // next set current values in previous and new values in current
        }
    }
    return { beforeLoad: beforeLoad, beforeSubmit: beforeSubmit, afterSubmit: afterSubmit };
});

/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @author Vishal Pitale
 *
 * Script brief description:
 * UE script deployed on Sales Order Record used for:
 * - Updating the Document Number of the Sales Order using the Document Number Custom Record.
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/03/09           10177          Vishal Pitale     Initial Version - Document Numbering
 * 2023/05/25           10177          Amol Jagkar       Bug fix for Auto Document Numbering
 * 2023/12/12           122554        Vishal Pitale      Updated the code to show the button Transfer
 */

define([
  'N/record',
  'N/search',
  'N/runtime',
  'N/redirect',
  'N/url',
  'SuiteScripts/SNA/shared/sna_hul_mod_utils',
  'SuiteScripts/SNA/shared/sna_hul_mod_versapay_sync',
], /**
 * @param{record} record
 * @param{search} search
 */ (record, search, runtime, redirect, url, SNA_UTILS, VERSAPAY_UTIL) => {
  let shipMethodTransfer = 98430;
  const { isEmpty } = SNA_UTILS;

  // Function to check whether the variable is a zero.
  const isZero = value => parseFloat(value) === 0;

  // Function to generate zeroes preceding the fieldValue entered.
  function generateZero(fieldValue, requiredlength) {
    log.audit('generateZero function', 'fieldValue: ' + fieldValue + ', requiredlength: ' + requiredlength);
    let lengthOfField = fieldValue.length;
    let diffBetweenLengths = requiredlength - lengthOfField;
    if (diffBetweenLengths > 0) {
      for (let i = 0; i < diffBetweenLengths; i++) {
        fieldValue = '0' + fieldValue;
      }
    }
    return fieldValue;
  }

  /**
   *
   * @param {string|number} customform
   * @returns {{docNum: *, updateDocNum: number, custRecID: *}|{}}
   */
  function getDocNum(customform) {
    // Searching the Document Numbering List to get the Prefix, Min. Digits and Current Number.
    if (isEmpty(customform)) {
      log.error({
        title: 'UNDEFINED_CUSTOM_FORM',
        details: { message: 'getDocNum -> missing custom form' },
      });
      return {};
    }
    let customSearch = search
      .create({
        type: 'customrecord_sna_hul_document_numbering',
        filters: [['custrecord_sna_hul_transaction_form', 'anyof', customform]],
        columns: [
          'custrecord_sna_hul_doc_num_prefix',
          'custrecord_sna_hul_doc_num_min',
          'custrecord_sna_hul_doc_current_number',
        ],
      })
      .run()
      .getRange(0, 1);

    const [result] = customSearch;
    // Executing the code only when the search is not empty.
    let custRecID = result.id;
    let numPrefix = result.getValue({ name: 'custrecord_sna_hul_doc_num_prefix' });
    let minDigits = Number(result.getValue({ name: 'custrecord_sna_hul_doc_num_min' }));
    let curDocNum = result.getValue({ name: 'custrecord_sna_hul_doc_current_number' });
    log.debug({
      title: 'Search_details',
      details: {
        custRecID,
        numPrefix,
        minDigits,
        curDocNum,
      },
    });

    // Executing the code only when the values in the Document Number List is not empty.
    if (!isEmpty(numPrefix) && !isEmpty(minDigits) && !isEmpty(curDocNum)) {
      curDocNum = Number(curDocNum) + 1;
      curDocNum = '' + curDocNum;

      let updateDocNum = Number(curDocNum);
      if (curDocNum.length < minDigits) {
        let docNumFinal = generateZero(curDocNum, minDigits);
        log.debug('Details', 'curDocNum: ' + curDocNum + ', docNumFinal: ' + docNumFinal);
        curDocNum = docNumFinal;
      }
      let docNum = numPrefix + curDocNum;
      log.debug('Details', 'docNum: ' + docNum + ', updateDocNum: ' + updateDocNum);

      return { docNum, updateDocNum, custRecID };
      // }
    }
    else {
      log.error('Error', { numPrefix, minDigits, curDocNum });
      return {};
    }
  }

  /**
   *
   * @param scriptContext
   */
  function updateDocumentNumber(scriptContext) {
    let recId = scriptContext.newRecord.id;
    log.debug('recId', recId);
    const salesOrder = scriptContext.newRecord;
    const customForm = salesOrder.getValue({ fieldId: 'customform' });
    log.debug({ title: 'customform', details: { customForm } });

    // Executing the code only when the customform is not empty.
    const documentNumberProps = getDocNum(customForm);
    if (!isEmpty(documentNumberProps)) {
      record.submitFields
        .promise({
          type: 'customrecord_sna_hul_document_numbering',
          id: documentNumberProps.custRecID,
          values: { custrecord_sna_hul_doc_current_number: documentNumberProps.updateDocNum },
        })
        .then(() => {
          const docMatchSearch = search.create({
            type: record.Type.SALES_ORDER,
            filters: [
              ['type', search.Operator.ANYOF, 'SalesOrd'],
              'AND',
              ['mainline', search.Operator.IS, true],
              'AND',
              ['tranid', search.Operator.IS, documentNumberProps.docNum],
            ],
            columns: ['tranid'],
          });
          let count = docMatchSearch.runPaged().count;
          if (count == 0) {
            record.submitFields
              .promise({
                type: record.Type.SALES_ORDER,
                id: salesOrder.id,
                values: { tranid: documentNumberProps.docNum },
              })
              .then(() => {
                if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
                  redirect.toRecord({ type: record.Type.SALES_ORDER, id: salesOrder.id });
                }
              })
              .catch((err) => {
                log.error({
                  title: 'ERROR_RESET_DOC_NO',
                  details: {
                    message: err.message,
                    stack: err.stack,
                  },
                });
              });
          }
        })
        .catch((err) => {
          log.error({
            title: 'ERROR_RESET_DOC_NO',
            details: {
              message: err.message,
              stack: err.stack,
            },
          });
        });
    }
  }

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const afterSubmit = (scriptContext) => {
    try {
      log.debug('scriptContext.type', scriptContext.type);
      // Executing the code only when the Estimate is getting created.
      if (scriptContext.type == scriptContext.UserEventType.CREATE) {
        updateDocumentNumber(scriptContext);
      }
    }
    catch (e) {
      log.error('ERROR', e);
    }
  };
  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const beforeSubmit = (scriptContext) => {
    try {
      log.debug('beforeSubmit scriptContext.type', scriptContext.type);
      const { CREATE, EDIT, XEDIT } = scriptContext.UserEventType;
      if (scriptContext.type == CREATE) {
        let rec = scriptContext.newRecord;
        let po_num = rec.getValue({ fieldId: 'otherrefnum' });
        log.debug('beforeSubmit', '1st po_num: ' + po_num);
        if (isEmpty(po_num)) {
          let nxc_case = rec.getValue({ fieldId: 'custbody_nx_case' });
          log.debug('beforeSubmit', 'nxc case: ' + nxc_case + ';');
          if (!isEmpty(nxc_case)) {
            let po_fields = search.lookupFields({
              type: 'supportcase',
              id: nxc_case,
              columns: ['custevent_nx_case_purchaseorder'],
            });
            log.debug('beforeSubmit', 'nxc case po_fields: ' + JSON.stringify(po_fields));
            if (!isEmpty(po_fields.custevent_nx_case_purchaseorder)) {
              log.debug('beforeSubmit', 'Setting Blanket PO from NXC Case');
              rec.setValue({ fieldId: 'otherrefnum', value: po_fields.custevent_nx_case_purchaseorder });
            }
            else {
              let customer = rec.getValue({ fieldId: 'entity' });
              po_fields = search.lookupFields({
                type: 'customer',
                id: customer,
                columns: ['custentity_sna_hul_po_required', 'custentity_sna_blanket_po'],
              });
              if (!isEmpty(po_fields.custentity_sna_blanket_po)) {
                log.debug('beforeSubmit', 'Setting Blanket PO');
                rec.setValue({ fieldId: 'otherrefnum', value: po_fields.custentity_sna_blanket_po });
              }
            }
          }
        }
      }

      if ([CREATE, EDIT, XEDIT].includes(scriptContext.type)) {
        VERSAPAY_UTIL.preventSyncForInternalRevenueStream(scriptContext);
      }
    }
    catch (e) {
      log.error('ERROR', e);
    }
  };

  const beforeLoad = (scriptContext) => {
    try {
      log.audit('beforeLoad', beforeLoad);
      if (scriptContext.type == scriptContext.UserEventType.VIEW) {
        let rec = scriptContext.newRecord,
          dispFlag = false,
          recId = rec.id;
        let status = rec.getValue({ fieldId: 'orderstatus' });
        let subsidiary = rec.getValue({ fieldId: 'subsidiary' });
        log.audit('status', status);

        // Executing the code only when the status is Pending Fulfillment or Partially Fulfilled or Pending Billing/Partially Fulfilled.
        if (status == 'B' || status == 'D' || status == 'E') {
          let itemLineCount = rec.getLineCount({ sublistId: 'item' });

          // Traversing through the item sublist,
          for (let loop1 = 0; loop1 < itemLineCount; loop1++) {
            let shipMethod = rec.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_ship_meth_vendor',
              line: loop1,
            });
            let itemType = rec.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: loop1 });
            let transferLink = rec.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_so_linked_transfer',
              line: loop1,
            });
            let qtyCommit = rec.getSublistValue({ sublistId: 'item', fieldId: 'quantitycommitted', line: loop1 });
            let qtyFulfill = rec.getSublistValue({ sublistId: 'item', fieldId: 'quantityfulfilled', line: loop1 });
            let qtyPPS = rec.getSublistValue({ sublistId: 'item', fieldId: 'quantitypickpackship', line: loop1 });

            // Updating the flag only when the Shipping Method is Transfer '98430' and Transfer Link is empty.
            if (shipMethod == shipMethodTransfer && isEmpty(transferLink) && itemType == 'InvtPart') {
              if (isZero(qtyFulfill) && isZero(qtyPPS)) {
                dispFlag = true;
                break;
              }
            }
          }
          log.audit('dispFlag', dispFlag);
          // Executing the code only when the Flag is true.
          if (dispFlag) {
            let suiteURL = url.resolveScript({
              scriptId: 'customscript_sna_hul_sl_so_transfer_proc',
              deploymentId: 'customdeploy_sna_hul_sl_so_transfer_proc',
              params: { soId: recId, subsidiary: subsidiary },
            });
            let jsSuiteURL = `window.open('${suiteURL}', '_blank', 'width=1000,height=600,top=300,left=300,menubar=1'); window.focus();`;
            scriptContext.form.addButton({
              id: 'custpage_tranfer_button',
              label: 'Transfer',
              functionName: jsSuiteURL,
            });
          }
        }
      }
    }
    catch (e) {
      log.error('Error', e);
    }
  };

  return {
    beforeLoad,
    beforeSubmit,
    afterSubmit,
  };
});

/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 *
 * @author cparba
 */

define(['N/record'],
  /**
     * @param{record} record
     **/
  (record) => {
    /**
     *
     * @param {object} context
     * @param {Record} context.newRecord
     * @param {Record} context.oldRecord
     */
    function afterSubmit(context) {
      if (context.type == context.UserEventType.CREATE) {
        const internalBillingTask = context.newRecord;
        const lineIds = (internalBillingTask.getValue({ fieldId: 'custrecord_sna_internal_billing_line_id' }) || '').split(',');
        const invoiceId = internalBillingTask.getValue({ fieldId: 'custrecord_sna_hul_linked_invoice' });
        if (!invoiceId) return;

        record.load
          .promise({ type: record.Type.INVOICE, id: invoiceId })
          .then((invoice) => {
            lineIds.forEach((lineId) => {
              const lineIndex = invoice.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'line',
                value: lineId,
              });
              if (lineIndex > -1) {
                invoice.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sn_internal_billing_processed',
                  line: lineIndex,
                  value: true,
                });
              }
            });

            invoice.save.promise().catch((err) => {
              log.error({
                title: 'ERROR_FLAGGING_INVOICE_LINE',
                details: {
                  message: err.message,
                  stack: err.stack,
                },
              });
            });
          })
          .catch((err) => {
            log.error({
              title: 'ERROR_FLAGGING_INVOICE_LINE',
              details: {
                message: err.message,
                stack: err.stack,
              },
            });
          });
      }
    }

    return { afterSubmit };
  });

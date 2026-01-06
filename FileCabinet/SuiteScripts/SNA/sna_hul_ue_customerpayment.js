/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 *
 * @author ndejesus
 * @description Untags invoices line items after deletion of a customer payment for internal billing
 *
 */

define(['N/record', 'N/search'], (record, search) => {
  /**
   * Searches for all internal billing tasks related to the customer payment to be deleted
   * @param {number} paymentId
   * @returns {{id: *, invoiceId: number, invoiceLineIds: *}[]}
   */
  function searchInternalBillingTasks(paymentId) {
    const searchObj = search.create({
      type: 'customrecord_sna_hul_internal_billing',
      filters: [{ name: 'custrecord_sna_hul_linked_payment', operator: search.Operator.ANYOF, values: paymentId }],
      columns: [
        { name: 'internalid' },
        { name: 'custrecord_sna_hul_linked_invoice' },
        { name: 'custrecord_sna_internal_billing_line_id' },
      ],
    });

    const results = searchObj.run().getRange({ start: 0, end: 1000 });
    return results.map(result => ({
      id: result.getValue({ name: 'internalid' }),
      invoiceId: result.getValue({ name: 'custrecord_sna_hul_linked_invoice' }),
      lineIds: result.getValue({ name: 'custrecord_sna_internal_billing_line_id' }),
    }));
  }

  /**
   *
   * @param {object} map hashmap/json object used for line id lookups.
   * @returns {(function(number): void)|*}
   */
  const updateInvoiceLineItem = (map, invoiceId) => {
    record.load
      .promise({ type: record.Type.INVOICE, id: invoiceId })
      .then((invoice) => {
        const lineIds = map[invoiceId];
        lineIds.forEach((line) => {
          const lineIndex = invoice.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'line',
            value: line,
          });

          if (lineIndex > -1) {
            invoice.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sn_internal_billing_processed',
              line: lineIndex,
              value: false,
            });
          }
        });

        invoice.save
          .promise()
          .then(() => {
            log.audit('INVOICE_LINES_UPDATED');
          })
          .catch((err) => {
            log.error({
              title: 'ERROR_LOADING_INVOICE',
              details: {
                message: err.message,
                stack: err.stack,
              },
            });
          });
      })
      .catch((err) => {
        log.error({
          title: 'ERROR_LOADING_INVOICE',
          details: {
            message: err.message,
            stack: err.stack,
          },
        });
      });
  };

  /**
   * Updates Invoice transactions enable reprocessing of line items
   * @param {object} context
   * @param {string} context.type
   * @param {Record} context.oldRecord
   */
  function updateInvoiceReferences(context) {
    if (context.type != context.UserEventType.DELETE) return;
    const { oldRecord: customerPayment } = context;
    const internalBillingTasks = searchInternalBillingTasks(customerPayment.id);
    const linesByInvoice = internalBillingTasks.reduce((map, b, i, arr) => {
      if (map[b.invoiceId]) return map;
      let lineIds = arr
        .filter(x => x.invoiceId == b.invoiceId)
        .reduce((grp, elem) => {
          const ids = elem.lineIds.split(',');
          grp = grp.concat(ids);
          return grp;
        }, []);
      map[b.invoiceId] = [...new Set(lineIds)];
      return map;
    }, {});
    log.audit('LINES_BY_INVOICE', linesByInvoice);

    Object.keys(linesByInvoice).forEach((invoiceId) => {
      updateInvoiceLineItem(linesByInvoice, invoiceId);
    });
  }

  /**
   *
   * @param {object} context
   * @param {Record} context.newRecord
   * @param {Record} context.oldRecord
   */
  function beforeSubmit(context) {
    try {
      updateInvoiceReferences(context);
    }
    catch (err) {
      log.error({
        title: 'UNHANDLED_ERROR',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  return { beforeSubmit };
});

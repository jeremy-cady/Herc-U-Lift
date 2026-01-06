/**
 * Copyright (c) 2025, ScaleNorth and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 *
 *
 * @author ndejesus
 * @description Contains rental order specific functions used for sales transactions
 *
 */

define(['N/record', 'N/search'], (record, search) => {
  /**
   * Used during Copy Events of a Rent Order, this will update the sales order reference on the time-entry record.
   * @param {newRecord} salesOrder
   */
  function updateCopiedTimeEntry(salesOrder) {
    const tranid = salesOrder.getValue({ fieldId: 'tranid' });
    const sublistId = 'item';
    const lineCount = salesOrder.getLineCount({ sublistId });
    let timeEntryIds = [];
    for (let line = 0; line < lineCount; line++) {
      timeEntryIds.push(
        salesOrder.getSublistValue({
          fieldId: 'custcol_sna_linked_time',
          sublistId,
          line,
        }),
      );
    }
    timeEntryIds
      .filter((x, i, arr) => arr.indexOf(x) == i && !!x) // remove duplicates if any
      .forEach((id) => {
        record.submitFields
          .promise({
            type: record.Type.TIME_BILL,
            id,
            values: {
              custcol_sna_linked_so: salesOrder.id,
            },
          })
          .then((timeEntry) => {
            const tranid = search.lookupFields({
              type: record.Type.SALES_ORDER,
              id: salesOrder.id,
              columns: ['tranid'],
            }).tranid;
            record.submitFields({
              type: record.Type.TIME_BILL,
              id: timeEntry,
              values: {
                custcol_nxc_time_desc: tranid,
                memo: tranid,
              },
            });
            log.audit({
              title: 'TIME_ENTRY_SALES_ORDER_REFERENCE_UPDATED',
              details: {
                timeEntryId: timeEntry,
                salesOrderId: salesOrder.id,
              },
            });
          })
          .catch((err) => {
            log.error({
              title: 'ERROR_UPDATING_SALES_ORDER_REFERENCE',
              details: {
                message: err.message,
                input: { timeId: id, orderId: salesOrder.id },
              },
            });
          });
      });
  }

  return { updateCopiedTimeEntry };
});

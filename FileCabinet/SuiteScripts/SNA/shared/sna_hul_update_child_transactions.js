/**
 * Copyright (c) 2025, ScaleNorth and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NModuleScope Public
 *
 *
 * @author noe de jesus
 * @description contains reusable functions for updating child transactions from a sales order.
 *
 */

define(['N/record', 'N/search'], (record, search) => {
  /**
   * Get Sales Orders
   * -> get related transctions for the sales order
   *  -> Time Bill ***
   *  -> Return Auth ***
   *    -> Item Receipt ***
   *  -> Item Fulfillment ***
   *  -> Invoice ***
   *    -> Journal Entry ***
   *  -> Purchase Orders ***
   *    -> Item Receipt ***
   *    -> Vendor Bill
   *    -> Vendor Return Authorization
   *
   */

  function getRelatedTimeBills(id) {
    const searchObj = search.create({
      type: search.Type.TIME_BILL,
      filters: [
        search.createFilter({
          name: 'custcol_sna_linked_so',
          operator: search.Operator.ANYOF,
          values: id,
        }),
      ],
      columns: [
        search.createColumn({ name: 'internalid' }),
        search.createColumn({ name: 'custcol_sna_linked_so' }),
        search.createColumn({ name: 'line', join: 'custcol_sna_linked_so' }),
        search.createColumn({ name: 'custcol_sna_linked_time', join: 'custcol_sna_linked_so' }),
      ],
    });

    return searchObj
      .run()
      .getRange({ start: 0, end: 1000 })
      .filter(
        (x) =>
          x.getValue({ name: 'custcol_sna_linked_time', join: 'custcol_sna_linked_so' }) ==
          x.getValue({ name: 'internalid' }),
      )
      .map((x) => ({
        salesOrderLineId: x.getValue({ name: 'line', join: 'custcol_sna_linked_so' }),
        id: x.getValue({ name: 'internalid' }),
      }));
  }

  function getRelatedTransactions(id) {
    const searchObj = search.load({ id: 'customsearch_sna_createdfrom_transaction' });
    searchObj.filters.push(
      search.createFilter({
        name: 'createdfrom',
        operator: search.Operator.ANYOF,
        values: id,
      }),
    );

    return getAllSearchResults(searchObj.run()).map((result) => ({
      id: result.getValue({ name: 'internalid', summary: search.Summary.GROUP }),
      documentNo: result.getValue({ name: 'tranid', summary: search.Summary.GROUP }),
      recordType: result.getValue({ name: 'recordtype', summary: search.Summary.GROUP }),
      lineId: result.getValue({ name: 'line', summary: search.Summary.GROUP }),
    }));
  }

  function getRelatedPurchaseOrders(id) {
    const searchObj = search.load({ id: 'customsearch_sna_linked_purchase_orders' });
    const filterExpression = searchObj.filterExpression;
    const { ANYOF } = search.Operator;
    filterExpression.push('AND', [
      ['custcol_sna_linked_transaction', ANYOF, id],
      'OR',
      ['custcol_sna_linked_so', ANYOF, id],
    ]);
    searchObj.filterExpression = filterExpression;
    return getAllSearchResults(searchObj.run()).map((result) => ({
      id: result.getValue({ name: 'internalid', summary: search.Summary.GROUP }),
      documentNo: result.getValue({ name: 'tranid', summary: search.Summary.GROUP }),
      recordType: record.Type.PURCHASE_ORDER,
      lineId: result.getValue({ name: 'line', summary: search.Summary.GROUP }),
      salesOrderLineId: result.getValue({ name: 'custcol_sn_hul_so_line_id', summary: search.Summary.GROUP }),
    }));
  }

  /**
   * Function for updating the time bill
   * @param {object} params
   * @param {number} params.id
   * @param {number} params.timeBills
   * @param {[{salesOrderLineId: number, revenueStreamId: number}]} params.revenueStreamPerLine
   */
  function updateTimeBill(params) {
    let linkedJournalEntry;
    // log.audit('updateTimeBill:PARAMS', params);
    const timeBillDetail = params.timeBills.find((x) => x.id == params.id);
    log.audit({
      title: `TIME_BILL_DETAIL_${params.id}`,
      details: timeBillDetail,
    });
    const lineMatch = params.revenueStreamPerLine.find((x) => x.salesOrderLineId == timeBillDetail.salesOrderLineId);
    const revenueStreamId = lineMatch?.revenueStreamId || null;

    if (!revenueStreamId) {
      log.audit({
        title: 'NO_REVENUE_STREAM_MATCH_FOUND',
        details: {
          timeBillDetail,
          revenueStreamPerLine: params.revenueStreamPerLine,
          timeBillSalesOrderLine: timeBillDetail.salesOrderLineId,
        },
      });
      return;
    }
    log.audit({
      title: 'UPDATING_TIME_BILL',
      details: {
        timeBillId: timeBillDetail.id,
        revenueStreamId,
      },
    });

    try {
      const timeBill = record.load({
        type: record.Type.TIME_BILL,
        id: params.id,
      });
      linkedJournalEntry = timeBill.getValue({ fieldId: 'custcol_sna_hul_linked_je' });
      log.audit('LINKED_JOURNAL_ENTRY', {
        timeBillId: params.id,
        linkedJournalEntry: linkedJournalEntry || null,
      });
      timeBill.setValue({
        fieldId: 'cseg_sna_revenue_st',
        value: revenueStreamId,
      });
      timeBill.setValue({
        fieldId: 'cseg_hul_mfg',
        value: lineMatch.hulManufacturerId,
      });
      timeBill.setValue({
        fieldId: 'cseg_sna_hul_eq_seg',
        value: lineMatch.equipmentPostingId,
      });

      timeBill.save
        .promise({ ignoreMandatoryFields: true })
        .then(() => {
          log.audit('TIME_BILL_UPDATED', params);
          if (linkedJournalEntry) {
            log.audit('UPDATING_RELATED_JOURNAL_ENTRY', { linkedJournalEntry });
            updateLinkedJournalEntry({
              journalEntryId: linkedJournalEntry,
              newRevenueStreamId: revenueStreamId,
              hulManufacturerId: lineMatch.hulManufacturerId,
              equipmentPostingId: lineMatch.equipmentPostingId,
            });
          }
        })
        .catch((err) => {
          log.error({
            title: 'ERROR_SAVING_TIME_BILL',
            details: {
              message: err.message,
              stack: err.stack,
            },
          });
          if (linkedJournalEntry) {
            log.audit('UPDATING_RELATED_JOURNAL_ENTRY', { linkedJournalEntry });
            updateLinkedJournalEntry({
              journalEntryId: linkedJournalEntry,
              newRevenueStreamId: revenueStreamId,
              hulManufacturerId: lineMatch.hulManufacturerId,
              equipmentPostingId: lineMatch.equipmentPostingId,
            });
          }
        });
    } catch (err) {
      log.error({
        title: 'ERROR_PROCESSING_TIME_BILL',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  /**
   *
   * @param {object} params
   * @param {number} params.journalEntryId
   * @param {number|string} params.newRevenueStreamId
   * @param {number|string} params.hulManufacturerId
   * @param {number|string} params.equipmentPostingId
   */
  function updateLinkedJournalEntry(params) {
    log.audit('UPDATING_JOURNAL_ENTRY', params);
    try {
      const journalEntry = record.load({
        type: record.Type.JOURNAL_ENTRY,
        id: params.journalEntryId,
      });
      journalEntry.setValue({ fieldId: 'cseg_sna_revenue_st', value: params.newRevenueStreamId });
      const sublistId = 'line';
      const lineCount = journalEntry.getLineCount({ sublistId });
      for (let line = 0; line < lineCount; line++) {
        journalEntry.setSublistValue({
          fieldId: 'cseg_sna_revenue_st',
          value: params.newRevenueStreamId,
          sublistId,
          line,
        });
        journalEntry.setSublistValue({
          fieldId: 'cseg_hul_mfg',
          value: params.hulManufacturerId,
          line,
          sublistId,
        });
        journalEntry.setSublistValue({
          fieldId: 'cseg_sna_hul_eq_seg',
          value: params.equipmentPostingId,
          line,
          sublistId,
        });
      }

      journalEntry.save({ ignoreMandatoryFields: true });
      log.audit({
        title: 'JOURNAL_ENTRY_UPDATED',
        details: params,
      });
    } catch (err) {
      log.error({
        title: 'ERROR_UPDATING_JOURNAL_ENTRY',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  /**
   *
   * @param {object} params
   * @param {number|string} params.id
   * @param {[]} params.itemFulfillments
   * @param {[{salesOrderLineId: number, revenueStreamId: number}]} params.revenueStreamPerLine
   * @param {boolean} params.isVRAFulfillment
   * @param {[{revenueStreamId: number, lineId: string}]} params.updatedLines
   * @returns {*}
   */
  function updateItemFulfillment(params) {
    log.audit('UPDATING_ITEM_FULFILLMENT', {
      fulfillmentId: params.id,
      revenueStreamPerLine: params.revenueStreamPerLine,
    });
    try {
      const itemFulfillment = record.load({
        type: record.Type.ITEM_FULFILLMENT,
        id: params.id,
      });

      const sublistId = 'item';
      const foundLines = [];
      let lastRevenueStream = null;
      let hulManufacturerId = null;
      let equipmentPostingId = null;
      if (params.isVRAFulfillment) {
        itemFulfillment.setValue({
          fieldId: 'cseg_sna_revenue_st',
          value: params.updatedLines[0].revenueStreamId,
        });
        params.updatedLines.forEach((updatedLine) => {
          const line = itemFulfillment.findSublistLineWithValue({
            fieldId: 'orderline',
            value: updatedLine.lineId,
            sublistId,
          });
          if (line > -1) {
            itemFulfillment.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: updatedLine.revenueStreamId,
              line,
              sublistId,
            });
            itemFulfillment.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: updatedLine.revenueStreamId,
              line,
              sublistId,
            });
            itemFulfillment.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: updatedLine.revenueStreamId,
              line,
              sublistId,
            });
          }
        });
      } else {
        itemFulfillment.setValue({
          fieldId: 'cseg_sna_revenue_st',
          value: params.revenueStreamPerLine[0].revenueStreamId,
        });
        params.revenueStreamPerLine.forEach((lineRevenueStream) => {
          const line = itemFulfillment.findSublistLineWithValue({
            fieldId: 'orderline',
            value: lineRevenueStream.salesOrderLineId,
            sublistId,
          });
          if (line > -1) {
            foundLines.push({ line, orderLineId: lineRevenueStream.salesOrderLineId });
            itemFulfillment.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: lineRevenueStream.revenueStreamId,
              line,
              sublistId,
            });
            itemFulfillment.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: lineRevenueStream.hulManufacturerId,
              line,
              sublistId,
            });
            itemFulfillment.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: lineRevenueStream.equipmentPostingId,
              line,
              sublistId,
            });
            lastRevenueStream = lineRevenueStream.revenueStreamId;
            hulManufacturerId = lineRevenueStream.hulManufacturerId;
            equipmentPostingId = lineRevenueStream.equipmentPostingId;
          }
        });
      }

      log.audit('FOUND_LINES', { fulfillmentId: params.id, foundLines });
      const wipJournalEntries = itemFulfillment.getValue({ fieldId: 'custbody_sna_hul_je_wip' });

      itemFulfillment.save
        .promise({ ignoreMandatoryFields: true })
        .then(() => {
          if (wipJournalEntries.length > 0 && lastRevenueStream) {
            wipJournalEntries.forEach((journalEntryId) => {
              updateLinkedJournalEntry({
                journalEntryId,
                newRevenueStreamId: lastRevenueStream,
                hulManufacturerId,
                equipmentPostingId,
              });
            });
          }
        })
        .catch((err) => {
          log.error({
            title: 'ERROR_UPDATING_ITEM_FULFILLMENT',
            details: {
              message: err.message,
              stack: err.stack,
            },
          });
        });
      log.audit('ITEM_FULFILLMENT_UPDATED');
    } catch (err) {
      log.error({
        title: 'ERROR_UPDATING_ITEM_FULFILLMENT',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  /**
   *
   * @param {object} params
   * @param {number} params.id
   * @param {[]} params.invoices
   * @param {[{salesOrderLineId: number, revenueStreamId: number}]} params.revenueStreamPerLine
   */
  function updateInvoice(params) {
    log.audit('UPDATING_INVOICE', {
      invoiceId: params.id,
      revenueStreamPerLine: params.revenueStreamPerLine,
    });
    const invoice = record.load({
      type: record.Type.INVOICE,
      id: params.id,
    });

    if (params.revenueStreamPerLine.length > 0) {
      invoice.setValue({
        fieldId: 'cseg_sna_revenue_st',
        value: params.revenueStreamPerLine[0].revenueStreamId,
      });
    }

    const sublistId = 'item';
    const foundLines = [];
    let lastRevenueStreamSet = null;
    let hulManufacturerId = null;
    let equipmentPostingId = null;
    params.revenueStreamPerLine.forEach((lineRevenueStream) => {
      const line = invoice.findSublistLineWithValue({
        fieldId: 'orderline',
        value: lineRevenueStream.salesOrderLineId,
        sublistId,
      });
      if (line > -1) {
        foundLines.push({ line, orderLineId: lineRevenueStream.salesOrderLineId });
        invoice.setSublistValue({
          fieldId: 'cseg_sna_revenue_st',
          value: lineRevenueStream.revenueStreamId,
          line,
          sublistId,
        });
        invoice.setSublistValue({
          fieldId: 'cseg_hul_mfg',
          value: lineRevenueStream.hulManufacturerId,
          line,
          sublistId,
        });
        invoice.setSublistValue({
          fieldId: 'cseg_sna_hul_eq_seg',
          value: lineRevenueStream.equipmentPostingId,
          line,
          sublistId,
        });
        lastRevenueStreamSet = lineRevenueStream.revenueStreamId;
        hulManufacturerId = lineRevenueStream.hulManufacturerId;
        equipmentPostingId = lineRevenueStream.equipmentPostingId;
      }
    });

    log.audit('FOUND_LINES', { invoiceId: params.id, foundLines });

    invoice.save({ ignoreMandatoryFields: true });
    log.audit(`INVOICE_UPDATED`, { id: params.id });
    const billingTaskDetails = getRelatedInternalBillingTasks(params.id);
    const journalEntryIds = billingTaskDetails.map((x) => x.jeId);
    const generatedCustomerPayments = getGeneratedCustomerPayments(params.id);
    log.audit('INVOICE_JE_TO_UPDATE', { journalEntryIds });
    const internalCustomerPayments = billingTaskDetails.map((x) => x.paymentId);
    const customerPayments = [...new Set([...generatedCustomerPayments, ...internalCustomerPayments])];
    log.audit('CUSTOMER_PAYMENTS', customerPayments);
    customerPayments.forEach((paymentId) => {
      if (lastRevenueStreamSet) {
        try {
          record.submitFields({
            type: record.Type.CUSTOMER_PAYMENT,
            id: paymentId,
            values: {
              cseg_sna_revenue_st: lastRevenueStreamSet,
              cseg_hul_mfg: hulManufacturerId,
              cseg_sna_hul_eq_seg: equipmentPostingId,
            },
          });
          log.audit('CUSTOMER_PAYMENT_UPDATED', { paymentId, revenueStream: lastRevenueStreamSet });
        } catch (err) {
          log.error({
            title: 'ERROR_UPDATE_CUSTOMER_PAYMENT',
            details: {
              message: err.message,
              stack: err.stack,
            },
          });
        }
      }
    });

    journalEntryIds.forEach((jeId) => {
      if (jeId) {
        updateLinkedJournalEntry({
          journalEntryId: jeId,
          newRevenueStreamId: lastRevenueStreamSet,
          hulManufacturerId: hulManufacturerId,
          equipmentPostingId,
        });
      }
    });
  }

  /**
   * Retrieves all related internal billing tasks for an invoice transaction
   * @param invoiceId
   * @returns {[{jeId: number|string, paymentId: number|string}]}
   */
  function getRelatedInternalBillingTasks(invoiceId) {
    const searchObj = search.create({
      type: 'customrecord_sna_hul_internal_billing',
      filters: [
        search.createFilter({
          name: 'custrecord_sna_hul_linked_invoice',
          operator: search.Operator.ANYOF,
          values: invoiceId,
        }),
        search.createFilter({
          name: 'custrecord_sna_hul_linked_je',
          operator: search.Operator.NONEOF,
          values: ['@NONE@'],
        }),
      ],
      columns: [
        search.createColumn({ name: 'custrecord_sna_hul_linked_je' }),
        search.createColumn({ name: 'custrecord_sna_hul_linked_payment' }),
      ],
    });
    const results = searchObj.run().getRange({ start: 0, end: 1000 });
    return results.map((x) => ({
      jeId: x.getValue({ name: 'custrecord_sna_hul_linked_je' }),
      paymentId: x.getValue({ name: 'custrecord_sna_hul_linked_payment' }),
    }));
  }

  /**
   *
   * @param {object} params
   * @param {number} params.id
   * @param {[]} params.purchaseOrders
   * @param {[{salesOrderLineId: number, revenueStreamId: number}]} params.revenueStreamPerLine
   * @returns {*}
   */
  function updatePurchaseOrders(params) {
    try {
      const purchaseOrder = record.load({
        type: record.Type.PURCHASE_ORDER,
        id: params.id,
      });

      purchaseOrder.setValue({
        fieldId: 'cseg_sna_revenue_st',
        value: params.revenueStreamPerLine[0]?.revenueStreamId,
      });

      log.audit('PURCHASE_ORDER_LOADED');
      const poLines = params.purchaseOrders.filter((x) => x.id == params.id);
      const sublistId = 'item';
      const linesUpdated = [];
      const lineIdsUpdated = [];
      poLines.forEach((line) => {
        if (line.salesOrderLineId == '- None -') {
          const lineMatch = params.revenueStreamPerLine.find((x) => x.linkedPurchaseOrder == params.id);
          const revenueStreamId = lineMatch?.revenueStreamId;
          const foundIndex = purchaseOrder.findSublistLineWithValue({
            fieldId: 'line',
            value: line.lineId,
            sublistId,
          });
          if (foundIndex > -1) {
            purchaseOrder.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: revenueStreamId,
              line: foundIndex,
              sublistId,
            });
            purchaseOrder.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: lineMatch.hulManufacturerId,
              line: foundIndex,
              sublistId,
            });
            purchaseOrder.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: lineMatch.equipmentPostingId,
              line: foundIndex,
              sublistId,
            });
            linesUpdated.push({ foundIndex, revenueStreamId });
            lineIdsUpdated.push({
              revenueStreamId,
              hulManufacturerId: lineMatch.hulManufacturerId,
              equipmentPostingId: lineMatch.equipmentPostingId,
              lineId: purchaseOrder.getSublistValue({
                fieldId: 'line',
                line: foundIndex,
                sublistId,
              }),
            });
          }
        } else {
          // custcol_sn_hul_so_line_id
          const lineMatch = params.revenueStreamPerLine.find((x) => x.salesOrderLineId == line.salesOrderLineId);
          const revenueStreamId = lineMatch?.revenueStreamId;
          const foundIndex = purchaseOrder.findSublistLineWithValue({
            fieldId: 'custcol_sn_hul_so_line_id',
            value: line.salesOrderLineId,
            sublistId,
          });
          if (foundIndex > -1) {
            purchaseOrder.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: revenueStreamId,
              line: foundIndex,
              sublistId,
            });
            purchaseOrder.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: lineMatch.hulManufacturerId,
              line: foundIndex,
              sublistId,
            });
            purchaseOrder.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: lineMatch.equipmentPostingId,
              line: foundIndex,
              sublistId,
            });
            linesUpdated.push({ foundIndex, revenueStreamId });
            lineIdsUpdated.push({
              revenueStreamId,
              hulManufacturerId: lineMatch.hulManufacturerId,
              equipmentPostingId: lineMatch.equipmentPostingId,
              lineId: purchaseOrder.getSublistValue({
                fieldId: 'line',
                line: foundIndex,
                sublistId,
              }),
            });
          }
        }
      });

      log.audit('PURCHASE_ORDER_LINES_UPDATED', { id: params.id, lineIdsUpdated });
      purchaseOrder.save({ ignoreMandatoryFields: true });
      log.audit('PULLING_PO_RELATED_TRANSACTIONS');
      const relatedTransactions = getRelatedTransactions(params.id);
      const vendorBills = relatedTransactions.filter((x) => x.recordType == record.Type.VENDOR_BILL);
      const itemReceipts = relatedTransactions.filter((x) => x.recordType == record.Type.ITEM_RECEIPT);
      const vendorReturns = relatedTransactions.filter((x) => x.recordType == record.Type.VENDOR_RETURN_AUTHORIZATION);
      log.audit('PO_RELATED_TRANSACTIONS', {
        vendorBills,
        itemReceipts,
        vendorReturns,
      });
      vendorBills
        .map((x) => x.id)
        .filter((x, i, arr) => arr.indexOf(x) == i)
        .forEach((id) => updateVendorBill({ id, lineIdsUpdated }));
      itemReceipts
        .map((x) => x.id)
        .filter((x, i, arr) => arr.indexOf(x) == i)
        .forEach((id) => updateItemReceipt({ id, lineIdsUpdated }));
      vendorReturns
        .map((x) => x.id)
        .filter((x, i, arr) => arr.indexOf(x) == i)
        .forEach((id) => updateVendorReturnAuthorization({ id, lineIdsUpdated }));
      log.audit('PURCHASE_ORDER_RELATED_TRANSACTIONS_UPDATED');
    } catch (err) {
      log.error({
        title: 'ERROR_UPDATING_PURCHASE_ORDER',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  /**
   *
   * @param {object} params
   * @param {number} params.id
   * @param {number} params.lineIdsUpdated
   */
  function updateVendorBill(params) {
    try {
      const vendorBill = record.load({
        type: record.Type.VENDOR_BILL,
        id: params.id,
      });
      const sublistId = 'item';
      params.lineIdsUpdated.forEach((updatedLine) => {
        const line = vendorBill.findSublistLineWithValue({
          fieldId: 'orderline',
          value: updatedLine.lineId,
          sublistId,
        });
        if (line > -1) {
          vendorBill.setSublistValue({
            fieldId: 'cseg_sna_revenue_st',
            value: updatedLine.revenueStreamId,
            line,
            sublistId,
          });
          vendorBill.setSublistValue({
            fieldId: 'cseg_hul_mfg',
            value: updatedLine.hulManufacturerId,
            line,
            sublistId,
          });
          vendorBill.setSublistValue({
            fieldId: 'cseg_sna_hul_eq_seg',
            value: updatedLine.equipmentPostingId,
            line,
            sublistId,
          });
        }
      });

      vendorBill.save({ ignoreMandatoryFields: true });
      log.audit({
        title: 'VENDOR_BILL_UPDATED',
        details: params,
      });
    } catch (err) {
      log.error('ERROR_UPDATING_VENDOR_BILL', { params, err });
    }
  }

  /**
   *
   * @param params
   * @param {number} params.id
   * @param {[{revenueStreamId: number, lineId: string}]} params.lineIdsUpdated
   */
  function updateItemReceipt(params) {
    log.audit('UPDATING_ITEM_RECEIPT', params);
    try {
      const itemReceipt = record.load({
        type: record.Type.ITEM_RECEIPT,
        id: params.id,
      });
      const sublistId = 'item';
      itemReceipt.setValue({
        fieldId: 'cseg_sna_revenue_st',
        value: params.lineIdsUpdated[0].revenueStreamId,
      });
      params.lineIdsUpdated.forEach((updatedLine) => {
        const line = itemReceipt.findSublistLineWithValue({
          fieldId: 'orderline',
          value: updatedLine.lineId,
          sublistId,
        });
        if (line > -1) {
          itemReceipt.setSublistValue({
            fieldId: 'cseg_sna_revenue_st',
            value: updatedLine.revenueStreamId,
            line,
            sublistId,
          });
          itemReceipt.setSublistValue({
            fieldId: 'cseg_hul_mfg',
            value: updatedLine.hulManufacturerId,
            line,
            sublistId,
          });
          itemReceipt.setSublistValue({
            fieldId: 'cseg_sna_hul_eq_seg',
            value: updatedLine.equipmentPostingId,
            line,
            sublistId,
          });
        }
      });

      itemReceipt.save({ ignoreMandatoryFields: true });
      log.audit('ITEM_RECEIPT_UPDATED', params);
    } catch (err) {
      log.error('ERROR_UPDATING_ITEM_RECEIPT', { params, message: err.message, stack: err.stack });
    }
  }

  /**
   *
   * @param params
   * @param {number} params.id
   * @param {[{revenueStreamId: number, lineId: string}]} params.lineIdsUpdated
   */
  function updateVendorReturnAuthorization(params) {
    log.audit('UPDATING_VENDOR_CREDIT', params);
    try {
      const vra = record.load({
        type: record.Type.VENDOR_RETURN_AUTHORIZATION,
        id: params.id,
      });
      vra.setValue({
        fieldId: 'cseg_sna_revenue_st',
        value: params.lineIdsUpdated[0].revenueStreamId,
      });
      const sublistId = 'item';
      const updatedLines = [];
      params.lineIdsUpdated.forEach((updatedLine) => {
        const line = vra.findSublistLineWithValue({ fieldId: 'orderline', value: updatedLine.lineId, sublistId });
        if (line > -1) {
          vra.setSublistValue({
            fieldId: 'cseg_sna_revenue_st',
            value: updatedLine.revenueStreamId,
            line,
            sublistId,
          });
          vra.setSublistValue({
            fieldId: 'cseg_hul_mfg',
            value: updatedLine.hulManufacturerId,
            line,
            sublistId,
          });
          vra.setSublistValue({
            fieldId: 'cseg_sna_hul_eq_seg',
            value: updatedLine.equipmentPostingId,
            line,
            sublistId,
          });
          updatedLines.push({
            revenueStreamId: updatedLine.revenueStreamId,
            hulManufacturerId: updatedLine.hulManufacturerId,
            equipmentPostingId: updatedLine.equipmentPostingId,
            lineId: vra.getSublistValue({
              fieldId: 'line',
              sublistId,
              line,
            }),
          });
        }
      });
      vra.save({ ignoreMandatoryFields: true });
      log.audit('VRA_UPDATED', params);
      const relatedTransactions = getRelatedTransactions(params.id);
      log.audit('VRA_RELATED_TRANSACTIONS', relatedTransactions);
      const itemFulfillments = relatedTransactions.filter((x) => x.recordType == record.Type.ITEM_FULFILLMENT);
      const billCredits = relatedTransactions.filter((x) => x.recordType == record.Type.VENDOR_CREDIT);
      itemFulfillments.forEach((props) => {
        updateItemFulfillment({ id: props.id, updatedLines, isVRAFulfillment: true });
      });
      billCredits.forEach((props) => {
        updateVendorCredit({ id: props.id, updatedLines });
      });
    } catch (err) {
      log.error({
        title: 'ERROR_UPDATING_VRA',
        details: {
          params,
          message: err.message,
        },
      });
    }
  }

  /**
   *
   * @param {object} params
   * @param {number} params.id
   * @param {[{revenueStreamId: number, lineId: string}]} params.updatedLines
   */
  function updateVendorCredit(params) {
    log.audit('UPDATING_VENDOR_CREDIT', params);
    return record.load
      .promise({
        type: record.Type.VENDOR_CREDIT,
        id: params.id,
      })
      .then((vendorCredit) => {
        vendorCredit.setValue({
          fieldId: 'cseg_sna_revenue_st',
          value: params.updatedLines[0].revenueStreamId,
        });
        const sublistId = 'item';
        params.updatedLines.forEach((updatedLine) => {
          const line = vendorCredit.findSublistLineWithValue({
            fieldId: 'orderline',
            value: updatedLine.lineId,
            sublistId,
          });
          if (line > -1) {
            vendorCredit.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: updatedLine.revenueStreamId,
              line,
              sublistId,
            });
            vendorCredit.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: updatedLine.hulManufacturerId,
              line,
              sublistId,
            });
            vendorCredit.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: updatedLine.equipmentPostingId,
              line,
              sublistId,
            });
          }
        });
        vendorCredit.save({ ignoreMandatoryFields: true });
        log.audit('VENDOR_CREDIT_UPDATED', params);
      })
      .catch((err) => {
        log.error({
          title: 'ERROR_UPDATING_VENDOR_CREDITS',
          details: {
            params,
            message: err.message,
          },
        });
      });
  }

  function hasNoOrderLines(transaction) {
    const sublistId = 'item';
    const lineCount = transaction.getLineCount({ sublistId });
    let allLinesEmpty = true;
    for (let line = 0; line < lineCount; line++) {
      let orderLine = transaction.getSublistValue({ fieldId: 'orderline', sublistId, line });
      if (orderLine) allLinesEmpty = false;
      break;
    }
    return allLinesEmpty;
  }

  /**
   *
   * @param {object} params
   * @param {number} params.id
   * @param {[{salesOrderLineId: number, revenueStreamId: number}]} params.revenueStreamPerLine
   * @returns {*}
   */
  function updateReturnAuthorizations(params) {
    log.audit('UPDATING_RMA', params);
    try {
      const rma = record.load({
        type: record.Type.RETURN_AUTHORIZATION,
        id: params.id,
      });

      const sublistId = 'item';
      const foundLines = [];
      const updatedLines = [];
      const areAllLinesEmpty = hasNoOrderLines(rma);
      log.audit('HAS_NO_ORDER_LINES', { ...params, areAllLinesEmpty });
      const createdFrom = rma.getValue({ fieldId: 'createdfrom' });
      if (areAllLinesEmpty && createdFrom) {
        const salesOrder = record.load({
          type: record.Type.SALES_ORDER,
          id: createdFrom,
        });
        const lineCount = rma.getLineCount({ sublistId });
        const salesOrderMainlineSegment = rma.getValue({ fieldId: 'cseg_sna_revenue_st' });
        rma.setValue({
          fieldId: 'cseg_sna_revenue_st',
          value: salesOrderMainlineSegment,
        });
        // iterate over the RMA line items and find each line
        for (let line = 0; line < lineCount; line++) {
          const itemId = rma.getSublistValue({ fieldId: 'item', sublistId, line });
          const salesItemIndex = salesOrder.findSublistLineWithValue({ fieldId: 'item', sublistId, value: itemId });
          log.audit('SALES_ITEM_INDEX', { itemId, salesItemIndex, line });
          if (salesItemIndex > -1) {
            const manufacturerId = salesOrder.getSublistValue({
              fieldId: 'cseg_hul_mfg',
              line: salesItemIndex,
              sublistId,
            });
            const equipmentPostingId = salesOrder.getSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              line: salesItemIndex,
              sublistId,
            });
            rma.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: salesOrderMainlineSegment,
              sublistId,
              line,
            });
            rma.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: manufacturerId,
              sublistId,
              line,
            });
            rma.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: equipmentPostingId,
              sublistId,
              line,
            });
            updatedLines.push({
              lineId: rma.getSublistValue({ fieldId: 'line', sublistId, line }),
              revenueStreamId: salesOrderMainlineSegment,
              hulManufacturerId: manufacturerId,
              equipmentPostingId: equipmentPostingId,
            });
          }
        }
      } else {
        rma.setValue({
          fieldId: 'cseg_sna_revenue_st',
          value: params.revenueStreamPerLine[0].revenueStreamId,
        });
        params.revenueStreamPerLine.forEach((lineRevenueStream) => {
          const line = rma.findSublistLineWithValue({
            fieldId: 'orderline',
            value: lineRevenueStream.salesOrderLineId,
            sublistId,
          });
          if (line > -1) {
            foundLines.push({ line, orderLineId: lineRevenueStream.salesOrderLineId });
            rma.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: lineRevenueStream.revenueStreamId,
              line,
              sublistId,
            });
            rma.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: lineRevenueStream.hulManufacturerId,
              line,
              sublistId,
            });
            rma.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: lineRevenueStream.equipmentPostingId,
              line,
              sublistId,
            });
            updatedLines.push({
              lineId: rma.getSublistValue({ fieldId: 'line', sublistId, line }),
              revenueStreamId: lineRevenueStream.revenueStreamId,
              hulManufacturerId: lineRevenueStream.hulManufacturerId,
              equipmentPostingId: lineRevenueStream.equipmentPostingId,
            });
          }
        });
        rma.save({ ignoreMandatoryFields: true });
      }

      log.audit('RMA_UPDATED');
      const relatedTransactions = getRelatedTransactions(params.id);
      const itemReceipts = relatedTransactions
        .filter((x) => x.recordType == record.Type.ITEM_RECEIPT)
        .map((x) => x.id)
        .filter((x, i, arr) => arr.indexOf(x) == i);
      const creditMemos = relatedTransactions
        .filter((x) => x.recordType == record.Type.CREDIT_MEMO)
        .map((x) => x.id)
        .filter((x, i, arr) => arr.indexOf(x) == i);
      if (updatedLines.length > 0) {
        itemReceipts.forEach((id) => updateItemReceipt({ id, lineIdsUpdated: updatedLines }));
        creditMemos.forEach((id) => updateCreditMemos({ id, lineIdsUpdated: updatedLines }));
      }
    } catch (err) {
      log.error({
        title: 'ERROR_UPDATING_RMA',
        details: {
          params,
          message: err.message,
        },
      });
    }
  }

  /**
   *
   * @param {object} params
   * @param {number} params.id
   * @param {number} params.lineIdsUpdated
   */
  function updateCreditMemos(params) {
    return record.load
      .promise({
        type: record.Type.CREDIT_MEMO,
        id: params.id,
      })
      .then((creditMemo) => {
        creditMemo.setValue({
          fieldId: 'cseg_sna_revenue_st',
          value: params.lineIdsUpdated[0].revenueStreamId,
        });
        const sublistId = 'item';
        params.lineIdsUpdated.forEach((updatedLine) => {
          const line = creditMemo.findSublistLineWithValue({
            fieldId: 'orderline',
            value: updatedLine.lineId,
            sublistId,
          });
          if (line > -1) {
            creditMemo.setSublistValue({
              fieldId: 'cseg_sna_revenue_st',
              value: updatedLine.revenueStreamId,
              line,
              sublistId,
            });
            creditMemo.setSublistValue({
              fieldId: 'cseg_hul_mfg',
              value: updatedLine.hulManufacturerId,
              line,
              sublistId,
            });
            creditMemo.setSublistValue({
              fieldId: 'cseg_sna_hul_eq_seg',
              value: updatedLine.equipmentPostingId,
              line,
              sublistId,
            });
          }
        });
        creditMemo.save({ ignoreMandatoryFields: true });
        log.audit('CREDIT_MEMO_UPDATED');
      })
      .catch((err) => {
        log.error({
          title: 'ERROR_UPDATING_CREDIT_MEMO',
          details: {
            params,
            message: err.message,
          },
        });
      });
  }

  function getGeneratedCustomerPayments(invoiceId) {
    const searchObj = search.create({
      type: search.Type.TRANSACTION,
      filters: [['type', 'anyof', 'CustPymt'], 'AND', ['createdfrom', 'anyof', invoiceId]],
      columns: [
        search.createColumn({ name: 'internalid', summary: 'GROUP' }),
        search.createColumn({ name: 'tranid', summary: 'GROUP' }),
        search.createColumn({ name: 'transactionnumber', summary: 'GROUP' }),
        search.createColumn({ name: 'createdfrom', summary: 'GROUP' }),
      ],
    });

    const results = getAllSearchResults(searchObj.run());
    return results.map((x) => x.getValue({ name: 'internalid', summary: 'GROUP' }));
  }

  return {
    getRelatedTransactions,
    getRelatedPurchaseOrders,
    getRelatedTimeBills,
    updateTimeBill,
    updateItemFulfillment,
    updateInvoice,
    updateLinkedJournalEntry,
    updatePurchaseOrders,
    updateReturnAuthorizations,
    updateVendorReturnAuthorization,
  };

  function getAllSearchResults(resultSet) {
    let batch,
      batchResults,
      results = [],
      searchStart = 0;
    do {
      batch = resultSet.getRange({ start: searchStart, end: searchStart + 1000 });
      batchResults = (batch || []).map(function (row) {
        searchStart++;
        return row;
      }, this);
      results = results.concat(batchResults);
    } while ((batchResults || []).length === 1000);

    return results;
  }
});

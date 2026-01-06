/**
 * Copyright (c) 2025, ScaleNorth and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 *
 *
 * @author noe de jesus
 * @description updates child transactions related to a sales order
 *
 */

define(['N/search', 'N/record', 'N/runtime', './shared/sna_hul_update_child_transactions'], (
  search,
  record,
  runtime,
  UPDATE_UTIL,
) => {
  const getAllSearchResults = (resultSet) => {
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
  };

  function getInputData() {
    log.audit('=========START=========');
    // TODO - how to handle transaction where revenue stream for mainline is different for the line-level
    const searchObj = search.load({ id: 'customsearch_sna_so_with_internal_rs' });
    const script = runtime.getCurrentScript();
    const parameter = script.getParameter({ name: 'custscript_sn_so_ids_to_process' });
    if (parameter) {
      searchObj.filters.push(
        search.createFilter({
          name: 'internalid',
          operator: search.Operator.ANYOF,
          values: parameter.split(',').map((x) => x.trim()),
        }),
      );
    }

    const data = searchObj
      .run()
      .getRange({ start: 0, end: 1000 })
      .map((result) => ({
        id: result.getValue({ name: 'internalid', summary: search.Summary.GROUP }),
        documentNo: result.getValue({ name: 'tranid', summary: search.Summary.GROUP }),
        currentRevenueStreamId: result.getValue({ name: 'cseg_sna_revenue_st', summary: search.Summary.GROUP }),
        currentHulManufacturer: result.getValue({ name: 'line.cseg_hul_mfg', summary: search.Summary.GROUP }),
        currentEquipmentPosting: result.getValue({ name: 'line.cseg_sna_hul_eq_seg', summary: search.Summary.GROUP }),
        lineId: result.getValue({ name: 'line', summary: search.Summary.GROUP }),
        linkedPurchaseOrder: result.getValue({
          name: 'internalid',
          join: 'custcol_sna_linked_po',
          summary: search.Summary.GROUP,
        }),
      }));
    log.audit('getInputData:DATA', data);
    log.audit(
      'getInputData:salesorder ids',
      data.map((x) => x.id),
    );
    return data;
  }

  function map(context) {
    const values = JSON.parse(context.value);
    const {
      id: salesOrderId,
      documentNo,
      currentRevenueStreamId: revenueStreamId,
      currentHulManufacturer,
      currentEquipmentPosting,
      linkedPurchaseOrder,
      lineId,
    } = values;
    log.audit('map:SEARCHING_FOR_RELATED_RECORDS', { salesOrderId, documentNo, revenueStreamId, lineId });
    const timeBills = UPDATE_UTIL.getRelatedTimeBills(salesOrderId).map((x) => ({
      recordType: record.Type.TIME_BILL,
      id: x.id,
      salesOrderLineId: x.salesOrderLineId,
    }));
    log.audit('map:TIME_BILLS', timeBills);
    const relatedPurchaseOrders = UPDATE_UTIL.getRelatedPurchaseOrders(salesOrderId);
    log.audit('map:RELATED_PURCHASE_ORDERS', relatedPurchaseOrders);
    const relatedTransactions = UPDATE_UTIL.getRelatedTransactions(salesOrderId);
    log.audit('map:RELATED_TRANSACTIONS', relatedTransactions);
    let relatedRecords = [...timeBills, ...relatedTransactions, ...relatedPurchaseOrders];
    context.write({
      key: `${salesOrderId}}`,
      value: {
        salesOrderLineId: lineId,
        revenueStreamId,
        currentHulManufacturer,
        currentEquipmentPosting,
        linkedPurchaseOrder,
        relatedRecords,
      },
    });
  }

  function reduce(context) {
    log.audit('===START_REDUCE===');
    log.audit('KEY', context.key);
    log.audit('VALUES', context.values);
    const salesOrderId = context.key.replace(/[^0-9]/g, '');
    const salesOrder = record.load({
      type: record.Type.SALES_ORDER,
      id: salesOrderId,
    });

    const lineCount = salesOrder.getLineCount({ sublistId: 'item' });
    for (let line = 0; line < lineCount; line++) {
      salesOrder.setSublistValue({
        sublistId: 'item',
        fieldId: 'cseg_sna_revenue_st',
        line,
        value: salesOrder.getValue({ fieldId: 'cseg_sna_revenue_st' }) || null,
      });
    }

    try {
      salesOrder.save({ ignoreMandatoryFields: true });
    } catch (err) {
      log.error({
        title: 'ERROR_UPDATING_SALES_ORDER_LINE_RS',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }

    const values = context.values.map((x) => JSON.parse(x));
    log.audit('VALUES_PARSED', values);
    const revenueStreamPerLine = values.map((x) => ({
      salesOrderLineId: x.salesOrderLineId,
      revenueStreamId: x.revenueStreamId,
      hulManufacturerId: x.currentHulManufacturer,
      equipmentPostingId: x.currentEquipmentPosting,
      linkedPurchaseOrder: x.linkedPurchaseOrder,
    }));
    const relatedRecords = values.reduce((arr, x) => arr.concat(x.relatedRecords), []);
    log.audit('RELATED_RECORDS[0]', relatedRecords[0]);
    log.audit('RELATED_RECORDS', relatedRecords);
    log.audit('REVENUE_STREAM_PER_LINE', revenueStreamPerLine);
    const {
      CASH_SALE,
      INVOICE,
      ITEM_FULFILLMENT,
      ITEM_RECEIPT,
      CUSTOMER_DEPOSIT,
      PURCHASE_ORDER,
      RETURN_AUTHORIZATION,
      TIME_BILL,
    } = record.Type;
    const pullId = (x) => x.id;
    const removeDuplicates = (x, i, arr) => arr.indexOf(x) == i;
    const timeBills = relatedRecords.filter((x) => x.recordType == TIME_BILL);
    const timeBillIds = timeBills.map(pullId).filter(removeDuplicates);
    log.audit(`TIME_BILLS_${timeBillIds.length}`, {
      timeBills,
    });
    const cashSales = relatedRecords.filter((x) => x.recordType == CASH_SALE);
    const cashSaleIds = cashSales.map(pullId).filter(removeDuplicates);
    const invoices = relatedRecords
      .filter((x) => x.recordType == INVOICE)
      .reduce((arr, x) => {
        const hasMatch = arr.find((y) => y.id == x.id && y.lineId == x.lineId);
        if (hasMatch) return arr;
        arr.push(x);
        return arr;
      }, []);
    const invoiceIds = invoices.map(pullId).filter(removeDuplicates);
    log.audit(`INVOICES_${invoiceIds.length}`, {
      invoices,
    });
    const itemFulfillments = relatedRecords
      .filter((x) => x.recordType == ITEM_FULFILLMENT)
      .reduce((arr, x) => {
        const hasMatch = arr.find((y) => y.id == x.id && y.lineId == x.lineId);
        if (hasMatch) return arr;
        arr.push(x);
        return arr;
      }, []);
    const itemFulfillmentIds = itemFulfillments.map(pullId).filter(removeDuplicates);
    log.audit(`ITEM_FULFILLMENTS_${itemFulfillmentIds.length}`, {
      itemFulfillments,
      itemFulfillmentIds,
    });
    const purchaseOrders = relatedRecords
      .filter((x) => x.recordType == PURCHASE_ORDER)
      .reduce((arr, x) => {
        const hasMatch = arr.find((y) => y.id == x.id && y.lineId == x.lineId);
        if (hasMatch) return arr;
        arr.push(x);
        return arr;
      }, []);
    const purchaseOrderIds = purchaseOrders.map(pullId).filter(removeDuplicates);
    log.audit(`PURCHASE_ORDERS_${purchaseOrderIds.length}`, {
      purchaseOrders,
      purchaseOrderIds,
    });
    const returnAuthorizations = relatedRecords
      .filter((x) => x.recordType == RETURN_AUTHORIZATION)
      .reduce((arr, x) => {
        const hasMatch = arr.find((y) => y.id == x.id && y.lineId == x.lineId);
        if (hasMatch) return arr;
        arr.push(x);
        return arr;
      }, []);
    const returnAuthorizationIds = returnAuthorizations.map(pullId).filter(removeDuplicates);
    log.audit(`RETURN_AUTHORIZATIONS_${returnAuthorizationIds.length}`, {
      returnAuthorizations,
      returnAuthorizationIds,
    });
    const itemReceipts = relatedRecords
      .filter((x) => x.recordType == ITEM_RECEIPT)
      .reduce((arr, x) => {
        const hasMatch = arr.find((y) => y.id == x.id && y.lineId == x.lineId);
        if (hasMatch) return arr;
        arr.push(x);
        return arr;
      }, []);
    const itemReceiptIds = itemReceipts.map(pullId).filter(removeDuplicates);
    log.audit(`ITEM_RECEIPTS_${itemReceiptIds.length}`, {
      itemReceipts,
      itemReceiptIds,
    });
    const customerDeposits = relatedRecords
      .filter((x) => x.recordType == CUSTOMER_DEPOSIT)
      .reduce((arr, x) => {
        const hasMatch = arr.find((y) => y.id == x.id && y.lineId == x.lineId);
        if (hasMatch) return arr;
        arr.push(x);
        return arr;
      }, []);
    const customerDepositIds = customerDeposits.map(pullId).filter(removeDuplicates);
    log.audit(`CUSTOMER_DEPOSITS_${customerDepositIds.length}`, {
      customerDeposits,
      customerDepositIds,
    });
    log.audit({
      title: 'STARTING_UPDATES',
      details: { salesOrderId },
    });

    const script = runtime.getCurrentScript();
    log.audit('reduce:REMAINING_GOVERNANCE', script.getRemainingUsage());

    itemFulfillmentIds.forEach((id) =>
      UPDATE_UTIL.updateItemFulfillment({ id, itemFulfillments, revenueStreamPerLine, isVRAFulfillment: false }),
    );
    log.audit('reduce:REMAINING_GOVERNANCE:ITEM_FULFILLMENTS', script.getRemainingUsage());

    timeBillIds.forEach((id) => UPDATE_UTIL.updateTimeBill({ id, timeBills, revenueStreamPerLine }));
    log.audit('reduce:REMAINING_GOVERNANCE:AFTER_TIME_BILLS', script.getRemainingUsage());

    invoiceIds.forEach((id) => UPDATE_UTIL.updateInvoice({ id, invoices, revenueStreamPerLine }));
    log.audit('reduce:REMAINING_GOVERNANCE:AFTER_INV_CP_JE', script.getRemainingUsage());

    purchaseOrderIds.forEach((id) => UPDATE_UTIL.updatePurchaseOrders({ id, purchaseOrders, revenueStreamPerLine }));
    log.audit('reduce:REMAINING_GOVERNANCE:AFTER_PO/VB/IR/VRA/IF', script.getRemainingUsage());

    returnAuthorizationIds.forEach((id) => UPDATE_UTIL.updateReturnAuthorizations({ id, revenueStreamPerLine }));
    log.audit('reduce:REMAINING_GOVERNANCE:RMA/IR', script.getRemainingUsage());
    const isInDebugMode = script.getParameter({ name: 'custscript_sn_dev_debug' }) || false;
    record.submitFields
      .promise({
        id: salesOrderId,
        type: record.Type.SALES_ORDER,
        values: {
          custbody_sna_child_updated: isInDebugMode ? false : true,
        },
      })
      .then((salesOrderId) => {
        log.audit({
          title: 'RELATED_RECORDS_UPDATED',
          details: {
            salesOrderId,
            revenueStreamPerLine,
          },
        });
      })
      .catch((err) => {
        log.error({
          title: 'ERROR_UPDATING_SALES_ORDER_DETAILS',
          details: {
            message: err.message,
            stack: err.stack,
          },
        });
      });
    log.audit('===END_REDUCE===');
  }

  function summarize(context) {
    context.mapSummary.errors.iterator().each((key, err, executionNo) => {
      log.error({
        title: `map:ERROR:${err.name}`,
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
      return true;
    });

    context.reduceSummary.errors.iterator().each((key, err, executionNo) => {
      log.error({
        title: `reduce:ERROR:${err.name}`,
        details: err,
      });
      return true;
    });

    log.audit('=========END=========');
  }

  return { getInputData, map, reduce, summarize };
});

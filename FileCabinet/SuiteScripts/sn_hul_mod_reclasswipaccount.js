/*
 * Copyright (c) 2024, ScaleNorth and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * Module script for reclass WIP
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/9/23       		                 aduldulao       Initial version.
 * 2025/03/12                            elausin         Fixed JE line memo
 * 2025/04/15       268746              noe             merge uncomitted changes with working branch
 */

/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/runtime'], /**
 * @param{record} record
 * @param{search} search
 */ (record, search, runtime) => {
  // UTILITY FUNCTIONS
    function isEmpty(stValue) {
      return (
        stValue === ''
        || stValue == null
        || stValue == undefined
        || (stValue.constructor === Array && stValue.length == 0)
        || (stValue.constructor === Object
          && (function (v) {
            for (let k in v) return false;
            return true;
          })(stValue))
      );
    }

    function forceFloat(stValue) {
      let flValue = parseFloat(stValue);
      if (isNaN(flValue) || stValue == 'Infinity') {
        return 0.0;
      }
      return flValue;
    }

    const reverseWIPAccount = (newRec, rectype) => {
      const stLoggerTitle = 'reverseWIPAccount';

      let invid = newRec.getValue({ fieldId: 'createdfrom' });
      log.debug({ title: stLoggerTitle, details: `invid: ${invid}` });

      if (!isEmpty(invid)) {
        let jeIds = [];

        // search JE with WIP invoice = invoice from CM
        let filters = [];
        filters.push(
          search.createFilter({ name: 'custbody_sna_hul_inv_wip', operator: search.Operator.IS, values: invid }),
        );
        filters.push(search.createFilter({ name: 'reversalnumber', operator: search.Operator.ISEMPTY }));
        filters.push(search.createFilter({ name: 'isreversal', operator: search.Operator.IS, values: false }));
        filters.push(search.createFilter({ name: 'mainline', operator: search.Operator.IS, values: true }));

        let csearch = search.create({ type: record.Type.JOURNAL_ENTRY, filters: filters });

        csearch.run().each(function (result) {
          jeIds.push(result.id);
          return true;
        });

        log.debug({ title: stLoggerTitle, details: `jeIds: ${JSON.stringify(jeIds)}` });

        if (!isEmpty(jeIds)) {
          updateJE(jeIds, rectype);
        }
      }
    };

    const updateJE = (jeIds, rectype) => {
      const stLoggerTitle = 'updateJE';

      jeIds = jeIds.filter((value, index, array) => array.indexOf(value) === index);

      for (let z = 0; z < jeIds.length; z++) {
        let je = jeIds[z];

        if (!isEmpty(je)) {
          record.submitFields({ type: record.Type.JOURNAL_ENTRY, id: je, values: { reversaldate: new Date() } });
          log.debug({ title: stLoggerTitle, details: `JE reversed: ${je}` });
        }
      }
    };

    const reclassWIPAccount = (newRec, rectype) => {
      const stLoggerTitle = 'reclassWIPAccount';
      log.debug('reclassWIPAccount', '-----START-----');

      let isNotElgibileToProceed = false;

      let createdfrom = record.Type.INVOICE ? newRec.getValue({ fieldId: 'createdfrom' }) : newRec.fields.createdfrom; // this is using a stringified newRec object from a WFA

      log.debug('reclassWIPAccount', 'createdfrom:' + createdfrom);
      if (isEmpty(createdfrom)) return;

      let ifIds = [];

      const customer = newRec.getValue({ fieldId: 'entity' });
      if (rectype == record.Type.INVOICE) {
        let fulfillmentIdSearch = search.create({
          type: search.Type.TRANSACTION,
          filters: [
            search.createFilter({ name: 'type', operator: 'anyof', values: 'ItemShip' }),
            search.createFilter({ name: 'mainline', operator: 'is', values: 'T' }),
            search.createFilter({ name: 'createdfrom', operator: 'anyof', values: createdfrom }),
          ],
          columns: ['internalid'],
        });

        fulfillmentIdSearch.run().each(function (result) {
          ifIds.push(result.id);
          return true;
        });
        if (ifIds.length <= 0) {
          return;
        }
      }
      else {
        let internalid = newRec.id;

        ifIds.push(internalid);
        if (ifIds.length <= 0) {
          return;
        }
      }
      log.debug('reclassWIPAccount:IF_IDS', ifIds);

      let invIftransactionnum = [];
      let invIfIds = [];
      let invIfJe = [];

      // customsearch_sna_hul_if_custom_gl_4
      let fulfillmentCustomGLSearch = search.load({ id: 'customsearch_sna_hul_if_custom_gl' });

      let filters = fulfillmentCustomGLSearch.filters;
      filters.push(search.createFilter({ name: 'internalid', operator: 'anyof', values: ifIds }));

      fulfillmentCustomGLSearch.filters = filters;
      var jeLines = [];
      fulfillmentCustomGLSearch.run().each(function (result) {
        if (rectype == 'itemfulfillment') {
          let values = JSON.parse(JSON.stringify(result)).values;
          // log.debug('fulfillmentCustomGLSearch', JSON.stringify(values));
          jeLines.push(values);
        }
        else if (rectype == 'invoice') {
          if (!invIftransactionnum.includes(result.getValue({ name: 'transactionnumber' }))) {
            invIftransactionnum.push(result.getValue({ name: 'transactionnumber' }));
            invIfIds.push(result.getValue({ name: 'internalid' }));
            if (!isEmpty(result.getValue({ name: 'custbody_sna_hul_je_wip' }))) {
              invIfJe.push(result.getValue({ name: 'custbody_sna_hul_je_wip' }));
            }
          }
        }

        return true;
      });

      if (rectype == record.Type.INVOICE) {
        let currentScript = runtime.getCurrentScript();
        let to_acc = currentScript.getParameter({ name: 'custscript_sna_hul_gl_wip_account' });

        var jeLines = [];

        let invoiceLines = [];
        let invoiceItems = [];

        let filters = [
          search.createFilter({ name: 'internalid', operator: search.Operator.IS, values: newRec.id }),
          search.createFilter({ name: 'cogs', operator: search.Operator.IS, values: false }),
          search.createFilter({ name: 'taxline', operator: search.Operator.IS, values: false }),
          search.createFilter({ name: 'shipping', operator: search.Operator.IS, values: false }),
          search.createFilter({ name: 'item', operator: search.Operator.NONEOF, values: '@NONE@' }),
        ];

        let col = [
          search.createColumn({ name: 'item', summary: 'GROUP' }),
          search.createColumn({ name: 'quantity', summary: 'SUM' }),
        ];

        let csearch = search.create({ type: record.Type.INVOICE, filters: filters, columns: col });

        csearch.run().each(function (result) {
          invoiceLines.push({
            item: result.getValue({ name: 'item', summary: 'GROUP' }),
            quantity: result.getValue({ name: 'quantity', summary: 'SUM' }),
          });

          invoiceItems.push(result.getValue({ name: 'item', summary: 'GROUP' }));

          return true;
        });

        log.debug({ title: stLoggerTitle, details: `invoiceLines: ${JSON.stringify(invoiceLines)}` });
        log.debug({ title: stLoggerTitle, details: `invoiceItems: ${JSON.stringify(invoiceItems)}` });
        // customsearch_sn_hul_invoiceif_custom_new
        let itemRates = {};
        let ifData = [];
        let invfulfillmentCustomGLSearch = search.load({ id: 'customsearch_sn_hul_invoiceif_custom_new' });
        invfulfillmentCustomGLSearch.filters.push(
          search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: ifIds }),
          search.createFilter({ name: 'item', operator: search.Operator.ANYOF, values: invoiceItems }),
        );

        invfulfillmentCustomGLSearch.run().each(function (result) {
          let account = result.getValue({ name: 'account', summary: 'GROUP' }); // COGS
          let location = result.getValue({ name: 'location', summary: 'GROUP' });
          let transactionnum = result.getValue({ name: 'transactionnumber', summary: 'GROUP' });
          let dept = result.getValue({ name: 'department', summary: 'GROUP' });
          let revenueStream = result.getValue({ name: 'line.cseg_sna_revenue_st', summary: 'GROUP' });
          const equipmentPosting = result.getValue({ name: 'line.cseg_sna_hul_eq_seg', summary: 'GROUP' });
          const hulManufacturer = result.getValue({ name: 'line.cseg_hul_mfg', summary: 'GROUP' });
          let item = result.getValue({ name: 'item', summary: 'GROUP' });
          let amount = result.getValue({ name: 'amount', summary: 'SUM' });
          let quantity = result.getValue({ name: 'quantity', summary: 'SUM' });
          let rate = forceFloat(amount) / forceFloat(quantity);

          itemRates = {
            account: account,
            rate: rate,
            item: item,
            location: location,
            transactionnum: transactionnum,
            department: dept,
            revenueStream: revenueStream,
            equipmentPosting: equipmentPosting,
            hulManufacturer: hulManufacturer,
            amount: amount,
            quantity: quantity,
          };

          ifData.push(itemRates);
          return true;
        });

        log.debug({ title: stLoggerTitle, details: `itemRates: ${JSON.stringify(itemRates)}` });
        // start elausin
        for (let i = 0; i < ifData.length; i++) {
          let finItmRate = ifData[i];
          log.debug({ title: stLoggerTitle, details: `finItmRate: ${JSON.stringify(finItmRate)}` });

          if (!isEmpty(finItmRate)) {
          // debit line
            jeLines.push({
              invIfJe: invIfJe.toString(),
              invIfIds: invIfIds.toString(),
              account: finItmRate.account,
              memo: finItmRate.transactionnum,
              location: finItmRate.location,
              department: finItmRate.department,
              entity: newRec.getValue({ fieldId: 'job' }) || newRec.getValue({ fieldId: 'entity' }),
              cseg_sna_revenue_st: finItmRate.revenueStream,
              cseg_sna_hul_eq_seg: finItmRate.equipmentPosting,
              cseg_hul_mfg: finItmRate.hulManufacturer,
              custcol_sn_ref_item: finItmRate.item,
              debit: forceFloat(finItmRate.amount), // expected to be negative
            });

            // credit line
            jeLines.push({
              invIfJe: invIfJe.toString(),
              invIfIds: invIfIds.toString(),
              account: to_acc,
              memo: finItmRate.transactionnum,
              location: finItmRate.location,
              department: finItmRate.department,
              entity: newRec.getValue({ fieldId: 'job' }) || newRec.getValue({ fieldId: 'entity' }),
              cseg_sna_revenue_st: finItmRate.revenueStream,
              cseg_sna_hul_eq_seg: finItmRate.equipmentPosting,
              cseg_hul_mfg: finItmRate.hulManufacturer,
              custcol_sn_ref_item: finItmRate.item,
              credit: forceFloat(finItmRate.amount),
            });
          }
        }
        /* for (let i = 0; i < invoiceLines.length; i++) {
        let invitm = invoiceLines[i].item;
        let invqty = invoiceLines[i].quantity;

        let finalItemRate = itemRates[invitm];
        log.debug({
          title: stLoggerTitle,
          details: `invitm: ${invitm} | finItmRate: ${JSON.stringify(finalItemRate)}`,
        });

        // custcol_sn_ref_item
        if (!isEmpty(finalItemRate)) {
          // debit line
          jeLines.push({
            invIfJe: invIfJe.toString(),
            invIfIds: invIfIds.toString(),
            account: finalItemRate.account,
            memo: finalItemRate.transactionnum,
            location: finalItemRate.location,
            department: finalItemRate.department,
            entity: newRec.getValue({ fieldId: 'job' }),
            cseg_sna_revenue_st: finalItemRate.revenueStream,
            cseg_sna_hul_eq_seg: finalItemRate.equipmentPosting,
            cseg_hul_mfg: finalItemRate.hulManufacturer,
            custcol_sn_ref_item: finalItemRate.item,
            debit: forceFloat(invqty) * forceFloat(finalItemRate.rate), // expected to be negative
          });

          // credit line
          jeLines.push({
            invIfJe: invIfJe.toString(),
            invIfIds: invIfIds.toString(),
            account: to_acc,
            memo: finalItemRate.transactionnum,
            location: finalItemRate.location,
            department: finalItemRate.department,
            entity: newRec.getValue({ fieldId: 'job' }),
            cseg_sna_revenue_st: finalItemRate.revenueStream,
            cseg_sna_hul_eq_seg: finalItemRate.equipmentPosting,
            cseg_hul_mfg: finalItemRate.hulManufacturer,
            custcol_sn_ref_item: finalItemRate.item,
            credit: forceFloat(invqty) * forceFloat(finalItemRate.rate),
          });
        }
      } */
        // end elausin
        isNotElgibileToProceed = isNotEligibleToProceedForJE(rectype, ifIds, invoiceItems);
        log.debug('isNotElgibileToProceed', JSON.stringify(isNotElgibileToProceed));
      }

      if (jeLines.length == 0) {
        log.debug('reclassWIPAccount', 'Exiting. No Lines to Reclass');
        return;
      }

      log.debug('reclassWIPAccount jeLines', JSON.stringify(jeLines));
      if (!isNotElgibileToProceed) {
        let jeId = createJE(newRec, jeLines, rectype);
        log.debug('reclassWIPAccount jeId', jeId);
      }
      else {
        log.debug('Dont Contain Reclass COGS in JE ', 'SKIPPING LINES');
      }
    };
    const isNotEligibleToProceedForJE = (rectype, ifIds, invoiceItems) => {
      const logTitle = 'isEligibleToProceedForJE';
      log.debug(logTitle, 'START');
      let itemRatesUs = [];

      let invfulfillmentCustomGLSearch2 = search.load({ id: 'customsearch_sna_hul_invoiceif_custom_2' });
      let invfilters2 = invfulfillmentCustomGLSearch2.filters;

      invfilters2.push(search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: ifIds }));

      invfulfillmentCustomGLSearch2.filters = invfilters2;

      invfulfillmentCustomGLSearch2.run().each(function (result) {
        let memo = result.getValue({ name: 'memo', summary: 'GROUP' });

        itemRatesUs.push({ memo: memo });

        return true;
      });
      log.debug(logTitle, JSON.stringify({ itemRatesUs: itemRatesUs }));

      const checkReclassCogs = itemRatesUs.filter(el => el.memo === 'Reclass COGS');

      log.debug(logTitle, JSON.stringify({ checkReclassCogs: checkReclassCogs }));

      return checkReclassCogs.length <= 0 ? true : false;
    };

    const createJE = (newRec, jeLines, rectype) => {
      const fieldValues = {};

      if (rectype == 'invoice') {
        fieldValues.trandate = newRec.getValue({ fieldId: 'trandate' });
        fieldValues.subsidiary = newRec.getValue({ fieldId: 'subsidiary' });
        fieldValues.custbody_sna_hul_inv_wip = newRec.id;
        fieldValues.custbody_sna_hul_so_wip = newRec.getValue({ fieldId: 'createdfrom' });
        fieldValues.memo = `Journal Entry created from Invoice ${newRec.getValue({ fieldId: 'tranid' })}`;
        fieldValues.cseg_sna_revenue_st = newRec.getValue({ fieldId: 'cseg_sna_revenue_st' }) || null;
        fieldValues.cseg_sna_hul_eq_seg = newRec.getValue({ fieldId: 'cseg_sna_hul_eq_seg' }) || null;
        fieldValues.cseg_hul_mfg = newRec.getValue({ fieldId: 'cseg_hul_mfg' }) || null;
      }
      else if (rectype == 'itemfulfillment') {
        fieldValues.trandate = new Date(newRec.fields.trandate);
        fieldValues.subsidiary = newRec.fields.subsidiary;
        fieldValues.custbody_sna_hul_so_wip = newRec.fields.createdfrom;
        fieldValues.memo = `Journal Entry created on demand ${newRec.fields.transactionnumber}`;
        fieldValues.cseg_sna_revenue_st = newRec.fields.cseg_sna_revenue_st || null;
        fieldValues.cseg_sna_hul_eq_seg = newRec.fields.cseg_sna_hul_eq_seg || null;
        fieldValues.cseg_hul_mfg = newRec.fields.cseg_hul_mfg || null;
      }

      const journalEntry = record.create({ type: record.Type.JOURNAL_ENTRY, isDynamic: true });

      // Set fields on the Journal Entry record
      for (let [fieldId, value] of Object.entries(fieldValues)) {
        journalEntry.setValue({ fieldId, value });
      }

      let ifArray = [];
      let currentJes = [];
      let invIfJe = [];

      const sublistId = 'line';
      log.audit('createJE:JE_LINES', jeLines);
      jeLines.forEach((props) => {
        const { invIfJe: invIfJes, invIfIds, ...lineItem } = props;
        journalEntry.selectNewLine({ sublistId });
        for (let [fieldId, value] of Object.entries(lineItem)) {
          journalEntry.setCurrentSublistValue({ sublistId, fieldId, value });
        }
        journalEntry.commitLine({ sublistId });
        if (!isEmpty(lineItem.internalid)) {
          if (!ifArray.includes(lineItem.internalid[0].value)) {
            ifArray.push(lineItem.internalid[0].value);
          }
        }
        else {
          ifArray = !isEmpty(invIfIds) ? invIfIds.split(',') : [];
        }
        invIfJe = !isEmpty(invIfJes) ? invIfJes.split(',') : [];
        currentJes = lineItem.custbody_sna_hul_je_wip;
        log.debug('currentJes', ' currentJes: ' + JSON.stringify(currentJes));
      });

      let arrJeIds = [];
      if (!isEmpty(currentJes)) {
        for (let z = 0; z < currentJes.length; z++) {
          if (!isEmpty(currentJes[z])) {
            arrJeIds.push(currentJes[z].value);
          }
        }
      }
      else if (!isEmpty(invIfJe)) {
        arrJeIds = [...invIfJe];
      }

      log.debug('arrJeIds', ' Existing WIP JEs: ' + JSON.stringify(arrJeIds));

      // Save the Journal Entry record
      let journalEntryId = journalEntry.save();
      log.debug('journalEntryId', ' WIP JE created: ' + journalEntryId);
      arrJeIds.push(journalEntryId);

      for (let i in ifArray) {
        record.submitFields
          .promise({
            type: record.Type.ITEM_FULFILLMENT,
            id: ifArray[i],
            values: { custbody_sna_hul_je_wip: arrJeIds },
            options: { enableSourcing: false, ignoreMandatoryFields: true },
          })
          .catch((err) => {
            log.error({
              title: 'createJE: ERROR_UPDATING_ITEM_FULFILLMENT_TAG',
              details: { message: err.message, stack: err.stack },
            });
          });
        log.debug('itemfulfillment updated', ' Fulfillment | JE: ' + ifArray[i] + ' | ' + journalEntryId);
      }

      return journalEntryId;
    };

    return { reclassWIPAccount, reverseWIPAccount };
  });

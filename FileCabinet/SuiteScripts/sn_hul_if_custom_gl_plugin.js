/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType customglplugin
 *
 * @author elausin
 * @descripton Convert custom GL plugin from 1.0 to 2.0
 *
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2025/03/26                             elausin        Initial version
 *
 */
define(['N/record', 'N/search', 'N/runtime'], function (record, search, runtime) {
  function customizeGlImpact(context) {
    const rec = context.transactionRecord;
    log.debug('DEBUG', 'recType: ' + JSON.stringify(rec));

    try {
      if (rec.type === 'itemfulfillment') {
        const recid = rec.id;
        const userObj = runtime.getCurrentUser();

        // company preferences
        const WIP_ACCOUNT = userObj.getPreference({ name: 'custscript_sna_hul_gl_wip_account' });
        log.debug('DEBUG', 'to_acc: ' + WIP_ACCOUNT);

        if (isEmpty(WIP_ACCOUNT) || WIP_ACCOUNT === '0') return;

        const createdFrom = rec.getValue('createdfrom');
        const createdFromText = rec.getText('createdfrom');
        log.debug({ title: 'CREATED_FROM_VALUES', details: { createdFrom, createdFromText } });
        if (isEmpty(createdFrom) || createdFromText.indexOf('Sales Order') === -1) return;

        log.debug('DEBUG', 'createdFromText: ' + createdFromText);

        const salesOrderLookup = search.lookupFields({
          type: record.Type.SALES_ORDER,
          id: createdFrom,
          columns: ['customform'],
        });
        const soForm = Number(salesOrderLookup.customform[0].value);
        const salesOrderProject
          = rec.getValue({ fieldId: 'custbody_sna_project_mainline' }) || rec.getValue({ fieldId: 'entity' });

        log.debug('SALES_ORDER_FORM', { soForm });

        // Full Maintenance Order, Parts and Object Orders, Parts and Object Orders - Tom, NXC Sales Order (2)
        const forms = {
          FULL_MAINTENANCE: 112,
          PARTS_AND_OBJECTS: 113,
          PARTS_AND_OBJECTS_TOM: 106,
          NXC_SALES_ORDER: 153,
        };
        const validForms = Object.values(forms);
        if (!validForms.includes(soForm)) return;

        const { customLines, standardLines } = context;
        log.debug('DEBUG', 'customLines count: ' + customLines.count);
        log.debug('DEBUG', 'standardLines count: ' + standardLines.count);

        // no work to complete
        if (standardLines.count == 0) return;

        const transactionnumber = rec.getValue({ fieldId: 'transactionnumber' });
        log.debug('DEBUG', 'transactionNumber: ' + transactionnumber);

        const jetxt = rec.getValue({ fieldId: 'custbody_sna_hul_je_wip' });

        let jeId = [];
        if (recid && jetxt) {
          jeId = rec.getValue('custbody_sna_hul_je_wip').toString().split(',');
          log.audit('WIP_JE_ID', jeId);
        }
        // remove all non-valid values
        jeId = jeId.filter(x => !isEmpty(x));

        let jeLinesObj = [];
        log.debug('DEBUG', 'JE Exists?', jeId ? 'JE Exists ' + JSON.stringify(jeId) : 'No associated JE');

        if (recid != null) {
          const { GROUP, SUM } = search.Summary;
          const searchObj = search.create({
            type: 'itemfulfillment',
            filters: [
              ['type', 'anyof', 'ItemShip'],
              'AND',
              ['mainline', 'is', 'F'],
              'AND',
              ['posting', 'is', 'T'],
              'AND',
              ['customgl', 'is', 'F'],
              'AND',
              ['accounttype', 'anyof', 'COGS'],
              'AND',
              ['internalid', 'anyof', recid],
            ],
            columns: [
              search.createColumn({ name: 'transactionnumber', summary: GROUP, label: 'Transaction Number' }),
              search.createColumn({ name: 'account', summary: GROUP, label: 'Account' }),
              search.createColumn({ name: 'amount', summary: SUM, label: 'Amount' }),
              search.createColumn({ name: 'department', summary: GROUP, label: 'Department' }),
              search.createColumn({ name: 'location', summary: GROUP, label: 'Location' }),
              search.createColumn({ name: 'line.cseg_sna_revenue_st', summary: GROUP, label: 'Revenue Streams' }),
              search.createColumn({ name: 'line.cseg_sna_hul_eq_seg', summary: GROUP, label: 'Equipment Category' }),
              search.createColumn({ name: 'line.cseg_hul_mfg', summary: GROUP, label: 'Hul Manufacturer' }),
              search.createColumn({ name: 'quantity', summary: SUM, label: 'Quantity' }),
              search.createColumn({ name: 'class', summary: GROUP, label: 'Class' }),
              search.createColumn({ name: 'item', summary: GROUP, label: 'Item' }),
            ],
          });

          searchObj.run().each(function (result) {
            log.debug('DEBUG', 'result: ' + JSON.stringify(result));
            let cogs = {};
            cogs.transactionnumber = result.getValue({ name: 'transactionnumber', summary: GROUP });
            cogs.acc = result.getValue({ name: 'account', summary: GROUP });
            cogs.amt = result.getValue({ name: 'amount', summary: SUM });
            cogs.cls = result.getValue({ name: 'class', summary: GROUP }) || '';
            cogs.loc = result.getValue({ name: 'location', summary: GROUP }) || '';
            cogs.dep = result.getValue({ name: 'department', summary: GROUP }) || '';
            cogs.itm = result.getValue({ name: 'item', summary: GROUP }) || '';
            cogs.entityId = parseInt(salesOrderProject) || parseInt(rec.getValue({ fieldId: 'entity' }));
            cogs.revenueStream = result.getValue({ name: 'line.cseg_sna_revenue_st', summary: GROUP }) || '';
            cogs.equipCategory = result.getValue({ name: 'line.cseg_sna_hul_eq_seg', summary: GROUP }) || '';
            cogs.hulManuf = result.getValue({ name: 'line.cseg_hul_mfg', summary: GROUP }) || '';
            log.debug('DEBUG', 'cogs: ' + JSON.stringify(cogs));

            createCustomLines(cogs, customLines, WIP_ACCOUNT);
            if (jeId.length > 0) {
              jeLinesObj.push(cogs);
            }
            return true;
          });
          log.audit({
            title: 'JE_LINES',
            details: jeLinesObj,
          });
        }
        else {
          const accountIds = [];
          for (let index = 0; index < standardLines.count; index++) {
            const line = standardLines.getLine({ index });
            if (!line.isPosting) continue; // not a posting item
            if (line.id === 0) continue; // summary lines; ignore
            if (line.accountId == null) continue; // no account; ignore
            const accountId = line.accountId.toString();
            accountIds.push(accountId);
          }
          log.audit('ACCOUNT_IDS', accountIds);

          const accountTypeMapping = searchAccountTypes(accountIds);
          log.audit('ACCOUNT_TYPE_MAPPING', accountTypeMapping);

          for (let i = 0; i < standardLines.count; i++) {
            let line = context.standardLines.getLine({ index: i });
            if (!line.isPosting) continue; // not a posting item
            if (line.id === 0) continue; // summary lines; ignore
            if (line.accountId == null) continue; // no account; ignore
            const accountMatch = accountTypeMapping.find(x => x.accountId == line.accountId);
            const isCogs = accountMatch.type == 'COGS';

            if (isCogs) {
              let cogs = {};
              cogs.transactionnumber = transactionnumber;
              cogs.entityId = parseInt(salesOrderProject) || parseInt(rec.getValue({ fieldId: 'entity' }));
              cogs.acc = accountMatch.accountId;
              cogs.amt = line.debitAmount;
              cogs.cls = line.classId || '';
              cogs.loc = line.locationId || '';
              cogs.dep = line.departmentId || '';

              log.debug('DEBUG', 'cogs: ' + JSON.stringify(cogs));

              if (parseFloat(cogs.amt) <= 0) continue;

              createCustomLines(cogs, customLines, WIP_ACCOUNT);
              if (jeId.length > 0) {
                jeLinesObj.push(cogs);
              }
            }
          }
        }

        if (jeLinesObj.length > 0) {
          log.debug('DEBUG', 'JE Lines', JSON.stringify(jeLinesObj));
          updateJeLines(
            {
              lines: jeLinesObj,
              id: jeId,
            },
            rec,
            WIP_ACCOUNT,
          );
        }
      }
    }
    catch (e) {
      log.debug('ERROR', {
        message: e.message,
        stack: e.stack,
      });
    }
  }

  function updateJeLines(data, ifRec, to_acc) {
    log.debug({
      title: 'updateJeLines_data',
      details: data,
    });
    let jeIds = data.id;
    let lines = data.lines;
    log.debug('DEBUG', 'jeIds len: ' + jeIds.length);

    for (let q = 0; q < jeIds.length; q++) {
      let je = jeIds[q];
      log.debug('DEBUG', 'JE:' + je);

      let jeRec = record.load({
        type: record.Type.JOURNAL_ENTRY,
        id: je,
        isDynamic: true,
      });

      let removedItemsFromIF = ifRec.getValue('custbody_sn_removed_lines').split(',');
      log.debug('DEBUG', 'removedItemsFromIF: ' + removedItemsFromIF);

      let ifTranNumber = ifRec.getValue('transactionnumber');
      log.debug('DEBUG', 'ifTranNumber: ' + ifTranNumber);

      let j = 0;
      let remLines = [];

      // remove lines first
      let lineItemCount = jeRec.getLineCount('line');
      log.debug('DEBUG', 'lineItemCount before removing items: ' + lineItemCount);

      for (let a = lineItemCount - 1; a >= 0; a--) {
        let jeLineItem = jeRec.getSublistValue({ sublistId: 'line', fieldId: 'custcol_sn_ref_item', line: a });
        log.debug('DEBUG', 'jeLineItem: ' + jeLineItem);
        let jeLineMemo = jeRec.getSublistValue({ sublistId: 'line', fieldId: 'memo', line: a });
        log.debug('DEBUG', 'jeLineMemo: ' + jeLineMemo);

        if (jeLineMemo === ifTranNumber && removedItemsFromIF.indexOf(jeLineItem) !== -1) {
          try {
            log.debug('DEBUG', 'Remove this line: ' + a);
            jeRec.removeLine({ sublistId: 'line', line: a, ignoreRecalc: true });
          }
          catch (e) {
            log.debug('DEBUG', 'Erron on removing line: ' + a);
          }
        }
      }

      lineItemCount = jeRec.getLineCount('line');
      log.debug('DEBUG', 'lineItemCount after removing items: ' + lineItemCount);

      for (let i = 0; i <= lineItemCount; i++) {
        if (j >= lines.length) {
          break;
        }
        if (jeRec.getSublistValue({ sublistId: 'line', fieldId: 'memo', line: i }) == lines[j].transactionnumber) {
          try {
            if (jeRec.getSublistValue({ sublistId: 'line', fieldId: 'custcol_sn_ref_item', line: i }) == lines[j].itm) {
              let lineObj = lines[j];

              log.debug('DEBUG', 'set debit line: ' + i);
              jeRec.selectLine({ sublistId: 'line', line: i });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'memo', value: lineObj.transactionnumber });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'location', value: lineObj.loc });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'department', value: lineObj.dep });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'account', value: lineObj.acc });
              jeRec.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'cseg_sna_revenue_st',
                value: lineObj.revenueStream,
              });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'cseg_hul_mfg', value: lineObj.hulManuf });
              jeRec.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'cseg_sna_hul_eq_seg',
                value: lineObj.equipCategory,
              });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'debit', value: lineObj.amt });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'credit', value: null });
              jeRec.commitLine({ sublistId: 'line', ignoreRecalc: true });

              i = i + 1;
              log.debug('DEBUG', 'set credit line: ' + i);
              jeRec.selectLine({ sublistId: 'line', line: i });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'memo', value: lineObj.transactionnumber });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'location', value: lineObj.loc });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'department', value: lineObj.dep });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'account', value: to_acc });
              jeRec.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'cseg_sna_revenue_st',
                value: lineObj.revenueStream,
              });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'cseg_hul_mfg', value: lineObj.hulManuf });
              jeRec.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'cseg_sna_hul_eq_seg',
                value: lineObj.equipCategory,
              });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'credit', value: lineObj.amt });
              jeRec.setCurrentSublistValue({ sublistId: 'line', fieldId: 'debit', value: null });
              jeRec.commitLine({ sublistId: 'line', ignoreRecalc: true });

              log.debug('DEBUG', 'Added Lines | lineObj: ' + JSON.stringify(lineObj));
              j++;
            }
          }
          catch (e) {
            log.debug({
              title: 'UNEXPECTED_ERROR',
              details: {
                message: e.message,
                stack: e.stack,
              },
            });
          }
        }
      }

      try {
        jeRec.save();
      }
      catch (e) {
        try {
          let err_title = 'Unexpected error';
          let err_description = '';
          if (e) {
            if (e instanceof nlobjError) {
              err_description = err_description + ' ' + e.getCode() + '|' + e.getDetails();
            }
            else {
              err_description = err_description + ' ' + e.toString();
            }
          }
          log.debug('ERROR', 'JE Log Error ' + err_description);
        }
        catch (ex) {
          log.debug('ERROR', 'JE Error performing error logging');
        }
      }
    }
  }

  function createCustomLines(cogs, customLines, to_acc) {
    // remove the original amount
    let newLine = customLines.addNewLine();
    newLine.accountId = parseInt(cogs.acc);
    newLine.entityId = cogs.entityId;
    if (cogs.loc) {
      newLine.locationId = parseInt(cogs.loc);
    }
    if (cogs.dep) {
      newLine.departmentId = parseInt(cogs.dep);
    }
    if (parseFloat(cogs.amt) >= 0) {
      newLine.creditAmount = cogs.amt;
    }
    newLine.memo = 'Reclass COGS';
    if (cogs.revenueStream) {
      newLine.setSegmentValueId({
        segmentId: 'cseg_sna_revenue_st',
        segmentValueId: parseInt(cogs.revenueStream),
      });
    }

    if (cogs.equipCategory) {
      newLine.setSegmentValueId({
        segmentId: 'cseg_sna_hul_eq_seg',
        segmentValueId: parseInt(cogs.equipCategory),
      });
    }

    if (cogs.hulManuf) {
      newLine.setSegmentValueId({
        segmentId: 'cseg_hul_mfg',
        segmentValueId: parseInt(cogs.hulManuf),
      });
    }

    newLine = customLines.addNewLine();
    newLine.accountId = parseInt(to_acc);
    newLine.entityId = cogs.entityId;
    if (cogs.loc) {
      newLine.locationId = parseInt(cogs.loc);
    }
    if (cogs.dep) {
      newLine.departmentId = parseInt(cogs.dep);
    }
    if (parseFloat(cogs.amt) >= 0) {
      newLine.debitAmount = cogs.amt;
    }
    newLine.memo = 'Reclass COGS';
    if (cogs.revenueStream) {
      newLine.setSegmentValueId({
        segmentId: 'cseg_sna_revenue_st',
        segmentValueId: parseInt(cogs.revenueStream),
      });
    }

    if (cogs.equipCategory) {
      newLine.setSegmentValueId({
        segmentId: 'cseg_sna_hul_eq_seg',
        segmentValueId: parseInt(cogs.equipCategory),
      });
    }

    if (cogs.hulManuf) {
      newLine.setSegmentValueId({
        segmentId: 'cseg_hul_mfg',
        segmentValueId: parseInt(cogs.hulManuf),
      });
    }

    log.debug({
      title: 'CUSTOM_LINES_ADDED',
      details: {
        reference: cogs,
      },
    });
  }

  function searchAccountTypes(accountIds) {
    const searchObj = search.create({
      type: search.Type.ACCOUNT,
      filters: [search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: accountIds })],
      columns: [search.createColumn({ name: 'internalid' }), search.createColumn({ name: 'type' })],
    });

    const results = searchObj.run().getRange({ start: 0, end: 1000 });
    return results.map(x => ({
      accountId: x.getValue({ name: 'internalid' }),
      type: x.getValue({ name: 'type' }),
    }));
  }

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

  return {
    customizeGlImpact: customizeGlImpact,
  };
});

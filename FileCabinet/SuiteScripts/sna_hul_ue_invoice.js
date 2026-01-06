/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author vpitale
 *
 * Script brief description:
 * UE script deployed on Invoice Record used for:
 * - Updating the Document Number of the Invoice using the Document Number from Sales Order.
 * - Create JE to reclassify WIP to COGS (from Item Fulfillments COGs to WIP)
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/03/11           168271           vpitale         Creating JE for time entries in sublist when invoice is updated.
 * 2024/01/12           124905           vpitale         Creating JE for time entries in sublist when invoice is created.
 * 2023/09/13           113440           sjprat          Add Aftersubmit, reclassWIPAccount & createJE
 * 2023/05/15           80975            vpitale         Updated the script to run consider field Last Invoice Sequence field to count old invoices in Doc Numbering.
 * 2023/05/15           80975            vpitale         Updated the script to run Doc Numbering in Bulk Operations.
 * 2023/03/09           10177            vpitale         Initial Version - Document Numbering
 * 2024/09/20           218961           aduldulao       Parts and Labor Margin
 * 2025/03/12                            elausin         Added link to item fulfillment
 * 2025/04/15           268746           noe             Add updated logic for warranty JE creation.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  'N/record',
  'N/search',
  'N/runtime',
  'N/https',
  'N/url',
  './sn_hul_mod_reclasswipaccount',
  './SNA/sna_hul_mod_invoiceWarrantyJe',
] /**
 * @param{record} record
 * @param{search} search
 */, (record, search, runtime, https, url, mod_reclasswip, WTY_JE_LIB) => {
  // UTILITY FUNCTIONS
  function isEmpty(stValue) {
    return (
      stValue === '' ||
      stValue == null ||
      stValue == undefined ||
      (stValue.constructor === Array && stValue.length == 0) ||
      (stValue.constructor === Object &&
        (function (v) {
          for (var k in v) return false;
          return true;
        })(stValue))
    );
  }

  function getFullResultSet(mySearch) {
    var searchResults = [],
      pagedData;
    pagedData = mySearch.runPaged({ pageSize: 1000 });
    pagedData.pageRanges.forEach(function (pageRange) {
      var page = pagedData.fetch({ index: pageRange.index });
      page.data.forEach(function (result) {
        searchResults.push(result);
      });
    });
    return searchResults;
  }

  function updateDocumentNumber(scriptContext) {
    var invCnt = 0;
    var rec = scriptContext.newRecord;
    log.audit('rec', rec);
    var createdFrom = rec.getValue({ fieldId: 'createdfrom' });
    log.audit('createdFrom', createdFrom);
    var lastInvSeq = rec.getValue({ fieldId: 'custbody_sna_hul_last_invoice_seq' });
    log.audit('lastInvSeq', lastInvSeq);

    // Executing the code only when the Invoice is created from Sales Order.
    if (!isEmpty(createdFrom)) {
      // Getting the Document Number from SalesOrder.
      var transSearch = search
        .create({
          type: 'transaction',
          filters: [['internalid', 'anyof', createdFrom], 'AND', ['mainline', 'is', 'T']],
          columns: ['type', 'tranid'],
        })
        .run()
        .getRange(0, 1);
      log.audit('transSearch', transSearch);

      // Executing the code only when the search is not empty.
      if (!isEmpty(transSearch)) {
        var type = transSearch[0].getValue({ name: 'type' });
        var docNum = transSearch[0].getValue({ name: 'tranid' });
        log.audit('type', type);
        log.audit('docNum', docNum);

        var invSrchObj = search.create({
          type: 'invoice',
          filters: [
            ['mainline', 'is', 'T'],
            'AND',
            ['type', 'anyof', 'CustInvc'],
            'AND',
            ['createdfrom', 'anyof', createdFrom],
          ],
          columns: ['tranid'],
        });

        var invSrch = getFullResultSet(invSrchObj);
        log.audit('invSrch', invSrch);

        // Executing the code only when the search is not empty.
        if (!isEmpty(invSrch)) {
          log.audit('invSrch length', invSrch.length);
          invCnt = invSrch.length;
        }

        // If the Last Invoice Sequence in empty then make the sequence number as zero.
        if (isEmpty(lastInvSeq)) {
          lastInvSeq = 0;
        }

        docNum = docNum + '-' + (invCnt + lastInvSeq + 1);

        // Executing the code only when the document Number is not empty.
        if (!isEmpty(docNum)) {
          rec.setValue({ fieldId: 'tranid', value: docNum });
        }
      }
    } else {
      log.error('Error', 'CustomForm is empty.');
    }
  }

  const beforeLoad = (scriptContext) => {
    try {
      // Executing the code only when the Estimate is getting created.
      if (scriptContext.type == scriptContext.UserEventType.CREATE) {
        var qryStrng = scriptContext.newRecord.getValue({ fieldId: 'entryformquerystring' });
        log.audit('qryStrng', qryStrng);
        log.audit('qryStrng index of bulk T', qryStrng.indexOf('bulk=T'));

        // Checking if the query string is empty.
        if (isEmpty(qryStrng) || (!isEmpty(qryStrng) && qryStrng.indexOf('bulk=T') == -1)) {
          updateDocumentNumber(scriptContext);
        }
      }
    } catch (e) {
      if (e.message != undefined) {
        log.error('ERROR', e.name + ' ' + e.message);
      } else {
        log.error('ERROR', 'Unexpected Error', e.toString());
      }
    }
  };

  const beforeSubmit = (scriptContext) => {
    // Executing the code only when the Estimate is getting created.
    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      log.audit('beforeSubmit scriptContext', scriptContext);
      var qryStrng = scriptContext.newRecord.getValue({ fieldId: 'entryformquerystring' });
      log.audit('qryStrng', qryStrng);
      log.audit('qryStrng index of bulk T', qryStrng.indexOf('bulk=T'));

      // Checking if the query string is empty.
      if (!isEmpty(qryStrng)) {
        // Code to verify whether the invoice is created from bulk operation or invoice sales orders.
        if (qryStrng.indexOf('bulk=T') > -1) {
          // Calling the function to update the document number only when invoice is created using bulk operation or invoice sales orders.
          updateDocumentNumber(scriptContext);
        }

        // start elausin - add related IF
        var urlArr = qryStrng.split('&');
        var ifIndex = urlArr.findIndex((element) => element.includes('itemship'));
        if (ifIndex > -1) {
          var ifStr = urlArr[ifIndex].split('=');
          var ifId = ifStr[1];

          if (!isEmpty(ifId)) {
            scriptContext.newRecord.setValue({ fieldId: 'custbody_sn_related_if', value: parseInt(ifId) });
          }
        }
        // end elausin - add related IF
      }
    }
  };

  const afterSubmit = (scriptContext) => {
    const { CREATE, EDIT, DELETE } = scriptContext.UserEventType;
    var newRec = scriptContext.newRecord;
    let createJEForEdit = newRec.getValue({ fieldId: 'custbody_sna_inv_create_je' });
    log.audit('Execution Details', {
      'scriptContext.type': scriptContext.type,
      'runtime.executionContext': runtime.executionContext,
      'newRec.id': newRec.id,
    });

    // Execting the code when the Invoice is created.
    if (scriptContext.type === CREATE) {
      try {
        // Calling the backend suitelet to Create the Journal Entry.
        //https.requestSuitelet.promise({ scriptId: 'customscript_sna_hul_bksl_createcogsje', deploymentId: 'customdeploy_sna_hul_bksl_createcogsje', method: https.Method.POST, urlParams: { invId: newRec.id, action: 'create' } });

        // aduldulao 7/11 - full URL and external suitelet URL. working
        var slUrl = url.resolveScript({
          scriptId: 'customscript_sna_hul_bksl_createcogsje',
          deploymentId: 'customdeploy_sna_hul_bksl_createcogsje',
          returnExternalUrl: true,
        });
        log.audit('slUrl', slUrl);
        https.post.promise({ url: slUrl, body: { invId: newRec.id, action: 'create' } });

        mod_reclasswip.reclassWIPAccount(newRec, 'invoice');
      } catch (e) {
        log.error('ERROR reclassWIPAccount', JSON.stringify(e));
      }
    }

    if (
        (runtime.executionContext == 'USERINTERFACE' || runtime.executionContext == 'CSVIMPORT') &&
        scriptContext.type === EDIT
      ) {
      var jeMemo = "Journal Entry created from Invoice " + newRec.getValue('tranid');
      var journalentrySearchObj = search.create({
        type: "journalentry",
        filters:
            [
              ["type","anyof","Journal"],
              "AND",
              ["multisubsidiary","is","F"],
              "AND",
              ["advintercompany","is","F"],
              "AND",
              ["memomain","contains",jeMemo],
              "AND",
              ["mainline","is","T"]
            ],
        columns:
            [
              search.createColumn({
                name: "internalid",
                summary: "GROUP",
                label: "Internal ID"
              }),
              search.createColumn({
                name: "tranid",
                summary: "GROUP",
                label: "Document Number"
              })
            ]
      });

      var searchResultCount = journalentrySearchObj.runPaged().count;
      log.debug("journalentrySearchObj result count",searchResultCount);

      if (searchResultCount <= 0) {
        mod_reclasswip.reclassWIPAccount(newRec, 'invoice');
      }
      //mod_reclasswip.reclassWIPAccount(newRec, 'invoice');
    }

    // Executing the code when the invoice is edited.
    if (scriptContext.type === EDIT) {
      // Executing only when the code is triggerred from User Interface or CSV Import.
      if (runtime.executionContext == 'USERINTERFACE' || runtime.executionContext == 'CSVIMPORT') {
        try {
          log.audit('Create JE Check Box', createJEForEdit);

          // Calling the function to create the new Journal Entry only when the Create JE checkbox is checked.
          if (createJEForEdit == true || createJEForEdit == 'true' || createJEForEdit == 'T') {
            // Calling the backend suitelet to Create the Journal Entry.
            /*
                            // aduldulao 7/11 - not working. returns 500 code. not sure why
                            let resp = https.requestSuitelet.promise({ scriptId: 'customscript_sna_hul_bksl_createcogsje', deploymentId: 'customdeploy_sna_hul_bksl_createcogsje', method: https.Method.POST, urlParams: { invId: newRec.id, action: 'edit' } });
                            log.audit('resp', resp);
                             */

            /* // aduldulao 7/11 - full URL and internal suitelet URL. working
                            let stAccountId = runtime.accountId;
                            let stAccId = stAccountId ? stAccountId.replace('_', '-') : stAccountId;
                            var slUrl = 'https://' + stAccId + '.app.netsuite.com' + url.resolveScript({scriptId: 'customscript_sna_hul_bksl_createcogsje', deploymentId: 'customdeploy_sna_hul_bksl_createcogsje'});
                            */

            // aduldulao 7/11 - full URL and external suitelet URL. working
            var slUrl = url.resolveScript({
              scriptId: 'customscript_sna_hul_bksl_createcogsje',
              deploymentId: 'customdeploy_sna_hul_bksl_createcogsje',
              returnExternalUrl: true,
            });
            log.audit('slUrl', slUrl);
            https.post.promise({ url: slUrl, body: { invId: newRec.id, action: 'edit' } });

            log.audit('Inside IF', 'Condition Satisfied.');
          }
        } catch (e) {
          log.error('Error', e);
        }
      }
    }

    if (scriptContext.type !== DELETE) {
      try {
        WTY_JE_LIB.createWarrantyJournalEntry(scriptContext);
      } catch (err) {
        log.error({ title: 'ERROR_IN_WTY_JE_CREATION', details: { message: err.message, stack: err.stack } });
      }
    }
  };

  return { beforeLoad, beforeSubmit, afterSubmit };
});

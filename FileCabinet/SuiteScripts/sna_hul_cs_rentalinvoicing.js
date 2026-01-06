/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script of sna_hul_sl_rentalinvoicing.js
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/8/18       		                 aduldulao       Initial version.
 * 2022/10/10       		             aduldulao       Track original values
 * 2022/11/7        		             aduldulao       New filters
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/format'], /**
 * @param{currentRecord} currentRecord
 * @param{url} url
 */ function (currentRecord, url, format) {
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

    let GLOBAL = {
      selected: '',
      custid: '',
      billdatefrm: '',
      billdateto: '',
      aracct: '',
      loc: '',
      xcred: '',
    };

    /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
    function pageInit(scriptContext) {
      let currrec = scriptContext.currentRecord;

      // Track original field values
      GLOBAL.selected = currrec.getValue({ fieldId: 'custpage_selectedfld' });
      GLOBAL.custid = currrec.getValue({ fieldId: 'custpage_custidfld' });
      GLOBAL.billdatefrm = currrec.getValue({ fieldId: 'custpage_billdatefrmfld' });
      GLOBAL.billdateto = currrec.getValue({ fieldId: 'custpage_billdatetofld' });
      GLOBAL.aracct = currrec.getValue({ fieldId: 'custpage_araccountfld' });
      GLOBAL.loc = currrec.getValue({ fieldId: 'custpage_locfld' });
      GLOBAL.xcred = currrec.getValue({ fieldId: 'custpage_so_includes_credit' }) ? 'T' : 'F';
    }

    /**
   * Function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @since 2015.2
   */
    function fieldChanged(scriptContext) {
    // Navigate to selected page
      if (scriptContext.fieldId == 'custpage_sna_pageid') {
        let currrec = scriptContext.currentRecord;

        let page = currrec.getValue({ fieldId: 'custpage_sna_pageid' });
        page = parseInt(page.split('_')[1]);

        redirectSuitelet(page, true, true);
      }
    }

    /**
   * Validation function to be executed when record is saved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @returns {boolean} Return true if record is valid
   *
   * @since 2015.2
   */
    function saveRecord(scriptContext) {
      let currrec = scriptContext.currentRecord;

      let arrselected = getSelected(currrec);
      let objcount = arrselected.length;

      if (objcount > 0) {
        currrec.setValue({ fieldId: 'custpage_selectedfld', value: arrselected.join(',') });
      }
      else {
        currrec.setValue({ fieldId: 'custpage_selectedfld', value: '' });
        alert('Please select at least one line');

        return false;
      }

      return true;
    }

    /**
   * Get selected orders
   * @param currrec
   * @returns {*[]}
   */
    function getSelected(currrec) {
      let arrselected = [];
      let temp = [];

      let selected = currrec.getValue({ fieldId: 'custpage_selectedfld' });
      if (!isEmpty(selected)) {
        arrselected = selected.split(',');
      }

      let sublistcount = currrec.getLineCount({ sublistId: 'custpage_invsublist' });

      for (i = 0; i < sublistcount; i++) {
        let isselected = currrec.getSublistValue({
          sublistId: 'custpage_invsublist',
          fieldId: 'custpage_selectsubfld',
          line: i,
        });
        let soid = currrec.getSublistValue({ sublistId: 'custpage_invsublist', fieldId: 'custpage_soidsubfld', line: i });
        temp = arrselected.indexOf(soid.toString());

        if (isselected) {
          if (temp == -1) {
            arrselected.push(soid);
          }
        }
        else if (temp != -1) {
          arrselected.splice(temp, 1);
        }
      }

      return arrselected;
    }

    /**
   * Redirects to current suitelet with parameters used to filter sublist
   * @param page
   * @param retainselected
   * @param frompagechange
   */
    function redirectSuitelet(page, retainselected, frompagechange) {
      let currrec = currentRecord.get();

      let arrselected = [];
      let selected = currrec.getValue({ fieldId: 'custpage_selectedfld' });
      let custid = currrec.getValue({ fieldId: 'custpage_custidfld' });
      let billdatefrm = currrec.getValue({ fieldId: 'custpage_billdatefrmfld' });
      let billdateto = currrec.getValue({ fieldId: 'custpage_billdatetofld' });
      let aracct = currrec.getValue({ fieldId: 'custpage_araccountfld' });
      let loc = currrec.getValue({ fieldId: 'custpage_locfld' });
      let excludeSoWithCredit = currrec.getValue({ fieldId: 'custpage_so_includes_credit' });
      if (retainselected) {
        arrselected = getSelected(currrec);
      }

      // Return filters back when changing pages
      if (frompagechange) {
        if (
          selected != GLOBAL.selected
          || custid != GLOBAL.custid
          || billdatefrm != GLOBAL.billdatefrm
          || billdateto != GLOBAL.billdateto
          || aracct != GLOBAL.aracct
          || loc != GLOBAL.loc
        ) {
          selected = GLOBAL.selected;
          custid = GLOBAL.custid;
          billdatefrm = GLOBAL.billdatefrm;
          billdateto = GLOBAL.billdateto;
          aracct = GLOBAL.aracct;
          loc = GLOBAL.loc;
          excludeSoWithCredit = GLOBAL.xcred;
        }
      }

      let fullURL = url.resolveScript({
        scriptId: 'customscript_sna_hul_sl_rentalinvoicing',
        deploymentId: 'customdeploy_sna_hul_sl_rentalinvoicing',
        params: {
          selected: arrselected.toString(),
          custid: custid,
          billdatefrm: !isEmpty(billdatefrm)
            ? format.format({ value: new Date(billdatefrm), type: format.Type.DATE })
            : '',
          billdateto: !isEmpty(billdateto) ? format.format({ value: new Date(billdateto), type: format.Type.DATE }) : '',
          aracct: aracct,
          page: page,
          loc: loc,
          init: 'F',
          xcred: excludeSoWithCredit == 'T' || excludeSoWithCredit == true ? 'T' : 'F',
        },
      });

      // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
      window.onbeforeunload = null;
      window.document.location = fullURL;
    }

    return {
      fieldChanged,
      saveRecord,
      redirectSuitelet,
      pageInit,
    };
  });

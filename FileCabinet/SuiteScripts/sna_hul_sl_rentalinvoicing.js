/**
 * Copyright (c) 2025, ScaleNorth and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define([
  'N/record',
  'N/redirect',
  'N/runtime',
  'N/search',
  'N/ui/serverWidget',
  'N/url',
  'N/format',
  'N/task',
  'N/email',
  './SNA/shared/sna_hul_mod_utils',
], /**
 * @param{record} record
 * @param{redirect} redirect
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */ (record, redirect, runtime, search, serverWidget, url, format, task, email, SNA_UTILS) => {
  const { isEmpty } = SNA_UTILS;

  function searchAllResults(objSearch, objOption) {
    if (isEmpty(objOption)) {
      objOption = {};
    }

    let arrResults = [];
    if (objOption.isLimitedResult == true) {
      let rs = objSearch.run();
      arrResults = rs.getRange(0, 1000);

      return arrResults;
    }

    let rp = objSearch.runPaged();
    rp.pageRanges.forEach(function (pageRange) {
      let myPage = rp.fetch({
        index: pageRange.index,
      });
      arrResults = arrResults.concat(myPage.data);
    });

    return arrResults;
  }

  function forceInt(stValue) {
    let flValue = parseInt(stValue);
    if (isNaN(flValue) || stValue == 'Infinity') {
      return 0;
    }
    return flValue;
  }

  let GLOBAL = {
    PAGESIZE: 50, // number of sales order in 1 page. min of 5
  };

  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    let method = scriptContext.request.method;

    let currentScript = runtime.getCurrentScript();
    let rentalitem = currentScript.getParameter({ name: 'custscript_sna_rental_serviceitem' });
    let param_ldw = currentScript.getParameter({ name: 'custscript_sna_group_ldw' });

    // GET
    if (method == 'GET') {
      var params = scriptContext.request.parameters;
      log.debug({ title: 'GET - params', details: JSON.stringify(params) });

      let pageId = params.page;
      let custid = params.custid;
      let billdatefrm = params.billdatefrm;
      let billdateto = params.billdateto;
      var aracct = params.aracct;
      var selected = params.selected;
      let loc = params.loc;
      let init = params.init;

      // create form
      let form = serverWidget.createForm({ title: 'Invoice Rental Orders', hideNavBar: false });
      form.clientScriptModulePath = './sna_hul_cs_rentalinvoicing.js';

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // add field groups
      let filtersfg = form.addFieldGroup({ id: 'custpage_filtersfg', label: 'Filters' });
      let arfg = form.addFieldGroup({ id: 'custpage_arfg', label: 'A/R Account' });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // create header fields
      let custidfld = form.addField({
        id: 'custpage_custidfld',
        type: serverWidget.FieldType.SELECT,
        label: 'Customer',
        source: 'customer',
        container: 'custpage_filtersfg',
      });
      custidfld.defaultValue = custid;

      let locfld = form.addField({
        id: 'custpage_locfld',
        type: serverWidget.FieldType.SELECT,
        label: 'Location',
        source: 'location',
        container: 'custpage_filtersfg',
      });
      locfld.defaultValue = loc;

      const includeCreditField = form.addField({
        id: 'custpage_so_includes_credit',
        type: serverWidget.FieldType.CHECKBOX,
        label: 'SO Includes Credit',
        container: 'custpage_filtersfg',
      });
      includeCreditField.defaultValue = params.xcred; // no need to parse to native boolean value

      let billdatefrmfld = form.addField({
        id: 'custpage_billdatefrmfld',
        type: serverWidget.FieldType.DATE,
        label: 'Bill Date From',
        container: 'custpage_filtersfg',
      });
      if (!isEmpty(billdatefrm)) {
        billdatefrm = format.format({ value: new Date(billdatefrm), type: format.Type.DATE });
      }
      billdatefrmfld.defaultValue = billdatefrm;

      let billdatetofld = form.addField({
        id: 'custpage_billdatetofld',
        type: serverWidget.FieldType.DATE,
        label: 'Bill Date To',
        container: 'custpage_filtersfg',
      });
      if (!isEmpty(billdateto)) {
        billdateto = format.format({ value: new Date(billdateto), type: format.Type.DATE });
      }
      else if (isEmpty(billdateto) && init != 'F') {
        billdateto = format.format({ value: new Date(), type: format.Type.DATE });
      }
      billdatetofld.defaultValue = billdateto;

      let araccountfld = form.addField({
        id: 'custpage_araccountfld',
        type: serverWidget.FieldType.SELECT,
        label: 'A/R Account',
        container: 'custpage_arfg',
      });
      araccountfld.defaultValue = aracct;
      araccountfld.isMandatory = true;

      let selectedfld = form.addField({
        id: 'custpage_selectedfld',
        type: serverWidget.FieldType.LONGTEXT,
        label: 'Selected List',
      });
      selectedfld.defaultValue = selected;
      selectedfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // get select options
      let araccounts = getArAccounts();

      araccountfld.addSelectOption({ value: '', text: '' });

      for (var i = 0; i < araccounts.length; i++) {
        let result = araccounts[i];

        araccountfld.addSelectOption({
          value: result.getValue({ name: 'internalid' }),
          text: result.getValue({ name: 'name' }),
        });
      }

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // add buttons
      form.addButton({
        id: 'custpage_searchbtn',
        label: 'Search',
        functionName: 'redirectSuitelet(0, ' + false + ',' + false + ')',
      });

      // add submit button
      form.addSubmitButton({ label: 'Submit' });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // create sublist
      let invsublist = form.addSublist({
        id: 'custpage_invsublist',
        type: serverWidget.SublistType.LIST,
        label: 'Rental Sales Orders',
      });

      // add mark/unmark all button
      invsublist.addMarkAllButtons();

      // create sublist fields
      let selectsubfld = invsublist.addField({
        id: 'custpage_selectsubfld',
        type: serverWidget.FieldType.CHECKBOX,
        label: 'Invoice',
      });
      selectsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });

      let datesubfld = invsublist.addField({
        id: 'custpage_datesubfld',
        type: serverWidget.FieldType.DATE,
        label: 'Bill Date',
      });
      datesubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      let ordersubfld = invsublist.addField({
        id: 'custpage_ordersubfld',
        type: serverWidget.FieldType.TEXTAREA,
        label: 'Order Number',
      });
      ordersubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      let orderdtesubfld = invsublist.addField({
        id: 'custpage_orderdtesubfld',
        type: serverWidget.FieldType.DATE,
        label: 'Order Date',
      });
      orderdtesubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      let soidsubfld = invsublist.addField({
        id: 'custpage_soidsubfld',
        type: serverWidget.FieldType.SELECT,
        label: 'Sales Order',
        source: 'salesorder',
      });
      soidsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

      let custsubfld = invsublist.addField({
        id: 'custpage_custsubfld',
        type: serverWidget.FieldType.SELECT,
        label: 'Customer',
        source: 'customer',
      });
      custsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      let memosubfld = invsublist.addField({
        id: 'custpage_memosubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Memo',
      });
      memosubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      let initso = getInitOrders({
        custid,
        billdatefrm,
        billdateto,
        loc,
        rentalitem,
        param_ldw,
        excludeWithCredit: params.xcred == 'T',
      });
      let excludedso = checkConfiguration(initso);

      // run search
      let retrievesearch = runSearch(
        GLOBAL.PAGESIZE,
        custid,
        billdatefrm,
        billdateto,
        excludedso,
        loc,
        rentalitem,
        param_ldw,
        params.xcred == 'T',
      );
      let pagecount = Math.ceil(forceInt(retrievesearch.count) / GLOBAL.PAGESIZE);
      log.debug({
        title: 'GET - pagecount',
        details:
          'retrievesearch.count: '
          + forceInt(retrievesearch.count)
          + ' / GLOBAL.PAGESIZE: '
          + GLOBAL.PAGESIZE
          + ' = '
          + pagecount,
      });

      // Set pageId to correct value if out of index
      if (isEmpty(pageId) || pageId < 0) pageId = 0;
      else if (pageId >= pagecount) pageId = pagecount - 1;

      log.debug({ title: 'GET - final pageId', details: pageId });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // add sublist buttons
      let prevbtn = invsublist.addButton({
        id: 'custpage_previous',
        label: 'Previous',
        functionName: 'redirectSuitelet(' + (Number(pageId) - 1) + ',' + true + ',' + true + ')',
      });
      if (pageId == 0) prevbtn.isDisabled = true;

      let nextbtn = invsublist.addButton({
        id: 'custpage_next',
        label: 'Next',
        functionName: 'redirectSuitelet(' + (Number(pageId) + 1) + ',' + true + ',' + true + ')',
      });
      if (pageId == pagecount - 1) nextbtn.isDisabled = true;

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // add page field
      let selectOptions = form.addField({
        id: 'custpage_sna_pageid',
        label: 'Page (' + pagecount + ')',
        type: serverWidget.FieldType.SELECT,
      });
      selectOptions.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });

      for (i = 0; i < pagecount; i++) {
        if (i == pageId) {
          selectOptions.addSelectOption({
            value: 'pageid_' + i,
            text: i * GLOBAL.PAGESIZE + 1 + ' - ' + (i + 1) * GLOBAL.PAGESIZE,
            isSelected: true,
          });
        }
        else {
          selectOptions.addSelectOption({
            value: 'pageid_' + i,
            text: i * GLOBAL.PAGESIZE + 1 + ' - ' + (i + 1) * GLOBAL.PAGESIZE,
          });
        }
      }

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // set sublist values
      let addResults = pagecount > 0 ? fetchSearchResult(retrievesearch, pageId, selected) : [];

      for (let a = 0; a < addResults.length; a++) {
        for (let ind in addResults[a]) {
          if (!isEmpty(addResults[a][ind])) {
            invsublist.setSublistValue({ id: ind, line: a, value: addResults[a][ind] });
          }
        }
      }

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      scriptContext.response.writePage(form);
    }

    // POST
    else {
      let request = scriptContext.request;
      var params = request.parameters;

      log.debug({ title: 'POST - params', details: JSON.stringify(params) });

      var selected = params.custpage_selectedfld;
      var aracct = params.custpage_araccountfld;
      log.debug({ title: 'POST', details: 'selected: ' + JSON.stringify(selected) + ' | aracct: ' + aracct });

      let arrso = !isEmpty(selected) ? selected.split(',') : [];

      log.debug({ title: 'POST', details: 'arrso: ' + JSON.stringify(arrso) });

      // transform = 10 units, save = 10 units
      if (arrso.length > 30) {
        callMRscript(scriptContext, arrso, aracct);
      }
      else {
        transformOrders(scriptContext, arrso, aracct);
      }
    }
  };

  /**
   * Transforms rental orders to invoices
   * @param scriptContext
   * @param arrso
   * @param aracct
   */
  function transformOrders(scriptContext, arrso, aracct) {
    let _currentuser = runtime.getCurrentUser();
    if (!isEmpty(_currentuser)) {
      currentuser = _currentuser.id;
    }

    for (let y = 0; y < arrso.length; y++) {
      let so = arrso[y];

      if (!isEmpty(so)) {
        // transform SO to invoice
        let rec = record.transform({
          fromType: record.Type.SALES_ORDER,
          fromId: so,
          toType: record.Type.INVOICE,
          isDynamic: true,
        });
        rec.setValue({ fieldId: 'account', value: aracct });

        let itemcount = rec.getLineCount({ sublistId: 'item' });

        // UE ItemFulfillment should run
        /* for (var i = itemcount - 1; i >= 0; i--) {
                        var billdate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i});
                        var objconfig = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator', line: i})
                        var objconfig2 = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator_2', line: i});;
                        var dummy = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dummy', line: i});

                        log.debug({title: 'transformOrders', details: 'line: ' + i + ' | billdate: ' + billdate + ' | objconfig: ' + objconfig + ' | dummy: ' + dummy});

                        // only lines where it is not yet invoiced and Bill Date is <= the Date today will be included
                        if (dummy || objconfig.includes('"CONFIGURED":"F"') || objconfig2.includes('"CONFIGURED":"F"') || billdate > new Date()) {
                            rec.removeLine({sublistId: 'item', line: i});

                            log.debug({title: 'transformOrders', details: 'removing line: ' + i});
                        }
                    } */

        try {
          let invid = rec.save();
          log.debug({ title: 'transformOrders', details: 'invoice created: ' + invid });
        }
        catch (e) {
          log.debug({ title: 'error', details: e.message });

          if (!isEmpty(currentuser)) {
            let author = -5;
            let subject = 'Script ' + runtime.getCurrentScript().id + ' error';
            let body
              = 'An error occurred with the following information:\n'
                + 'Sales order ID: '
                + so
                + '\n'
                + 'Error code: '
                + e.name
                + '\n'
                + 'Error msg: '
                + e.message;

            email.send({ author: author, recipients: currentuser, subject: subject, body: body });
          }

          continue;
        }
      }
    }

    // create wait response page
    let form = serverWidget.createForm({ title: 'Status' });

    let output = url.resolveScript({
      deploymentId: 'customdeploy_sna_hul_sl_rentalinvoicing',
      scriptId: 'customscript_sna_hul_sl_rentalinvoicing',
    });

    let waitResponse = (form.addField({
      id: 'custpage_sna_wait_response',
      type: serverWidget.FieldType.INLINEHTML,
      label: 'Wait Response',
    }).defaultValue
      = '<p style=\"font-size:12px\">Sales orders have been processed. Go back to the main page <a href=\"'
        + output
        + '\">here</a>.</p>');

    scriptContext.response.writePage(form);
    return;
  }

  /**
   * Call M/R script to bulk create invoices
   * @param scriptContext
   * @param arrso
   * @param aracct
   */
  function callMRscript(scriptContext, arrso, aracct) {
    let currentuser = '';

    let currscript = runtime.getCurrentScript();
    let mrid = currscript.getParameter({ name: 'custscript_sna_mr_lab_id' });

    let _currentuser = runtime.getCurrentUser();
    if (!isEmpty(_currentuser)) {
      currentuser = _currentuser.id;
    }

    let isSuccess = false;
    let successname = '';
    let successdeploy = '';
    let successid = '';

    // Get all active deployments
    let arrDeployments = getActiveDeployments('customscript_sna_hul_mr_rentalinvoicing');

    arrDeployments.forEach(function (deployment) {
      // Get next active deployment if previous deployment failed
      if (!isSuccess) {
        log.debug({ title: 'callMRscript', details: 'Processing Deployment: ' + deployment.name });

        try {
          let taskSched = task.create({ taskType: task.TaskType.MAP_REDUCE });
          taskSched.scriptId = 'customscript_sna_hul_mr_rentalinvoicing';
          taskSched.deploymentId = deployment.name;
          taskSched.params = {};
          taskSched.params.custscript_sna_rentalsoids = arrso;
          taskSched.params.custscript_sna_current_user = currentuser;
          taskSched.params.custscript_sna_ar_account = aracct;

          let taskSchedId = taskSched.submit();
          let taskStatus = task.checkStatus(taskSchedId);
          log.debug({ title: 'callMRscript', details: 'Deployment Status: ' + taskStatus.status });

          if (taskStatus.status != task.TaskStatus.FAILED) {
            isSuccess = true;
            successname = 'SNA HUL MR Rental Invoicing';
            successdeploy = deployment.name;
            successid = deployment.id;

            log.debug({ title: 'callMRscript', details: 'Map Reduce has successfully been scheduled.' });

            return false;
          }
        }
        catch (err) {
          if (err.message != undefined) {
            log.debug({ title: 'callMRscript - err', details: err.name + ' ' + err.message });
          }
          else {
            log.debug({ title: 'callMRscript - err', details: err.toString() });
          }
        }
      }

      return true;
    });

    // create new m/r deployment
    if (!isSuccess) {
      let randomid = '_mr_' + new Date().getTime();

      let recdeployment = record.copy({ type: 'scriptdeployment', id: arrDeployments[0].id, isDynamic: true });
      recdeployment.setValue({ fieldId: 'scriptid', value: randomid });
      let deploymentid = recdeployment.save();
      log.debug({ title: 'callMRscript', details: 'New deployment: ' + deploymentid });

      let taskmr = task.create({ taskType: task.TaskType.MAP_REDUCE });
      taskmr.scriptId = 'customscript_sna_hul_mr_rentalinvoicing';
      taskmr.deploymentId = 'customdeploy' + randomid;
      taskmr.params = {};
      taskmr.params.custscript_sna_rentalsoids = arrso;
      taskmr.params.custscript_sna_current_user = currentuser;
      taskmr.params.custscript_sna_ar_account = aracct;

      let taskSchedId = taskmr.submit();
      let taskStatus = task.checkStatus(taskSchedId);
      log.debug({ title: 'callMRscript', details: 'New Deployment Status: ' + taskStatus.status });

      if (taskStatus.status != task.TaskStatus.FAILED) {
        successname = 'SNA HUL MR Rental Invoicing';
        successdeploy = taskmr.deploymentId;
        successid = deploymentid;

        log.debug({ title: 'callMRscript', details: 'New Map Reduce has successfully been scheduled. ' });
      }
      else {
        callMRscript(scriptContext, arrso, aracct);
      }
    }

    // create wait response page
    let form = serverWidget.createForm({ title: 'Status' });

    let output = url.resolveTaskLink({
      id: 'LIST_MAPREDUCESCRIPTSTATUS',
      params: {
        date: 'TODAY',
        primarykey: successid,
        sortcol: 'dateCreated',
        sortdir: 'DESC',
        scripttype: mrid,
      },
    });

    let waitResponse = (form.addField({
      id: 'custpage_sna_wait_response',
      type: serverWidget.FieldType.INLINEHTML,
      label: 'Wait Response',
    }).defaultValue
      = '<p style=\"font-size:12px\">Please check the status of the invoice creation <a href=\"'
        + output
        + '\">here</a>.<br /><br /><b>Script:</b> '
        + successname
        + '<br /><b>Deployment ID:</b> '
        + successdeploy
        + '</p>');

    scriptContext.response.writePage(form);
    return;
  }

  /**
   * Get active deployments
   * @param stScriptId
   * @returns {*[]}
   */
  function getActiveDeployments(stScriptId) {
    let arrDeployments = [];

    if (isEmpty(stScriptId)) return [];

    let fil = [];
    fil.push(search.createFilter({ name: 'scriptid', join: 'script', operator: 'is', values: stScriptId }));
    fil.push(search.createFilter({ name: 'isdeployed', operator: 'is', values: true }));
    fil.push(search.createFilter({ name: 'status', operator: 'anyof', values: 'NOTSCHEDULED' }));

    let arrSearch = search.create({
      type: 'scriptdeployment',
      columns: [search.createColumn({ name: 'scriptid' })],
      filters: fil,
    });

    arrSearch.run().each(function (result) {
      arrDeployments.push({ id: result.id, name: result.getValue({ name: 'scriptid' }) });

      return true;
    });

    return arrDeployments;
  }

  /**
   * Get A/R accounts only
   * @returns {*|*[]|*[]}
   */
  function getArAccounts() {
    let filters = [];
    filters.push(search.createFilter({ name: 'type', operator: search.Operator.ANYOF, values: 'AcctRec' }));
    filters.push(search.createFilter({ name: 'isinactive', operator: search.Operator.IS, values: false }));

    let columns = [];
    columns.push(search.createColumn({ name: 'name' }));
    columns.push(search.createColumn({ name: 'internalid' }));

    let srch = search.create({ type: record.Type.ACCOUNT, columns: columns, filters: filters });

    let searchall = searchAllResults(srch);

    log.debug({ title: 'getArAccounts', details: searchall });

    return searchall;
  }

  /**
   * Retrieves all rental orders with credit memo
   */
  function getRentalOrdersWithCreditMemo() {
    const searchObj = search.load({ id: 'customsearch_sna_hul_so_with_cm' });
    const results = searchAllResults(searchObj).map(result => result.getValue({ name: 'createdfrom' })) || [];
    return results;
  }

  /**
   * Get initial sales orders ready to be invoiced
   * @param custid
   * @param billdatefrm
   * @param billdateto
   * @param loc
   * @param {boolean} excludeWithCredit
   * @returns {*[]}
   */
  function getInitOrders({ custid, billdatefrm, billdateto, loc, rentalitem, param_ldw, excludeWithCredit = false }) {
    let initso = [];

    let searchres = search.load({ id: 'customsearch_sna_hul_rental_for_invoice' });
    let filterexp = searchres.filterExpression;

    let chargefil = [];
    chargefil.push(['item', search.Operator.ANYOF, rentalitem]);
    chargefil.push('or');
    chargefil.push(['item.custitem_sna_hul_gen_prodpost_grp', search.Operator.ANYOF, param_ldw]);

    let initfil = [];
    initfil.push(['custcol_sna_hul_bill_date', search.Operator.ISEMPTY, '']);
    initfil.push('and');
    initfil.push(chargefil);

    if (!isEmpty(custid)) {
      filterexp.push('and');
      filterexp.push(['name', search.Operator.IS, custid]);
    }
    if (!isEmpty(billdatefrm)) {
      let billfrmfil = [];
      billfrmfil.push(['custcol_sna_hul_bill_date', search.Operator.ONORAFTER, billdatefrm]);
      billfrmfil.push('or');
      billfrmfil.push(initfil);

      filterexp.push('and');
      filterexp.push(billfrmfil);
    }
    if (!isEmpty(billdateto)) {
      let billtofil = [];
      billtofil.push(['custcol_sna_hul_bill_date', search.Operator.ONORBEFORE, billdateto]);
      billtofil.push('or');
      billtofil.push(initfil);

      filterexp.push('and');
      filterexp.push(billtofil);
    }
    if (!isEmpty(loc)) {
      filterexp.push('and');
      filterexp.push(['location', search.Operator.ANYOF, loc]);
    }

    if (!excludeWithCredit) {
      const salesOrderIdsWithCreditMemos = getRentalOrdersWithCreditMemo();
      log.audit('SALES_ORDERS_WITH_CM', salesOrderIdsWithCreditMemos);
      if (salesOrderIdsWithCreditMemos.length > 0) {
        filterexp.push('AND', ['internalid', search.Operator.NONEOF, salesOrderIdsWithCreditMemos]);
      }
    }

    log.debug({ title: 'getInitOrders:FILTER_EXRPESSION', details: filterexp });

    searchres.filterExpression = filterexp;
    let searchall = searchAllResults(searchres);

    for (let i = 0; i < searchall.length; i++) {
      let result = searchall[i];
      let soid = result.getValue({ name: 'internalid', summary: 'GROUP' });

      initso.push(soid);
    }

    log.debug({ title: 'getInitOrders', details: JSON.stringify(initso) });

    return initso;
  }

  /**
   * Check if initial orders are all configured
   * @param initso
   * @returns {*[]}
   */
  function checkConfiguration(initso) {
    if (isEmpty(initso)) return [];

    let excludedso = [];

    let _filters = [];
    _filters.push(['custcol_sna_hul_object_configurator', search.Operator.CONTAINS, '"CONFIGURED":"F"']);
    _filters.push('or');
    _filters.push(['custcol_sna_hul_object_configurator_2', search.Operator.CONTAINS, '"CONFIGURED":"F"']);
    _filters.push('or');
    _filters.push(['custcol_sna_hul_fleet_no.custrecord_sna_hul_rent_dummy', search.Operator.IS, 'T']);

    let mainfilters = [];
    mainfilters.push(['internalid', search.Operator.ANYOF, initso]);
    mainfilters.push('and');
    mainfilters.push(_filters);

    let columns = [];
    columns.push(search.createColumn({ name: 'internalid', summary: 'GROUP' }));

    let srch = search.create({ type: record.Type.SALES_ORDER, filters: mainfilters, columns: columns });

    let searchall = searchAllResults(srch);

    for (let i = 0; i < searchall.length; i++) {
      let result = searchall[i];
      let soid = result.getValue({ name: 'internalid', summary: 'GROUP' });

      excludedso.push(soid);
    }

    log.debug({ title: 'checkConfiguration', details: JSON.stringify(excludedso) });

    return excludedso;
  }

  /**
   * Initial search of sales orders
   * @param searchPageSize
   * @param custid
   * @param billdatefrm
   * @param billdateto
   * @param excludedso
   * @param loc
   * @returns {SearchPagedData}
   */
  function runSearch(
    searchPageSize,
    custid,
    billdatefrm,
    billdateto,
    excludedso,
    loc,
    rentalitem,
    param_ldw,
    excludeWithCredit = false,
  ) {
    let searchres = search.load({ id: 'customsearch_sna_hul_rental_for_invoice' });
    let filterexp = searchres.filterExpression;

    let chargefil = [];
    chargefil.push(['item', search.Operator.ANYOF, rentalitem]);
    chargefil.push('or');
    chargefil.push(['item.custitem_sna_hul_gen_prodpost_grp', search.Operator.ANYOF, param_ldw]);

    let initfil = [];
    initfil.push(['custcol_sna_hul_bill_date', search.Operator.ISEMPTY, '']);
    initfil.push('and');
    initfil.push(chargefil);

    if (!isEmpty(custid)) {
      filterexp.push('and');
      filterexp.push(['name', search.Operator.IS, custid]);
    }
    if (!isEmpty(billdatefrm)) {
      let billfrmfil = [];
      billfrmfil.push(['custcol_sna_hul_bill_date', search.Operator.ONORAFTER, billdatefrm]);
      billfrmfil.push('or');
      billfrmfil.push(initfil);

      filterexp.push('and');
      filterexp.push(billfrmfil);
    }
    if (!isEmpty(billdateto)) {
      let billtofil = [];
      billtofil.push(['custcol_sna_hul_bill_date', search.Operator.ONORBEFORE, billdateto]);
      billtofil.push('or');
      billtofil.push(initfil);

      filterexp.push('and');
      filterexp.push(billtofil);
    }
    if (!isEmpty(loc)) {
      filterexp.push('and');
      filterexp.push(['location', search.Operator.ANYOF, loc]);
    }
    if (!isEmpty(excludedso)) {
      filterexp.push('and');
      filterexp.push(['internalid', search.Operator.NONEOF, excludedso]);
    }

    if (!excludeWithCredit) {
      const salesOrderIdsWithCreditMemos = getRentalOrdersWithCreditMemo();
      log.audit('SALES_ORDERS_WITH_CM', salesOrderIdsWithCreditMemos);
      if (salesOrderIdsWithCreditMemos.length > 0) {
        filterexp.push('AND', ['internalid', search.Operator.NONEOF, salesOrderIdsWithCreditMemos]);
      }
    }

    log.debug({ title: 'runSearch', details: 'filterexp: ' + JSON.stringify(filterexp) });

    searchres.filterExpression = filterexp;

    return searchres.runPaged({
      pageSize: searchPageSize,
    });
  }

  /**
   * Build the rows from the saved search results
   * @param pagedData
   * @param pageIndex
   * @param selected
   * @returns {*[]}
   */
  function fetchSearchResult(pagedData, pageIndex, selected) {
    let searchPage = pagedData.fetch({
      index: pageIndex,
    });

    let arrselected = !isEmpty(selected) ? selected.split(',') : [];
    let results = [];
    let sercols = [];

    searchPage.data.forEach(function (result) {
      let soid = result.getValue({ name: 'internalid', summary: 'GROUP' });
      let orderno = result.getValue({ name: 'tranid', summary: 'GROUP' });
      let dte = result.getValue({ name: 'trandate', summary: 'GROUP' });
      let cust = result.getValue({ name: 'entity', summary: 'GROUP' });
      let memo = result.getValue({ name: 'memo', summary: 'MIN' });
      let billdate = result.getValue({ name: 'custcol_sna_hul_bill_date', summary: 'MIN' });
      if (!isEmpty(billdate)) {
        billdate = format.format({ value: new Date(billdate), type: format.Type.DATE });
      }
      let selected = arrselected.indexOf(soid) != -1 ? 'T' : 'F';
      let urllink = url.resolveRecord({ recordType: search.Type.SALES_ORDER, recordId: soid });

      let objvalues = {};
      objvalues.custpage_soidsubfld = !isEmpty(soid) ? soid : '';
      objvalues.custpage_datesubfld = !isEmpty(billdate) ? billdate : '';
      objvalues.custpage_ordersubfld = !isEmpty(urllink) ? '<a href=\"' + urllink + '\">' + orderno + '</a>' : '';
      objvalues.custpage_orderdtesubfld = !isEmpty(dte) ? dte : '';
      objvalues.custpage_custsubfld = !isEmpty(cust) ? cust : '';
      objvalues.custpage_memosubfld = !isEmpty(memo) ? memo : '';
      objvalues.custpage_selectsubfld = selected;

      results.push(objvalues);
    });

    return results;
  }

  return { onRequest };
});

/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script for the rental configurator page
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/8/1       		                 aduldulao       Initial version.
 * 2022/9/2       		                 aduldulao       Rental Contract ID list
 * 2022/9/8       		                 aduldulao       Dynamic sublist values
 * 2022/9/13       		                 aduldulao       Change segment ID
 * 2022/9/19       		                 aduldulao       Field type checking
 * 2022/9/22       		                 aduldulao       Character limit
 * 2022/11/3       		                 aduldulao       Act_Config
 * 2023/1/13       		                 aduldulao       Rental Module – Statuses
 * 2023/3/22       		                 aduldulao       Add Fleet No.
 * 2023/9/28                             aduldulao       Used Equipment Item
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/ui/message'] /**
 * @param{record} record
 * @param{redirect} redirect
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */, (record, redirect, runtime, search, serverWidget, url, message) => {
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

  function forceFloat(stValue) {
    var flValue = parseFloat(stValue);
    if (isNaN(flValue) || stValue == 'Infinity') {
      return 0.0;
    }
    return flValue;
  }

  function inArray(stValue, arrValue) {
    for (var i = arrValue.length - 1; i >= 0; i--) {
      if (stValue == arrValue[i]) {
        break;
      }
    }
    return i > -1;
  }

  function mergeUnique(arr1, arr2) {
    return arr1.concat(
      arr2.filter(function (item) {
        return arr1.indexOf(item) === -1;
      }),
    );
  }

  function searchAllResults(objSearch, objOption) {
    if (isEmpty(objOption)) {
      objOption = {};
    }

    var arrResults = [];
    if (objOption.isLimitedResult == true) {
      var rs = objSearch.run();
      arrResults = rs.getRange(0, 1000);

      return arrResults;
    }

    var rp = objSearch.runPaged();
    rp.pageRanges.forEach(function (pageRange) {
      var myPage = rp.fetch({
        index: pageRange.index,
      });
      arrResults = arrResults.concat(myPage.data);
    });

    return arrResults;
  }

  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    var method = scriptContext.request.method;

    // GET
    if (method == 'GET') {
      var params = scriptContext.request.parameters;
      log.debug({ title: 'GET - params', details: JSON.stringify(params) });

      var soid = params.soid;
      var contractid = params.contractid;
      var objid = params.objid;
      var actualobjid = params.actualobjid;
      var sotranid = params.sotranid;
      var fleetno = params.fleetno;
      var fleetnochange = params.fleetnochange;
      var comments = params.comments;

      // create form
      var form = serverWidget.createForm({ title: 'Rental Configurator', hideNavBar: true });
      form.clientScriptModulePath = './sna_hul_cs_rentalconfigurator.js';

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // header confirmation if from post
      if (!isEmpty(sotranid)) {
        form.addPageInitMessage({
          message: 'Sales Order ' + sotranid + ' has been updated.',
          type: message.Type.CONFIRMATION,
        });
      }

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // add field groups
      var filtersfg = form.addFieldGroup({ id: 'custpage_filtersfg', label: 'Filters' });
      var actualfg = form.addFieldGroup({ id: 'custpage_actualfg', label: 'Actual Rental Object' });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // create header fields
      var soidfld = form.addField({
        id: 'custpage_soid',
        type: serverWidget.FieldType.SELECT,
        label: 'Sales Order #',
        source: 'salesorder',
        container: 'custpage_filtersfg',
      });
      soidfld.defaultValue = soid;

      var contractidfld = form.addField({
        id: 'custpage_contractid',
        type: serverWidget.FieldType.SELECT,
        label: 'Rental Contract ID',
        container: 'custpage_filtersfg',
      });
      contractidfld.defaultValue = contractid;
      contractidfld.isMandatory = true;

      var objidfld = form.addField({
        id: 'custpage_objid',
        type: serverWidget.FieldType.SELECT,
        label: 'Rental Object',
        source: 'customrecord_sna_objects',
        container: 'custpage_actualfg',
      });
      objidfld.defaultValue = objid;
      objidfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });

      // get select options
      if (!isEmpty(fleetno)) {
        var actualobjfld = form.addField({
          id: 'custpage_actualobjfld',
          type: serverWidget.FieldType.SELECT,
          label: 'Actual Rental Object',
          container: 'custpage_actualfg',
        });
        actualobjfld.defaultValue = actualobjid;

        var actualobjects = getActualObjects(fleetno);
        log.debug({ title: 'actualobjects', details: 'len: ' + actualobjects.length });

        actualobjfld.addSelectOption({ value: '', text: '' });

        for (var i = 0; i < actualobjects.length; i++) {
          var result = actualobjects[i];

          actualobjfld.addSelectOption({
            value: result.getValue({ name: 'internalid' }),
            text: result.getValue({ name: 'name' }),
          });
        }
      } else {
        var actualobjfld = form.addField({
          id: 'custpage_actualobjfld',
          type: serverWidget.FieldType.SELECT,
          label: 'Actual Rental Object',
          source: 'customrecord_sna_objects',
          container: 'custpage_actualfg',
        });
        actualobjfld.defaultValue = actualobjid;
      }

      var fleetnofld = form.addField({
        id: 'custpage_fleetnofld',
        type: serverWidget.FieldType.TEXT,
        label: 'Fleet No.',
        container: 'custpage_actualfg',
      });
      fleetnofld.defaultValue = fleetno;

      var configcommentsfld = form.addField({
        id: 'custpage_configcommentsfld',
        type: serverWidget.FieldType.TEXTAREA,
        label: 'Comments',
        container: 'custpage_actualfg',
      });
      configcommentsfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
      configcommentsfld.defaultValue = comments;

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // get select options
      var rentalcontractids = getRentalContractIds(soid);
      log.debug({ title: 'rentalcontractids', details: 'rentalcontractids: ' + JSON.stringify(rentalcontractids) });

      contractidfld.addSelectOption({ value: '', text: '' });

      for (var id in rentalcontractids) {
        contractidfld.addSelectOption({ value: id, text: rentalcontractids[id] });
      }

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // disable field
      checkToDisable(objid, actualobjfld);

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // add buttons
      form.addButton({ id: 'custpage_backbtn', label: 'Search', functionName: 'searchButton()' });

      // add submit button
      form.addSubmitButton({ label: 'Submit' });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // create sublist
      var configsublist = form.addSublist({
        id: 'custpage_configsublist',
        type: serverWidget.SublistType.LIST,
        label: 'Configuration',
      });

      // add mark/unmark all button
      configsublist.addMarkAllButtons();

      // create sublist fields
      var configuredsubfld = configsublist.addField({
        id: 'custpage_configuredsubfld',
        type: serverWidget.FieldType.CHECKBOX,
        label: 'Configured',
      });
      configuredsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });

      var elemsubfld = configsublist.addField({
        id: 'custpage_elemsubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Data Element',
      });
      elemsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      var currsubfld = configsublist.addField({
        id: 'custpage_currsubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Current Configuration',
      });
      currsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      var reqsubfld = configsublist.addField({
        id: 'custpage_reqsubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Requested Configuration',
      });
      reqsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      var tempreqsubfld = configsublist.addField({
        id: 'custpage_tempreqsubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Temp Requested Configuration',
      });
      tempreqsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }); // hidden

      var actualsubfld = configsublist.addField({
        id: 'custpage_actualsubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Actual Configuration',
      });
      actualsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });

      var tempactualsubfld = configsublist.addField({
        id: 'custpage_tempactualsubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Temp Actual Configuration',
      });
      tempactualsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }); // hidden

      var fieldtypesubfld = configsublist.addField({
        id: 'custpage_fieldtypesubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Field Type',
      });
      fieldtypesubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

      var selectsubfld = configsublist.addField({
        id: 'custpage_selectsubfld',
        type: serverWidget.FieldType.TEXTAREA,
        label: 'Change Select Value',
      });

      var rentalidsubfld = configsublist.addField({
        id: 'custpage_rentalidsubfld',
        type: serverWidget.FieldType.TEXT,
        label: 'Rental Contract ID',
      });
      rentalidsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      var actualobjsubfld = configsublist.addField({
        id: 'custpage_actualobjsubfld',
        type: serverWidget.FieldType.SELECT,
        label: 'Actual Rental Object',
        source: 'customrecord_sna_objects',
      });
      actualobjsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

      var itmsubfld = configsublist.addField({
        id: 'custpage_itmsubfld',
        type: serverWidget.FieldType.SELECT,
        label: 'Item',
        source: 'item',
      });
      itmsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

      // --------------------------------------------------------------------------------------------------------------------------------------------------

      // set field values
      if (!isEmpty(contractid) || !isEmpty(actualobjid)) {
        var hasselect = false;

        var objfieldvalues = getSublistValues(soid, contractid, objid, actualobjid, contractidfld, selectsubfld);
        log.debug({ title: 'GET - objfieldvalues', details: objfieldvalues });

        var currentScript = runtime.getCurrentScript();
        var sloptions = currentScript.getParameter({ name: 'custscript_sn_select_externalurl' });

        //var sloptions = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configuratorsele', deploymentId: 'customdeploy_sna_hul_sl_configuratorsele', returnExternalUrl: true});
        //var sloptions = 'https://6952227-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=472&deploy=1&compid=6952227_SB1&ns-at=AAEJ7tMQvIFzt2p5fzhhW3pz6TTQxxbRkr0o6H7kRO9ADuduFe4';

        if (fleetnochange != 'T') {
          for (var a = 0; a < objfieldvalues.length; a++) {
            for (var ind in objfieldvalues[a]) {
              if (!isEmpty(objfieldvalues[a][ind])) {
                configsublist.setSublistValue({ id: ind, line: a, value: objfieldvalues[a][ind] });
              }

              if (ind == 'custpage_fieldtypesubfld' && objfieldvalues[a][ind] == 'select') {
                // display link to open suitelet with list of options
                var linkMain =
                  '<button onclick="window.open(\'' +
                  sloptions +
                  '&actualobj=' +
                  actualobjid +
                  '&fldname=' +
                  objfieldvalues[a]['custpage_elemsubfld'] +
                  '&objid=' +
                  objid +
                  '&line=' +
                  (a + 1) +
                  "', 'newwindow2', 'width=400,height=300'); return false;\">Select</button>";

                configsublist.setSublistValue({ id: 'custpage_selectsubfld', line: a, value: linkMain });

                hasselect = true;
              }
            }
          }

          // only display if config has select fields
          if (!hasselect) {
            selectsubfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
          }
        }
      }
      scriptContext.response.writePage(form);
    }

    // POST
    else {
      var request = scriptContext.request;
      var params = request.parameters;

      log.debug({ title: 'POST - params', details: JSON.stringify(params) });

      var currentScript = runtime.getCurrentScript();
      var inassigned = currentScript.getParameter({ name: 'custscript_sna_rentalstatus_2' });
      var outstatus = currentScript.getParameter({ name: 'custscript_sna_rentalstatus_3' });
      var configstatus = currentScript.getParameter({ name: 'custscript_sna_eqstatus_config' });
      var readyfordel = currentScript.getParameter({ name: 'custscript_sna_eqstatus_readyfordel' });
      var param_usedequipment = currentScript.getParameter({ name: 'custscript_sn_hul_used_equipment' });
      var param_newequipment = currentScript.getParameter({ name: 'custscript_sn_hul_new_equipment' });
      var invreadyfordel = currentScript.getParameter({ name: 'custscript_sna_eqstatus_inv_readyfordel' });

      var soid = params.custpage_soid;
      var rentalcontractid = params.custpage_contractid;
      var actualobj = params.custpage_actualobjfld;

      var linecount = request.getLineCount({ group: 'custpage_configsublist' });
      log.debug({ title: 'POST', details: 'linecount: ' + linecount });

      var sotranid = '';
      var arrobj = [];

      var objvalues = {};
      var hasunconfigured = false;
      var hasconfigured = false;

      for (var i = 0; i < linecount; i++) {
        rentalcontractid = request.getSublistValue({
          group: 'custpage_configsublist',
          name: 'custpage_rentalidsubfld',
          line: i,
        });
        actualobj = request.getSublistValue({
          group: 'custpage_configsublist',
          name: 'custpage_actualobjsubfld',
          line: i,
        });

        var val = request.getSublistValue({ group: 'custpage_configsublist', name: 'custpage_reqsubfld', line: i });
        var actualval = request.getSublistValue({
          group: 'custpage_configsublist',
          name: 'custpage_actualsubfld',
          line: i,
        });
        var isconfigured = request.getSublistValue({
          group: 'custpage_configsublist',
          name: 'custpage_configuredsubfld',
          line: i,
        });
        var lneitm = request.getSublistValue({ group: 'custpage_configsublist', name: 'custpage_itmsubfld', line: i });

        if (isconfigured == 'F') {
          hasunconfigured = true;
        }
        if (isconfigured == 'T') {
          hasconfigured = true;
        }

        var obj = {
          ELEMENT: request.getSublistValue({ group: 'custpage_configsublist', name: 'custpage_elemsubfld', line: i }),
          REQUESTED_CONFIG: !isEmpty(val) ? val : '',
          ACT_CONFIG: !isEmpty(actualval) ? actualval : '',
          CONFIGURED: isconfigured,
        };

        arrobj.push(obj);
      }

      log.debug({ title: 'POST', details: 'arrobj: ' + JSON.stringify(arrobj) });

      // search for the sales order
      // update object status
      if (!isEmpty(actualobj)) {
        // New Equipment or Used Equipment
        if (lneitm == param_newequipment || lneitm == param_usedequipment) {
          if (hasconfigured && !hasunconfigured) {
            objvalues['custrecord_sna_status'] = invreadyfordel;
          }
        }
        // Rental Charge
        else {
          if (hasunconfigured) {
            objvalues['custrecord_sna_rental_status'] = inassigned;
            objvalues['custrecord_sna_status'] = configstatus;
          } else if (hasconfigured && !hasunconfigured) {
            objvalues['custrecord_sna_rental_status'] = outstatus;
            objvalues['custrecord_sna_status'] = readyfordel;
          }
        }

        record.submitFields({ type: 'customrecord_sna_objects', id: actualobj, values: objvalues });
        log.debug({ title: 'POST', details: 'object status updated: ' + JSON.stringify(objvalues) });
      }

      if (!isEmpty(rentalcontractid)) {
        sotranid = updateOrderLine(rentalcontractid, arrobj, actualobj, param_usedequipment, param_newequipment);
      }

      log.debug({ title: 'POST', details: 'sotranid: ' + sotranid });



      var fullURL = url.resolveScript({
        scriptId: 'customscript_sna_hul_sl_rentalconfigurat',
        deploymentId: 'customdeploy_sna_hul_sl_rentalconfigurat',
        returnExternalUrl: true,
        params: {
          soid: soid,
          sotranid: sotranid,
        },
      });

      redirect.redirect({ url: fullURL });
    }
  };

  /**
   * Disable actual object
   * @param objid
   * @param actualobjfld
   */
  function checkToDisable(objid, actualobjfld) {
    // initial setting
    actualobjfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
    actualobjfld.isMandatory = false;

    if (!isEmpty(objid)) {
      var filters = [search.createFilter({ name: 'internalid', operator: search.Operator.IS, values: objid })];
      var columns = [search.createColumn({ name: 'custrecord_sna_hul_rent_dummy' })];

      var objsearch = search.create({ type: 'customrecord_sna_objects', filters: filters, columns: columns });
      var tranres = objsearch.run().getRange({ start: 0, end: 1 });

      if (!isEmpty(tranres)) {
        var dummy = tranres[0].getValue({ name: 'custrecord_sna_hul_rent_dummy' });

        if (dummy) {
          actualobjfld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.NORMAL });
          actualobjfld.isMandatory = true;
        }
      }
    }
  }

  /**
   * Get non-dummy objects
   * @returns {*|*[]|*[]}
   */
  function getActualObjects(fleetno) {
    var filters = [];
    filters.push(
      search.createFilter({ name: 'custrecord_sna_hul_rent_dummy', operator: search.Operator.IS, values: 'F' }),
    );
    if (!isEmpty(fleetno)) {
      filters.push(
        search.createFilter({ name: 'custrecord_sna_fleet_code', operator: search.Operator.CONTAINS, values: fleetno }),
      );
    }

    var columns = [];
    columns.push(search.createColumn({ name: 'internalid' }));
    columns.push(search.createColumn({ name: 'name' }));

    var srch = search.create({ type: 'customrecord_sna_objects', columns: columns, filters: filters });

    var searchall = searchAllResults(srch);

    log.debug({ title: 'getActualObjects', details: searchall });

    return searchall;
  }

  /**
   * Update sales order line
   * @param rentalcontractid
   * @param arrobj
   * @param actualobj
   * @returns {string}
   */
  function updateOrderLine(rentalcontractid, arrobj, actualobj, param_usedequipment, param_newequipment) {
    var soid = '';
    var sotranid = '';

    var filters = [
      search.createFilter({
        name: 'custcol_sna_hul_rent_contractidd',
        operator: search.Operator.IS,
        values: rentalcontractid,
      }),
    ];

    var transearch = search.create({ type: 'transaction', filters: filters });
    var tranres = transearch.run().getRange({ start: 0, end: 1 });

    if (!isEmpty(tranres)) {
      soid = tranres[0].id;
      log.debug({ title: 'updateOrderLine', details: 'soid: ' + soid });

      var sorec = record.load({ type: record.Type.SALES_ORDER, id: soid, isDynamic: true });
      sotranid = sorec.getValue({ fieldId: 'tranid' });
      var soline = sorec.findSublistLineWithValue({
        sublistId: 'item',
        fieldId: 'custcol_sna_hul_rent_contractidd',
        value: rentalcontractid,
      });
      log.debug({
        title: 'updateOrderLine',
        details: 'soline: ' + soline + ' | rental contract ID: ' + rentalcontractid,
      });

      var objdummy = false;
      var objmodel = '';
      var objname = '';

      if (soline != -1) {
        sorec.selectLine({ sublistId: 'item', line: soline });

        var currobj = sorec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no' });
        if (!isEmpty(currobj)) {
          var objflds = search.lookupFields({
            type: 'customrecord_sna_objects',
            id: currobj,
            columns: ['custrecord_sna_hul_rent_dummy', 'name'],
          });

          if (!isEmpty(objflds.custrecord_sna_hul_rent_dummy)) {
            objdummy = objflds.custrecord_sna_hul_rent_dummy;
          }
          if (!isEmpty(objflds.name)) {
            objname = objflds.name;
          }
        }
        // set if current object is a dummy
        if (objdummy) {
          var actobjflds = search.lookupFields({
            type: 'customrecord_sna_objects',
            id: actualobj,
            columns: ['custrecord_sna_equipment_model'],
          });

          if (!isEmpty(actobjflds.custrecord_sna_equipment_model)) {
            objmodel = actobjflds.custrecord_sna_equipment_model[0].value;
          }

          sorec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', value: actualobj });
          sorec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_object', value: actualobj });
          sorec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_obj_model', value: objmodel });
        }

        var configfields = JSON.stringify(arrobj);
        var config2fields = '';

        // split the config
        if (!isEmpty(arrobj)) {
          var parsedconfig = arrobj;
          var parsedlen = forceFloat(parsedconfig.length);
          var configlen = forceFloat(JSON.stringify(parsedconfig).length);

          var currlen = forceFloat(configlen);
          var newconfig = [];

          // 4000 character max for text area
          if (configlen > 4000) {
            for (var i = parsedlen - 1; i >= 0; i--) {
              var element = parsedconfig[i];
              var elemlen = forceFloat(JSON.stringify(element).length);

              if (currlen > 3900) {
                newconfig.push(element);
                parsedconfig.splice(i, 1);
              } else {
                break;
              }

              currlen = currlen - elemlen;
            }

            configfields = JSON.stringify(parsedconfig);
            config2fields = JSON.stringify(newconfig);
          }
        }

        sorec.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_hul_object_configurator',
          value: configfields,
        });
        sorec.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_hul_object_configurator_2',
          value: config2fields,
        });

        var itm = sorec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });
        var qty = sorec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' });

        if ((itm == param_usedequipment) | (itm == param_newequipment)) {
          try {
            var invsubrecord = sorec.getCurrentSublistSubrecord({ sublistId: 'item', fieldId: 'inventorydetail' });
            // Remove all lines
            var _lotcount = invsubrecord.getLineCount({ sublistId: 'inventoryassignment' });
            for (var k = parseInt(_lotcount) - 1; k >= 0; k--) {
              invsubrecord.removeLine({ sublistId: 'inventoryassignment', line: k });
            }

            invsubrecord.selectNewLine({ sublistId: 'inventoryassignment' });
            invsubrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: qty });
            invsubrecord.setCurrentSublistText({
              sublistId: 'inventoryassignment',
              fieldId: 'issueinventorynumber',
              text: objname,
            });
            invsubrecord.commitLine({ sublistId: 'inventoryassignment' });
          } catch (e) {
            if (e.message != undefined) {
              log.error('ERROR', e.name + ' ' + e.message);
            } else {
              log.error('ERROR', 'Unexpected Error', e.toString());
            }
          }
        }
        sorec.commitLine({ sublistId: 'item' });

        // set charges object
        for (var z = parseInt(soline) + 1; z < sorec.getLineCount({ sublistId: 'item' }); z++) {
          sorec.selectLine({ sublistId: 'item', line: z });

          var chargeobj = sorec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no' });
          var currcontractid = sorec.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_hul_rent_contractidd',
          });
          var curritm = sorec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });

          if (
            chargeobj == currobj &&
            isEmpty(currcontractid) &&
            curritm != param_usedequipment &&
            curritm != param_newequipment
          ) {
            sorec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', value: actualobj });
            sorec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_object', value: actualobj });
            sorec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_obj_model', value: objmodel });

            sorec.commitLine({ sublistId: 'item' });
          } else if (!isEmpty(currcontractid)) break; // next rental item has been reached
        }
      }

      var recsoid = sorec.save({ ignoreMandatoryFields: true });
      log.debug({ title: 'updateOrderLine', details: recsoid + ' updated (SO).' });
    }

    return sotranid;
  }

  /**
   * Get rental contract IDs
   * @param soid
   * @returns {*[]}
   */
  function getRentalContractIds(soid) {
    var ids = [];

    if (isEmpty(soid)) return ids;

    var filters = [];
    filters.push(search.createFilter({ name: 'internalid', operator: search.Operator.IS, values: soid }));

    var columns = [];
    columns.push(search.createColumn({ name: 'custcol_sna_hul_rent_contractidd' }));

    var srch = search.create({ type: record.Type.SALES_ORDER, columns: columns, filters: filters });

    srch.run().each(function (result) {
      var contractid = result.getValue({ name: 'custcol_sna_hul_rent_contractidd' }); // text field

      if (!isEmpty(contractid)) {
        ids[contractid] = contractid;
      }

      return true;
    });

    return ids;
  }

  /**
   * Get all field types from object record
   * @param recobj
   * @param allfldtypes
   * @returns {*}
   */
  function getAllFldTypes(recobj, allfldtypes) {
    var allflds = recobj.getFields();

    for (var w = 0; w < allflds.length; w++) {
      var fldobj = recobj.getField({ fieldId: allflds[w] });

      if (!isEmpty(fldobj)) {
        allfldtypes[fldobj.label] = fldobj.type;
      }
    }

    return allfldtypes;
  }

  /**
   * Set sublist fields
   * @param soid
   * @param contractid
   * @param objid
   * @param actualobjid
   * @param contractidfld
   * @returns {*[]}
   */
  function getSublistValues(soid, contractid, objid, actualobjid, contractidfld) {
    var results = [];

    // get current configuration of actual object
    var objfldrules = getObjectConfigRule(actualobjid);
    log.debug({ title: 'getSublistValues', details: 'objfldrules: ' + JSON.stringify(objfldrules) });

    var fieldinfo = {};
    var allfldtypes = {};

    if (!isEmpty(actualobjid)) {
      var recobj = record.load({ type: 'customrecord_sna_objects', id: actualobjid, isDynamic: true });

      // loop through obj rules
      for (var d = 0; d < objfldrules.length; d++) {
        var fldobj = recobj.getField({ fieldId: objfldrules[d] });

        if (!isEmpty(fldobj)) {
          if (fldobj.type == 'select') {
            fieldinfo[fldobj.label] = { value: recobj.getText({ fieldId: objfldrules[d] }), type: fldobj.type };
          } else {
            fieldinfo[fldobj.label] = { value: recobj.getValue({ fieldId: objfldrules[d] }), type: fldobj.type };
          }
        }
      }

      // get all actual obj fields to get field types
      allfldtypes = getAllFldTypes(recobj, allfldtypes);
    }

    // just in case the field is only in a dummy or SO object
    if (!isEmpty(objid) && objid != actualobjid) {
      var recobj = record.load({ type: 'customrecord_sna_objects', id: objid, isDynamic: true });

      // get all actual obj fields to get field types
      allfldtypes = getAllFldTypes(recobj, allfldtypes);
    }

    log.debug({ title: 'getSublistValues', details: 'soid: ' + soid + ' | contractid: ' + contractid });

    // get requested configuration from SO line
    var filters = [];
    if (!isEmpty(soid)) {
      filters.push(search.createFilter({ name: 'internalid', operator: search.Operator.IS, values: soid }));
    }
    if (!isEmpty(contractid)) {
      filters.push(
        search.createFilter({
          name: 'custcol_sna_hul_rent_contractidd',
          operator: search.Operator.IS,
          values: contractid,
        }),
      );
    }

    var columns = [];
    columns.push(search.createColumn({ name: 'custcol_sna_hul_object_configurator' }));
    columns.push(search.createColumn({ name: 'custcol_sna_hul_object_configurator_2' }));
    columns.push(search.createColumn({ name: 'custcol_sna_hul_rent_contractidd' }));
    columns.push(search.createColumn({ name: 'lineuniquekey' }));
    columns.push(search.createColumn({ name: 'custcol_sna_hul_fleet_no' }));
    columns.push(search.createColumn({ name: 'item' }));

    var srch = search.create({ type: record.Type.SALES_ORDER, columns: columns, filters: filters });

    var usedparsed = [];

    srch.run().each(function (result) {
      var currobj = result.getValue({ name: 'custcol_sna_hul_fleet_no' });
      var configfields = result.getValue({ name: 'custcol_sna_hul_object_configurator' });
      var config2fields = result.getValue({ name: 'custcol_sna_hul_object_configurator_2' });
      var searchcontractid = result.getValue({ name: 'custcol_sna_hul_rent_contractidd' });
      var itm = result.getValue({ name: 'item' });

      if (!isEmpty(configfields)) {
        contractidfld.defaultValue = searchcontractid;

        var parsedconfigfields = JSON.parse(configfields);
        var parsedconfig2fields = !isEmpty(config2fields) ? JSON.parse(config2fields) : [];
        var combined = parsedconfigfields.concat(parsedconfig2fields);

        // loop through obj configuration
        for (fieldid in fieldinfo) {
          // skip empty label
          if (!isEmpty(fieldid)) {
            var currentval = !isEmpty(fieldinfo[fieldid]) ? fieldinfo[fieldid].value : '';
            var fieldtype = !isEmpty(fieldinfo[fieldid]) ? fieldinfo[fieldid].type : '';

            if (fieldtype == 'checkbox') {
              currentval = currentval == true ? 'T' : 'F';
            }

            var objvalues = {};
            objvalues['custpage_elemsubfld'] = !isEmpty(fieldid) ? fieldid : '';
            objvalues['custpage_currsubfld'] = currentval;
            objvalues['custpage_rentalidsubfld'] = !isEmpty(searchcontractid) ? searchcontractid : '';
            objvalues['custpage_actualobjsubfld'] = !isEmpty(actualobjid) ? actualobjid : '';
            objvalues['custpage_fieldtypesubfld'] = fieldtype;
            objvalues['custpage_itmsubfld'] = !isEmpty(itm) ? itm : '';

            // loop through SO configuration
            inner: for (var i = 0; i < combined.length; i++) {
              var dataelement = combined[i].ELEMENT;
              var configured = combined[i].CONFIGURED;
              var requested = combined[i].REQUESTED_CONFIG;
              var actual = combined[i].ACT_CONFIG;

              if (fieldid == dataelement) {
                usedparsed.push(dataelement);

                objvalues['custpage_configuredsubfld'] = configured == 'T' ? configured : 'F';
                objvalues['custpage_reqsubfld'] = !isEmpty(requested) ? requested : '';
                objvalues['custpage_tempreqsubfld'] = !isEmpty(requested) ? requested : '';
                objvalues['custpage_actualsubfld'] = !isEmpty(actual) ? actual : '';
                objvalues['custpage_tempactualsubfld'] = !isEmpty(actual) ? actual : '';
                break inner;
              }
            }

            results.push(objvalues);
          }
        }

        log.debug({ title: 'getSublistValues', details: 'usedparsed: ' + JSON.stringify(usedparsed) });

        // loop again for elements not in the actual object config
        if (usedparsed.length != combined.length) {
          log.debug({ title: 'getSublistValues', details: 'looping again' });

          for (var b = 0; b < combined.length; b++) {
            var dataelement = combined[b].ELEMENT;
            var configured = combined[b].CONFIGURED;
            var requested = combined[b].REQUESTED_CONFIG;
            var actual = combined[b].ACT_CONFIG;

            if (!inArray(dataelement, usedparsed) && !isEmpty(dataelement)) {
              var objvalues = {};
              objvalues['custpage_elemsubfld'] = !isEmpty(dataelement) ? dataelement : '';
              objvalues['custpage_currsubfld'] = '';
              objvalues['custpage_rentalidsubfld'] = !isEmpty(contractid) ? contractid : '';
              objvalues['custpage_actualobjsubfld'] = !isEmpty(actualobjid) ? actualobjid : '';
              objvalues['custpage_fieldtypesubfld'] = !isEmpty(allfldtypes[dataelement])
                ? allfldtypes[dataelement]
                : '';
              objvalues['custpage_configuredsubfld'] = configured == 'T' ? configured : 'F';
              objvalues['custpage_reqsubfld'] = !isEmpty(requested) ? requested : '';
              objvalues['custpage_tempreqsubfld'] = !isEmpty(requested) ? requested : '';
              objvalues['custpage_actualsubfld'] = !isEmpty(actual) ? actual : '';
              objvalues['custpage_tempactualsubfld'] = !isEmpty(actual) ? actual : '';

              results.push(objvalues);
            }
          }
        }

        return false; // must be unique
      }

      return true;
    });

    return results;
  }

  /**
   * Get the object field IDs on the Rental Object Configurator Rule
   * @param actualobjid
   * @returns {string}
   */
  function getObjectConfigRule(actualobjid) {
    var segment = '';
    var arrfinalflds = '';
    var temp_arrfinalflds = '';

    if (!isEmpty(actualobjid)) {
      var objflds = search.lookupFields({
        type: 'customrecord_sna_objects',
        id: actualobjid,
        columns: ['cseg_sna_hul_eq_seg'],
      });

      if (!isEmpty(objflds['cseg_sna_hul_eq_seg'])) {
        segment = objflds['cseg_sna_hul_eq_seg'][0].text; // FORKLIFT : CLASS IV : Mid-Size Cushion Forklift
      }
    }

    log.debug({ title: 'getObjectConfigRule', details: 'segment: ' + segment });

    var columns = [];
    columns.push(search.createColumn({ name: 'custrecord_sna_hul_configurable_fields' }));
    columns.push(search.createColumn({ name: 'cseg_sna_hul_eq_seg' }));

    var srch = search.create({ type: 'customrecord_sna_object_config_rule', columns: columns });

    srch.run().each(function (result) {
      var finalflds = result.getValue({ name: 'custrecord_sna_hul_configurable_fields' });
      var seg = result.getText({ name: 'cseg_sna_hul_eq_seg' }); // FORKLIFT : CLASS IV
      log.debug({ title: 'getObjectConfigRule', details: 'search > seg: ' + seg });

      // When the Rental Object Configurator Rule Segment String is within the HUL Category Segment String of the Object selected, display all Object Record fields based on the Internal Ids listed under configurable field Text box
      if (segment.includes(seg) && !isEmpty(segment) && !isEmpty(seg)) {
        arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');

        return false; // get first
      }
      // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
      if (isEmpty(seg) && isEmpty(segment)) {
        arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');

        return false; // get first
      }
      // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
      if (isEmpty(seg) && !isEmpty(segment)) {
        temp_arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
      }

      return true;
    });

    // no match found
    if (isEmpty(arrfinalflds)) {
      arrfinalflds = temp_arrfinalflds;
    }

    return arrfinalflds;
  }

  return { onRequest };
});

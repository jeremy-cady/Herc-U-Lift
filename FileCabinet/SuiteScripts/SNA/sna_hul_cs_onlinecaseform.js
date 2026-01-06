/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script deployed to online case form
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/11/12                                aduldulao       Initial version.
 * 2022/12/12                                aduldulao       Customer lookup
 * 2022/01/23                                fang            Customer ID lookup
 * 2022/01/30                                fang            Added the following:
 *                                                             - Added condition, if resp.body is not blank, parse resp.body
 *                                                             - If customer ID found, set customer internal ID value on Customer field; else, set Customer field = 69 SNA Test Customer
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/https'],
  /**
   * @param{currentRecord} currentRecord
   */
  function (currentRecord, url, https) {

    // UTILITY FUNCTIONS
    function inArray(stValue, arrValue) {
      for (var i = arrValue.length - 1; i >= 0; i--) {
        if (stValue == arrValue[i]) {
          break;
        }
      }
      return (i > -1);
    }

    function isEmpty(stValue) {
      return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
        for (var k in v)
          return false;
        return true;
      })(stValue)));
    }

    function isEmptyObj(obj) {
      for(var prop in obj) {
          if(obj.hasOwnProperty(prop))
              return false;
      }
      return true;
  }

    /**
     * Hide or unhide fields
     * @param flds
     * @param currrec
     * @param show
     */
    function hideFld(flds, currrec, show) {
      for (var i = 0; i < flds.length; i++) {
        var field = currrec.getField({ fieldId: flds[i] });

        if (field) {
          field.isDisplay = show;
        }

        if (!show) {
          currrec.setValue({ fieldId: flds[i], value: '', ignoreFieldChange: true });
        }
      }
    }

    /**
     * General fields included
     * @returns {string[]}
     */
    function getGeneralFld() {
      var flds = [
        'custevent_sna_hul_casefleetcode',
        'custevent_sna_hul_caseserialno',
        'custevent_sna_hul_manufcode',
        'custevent_sna_hul_eqptmodel',
        'custevent_sna_hul_caseframenum',
        'custevent_sna_hul_casepower',
        'custevent_sna_hul_casecapacity',
        'custevent_sna_hul_casetires',
        'custevent_sna_hul_caseheight',
        'custevent_sna_hul_casewarrantytype'
      ]

      return flds;
    }

    /**
     * Case Type = Parts Request
     * Case Type = Complaint or Question and Request Type = Equipment Sales or Parts Sales
     * @returns {string[]}
     */
    function getPartsReqFld() {
      var flds = [
        'custevent_sna_hul_caseassetsite',
        'custevent_sna_hul_caseobjectasset'
      ]

      return flds;
    }

    /**
     * Case Type = Rental Request, Delivery Request, Rental Pick Up or Service Request
     * Case Type = Complaint or Question and Request Type = Rentals, Deliveries, Maintenance, Installations, or Repair/Break-fix
     * @returns {string[]}
     */
    function getRentReqFld() {
      var flds = [
        'custevent_nx_case_asset',
        'custevent_nxc_case_assets'
      ]

      return flds;
    }

    /**
     * Case Type = Complaint or Question
     * @returns {string[]}
     */
    function getCompFld() {
      var flds = [
        'issue'
      ]

      return flds;
    }

    function getServiceFld() {
      var flds = [
        'custevent_sna_hul_service_type'
      ]

      return flds;
    }

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
      var partsReqFlds = getPartsReqFld();
      var rentReqFlds = getRentReqFld();
      var compFlds = getCompFld();
      var genFlds = getGeneralFld();

      var currrec = currentRecord.get();

      var cat = currrec.getValue({ fieldId: 'category' });

      if (isEmpty(cat)) {
        hideFld(partsReqFlds, currrec, false);
        hideFld(rentReqFlds, currrec, false);
        hideFld(compFlds, currrec, false);
        hideFld(genFlds, currrec, false);
      }
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
      console.log('scriptContext.fieldId', scriptContext.fieldId);

      if (scriptContext.fieldId == 'category' || scriptContext.fieldId == 'issue') {
        var partsReqFlds = getPartsReqFld();
        var rentReqFlds = getRentReqFld();
        var compFlds = getCompFld();
        var genFlds = getGeneralFld();
        var serviceFlds = getServiceFld();

        var currrec = currentRecord.get();
        var cat = currrec.getText({ fieldId: 'category' });
        var issue = currrec.getText({ fieldId: 'issue' });

        if (isEmpty(cat)) {
          hideFld(partsReqFlds, currrec, false);
          hideFld(rentReqFlds, currrec, false);
          hideFld(compFlds, currrec, false);
          hideFld(genFlds, currrec, false);
          hideFld(serviceFlds, currrec, false);
        }

        else if (cat == 'Parts Request') {
          hideFld(partsReqFlds, currrec, true);
          hideFld(rentReqFlds, currrec, false);
          hideFld(compFlds, currrec, false);
          hideFld(genFlds, currrec, true);
          hideFld(serviceFlds, currrec, false);
        }

        else if (cat == 'Rental Request' || cat == 'Delivery Request' || cat == 'Rental Pick Up' || cat == 'Service Request') {
          hideFld(partsReqFlds, currrec, false);
          hideFld(rentReqFlds, currrec, true);
          hideFld(compFlds, currrec, false);
          hideFld(genFlds, currrec, true);

          if (cat == 'Service Request') {
            hideFld(serviceFlds, currrec, true);
          } else {
            hideFld(serviceFlds, currrec, false);
          }
        }

        else if (cat == 'Complaint' || cat == 'Question') {
          hideFld(compFlds, currrec, true);
          hideFld(genFlds, currrec, true);

          if (issue == 'Rentals' || issue == 'Deliveries' || issue == 'Maintenance' || issue == 'Installations' || issue == 'Repair/Break-fix') {
            hideFld(rentReqFlds, currrec, true);
            hideFld(genFlds, currrec, true);
            hideFld(partsReqFlds, currrec, false);
          }
          else if (issue == 'Equipment Sales' || issue == 'Parts Sales') {
            hideFld(partsReqFlds, currrec, true);
            hideFld(genFlds, currrec, true);
            hideFld(rentReqFlds, currrec, false);
          }
          else {
            hideFld(rentReqFlds, currrec, false);
            hideFld(genFlds, currrec, false);
            hideFld(partsReqFlds, currrec, false);
          }
        }

        else {
          hideFld(partsReqFlds, currrec, false);
          hideFld(rentReqFlds, currrec, false);
          hideFld(compFlds, currrec, false);
          hideFld(genFlds, currrec, false);
          hideFld(serviceFlds, currrec, false);
        }
      }

      if (scriptContext.fieldId == 'custevent_sna_hul_caseobjectasset' || scriptContext.fieldId == 'custevent_nxc_case_assets') {
        console.log('scriptContext.fieldId', scriptContext.fieldId);
        var currrec = currentRecord.get();
        var genFlds = getGeneralFld();

        console.log('currrec', JSON.stringify(currrec));

        var assetobj = currrec.getValue({ fieldId: scriptContext.fieldId });
        console.log('assetobj', assetobj);

        if (!isEmpty(assetobj)) {
          console.log('assetobj.length:  ' + assetobj.length);

          if (!isEmpty(assetobj[0]) && assetobj.length == 1) {
            console.log('before setObjectFlds');
            hideFld(genFlds, currrec, true);
            setObjectFlds(assetobj, currrec);
          } else if (assetobj.length > 1){
            console.log('multiple selected');
            hideFld(genFlds, currrec, false);
          }
        }
      }

      if (scriptContext.fieldId == 'custevent_sna_hul_customer') {
        var currrec = currentRecord.get();
        var cust = currrec.getValue({ fieldId: scriptContext.fieldId });

        setCustFlds(cust, currrec);
      }

      if (scriptContext.fieldId == 'custevent_sna_customer_id') {
        var currrec = currentRecord.get();
        var cust = currrec.getValue({ fieldId: scriptContext.fieldId });

        setCustFlds(cust, currrec);
      }
    }

    /**
     * Set customer fields
     * @param cust
     * @param currrec
     */
    function setCustFlds(cust, currrec) {
      var slUrl = url.resolveScript({ scriptId: 'customscript_sna_hul_sl_onlinecaseform', deploymentId: 'customdeploy_sna_hul_sl_onlinecaseform', returnExternalUrl: true });
      slUrl += '&cust=' + cust;

      // Perform HTTP POST call
      var resp = https.get({ url: slUrl });

      if (!isEmpty(resp.body)) {
        var custval = JSON.parse(resp.body);
      } else {
        console.log('resp.body is empty');
      }

      console.log('custval: ' + JSON.stringify(custval));

      if (!isEmpty(custval)) {
        currrec.setValue({ fieldId: 'custevent_sna_hul_customer', value: custval.internalid, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'companyname', value: custval.companyname, ignoreFieldChange: true });
        //currrec.setValue({fieldId: 'Customer_CompanyName', value: custval.companyname, ignoreFieldChange: true});
        currrec.setValue({ fieldId: 'email', value: custval.email, ignoreFieldChange: true });
        // currrec.setValue({fieldId: 'Case_Email', value: custval.email, ignoreFieldChange: true});
        currrec.setValue({ fieldId: 'address1', value: custval.billaddress1, ignoreFieldChange: true });
        // currrec.setValue({fieldId: 'Entity_Address_1', value: custval.billaddress1, ignoreFieldChange: true});
        currrec.setValue({ fieldId: 'address2', value: custval.billaddress2, ignoreFieldChange: true });
        // currrec.setValue({fieldId: 'Entity_Address_2', value: custval.billaddress2, ignoreFieldChange: true});
        currrec.setValue({ fieldId: 'city', value: custval.billcity, ignoreFieldChange: true });
        // currrec.setValue({fieldId: 'Entity_City', value: custval.billcity, ignoreFieldChange: true});
        currrec.setText({ fieldId: 'state', text: custval.state, ignoreFieldChange: true });
        // currrec.setValue({fieldId: 'Entity_State', value: custval.billstate, ignoreFieldChange: true});
        currrec.setValue({ fieldId: 'zipcode', value: custval.billzipcode, ignoreFieldChange: true });
        // currrec.setValue({fieldId: 'Entity_ZipCode', value: custval.billzipcode, ignoreFieldChange: true});
      } else {
        console.log('custval is empty');
        currrec.setValue({ fieldId: 'custevent_sna_hul_customer', value: 810, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'companyname', value: '', ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'email', value: '', ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'address1', value: '', ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'address2', value: '', ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'city', value: '', ignoreFieldChange: true });
        currrec.setText({ fieldId: 'state', text: '', ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'zipcode', value: '', ignoreFieldChange: true });
      }
    }

    /**
     * Set object fields
     * @param assetobj
     * @param currrec
     */
    function setObjectFlds(assetobj, currrec) {
      var slUrl = url.resolveScript({ scriptId: 'customscript_sna_hul_sl_onlinecaseform', deploymentId: 'customdeploy_sna_hul_sl_onlinecaseform', returnExternalUrl: true });
      slUrl += '&assetobj=' + assetobj;

      // Perform HTTP POST call
      var resp = https.get({ url: slUrl });

      var objval = JSON.parse(resp.body);
      console.log('objval: ', JSON.stringify(objval));
      if (!isEmpty(objval)) {
        currrec.setValue({ fieldId: 'custevent_sna_hul_casefleetcode', value: objval.custrecord_sna_fleet_code, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_caseserialno', value: objval.custrecord_sna_serial_no, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_manufcode', value: objval.custrecord_sna_man_code, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_eqptmodel', value: objval.custrecord_sna_equipment_model, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_caseframenum', value: objval.custrecord_sna_frame_no, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_casepower', value: objval.custrecord_sna_power_new, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_casecapacity', value: objval.custrecord_sna_capacity_new, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_casetires', value: objval.custrecord_sna_tires_new, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_caseheight', value: objval.custrecord_sna_work_height, ignoreFieldChange: true });
        currrec.setValue({ fieldId: 'custevent_sna_hul_casewarrantytype', value: objval.custrecord_sna_warranty_type, ignoreFieldChange: true });
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
      var currrec = currentRecord.get();
      var cat = currrec.getText({ fieldId: 'category' });
      var issue = currrec.getValue({ fieldId: 'issue' });

      if (cat == 'Complaint' || cat == 'Question') {
        if (isEmpty(issue)) {
          alert('Please enter value(s) for: Request Type');
          return false;
        }
      }

      return true;
    }

    return {
      pageInit: pageInit,
      fieldChanged: fieldChanged,
      saveRecord: saveRecord
    };

  });

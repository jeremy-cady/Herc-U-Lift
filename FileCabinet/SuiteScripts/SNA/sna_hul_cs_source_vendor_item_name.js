/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author mdesilva
 *
 * Script brief description:
 * Client script deployed on Purchase Order records to source Item's Vendor Item Name
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2023/03/10                        mdesilva         Initial version
 * 
 *
 */
define(['N/runtime', 'N/search', 'N/currentRecord', 'N/ui/dialog', 'N/url', 'N/https', 'N/format'],
  function (runtime, search, currentRecord, dialog, url, https, format) {

	  function validateInsert(context) {
		  var LOG_TITLE = 'validateInsert';

		  var currentRecord = context.currentRecord;
		  var sublistName = context.sublistId;
		  var buy_from_vendor = currentRecord.getValue({
			  fieldId: 'custbody_sna_buy_from'
		  });
		  log.debug(LOG_TITLE, 'buy_from_vendor: ' + buy_from_vendor);

		  if (sublistName === 'item') {
			  var itemID = currentRecord.getCurrentSublistValue({
				  sublistId: 'item',
				  fieldId: 'item'
			  });
			  log.debug(LOG_TITLE, 'itemID: ' + itemID);
			  if (!isEmpty(itemID) && !isEmpty(buy_from_vendor)) {
				  var customrecord_sna_hul_vendorpriceSearchObj = search.create({
					  type: "customrecord_sna_hul_vendorprice",
					  filters: [
						  ["custrecord_sna_hul_vendor", "anyof", buy_from_vendor],
						  "AND",
						  ["custrecord_sna_hul_item", "anyof", itemID]
					  ],
					  columns: [
						  "custrecord_sna_vendor_item_name2"
					  ]
				  });

				  var vendor_item_name;
				  customrecord_sna_hul_vendorpriceSearchObj.run().each(function (result) {
					  vendor_item_name = result.getValue({
						  name: 'custrecord_sna_vendor_item_name2'
					  });
					  return true;
				  });
				  log.debug(LOG_TITLE, 'vendor_item_name: ' + vendor_item_name);
				  if (!isEmpty(vendor_item_name)) {
					  currentRecord.setCurrentSublistValue({
						  sublistId: sublistName,
						  fieldId: 'custcol_sna_vendor_item_name',
						  value: vendor_item_name
					  });
				  }
			  } else {
				  log.debug(LOG_TITLE, 'item or buy_from_vendor is empty');
			  }
		  }
		  return true;
	  }


	  function fieldChanged(context) {
		  var LOG_TITLE = 'fieldChanged';

		  var currentRecord = context.currentRecord;
		  var sublistName = context.sublistId;
		  var sublistFieldName = context.fieldId;
		  var buy_from_vendor = currentRecord.getValue({
			  fieldId: 'custbody_sna_buy_from'
		  });


		  if (sublistName === 'item' && sublistFieldName === 'item') {
			  log.debug(LOG_TITLE, 'buy_from_vendor: ' + buy_from_vendor);
			  var itemID = currentRecord.getCurrentSublistValue({
				  sublistId: 'item',
				  fieldId: 'item'
			  });
			  log.debug(LOG_TITLE, 'itemID: ' + itemID);
			  if (!isEmpty(itemID) && !isEmpty(buy_from_vendor)) {
				  var customrecord_sna_hul_vendorpriceSearchObj = search.create({
					  type: "customrecord_sna_hul_vendorprice",
					  filters: [
						  ["custrecord_sna_hul_vendor", "anyof", buy_from_vendor],
						  "AND",
						  ["custrecord_sna_hul_item", "anyof", itemID]
					  ],
					  columns: [
						  "custrecord_sna_vendor_item_name2"
					  ]
				  });

				  var vendor_item_name;
				  customrecord_sna_hul_vendorpriceSearchObj.run().each(function (result) {
					  vendor_item_name = result.getValue({
						  name: 'custrecord_sna_vendor_item_name2'
					  });
					  return true;
				  });
				  log.debug(LOG_TITLE, 'vendor_item_name: ' + vendor_item_name);
				  if (!isEmpty(vendor_item_name)) {
					  currentRecord.setCurrentSublistValue({
						  sublistId: sublistName,
						  fieldId: 'custcol_sna_vendor_item_name',
						  value: vendor_item_name,
						  ignoreFieldChange: false,
						  fireSlavingSync: true
					  });
				  }
			  } else {
				  log.debug(LOG_TITLE, 'item or buy_from_vendor is empty');
			  }
		  }
	  }

	  function isEmpty(stValue) {
		  return ((stValue == 0 || stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
			  for (var k in v)
				  return false;
			  return true;
		  })(stValue)));
	  }

	  function purchaseEquipmentFxn() {
		  var currRec = currentRecord.get();

		  //var currentUrl=;
		  var currentUrl = new URL(document.location.href);
		  var poId = currentUrl.searchParams.get("id");

		  console.log('purchaseEquipmentFxn > poId', poId);

		  var employee = currRec.getValue({
			  fieldId: 'employee'
		  });

		  console.log('purchaseEquipmentFxn > employee', employee);

		  var otherRefNum = currRec.getValue({
			  fieldId: 'otherrefnum'
		  });

		  console.log('purchaseEquipmentFxn > otherRefNum', otherRefNum);

		  var dueDate = currRec.getValue({
			  fieldId: 'duedate'
		  });

		  console.log('purchaseEquipmentFxn > dueDate', dueDate);

		  var tranDate = currRec.getValue({
			  fieldId: 'trandate'
		  });

		  console.log('purchaseEquipmentFxn > tranDate', tranDate);
		  console.log('purchaseEquipmentFxn > tranDate tostring', tranDate.toLocaleDateString());

		  var memo = currRec.getValue({
			  fieldId: 'memo'
		  });

		  console.log('purchaseEquipmentFxn > memo', memo);

		  var poType = currRec.getValue({
			  fieldId: 'custbody_po_type'
		  });

		  console.log('purchaseEquipmentFxn > poType', poType);

		  var objectSubs = currRec.getValue({
			  fieldId: 'custbody_sna_hul_object_subsidiary'
		  });

		  console.log('purchaseEquipmentFxn > objectSubs', objectSubs);

		  //Getting PO fields for validation
		  var vendor = currRec.getValue({
			  fieldId: 'entity'
		  });

		  console.log('purchaseEquipmentFxn > vendor', vendor);

		  var location = currRec.getValue({
			  fieldId: 'location'
		  });

		  console.log('purchaseEquipmentFxn > location', location);

		  var department = currRec.getValue({
			  fieldId: 'department'
		  });

		  console.log('purchaseEquipmentFxn > department', department);

		  if (!isEmpty(vendor) && !isEmpty(location) && !isEmpty(department)) {
			  console.log('purchaseEquipmentFxn > vendor + loc + dept populated');
			  //
			  // var lineCount = currRec.getLineCount({
				//   sublistId: 'item'
			  // });
			  //
			  // if (lineCount < 1) {
				//   currRec.selectNewLine({
				// 	  sublistId: 'item'
				//   });
			  //
				//   currRec.setCurrentSublistValue({
				// 	  sublistId: 'item',
				// 	  fieldId: 'item',
				// 	  value: 101361 //New Equipment
				//   });
			  //
				//   currRec.commitLine({
				// 	  sublistId: 'item'
				//   });
			  // }
			  //
			  // var poRecId = currRec.save();

			  // var poRecId = jQuery('#btn_multibutton_submitter').click();

			  var poDetails = {
				  'location': location,
				  'entity': vendor,
				  'employee': employee,
				  'other_ref_num': otherRefNum,
				  'due_date':dueDate,
				  // 'tran_date': tranDate,
				  'tran_date': tranDate.toLocaleDateString(),
				  'memo':memo,
				  'po_type': poType,
				  'object_subsidiary': objectSubs,
				  'department': department
			  };
			  //Setting tranDate.toLocaleDateString() to get the Date part and converting it to string (to prevent timezone difference/discrepancy)


			  console.log('purchaseEquipmentFxn > poDetails', poDetails);


			  var suiteletUrl = url.resolveScript({
				  scriptId: 'customscript_sna_hul_sl_create_obj_rec',
				  deploymentId: 'customdeploy_sna_hul_sl_create_obj_rec',
				  params: {
					  'location': location,
					  'po_id': poId,
					  'po_details': JSON.stringify(poDetails)
				  }
			  });

			  // var resp = https.get.promise({ url: suiteletUrl });
			  //
			  // if (!isEmpty(resp.body)) {
			  // 	var custval = JSON.parse(resp.body);
			  //
			  // 	console.log('custval: ' + JSON.stringify(custval));
			  // } else {
			  // 	console.log('resp.body is empty');
			  // }

			  window.open(suiteletUrl, "Create Object Record");

			  console.log({title: 'purchaseEquipmentFxn', details: "suiteletUrl: " + JSON.stringify(suiteletUrl)});

		  } else {
			  var options = {
				  title: 'User Error',
				  message: 'Both Pay To/Bill To Vendor, Location, and Department fields need to be populated.'
			  };

			  dialog.alert(options);
		  }

	  }

	  function setPOItems(inputData) {
		  console.log('setPOItems - inputData: ' + JSON.stringify(inputData));

		  var objectRecArr = inputData.object_rec_arr;

		  console.log('setPOItems - objectRecArr: ' + objectRecArr);

		  window.opener.require(['N/currentRecord'], function () {

			  var currRec = window.opener.require('N/currentRecord').get();

			  console.log('setPOItems - currRec: ' + JSON.stringify(currRec));
			  console.log('setPOItems - objectRecArr.length: ' + objectRecArr.length);

			  //if (!isEmpty(inputData.other_charge_1) && !isEmpty(inputData.other_charge_1_amt)) {

			  for (var i = 0; i < objectRecArr.length; i++) {
				  currRec.selectNewLine({
					  sublistId: 'item'
				  });
				  console.log('setPOItems - after selectNewLine');

				  currRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'item',
					  value: inputData.item
				  });
				  console.log('setPOItems - after setCurrentSublistValue - item: ', inputData.item);


				  currRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'quantity',
					  value: 1
				  });

				  console.log('setPOItems - after setCurrentSublistValue - qty');



				  console.log('setPOItems - after setCurrentSublistValue - department');

				  currRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'rate',
					  value: inputData.rate
				  });

				  console.log('setPOItems - after setCurrentSublistValue - rate: ', inputData.rate);


				  currRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_sna_hul_fleet_no',
					  value: objectRecArr[i]
				  });

				  console.log('setPOItems - after setCurrentSublistValue - custcol_sna_hul_fleet_no: ', objectRecArr[i]);

				  //Lookup for Object ID
				  var objectIDLookup = search.lookupFields({
					  type: 'customrecord_sna_objects',
					  id: objectRecArr[i],
					  columns: 'name'
				  }).name;

				  console.log('objectIDLookup', objectIDLookup);
				  console.log('inputData.item == 101361: ', inputData.item == 101361);
				  console.log('inputData.item == 101362: ', inputData.item == 101362);

				  if (inputData.item == 101361 || inputData.item == 101362) {
					  console.log('setPOItems - inside if statement - item is serialized');

					  //New Equipment = 101361; Used Equipment = 101362

					  // var invDetail = recCurrent.getSubrecord({
						//   fieldId: "inventorydetail"
					  // });

					  // var invDetail = recCurrent.getCurrentSublistSubrecord({
						//   sublistId: 'item',
						//   fieldId: 'inventorydetail'
					  // });
					  //
					  // console.log('setPOItems - after getSubrecord');
					  //
					  // invDetail.selectNewLine({
						//   sublistId: "inventoryassignment",
					  // });
					  //
					  // invDetail.setCurrentSublistText({
						//   sublistId: "inventoryassignment",
						//   fieldId: "receiptinventorynumber",
						//   text: objectIDLookup
					  // });
					  //
					  // invDetail.commitLine({
						//   sublistId: "inventoryassignment",
					  // });
				  }

				  currRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'department',
					  value: 34
				  });

				  currRec.commitLine({
					  sublistId: 'item'
				  })
			  }

			  window.onbeforeunload = null;
			  window.close();
		  });
	  }

	  return {
		  fieldChanged: fieldChanged,
		  //validateInsert: validateInsert,
		  purchaseEquipmentFxn: purchaseEquipmentFxn,
		  setPOItems: setPOItems
	  };
  });
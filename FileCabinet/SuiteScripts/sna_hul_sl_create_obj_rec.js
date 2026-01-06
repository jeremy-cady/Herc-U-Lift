/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author fang
 *
 * Script brief description:
 * This Suitelet is used create Object Record using the values set on this SL.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               	Issue Fix Summary
 * =============================================================================================
 * 2024/02/07							fang					Update PO record creation with Suitelet data (Fleet Code, Serial No, Equipment/Posting/Category, Rate, HUL Manuf)
 * 2023/10/09                           fang              	    Initial version
 *
 *
 */


define(["N/record", "N/search", "N/ui/serverWidget", "N/url", "N/runtime", 'N/redirect', 'N/format',],
  /**
   * @param{record} record
   * @param{search} search
   */
  (record, search, serverWidget, url, runtime, redirect, format) => {
	  /**
	   * Defines the Suitelet script trigger point.
	   * @param {Object} scriptContext
	   * @param {ServerRequest} scriptContext.request - Incoming request
	   * @param {ServerResponse} scriptContext.response - Suitelet response
	   * @since 2015.2
	   */
	  const onRequest = (scriptContext) => {
		  const LOG_TITLE = "onRequest";
		  log.debug({title: LOG_TITLE, details: "|---START---|"});

		  let form, request, response, params, requestMethod, currUserID;

		  request = scriptContext.request;
		  response = scriptContext.response;
		  params = request.parameters;
		  requestMethod = request.method;
		  currUserID = runtime.getCurrentUser().id;

		  log.debug({
			  title: LOG_TITLE,
			  details: "requestMethod: " + requestMethod + " | params: " + JSON.stringify(params)
		  });

		  log.debug({
			  title: LOG_TITLE,
			  details: "requestMethod: " + requestMethod + " | params.location: " + params.location
		  });

		  log.debug({
			  title: LOG_TITLE,
			  details: "requestMethod: " + requestMethod + " | params.po_details: " + params.po_details
		  });

		  if (requestMethod == "GET") {
			  const LOG_TITLE_GET = "onRequest - GET";

			  form = serverWidget.createForm({
				  title: "Create Object Record",
				  hideNavBar: false
			  });

			  //form.clientScriptModulePath = "./sna_bec_cs_suitelet_fxns.js";

			  createUI(form, request, params, currUserID);

			  response.writePage(form);
		  } else { //POST
			  const LOG_TITLE_POST = "onRequest - POST";

			  log.debug({
				  title: LOG_TITLE_POST,
				  details: "requestMethod: " + requestMethod + " | params: " + JSON.stringify(params)
			  });

			  var customerOrderCheckbox;
			  params.custpage_sna_hul_customer_order == 'T' ? customerOrderCheckbox = true : customerOrderCheckbox = false;

			  log.debug({
				  title: LOG_TITLE_POST,
				  details: "customerOrderCheckbox: " + customerOrderCheckbox
			  });

			  var inputData = {
				  'item': params.custpage_sna_hul_item,
				  'qty': params.custpage_sna_hul_qty_formattedValue, //check on this if must use custpage_sna_hul_qty
				  'fleet_code': params.custpage_sna_hul_fleet_code,
				  'serial_no': params.custpage_sna_hul_serial_no,
				  'equip_postng_cat_grp': params.custpage_sna_hul_equip_postng_cat_grp,
				  'hul_manuf': params.custpage_sna_hul_manuf,
				  'equipment_model': params.custpage_sna_hul_equipment_model,
				  'year': params.custpage_sna_hul_year,
				  'owner_status': params.custpage_sna_hul_owner_status,
				  'posting_status': params.custpage_sna_hul_posting_status,
				  'status': params.custpage_sna_hul_status,
				  'customer_order': customerOrderCheckbox,
				  'responsibility_center': params.custpage_sna_hul_responsibility_center,
				  'rate': params.custpage_sna_hul_rate,
				  'other_charge_1': params.custpage_sna_hul_other_charge_1,
				  'other_charge_1_amt': params.custpage_sna_hul_other_charge_1_amt,
				  'other_charge_2': params.custpage_sna_hul_other_charge_2,
				  'other_charge_2_amt': params.custpage_sna_hul_other_charge_2_amt,
				  'other_charge_3': params.custpage_sna_hul_other_charge_3,
				  'other_charge_3_amt': params.custpage_sna_hul_other_charge_3_amt,
				  'po_details': params.custpage_sna_hul_po_details,
				  'received_by_date': params.custpage_sna_hul_exp_recpt_date,
				  'po_id': params.custpage_sna_hul_po_id
			  };


			  log.debug({
				  title: LOG_TITLE_POST,
				  details: "inputData: " + JSON.stringify(inputData)
			  });

			  var objectRecArr = [];

			  // Creating custom Object record
			  for (var i = 1; i <= inputData.qty; i++) {

				  //Creating custom Object Record

				  var fleetCode;
				  var serialNum;

				  i > 1 ? fleetCode = inputData.fleet_code + '-' + i : fleetCode = inputData.fleet_code;
				  i > 1 ? serialNum = inputData.serial_no + '-' + i : serialNum = inputData.serial_no;

				  // if (i > 1) {
				  //   fleetCode = inputData.fleet_code + '-' + i
				  // } else {
				  //   fleetCode = inputData.fleet_code;
				  // }

				  var objectRecord = record.create({
					  type: 'customrecord_sna_objects',
					  isDynamic: true
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_fleet_code',
					  value: fleetCode
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_serial_no',
					  value: serialNum
					  // value: inputData.serial_no
				  });

				  objectRecord.setValue({
					  fieldId: 'cseg_sna_hul_eq_seg',
					  value: inputData.equip_postng_cat_grp
				  });

				  objectRecord.setValue({
					  fieldId: 'cseg_hul_mfg',
					  value: inputData.hul_manuf
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_equipment_model',
					  value: inputData.equipment_model
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_year',
					  value: inputData.year
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_owner_status',
					  value: inputData.owner_status
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_posting_status',
					  value: inputData.posting_status
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_status',
					  value: inputData.status
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_hul_customerorder',
					  value: inputData.customer_order
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_responsibility_center',
					  value: inputData.responsibility_center
				  });

				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_responsibility_center',
					  value: inputData.responsibility_center
				  });


				  objectRecord.setValue({
					  fieldId: 'custrecord_sna_expected_receipt_date',
					  value: new Date(inputData.received_by_date)
				  });

				  var objectRecID = objectRecord.save();

				  log.debug(LOG_TITLE_POST, 'objectRecID: ' + objectRecID);

				  objectRecArr.push(objectRecID);
			  }

			  inputData['object_rec_arr'] = objectRecArr;

			  //Create PO record

			  var poId = inputData.po_id;
			  var poDetails = JSON.parse(inputData.po_details);

			  log.debug({
				  title: LOG_TITLE_POST,
				  details: "poId: " + poId
			  });

			  log.debug({
				  title: LOG_TITLE_POST,
				  details: "poDetails: " + JSON.stringify(poDetails)
			  });

			  if (isEmpty(poId)) { //new PO
				  var poRec = record.create({
					  type: 'purchaseorder',
					  isDynamic: true
				  });

				  poRec.setValue({
					  fieldId: 'customform',
					  value: 130
				  });

				  poRec.setValue({
					  fieldId: 'entity',
					  value: poDetails.entity
				  });


				  poRec.setValue({
					  fieldId: 'employee',
					  value: poDetails.employee
				  });

				  poRec.setValue({
					  fieldId: 'otherrefnum',
					  value: poDetails.other_ref_num
				  });

				  if(!isEmpty(poDetails.due_date)) {
					  poRec.setValue({
						  fieldId: 'duedate',
						  value: new Date(poDetails.due_date)
					  });
				  }

				  log.debug('new date poDetails.tran_date', new Date(poDetails.tran_date));

				  poRec.setValue({
					  fieldId: 'trandate',
					  value: new Date(poDetails.tran_date)
				  });

				  poRec.setValue({
					  fieldId: 'memo',
					  value: poDetails.memo
				  });

				  poRec.setValue({
					  fieldId: 'location',
					  value: poDetails.location
				  });

				  poRec.setValue({
					  fieldId: 'custbody_po_type',
					  value: poDetails.po_type
				  });

				  poRec.setValue({
					  fieldId: 'custbody_sna_hul_object_subsidiary',
					  value: poDetails.object_subsidiary
				  });

				  poRec.setValue({
					  fieldId: 'department',
					  value: poDetails.department
				  });
			  } else { //existing PO
				  var poRec = record.load({
					  type: 'purchaseorder',
					  id: poId,
					  isDynamic: true,
				  });
			  }

			  log.debug({
				  title: LOG_TITLE_POST,
				  details: "poRec: " + JSON.stringify(poRec)
			  });

			  log.debug('objectRecArr.length', objectRecArr.length);

			  var totalLineCount = 0;

			  //Setting PO Line Items - setPOItems

			  //Adding lines based on # of object created
			  for (var i = 0; i < objectRecArr.length; i++) {
				  poRec.selectNewLine({
					  sublistId: 'item'
				  });

				  log.debug('setPOItems - after selectNewLine');

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'item',
					  value: inputData.item,
					  forceSyncSourcing: true
				  });

				  log.debug('setPOItems - after setCurrentSublistValue - item: ', inputData.item);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'quantity',
					  value: 1,
					  forceSyncSourcing: true
				  });

				  log.debug('setPOItems - after setCurrentSublistValue - qty');

				  //console.log('setPOItems - after setCurrentSublistValue - department');

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'rate',
					  // line: totalLineCount,
					  value: inputData.rate,
					  forceSyncSourcing: true
				  });

				  log.debug('setPOItems - after setCurrentSublistValue - rate: ', inputData.rate);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'department',
					  value: poDetails.department
				  });

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'location',
					  value: poDetails.location
				  });

				  log.debug('setPOItems - after setCurrentSublistValue - location: ', poDetails.location);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'expectedreceiptdate',
					  value: new Date(inputData.received_by_date)
				  });

				  log.debug('setPOItems - after setCurrentSublistValue - expectedreceiptdate: ', inputData.received_by_date);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_sna_hul_fleet_no',
					  // line: totalLineCount,
					  value: objectRecArr[i]
				  });

				  log.debug('setPOItems - after setCurrentSublistValue - custcol_sna_hul_fleet_no: ', objectRecArr[i]);


				  //Equipment/Posting/Category line field
				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'cseg_sna_hul_eq_seg',
					  // line: totalLineCount,
					  value: inputData.equip_postng_cat_grp
				  });

				  //HUL Manufacturer (2) line field
				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'cseg_hul_mfg',
					  // line: totalLineCount,
					  value: inputData.hul_manuf
				  });

				  //Lookup for Object ID
				  var objectIDLookup = search.lookupFields({
					  type: 'customrecord_sna_objects',
					  id: objectRecArr[i],
					  columns: ['name', 'custrecord_sna_fleet_code', 'custrecord_sna_serial_no']
				  });

				  log.debug('objectIDLookup', objectIDLookup);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_sna_po_fleet_code',
					  // line: totalLineCount,
					  value: objectIDLookup.custrecord_sna_fleet_code
				  });

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_sna_hul_eq_serial',
					  // line: totalLineCount,
					  value: objectIDLookup.custrecord_sna_serial_no
				  });

				  log.debug('inputData.item == 101361: ', inputData.item == 101361);
				  log.debug('inputData.item == 101362: ', inputData.item == 101362);

				  if (inputData.item == 101361 || inputData.item == 101362) {
					  log.debug('setPOItems - inside if statement - item is serialized');
					  //New Equipment = 101361; Used Equipment = 101362

					  var invDetail = poRec.getCurrentSublistSubrecord({
						  sublistId: 'item',
						  fieldId: 'inventorydetail',
						  // line: totalLineCount,
					  });

					  log.debug('setPOItems - after getSubrecord');

					  invDetail.selectNewLine({
						  sublistId: "inventoryassignment",
						  // line: 0
					  });

					  invDetail.setCurrentSublistValue({
						  sublistId: "inventoryassignment",
						  fieldId: "receiptinventorynumber",
						  // line: 0,
						  value: objectIDLookup.name
					  });

					  invDetail.commitLine({
						  sublistId: "inventoryassignment",
					  });
				  }

				  poRec.commitLine({
					  sublistId: 'item'
				  });

				  totalLineCount++;
			  }

			  //Adding line for Other Charge fields
			  if (!isEmpty(inputData.other_charge_1) && !isEmpty(inputData.other_charge_1_amt)) {
			  	log.debug('other charge 1 and other charge 1 amt are populated');

			    poRec.selectNewLine({
			  	  sublistId: 'item',
			  	  // line: totalLineCount,
			    });

			    log.debug('other charge 1 - after insertLine');

			    poRec.setCurrentSublistValue({
			  	  sublistId: 'item',
			  	  fieldId: 'item',
			  	  // line: totalLineCount,
			  	  value: inputData.other_charge_1
			    });

			    log.debug('other charge 1- item: ', inputData.other_charge_1);

			    poRec.setCurrentSublistValue({
			  	  sublistId: 'item',
			  	  fieldId: 'quantity',
			  	  // line: totalLineCount,
			  	  value: inputData.qty
			    });

			    log.debug('other charge 1 - qty');

			    poRec.setCurrentSublistValue({
			  	  sublistId: 'item',
			  	  fieldId: 'rate',
			  	  // line: totalLineCount,
			  	  value: inputData.other_charge_1_amt
			    });

			    log.debug('other charge 1 - amt: ', inputData.other_charge_1_amt);

			  	poRec.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'department',
					value: poDetails.department
				});

			  	poRec.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'location',
					value: poDetails.location
			  	});

			  	poRec.setCurrentSublistValue({
				  sublistId: 'item',
				  fieldId: 'expectedreceiptdate',
				  value: new Date(inputData.received_by_date)
			  	});


				poRec.commitLine({
					sublistId: 'item'
				})

			  }

			  if (!isEmpty(inputData.other_charge_2) && !isEmpty(inputData.other_charge_2_amt)) {
				  log.debug('other charge 2 and other charge 2 amt are populated');

				  poRec.selectNewLine({
					  sublistId: 'item',
					  // line: totalLineCount,
				  });

				  log.debug('other charge 2 - after insertLine');

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'item',
					  // line: totalLineCount,
					  value: inputData.other_charge_2
				  });

				  log.debug('other charge 2- item: ', inputData.other_charge_2);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'quantity',
					  // line: totalLineCount,
					  value: inputData.qty
				  });

				  log.debug('other charge 2 - qty');

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'rate',
					  // line: totalLineCount,
					  value: inputData.other_charge_2_amt
				  });

				  log.debug('other charge 2 - amt: ', inputData.other_charge_2_amt);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'department',
					  value: poDetails.department
				  });

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'location',
					  value: poDetails.location
				  });

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'expectedreceiptdate',
					  value: new Date(inputData.received_by_date)
				  });

				  poRec.commitLine({
					  sublistId: 'item'
				  })

			  }

			  if (!isEmpty(inputData.other_charge_3) && !isEmpty(inputData.other_charge_3_amt)) {
				  log.debug('other charge 3 and other charge 3 amt are populated');

				  poRec.selectNewLine({
					  sublistId: 'item',
					  // line: totalLineCount,
				  });

				  log.debug('other charge 3 - after insertLine');

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'item',
					  // line: totalLineCount,
					  value: inputData.other_charge_3
				  });

				  log.debug('other charge 3- item: ', inputData.other_charge_3);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'quantity',
					  // line: totalLineCount,
					  value: inputData.qty
				  });

				  log.debug('other charge 3 - qty');

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'rate',
					  // line: totalLineCount,
					  value: inputData.other_charge_3_amt
				  });

				  log.debug('other charge 3 - amt: ', inputData.other_charge_3_amt);

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'department',
					  value: poDetails.department
				  });

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'location',
					  value: poDetails.location
				  });

				  poRec.setCurrentSublistValue({
					  sublistId: 'item',
					  fieldId: 'expectedreceiptdate',
					  value: new Date(inputData.received_by_date)
				  });

				  poRec.commitLine({
					  sublistId: 'item'
				  })

			  }


			  var poRecId = poRec.save({
				  enableSourcing: true,
				  ignoreMandatoryFields: true
			  });

			  log.debug('poRecId', poRecId);


			  redirect.toRecord({
				  type: record.Type.PURCHASE_ORDER,
				  id: poRecId,
				  isEditMode: true
			  });


			  // // UI Form
			  // form = serverWidget.createForm({
			  //   title: "Go Back to Purchase Order",
			  //   hideNavBar: true
			  // });
			  //
			  // form.clientScriptModulePath = 'SuiteScripts/SNA/sna_hul_cs_source_vendor_item_name.js';
			  //
			  // form.addButton({
			  //   id: "custpage_ok",
			  //   label: "OK",
			  //   functionName: "setPOItems(" + JSON.stringify(inputData) + ");"
			  // });
			  //
			  // response.writePage(form);
			  //response.write(JSON.stringify(inputData));
		  }
	  };

	  const createUI = (form, request, params, currUserID) => {
		  const LOG_TITLE = "createUI";
		  log.debug({title: LOG_TITLE, details: "|---START---|"});


		  //Create Field Groups
		  var objInfoFldGrp = form.addFieldGroup({
			  id: 'object_info_fld_grp',
			  label: 'Object Information'
		  });

		  var pricingInfoFldGrp = form.addFieldGroup({
			  id: 'pricing_info_fld_grp',
			  label: 'Pricing Information'
		  });

		  //Adding fields to objInfoFldGrp
		  var itemFld = form.addField({
			  id: 'custpage_sna_hul_item',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Item',
			  // source: 'item',
			  container: 'object_info_fld_grp'
		  });

		  itemFld.isMandatory = true;

		  let itemFldOptions = getSelectOptionValues('item', currUserID);

		  log.debug('itemFldOptions', itemFldOptions);

		  itemFldOptions
			.forEach(element => {
				itemFld.addSelectOption({
					value: element.id,
					text: element.text
				});
			});

		  // projectstatusfilterfld.defaultvalue = params.project_status;

		  var qtyFld = form.addField({
			  id: 'custpage_sna_hul_qty',
			  type: serverWidget.FieldType.INTEGER,
			  label: 'Quantity',
			  container: 'object_info_fld_grp'
		  });

		  qtyFld.isMandatory = true;

		  var fleetCodeFld = form.addField({
			  id: 'custpage_sna_hul_fleet_code',
			  type: serverWidget.FieldType.TEXT,
			  label: 'Fleet Code',
			  container: 'object_info_fld_grp'
		  });

		  var serialNoFld = form.addField({
			  id: 'custpage_sna_hul_serial_no',
			  type: serverWidget.FieldType.TEXT,
			  label: 'Serial No',
			  container: 'object_info_fld_grp'
		  });

		  var equipmentPostingCatGrpFld = form.addField({
			  id: 'custpage_sna_hul_equip_postng_cat_grp',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Equipment Posting/Category/Group',
			  source: 'customrecord_cseg_sna_hul_eq_seg',
			  container: 'object_info_fld_grp'
		  });

		  var hulManufFld = form.addField({
			  id: 'custpage_sna_hul_manuf',
			  type: serverWidget.FieldType.SELECT,
			  label: 'HUL Manufacturer',
			  // source: 'customrecord_cseg_sna_hul_mfg',
			  source: 'customrecord_cseg_hul_mfg',
			  container: 'object_info_fld_grp'
		  });

		  var equipModelFld = form.addField({
			  id: 'custpage_sna_hul_equipment_model',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Equipment Model',
			  source: 'customlist_sna_equipment_model',
			  container: 'object_info_fld_grp'
		  });

		  var yearFld = form.addField({
			  id: 'custpage_sna_hul_year',
			  type: serverWidget.FieldType.INTEGER,
			  label: 'Year',
			  container: 'object_info_fld_grp'
		  });

		  var ownerStatusFld = form.addField({
			  id: 'custpage_sna_hul_owner_status',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Owner Status',
			  source: 'customlist_sna_owner_status',
			  container: 'object_info_fld_grp'
		  }).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

		  ownerStatusFld.defaultValue = 3;

		  var postingStatusFld = form.addField({
			  id: 'custpage_sna_hul_posting_status',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Posting Status',
			  source: 'customlist_sna_posting_status',
			  container: 'object_info_fld_grp'
		  });

		  var statusFld = form.addField({
			  id: 'custpage_sna_hul_status',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Status',
			  source: 'customrecord_sna_eq_inv_status_record', //Equipment/Inventory Status - SB ID: 212
			  container: 'object_info_fld_grp'
		  }).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

		  statusFld.defaultValue = 102;

		  var customerOrderFld = form.addField({
			  id: 'custpage_sna_hul_customer_order',
			  type: serverWidget.FieldType.CHECKBOX,
			  label: 'Customer Order',
			  container: 'object_info_fld_grp'
		  });

		  var responsibilityCenterFld = form.addField({
			  id: 'custpage_sna_hul_responsibility_center',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Responsibility Center',
			  source: 'location',
			  container: 'object_info_fld_grp'
		  });

		  responsibilityCenterFld.isMandatory = true;
		  responsibilityCenterFld.defaultValue = params.location;

		  var receivedByDateFld = form.addField({
			  id: 'custpage_sna_hul_exp_recpt_date',
			  type: serverWidget.FieldType.DATE,
			  label: 'Received By Date',
			  container: 'object_info_fld_grp'
		  });

		  receivedByDateFld.defaultValue = new Date();

		  var poIdFld = form.addField({
			  id: 'custpage_sna_hul_po_id',
			  type: serverWidget.FieldType.INTEGER,
			  label: 'PO ID',
			  container: 'object_info_fld_grp'
		  }).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

		  poIdFld.defaultValue = params.po_id;

		  //Adding fields to Pricing Information Field Group
		  var rateFld = form.addField({
			  id: 'custpage_sna_hul_rate',
			  type: serverWidget.FieldType.FLOAT,
			  label: 'Rate',
			  container: 'pricing_info_fld_grp'
		  });

		  rateFld.isMandatory = true;

		  //Other Charge fields
		  let otherChargeOptions = getSelectOptionValues('othercharge', currUserID);

		  log.debug('otherChargeOptions', otherChargeOptions);

		  var otherCharge1Fld = form.addField({
			  id: 'custpage_sna_hul_other_charge_1',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Other Charge 1',
			  // source: 'item',
			  container: 'pricing_info_fld_grp'
		  });

		  var otherCharge1AmtFld = form.addField({
			  id: 'custpage_sna_hul_other_charge_1_amt',
			  type: serverWidget.FieldType.FLOAT,
			  label: 'Other Charge 1 Amount',
			  container: 'pricing_info_fld_grp'
		  });

		  var otherCharge2Fld = form.addField({
			  id: 'custpage_sna_hul_other_charge_2',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Other Charge 2',
			  // source: 'item',
			  container: 'pricing_info_fld_grp'
		  });

		  var otherCharge2AmtFld = form.addField({
			  id: 'custpage_sna_hul_other_charge_2_amt',
			  type: serverWidget.FieldType.FLOAT,
			  label: 'Other Charge 2 Amount',
			  container: 'pricing_info_fld_grp'
		  });

		  var otherCharge3Fld = form.addField({
			  id: 'custpage_sna_hul_other_charge_3',
			  type: serverWidget.FieldType.SELECT,
			  label: 'Other Charge 3',
			  // source: 'item',
			  container: 'pricing_info_fld_grp'
		  });

		  var otherCharge3AmtFld = form.addField({
			  id: 'custpage_sna_hul_other_charge_3_amt',
			  type: serverWidget.FieldType.FLOAT,
			  label: 'Other Charge 3 Amount',
			  container: 'pricing_info_fld_grp'
		  });

		  //Adding filtered options to Other Charge fields 1,2,3
		  otherChargeOptions
			  .forEach(element => {
				  otherCharge1Fld.addSelectOption({
					  value: element.id,
					  text: element.text
				  });

				  otherCharge2Fld.addSelectOption({
					  value: element.id,
					  text: element.text
				  });

				  otherCharge3Fld.addSelectOption({
					  value: element.id,
					  text: element.text
				  });
			  });

		  var poDetailsFld = form.addField({
			  id: 'custpage_sna_hul_po_details',
			  type: serverWidget.FieldType.TEXT,
			  label: 'PO Details',
			  container: 'pricing_info_fld_grp'
		  });

		  poDetailsFld.defaultValue = params.po_details;
		  poDetailsFld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

		  form.addSubmitButton({
			  label: 'Submit'
		  });

		  log.debug({title: LOG_TITLE, details: "|---END---|"});

	  };

	  const getSelectOptionValues = (fld, currUserID) => {
		  const LOG_TITLE = "getSelectOptionValues";
		  const selectOptionValues = [];
		  let searchType;
		  let searchFilters = [];
		  let searchCols = [];

		  if (fld == 'item') {
			  searchType = 'item';
			  searchFilters.push(["custitem_sna_hul_purchased_eq", "is", "T"]);

			  searchCols.push(search.createColumn({name: "itemid", label: "Name"}));
		  }

		  if (fld == 'othercharge') {
			  searchType = 'item';
			  searchFilters.push(["costcategory","anyof","4","2","3"]);
			  searchCols.push(search.createColumn({name: "itemid", label: "Name"}));

			  selectOptionValues.push({
				  id: '',
				  text: ''
			  });
		  }

		  const searchObj = search.create({
			  type: searchType,
			  filters: searchFilters,
			  columns: searchCols
			  //   [
			  // 	search.createColumn({name: "name", label: "Name"}),
			  // 	// search.createColumn({name: "companyname", label: "Project Name"})
			  // ],
		  });

		  searchObj.run().each(function (result) {
			  // .run().each has a limit of 4,000 results
			  log.debug('result: ', result);

			  let resultID = result.id;
			  let resultName = result.getValue("itemid");

			  selectOptionValues.push({
				  id: resultID,
				  text: resultName
			  });

			  return true;
		  });

		  return selectOptionValues;
	  };

	  function isEmpty(stValue) {
		  return ((stValue == 0 || stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
			  for (var k in v)
				  return false;
			  return true;
		  })(stValue)));
	  }

	  return {onRequest};

  });


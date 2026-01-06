/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

/**
 * Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Farhan Shaikh
 *
 * Script brief description:
 This is a User Event script to Send Sales Order details to 3PL.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               Issue Fix Summary
 * =============================================================================================
 * 2021/08/05                          Farhan Shaikh          Initial version
 * 2023/03/30                          aduldulao              Region mapping based on Zip Code
 * 2023/04/11                          aduldulao              Change format of equipment name
 * 2023/05/01                          aduldulao              Rxisting NXC EquipmentAsset where the object matched the object from the Rental Sales Order
 * 2023/10/05                          aduldulao       Used Equipment Item
 */

define(['N/record', 'N/runtime', 'N/search', './sna_hul_mod_sales_tax.js'], (record, runtime, search, mod_tax) => {
  const NOT_TAXABLE = -7;
  const NextServiceAssetType = { SITE: 1, EQUIPMENT: 2 };

  function getCustomForm(newRecord) {
    let customForm = newRecord.getValue({ fieldId: 'customform' });
    if (isEmpty(customForm)) {
      customForm = search.lookupFields({
        type: newRecord.type,
        id: newRecord.id,
        columns: ['customform'],
      }).customform[0].value;
    }
    return customForm;
  }

  function getCustomerPricingGroupByAddress(customerId, addressListId) {
    const searchObj = search.create({
      type: search.Type.CUSTOMER,
      filters: [
        search.createFilter({
          name: 'internalid',
          operator: search.Operator.ANYOF,
          values: customerId,
        }),
      ],
      columns: [
        search.createColumn({
          name: 'addressinternalid',
          join: 'Address',
        }),
        search.createColumn({
          name: 'custrecord_sna_cpg_parts',
          join: 'Address',
        }),
        search.createColumn({
          name: 'custrecord_sna_cpg_charge',
          join: 'Address',
        }),
        search.createColumn({
          name: 'custrecord_sna_cpg_service',
          join: 'Address',
        }),
      ],
    });

    const results = searchObj.run().getRange({ start: 0, end: 1000 });
    const address = results
      .map((x) => ({
        addressListId: x.getValue({ name: 'addressinternalid', join: 'address' }),
        pricingGroup: {
          parts: x.getValue({
            name: 'custrecord_sna_cpg_parts',
            join: 'address',
          }),
          charge: x.getValue({
            name: 'custrecord_sna_cpg_charge',
            join: 'address',
          }),
          service: x.getValue({
            name: 'custrecord_sna_cpg_service',
            join: 'address',
          }),
        },
      }))
      .find((x) => x.addressListId == addressListId);
    return address;
  }

  /**
   *
   * @param pricingGroup
   */
  function getResourcePricingTableUnitPrice(pricingGroup) {
    const { ANYOF } = search.Operator;

    const searchObj = search.create({
      type: 'customrecord_sna_hul_resrcpricetable',
      filters: [
        {
          name: 'custrecord_sna_rpt_cust_price_grp',
          operator: ANYOF,
          values: pricingGroup,
        },
      ],
      columns: [
        'custrecord_sna_rpt_cust_price_grp',
        'custrecord_sna_rev_stream',
        'custrecord_sna_rpt_manufacturer',
        'custrecord_sna_rpt_unit_price',
      ],
    });
    let unitPrice = 0;
    searchObj.run().each((result) => {
      unitPrice = Number(result.getValue({ name: 'custrecord_sna_rpt_unit_price' })) || 0;
    });

    return unitPrice;
  }

  /**
   * This function is only utilized when working with NXC Sales Order Form (Orders from Field Service Mobile)
   * @param {Record} newRecord
   * @param {boolean} identifies if the execution context is on create
   * @returns {Promise}
   */
  function updateSalesOrderSiteAsset(newRecord, isCreate) {
    const lookupKey = 'custbody_nx_asset.custrecord_nx_asset_address';
    const siteAssetAddress = search.lookupFields({
      type: newRecord.type,
      id: newRecord.id,
      columns: [lookupKey],
    })[lookupKey][0].value;
    const isOverriden = newRecord.getValue({ fieldId: 'custbody_sn_override_address' });
    const currentShipAddressList = newRecord.getValue({ fieldId: 'shipaddresslist' });
    if (isOverriden || currentShipAddressList == siteAssetAddress) {
      log.audit('NXC_SITE_AND_CURRENT_ADDRESS_SAME');
      return new Promise((resolve) => resolve(false));
    }
    let salesOrder = record.load({ type: record.Type.SALES_ORDER, id: newRecord.id });
    const customerId = newRecord.getValue({ fieldId: 'entity' });
    const fieldValues = {
      shipaddresslist: siteAssetAddress,
    };
    if (isCreate) {
      fieldValues.custbody_sna_hul_update_rev_stream = true;
      const pricing = getCustomerPricingGroupByAddress(customerId, siteAssetAddress);
      const sublistId = 'item';
      const lineCount = salesOrder.getLineCount({ sublistId: 'item' });

      const unitPrice = getResourcePricingTableUnitPrice(pricing.pricingGroup.service);
      for (let line = 0; line < lineCount; line++) {
        const serviceCodeType = salesOrder.getSublistValue({
          fieldId: 'custcol_sna_service_itemcode',
          sublistId,
          line,
        });
        if (serviceCodeType == 2) {
          const dollarDiscount = salesOrder.getSublistValue({
            fieldId: 'custcol_sna_hul_dollar_disc',
            sublistId,
            line,
          });
          const percentDiscount = salesOrder.getSublistValue({
            fieldId: 'custcol_sna_hul_perc_disc',
            sublistId,
            line,
          });
          const unitPercentageDiscount = unitPrice * parseFloat(percentDiscount || 0 / 100);
          const finalPrice = unitPrice - ((parseFloat(dollarDiscount) || 0) - unitPercentageDiscount);
          const quantity = salesOrder.getSublistValue({ fieldId: 'quantity', sublistId, line });
          salesOrder.setSublistValue({
            fieldId: 'custcol_sna_cpg_resource',
            value: pricing.pricingGroup.service,
            sublistId,
            line,
          });
          salesOrder.setSublistValue({
            fieldId: 'rate',
            value: finalPrice,
            sublistId,
            line,
          });
          salesOrder.setSublistValue({
            fieldId: 'amount',
            value: quantity * finalPrice,
            sublistId,
            line,
          });
        }
        salesOrder.setSublistValue({
          fieldId: 'custcol_sna_hul_lock_rate',
          value: false,
          sublistId,
          line,
        });
      }
    }

    for (let [fieldId, value] of Object.entries(fieldValues)) {
      salesOrder.setValue({ fieldId, value });
    }
    return salesOrder.save.promise({ ignoreMandatoryFields: true });
  }

  const getCurrentObjectStatus = ({ objectIds, script }) => {
    const INV_FOR_DELIVERY = script.getParameter({ name: 'custscript_sn_inv_ready_for_delivery' });
    const RF_FOR_DELIVERY = script.getParameter({ name: 'custscript_sn_rf_ready_for_delivery' });
    const searchObj = search.create({
      type: 'customrecord_sna_objects',
      filters: [
        search.createFilter({
          name: 'internalid',
          operator: search.Operator.ANYOF,
          values: objectIds,
        }),
      ],
      columns: [search.createColumn({ name: 'internalid' }), search.createColumn({ name: 'custrecord_sna_status' })],
    });

    const results = searchObj.run().getRange({ start: 0, end: 1000 });
    return results.map((result) => {
      const status = result.getValue({ name: 'custrecord_sna_status' });
      return {
        id: result.getValue({ name: 'internalid' }),
        isReadyForDelivery: status == INV_FOR_DELIVERY || status == RF_FOR_DELIVERY,
      };
    });
  };

  /**
   *
   * @param salesOrder
   * @param customForm
   * @returns {*[{id: number, line: number, isReadyForDelivery: boolean}]}
   */
  const getLineItemObjectStatus = (salesOrder, customForm) => {
    const script = runtime.getCurrentScript();
    const RENTAL_CHARGE = script.getParameter({ name: 'custscript_sn_rental_charge_id' });
    const NEW_EQUIPMENT = script.getParameter({ name: 'custscript_sn_new_equipment_id' });
    const USED_EQUIPMENT = script.getParameter({ name: 'custscript_sn_used_equipment_id' });
    const rentalOrderForm = script.getParameter({ name: 'custscript_sn_hul_autoasset_sorentalform' });
    log.audit({
      title: 'PARAMTERS',
      details: {
        RENTAL_CHARGE,
        NEW_EQUIPMENT,
        USED_EQUIPMENT,
        rentalOrderForm,
      },
    });
    const isRentalOrder = rentalOrderForm == customForm;
    const itemsToCheck = isRentalOrder ? [RENTAL_CHARGE] : [NEW_EQUIPMENT, USED_EQUIPMENT];
    const sublistId = 'item';
    const lineCount = salesOrder.getLineCount({ sublistId });

    let objects = [];
    for (let line = 0; line < lineCount; line++) {
      const itemId = salesOrder.getSublistValue({ fieldId: 'item', sublistId, line });
      if (itemsToCheck.includes(itemId)) {
        const objectId = salesOrder.getSublistValue({ fieldId: 'custcol_sna_object', sublistId, line });
        objects.push({
          id: objectId,
          line,
        });
      }
    }
    const objectIds = objects.map((x) => x.id);
    const objectStatus = getCurrentObjectStatus({ objectIds, script });
    return objects.map((x) => {
      const forDelivery = objectStatus.find((y) => y.id == x.id)?.isReadyForDelivery || false;
      x.isReadyForDelivery = forDelivery || false;
      return x;
    });
  };

  function afterSubmit(context) {
    let LOG_TITLE = 'afterSubmit';

    const { CREATE, EDIT } = context.UserEventType;
    if (![CREATE, EDIT].includes(context.type)) return;

    try {
      log.debug('afterSubmit', '-------------- Start --------------');
      const salesOrder = context.newRecord;
      const customForm = getCustomForm(salesOrder);
      log.debug('afterSubmit:CONTEXT_VALUES', {
        processingType: context.newRecord.type,
        id: context.newRecord.id,
        customForm: customForm,
      });

      const NXC_SALES_ORDER_FORM = 106; // assumption is address is already defined sa asset record.
      if (customForm == NXC_SALES_ORDER_FORM) {
        const isCreate = context.type == CREATE;
        updateSalesOrderSiteAsset(salesOrder, isCreate)
          .then((id) => {
            if (id) {
              log.audit('TITLE_SITE_ASSET_UPDATED', { salesOrderId: id });
            }
            const internal = mod_tax.updateLines(salesOrder, true);
            updateTaxCode(context.newRecord.id, internal);
          })
          .catch((err) => {
            log.error({
              title: 'ERROR_UPDATING_SITE_ASSET',
              details: {
                message: err.message,
                stack: err.stack,
              },
            });
          });
        return;
      }
      // succeeding lines is for RENTAL OR EQUIPMENT ORDER
      let dupchecking = salesOrder.getValue({ fieldId: 'custbody_sn_asset_dup_checking' });
      log.debug({ title: 'afterSubmit:dupchecking', details: dupchecking });
      if (dupchecking && runtime.executionContext === runtime.ContextType.MAP_REDUCE) return;

      const isSiteAddressOveridden = salesOrder.getValue({ fieldId: 'custbody_sn_override_address' });
      const customer = salesOrder.getValue({ fieldId: 'entity' });
      let shipAddress = salesOrder.getValue({ fieldId: 'shipaddress' });
      const shipZip = salesOrder.getValue({ fieldId: 'shipzip' });
      const isAddrChanged = salesOrder.getValue({ fieldId: 'custbody_sna_hul_address_changed' });
      log.debug({
        title: 'afterSubmit:ADDRESS_PARAMS',
        details: { salesOrderId: salesOrder.id, shipAddress, shipZip, isAddrChanged },
      });
      const addressFields = getAddress(salesOrder.id);
      log.audit('afterSubmit:ADDRESS_FIELDS', addressFields);
      const {
        shipAttention,
        shipAddressee,
        shipAddress1: shipaddress1,
        shipAddress2: shipaddress2,
        shipAddress3: shipaddress3,
      } = addressFields;
      log.debug({
        title: 'afterSubmit:getAddress_LOOKUP',
        details: { shipAttention, shipAddressee, shipaddress1, shipaddress2, shipaddress3 },
      });

      shipAddress = shipAddress.replace(shipAddressee, '').replace(shipAttention, '');

      if ((!isEmpty(shipaddress1) || !isEmpty(shipaddress2)) && !isEmpty(shipaddress3)) {
        log.debug({ title: LOG_TITLE, details: 'removing shipaddress3 in the customer address..' });
        shipAddress = shipAddress.replace(shipaddress3, '');
      }
      shipAddress = shipAddress
        .trim()
        .replace(/\n/g, ' ')
        .replace(/(\s\s\s*)/g, ' ')
        .trim();
      let final_shipAddress = shipAddress;
      log.debug(LOG_TITLE, 'shipAddress ' + shipAddress);

      const stItemLineCount = salesOrder.getLineCount({ sublistId: 'item' });
      log.debug(LOG_TITLE, 'stItemLineCount ' + stItemLineCount);

      let finalSiteAssetId = '';
      let finalEquipmentAssetId = '';

      log.audit('SEARCH_ASSET_RECORD1_PARAMS', {
        customer,
        assetType: NextServiceAssetType.SITE,
        shipAddress,
      });
      let objSearchResult = searchAssetRecord(customer, NextServiceAssetType.SITE, shipAddress, null); // 1 is for Site
      let siteAddress = objSearchResult.addressText;
      siteAddress = siteAddress
        .trim()
        .replace(/\n/g, ' ')
        .replace(/(\s\s\s*)/g, ' ')
        .trim();
      log.debug({ title: LOG_TITLE, details: { siteAddress } });

      let siteRecordIdFromSearch = objSearchResult.id;
      log.debug({ title: LOG_TITLE, details: { siteRecordIdFromSearch } });

      // custcol_sna_object - this will be used as reference
      const objectStatus = getLineItemObjectStatus(salesOrder, customForm);
      log.audit('OBJECT_STATUS', objectStatus);
      const sublistId = 'item';

      for (let line = 0; line < stItemLineCount; line++) {
        LOG_TITLE = 'afterSubmit_line_' + line;
        let objectConfigurator = salesOrder.getSublistValue({
          fieldId: 'custcol_sna_hul_object_configurator',
          sublistId,
          line,
        });
        log.debug({ title: `afterSubmit(${line}):objectConfig1`, details: { objectConfigurator } });

        let objectConfigurator2 = salesOrder.getSublistValue({
          fieldId: 'custcol_sna_hul_object_configurator_2',
          sublistId,
          line,
        });
        log.debug(`afterSubmit(${line}):objectConfig2`, { objectConfigurator2 });

        let isConfigured = isEmpty(objectConfigurator) ? true : false; // reversed
        let isConfigured2 = true; // leaving it true because this field can be empty

        if (!isEmpty(objectConfigurator)) isConfigured = checkIfConfigured(JSON.parse(objectConfigurator));
        if (!isEmpty(objectConfigurator2)) isConfigured2 = checkIfConfigured(JSON.parse(objectConfigurator2));

        log.debug({ title: `afterSubmit(${line}):bothConfigured?`, details: { isConfigured, isConfigured2 } });

        const objectId = salesOrder.getSublistValue({ fieldId: 'custcol_sna_object', sublistId, line });
        const isReadyForDelivery =
          objectStatus.find((x) => x.id == objectId && x.line == line)?.isReadyForDelivery || false;
        log.debug({ title: `afterSubmit(${line}):forDelivery?`, details: { isReadyForDelivery } });
        if (!isConfigured || !isConfigured2 || !isReadyForDelivery) continue;
        const siteRecordProps = {
          formId: 48,
          shipAddress: final_shipAddress,
          assetType: 1,
          customer: customer,
          addressText: final_shipAddress,
          shipZip: shipZip,
        };

        let equipmentRecName = '';
        const postingGroup = salesOrder.getSublistValue({ fieldId: 'cseg_sna_hul_eq_seg_display', sublistId, line });
        const manufacturer = salesOrder.getSublistValue({ fieldId: 'cseg_hul_mfg', sublistId, line });
        const objectModel = salesOrder.getSublistValue({ fieldId: 'custcol_sna_hul_obj_model', sublistId, line });
        equipmentRecName = postingGroup || manufacturer || objectModel || 'testname';

        const fleetNo = salesOrder.getSublistValue({ fieldId: 'custcol_sna_hul_fleet_no', sublistId, line });

        const equipmentRecordProps = {
          formId: 49,
          name: equipmentRecName,
          assetType: 2,
          parent: '',
          customer: customer,
          addressText: final_shipAddress,
          assetObject: fleetNo,
        };

        const isSiteAndShipAddrSame = siteAddress.toLowerCase() === shipAddress.toLowerCase();
        if (isEmpty(siteAddress) || (!isSiteAndShipAddrSame && !isEmpty(siteAddress) && !isEmpty(shipAddress))) {
          log.audit('SITE_ADDRESS_FOR_CREATION', {
            siteAddress,
            shipAddress,
            comparisonValue: isSiteAndShipAddrSame,
          });
          const newSiteRecordId = createSiteRecord(siteRecordProps);
          equipmentRecordProps.parent = newSiteRecordId;
          finalEquipmentAssetId = createEquipmentRecord(equipmentRecordProps); // search for existing equipment
          finalSiteAssetId = newSiteRecordId;
        } else {
          log.debug(`afterSubmit:${line}`, 'site address is not empty ');
          if (siteAddress.toLowerCase() === shipAddress.toLowerCase()) {
            log.debug('site address matches with ship address_searching_for_eq_asset', {
              customer,
              shipAddress,
              fleetNo,
              lineIndex: i,
            });
            let equipmentAssetRecord;
            try {
              equipmentAssetRecord = searchAssetRecord(customer, NextServiceAssetType.EQUIPMENT, shipAddress, fleetNo);
            } catch (err) {
              log.audit('NO_FLEET_NO_ASSIGNED', { index: i, params: { customer, shipAddress } });
              continue; // skip this iteration and dont create a new asset, check next line
            }
            let equipmentAddress = (equipmentAssetRecord?.addressText || '').trim();
            log.debug(`afterSubmit:${line}`, 'equipmentAddress ' + equipmentAddress);
            const isEquipmentAndShipAddressSame = equipmentAddress.toLowerCase() == shipAddress.toLowerCase();
            if (isEmpty(equipmentAddress) || isEquipmentAndShipAddressSame) {
              log.debug(`afterSubmit:${line}`, 'equipment Address is empty');
              equipmentRecordProps.parent = siteRecordIdFromSearch;
              finalEquipmentAssetId = createEquipmentRecord(equipmentRecordProps); // search for existing equipment
            } else {
              log.debug(`afterSubmit:${line}`, 'No need to create any record ');
              finalEquipmentAssetId = equipmentAssetRecord.id;
            }
            finalSiteAssetId = siteRecordIdFromSearch;
          }
        }
      }

      if (isEmpty(finalSiteAssetId)) {
        finalSiteAssetId = salesOrder.getValue('custbody_nx_asset');
      }

      log.debug({
        title: 'afterSubmit:finalSiteAssetId',
        details: { finalSiteAssetId, finalEquipmentAssetId },
      });

      const submitFieldProps = {};
      const internal = mod_tax.updateLines(salesOrder, true);

      if (!isEmpty(finalSiteAssetId)) {
        submitFieldProps.custbody_nx_asset = finalSiteAssetId;
        if (!isEmpty(finalEquipmentAssetId)) submitFieldProps.custbody_sna_hul_nxc_eq_asset = finalEquipmentAssetId;

        const siteAssetLookup = search.lookupFields({
          type: 'customrecord_nx_asset',
          id: finalSiteAssetId,
          columns: ['custrecord_nxc_na_asset_type', 'custrecord_nx_asset_address'],
        });
        log.debug('SITE_ASSET_LOOKUP', { ...siteAssetLookup, assetId: finalSiteAssetId });

        let assetType = '';
        let addressId = '';
        if (!isEmpty(siteAssetLookup.custrecord_nxc_na_asset_type)) {
          assetType = siteAssetLookup.custrecord_nxc_na_asset_type[0].value;
        }
        if (!isEmpty(siteAssetLookup.custrecord_nx_asset_address)) {
          addressId = siteAssetLookup.custrecord_nx_asset_address[0].value;
        }

        log.debug({
          title: 'ASSET_OVERRIDE_CHECK',
          details: {
            internal,
            isSiteAddressOveridden,
            addressId,
            isAssetTypeSITE: assetType == NextServiceAssetType.SITE,
          },
        });

        if (!isEmpty(finalEquipmentAssetId)) {
          /* const eqAssetLookup = search.lookupFields({
            type: 'customrecord_nx_asset',
            id: finalEquipmentAssetId,
            columns: ['custrecord_sna_hul_nxcassetobject'],
          });
          log.debug('EQUIPMENT_ASSET_LOOKUP', { ...eqAssetLookup, assetId: finalEquipmentAssetId });

          if (!isEmpty(eqAssetLookup.custrecord_sna_hul_nxcassetobject)) {
            submitFieldProps.custbody_sna_equipment_object = eqAssetLookup.custrecord_sna_hul_nxcassetobject[0].value;
          } */
        }

        // site asset
        const script = runtime.getCurrentScript();
        const rentOrderForm = script.getParameter({ name: 'custscript_sn_hul_autoasset_sorentalform' });
        const currentForm = salesOrder.getValue({ fieldId: 'customform' });
        const currentAdd = salesOrder.getValue({ fieldId: 'shipaddresslist' });
        if (
          assetType == NextServiceAssetType.SITE &&
          !isSiteAddressOveridden &&
          rentOrderForm != currentForm &&
          currentAdd != addressId &&
          !internal
        ) {
          submitFieldProps.shipaddresslist = addressId;
          // flag set to true to trigger sna_hul_ue_so_update_lines.js
          submitFieldProps.custbody_sna_hul_update_rev_stream = true;
        }

        log.debug('afterSubmit:SUBMIT_FIELD_PROPS', submitFieldProps);

        record.submitFields({ type: record.Type.SALES_ORDER, id: context.newRecord.id, values: submitFieldProps });
      }

      updateTaxCode(context.newRecord.id, internal);
    } catch (err) {
      log.error(LOG_TITLE, { message: err.message, stack: err.stack });
    }
    log.debug(LOG_TITLE, '-------------- Exit --------------');
  }

  function updateTaxCode(soid, internal) {
    let currentScript = runtime.getCurrentScript();
    let willcall = currentScript.getParameter({ name: 'custscript_sna_ofm_willcall' });
    let ship = currentScript.getParameter({ name: 'custscript_sna_ofm_ship' });
    let avataxpos = currentScript.getParameter({ name: 'custscript_sna_tax_avataxpos' });
    let avatax = currentScript.getParameter({ name: 'custscript_sna_tax_avatax' });

    let finaltaxcode = '';

    let rec = record.load({ type: record.Type.SALES_ORDER, id: soid });
    rec.setValue({ fieldId: 'custbody_ava_disable_tax_calculation', value: false });

    let ordermethod = rec.getValue({ fieldId: 'custbody_sna_order_fulfillment_method' });
    log.audit({ title: 'updateTaxCode', details: 'ordermethod: ' + ordermethod });

    if (ordermethod == willcall) {
      finaltaxcode = avataxpos;
    } else if (ordermethod == ship) {
      finaltaxcode = avatax;
    }

    if (!isEmpty(finaltaxcode)) {
      log.audit({ title: 'updateTaxCode | finaltaxcode', details: 'setting shipping tax code: ' + finaltaxcode });

      rec.setValue({ fieldId: 'custbody_sna_tax_processed', value: true });
      rec.setValue({ fieldId: 'shippingtaxcode', value: finaltaxcode });
    }

    if (!isEmpty(finaltaxcode) || internal) {
      let itmlines = rec.getLineCount({ sublistId: 'item' });
      for (let j = 0; j < itmlines; j++) {
        if (!isEmpty(finaltaxcode) && !internal) {
          rec.setSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: finaltaxcode, line: j });
          log.audit({
            title: 'beforeSubmit | setting line tax code',
            details: 'line = ' + j + ' | finaltaxcode = ' + finaltaxcode,
          });
        } else if (internal && runtime.executionContext === runtime.ContextType.MAP_REDUCE) {
          rec.setSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: NOT_TAXABLE, line: j });
          rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_ava_taxamount', value: 0, line: j });
          log.audit({ title: 'beforeSubmit | internal tax', details: 'setting line ' + j + ' to internal' });
        }
      }

      if (internal && runtime.executionContext === runtime.ContextType.MAP_REDUCE) {
        rec.setValue({ fieldId: 'taxamountoverride', value: 0 });
        rec.setValue({ fieldId: 'custbody_ava_disable_tax_calculation', value: true });
      }

      if (internal) {
        rec.setValue({ fieldId: 'custbody_ava_disable_tax_calculation', value: true });
      }
      let idso = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
      log.debug({ title: 'afterSubmit', details: 'SO tax code updated: ' + idso });
    }
  }

  /**
   * Obtains existing equipment record by using the asset object id and filtering by asset type
   * @param {string|number} assetType
   * @param {string|number} assetObject
   * @returns {string}
   */
  function getExistingEquipment(assetType, assetObject) {
    const searchObj = search.create({
      type: 'customrecord_nx_asset',
      filters: [
        search.createFilter({ name: 'custrecord_nxc_na_asset_type', operator: search.Operator.IS, values: assetType }),
        search.createFilter({ name: 'isinactive', operator: search.Operator.IS, values: 'F' }),
        search.createFilter({
          name: 'custrecord_sna_hul_nxcassetobject',
          operator: search.Operator.ANYOF,
          values: assetObject,
        }),
      ],
      columns: [search.createColumn({ name: 'internalid' })],
    });
    const results = searchObj.run().getRange({ start: 0, end: 1 }); // assumed 1 result only

    let existingEquipmentId = '';
    if (!isEmpty(results)) {
      existingEquipmentId = results[0].getValue({ name: 'internalid' });
      log.debug({ title: 'EXISTING_EQUIPMENT_ID', details: { existingEquipmentId } });
    }

    return existingEquipmentId;
  }

  /**
   * Creates a Next Service Equipment Asset Record
   * This returns the existing asset record if there is an existing match by using Asset Object field.
   * @param objRecordData
   * @returns {*|string}
   */
  function createEquipmentRecord(objRecordData) {
    const existingEquipmentAssetId = getExistingEquipment(objRecordData.assetType, objRecordData.assetObject);
    log.audit('EXISTING_EQUIPMENT_ASSET_ID', existingEquipmentAssetId);
    if (!isEmpty(existingEquipmentAssetId)) {
      record.submitFields({
        type: 'customrecord_nx_asset',
        id: existingEquipmentAssetId,
        values: { parent: objRecordData.parent, custrecord_nx_asset_customer: objRecordData.customer },
        options: {
          ignoreMandatoryFields: true,
        },
      });
      log.audit({
        title: 'UPDATED_EXISTING_EQUIPMENT_ASSET',
        details: {
          existingEquipmentAssetId,
          values: { parent: objRecordData.parent, custrecord_nx_asset_customer: objRecordData.customer },
        },
      });
      return existingEquipmentAssetId;
    }

    const newEquipmentAsset = record.create({ type: 'customrecord_nx_asset', isDynamic: true });
    const fieldValues = {
      customform: objRecordData.formId,
      name: objRecordData.name,
      custrecord_nxc_na_asset_type: objRecordData.assetType,
      parent: objRecordData.parent,
      custrecord_nx_asset_customer: objRecordData.customer,
      custrecord_nx_asset_address_text: objRecordData.addressText,
      custrecord_sna_hul_nxcassetobject: objRecordData.assetObject,
    };

    for (let [fieldId, value] of Object.entries(fieldValues)) {
      try {
        newEquipmentAsset.setValue({ fieldId, value });
      } catch (err) {
        log.error({
          title: 'ERROR_SETTING_NEW_EQ_ASSET_FIELD_VALUE',
          details: { fieldId, value, message: err.message },
        });
      }
    }

    let assetName = '';
    const segm = newEquipmentAsset.getText({ fieldId: 'cseg_sna_hul_eq_seg' });
    const mfg = newEquipmentAsset.getText({ fieldId: 'cseg_hul_mfg' });
    const model = newEquipmentAsset.getText({ fieldId: 'custrecord_sna_hul_nxc_object_model' });
    const serial = newEquipmentAsset.getValue({ fieldId: 'custrecord_nx_asset_serial' });
    const fleetcode = newEquipmentAsset.getValue({ fieldId: 'custrecord_sna_hul_fleetcode' });
    log.audit({ title: 'NEW_EQUIPMENT_ASSET_NAME_PARTS', details: { segm, mfg, model, serial, fleetcode } });

    if (!isEmpty(segm)) assetName += segm + ' ';
    if (!isEmpty(mfg)) assetName += mfg + ' ';
    if (!isEmpty(model)) assetName += model + ' ';
    if (!isEmpty(serial)) assetName += serial + ' ';
    if (!isEmpty(fleetcode)) assetName += fleetcode;
    log.audit({ title: 'NEW_EQUPMENT_ASSET_NAME', details: { assetName } });
    newEquipmentAsset.setValue({ fieldId: 'name', value: assetName });

    const newEquipmentAssetId = newEquipmentAsset.save({ enableSourcing: false, ignoreMandatoryFields: true });

    log.audit({ title: 'CREATED_EQUIPMENT_ASSET', details: { newEquipmentAssetId } });
    return newEquipmentAssetId;
  }

  /**
   * Creates a new NextService Site Asset Record
   * @param {object} objRecordData
   * @param {number} objRecordData.formId
   * @param {string} objRecordData.shipAddress
   * @param {number} objRecordData.assetType
   * @param {number} objRecordData.customer
   * @param {string} objRecordData.addressText
   * @param {string} objRecordData.shipZip
   * @returns {string|number}
   */
  function createSiteRecord(objRecordData) {
    const region = getZipRegion(objRecordData.shipZip);
    const newSiteAsset = record.create({ type: 'customrecord_nx_asset', isDynamic: true });
    const fieldValues = {
      customform: objRecordData.formId,
      name: objRecordData.shipAddress,
      custrecord_nxc_na_asset_type: objRecordData.assetType,
      custrecord_nx_asset_customer: objRecordData.customer,
      custrecord_nx_asset_address_text: objRecordData.addressText,
      custrecord_nx_asset_region: region,
    };

    for (let [fieldId, value] of Object.entries(fieldValues)) {
      try {
        newSiteAsset.setValue({ fieldId, value });
      } catch (err) {
        log.error({
          title: 'ERROR_SETTING_FLDVALUE_NEW_SITE_ASSET',
          details: { fieldId, value, message: err.message },
        });
      }
    }

    const newSiteAssetId = newSiteAsset.save({ enableSourcing: false, ignoreMandatoryFields: true });
    log.audit({ title: 'NEW_SITE_ASSET_RECORD_CREATED', details: { newSiteAssetId } });
    return newSiteAssetId;
  }

  /**
   * Runs a search using customrecord_sna_sales_zone to pull records with matching zipcode.
   * @param {string} shipzip - the zip code to use for filtering
   * @returns {string}
   */
  function getZipRegion(shipzip = '') {
    log.debug({ title: 'getZipRegion', details: 'shipzip: ' + shipzip });
    if (isEmpty(shipzip)) return '';
    let region = '';

    const searchObj = search.create({
      type: 'customrecord_sna_sales_zone',
      filters: [
        search.createFilter({ name: 'custrecord_sna_st_zip_code', operator: search.Operator.IS, values: shipzip }),
      ],
      columns: [search.createColumn({ name: 'custrecord_sna_hul_nxc_region' })],
    });

    searchObj.run().each((result) => {
      region = result.getValue({ name: 'custrecord_sna_hul_nxc_region' });

      return false; // get 1st
    });

    log.debug({ title: 'getZipRegion', details: 'region: ' + region });

    return region;
  }

  /**
   * Searches for the specified address
   * @param soId
   * @returns {{shipAttention: string, shipAddressee: string, shipAddress1: string, shipAddress2: string, shipAddress3: string}}
   */
  function getAddress(soId) {
    const lookupValues = search.lookupFields({
      type: search.Type.TRANSACTION,
      id: soId,
      columns: [
        'shippingaddress.custrecordsn_nxc_site_asset',
        'shippingaddress.addressee',
        'shipaddress1',
        'shipaddress2',
        'shipaddress3',
        'shippingaddress.attention',
      ],
    });
    const {
      'shippingaddress.custrecordsn_nxc_site_asset': nxcSiteAsset,
      'shippingaddress.addressee': shipAddressee,
      'shippingaddress.attention': shipAttention,
      shipaddress1: shipAddress1,
      shipaddress2: shipAddress2,
      shipaddress3: shipAddress3,
    } = lookupValues;

    return { nxcSiteAsset, shipAttention, shipAddressee, shipAddress1, shipAddress2, shipAddress3 };
  }

  /**
   * Searches for existing asset record where the address texts are an exact match
   * @param {number} customer - customer/entity record internal id
   * @param {number} assetType - asset type internal id
   * @param {string} shipAddress - asset address
   * @param assetObjectId
   * @returns {{addressText: string, id: string}}
   */
  function searchAssetRecord(customer, assetType, shipAddress, assetObjectId) {
    const filters = [
      search.createFilter({ name: 'custrecord_nx_asset_customer', operator: search.Operator.ANYOF, values: customer }),
      search.createFilter({ name: 'custrecord_nxc_na_asset_type', operator: search.Operator.ANYOF, values: assetType }),
      search.createFilter({ name: 'isinactive', operator: search.Operator.IS, values: false }),
    ];
    if (assetType == NextServiceAssetType.EQUIPMENT) {
      filters.push(
        search.createFilter({
          name: 'custrecord_sna_hul_nxcassetobject',
          operator: search.Operator.ANYOF,
          values: assetObjectId,
        }),
      );
    }

    let addressText = '';
    let recordId = '';
    const searchObj = search.create({
      type: 'customrecord_nx_asset',
      filters: filters,
      columns: ['custrecord_nx_asset_address_text'],
    });
    let cleanedShipAddr =
      shipAddress
        .trim()
        .replace(/\n/g, ' ')
        .replace(/(\s\s\s*)/g, ' ')
        .trim() || '';
    searchObj.run().each(function (result) {
      // .run().each has a limit of 4,000 results
      let tempAddressText = result.getValue('custrecord_nx_asset_address_text');
      tempAddressText = tempAddressText
        .trim()
        .replace(/\n/g, ' ')
        .replace(/(\s\s\s*)/g, ' ')
        .trim();

      log.audit({
        title: 'ADDR_STRING_COMPARISON',
        details: {
          cleanedShipAddr,
          tempAddressText,
          evaluation: cleanedShipAddr.toLowerCase() === tempAddressText.toLowerCase(),
          localeEval: tempAddressText.toLowerCase().localeCompare(cleanedShipAddr.toLowerCase()),
        },
      });

      if (tempAddressText.toLowerCase() === cleanedShipAddr.toLowerCase()) {
        addressText = tempAddressText;
        recordId = result.id;

        return false; // get first
      }

      return true;
    });

    log.audit('searchAssetRecord return = ', { addressText: addressText, id: recordId });
    return { addressText: addressText, id: recordId };
  }

  /**
   * Checks if the JSON string passed has the propery "Configured" set to true. this returns false by default
   * @param objectToCheck
   * @returns {boolean}
   */
  function checkIfConfigured(objectToCheck) {
    let flag = true;
    for (let i = 0; i < objectToCheck.length; i++) {
      let configured = objectToCheck[i].CONFIGURED;
      if (configured == 'F') {
        flag = false;
        break;
      }
    }

    return flag;
  }

  function isEmpty(stValue) {
    return (
      stValue === '' ||
      stValue == null ||
      stValue == undefined ||
      (stValue.constructor === Array && stValue.length == 0) ||
      (stValue.constructor === Object &&
        (function (v) {
          for (let k in v) return false;
          return true;
        })(stValue))
    );
  }

  return { afterSubmit };
});

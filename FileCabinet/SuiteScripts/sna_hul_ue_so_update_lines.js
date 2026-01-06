/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Update Segment Equipment Posting/Category/Group and HUL Manufacturer based on NextService Asset Record Segment Fields
 *
 * Revision History:
 *
 * Date			            Issue/Case		    Author			    Issue Fix Summary
 * =======================================================================================================
 * 2023/01/24						            caranda           	Initial version
 * 2023/02/20                                   caranda             Updated sourcing of fields
 * 2023/03/01                                   caranda             Added MR function
 * 2023/03/06                                   caranda             Added setting of Revenue Stream (main)
 * 2023/03/07                                   caranda             Included Estimate record
 * 2023/03/13                                   caranda             Updated _getResourcePriceTable filter
 * 2023/03/14                                   caranda             Added UsedQty and discounts
 * 2023/03/23                                   caranda             Get Customer Pricing Group-Service from Ship To Address
 * 2023/04/24                                   caranda             Updated Actual vs. Quoted Qty
 * 2023/05/23                                   caranda             Added level in _getResourcePriceTable filter
 * 2023/06/26                                   aduldulao           Do not allow quantity update if related time is posted
 * 2023/07/17                                   caranda             Remove responsibility center
 * 2023/07/19                                   caranda             Allow Rate update if 0
 * 2023/08/18                                   caranda             Added Override Rate condition in Service Pricing
 * 2023/08/18                                   caranda             Modified finalQty
 * 2023/9/1                                     caranda             Fixed finalQty condition
 * 2023/9/7                                     aduldulao           Exclude None to prevent "Wrong parameter type: id is expected as integer." error
 * 2023/9/20                                    caranda             Service Pricing equipCat update
 * 2023/10/18                                   caranda             Removed Object sourcing for Estimate
 * 2023/12/13                                   aduldulao           Maintenance [not yet deployed to Prod]
 * 2024/01/03                                   caranda             Allow setting Lock Rate in all context
 * 2024/04/02                                   caranda             Included UE context to retain Revenue Stream
 * 2024/05/23                                   aduldulao           Add default_equipCat
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record', 'N/runtime', './sna_hul_ue_pm_pricing_matrix'], (search, record, runtime, pm_lib) => {
  /**
   * Defines the function definition that is executed before record is loaded.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @param {Form} scriptContext.form - Current form
   * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
   * @since 2015.2
   */
  const beforeLoad = (scriptContext) => {
    var TITLE = 'beforeLoad';

    log.debug(TITLE, '*** START ***');
    log.debug(TITLE, 'scriptContext.type = ' + scriptContext.type);
    log.debug(TITLE, 'runtime.executionContext = ' + runtime.executionContext);

    if (runtime.executionContext == 'userinterface') {
      log.debug(TITLE, 'Not User Interface | EXIT');
      return;
    }

    if (scriptContext.type !== scriptContext.UserEventType.CREATE) {
      log.debug(TITLE, 'Not on Create | EXIT');
      return;
    }

    var newRecord = scriptContext.newRecord;

    if (newRecord.type != 'salesorder') {
      log.debug(TITLE, 'Not SO | EXIT');
      return;
    }

    var createdFrom = newRecord.getValue({ fieldId: 'createdfrom' });
    log.debug(TITLE, 'createdFrom = ' + createdFrom);

    if (!isEmpty(createdFrom)) {
      var lineCount = newRecord.getLineCount({ sublistId: 'item' });
      for (var i = 0; i < lineCount; i++) {
        var itemQty = newRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
        log.debug(TITLE, 'line = ' + i + ' | itemQty = ' + itemQty);

        newRecord.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_quoted_qty', line: i, value: itemQty });
      }
    }
  };

  /**
   * Defines the function definition that is executed before record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const beforeSubmit = (scriptContext) => {
    pm_lib.pmPricingBeforeSubmit(scriptContext);
  };

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const afterSubmit = (scriptContext) => {
    var TITLE = 'afterSubmit';

    log.debug(TITLE, '*** START ***');
    log.debug(TITLE, 'scriptContext.type = ' + scriptContext.type);
    log.debug(TITLE, 'runtime.executionContext = ' + runtime.executionContext);

    var scriptObj = runtime.getCurrentScript();

    if (
      scriptContext.type == scriptContext.UserEventType.CREATE ||
      scriptContext.type == scriptContext.UserEventType.EDIT ||
      scriptContext.type == 'xedit'
    ) {
      var newRecord = scriptContext.newRecord;
      var newRecordType = newRecord.type;
      const customForm = newRecord.getValue({ fieldId: 'customform' });
      const CUSTOM_FORMS = {
        RENTAL_ORDER: 121,
        EQUIPMENT_ORDER: 131,
      };

      var nextServiceAsset = newRecord.getValue({
        fieldId: 'custbody_nx_asset',
      });
      var nextServiceCase = newRecord.getValue({
        fieldId: 'custbody_nx_case',
      });

      /*var orderZipCode = newRecord.getValue({
                                    fieldId: 'shipzip'
                            });*/

      var shippingAddress = newRecord.getSubrecord({
        fieldId: 'shippingaddress',
      });

      var cpgService = shippingAddress.getValue({
        fieldId: 'custrecord_sna_cpg_service',
      });

      var soRevenueStream = newRecord.getValue({
        fieldId: 'cseg_sna_revenue_st',
      });

      var equipObject = newRecord.getValue({
        fieldId: 'custbody_sna_equipment_object',
      });

      var updateRevStreamCB = newRecord.getValue({
        fieldId: 'custbody_sna_hul_update_rev_stream',
      });

      log.debug({
        title: TITLE,
        details: { nextServiceAsset, nextServiceCase, soRevenueStream, equipObject, cpgService, updateRevStreamCB },
      });

      /*if ((isEmpty(nextServiceCase) || isEmpty(nextServiceAsset)) && newRecordType == 'salesorder') {
                                    log.debug(TITLE, 'nextServiceCase or nextServiceAsset is empty for SO | Exit Script');
                                    return;
                            }*/

      if (isEmpty(equipObject) && newRecordType == 'estimate') {
        log.debug(TITLE, 'equipObject is empty for Estimate | Exit Script');
        return;
      }

      try {
        var mfgId;
        //var resCenter;
        var fleetNo;
        var equipCat;

        if (newRecordType == 'salesorder') {
          //Asset Type = 1 (Site), 2 (Equipment)
          //Asset Object Search - Main

          if (!isEmpty(nextServiceAsset) && !isEmpty(nextServiceCase)) {
            var nxAssetSearch = search.lookupFields({
              type: 'customrecord_nx_asset',
              id: nextServiceAsset,
              columns: [
                'custrecord_sna_hul_nxcassetobject.cseg_hul_mfg',
                'custrecord_sna_hul_nxcassetobject.custrecord_sna_responsibility_center',
                'custrecord_nxc_na_asset_type',
                'custrecord_sna_hul_nxcassetobject',
                'cseg_sna_hul_eq_seg',
              ],
            });

            var mainAsset_mfgId = !isEmpty(nxAssetSearch['custrecord_sna_hul_nxcassetobject.cseg_hul_mfg'])
              ? nxAssetSearch['custrecord_sna_hul_nxcassetobject.cseg_hul_mfg'][0].value
              : '';
            //var mainAsset_resCenter = (!isEmpty(nxAssetSearch["custrecord_sna_hul_nxcassetobject.custrecord_sna_responsibility_center"]) ? nxAssetSearch["custrecord_sna_hul_nxcassetobject.custrecord_sna_responsibility_center"][0].value : '');
            var mainAsset_type = !isEmpty(nxAssetSearch.custrecord_nxc_na_asset_type)
              ? nxAssetSearch.custrecord_nxc_na_asset_type[0].value
              : '';
            var mainAsset_fleet = !isEmpty(nxAssetSearch.custrecord_sna_hul_nxcassetobject)
              ? nxAssetSearch.custrecord_sna_hul_nxcassetobject[0].value
              : '';
            var mainAsset_equipCat = !isEmpty(nxAssetSearch.cseg_sna_hul_eq_seg)
              ? nxAssetSearch.cseg_sna_hul_eq_seg[0].value
              : '';

            log.debug(TITLE, 'mainAsset_mfgId = ' + mainAsset_mfgId);
            //log.debug(TITLE, 'mainAsset_resCenter = ' + mainAsset_resCenter);
            log.debug(TITLE, 'mainAsset_type = ' + mainAsset_type);
            log.debug(TITLE, 'mainAsset_fleet = ' + mainAsset_fleet);
            log.debug(TITLE, 'mainAsset_equipCat = ' + mainAsset_equipCat);

            //NX Case Search
            var nxCaseSearch = search.lookupFields({
              type: 'supportcase',
              id: nextServiceCase,
              columns: ['cseg_sna_revenue_st', 'custevent_nxc_case_assets'],
            });

            var nxRevenueSeg = !isEmpty(nxCaseSearch.cseg_sna_revenue_st)
              ? nxCaseSearch.cseg_sna_revenue_st[0].value
              : '';
            var nxCaseAsset = !isEmpty(nxCaseSearch.custevent_nxc_case_assets)
              ? nxCaseSearch.custevent_nxc_case_assets[0].value
              : '';

            log.debug(TITLE, 'nxRevenueSeg = ' + nxRevenueSeg);
            log.debug(TITLE, 'nxCaseAsset = ' + nxCaseAsset);

            //Case > Asset Search

            if (!isEmpty(nxCaseAsset)) {
              var nxAssetSearchCase = search.lookupFields({
                type: 'customrecord_nx_asset',
                id: nxCaseAsset,
                columns: [
                  'custrecord_sna_hul_nxcassetobject.cseg_hul_mfg',
                  'custrecord_sna_hul_nxcassetobject.custrecord_sna_responsibility_center',
                  'custrecord_sna_hul_nxcassetobject',
                  'cseg_sna_hul_eq_seg',
                ],
              });

              var caseAsset_mfgId = !isEmpty(nxAssetSearchCase['custrecord_sna_hul_nxcassetobject.cseg_hul_mfg'])
                ? nxAssetSearchCase['custrecord_sna_hul_nxcassetobject.cseg_hul_mfg'][0].value
                : '';
              //var caseAsset_resCenter = (!isEmpty(nxAssetSearchCase["custrecord_sna_hul_nxcassetobject.custrecord_sna_responsibility_center"]) ? nxAssetSearchCase["custrecord_sna_hul_nxcassetobject.custrecord_sna_responsibility_center"][0].value : '');
              var caseAsset_fleet = !isEmpty(nxAssetSearchCase.custrecord_sna_hul_nxcassetobject)
                ? nxAssetSearchCase.custrecord_sna_hul_nxcassetobject[0].value
                : '';
              var caseAsset_equipCat = !isEmpty(nxAssetSearchCase.cseg_sna_hul_eq_seg)
                ? nxAssetSearchCase.cseg_sna_hul_eq_seg[0].value
                : '';

              log.debug('stLoggerTitle', 'caseAsset_mfgId = ' + caseAsset_mfgId);
              //log.debug('stLoggerTitle', 'caseAsset_resCenter = ' + caseAsset_resCenter);
              log.debug('stLoggerTitle', 'caseAsset_fleet = ' + caseAsset_fleet);
              log.debug('stLoggerTitle', 'caseAsset_equipCat = ' + caseAsset_equipCat);
            }

            if (mainAsset_type == 1) {
              //Site
              mfgId = caseAsset_mfgId;
              //resCenter = caseAsset_resCenter;
              fleetNo = caseAsset_fleet;
              equipCat = caseAsset_equipCat;
            } else if (mainAsset_type == 2) {
              //Equipment
              mfgId = mainAsset_mfgId;
              //resCenter = mainAsset_resCenter;
              fleetNo = mainAsset_fleet;
              equipCat = mainAsset_equipCat;
            }
          }
        } /*else if (newRecordType == 'estimate') {
                                            var equipObjectSrch = search.lookupFields({
                                                    type: 'customrecord_sna_objects',
                                                    id: equipObject,
                                                    columns: ['cseg_hul_mfg', 'custrecord_sna_responsibility_center', 'cseg_sna_hul_eq_seg']
                                            });

                                            mfgId = (!isEmpty(equipObjectSrch.cseg_hul_mfg) ? equipObjectSrch.cseg_hul_mfg[0].value : '');
                                            //resCenter = (!isEmpty(equipObjectSrch.custrecord_sna_responsibility_center) ? equipObjectSrch.custrecord_sna_responsibility_center[0].value : '');
                                            fleetNo = equipObject;
                                            equipCat = (!isEmpty(equipObjectSrch.cseg_sna_hul_eq_seg) ? equipObjectSrch.cseg_sna_hul_eq_seg[0].value : '');
                                    }*/

        log.debug(TITLE, 'FINAL mfgId = ' + mfgId);
        //log.debug(TITLE, 'FINAL resCenter = ' + resCenter);
        log.debug(TITLE, 'FINAL fleetNo = ' + fleetNo);
        log.debug(TITLE, 'FINAL equipCat = ' + equipCat);

        //Get Responsibility Code
        /*var locSearch = search.lookupFields({
                                            type: 'location',
                                            id: resCenter,
                                            columns: 'custrecord_sna_hul_res_cntr_code'
                                    });

                                    var resCenterCode = locSearch.custrecord_sna_hul_res_cntr_code;
                                    log.debug(TITLE, 'FINAL resCenterCode = ' + resCenterCode);*/

        //Revenue Steam (main)
        var mainRevenueStream = soRevenueStream;
        if (isEmpty(soRevenueStream) && newRecordType == 'salesorder') {
          mainRevenueStream = nxRevenueSeg;
          // aduldulao 8/29/23 - moved after load record
          /*newRecord.setValue({
                                                    fieldId: 'cseg_sna_revenue_st',
                                                    value: nxRevenueSeg
                                            });*/
          log.debug(TITLE, 'FINAL mainRevenueStream = ' + mainRevenueStream);
        } else {
          nxRevenueSeg = newRecord.getValue({
            fieldId: 'cseg_sna_revenue_st',
          });
        }

        var pricingGroup = cpgService; //_getCustomerPricingGroup(orderZipCode);
        //var unitPrice = _getResourcePriceTable(pricingGroup, nxRevenueSeg, resCenterCode, equipCat)

        log.debug(TITLE, 'FINAL pricingGroup = ' + pricingGroup);
        //log.debug(TITLE, 'FINAL unitPrice = ' + unitPrice);

        var tranRec = record.load({
          type: newRecordType,
          id: newRecord.id,
        });

        log.audit(TITLE, '*** START LOAD SO : ' + newRecord.id);

        var revStreamAfterLoad = tranRec.getValue({
          fieldId: 'cseg_sna_revenue_st',
        });

        log.audit(TITLE, 'AFTER SO LOAD cseg_sna_revenue_st body field = ' + revStreamAfterLoad);

        if (
          runtime.executionContext == 'mapreduce' ||
          runtime.executionContext == 'MAPREDUCE' ||
          runtime.executionContext == runtime.ContextType.MAP_REDUCE ||
          runtime.executionContext == runtime.ContextType.MAPREDUCE ||
          runtime.executionContext == runtime.ContextType.USEREVENT ||
          runtime.executionContext == 'userevent'
        ) {
          log.audit(TITLE, 'Context FROM = ' + runtime.executionContext);
          nxRevenueSeg = revStreamAfterLoad;
        }
        // aduldulao 8/29/23 - moved here
        if (isEmpty(soRevenueStream) && newRecordType == 'salesorder') {
          log.audit(TITLE, 'SET cseg_sna_revenue_st body field = ' + nxRevenueSeg);
          tranRec.setValue({
            fieldId: 'cseg_sna_revenue_st',
            value: nxRevenueSeg,
          });
        }

        let lineCnt = tranRec.getLineCount({
          sublistId: 'item',
        });

        var default_equipCat = equipCat;

        for (let i = 0; i < lineCnt; i++) {
          log.debug(TITLE, 'line = ' + i);

          equipCat = default_equipCat; // reset equipment category per loop

          //if(newRecordType == 'salesorder'){

          /*var lineRevenueSeg = newRecord.getSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'cseg_sna_revenue_st',
                                                    line: i
                                            });*/

          var lineRevenueSeg;

          if (
            runtime.executionContext == runtime.ContextType.SUITELET ||
            runtime.executionContext == runtime.ContextType.SCHEDULED ||
            runtime.executionContext == runtime.ContextType.MAPREDUCE ||
            updateRevStreamCB
          ) {
            lineRevenueSeg = nxRevenueSeg;
            tranRec.setSublistValue({
              sublistId: 'item',
              fieldId: 'cseg_sna_revenue_st',
              value: nxRevenueSeg,
              line: i,
            }); //Revenue Stream line from NXS

            log.audit('TITLE', 'Line [' + i + '] | Set cseg_sna_revenue_st = ' + nxRevenueSeg);
          } else {
            lineRevenueSeg = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'cseg_sna_revenue_st',
              line: i,
            });

            /*//If Revenue Stream is empty - Get the Revenue Stream from the NXC Case Record
                                                    if(isEmpty(lineRevenueSeg)){
                                                            lineRevenueSeg = mainRevenueStream
                                                    }*/
          }

          log.debug(TITLE, 'line [' + i + '] lineRevenueSeg = ' + lineRevenueSeg);

          if (isEmpty(equipCat)) {
            equipCat = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'cseg_sna_hul_eq_seg',
              line: i,
            });
          }

          //var unitPrice = _getResourcePriceTable(pricingGroup, lineRevenueSeg, resCenterCode, equipCat);

          log.debug(TITLE, 'line [' + i + '] AD equipCat = ' + equipCat);
          /*if(!isEmpty(equipCat)){
                                                    tranRec.setSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'cseg_sna_hul_eq_seg',
                                                            value: equipCat,
                                                            line: i
                                                    });
                                            }*/

          //Actual VS Qouted Qty (new custom field)
          var finalQty;

          var actualQty = tranRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_hul_act_service_hours',
            line: i,
          });

          var itemQty = tranRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            line: i,
          });

          var qtyExcep = tranRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_used_qty_exc',
            line: i,
          });

          var quotedQty = tranRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_quoted_qty',
            line: i,
          });

          var timeposted = tranRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_time_posted',
            line: i,
          });

          var overrideRate = tranRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_amt_manual',
            line: i,
          });

          log.debug(TITLE, 'itemQty = ' + itemQty);
          log.debug(TITLE, 'actualQty = ' + actualQty);
          log.debug(TITLE, 'quotedQty = ' + quotedQty);
          log.debug(TITLE, 'qtyExcep = ' + qtyExcep);
          log.debug(TITLE, 'timeposted = ' + timeposted);
          log.debug(TITLE, 'overrideRate = ' + overrideRate);

          /*if(!isEmpty(qtyExcep)){
                                                    finalQty = usedQty > itemQty ? usedQty : itemQty;
                                            }else{
                                                    finalQty = itemQty;
                                            }*/

          if (!isEmpty(actualQty)) {
            if (!isEmpty(quotedQty)) {
              if (quotedQty > actualQty) {
                finalQty = quotedQty;
              } else if (actualQty >= quotedQty) {
                //Actual > Quoted
                if (isEmpty(qtyExcep)) {
                  finalQty = actualQty;
                } else {
                  finalQty = itemQty;
                }
              }
            } else {
              if (isEmpty(qtyExcep)) {
                finalQty = actualQty;
              } else {
                finalQty = itemQty;
              }
            }
          } else {
            finalQty = itemQty;
          }

          //}

          /*newRecord.setSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'custcol_sna_resource_res_center',
                                                    value: resCenter,
                                                    line: i
                                            });*/

          if (!isEmpty(mfgId)) {
            tranRec.setSublistValue({
              sublistId: 'item',
              fieldId: 'cseg_hul_mfg',
              value: mfgId,
              line: i,
            });
          }

          if (!isEmpty(fleetNo) && ![CUSTOM_FORMS.RENTAL_ORDER, CUSTOM_FORMS.EQUIPMENT_ORDER].includes(customForm)) {
            tranRec.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_fleet_no',
              value: fleetNo,
              line: i,
            });
          }

          /*newRecord.setSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'custcol_sna_hul_code_rescenter',
                                                    value: resCenterCode,
                                                    line: i
                                            });*/

          var serviceCodeTypeLine = tranRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_service_itemcode',
            line: i,
          });
          log.debug(TITLE, 'line ' + i + ' | serviceCodeTypeLine = ' + serviceCodeTypeLine);

          log.debug(TITLE, 'finalQty = ' + finalQty);

          if (serviceCodeTypeLine == 2) {
            //Get Parent EquipPosting
            if (!isEmpty(equipCat)) {
              var eqPostingSrch = search.lookupFields({
                type: 'customrecord_cseg_sna_hul_eq_seg',
                id: equipCat,
                columns: ['parent'],
              });

              equipCat = !isEmpty(eqPostingSrch.parent) ? eqPostingSrch.parent[0].value : equipCat;
              log.debug(TITLE, 'line [' + i + '] FROM PARENT SEARCH | equipCat = ' + equipCat);
            }

            var unitPrice = _getResourcePriceTable(pricingGroup, lineRevenueSeg, equipCat);
            log.debug(TITLE, 'line [' + i + '] unitPrice = ' + unitPrice);

            var isLockRate = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_lock_rate',
              line: i,
            });

            /*//[01.09.2024 - caranda] - band-aid fix
                                                    if((scriptContext.type == scriptContext.UserEventType.CREATE && (runtime.executionContext ==
                                            runtime.ContextType.SUITELET || runtime.executionContext == runtime.ContextType.SCHEDULED || runtime.executionContext ==
                                            runtime.ContextType.CSV_IMPORT)) || (scriptContext.type == scriptContext.UserEventType.EDIT && updateRevStreamCB) || (scriptContext.type == scriptContext.UserEventType.EDIT && runtime.executionContext == runtime.ContextType.SCHEDULED || runtime.executionContext ==
                                            runtime.ContextType.SUITELET)){
                                                        log.audit(TITLE, 'MODIFIED line = ' + i + ' | isLockRate = ' + isLockRate);
                                                        isLockRate = false;
                                                    }//END*/

            log.debug(TITLE, 'line = ' + i + ' | isLockRate = ' + isLockRate);

            //Dollar/Percent Discount per line - Service Labor
            var finalPrice = unitPrice;
            var dollarDisc = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_dollar_disc',
              line: i,
            });

            var percDisc = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_perc_disc',
              line: i,
            });

            finalPrice = unitPrice - forceFloat(dollarDisc) - unitPrice * forceFloat(percDisc / 100);

            log.debug(TITLE, 'line = ' + i + ' | finalPrice = ' + finalPrice);

            var currentRate = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'rate',
              line: i,
            });

            log.debug(TITLE, 'line = ' + i + ' | currentRate = ' + currentRate);

            //2 - Resource | Set Unit Price
            if (!isLockRate || updateRevStreamCB || isEmpty(currentRate) || currentRate <= 0) {
              tranRec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_cpg_resource',
                value: pricingGroup,
                line: i,
              });

              if (!overrideRate && !isLockRate) {
                tranRec.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_hul_newunitcost',
                  value: finalPrice,
                  line: i,
                });

                //Proceed if Override Rate = F or null
                //Rate
                tranRec.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'rate',
                  value: finalPrice,
                  line: i,
                });

                var itemAmount = parseFloat(Number(finalQty) * parseFloat(finalPrice).toFixed(2)).toFixed(2);

                log.debug(TITLE, 'line ' + i + ' | itemAmount = ' + itemAmount);
                tranRec.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'amount',
                  value: itemAmount,
                  line: i,
                });
              } //end if(!overrideRate)
            } //end if(!isLockRate)

            /*if(newRecordType == 'estimate'){
                                                            finalQty = itemQty
                                                            log.debug(TITLE, 'ESTIMATE line '+i+' | finalQty = ' + finalQty);
                                                    }*/

            //if (!timeposted) {
            tranRec.setSublistValue({
              sublistId: 'item',
              fieldId: 'quantity',
              value: finalQty,
              line: i,
            });
            //}

            var finalRate = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'rate',
              line: i,
            });

            var finalEquipCat = tranRec.getSublistValue({
              sublistId: 'item',
              fieldId: 'cseg_sna_hul_eq_seg',
              line: i,
            });

            log.audit(TITLE, 'BEFORE SAVE LINE [' + i + '] | finalRate = ' + finalRate);

            log.audit(TITLE, 'BEFORE SAVE LINE [' + i + '] | finalEquipCat = ' + finalEquipCat);

            //if(scriptContext.type == scriptContext.UserEventType.CREATE){
            tranRec.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_lock_rate',
              value: true,
              line: i,
            });
            //}
          }
        }

        var revStreamBeforeSave = tranRec.getValue({
          fieldId: 'cseg_sna_revenue_st',
        });
        log.audit(TITLE, 'BEFORE SAVE | revStreamBeforeSave = ' + revStreamBeforeSave);
        tranRec.setValue({ fieldId: 'custbody_sna_hul_update_rev_stream', value: false });
        var soIdSaved = tranRec.save();

        log.audit(TITLE, '*** END LOAD SO : ' + soIdSaved);

        pm_lib.pmPricingAfterSubmit(scriptContext);
      } catch (error) {
        log.error({
          title: 'Error in saving Transaction ' + newRecordType + ' | ID: ' + newRecord.id,
          details: error.message,
        });
      }
    }
  };

  function _getCustomerPricingGroup(zipCode) {
    //Search Sales Zone
    var stLoggerTitle = '_getCustomerPricingGroup';

    var salesZoneSrch = search.create({
      type: 'customrecord_sna_sales_zone',
      filters: [
        {
          name: 'custrecord_sna_st_zip_code',
          operator: 'is',
          values: zipCode,
        },
      ],
      columns: ['custrecord_sna_sz_cpg'],
    });

    var priceGroup;
    salesZoneSrch.run().each(function (result) {
      priceGroup = result.getValue({
        name: 'custrecord_sna_sz_cpg',
      });
    });

    log.debug(stLoggerTitle, 'priceGroup = ' + priceGroup);

    return priceGroup;
  }

  function _getResourcePriceTable(priceGrp, revStream, equipCat) {
    //Get Unit Price
    var stLoggerTitle = '_getResourcePriceTable';

    var currRevStream = revStream || '@NONE@';
    equipCat = equipCat || '@NONE@';
    priceGrp = priceGrp || '@NONE@';

    log.debug(
      stLoggerTitle,
      'first level - priceGrp = ' + priceGrp + '\ncurrRevStream = ' + currRevStream + '\nequipCat = ' + equipCat,
    );

    var resourcePriceSrch = search.create({
      type: 'customrecord_sna_hul_resrcpricetable',
      filters: [
        {
          name: 'custrecord_sna_rpt_cust_price_grp',
          operator: 'anyof',
          values: priceGrp,
        },
        {
          name: 'custrecord_sna_rev_stream',
          operator: 'anyof',
          values: [currRevStream],
        },
        /*{
                                            name: 'custrecord_sna_rpt_resp_center',
                                            operator: 'is',
                                            values: resCenter
                                    },*/
        {
          name: 'custrecord_sna_rpt_manufacturer',
          operator: 'anyof',
          values: [equipCat],
        },
      ],
      columns: ['custrecord_sna_rpt_unit_price'],
    });

    var unitPrice;
    var rpTblId;

    resourcePriceSrch.run().each(function (result) {
      rpTblId = result.id;
      unitPrice = result.getValue({
        name: 'custrecord_sna_rpt_unit_price',
      });
    });

    if (isEmpty(unitPrice)) {
      log.debug(stLoggerTitle, '2nd level - if CPG is null');
      // If CPG is null
      var resourcePriceSrch2 = search.create({
        type: 'customrecord_sna_hul_resrcpricetable',
        filters: [
          {
            name: 'custrecord_sna_rpt_cust_price_grp',
            operator: 'anyof',
            values: ['@NONE@'],
          },
          {
            name: 'custrecord_sna_rev_stream',
            operator: 'anyof',
            values: [currRevStream],
          },
          /*{
                                                    name: 'custrecord_sna_rpt_resp_center',
                                                    operator: 'is',
                                                    values: resCenter
                                            },*/
          {
            name: 'custrecord_sna_rpt_manufacturer',
            operator: 'anyof',
            values: [equipCat],
          },
        ],
        columns: ['custrecord_sna_rpt_unit_price'],
      });

      resourcePriceSrch2.run().each(function (result) {
        rpTblId = result.id;
        unitPrice = result.getValue({
          name: 'custrecord_sna_rpt_unit_price',
        });
      });

      if (isEmpty(unitPrice)) {
        log.debug(stLoggerTitle, '3rd level - Exact CPG, MFG is Null');
        //Exact CPG, MFG is Null
        var resourcePriceSrch3 = search.create({
          type: 'customrecord_sna_hul_resrcpricetable',
          filters: [
            {
              name: 'custrecord_sna_rpt_cust_price_grp',
              operator: 'anyof',
              values: [priceGrp],
            },
            {
              name: 'custrecord_sna_rev_stream',
              operator: 'anyof',
              values: [currRevStream],
            },
            /*{
                                                            name: 'custrecord_sna_rpt_resp_center',
                                                            operator: 'is',
                                                            values: resCenter
                                                    },*/
            {
              name: 'custrecord_sna_rpt_manufacturer',
              operator: 'anyof',
              values: ['@NONE@'],
            },
          ],
          columns: ['custrecord_sna_rpt_unit_price'],
        });

        resourcePriceSrch3.run().each(function (result) {
          rpTblId = result.id;
          unitPrice = result.getValue({
            name: 'custrecord_sna_rpt_unit_price',
          });
        });

        if (isEmpty(unitPrice)) {
          log.debug(stLoggerTitle, '4th level - CPG Null, MPG Null');
          // MFG is null
          var resourcePriceSrch4 = search.create({
            type: 'customrecord_sna_hul_resrcpricetable',
            filters: [
              {
                name: 'custrecord_sna_rpt_cust_price_grp',
                operator: 'anyof',
                values: ['@NONE@'],
              },
              {
                name: 'custrecord_sna_rev_stream',
                operator: 'anyof',
                values: [currRevStream],
              },
              /*{
                                                                    name: 'custrecord_sna_rpt_resp_center',
                                                                    operator: 'is',
                                                                    values: resCenter
                                                            },*/
              {
                name: 'custrecord_sna_rpt_manufacturer',
                operator: 'anyof',
                values: ['@NONE@'],
              },
            ],
            columns: ['custrecord_sna_rpt_unit_price'],
          });

          resourcePriceSrch4.run().each(function (result) {
            rpTblId = result.id;
            unitPrice = result.getValue({
              name: 'custrecord_sna_rpt_unit_price',
            });
          });

          if (isEmpty(unitPrice)) {
            log.debug(stLoggerTitle, '5th level - Get Rev Stream Parent');

            // aduldulao 9/7/23 - exclude None to prevent "Wrong parameter type: id is expected as integer." error
            if (!isEmpty(currRevStream) && currRevStream != '@NONE@') {
              currRevStream = _getRevenueStreamParent(currRevStream);
            }
            //currRevStream = _getRevenueStreamParent(currRevStream) || '';
            if (!isEmpty(currRevStream) && currRevStream != '@NONE@') {
              unitPrice = _getResourcePriceTable(priceGrp, currRevStream, equipCat);

              if (isEmpty(unitPrice)) {
                unitPrice = 0;
              }
            } else {
              unitPrice = 0;
            }
          }
        }
      }
    }

    log.debug(stLoggerTitle, 'rpTblId = ' + rpTblId);
    log.debug(stLoggerTitle, 'unitPrice = ' + unitPrice);
    return unitPrice;
  }

  function _getRevenueStreamParent(revStream) {
    var TITLE = '_getRevenueStreamParent(' + revStream + ')';

    var srch = search.lookupFields({
      type: 'customrecord_cseg_sna_revenue_st',
      id: revStream,
      columns: ['parent'],
    });

    var parentRevSteam = !isEmpty(srch.parent) ? srch.parent[0].value : '';

    log.debug(TITLE, 'parentRevSteam = ' + parentRevSteam);

    return parentRevSteam;
  }

  function forceFloat(stValue) {
    var flValue = parseFloat(stValue);
    if (isNaN(flValue) || stValue == 'Infinity') {
      return 0.0;
    }
    return flValue;
  }

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

  return { beforeLoad, beforeSubmit, afterSubmit };
});

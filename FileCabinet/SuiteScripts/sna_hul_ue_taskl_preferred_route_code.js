/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

/**
* Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author Faye Ang
*
* Script brief description:
* This is a User Event script that updates the related Item Receipt record line item rates if there's any price discrepancy with the Vendor Bill.
*
* Revision History:
*
* Date              Issue/Case         Author               Issue Fix Summary
* =============================================================================================
* 2022/07/22                          Faye Ang          Initial version
*
*
*/
define(["N/record", "N/search", "N/runtime"], function (record, search, runtime) {

  function isEmpty(stValue) {
    return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
      for (var k in v)
        return false;
      return true;
    })(stValue)));
  }

  function beforeSubmit(context) {
    log.debug("beforeSubmit triggered");
    log.debug("context.type", context.type);
    log.debug("runtime.executionContext", runtime.executionContext);

    if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

      var newRecord, newRecordID,
        relatedCase,
        nextServiceAssetJobSiteID, nextServiceAssetEquipment, nextServiceAssetEquipmentID, nextServiceAssetJobSiteInfoLookup, nextServiceAssetEquipmentInfoLookup,
        nextServiceAssetJobSiteAssetType, nextServiceAssetEquipmentAssetType, nextServiceAssetEquipmentPreferredRoute, nextServiceAssetJobSitePreferredRoute;


      newRecord = context.newRecord;
      newRecordID = newRecord.id;

      log.debug("newRecord.id", newRecord.id);

      relatedCase = newRecord.getValue({
        fieldId: 'supportcase'
      });

      if (isEmpty(relatedCase)) return;

      var nextServiceAssetLookup = search.lookupFields({
        type: search.Type.SUPPORT_CASE,
        id: relatedCase,
        columns: ['custevent_nx_case_asset', 'custevent_nxc_case_assets']
      });

      log.debug('nextServiceAssetLookup', nextServiceAssetLookup);

      if (isEmpty(nextServiceAssetLookup.custevent_nx_case_asset) && isEmpty(nextServiceAssetLookup.custevent_nxc_case_assets)) { //both NEXTSERVICE ASSET (JOB SITE) and NEXTSERVICE EQUIPMENT ASSET(S) = empty
        return;
      } else if (isEmpty(nextServiceAssetLookup.custevent_nx_case_asset) && !isEmpty(nextServiceAssetLookup.custevent_nxc_case_assets)) {  //NEXTSERVICE ASSET (JOB SITE) = empty but NEXTSERVICE EQUIPMENT ASSET(S) = !empty
        nextServiceAssetEquipment = nextServiceAssetLookup.custevent_nxc_case_assets;
      } else { //NEXTSERVICE ASSET (JOB SITE) not empty
        nextServiceAssetJobSiteID = nextServiceAssetLookup.custevent_nx_case_asset[0].value;

        if (!isEmpty(nextServiceAssetLookup.custevent_nxc_case_assets)) {
          nextServiceAssetEquipment = nextServiceAssetLookup.custevent_nxc_case_assets;
        }
      }

      log.debug('nextServiceAssetJobSiteID', nextServiceAssetJobSiteID);
      log.debug('nextServiceAssetEquipment', nextServiceAssetEquipment);

      if (!isEmpty(nextServiceAssetJobSiteID)) {
        nextServiceAssetJobSiteInfoLookup = search.lookupFields({
          type: 'customrecord_nx_asset',
          id: nextServiceAssetJobSiteID,
          columns: ['custrecord_nxc_na_asset_type', 'custrecord_sna_preferred_route_code']
        });

        log.debug('nextServiceAssetJobSiteInfoLookup', nextServiceAssetJobSiteInfoLookup);

        nextServiceAssetJobSiteAssetType = nextServiceAssetJobSiteInfoLookup.custrecord_nxc_na_asset_type[0].value;

        log.debug('nextServiceAssetJobSiteAssetType', nextServiceAssetJobSiteAssetType);

        if (nextServiceAssetJobSiteAssetType == 1) { //Job Site Asset Type = Site
          //Get NEXTSERVICE EQUIPMENT ASSET(S) Info

          if (isEmpty(nextServiceAssetEquipment)) return;
          
          log.debug('nextServiceAssetEquipment.length', nextServiceAssetEquipment.length);

          for (var i = 0; i < nextServiceAssetEquipment.length; i++) {
            log.debug('NextService Asset ID', nextServiceAssetEquipment[i].value);

            nextServiceAssetEquipmentInfoLookup = search.lookupFields({
              type: 'customrecord_nx_asset',
              id: nextServiceAssetEquipment[i].value,
              columns: ['custrecord_nxc_na_asset_type', 'custrecord_sna_preferred_route_code']
            });

            log.debug('nextServiceAssetEquipmentInfoLookup', nextServiceAssetEquipmentInfoLookup);

            nextServiceAssetEquipmentAssetType = nextServiceAssetEquipmentInfoLookup.custrecord_nxc_na_asset_type[0].value;

            log.debug('nextServiceAssetEquipmentAssetType', nextServiceAssetEquipmentAssetType);

            //If NEXTSERVICE EQUIPMENT ASSET(S) Asset Type = Equipment
            if (nextServiceAssetEquipmentAssetType == 2) {
              if (!isEmpty(nextServiceAssetEquipmentInfoLookup.custrecord_sna_preferred_route_code)) {
                nextServiceAssetEquipmentPreferredRoute = nextServiceAssetEquipmentInfoLookup.custrecord_sna_preferred_route_code[0].value;

                log.debug('nextServiceAssetEquipmentPreferredRoute', nextServiceAssetEquipmentPreferredRoute);

                newRecord.setValue({
                  fieldId: 'custevent_sna_hul_task_route_code',
                  value: nextServiceAssetEquipmentPreferredRoute
                });

                break;
              }
            }
          }

        } else if (nextServiceAssetJobSiteAssetType == 2) { //Job Site Asset Type = Equipment
          if (!isEmpty(nextServiceAssetJobSiteInfoLookup.custrecord_sna_preferred_route_code)) {
            nextServiceAssetJobSitePreferredRoute = nextServiceAssetJobSiteInfoLookup.custrecord_sna_preferred_route_code[0].value;

            log.debug('nextServiceAssetJobSitePreferredRoute', nextServiceAssetJobSitePreferredRoute);

            newRecord.setValue({
              fieldId: 'custevent_sna_hul_task_route_code',
              value: nextServiceAssetJobSitePreferredRoute
            });
          }
        }
      }
    }


  }

  return {
    beforeSubmit: beforeSubmit
  }
});



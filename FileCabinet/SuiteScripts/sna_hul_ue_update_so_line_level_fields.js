/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @description Updates sales order line-level segment fields base from mainline values
 *
 */
define(['N/record', 'N/runtime', 'N/search'], /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
  (record, runtime, search) => {
  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
    const afterSubmit = (scriptContext) => {
      const LOG_TITLE = 'afterSubmit';

      log.debug({ title: LOG_TITLE, details: '===========START===========' });

      if (scriptContext.type === scriptContext.UserEventType.DELETE) return;

      try {
        let recCurrentSalesOrder = scriptContext.newRecord;
        let stRecordType = recCurrentSalesOrder.type;

        log.debug({ title: LOG_TITLE, details: `stRecordType: ${stRecordType}` });

        let bLocation = false; // recCurrentSalesOrder.getValue({fieldId: 'custbody_sna_hul_apply_nxc_assets_all'});

        // if(stRecordType === 'invoice')
        // bLocation = recCurrentSalesOrder.getValue({fieldId: 'custbody_sna_hul_apply_loc_all'});

        let bDepartment = recCurrentSalesOrder.getValue({ fieldId: 'custbody_sna_hul_apply_dept_all' });
        let bRevStream = recCurrentSalesOrder.getValue({ fieldId: 'custbody_sna_hul_apply_rev_all' });
        let bNxcSiteAsset = recCurrentSalesOrder.getValue({ fieldId: 'custbody_sna_hul_apply_rev_all' }); // To be edited
        let bNxcEquipAsset = recCurrentSalesOrder.getValue({ fieldId: 'custbody_sna_hul_apply_rev_all' }); // To be edited

        log.debug({
          title: LOG_TITLE,
          details: { bLocation, bRevStream, bNxcSiteAsset, bNxcEquipAsset, bDepartment },
        });

        let stLocation = recCurrentSalesOrder.getValue({ fieldId: 'location' });
        let stDepartment = recCurrentSalesOrder.getValue({ fieldId: 'department' });
        let stRevStream = recCurrentSalesOrder.getValue({ fieldId: 'cseg_sna_revenue_st' });
        let stNxcSiteAsset = recCurrentSalesOrder.getValue({ fieldId: 'custbody_nx_asset' });
        let stNxcEquipmentAsset = recCurrentSalesOrder.getValue({ fieldId: 'custbody_sna_hul_nxc_eq_asset' });

        let objValues = {
          location: { stValue: stLocation, isOverride: bLocation },
          // department: { stValue: stDepartment, isOverride: bDepartment },
          cseg_sna_revenue_st: { stValue: stRevStream, isOverride: bRevStream },
          custcol_nx_asset: { stValue: stNxcSiteAsset, isOverride: bNxcSiteAsset },
          custcol_nxc_equip_asset: { stValue: stNxcEquipmentAsset, isOverride: bNxcEquipAsset },
        };

        log.debug({
          title: LOG_TITLE,
          details: `objValues = ${JSON.stringify(objValues)}`,
        });

        let recSalesOrder = record.load({
          type: stRecordType, // search.Type.SALES_ORDER,
          id: recCurrentSalesOrder.id,
        });

        let itemLineCount = recSalesOrder.getLineCount({ sublistId: 'item' });

        let allassignedto = [];
        let assignedtoinfo = {};

        // get assigned to employees
        if (isEmpty(stLocation)) {
          for (let a = 0; a < recSalesOrder.getLineCount({ sublistId: 'item' }); a++) {
            let assignedto = recSalesOrder.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_task_assigned_to',
              line: a,
            });

            if (!isEmpty(assignedto)) {
              allassignedto.push(assignedto);
            }
          }
          log.debug({ title: LOG_TITLE, details: 'allassignedto: ' + JSON.stringify(allassignedto) });

          if (!isEmpty(allassignedto)) {
            let _filters = [];
            _filters.push(
              search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: allassignedto }),
            );

            let _columns = [];
            _columns.push(search.createColumn({ name: 'custentity_nx_location' }));

            let addsrch = search.create({ type: record.Type.EMPLOYEE, columns: _columns, filters: _filters });
            let nxclocation;

            addsrch.run().each(function (result) {
              assignedtoinfo[result.id] = {};
              assignedtoinfo[result.id].custentity_nx_location = result.getValue({ name: 'custentity_nx_location' });

              // assumed to be 1 loc always
              // recSalesOrder.setValue({fieldId: 'location', value: result.getValue({name: 'custentity_nx_location'})});
              nxclocation = result.getValue({ name: 'custentity_nx_location' });

              return true;
            });
            log.debug({ title: LOG_TITLE, details: 'assignedtoinfo: ' + JSON.stringify(assignedtoinfo) });
            log.debug({ title: LOG_TITLE, details: 'nxclocation: ' + nxclocation });

            // assumed to be 1 loc always
            recSalesOrder.setValue({ fieldId: 'location', value: nxclocation });
          }
        }

        log.debug({
          title: LOG_TITLE,
          details: `itemLineCount = ${itemLineCount}`,
        });

        for (let i = 0; i < itemLineCount; i++) {
          let currlineloc = recSalesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'location',
            line: i,
          });
          let currlineassignedto = recSalesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_task_assigned_to',
            line: i,
          });

          for (let stFieldId in objValues) {
            if (
              stFieldId == 'location'
              && isEmpty(stLocation)
              && isEmpty(currlineloc)
              && !isEmpty(assignedtoinfo[currlineassignedto])
            ) {
              objValues[stFieldId].stValue = assignedtoinfo[currlineassignedto].custentity_nx_location; // set new location value
              log.debug({
                title: LOG_TITLE,
                details: 'setting new location: ' + i + ' | ' + assignedtoinfo[currlineassignedto].custentity_nx_location,
              });
            }

            if (!isEmpty(objValues[stFieldId].stValue)) {
              if (objValues[stFieldId].isOverride) {
                recSalesOrder.setSublistValue({
                  sublistId: 'item',
                  fieldId: stFieldId,
                  line: i,
                  value: objValues[stFieldId].stValue,
                });
              }
              else {
                let stLineFieldValue = recSalesOrder.getSublistValue({
                  sublistId: 'item',
                  fieldId: stFieldId,
                  line: i,
                });
                if (isEmpty(stLineFieldValue)) {
                  recSalesOrder.setSublistValue({
                    sublistId: 'item',
                    fieldId: stFieldId,
                    line: i,
                    value: objValues[stFieldId].stValue,
                  });
                }
              }
            }
          }
        }

        recSalesOrder.save();
      }
      catch (err) {
        log.error({ title: LOG_TITLE, details: `error: ${err}` });
      }

      log.debug({ title: LOG_TITLE, details: '===========END===========' });
    };

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

    return { afterSubmit };
  });

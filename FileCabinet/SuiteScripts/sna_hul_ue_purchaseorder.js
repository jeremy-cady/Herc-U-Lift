/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to create inventory adjustment for Used Equipment Item after asset disposal
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/10/9       		                    fang       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime'],
	/**
	 * @param{record} record
	 * @param{search} search
	 */
	(record, search, runtime) => {

		// UTILITY FUNCTIONS
		function isEmpty(stValue) {
			return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
				for ( var k in v)
					return false;
				return true;
			})(stValue)));
		}


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
			try {
				var rec = scriptContext.newRecord;
				var form = scriptContext.form;

				var customForm = rec.getValue({
					fieldId: 'customform'
				});

				log.debug("beforeLoad - customForm", customForm);

				if (customForm == 130) {
					//HUL Equipment Purchase Order - SB: 130

					form.clientScriptModulePath = 'SuiteScripts/SNA/sna_hul_cs_source_vendor_item_name.js';

					form.addButton({
						id: 'custpage_purchase_equipment_btn',
						label: 'Purchase Equipment',
						functionName: 'purchaseEquipmentFxn'
					});

				}
			}
			catch (e) {
				if (e.message != undefined) {
					log.error('ERROR' , e.name + ' ' + e.message);
				} else {
					log.error('ERROR', 'Unexpected Error' , e.toString());
				}
			}
		}

		return {beforeLoad}

	});

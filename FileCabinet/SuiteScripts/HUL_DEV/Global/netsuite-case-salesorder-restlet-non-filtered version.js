/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log'], function(search, record, log) {
	
	/**
	 * Function to get support case with related sales order and line items
	 * @param {Object} requestParams - Contains case number
	 * @returns {Object} Case data with sales order and line items
	 */
	function getCaseWithSalesOrderLines(requestParams) {
		try {
			const caseNumber = requestParams.casenumber || requestParams.case;
			
			if (!caseNumber) {
				return {
					error: true,
					message: 'Case number is required'
				};
			}
			
			// Step 1: Search for the support case
			const caseSearch = search.create({
				type: 'supportcase',
				filters: [
					['casenumber', 'is', caseNumber]
				],
				columns: [
					'internalid',
					'casenumber',
					'custevent_nxc_case_assets',
					'custevent_sna_hul_caselocation',
					'custevent_nx_case_transaction'
				]
			});
			
			let caseData = null;
			let salesOrderId = null;
			
			caseSearch.run().each(function(result) {
				caseData = {
					id: result.getValue('internalid'),
					casenumber: result.getValue('casenumber'),
					custevent_nxc_case_assets: result.getValue('custevent_nxc_case_assets'),
					custevent_sna_hul_caselocation: result.getValue('custevent_sna_hul_caselocation'),
					custevent_nx_case_transaction: result.getValue('custevent_nx_case_transaction')
				};
				salesOrderId = result.getValue('custevent_nx_case_transaction');
				return false; // Only get first result
			});
			
			if (!caseData) {
				return {
					error: true,
					message: 'Case not found: ' + caseNumber
				};
			}
			
			// Initialize response
			const response = {
				case: caseData,
				salesorder: null,
				lines: []
			};
			
			// Step 2: If there's a related sales order, load it
			if (salesOrderId) {
				try {
					const salesOrder = record.load({
						type: record.Type.SALES_ORDER,
						id: salesOrderId,
						isDynamic: false
					});
					
					// Get sales order header data
					response.salesorder = {
						salesorder_id: salesOrderId,
						salesorder_number: salesOrder.getValue('tranid'),
						customer_id: salesOrder.getValue('entity'),
						customer_name: salesOrder.getText('entity'),
						salesorder_date: salesOrder.getValue('trandate'),
						salesorder_status: salesOrder.getValue('status'),
						salesorder_status_text: salesOrder.getText('status')
					};
					
					// Get line items
					const lineCount = salesOrder.getLineCount({
						sublistId: 'item'
					});
					
					for (let i = 0; i < lineCount; i++) {
						// Get PO value - try both getValue and getText
						let linkedPOValue = '';
						let linkedPODisplay = '';
						
						try {
							linkedPOValue = salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_sna_linked_po',
								line: i
							}) || '';
							
							// If we have a value, try to get the display text
							if (linkedPOValue) {
								linkedPODisplay = salesOrder.getSublistText({
									sublistId: 'item',
									fieldId: 'custcol_sna_linked_po',
									line: i
								}) || linkedPOValue; // Fall back to ID if text fails
							}
						} catch (e) {
							log.error('Error getting linked PO', {
								line: i,
								error: e.message
							});
						}
						
						const lineData = {
							line: i + 1,
							item_id: salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'item',
								line: i
							}),
							item_name: salesOrder.getSublistText({
								sublistId: 'item',
								fieldId: 'item',
								line: i
							}),
							description: salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'description',
								line: i
							}) || '',
							quantity: salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'quantity',
								line: i
							}),
							quantityfulfilled: salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'quantityfulfilled',
								line: i
							}) || 0,
							location: salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'location',
								line: i
							}),
							location_name: salesOrder.getSublistText({
								sublistId: 'item',
								fieldId: 'location',
								line: i
							}),
							isclosed: salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'isclosed',
								line: i
							}),
							// Custom fields
							custcol_sna_linked_po: linkedPOValue,
							custcol_sna_linked_po_display: linkedPODisplay,
							custcol3: salesOrder.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol3',
								line: i
							}) || ''
						};
						
						// Add any custom fields you need here
						// Example:
						// lineData.custom_field = salesOrder.getSublistValue({
						//     sublistId: 'item',
						//     fieldId: 'custcol_your_field',
						//     line: i
						// });
						
						response.lines.push(lineData);
					}
					
				} catch (e) {
					log.error('Error loading sales order', e);
					response.salesorder = {
						error: true,
						message: 'Could not load sales order: ' + e.message
					};
				}
			}
			
			return response;
			
		} catch (e) {
			log.error('Error in getCaseWithSalesOrderLines', e);
			return {
				error: true,
				message: e.message
			};
		}
	}
	
	/**
	 * Alternative function to get only sales order lines by order ID
	 * @param {Object} requestParams - Contains salesOrderId
	 * @returns {Object} Sales order with line items
	 */
	function getSalesOrderLines(requestParams) {
		try {
			const salesOrderId = requestParams.salesOrderId;
			
			if (!salesOrderId) {
				return {
					error: true,
					message: 'Sales Order ID is required'
				};
			}
			
			const salesOrder = record.load({
				type: record.Type.SALES_ORDER,
				id: salesOrderId,
				isDynamic: false
			});
			
			const response = {
				salesorder: {
					id: salesOrderId,
					tranid: salesOrder.getValue('tranid'),
					entity: salesOrder.getValue('entity'),
					entity_name: salesOrder.getText('entity'),
					trandate: salesOrder.getValue('trandate'),
					status: salesOrder.getValue('status'),
					status_text: salesOrder.getText('status')
				},
				lines: []
			};
			
			const lineCount = salesOrder.getLineCount({
				sublistId: 'item'
			});
			
			for (let i = 0; i < lineCount; i++) {
				const lineData = {
					line: i + 1,
					item: salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						line: i
					}),
					item_display: salesOrder.getSublistText({
						sublistId: 'item',
						fieldId: 'item',
						line: i
					}),
					description: salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'description',
						line: i
					}) || '',
					quantity: salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						line: i
					}),
					quantityfulfilled: salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'quantityfulfilled',
						line: i
					}),
					// Custom fields
					custcol_sna_linked_po: salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_sna_linked_po',
						line: i
					}),
					custcol_sna_linked_po_display: salesOrder.getSublistText({
						sublistId: 'item',
						fieldId: 'custcol_sna_linked_po',
						line: i
					}),
					custcol3: salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'custcol3',
						line: i
					})
				};
				
				response.lines.push(lineData);
			}
			
			return response;
			
		} catch (e) {
			log.error('Error in getSalesOrderLines', e);
			return {
				error: true,
				message: e.message
			};
		}
	}
	
	return {
		get: function(requestParams) {
			// Determine which function to call based on parameters
			if (requestParams.casenumber || requestParams.case) {
				return getCaseWithSalesOrderLines(requestParams);
			} else if (requestParams.salesOrderId) {
				return getSalesOrderLines(requestParams);
			} else {
				return {
					error: true,
					message: 'Please provide either casenumber or salesOrderId parameter'
				};
			}
		},
		
		post: function(requestBody) {
			// POST method can accept the same parameters
			return this.get(requestBody);
		}
	};
});
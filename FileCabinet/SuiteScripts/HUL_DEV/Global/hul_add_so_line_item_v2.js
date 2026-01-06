/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/record'], function(record) {

  function post(context) {
	var salesOrderId = context.salesOrderId;
	var poId = context.poId;
	var itemId = context.itemId;
	var quantity = context.quantity || 1;
	

	if (!salesOrderId || !itemId || !poId) {
	  return {
		success: false,
		message: 'Missing required fields: salesOrderId poId or itemId'
	  };
	}

	try {
	  var so = record.load({
		type: record.Type.SALES_ORDER,
		id: salesOrderId,
		isDynamic: true
	  });

	  // Add new line
	  so.selectNewLine({ sublistId: 'item' });
	  so.setCurrentSublistValue({
		sublistId: 'item',
		fieldId: 'item',
		value: parseInt(itemId, 10)
	  });
	  so.setCurrentSublistValue({
		sublistId: 'item',
		fieldId: 'quantity',
		value: parseFloat(quantity)
	  });
	  so.setCurrentSublistValue({
		  sublistId: 'item',
		  fieldId: 'custcol_sna_linked_po',
		  value: parseInt(poId, 10)
		});
	  so.commitLine({ sublistId: 'item' });

	  var savedId = so.save();
	  return {
		success: true,
		id: savedId,
		message: 'Item added successfully'
	  };

	} catch (e) {
	  return {
		success: false,
		message: e.message
	  };
	}
  }

  return {
	post: post
  };
});

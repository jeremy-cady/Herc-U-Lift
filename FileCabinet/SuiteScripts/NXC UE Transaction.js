/**
 * This is supposed to connect a Sales Order or Quote to a Case when the transaction is created.  Used in conjunction with a workflow to create a SO or Quote from the Case.
 */
function afterSubmit(type) {
	if (type == 'create') {
  var transid 	= nlapiGetRecordId(),
      recordtype = nlapiGetRecordType(),
	  caseid 	= nlapiGetFieldValue('custbody_nx_case');
nlapiLogExecution('debug', 'values', 'Transaction Type : ' + recordtype + ' Transaction : ' + transid + ' Case : ' + caseid);
  // Only link to SO - if SO exist and there is no Parent to the Asset Quote exists, any type.  Type removed from afterSubmit()
  if (caseid) nlapiSubmitField('supportcase', caseid, 'custevent_nx_case_transaction', transid)
}
}
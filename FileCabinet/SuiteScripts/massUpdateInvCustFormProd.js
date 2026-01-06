/**
* @NApiVersion 2.x
* @NScriptType MassUpdateScript
*
*/

define(['N/record', 'N/search'],
	function(record, search) {

		function isEmpty(stValue) {
			return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
				for ( var k in v)
					return false;
				return true;
			})(stValue)));
		}


		function each(params) {
			try {
log.audit('REC Details', 'ID: ' + params.id + ', Type: ' + params.type);
				var invLookup = search.lookupFields({ type: 'invoice', id: params.id, columns: ['externalid', 'tranid']});
log.audit('invLookup', invLookup);
				var tranId = invLookup.tranid;
log.audit('tranId', tranId);

				if(!isEmpty(tranId)) {
					var startsWithR = tranId.substring(0,1) == 'R' ? true : false;
					var startsWithS = tranId.substring(0,1) == 'S' ? true : false;
					var startsWithFIN = tranId.substring(0,3) == 'FIN' ? true : false;
					// var startsWithW = tranId.substring(0,1) == 'W' ? true : false;
log.audit('Doc Number Details', 'startsWithR: ' + startsWithR + ', startsWithS: ' + startsWithS + ', startsWithFIN: ' + startsWithFIN);

					// HUL Rental Invoice - Prod Transaction Int ID 138
					if(startsWithR) {
log.audit('startsWithR', startsWithR);
						// var recLoad = record.load({type: 'invoice',id: params.id});
						// recLoad.setValue({ fieldId: 'customform', value: 138 });
						// recLoad.save({ ignoreMandatoryFields: true });
						record.submitFields({ type: 'invoice', id: params.id, values: { 'customform': 138 } });
					}

					// HUL Equipment Invoice - Prod Transaction Int ID 144
					if(startsWithS) {
log.audit('startsWithS', startsWithS);
						// var recLoad = record.load({type: 'invoice',id: params.id});
						// recLoad.setValue({ fieldId: 'customform', value: 144 });
						// recLoad.save({ ignoreMandatoryFields: true });
						record.submitFields({ type: 'invoice', id: params.id, values: { 'customform': 144 } });
					}

					// HUL Lease Invoice - Prod Transaction Int ID 139
					if(startsWithFIN) {
log.audit('startsWithFIN', startsWithFIN);
						// var recLoad = record.load({type: 'invoice',id: params.id});
						// recLoad.setValue({ fieldId: 'customform', value: 139 });
						// recLoad.save({ ignoreMandatoryFields: true });
						record.submitFields({ type: 'invoice', id: params.id, values: { 'customform': 139 } });
					}

					// if(startsWithW) {
// log.audit('startsWithW', 'Starts with W.');
						// var recLoad = record.load({type: 'invoice',id: params.id});
						// recLoad.setValue({ fieldId: 'customform', value: 101 });
						// recLoad.save({ ignoreMandatoryFields: true });
						// // record.submitFields({ type: 'invoice', id: params.id, values: { 'customform': 101 } });
					// }
				}
log.audit('Finish', 'Finish');
			}
			catch(e) { log.error({ title: e.name, details: e.message }); }
		}

		return {
			each: each
		};
	}
);
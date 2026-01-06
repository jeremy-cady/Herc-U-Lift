/**
 * @NApiVersion 2.1
 * @NScriptType workflowactionscript
 */

/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author mdesilva
*
 * Script brief description:
   Workflow action script created to
   - get item line's NEXTSERVICE TASK (TRANS) value
*
*
* Revision History:
*
* Date              Issue/Case         Author         Issue Fix Summary
* =============================================================================================
* 2023/11/03                          mdesilva         Initial version
*
*/

define(['N/record', 'N/search'], function (record, search) {
    function onAction(context) {
        
        var soRec = context.newRecord;
		var salesOrderId = context.newRecord.id;
		var recType = context.newRecord.type;
		var hasTaskResult6 = false;
		/**        
        var salesOrder = record.load({
            type: recType,
            id: salesOrderId,
            isDynamic: false
        });		
		**/
        
        var itemCount = soRec.getLineCount({
            sublistId: 'item'
        });
		log.debug('onAction', 'recType: '+recType +' | salesOrderId: ' +salesOrderId +' | itemCount: ' +itemCount);

        for (var line = 0; line < itemCount; line++) {			
            var nxtsrvcTask = soRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_nx_task',
                line: line
            });            
            log.debug('nxtsrvcTask Value', 'nxtsrvcTask Value: ' +nxtsrvcTask);
			
			if(!isEmpty(nxtsrvcTask)){
				var taskFields = search.lookupFields({
	                type: 'task',
	                id: nxtsrvcTask,
	                columns: ['custevent_nxc_task_result']
	            });
				if (taskFields.custevent_nxc_task_result && taskFields.custevent_nxc_task_result[0]) {
					var taskResult = taskFields.custevent_nxc_task_result[0].value;
					log.debug('taskResult', 'taskResult: '+taskResult);
					
					if(taskResult == '6'){ //Job Complete & CPMNO
						log.debug('taskResult', 'Job Complete & CPMNO');						
						hasTaskResult6 = true;
					}
				}else {
					log.debug('custevent_nxc_task_result[0] is Undefined');
				}
			}			
        }
		
		if (hasTaskResult6 == false) {
			log.debug('taskResult', hasTaskResult6);
			return 'F';
		} else if (hasTaskResult6 == true) {
			log.debug('taskResult', hasTaskResult6);
			return 'T';
		}
		
    }
	
	
	function isEmpty(stValue) {
			return ((stValue == 0 || stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
				for (var k in v)
					return false;
				return true;
			})(stValue)));
	}

    return {
        onAction: onAction
    };
});
function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    var to_acc = '';
    try {

        var context = nlapiGetContext();
        nlapiLogExecution('AUDIT', 'context object', context.getExecutionContext());
        to_acc = context.getPreference('custscript_sna_hul_gl_wip_account');
        var rectype = transactionRecord.getRecordType();
        if (rectype != 'itemfulfillment') return;
        var recid = transactionRecord.getId();
        var createdfrom = transactionRecord.getFieldValue('createdfrom');
        nlapiLogExecution('AUDIT', 'customizeGlImpact starting', rectype + ':' + recid + ' to_acc:' + to_acc + ' createdfrom:' + createdfrom);

        if (createdfrom.length == 0) return;
        var createdfromtext = transactionRecord.getFieldText('createdfrom');
        if (createdfromtext.indexOf("Sales Order") == -1) return;
        if (to_acc == 0 || to_acc == '') return;
        var soForm = nlapiLookupField('salesorder', createdfrom, 'customform');
        nlapiLogExecution('AUDIT', 'customizeGlImpact soForm', soForm);
        if (soForm != 112 && soForm != 113 && soForm != 106 && soForm != 153) return; // Full Maintenance Order, Parts and Object Orders, Parts and Object Orders - Tom, NXC Sales Order (2)

        var linecount = standardLines.getCount();
        if (linecount == 0) return; // no work to complete

        nlapiLogExecution('DEBUG', 'standardLines linecount', linecount);
        var transactionnumber = transactionRecord.getFieldValue('transactionnumber');
        var jetxt = transactionRecord.getFieldValue('custbody_sna_hul_je_wip');
        var jeId = [];
        if (recid && jetxt) {
            jeId = nlapiLookupField('itemfulfillment', recid, 'custbody_sna_hul_je_wip').split(',');
        }
        var jeLinesObj = [];
        nlapiLogExecution('DEBUG', 'JE Exists?', jeId ? 'JE Exists ' + JSON.stringify(jeId) : 'No associated JE');

        for (var i = 0; i < linecount; i++) {

            var line = standardLines.getLine(i);
            if (!line.isPosting()) continue; // not a posting item
            if (line.getId() == 0) continue; // summary lines; ignore
            if (line.getAccountId() == null) continue; // no account; ignore

            var acc = line.getAccountId()
                .toString();
            var isCogs = nlapiLookupField('account', acc, 'type') == 'COGS' ? true : false;
            if (isCogs) {
                var cogs = {};
                cogs.transactionnumber = transactionnumber;
                cogs.acc = acc;
                cogs.amt = line.getDebitAmount();
                cogs.cls = line.getClassId() || '';
                cogs.loc = line.getLocationId() || '';
                cogs.dep = line.getDepartmentId() || '';
                nlapiLogExecution('DEBUG', 'cogs object', JSON.stringify(cogs));
                if (parseFloat(cogs.amt) <= 0) {
                    continue;
                }

                createCustomLines(cogs);
                if (jeId.length > 0) {
                    jeLinesObj.push(cogs);
                }
            } else {
                continue;
            }

        };

        if (jeLinesObj.length > 0) {
            nlapiLogExecution('DEBUG', 'JE Lines', JSON.stringify(jeLinesObj));
            updateJeLines({
                lines: jeLinesObj,
                id: jeId
            });
        }

    } catch (e) {
        try {
            var err_title = 'Unexpected error';
            var err_description = '';
            if (e) {
                if (e instanceof nlobjError) {
                    err_description = err_description + ' ' + e.getCode() + '|' + e.getDetails();
                } else {
                    err_description = err_description + ' ' + e.toString();
                };
            };
            nlapiLogExecution('ERROR', 'Log Error ' + err_title, err_description);
        } catch (ex) {
            nlapiLogExecution('ERROR', 'Error performing error logging');
        };
    };

    function updateJeLines(data) {
        nlapiLogExecution('DEBUG', 'updateJeLines data', JSON.stringify(data));

        var jeIds = data.id;
        var lines = data.lines;
        nlapiLogExecution('DEBUG', 'jeIds', 'jeIds len:' + jeIds.length);

        for (var q = 0; q < jeIds.length; q++) {
            var je = jeIds[q];
            nlapiLogExecution('DEBUG', 'je', 'je:' + je);

            var jeRec = nlapiLoadRecord('journalentry', je, {
                recordmode: 'dynamic'
            });

            var lineItemCount = jeRec.getLineItemCount('line');
            nlapiLogExecution('DEBUG', 'updateJeLines Info', 'jeRec.id: ' + jeRec.getId() + ' lineItemCount: ' + lineItemCount + ' lines:' + JSON.stringify(lines));
            for (var i = 1; i <= lineItemCount; i++) {
                if (jeRec.getLineItemValue('line', 'memo', i) == lines[0].transactionnumber) {
                    try {
                        // if(jeRec.getLineItemValue('line', 'debit', i) == ''){
                        //     jeRec.setLineItemValue('line', 'credit', i, '0');
                        // }
                        // else if(jeRec.getLineItemValue('line', 'credit', i) == ''){
                        //     jeRec.setLineItemValue('line', 'debit', i, '0');
                        // }
                        // nlapiLogExecution('DEBUG', 'Set to zero JE Line', 'Line: ' + i);


                        // jeRec.removeLineItem('line', i);
                        // nlapiLogExecution('DEBUG', 'removeLineItem', 'Line: ' + i);

                        nlapiLogExecution('DEBUG', 'Set debit', 'Line: ' + i);
                        var lineObj = lines[0];
                        jeRec.setLineItemValue('line', 'memo', i, lineObj.transactionnumber);
                        jeRec.setLineItemValue('line', 'location', i, lineObj.loc);
                        jeRec.setLineItemValue('line', 'department', i, lineObj.dep);
                        jeRec.setLineItemValue('line', 'account', i, lineObj.acc);
                        jeRec.setLineItemValue('line', 'debit', i, lineObj.amt);
                        jeRec.setLineItemValue('line', 'credit', i, null);

                        i = i + 1;
                        nlapiLogExecution('DEBUG', 'Set credit', 'Line: ' + i);
                        jeRec.setLineItemValue('line', 'memo', i, lineObj.transactionnumber);
                        jeRec.setLineItemValue('line', 'location', i, lineObj.loc);
                        jeRec.setLineItemValue('line', 'department', i, lineObj.dep);
                        jeRec.setLineItemValue('line', 'account', i, to_acc);
                        jeRec.setLineItemValue('line', 'credit', i, lineObj.amt);
                        jeRec.setLineItemValue('line', 'debit', i, null);
                        nlapiLogExecution('DEBUG', 'Added Lines ', 'lineObj: ' + JSON.stringify(lineObj));
                        // i= i+1;


                        //lines.shift();
                    } catch (e) {
                        var err_title = 'Unexpected error';
                        nlapiLogExecution('ERROR', err_title + ' on Remove for line ' + i, e.toString());
                    }
                }
            }
            // lineItemCount = jeRec.getLineItemCount('line');
            // nlapiLogExecution('DEBUG', 'New Line Item Count', 'lineItemCount: ' + lineItemCount);
            // var j = 1;
            // for(var i = 0; i < lines.length; i++){
            //     var lineObj = lines[i];
            //     jeRec.setLineItemValue('line','memo', lineItemCount +j, lineObj.transactionnumber);
            //     jeRec.setLineItemValue('line','location', lineItemCount +j, lineObj.loc);
            //     jeRec.setLineItemValue('line','department', lineItemCount +j, lineObj.dep);
            //     jeRec.setLineItemValue('line','account', lineItemCount +j, lineObj.acc);
            //     jeRec.setLineItemValue('line','debit', lineItemCount +j, lineObj.amt);
            //
            //     j= j+1;
            //     jeRec.setLineItemValue('line','memo', lineItemCount +j, lineObj.transactionnumber);
            //     jeRec.setLineItemValue('line','location', lineItemCount +j, lineObj.loc);
            //     jeRec.setLineItemValue('line','department', lineItemCount +j, lineObj.dep);
            //     jeRec.setLineItemValue('line','account', lineItemCount +j, to_acc);
            //     jeRec.setLineItemValue('line','credit', lineItemCount +j, lineObj.amt);
            //     nlapiLogExecution('DEBUG', 'Added Lines ', 'lineObj: ' + JSON.stringify(lineObj));
            //     j= j+1;
            //
            // }
            try {
                nlapiSubmitRecord(jeRec);
            } catch (e) {
                try {
                    var err_title = 'Unexpected error';
                    var err_description = '';
                    if (e) {
                        if (e instanceof nlobjError) {
                            err_description = err_description + ' ' + e.getCode() + '|' + e.getDetails();
                        } else {
                            err_description = err_description + ' ' + e.toString();
                        };
                    };
                    nlapiLogExecution('ERROR', 'JE Log Error ' + err_title, err_description);
                } catch (ex) {
                    nlapiLogExecution('ERROR', 'JE Error performing error logging');
                }
            }
        }
    }

    function createCustomLines(cogs) {

        // remove the original amount
        var newLine = customLines.addNewLine();
        newLine.setAccountId(parseInt(cogs.acc));
        if (cogs.loc)
            newLine.setLocationId(parseInt(cogs.loc));
        if (cogs.dep)
            newLine.setDepartmentId(parseInt(cogs.dep));
        if (parseFloat(cogs.amt) >= 0) {
            newLine.setCreditAmount(cogs.amt);
        }
        newLine.setMemo("Reclass COGS");

        var newLine = customLines.addNewLine();
        newLine.setAccountId(parseInt(to_acc));
        if (cogs.loc)
            newLine.setLocationId(parseInt(cogs.loc));
        if (cogs.dep)
            newLine.setDepartmentId(parseInt(cogs.dep));
        if (parseFloat(cogs.amt) >= 0) {
            newLine.setDebitAmount(cogs.amt);
        }
        newLine.setMemo("Reclass COGS");


        nlapiLogExecution('DEBUG', 'Custom Lines Added Based on ', JSON.stringify(cogs));
    }
};
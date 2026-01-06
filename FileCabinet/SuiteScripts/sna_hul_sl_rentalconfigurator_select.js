/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script for the dropdown options
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/9/9       		                 aduldulao       Initial version.
 * 2022/11/8       		                 aduldulao       Act_Config
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record'],
    /**
 * @param{serverWidget} serverWidget
 */
    (serverWidget, record) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var method = scriptContext.request.method;

            // GET
            if (method == 'GET') {
                var params = scriptContext.request.parameters;
                log.debug({title: 'GET - params', details: JSON.stringify(params)});

                var fldname = params.fldname;
                var line = params.line;
                var objid = params.objid;
                var actualobj = params.actualobj;

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // create form
                var form = serverWidget.createForm({title: 'Select Options', hideNavBar: true});

                // create header fields
                var linefld = form.addField({id: 'custpage_linefld', type: serverWidget.FieldType.TEXT, label: 'Line #'});
                linefld.updateDisplayType({displayType : serverWidget.FieldDisplayType.INLINE});
                linefld.defaultValue = line;

                var selectfld = form.addField({id: 'custpage_selectfld', type: serverWidget.FieldType.SELECT, label: fldname});

                // add submit button
                form.addSubmitButton({label: 'Submit'});

                // add buttons
                form.addButton({id: 'custpage_backbtn', label: 'Cancel', functionName: 'window.close();'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // get select options
                var fldfound = false;

                // check actual object first
                if (!isEmpty(actualobj)) {
                    fldfound = setOptionsField(actualobj, fldname, selectfld);
                }
                // dummy object
                if (!fldfound) {
                    setOptionsField(objid, fldname, selectfld);
                }

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                scriptContext.response.writePage(form);
            }
            // POST
            else {
                var request = scriptContext.request;
                var params = request.parameters;

                log.debug({title: 'POST - params', details: JSON.stringify(params)});

                var val = params.custpage_selectfld;
                var lne = params.custpage_linefld;

                var stHtml = '<script language="JavaScript">';
                stHtml += 'if (window.opener)';
                stHtml += '{';
                stHtml += "window.opener.nlapiSetLineItemValue('custpage_configsublist','custpage_actualsubfld','" + lne + "','" + val + "');"
                stHtml += '}';
                stHtml += 'window.close();';
                stHtml += '</script>';

                scriptContext.response.write({output: stHtml});
            }
        }

        /**
         * Find field
         * @param id
         * @param fldname
         * @param selectfld
         * @returns {boolean}
         */
        function setOptionsField(obid, fldname, selectfld) {
            var fldfound = false;

            var recobj = record.load({type: 'customrecord_sna_objects', id: obid, isDynamic: true});
            var allflds = recobj.getFields();

            // loop through all obj fields to get field types
            for (var w = 0; w < allflds.length; w++) {
                var fldobj = recobj.getField({fieldId: allflds[w]});

                if (!isEmpty(fldobj) && fldobj.label == fldname && fldobj.type == 'select') {
                    fldfound = true;

                    var selectOptions = fldobj.getSelectOptions();
                    log.debug({title: 'findField', details: 'fldname: ' + fldname + ' | ' + JSON.stringify(selectOptions)});

                    selectfld.addSelectOption({value: '', text: ''});
                    for (var v = 0; v < selectOptions.length; v++) {
                        selectfld.addSelectOption({value: selectOptions[v].text, text: selectOptions[v].text});
                    }
                }
            }

            return fldfound;
        }

        return {onRequest}

    });

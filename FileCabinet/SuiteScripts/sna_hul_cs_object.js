/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script for dynamic filter of which fields are visible on the Configuration tab of the Object record
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/10/4       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/currentRecord'],
/**
 * @param{search} search
 */
function(search, currentRecord) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    function inArray(stValue, arrValue) {
        for (var i = arrValue.length-1; i >= 0; i--) {
            if (stValue == arrValue[i]) {
                break;
            }
        }
        return (i > -1);
    }

    function getUniqueAfterMerge(arr1, arr2) {
        // merge two arrays
        var uniqueArr = [];

        for (var i = 0; i < arr1.length; i++){
            if (uniqueArr.indexOf(arr1[i]) == -1) {
                uniqueArr.push(arr1[i]);
            }
        }
        for (var i = 0; i < arr2.length; i++){
            if (uniqueArr.indexOf(arr2[i]) == -1) {
                uniqueArr.push(arr2[i])
            }
        }

        return uniqueArr;
    }


    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var currrec = currentRecord.get();

        var segment = currrec.getText({fieldId: 'cseg_sna_hul_eq_seg'});
        log.debug({title: 'pageInit', details: 'segment: ' + segment});

        setFieldDisplay(currrec, segment);
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var fldid = scriptContext.fieldId;

        var currrec = currentRecord.get();

        if (fldid == 'cseg_sna_hul_eq_seg') {
            var segment = currrec.getText({fieldId: 'cseg_sna_hul_eq_seg'});
            log.debug({title: 'fieldChanged', details: 'segment: ' + segment});

            setFieldDisplay(currrec, segment);
        }
    }

    /**
     * Set field display type
     * @param currrec
     * @param segment
     */
    function setFieldDisplay(currrec, segment) {
        var noruleflds = [
            'custrecord_sna_raised_platform_height',
            'custrecord_sna_mitsubishi_fb16pnt_fb20pn',
            'custrecord_sna_skyjack_3219',
            'custrecord_sna_skyjack_1056th',
            'custrecord_sna_skyjack_60aj',
            'custrecord_sna_skyjack_60t',
            'custrecord_sna_jlg_e400',
            'custrecord_sna_nifty_sd64',
            'custrecord_sna_nifty_tm42t',
            'custrecord_sna_mast_cylinder_numbers',
            'custrecord_sna_axle_on_rail_serial',
            'custrecord_sna_trackmobile_titan_railcar'
        ];
        var arrfinalallflds = [];
        var arrfinalflds = '';
        var temp_arrfinalflds = '';
        var resfound = false;

        var columns = [];
        columns.push(search.createColumn({name: 'custrecord_sna_hul_configurable_fields'}));
        columns.push(search.createColumn({name: 'cseg_sna_hul_eq_seg'}));

        var srch = search.create({type: 'customrecord_sna_object_config_rule', columns: columns});

        srch.run().each(function(result) {
            var finalflds = result.getValue({name: 'custrecord_sna_hul_configurable_fields'});
            var seg = result.getText({name: 'cseg_sna_hul_eq_seg'}); // FORKLIFT : CLASS IV

            // When the Rental Object Configurator Rule Segment String is within the HUL Category Segment String of the Object selected, display all Object Record fields based on the Internal Ids listed under configurable field Text box
            if (segment.includes(seg) && !isEmpty(segment) && !isEmpty(seg) && !resfound) {
                arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                resfound = true;
            }

            // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
            if (isEmpty(seg) && isEmpty(segment) && !resfound) {
                arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                resfound = true;
            }

            // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
            if (isEmpty(seg) && !isEmpty(segment)) {
                temp_arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
            }

            var allflds = finalflds.replace(/\r\n/g, '').split(',');
            arrfinalallflds = getUniqueAfterMerge(arrfinalallflds, allflds);

            return true;
        });

        // no match found
        if (isEmpty(arrfinalflds)) {
            arrfinalflds = temp_arrfinalflds;
        }

        log.debug({title: 'setFieldDisplay', details: 'arrfinalflds: ' + JSON.stringify(arrfinalflds)});
        log.debug({title: 'setFieldDisplay', details: 'arrfinalallflds: ' + JSON.stringify(arrfinalallflds)});

        // loop through obj rules
        for (var d = 0; d < arrfinalallflds.length; d++) {
            if (!!arrfinalallflds[d]) {
                var fldobj = currrec.getField({fieldId: arrfinalallflds[d]});

                if (!isEmpty(fldobj)) {
                    if (inArray(arrfinalallflds[d], arrfinalflds)) {
                        fldobj.isDisplay = true;
                        fldobj.isVisible = true;
                    } else {
                        fldobj.isDisplay = false;
                        fldobj.isVisible = false;
                    }
                }
            }
        }

        // loop through no rule fields
        for (var x = 0; x < noruleflds.length; x++) {
            if (!!noruleflds[x]) {
                var fldobj = currrec.getField({fieldId: noruleflds[x]});

                if (!isEmpty(fldobj)) {
                    if (inArray(noruleflds[x], arrfinalflds)) {
                        fldobj.isDisplay = true;
                        fldobj.isVisible = true;
                    } else {
                        fldobj.isDisplay = false;
                        fldobj.isVisible = false;
                    }
                }
            }
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };

});

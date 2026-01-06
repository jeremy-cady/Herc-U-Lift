/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Set Customer Pricing Group - Service upon Zip Code field change from Sales Zone.
 *
 * Revision History:
 *
 * Date			            Issue/Case		    Author			    Issue Fix Summary
 * =======================================================================================================
 * 2023/03/23						            caranda           	Initial version
 * 2023/04/03						            aduldulao           Set CUSTOMER PRICING GROUP - PARTS
 * 2023/04/07                                   aduldulao           Remove use of main line customer pricing group
 *
 */
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param{search} search
 */
function(search) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
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
        var currrec = scriptContext.currentRecord;
        var entity = currrec.getValue({fieldId: 'entity'});
        var cpg_parts = currrec.getValue({fieldId: 'custrecord_sna_cpg_parts'});
        var addressid = currrec.getValue({fieldId: 'id'});
        //alert('entity = ' + entity + ' | current cpg_parts: ' + cpg_parts + ' | addressid: ' + addressid);

        if (isEmpty(cpg_parts) && !isEmpty(entity) && !isEmpty(addressid)) {
            cpg_parts = getCustPricingGrpAddress(entity, addressid);
            currrec.setValue({fieldId: 'custrecord_sna_cpg_parts', value: cpg_parts});
        }
    }

    /**
     * Get customer pricing group from customer
     * @param entity
     * @param id
     * @returns {string}
     */
    function getCustPricingGrpAddress(entity, addid) {
        var cpg = '';

        var filters_ = [];

        filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: entity}));
        //filters_.push(search.createFilter({name: 'addressinternalid', join: 'address', operator: search.Operator.IS, values: addid})); // this is not working

        var columns_ = [];
        columns_.push(search.createColumn({name: 'custrecord_sna_cpg_parts', join: 'Address'}));
        columns_.push(search.createColumn({name: 'addressinternalid', join: 'Address'}));

        var cusrecsearch = search.create({type: search.Type.CUSTOMER, filters: filters_, columns: columns_});
        cusrecsearch.run().each(function(result) {
            var resaddressid = result.getValue({name: 'addressinternalid', join: 'Address'});

            if (resaddressid == addid) {
                cpg = result.getValue({name: 'custrecord_sna_cpg_parts', join: 'Address'});
                return false;
            }

            return true;
        });

        return cpg;
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
        var TITLE = 'fieldChanged Address Zip'
        var currentRecord = scriptContext.currentRecord;
        var fieldName = scriptContext.fieldId;

        if(fieldName == 'zip'){
            var currZip = currentRecord.getValue({fieldId: 'zip'});
            //console.log(TITLE + ' | currZip = ' + currZip);

            if(currZip){
                var cpg = _getCustomerPricingGroup(currZip);
                currentRecord.setValue({fieldId: 'custrecord_sna_cpg_service', value: cpg});
            }else{
                currentRecord.setValue({fieldId: 'custrecord_sna_cpg_service', value: ''});
            }
        }
    }

    function _getCustomerPricingGroup(zipCode) {
        //Search Sales Zone
        var stLoggerTitle = '_getCustomerPricingGroup';

        var salesZoneSrch = search.create({
            type: 'customrecord_sna_sales_zone',
            filters: [{
                name: 'custrecord_sna_st_zip_code',
                operator: 'is',
                values: zipCode
            }],
            columns: ['custrecord_sna_sz_cpg']
        })

        var priceGroup = '';
        salesZoneSrch.run().each(function(result) {
            priceGroup = result.getValue({
                name: 'custrecord_sna_sz_cpg'
            });
        });

        //console.log(stLoggerTitle + ' | priceGroup = ' + priceGroup);

        return priceGroup;
    }


    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };
    
});

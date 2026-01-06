/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to create custom field in Terms record
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/1/24       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget', 'N/search', 'N/record'],
    /**
 * @param{serverWidget} serverWidget
 */
    (serverWidget, search, record) => {

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
                var form = scriptContext.form;

                var descfld = form.addField({id: 'custpage_desc', type: serverWidget.FieldType.LONGTEXT, label: 'Description'});

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                log.debug({title: 'beforeLoad', details: 'Term: ' + _recid});

                var desc = '';
                var descid = '';

                if (!isEmpty(_recid)) {
                    var descfld = findCustRecDesc(_recid);
                    desc = descfld.desc;
                    descid = descfld.descid;
                }

                _rec.setValue({fieldId: 'custpage_desc', value: desc});
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR', e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error', e.toString());
                }
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            var _rec = scriptContext.newRecord;
            var _recid = _rec.id;
            var desc = _rec.getValue({fieldId: 'custpage_desc'});
            log.debug({title: 'afterSubmit', details: 'Term: ' + _recid + ' | desc: ' + desc});

            var descfld = findCustRecDesc(_recid);
            var descid = descfld.descid;

            if (!isEmpty(descid)) {
                record.submitFields({type: 'customrecord_sna_term_desc', id: descid, values: {custrecord_sna_term_desc: desc}});
            }
            else {
                createCustDesc(desc, _recid);
            }
        }

        /**
         * Create decription custom record
         * @param desc
         * @param _recid
         */
        function createCustDesc(desc, _recid) {
            var descrec = record.create({type: 'customrecord_sna_term_desc'});

            descrec.setValue({fieldId: 'custrecord_sna_payment_term', value: _recid});
            descrec.setValue({fieldId: 'custrecord_sna_term_desc', value: desc});

            var recid = descrec.save({ignoreMandatoryFields: true});
            log.debug({title: 'createCustDesc', details: 'payment term description created: ' + recid});
        }

        /**
         * Find the related custom record
         * @param _recid
         * @returns {{descid: string, desc: string}}
         */
        function findCustRecDesc(_recid) {
            var desc = '';
            var descid = '';

            // look for the custom record desc
            var filters_ = [];
            filters_.push(search.createFilter({name: 'custrecord_sna_payment_term', operator: search.Operator.IS, values: _recid}));
            filters_.push(search.createFilter({name: 'isinactive', operator: search.Operator.IS, values: false}));

            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first
            columns_.push(search.createColumn({name: 'custrecord_sna_term_desc'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_term_desc', filters: filters_, columns: columns_});
            var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});

            if (!isEmpty(cusrecser)) {
                desc = cusrecser[0].getValue({name: 'custrecord_sna_term_desc'});
                descid = cusrecser[0].getValue({name: 'internalid'});
            }

            return {
                desc: desc,
                descid: descid
            };
        }

        return {beforeLoad, afterSubmit}

    });

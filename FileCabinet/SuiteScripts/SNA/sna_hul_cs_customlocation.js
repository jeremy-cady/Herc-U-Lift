/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
*
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2022/09/08						            natoretiro      	Initial version
* 
*/

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([
        'N/record',
        'N/runtime',
        'N/search',
        'N/format',
        'N/error'
    ],

    function (record, runtime, search, format, error) {

        function pageInit_(context) {
            var objCurrentRecord = context.currentRecord;

            var stSubsidiaryId = objCurrentRecord.getValue({ fieldId: 'subsidiary' });
            var stLocationId = objCurrentRecord.getValue({ fieldId: 'location' });

            if(!isEmpty(stSubsidiaryId))
            {
                getLocationBySubsidiary(objCurrentRecord, stSubsidiaryId,stLocationId );
            }
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
        function fieldChanged_(context) {
            var stLoggerTitle = 'fieldChanged_';
            console.log(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            var currentRecord = context.currentRecord;
            var slName = context.sublistId;
            var fldName = context.fieldId;
            var intIndex = context.line;

            if (fldName == 'custbody_sna_hul_location')
            {
                var stLocationId = currentRecord.getValue({ fieldId: fldName });

                currentRecord.setValue({ fieldId: 'location', value: stLocationId });
                // getLocationBySubsidiary(currentRecord, stSubsidiaryId);
            }


            console.log(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }



        function getLocationBySubsidiary(objCurrentRecord, stSubsidiaryId, stSelectedLocation)
        {
            var stLoggerTitle = 'getLocationBySubsidiary';
            console.log(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');


            search.create.promise({
                type: "location",
                filters:
                    [
                        ["subsidiary","anyof",stSubsidiaryId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC
                        }),
                        "namenohierarchy"
                    ]
            }).then(function(objSearch){

                var searchResultCount = objSearch.runPaged().count;
                console.log(stLoggerTitle + ' | searchResultCount = ' + searchResultCount);

                var fldLocation = objCurrentRecord.getField({fieldId: 'custpage_fld_location' });
                //remove all in the dropdown list
                fldLocation.removeSelectOption({
                    value: null,
                });

                if(searchResultCount > 0)
                {

                    fldLocation.insertSelectOption({value: 0, text: '--- Select a Location ---' });

                    objSearch.run().each(function(result)
                    {
                        console.log(stLoggerTitle + ' | result = ' + JSON.stringify(result));

                        if(result.id == stSelectedLocation)
                        {
                            fldLocation.insertSelectOption({
                                value: result.id,
                                text: result.getValue({ name : 'namenohierarchy' }),
                                isSelected: true
                            });
                        }
                        else
                        {
                            fldLocation.insertSelectOption({
                                value: result.id,
                                text: result.getValue({ name : 'namenohierarchy' }),
                                isSelected: false
                            });
                        }


                        return true;
                    });




                }
                else
                {
                    fldLocation.insertSelectOption({value: 0, text: '--- No Location ---' });
                }


            }).catch(function(err){

                console.log(stLoggerTitle + ' | search.create.promise | ERROR: ' + err);
            });






            console.log(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');


        }

        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        };


        return {
            fieldChanged: fieldChanged_,
            // pageInit: pageInit_
        };
    });
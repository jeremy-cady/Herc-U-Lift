/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Map/Reduce script creates Bin Put-Away Worksheet Records based on a CSV file which is passed by a Suitelet
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/07/06                           Care Parba          Initial version
 *
 */
define(['N/email', 'N/error', 'N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/task', 'N/util'],
    /**
 * @param{email} email
 * @param{error} error
 * @param{file} file
 * @param{format} format
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{task} task
 * @param{util} util
 */
    (email, error, file, format, record, runtime, search, task, util) => {
        let objUtil = {};
        objUtil.isEmpty = function(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (let k in v) return false;
                    return true;
                })(stValue)));
        };

        function splitCSVButIgnoreCommasInDoublequotes(str) {
            let delimiter = ',';
            let quotes = '"';
            let elements = str.split(delimiter);
            let newElements = [];

            for (let i = 0; i < elements.length; ++i) {

                if (elements[i].indexOf(quotes) >= 0) { //the left double quotes is found

                    let indexOfRightQuotes = -1;
                    let tmp = elements[i];
                    //find the right double quotes
                    for (let j = i + 1; j < elements.length; ++j) {
                        if (elements[j].indexOf(quotes) >= 0) {
                            indexOfRightQuotes = j;
                            break;
                        }
                    }

                    //found the right double quotes
                    //merge all the elements between double quotes
                    if (-1 != indexOfRightQuotes) {

                        for (let j = i + 1; j <= indexOfRightQuotes; ++j) {
                            tmp = tmp + delimiter + elements[j];
                        }
                        newElements.push(tmp);
                        i = indexOfRightQuotes;
                    } else { //right double quotes is not found
                        newElements.push(elements[i]);
                    }
                } else { //no left double quotes is found
                    newElements.push(elements[i]);
                }
            }

            return newElements;
        }

        const parseJSON = (data) => {
            if (typeof data == "string") data = JSON.parse(data);
            return data;
        }

        const getInputData = (inputContext) => {
            const LOG_TITLE = "getInputData";

            log.debug({title: LOG_TITLE, details: "===========START==========="});

            let arrInitialResults = [];
            let arrFinalResults = [];
            let objCurrentScript = runtime.getCurrentScript();
            let stCsvFileId = objCurrentScript.getParameter({ name: 'custscript_sna_hul_bin_putaway_worksheet' });

            if (!objUtil.isEmpty(stCsvFileId)) {
                // Load uploaded csv file
                let arrLines = file.load({
                    id: stCsvFileId
                }).getContents().split(/\n|\n\r/);

                log.debug({
                    title: LOG_TITLE, details: 'arrLines: ' + arrLines
                });

                // Get line details from csv file
                for (let i = 1; i < arrLines.length - 1; i++) {
                    let stContent = splitCSVButIgnoreCommasInDoublequotes(arrLines[i]);

                    if (!objUtil.isEmpty(stContent[2])) {
                        arrInitialResults.push({
                            location: !objUtil.isEmpty(stContent[2]) ? stContent[2] : '',
                            item: !objUtil.isEmpty(stContent[0]) ? stContent[0] : '',
                            binnumber: !objUtil.isEmpty(stContent[4]) ? stContent[4] : '',
                            quantity: !objUtil.isEmpty(stContent[5]) ? stContent[5].replace('\r' , '') : ''
                        });
                    }
                }

                //Grouped line details by location
                arrFinalResults = arrInitialResults.reduce((acc, d) => {
                    const bFound = acc.find(a => a.location === d.location);
                    const arrValue = {
                        item: d.item,
                        binnumber: d.binnumber,
                        quantity: d.quantity
                    };

                    if (!bFound)
                        acc.push({ location: d.location, lineIdData: [ arrValue ] });
                    else
                        bFound.lineIdData.push(arrValue);

                    return acc;
                }, []);
            }

            log.debug({
                title: LOG_TITLE, details: 'arrInitialResults count: ' + arrInitialResults.length
            });
            log.debug({
                title: LOG_TITLE, details: 'arrInitialResults: ' + JSON.stringify(arrInitialResults)
            });
            log.debug({
                title: LOG_TITLE, details: 'arrFinalResults count: ' + arrFinalResults.length
            });
            log.debug({
                title: LOG_TITLE, details: 'arrFinalResults: ' + JSON.stringify(arrFinalResults)
            });
            log.debug({title: LOG_TITLE, details: "===========END==========="});

            return arrFinalResults;
        }

        const map = (mapContext) => {
            const LOG_TITLE = "map";

            log.debug({title: LOG_TITLE, details: "===========START==========="});

            let objParseValues = parseJSON(mapContext.value);

            log.debug({
                title: LOG_TITLE, details: 'objParseValues: ' + JSON.stringify(objParseValues)
            });

            let stLocation = objParseValues.location;

            log.debug({
                title: LOG_TITLE, details: 'stLocation: ' + stLocation
            });

            let objLineIdData = objParseValues.lineIdData;

            log.debug({
                title: LOG_TITLE, details: 'objLineIdData length ' + objLineIdData.length
            });
            log.debug({
                title: LOG_TITLE, details: 'objLineIdData: ' + JSON.stringify(objLineIdData)
            });

            //Create Bin Put-Away Record
            let recBPW = record.create ({
                type: record.Type.BIN_WORKSHEET,
                isDynamic: true
            });

            recBPW.setValue({ fieldId: 'location', value: stLocation });

            let arrBins = [];

            for(let i = 0; i < objLineIdData.length; i++){
                log.debug({
                    title: LOG_TITLE, details: 'item: ' + objLineIdData[i].item
                });

                let iLineNumber = recBPW.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: objLineIdData[i].item
                });

                log.debug({
                    title: LOG_TITLE, details: 'iLineNumber: ' + iLineNumber
                });

                if(iLineNumber !== -1){
                    recBPW.selectLine({ sublistId: 'item', line: iLineNumber });

                    let objSubrecInvtryDetail = recBPW.getCurrentSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail'
                    });

                    objSubrecInvtryDetail.selectNewLine({
                        sublistId: 'inventoryassignment'
                    });

                    objSubrecInvtryDetail.setCurrentSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'quantity',
                        value: objLineIdData[i].quantity
                    });

                    log.debug({
                        title: LOG_TITLE, details: 'bin number: ' + objLineIdData[i].binnumber
                    });

                    let stBinId;
                    let iSearchBinIndex = arrBins.findIndex((bin) => bin.binNumber === objLineIdData[i].binnumber);

                    log.debug({
                        title: LOG_TITLE, details: 'iSearchBinIndex: ' + iSearchBinIndex
                    });

                    if(iSearchBinIndex === -1) {
                        let objBinSearch = search.create({
                            type: "bin",
                            filters: [
                                ["binnumber", "is", objLineIdData[i].binnumber],
                                "AND",
                                ["location", "anyof", stLocation]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    label: "Internal ID"
                                })
                            ]
                        });
                        objBinSearch.runPaged().count;
                        objBinSearch.run().each(function (result) {
                            stBinId = result.getValue({
                                name: 'internalid'
                            });
                            return true;
                        });

                        arrBins.push({
                            binNumber: objLineIdData[i].binnumber,
                            binId: stBinId
                        });

                    } else {
                        stBinId = arrBins[iSearchBinIndex].binId
                    }

                    log.debug({
                        title: LOG_TITLE, details: 'stBinId: ' + stBinId
                    });

                    if (!stBinId)
                        continue;

                    objSubrecInvtryDetail.setCurrentSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'binnumber',
                        value: stBinId
                    });

                    objSubrecInvtryDetail.commitLine({
                        sublistId: 'inventoryassignment'
                    });

                    recBPW.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: objLineIdData[i].quantity
                    });

                    recBPW.commitLine({ sublistId: 'item' });
                }
            }

            let stBpwId = recBPW.save();

            log.debug({
                title: LOG_TITLE, details: 'Bin Put-Away Worksheet Record Id ' + stBpwId
            });

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        const reduce = (reduceContext) => {

        }

        const summarize = (summaryContext) => {

        }

        return {getInputData, map} //, reduce, summarize

    });

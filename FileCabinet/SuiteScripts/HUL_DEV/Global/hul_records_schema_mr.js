/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * author: Jeremy Cady
 * Date: 01/22/2026
 * Version: 1.6.7
 */
define(["require", "exports", "N/log", "N/record", "N/email", "N/file"], function (require, exports, log, record, email, file) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    var SUPPORTED_RECORD_TYPES = [
        'salesorder',
        'invoice',
        'creditmemo',
        'customer',
        'inventoryitem',
        'noninventoryitem',
        'serviceitem',
        'assemblyitem',
        'kititem',
        'otherchargeitem',
        'paymentitem',
        'markupitem',
        'descriptionitem'
    ];
    var EMAIL_RECIPIENT = 'jcady@herculift.com';
    var KNOWN_SUBLIST_NOTES = {
        activities: 'FSM Task list; no sublist fields expected.'
    };
    /**
     * SuiteScript 2.x runtime does not support ES6 Set/Map.
     * Use plain object membership tables instead.
     */
    var KNOWN_CALCULATED_TOTAL_FIELDS = {
        item_total: true,
        time_total: true,
        expense_total: true,
        apply_total: true
    };
    var KNOWN_SYSTEM_PSEUDO_FIELDS = {
        sys_id: true
    };
    function isMember(table, key) {
        return Boolean(table[key]);
    }
    function endsWithTotal(fieldId) {
        if (fieldId.length < 6)
            return false;
        return fieldId.substr(fieldId.length - 6) === '_total';
    }
    function isFeatureDisabledError(e) {
        var msg = String(e);
        return (msg.indexOf('FEATURE_DISABLED') !== -1 ||
            (msg.indexOf('feature') !== -1 && msg.indexOf('not enabled') !== -1));
    }
    function getFeatureDisabledDetails(e) {
        return {
            code: 'FEATURE_DISABLED',
            message: String(e)
        };
    }
    function classifyFieldCategory(fieldId) {
        if (fieldId.indexOf('custpage_') === 0)
            return 'ui';
        if (fieldId.indexOf('_') === 0)
            return 'system';
        if (isMember(KNOWN_SYSTEM_PSEUDO_FIELDS, fieldId))
            return 'system';
        if (fieldId.indexOf('sys_') === 0)
            return 'system';
        return 'body';
    }
    function classifyNullMetadataReason(fieldId) {
        if (fieldId.indexOf('custpage_') === 0)
            return 'ui_only';
        if (isMember(KNOWN_SYSTEM_PSEUDO_FIELDS, fieldId) ||
            fieldId.indexOf('sys_') === 0 ||
            fieldId.indexOf('_') === 0) {
            return 'system_pseudo';
        }
        if (isMember(KNOWN_CALCULATED_TOTAL_FIELDS, fieldId) || endsWithTotal(fieldId)) {
            return 'calculated_total';
        }
        if (fieldId.indexOf('alternate') !== -1 || fieldId.indexOf('source') !== -1) {
            return 'feature_gated_or_unavailable';
        }
        return 'unknown';
    }
    var getInputData = function () {
        log.audit('Schema Registry', 'Starting schema extraction run');
        return SUPPORTED_RECORD_TYPES.map(function (recordType) { return ({
            recordType: recordType
        }); });
    };
    exports.getInputData = getInputData;
    var map = function (context) {
        var input = JSON.parse(context.value);
        context.write({
            key: input.recordType,
            value: input.recordType
        });
    };
    exports.map = map;
    var reduce = function (context) {
        var _a;
        var recordType = String(context.key);
        var rec;
        try {
            rec = record.create({
                type: recordType,
                isDynamic: false
            });
        }
        catch (e) {
            if (isFeatureDisabledError(e)) {
                var featureDetails = getFeatureDisabledDetails(e);
                log.audit('Record Type Unavailable (Feature Disabled)', {
                    recordType: recordType,
                    code: featureDetails.code
                });
                context.write({
                    key: recordType,
                    value: "SKIP:".concat(featureDetails.code)
                });
                return;
            }
            log.error({
                title: 'Record Creation Failed',
                details: { recordType: recordType, error: String(e) }
            });
            context.write({
                key: recordType,
                value: 'ERROR:Record creation failed'
            });
            return;
        }
        var rawFields = rec.getFields();
        var classifiedFields = {};
        for (var i = 0; i < rawFields.length; i++) {
            var rawFieldId = rawFields[i];
            var fieldIdStr = String(rawFieldId);
            var category = classifyFieldCategory(fieldIdStr);
            classifiedFields[fieldIdStr] = {
                category: category,
                metadataStatus: category === 'body' ? 'available' : 'unavailable'
            };
            if (category !== 'body') {
                classifiedFields[fieldIdStr].metadataUnavailableReason =
                    category === 'ui' ? 'ui_only' : 'system_pseudo';
                continue;
            }
            try {
                var f = rec.getField({ fieldId: rawFieldId });
                if (!f) {
                    var reason = classifyNullMetadataReason(fieldIdStr);
                    classifiedFields[fieldIdStr].metadataStatus = 'unavailable';
                    classifiedFields[fieldIdStr].metadataUnavailableReason = reason;
                    if (reason === 'unknown') {
                        log.debug({
                            title: 'Field Metadata Unavailable (Unknown Reason)',
                            details: { recordType: recordType, fieldId: fieldIdStr, error: 'getField() returned null' }
                        });
                    }
                    continue;
                }
                classifiedFields[fieldIdStr].type = String((_a = f.type) !== null && _a !== void 0 ? _a : 'unknown');
                if (f.label != null) {
                    classifiedFields[fieldIdStr].label = String(f.label);
                }
                if (f.isMandatory != null) {
                    classifiedFields[fieldIdStr].isMandatory = Boolean(f.isMandatory);
                }
                if (f.isDisabled != null) {
                    classifiedFields[fieldIdStr].isDisabled = Boolean(f.isDisabled);
                }
                if (f.displayType != null) {
                    classifiedFields[fieldIdStr].displayType = String(f.displayType);
                }
            }
            catch (e) {
                classifiedFields[fieldIdStr].metadataStatus = 'unavailable';
                classifiedFields[fieldIdStr].metadataUnavailableReason = 'unknown';
                log.debug({
                    title: 'Field Metadata Error',
                    details: { recordType: recordType, fieldId: fieldIdStr, error: String(e) }
                });
            }
        }
        var sublists = rec.getSublists();
        var sublistSchemas = {};
        for (var i = 0; i < sublists.length; i++) {
            var sid = String(sublists[i]);
            try {
                var fields = rec
                    .getSublistFields({ sublistId: sid })
                    .map(function (f) { return String(f); })
                    .sort();
                sublistSchemas[sid] = { fields: fields };
            }
            catch (e) {
                log.error({
                    title: 'Sublist Field Error',
                    details: { recordType: recordType, sublistId: sid, error: String(e) }
                });
                sublistSchemas[sid] = { fields: [] };
            }
        }
        var schema = {
            meta: {
                recordType: recordType,
                generatedAt: new Date().toISOString(),
                source: 'netsuite',
                method: 'record.create + getFields/getField + getSublists/getSublistFields',
                version: '1.6.7',
                availability: {
                    status: 'available'
                },
                notes: {
                    sublists: KNOWN_SUBLIST_NOTES,
                    limitations: [
                        'Select field options not extracted.',
                        'System/UI fields may lack metadata.',
                        'Sublist fields = IDs only.'
                    ]
                }
            },
            record: { type: recordType },
            fields: classifiedFields,
            sublists: sublistSchemas
        };
        var schemaFile = file.create({
            name: "".concat(recordType, ".schema.json"),
            fileType: file.Type.JSON,
            contents: JSON.stringify(schema, null, 2)
        });
        var saved = schemaFile.save();
        context.write({
            key: recordType,
            value: "FILE:".concat(String(saved))
        });
        log.audit('Schema File Saved', { recordType: recordType, fileId: saved });
    };
    exports.reduce = reduce;
    var summarize = function (summary) {
        var attachmentFileIds = [];
        var skippedRecordTypes = [];
        var errorRecordTypes = [];
        summary.output.iterator().each(function (key, value) {
            var recordType = String(key);
            var outcome = String(value);
            if (outcome.indexOf('FILE:') === 0) {
                attachmentFileIds.push(outcome.replace('FILE:', ''));
                return true;
            }
            if (outcome.indexOf('SKIP:') === 0) {
                skippedRecordTypes.push({
                    recordType: recordType,
                    reason: outcome.replace('SKIP:', '')
                });
                return true;
            }
            if (outcome.indexOf('ERROR:') === 0) {
                errorRecordTypes.push({
                    recordType: recordType,
                    reason: outcome.replace('ERROR:', '')
                });
                return true;
            }
            errorRecordTypes.push({
                recordType: recordType,
                reason: 'Unknown reduce outcome'
            });
            return true;
        });
        var attachments = [];
        for (var i = 0; i < attachmentFileIds.length; i++) {
            try {
                var f = file.load({ id: attachmentFileIds[i] });
                attachments.push(f);
            }
            catch (e) {
                log.error({
                    title: 'Attachment Load Failed',
                    details: { fileId: attachmentFileIds[i], error: String(e) }
                });
            }
        }
        var body = [
            'Schema export run completed.',
            '',
            'Each attached file includes field metadata, semantic classification, and sublists.',
            'These are intended for use in VS Code and Git.'
        ].join('\n');
        email.send({
            author: -5,
            recipients: EMAIL_RECIPIENT,
            replyTo: EMAIL_RECIPIENT,
            subject: 'NetSuite Schema Export — JSON Attachments (v1.6.7)',
            body: body,
            attachments: attachments
        });
        log.audit('Schema Email Sent', {
            requestedCount: SUPPORTED_RECORD_TYPES.length,
            schemaFilesCreated: attachmentFileIds.length,
            filesAttached: attachments.length,
            skippedCount: skippedRecordTypes.length,
            errorCount: errorRecordTypes.length
        });
    };
    exports.summarize = summarize;
});

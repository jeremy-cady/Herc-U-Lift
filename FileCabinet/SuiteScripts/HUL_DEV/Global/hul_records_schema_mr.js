/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * author: Jeremy Cady
 * Date: 01/21/2026
 * Version: 1.6.3
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
            log.error({
                title: 'Record Creation Failed',
                details: { recordType: recordType, error: String(e) }
            });
            return;
        }
        var rawFields = rec.getFields();
        var classifiedFields = {};
        for (var i = 0; i < rawFields.length; i++) {
            var rawFieldId = rawFields[i];
            var fieldIdStr = String(rawFieldId);
            var category = 'body';
            if (typeof rawFieldId === 'string') {
                if (rawFieldId.indexOf('custpage_') === 0)
                    category = 'ui';
                else if (rawFieldId.indexOf('_') === 0)
                    category = 'system';
            }
            classifiedFields[fieldIdStr] = { category: category };
            if (category !== 'body')
                continue;
            try {
                var f = rec.getField({ fieldId: rawFieldId });
                if (!f) {
                    log.debug({
                        title: 'Field Metadata Unavailable',
                        details: { recordType: recordType, fieldId: fieldIdStr, error: 'getField() returned null' }
                    });
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
                log.debug({
                    title: 'Field Metadata Error',
                    details: { recordType: recordType, fieldId: fieldIdStr, error: String(e) }
                });
            }
        }
        var sublists = rec.getSublists();
        var sublistSchemas = {};
        var KNOWN_SUBLIST_NOTES = {
            activities: 'FSM Task list; no sublist fields expected.'
        };
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
                version: '1.6.3',
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
            value: String(saved)
        });
        log.audit('Schema File Saved', { recordType: recordType, fileId: saved });
    };
    exports.reduce = reduce;
    var summarize = function (summary) {
        var schemaFileIds = [];
        summary.output.iterator().each(function (key, value) {
            schemaFileIds.push(String(value));
            return true;
        });
        var attachments = [];
        for (var i = 0; i < schemaFileIds.length; i++) {
            try {
                var f = file.load({ id: schemaFileIds[i] });
                attachments.push(f);
            }
            catch (e) {
                log.error({
                    title: 'Attachment Load Failed',
                    details: { fileId: schemaFileIds[i], error: String(e) }
                });
            }
        }
        email.send({
            author: -5,
            recipients: EMAIL_RECIPIENT,
            replyTo: EMAIL_RECIPIENT,
            subject: 'NetSuite Schema Export — JSON Attachments (v1.6.3)',
            body: "Attached are the schema exports for the following record types:\n".concat(SUPPORTED_RECORD_TYPES.map(function (r) { return "\u2022 ".concat(r); }).join('\n')
            // eslint-disable-next-line max-len
            , "\n\nEach file includes field metadata, classification, and sublists.\n\nThese are intended for use in VS Code and Git."),
            attachments: attachments
        });
        log.audit('Schema Email Sent', {
            schemaCount: schemaFileIds.length,
            filesAttached: attachments.length
        });
    };
    exports.summarize = summarize;
});

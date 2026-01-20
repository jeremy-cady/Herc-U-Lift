/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 01/19/2026
 * Version: 1.1
 */
define(["require", "exports", "N/log", "N/record", "N/email", "N/file"], function (require, exports, log, record, email, file) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    var RECORD_TYPES = [
        { recordType: 'salesorder' },
        { recordType: 'invoice' },
        { recordType: 'customer' },
        { recordType: 'item' }
    ];
    var EMAIL_RECIPIENT = 'jcady@herculift.com';
    /**
     * INPUT
     */
    var getInputData = function () {
        log.audit({
            title: 'Schema Registry',
            details: 'Starting schema extraction run'
        });
        return RECORD_TYPES;
    };
    exports.getInputData = getInputData;
    /**
     * MAP
     */
    var map = function (context) {
        var input = JSON.parse(context.value);
        context.write({
            key: input.recordType,
            value: input.recordType
        });
    };
    exports.map = map;
    /**
     * REDUCE
     * Builds and emails v1.2 schema for Sales Orders only
     *
     * Change (B): Adds BODY FIELD METADATA (types + a few safe attributes)
     * - field.type (NetSuite FieldType)
     * - field.label (when available)
     * - field.isMandatory (when available)
     * - field.isDisabled (when available)
     * - field.displayType (when available)
     *
     * Notes / Limits (intentional):
     * - We do NOT attempt to extract select "source list" or options (too heavy / unreliable).
     * - UI/system-prefixed fields may not resolve via getField(); those remain category-only.
     * - Sublists remain IDs-only for now (sublist field objects require line context and can be unreliable).
     */
    var reduce = function (context) {
        var recordType = String(context.key);
        // v1 scope: Sales Order only
        if (recordType !== 'salesorder') {
            return;
        }
        // Known notes (local, simple v1)
        var KNOWN_SUBLIST_NOTES = {
            activities: 'FSM Task list; no sublist fields expected.'
        };
        var rec = record.create({
            type: recordType,
            isDynamic: false
        });
        // -------- BODY FIELDS (CLASSIFIED + METADATA) --------
        var rawBodyFields = rec.getFields().slice().sort();
        var classifiedFields = {};
        rawBodyFields.forEach(function (rawFieldId) {
            var _a;
            var fieldId = String(rawFieldId);
            // Category classification
            var category = 'body';
            if (fieldId.indexOf('custpage_') === 0) {
                category = 'ui';
            }
            else if (fieldId.indexOf('_') === 0) {
                category = 'system';
            }
            // Default entry (category always included)
            classifiedFields[fieldId] = { category: category };
            // Only attempt field metadata for "body" fields.
            // UI/system fields often do not resolve through getField() on a created record.
            if (category !== 'body') {
                return;
            }
            try {
                var f = rec.getField({ fieldId: fieldId });
                // Field metadata is not guaranteed to be present for every field, so we guard each read.
                // (SuiteScript types may not expose all properties uniformly across field types.)
                classifiedFields[fieldId].type = String((_a = f.type) !== null && _a !== void 0 ? _a : 'unknown');
                var label = f.label;
                if (label !== undefined && label !== null) {
                    classifiedFields[fieldId].label = String(label);
                }
                var isMandatory = f.isMandatory;
                if (isMandatory !== undefined && isMandatory !== null) {
                    classifiedFields[fieldId].isMandatory = Boolean(isMandatory);
                }
                var isDisabled = f.isDisabled;
                if (isDisabled !== undefined && isDisabled !== null) {
                    classifiedFields[fieldId].isDisabled = Boolean(isDisabled);
                }
                var displayType = f.displayType;
                if (displayType !== undefined && displayType !== null) {
                    classifiedFields[fieldId].displayType = String(displayType);
                }
            }
            catch (e) {
                // If getField fails, keep category-only. No guessing.
                log.debug({
                    title: 'Field Metadata Unavailable',
                    details: {
                        recordType: recordType,
                        fieldId: fieldId,
                        error: String(e)
                    }
                });
            }
        });
        // -------- SUBLISTS (IDs-only + known notes) --------
        var sublists = rec.getSublists().slice().sort();
        var sublistSchemas = {};
        sublists.forEach(function (sublistId) {
            var sid = String(sublistId);
            try {
                var sublistFields = rec
                    .getSublistFields({ sublistId: sublistId })
                    .slice()
                    .sort()
                    .map(function (f) { return String(f); });
                sublistSchemas[sid] = { fields: sublistFields };
            }
            catch (e) {
                log.error({
                    title: 'Sublist Field Error',
                    details: {
                        recordType: recordType,
                        sublistId: sid,
                        error: String(e)
                    }
                });
                sublistSchemas[sid] = { fields: [] };
            }
        });
        // -------- SCHEMA OBJECT (v1.2) --------
        var schema = {
            meta: {
                recordType: recordType,
                generatedAt: new Date().toISOString(),
                source: 'netsuite',
                method: 'record.create + getFields/getField + getSublists/getSublistFields',
                version: '1.2',
                notes: {
                    sublists: KNOWN_SUBLIST_NOTES,
                    limitations: [
                        'Select field sources/options are not extracted.',
                        'UI/system-prefixed fields may not resolve metadata via getField().',
                        'Sublist fields are IDs-only (no sublist field metadata).'
                    ]
                }
            },
            record: {
                type: recordType
            },
            fields: classifiedFields,
            sublists: sublistSchemas
        };
        var serializedSchema = JSON.stringify(schema, null, 2);
        // -------- FILE ATTACHMENT --------
        var attachment = file.create({
            name: "".concat(recordType, ".schema.json"),
            fileType: file.Type.JSON,
            contents: serializedSchema
        });
        // -------- EMAIL DELIVERY --------
        email.send({
            author: -5,
            recipients: EMAIL_RECIPIENT,
            replyTo: EMAIL_RECIPIENT,
            subject: "NetSuite Schema Export \u2014 ".concat(recordType, " (v1.2)"),
            body: "Attached is the v1.2 schema export for the ".concat(recordType, " record.\n\n") +
                '• Field categories included (body | ui | system)\n' +
                '• Body field metadata included (type/label/mandatory/disabled/displayType when available)\n' +
                '• Sublists: IDs only\n' +
                "\u2022 Generated at ".concat(schema.meta.generatedAt, "\n\n") +
                'This file is intended for local use in VS Code and Git.',
            attachments: [attachment]
        });
        log.audit({
            title: 'Schema Email Sent',
            details: {
                recordType: recordType,
                recipient: EMAIL_RECIPIENT,
                bodyFieldCount: rawBodyFields.length,
                sublistCount: sublists.length
            }
        });
    };
    exports.reduce = reduce;
    /**
     * SUMMARIZE
     */
    var summarize = function (summary) {
        log.audit({
            title: 'Schema Registry Complete',
            details: {
                usage: summary.usage,
                concurrency: summary.concurrency,
                yields: summary.yields
            }
        });
        if (summary.inputSummary.error) {
            log.error({
                title: 'Input Error',
                details: summary.inputSummary.error
            });
        }
        summary.mapSummary.errors.iterator().each(function (key, error) {
            log.error({
                title: "Map Error: ".concat(key),
                details: error
            });
            return true;
        });
        summary.reduceSummary.errors.iterator().each(function (key, error) {
            log.error({
                title: "Reduce Error: ".concat(key),
                details: error
            });
            return true;
        });
    };
    exports.summarize = summarize;
});

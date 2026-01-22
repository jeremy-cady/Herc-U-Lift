/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * author: Jeremy Cady
 * Date: 01/22/2026
 * Version: 1.7.4
 *
 * Behavior:
 * - Schemas are persisted to File Cabinet folder 6223347
 * - One file per record type (overwrite-in-place semantics)
 * - Email is a run report only (no attachments)
 * - Custom segments (customrecord_cseg_*) intentionally excluded for now
 */
define(["require", "exports", "N/log", "N/record", "N/email", "N/file", "N/search"], function (require, exports, log, record, email, file, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    var EMAIL_RECIPIENT = 'jcady@herculift.com';
    /**
     * Canonical output location (single source of truth)
     */
    var OUTPUT_FOLDER_ID = 6223347;
    /**
     * Standard record types (NetSuite-native)
     */
    var STANDARD_RECORD_TYPES = [
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
    /**
     * Custom record types (account-specific)
     * NOTE: custom segments (customrecord_cseg_*) intentionally excluded per decision.
     */
    var CUSTOM_RECORD_TYPES = [
        'customrecord_nxc_asset_type',
        'customrecord_sna_county_list',
        'customrecord_sna_hul_csm_comm_plan',
        // eslint-disable-next-line max-len
        'customrecord_sna_hul_customerpricinggrou',
        'customrecord_sna_salesrep_matrix_mapping',
        'customrecord_nx_asset',
        'customrecord_nx_case_type',
        'customrecord_sna_group_code',
        'customrecord_sna_hul_hour_meter',
        'customrecord_hul_ar_summary',
        'customrecord_hul_script_registry',
        'customrecord_sna_hul_van_bin',
        'customrecord_sna_hul_internal_billing',
        'customrecord_sna_inventory_posting_group',
        'customrecord_sna_hul_itemcategory',
        'customrecord_sna_hul_itemdiscountgroup',
        'customrecord_sna_hul_itempricelevel',
        'customrecord_nxc_jsa',
        'customrecord_nxc_mr',
        'customrecord_sna_objects',
        'customrecord_sna_hul_pmpricingrate',
        'customrecord_sna_hul_rental_checklist',
        'customrecord_sna_hul_route_codes',
        'customrecord_sna_hul_sales_rep_comm_plan',
        'customrecord_sna_sales_rep_matrix',
        'customrecord116',
        'customrecord115',
        'customrecord_sna_sr_shell',
        'customrecord_sna_sales_zone',
        'customrecord_sna_hul_eq_cat',
        'customrecord_sna_hul_eq_model',
        'customrecord_sna_hul_posting_group',
        'customrecord_sna_hul_eq_mfr'
    ];
    var ALL_RECORD_TYPES = STANDARD_RECORD_TYPES.concat(CUSTOM_RECORD_TYPES);
    /**
     * SuiteScript-safe membership tables (no ES6 Set/Map)
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
        return fieldId.length > 5 && fieldId.slice(-6) === '_total';
    }
    /**
     * IMPORTANT: Only valid for record.create() failures.
     */
    function isFeatureDisabledError(e) {
        var msg = String(e);
        return (msg.indexOf('FEATURE_DISABLED') !== -1 ||
            (msg.indexOf('feature') !== -1 && msg.indexOf('not enabled') !== -1));
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
    function findExistingSchemaFileId(fileName) {
        var s = search.create({
            type: 'file',
            filters: [
                ['folder', 'anyof', OUTPUT_FOLDER_ID],
                'AND',
                ['name', 'is', fileName]
            ],
            columns: ['internalid']
        });
        var foundId = null;
        s.run().each(function (result) {
            foundId = String(result.getValue({ name: 'internalid' }));
            return false;
        });
        return foundId;
    }
    /**
     * Upsert the schema file:
     * - If it exists by name in the target folder, overwrite contents in place (save same internal ID).
     * - Otherwise create a new file in the folder.
     *
     * NOTE: NetSuite runtime allows mutating "contents" on a loaded file, but the TS typings do not.
     * We intentionally cast to any to keep overwrite semantics without duplicating files.
     */
    function upsertSchemaFile(fileName, jsonContents) {
        var existingId = findExistingSchemaFileId(fileName);
        if (existingId) {
            var existingFile = file.load({ id: existingId });
            existingFile.contents = jsonContents;
            return String(existingFile.save());
        }
        var created = file.create({
            name: fileName,
            fileType: file.Type.JSON,
            folder: OUTPUT_FOLDER_ID,
            contents: jsonContents
        });
        return String(created.save());
    }
    var getInputData = function () {
        log.audit('Schema Export Started', {
            version: '1.7.4',
            outputFolderId: OUTPUT_FOLDER_ID,
            standardRecordTypeCount: STANDARD_RECORD_TYPES.length,
            customRecordTypeCount: CUSTOM_RECORD_TYPES.length,
            totalRecordTypeCount: ALL_RECORD_TYPES.length
        });
        return ALL_RECORD_TYPES.map(function (recordType) { return ({
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
        var fileName = "".concat(recordType, ".schema.json");
        var rec;
        try {
            rec = record.create({
                type: recordType,
                isDynamic: false
            });
        }
        catch (e) {
            if (isFeatureDisabledError(e)) {
                log.audit('Record Type Skipped (Feature Disabled)', { recordType: recordType });
                context.write({ key: recordType, value: 'SKIP:FEATURE_DISABLED' });
                return;
            }
            log.error({
                title: 'Record Creation Failed',
                details: { recordType: recordType, error: String(e) }
            });
            context.write({ key: recordType, value: 'ERROR:Record creation failed' });
            return;
        }
        var classifiedFields = {};
        var rawFields = rec.getFields();
        for (var i = 0; i < rawFields.length; i++) {
            var rawFieldId = rawFields[i];
            var fieldIdStr = String(rawFieldId);
            var category = classifyFieldCategory(fieldIdStr);
            classifiedFields[fieldIdStr] = { category: category };
            if (category !== 'body') {
                classifiedFields[fieldIdStr].metadataUnavailableReason =
                    category === 'ui' ? 'ui_only' : 'system_pseudo';
                continue;
            }
            try {
                var f = rec.getField({ fieldId: rawFieldId });
                if (!f) {
                    classifiedFields[fieldIdStr].metadataUnavailableReason =
                        classifyNullMetadataReason(fieldIdStr);
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
                classifiedFields[fieldIdStr].metadataUnavailableReason = 'unknown';
                log.debug({
                    title: 'Field Metadata Error',
                    details: { recordType: recordType, fieldId: fieldIdStr, error: String(e) }
                });
            }
        }
        var sublistSchemas = {};
        var sublists = rec.getSublists();
        for (var i = 0; i < sublists.length; i++) {
            var sid = String(sublists[i]);
            try {
                sublistSchemas[sid] = {
                    fields: rec.getSublistFields({ sublistId: sid }).map(function (f) { return String(f); }).sort()
                };
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
                version: '1.7.4',
                outputFolderId: OUTPUT_FOLDER_ID,
                method: 'record.create + getFields/getField + getSublists/getSublistFields',
                recordTypeOrigin: recordType.indexOf('customrecord') === 0 ? 'custom' : 'standard'
            },
            record: { type: recordType },
            fields: classifiedFields,
            sublists: sublistSchemas
        };
        try {
            var savedId = upsertSchemaFile(fileName, JSON.stringify(schema, null, 2));
            log.audit('Schema Persisted', {
                recordType: recordType,
                fileName: fileName,
                fileId: savedId,
                folderId: OUTPUT_FOLDER_ID
            });
            context.write({ key: recordType, value: "FILE:".concat(savedId) });
        }
        catch (e) {
            log.error({
                title: 'Schema Persist Failed',
                details: { recordType: recordType, fileName: fileName, folderId: OUTPUT_FOLDER_ID, error: String(e) }
            });
            context.write({ key: recordType, value: 'ERROR:Schema persist failed' });
        }
    };
    exports.reduce = reduce;
    var summarize = function (summary) {
        var successes = [];
        var skips = [];
        var errors = [];
        summary.output.iterator().each(function (key, value) {
            var recordType = String(key);
            var outcome = String(value);
            if (outcome.indexOf('FILE:') === 0) {
                successes.push({ recordType: recordType, fileId: outcome.replace('FILE:', '') });
                return true;
            }
            if (outcome.indexOf('SKIP:') === 0) {
                skips.push({ recordType: recordType, reason: outcome.replace('SKIP:', '') });
                return true;
            }
            if (outcome.indexOf('ERROR:') === 0) {
                errors.push({ recordType: recordType, reason: outcome.replace('ERROR:', '') });
                return true;
            }
            errors.push({ recordType: recordType, reason: 'Unknown reduce outcome' });
            return true;
        });
        successes.sort(function (a, b) { return (a.recordType > b.recordType ? 1 : -1); });
        skips.sort(function (a, b) { return (a.recordType > b.recordType ? 1 : -1); });
        errors.sort(function (a, b) { return (a.recordType > b.recordType ? 1 : -1); });
        var requestedRecordList = ALL_RECORD_TYPES.map(function (r) { return "\u2022 ".concat(r); }).join('\n');
        var successList = successes.length > 0
            ? successes.map(function (s) { return "\u2022 ".concat(s.recordType, " \u2014 fileId ").concat(s.fileId); }).join('\n')
            : '• (none)';
        var skippedList = skips.length > 0
            ? skips.map(function (s) { return "\u2022 ".concat(s.recordType, " \u2014 ").concat(s.reason); }).join('\n')
            : '• (none)';
        var errorList = errors.length > 0
            ? errors.map(function (e) { return "\u2022 ".concat(e.recordType, " \u2014 ").concat(e.reason); }).join('\n')
            : '• (none)';
        var body = [
            'Schema export run completed.',
            '',
            "Output folder internal ID: ".concat(String(OUTPUT_FOLDER_ID)),
            '',
            "Standard record types: ".concat(String(STANDARD_RECORD_TYPES.length)),
            "Custom record types: ".concat(String(CUSTOM_RECORD_TYPES.length)),
            "Total record types: ".concat(String(ALL_RECORD_TYPES.length)),
            '',
            'Requested record types:',
            requestedRecordList,
            '',
            'Success (schema saved/updated in folder):',
            successList,
            '',
            'Skipped (unavailable in this account):',
            skippedList,
            '',
            'Errors (no file saved):',
            errorList,
            '',
            'This email is a run report only. Schemas are stored in the File Cabinet folder above.'
        ].join('\n');
        email.send({
            author: -5,
            recipients: EMAIL_RECIPIENT,
            replyTo: EMAIL_RECIPIENT,
            subject: 'NetSuite Schema Export — Run Report (v1.7.4)',
            body: body
        });
        log.audit('Schema Export Run Report Sent', {
            version: '1.7.4',
            requestedCount: ALL_RECORD_TYPES.length,
            successCount: successes.length,
            skippedCount: skips.length,
            errorCount: errors.length,
            folderId: OUTPUT_FOLDER_ID
        });
        if (summary.inputSummary && summary.inputSummary.error) {
            log.error({
                title: 'Input Error',
                details: summary.inputSummary.error
            });
        }
        if (summary.mapSummary && summary.mapSummary.errors) {
            summary.mapSummary.errors.iterator().each(function (key, err) {
                log.error({
                    title: 'Map Error',
                    details: { key: key, error: err }
                });
                return true;
            });
        }
        if (summary.reduceSummary && summary.reduceSummary.errors) {
            summary.reduceSummary.errors.iterator().each(function (key, err) {
                log.error({
                    title: 'Reduce Error',
                    details: { key: key, error: err }
                });
                return true;
            });
        }
    };
    exports.summarize = summarize;
});

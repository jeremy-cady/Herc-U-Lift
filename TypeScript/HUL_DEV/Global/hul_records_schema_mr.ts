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

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as record from 'N/record';
import * as email from 'N/email';
import * as file from 'N/file';
import * as search from 'N/search';

const EMAIL_RECIPIENT = 'jcady@herculift.com';

/**
 * Canonical output location (single source of truth)
 */
const OUTPUT_FOLDER_ID = 6223347;

type RecordSchemaInput = {
    recordType: string;
};

type FieldCategory = 'body' | 'ui' | 'system';

type FieldMetadataUnavailableReason =
    | 'ui_only'
    | 'system_pseudo'
    | 'calculated_total'
    | 'feature_gated_or_unavailable'
    | 'unknown';

/**
 * Standard record types (NetSuite-native)
 */
const STANDARD_RECORD_TYPES: string[] = [
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
const CUSTOM_RECORD_TYPES: string[] = [
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

const ALL_RECORD_TYPES: string[] = STANDARD_RECORD_TYPES.concat(CUSTOM_RECORD_TYPES);

/**
 * SuiteScript-safe membership tables (no ES6 Set/Map)
 */
const KNOWN_CALCULATED_TOTAL_FIELDS: { [fieldId: string]: true } = {
    item_total: true,
    time_total: true,
    expense_total: true,
    apply_total: true
};

const KNOWN_SYSTEM_PSEUDO_FIELDS: { [fieldId: string]: true } = {
    sys_id: true
};

function isMember(table: { [key: string]: true }, key: string): boolean {
    return Boolean(table[key]);
}

function endsWithTotal(fieldId: string): boolean {
    return fieldId.length > 5 && fieldId.slice(-6) === '_total';
}

/**
 * IMPORTANT: Only valid for record.create() failures.
 */
function isFeatureDisabledError(e: unknown): boolean {
    const msg = String(e);
    return (
        msg.indexOf('FEATURE_DISABLED') !== -1 ||
        (msg.indexOf('feature') !== -1 && msg.indexOf('not enabled') !== -1)
    );
}

function classifyFieldCategory(fieldId: string): FieldCategory {
    if (fieldId.indexOf('custpage_') === 0) return 'ui';
    if (fieldId.indexOf('_') === 0) return 'system';
    if (isMember(KNOWN_SYSTEM_PSEUDO_FIELDS, fieldId)) return 'system';
    if (fieldId.indexOf('sys_') === 0) return 'system';
    return 'body';
}

function classifyNullMetadataReason(fieldId: string): FieldMetadataUnavailableReason {
    if (fieldId.indexOf('custpage_') === 0) return 'ui_only';

    if (
        isMember(KNOWN_SYSTEM_PSEUDO_FIELDS, fieldId) ||
        fieldId.indexOf('sys_') === 0 ||
        fieldId.indexOf('_') === 0
    ) {
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

function findExistingSchemaFileId(fileName: string): string | null {
    const s = search.create({
        type: 'file',
        filters: [
            ['folder', 'anyof', OUTPUT_FOLDER_ID],
            'AND',
            ['name', 'is', fileName]
        ],
        columns: ['internalid']
    });

    let foundId: string | null = null;

    s.run().each((result) => {
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
function upsertSchemaFile(fileName: string, jsonContents: string): string {
    const existingId = findExistingSchemaFileId(fileName);

    if (existingId) {
        const existingFile = file.load({ id: existingId });
        (existingFile as any).contents = jsonContents;
        return String(existingFile.save());
    }

    const created = file.create({
        name: fileName,
        fileType: file.Type.JSON,
        folder: OUTPUT_FOLDER_ID,
        contents: jsonContents
    });

    return String(created.save());
}

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    log.audit('Schema Export Started', {
        version: '1.7.4',
        outputFolderId: OUTPUT_FOLDER_ID,
        standardRecordTypeCount: STANDARD_RECORD_TYPES.length,
        customRecordTypeCount: CUSTOM_RECORD_TYPES.length,
        totalRecordTypeCount: ALL_RECORD_TYPES.length
    });

    return ALL_RECORD_TYPES.map((recordType) => ({
        recordType
    }));
};

export const map: EntryPoints.MapReduce.map = (context) => {
    const input = JSON.parse(context.value) as RecordSchemaInput;

    context.write({
        key: input.recordType,
        value: input.recordType
    });
};

export const reduce: EntryPoints.MapReduce.reduce = (context) => {
    const recordType = String(context.key);
    const fileName = `${recordType}.schema.json`;

    let rec: record.Record;

    try {
        rec = record.create({
            type: recordType,
            isDynamic: false
        });
    } catch (e) {
        if (isFeatureDisabledError(e)) {
            log.audit('Record Type Skipped (Feature Disabled)', { recordType });
            context.write({ key: recordType, value: 'SKIP:FEATURE_DISABLED' });
            return;
        }

        log.error({
            title: 'Record Creation Failed',
            details: { recordType, error: String(e) }
        });
        context.write({ key: recordType, value: 'ERROR:Record creation failed' });
        return;
    }

    const classifiedFields: {
        [fieldId: string]: {
            category: FieldCategory;
            type?: string;
            label?: string;
            isMandatory?: boolean;
            isDisabled?: boolean;
            displayType?: string;
            metadataUnavailableReason?: FieldMetadataUnavailableReason;
        };
    } = {};

    const rawFields = rec.getFields();

    for (let i = 0; i < rawFields.length; i++) {
        const rawFieldId = rawFields[i];
        const fieldIdStr = String(rawFieldId);

        const category = classifyFieldCategory(fieldIdStr);

        classifiedFields[fieldIdStr] = { category };

        if (category !== 'body') {
            classifiedFields[fieldIdStr].metadataUnavailableReason =
                category === 'ui' ? 'ui_only' : 'system_pseudo';
            continue;
        }

        try {
            const f = rec.getField({ fieldId: rawFieldId as any });

            if (!f) {
                classifiedFields[fieldIdStr].metadataUnavailableReason =
                    classifyNullMetadataReason(fieldIdStr);
                continue;
            }

            classifiedFields[fieldIdStr].type = String((f as any).type ?? 'unknown');

            if ((f as any).label != null) {
                classifiedFields[fieldIdStr].label = String((f as any).label);
            }

            if ((f as any).isMandatory != null) {
                classifiedFields[fieldIdStr].isMandatory = Boolean((f as any).isMandatory);
            }

            if ((f as any).isDisabled != null) {
                classifiedFields[fieldIdStr].isDisabled = Boolean((f as any).isDisabled);
            }

            if ((f as any).displayType != null) {
                classifiedFields[fieldIdStr].displayType = String((f as any).displayType);
            }
        } catch (e) {
            classifiedFields[fieldIdStr].metadataUnavailableReason = 'unknown';

            log.debug({
                title: 'Field Metadata Error',
                details: { recordType, fieldId: fieldIdStr, error: String(e) }
            });
        }
    }

    const sublistSchemas: { [sublistId: string]: { fields: string[] } } = {};
    const sublists = rec.getSublists();

    for (let i = 0; i < sublists.length; i++) {
        const sid = String(sublists[i]);

        try {
            sublistSchemas[sid] = {
                fields: rec.getSublistFields({ sublistId: sid }).map((f) => String(f)).sort()
            };
        } catch (e) {
            log.error({
                title: 'Sublist Field Error',
                details: { recordType, sublistId: sid, error: String(e) }
            });

            sublistSchemas[sid] = { fields: [] };
        }
    }

    const schema = {
        meta: {
            recordType,
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
        const savedId = upsertSchemaFile(fileName, JSON.stringify(schema, null, 2));

        log.audit('Schema Persisted', {
            recordType,
            fileName,
            fileId: savedId,
            folderId: OUTPUT_FOLDER_ID
        });

        context.write({ key: recordType, value: `FILE:${savedId}` });
    } catch (e) {
        log.error({
            title: 'Schema Persist Failed',
            details: { recordType, fileName, folderId: OUTPUT_FOLDER_ID, error: String(e) }
        });

        context.write({ key: recordType, value: 'ERROR:Schema persist failed' });
    }
};

export const summarize: EntryPoints.MapReduce.summarize = (summary) => {
    const successes: { recordType: string; fileId: string }[] = [];
    const skips: { recordType: string; reason: string }[] = [];
    const errors: { recordType: string; reason: string }[] = [];

    summary.output.iterator().each((key, value) => {
        const recordType = String(key);
        const outcome = String(value);

        if (outcome.indexOf('FILE:') === 0) {
            successes.push({ recordType, fileId: outcome.replace('FILE:', '') });
            return true;
        }

        if (outcome.indexOf('SKIP:') === 0) {
            skips.push({ recordType, reason: outcome.replace('SKIP:', '') });
            return true;
        }

        if (outcome.indexOf('ERROR:') === 0) {
            errors.push({ recordType, reason: outcome.replace('ERROR:', '') });
            return true;
        }

        errors.push({ recordType, reason: 'Unknown reduce outcome' });
        return true;
    });

    successes.sort((a, b) => (a.recordType > b.recordType ? 1 : -1));
    skips.sort((a, b) => (a.recordType > b.recordType ? 1 : -1));
    errors.sort((a, b) => (a.recordType > b.recordType ? 1 : -1));

    const requestedRecordList = ALL_RECORD_TYPES.map((r) => `• ${r}`).join('\n');

    const successList = successes.length > 0
        ? successes.map((s) => `• ${s.recordType} — fileId ${s.fileId}`).join('\n')
        : '• (none)';

    const skippedList = skips.length > 0
        ? skips.map((s) => `• ${s.recordType} — ${s.reason}`).join('\n')
        : '• (none)';

    const errorList = errors.length > 0
        ? errors.map((e) => `• ${e.recordType} — ${e.reason}`).join('\n')
        : '• (none)';

    const body = [
        'Schema export run completed.',
        '',
        `Output folder internal ID: ${String(OUTPUT_FOLDER_ID)}`,
        '',
        `Standard record types: ${String(STANDARD_RECORD_TYPES.length)}`,
        `Custom record types: ${String(CUSTOM_RECORD_TYPES.length)}`,
        `Total record types: ${String(ALL_RECORD_TYPES.length)}`,
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
        body
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
        summary.mapSummary.errors.iterator().each((key, err) => {
            log.error({
                title: 'Map Error',
                details: { key, error: err }
            });
            return true;
        });
    }

    if (summary.reduceSummary && summary.reduceSummary.errors) {
        summary.reduceSummary.errors.iterator().each((key, err) => {
            log.error({
                title: 'Reduce Error',
                details: { key, error: err }
            });
            return true;
        });
    }
};
/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * author: Jeremy Cady
 * Date: 01/22/2026
 * Version: 1.6.7
 */

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as record from 'N/record';
import * as email from 'N/email';
import * as file from 'N/file';

const SUPPORTED_RECORD_TYPES: string[] = [
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

const EMAIL_RECIPIENT = 'jcady@herculift.com';

type RecordSchemaInput = {
    recordType: string;
};

type FieldCategory = 'body' | 'ui' | 'system';

type FieldMetadataStatus = 'available' | 'unavailable';

type FieldMetadataUnavailableReason =
    | 'ui_only'
    | 'system_pseudo'
    | 'calculated_total'
    | 'feature_gated_or_unavailable'
    | 'unknown';

type RecordAvailabilityStatus = 'available' | 'unavailable' | 'error';

type ReduceOutcomeValue =
    | `FILE:${string}`
    | `SKIP:${string}`
    | `ERROR:${string}`;

const KNOWN_SUBLIST_NOTES: { [sublistId: string]: string } = {
    activities: 'FSM Task list; no sublist fields expected.'
};

/**
 * SuiteScript 2.x runtime does not support ES6 Set/Map.
 * Use plain object membership tables instead.
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
    if (fieldId.length < 6) return false;
    return fieldId.substr(fieldId.length - 6) === '_total';
}

function isFeatureDisabledError(e: unknown): boolean {
    const msg = String(e);
    return (
        msg.indexOf('FEATURE_DISABLED') !== -1 ||
        (msg.indexOf('feature') !== -1 && msg.indexOf('not enabled') !== -1)
    );
}

function getFeatureDisabledDetails(e: unknown): { code: string; message: string } {
    return {
        code: 'FEATURE_DISABLED',
        message: String(e)
    };
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

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    log.audit('Schema Registry', 'Starting schema extraction run');

    return SUPPORTED_RECORD_TYPES.map((recordType) => ({
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

    let rec: record.Record;
    try {
        rec = record.create({
            type: recordType,
            isDynamic: false
        });
    } catch (e) {
        if (isFeatureDisabledError(e)) {
            const featureDetails = getFeatureDisabledDetails(e);

            log.audit('Record Type Unavailable (Feature Disabled)', {
                recordType,
                code: featureDetails.code
            });

            context.write({
                key: recordType,
                value: `SKIP:${featureDetails.code}` as ReduceOutcomeValue
            });

            return;
        }

        log.error({
            title: 'Record Creation Failed',
            details: { recordType, error: String(e) }
        });

        context.write({
            key: recordType,
            value: 'ERROR:Record creation failed' as ReduceOutcomeValue
        });

        return;
    }

    const rawFields = rec.getFields();

    const classifiedFields: {
        [fieldId: string]: {
            category: FieldCategory;
            metadataStatus: FieldMetadataStatus;
            metadataUnavailableReason?: FieldMetadataUnavailableReason;
            type?: string;
            label?: string;
            isMandatory?: boolean;
            isDisabled?: boolean;
            displayType?: string;
        };
    } = {};

    for (let i = 0; i < rawFields.length; i++) {
        const rawFieldId = rawFields[i];
        const fieldIdStr = String(rawFieldId);

        const category = classifyFieldCategory(fieldIdStr);

        classifiedFields[fieldIdStr] = {
            category,
            metadataStatus: category === 'body' ? 'available' : 'unavailable'
        };

        if (category !== 'body') {
            classifiedFields[fieldIdStr].metadataUnavailableReason =
                category === 'ui' ? 'ui_only' : 'system_pseudo';
            continue;
        }

        try {
            const f = rec.getField({ fieldId: rawFieldId as any });

            if (!f) {
                const reason = classifyNullMetadataReason(fieldIdStr);

                classifiedFields[fieldIdStr].metadataStatus = 'unavailable';
                classifiedFields[fieldIdStr].metadataUnavailableReason = reason;

                if (reason === 'unknown') {
                    log.debug({
                        title: 'Field Metadata Unavailable (Unknown Reason)',
                        details: { recordType, fieldId: fieldIdStr, error: 'getField() returned null' }
                    });
                }

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
            classifiedFields[fieldIdStr].metadataStatus = 'unavailable';
            classifiedFields[fieldIdStr].metadataUnavailableReason = 'unknown';

            log.debug({
                title: 'Field Metadata Error',
                details: { recordType, fieldId: fieldIdStr, error: String(e) }
            });
        }
    }

    const sublists = rec.getSublists();
    const sublistSchemas: { [sublistId: string]: { fields: string[] } } = {};

    for (let i = 0; i < sublists.length; i++) {
        const sid = String(sublists[i]);

        try {
            const fields = rec
                .getSublistFields({ sublistId: sid })
                .map((f) => String(f))
                .sort();

            sublistSchemas[sid] = { fields };
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
            method: 'record.create + getFields/getField + getSublists/getSublistFields',
            version: '1.6.7',
            availability: {
                status: 'available' as RecordAvailabilityStatus
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

    const schemaFile = file.create({
        name: `${recordType}.schema.json`,
        fileType: file.Type.JSON,
        contents: JSON.stringify(schema, null, 2)
    });

    const saved = schemaFile.save();

    context.write({
        key: recordType,
        value: `FILE:${String(saved)}` as ReduceOutcomeValue
    });

    log.audit('Schema File Saved', { recordType, fileId: saved });
};

export const summarize: EntryPoints.MapReduce.summarize = (summary) => {
    const attachmentFileIds: string[] = [];
    const skippedRecordTypes: { recordType: string; reason: string }[] = [];
    const errorRecordTypes: { recordType: string; reason: string }[] = [];

    summary.output.iterator().each((key, value) => {
        const recordType = String(key);
        const outcome = String(value);

        if (outcome.indexOf('FILE:') === 0) {
            attachmentFileIds.push(outcome.replace('FILE:', ''));
            return true;
        }

        if (outcome.indexOf('SKIP:') === 0) {
            skippedRecordTypes.push({
                recordType,
                reason: outcome.replace('SKIP:', '')
            });
            return true;
        }

        if (outcome.indexOf('ERROR:') === 0) {
            errorRecordTypes.push({
                recordType,
                reason: outcome.replace('ERROR:', '')
            });
            return true;
        }

        errorRecordTypes.push({
            recordType,
            reason: 'Unknown reduce outcome'
        });

        return true;
    });

    const attachments: file.File[] = [];

    for (let i = 0; i < attachmentFileIds.length; i++) {
        try {
            const f = file.load({ id: attachmentFileIds[i] });
            attachments.push(f);
        } catch (e) {
            log.error({
                title: 'Attachment Load Failed',
                details: { fileId: attachmentFileIds[i], error: String(e) }
            });
        }
    }

    const body = [
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
        body,
        attachments
    });

    log.audit('Schema Email Sent', {
        requestedCount: SUPPORTED_RECORD_TYPES.length,
        schemaFilesCreated: attachmentFileIds.length,
        filesAttached: attachments.length,
        skippedCount: skippedRecordTypes.length,
        errorCount: errorRecordTypes.length
    });
};
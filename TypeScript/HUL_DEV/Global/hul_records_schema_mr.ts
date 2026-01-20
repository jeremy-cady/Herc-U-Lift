/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 01/19/2026
 * Version: 1.1
 */

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as record from 'N/record';
import * as email from 'N/email';
import * as file from 'N/file';

type RecordSchemaInput = {
    recordType: string;
};

type FieldCategory = 'body' | 'ui' | 'system';

const RECORD_TYPES: RecordSchemaInput[] = [
    { recordType: 'salesorder' },
    { recordType: 'invoice' },
    { recordType: 'customer' },
    { recordType: 'item' }
];

const EMAIL_RECIPIENT = 'jcady@herculift.com';

/**
 * INPUT
 */
export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    log.audit({
        title: 'Schema Registry',
        details: 'Starting schema extraction run'
    });

    return RECORD_TYPES;
};

/**
 * MAP
 */
export const map: EntryPoints.MapReduce.map = (context) => {
    const input = JSON.parse(context.value) as RecordSchemaInput;

    context.write({
        key: input.recordType,
        value: input.recordType
    });
};

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
export const reduce: EntryPoints.MapReduce.reduce = (context) => {
    const recordType = String(context.key);

    // v1 scope: Sales Order only
    if (recordType !== 'salesorder') {
        return;
    }

    // Known notes (local, simple v1)
    const KNOWN_SUBLIST_NOTES: { [sublistId: string]: string } = {
        activities: 'FSM Task list; no sublist fields expected.'
    };

    const rec = record.create({
        type: recordType,
        isDynamic: false
    });

    // -------- BODY FIELDS (CLASSIFIED + METADATA) --------
    const rawBodyFields = rec.getFields().slice().sort();

    const classifiedFields: {
        [fieldId: string]: {
            category: FieldCategory;
            type?: string;
            label?: string;
            isMandatory?: boolean;
            isDisabled?: boolean;
            displayType?: string;
        };
    } = {};

    rawBodyFields.forEach((rawFieldId) => {
        const fieldId = String(rawFieldId);

        // Category classification
        let category: FieldCategory = 'body';
        if (fieldId.indexOf('custpage_') === 0) {
            category = 'ui';
        } else if (fieldId.indexOf('_') === 0) {
            category = 'system';
        }

        // Default entry (category always included)
        classifiedFields[fieldId] = { category };

        // Only attempt field metadata for "body" fields.
        // UI/system fields often do not resolve through getField() on a created record.
        if (category !== 'body') {
            return;
        }

        try {
            const f = rec.getField({ fieldId });

            // Field metadata is not guaranteed to be present for every field, so we guard each read.
            // (SuiteScript types may not expose all properties uniformly across field types.)
            classifiedFields[fieldId].type = String((f as any).type ?? 'unknown');

            const label = (f as any).label;
            if (label !== undefined && label !== null) {
                classifiedFields[fieldId].label = String(label);
            }

            const isMandatory = (f as any).isMandatory;
            if (isMandatory !== undefined && isMandatory !== null) {
                classifiedFields[fieldId].isMandatory = Boolean(isMandatory);
            }

            const isDisabled = (f as any).isDisabled;
            if (isDisabled !== undefined && isDisabled !== null) {
                classifiedFields[fieldId].isDisabled = Boolean(isDisabled);
            }

            const displayType = (f as any).displayType;
            if (displayType !== undefined && displayType !== null) {
                classifiedFields[fieldId].displayType = String(displayType);
            }
        } catch (e) {
            // If getField fails, keep category-only. No guessing.
            log.debug({
                title: 'Field Metadata Unavailable',
                details: {
                    recordType,
                    fieldId,
                    error: String(e)
                }
            });
        }
    });

    // -------- SUBLISTS (IDs-only + known notes) --------
    const sublists = rec.getSublists().slice().sort();

    const sublistSchemas: {
        [sublistId: string]: { fields: string[] };
    } = {};

    sublists.forEach((sublistId) => {
        const sid = String(sublistId);

        try {
            const sublistFields = rec
                .getSublistFields({ sublistId })
                .slice()
                .sort()
                .map((f) => String(f));

            sublistSchemas[sid] = { fields: sublistFields };
        } catch (e) {
            log.error({
                title: 'Sublist Field Error',
                details: {
                    recordType,
                    sublistId: sid,
                    error: String(e)
                }
            });

            sublistSchemas[sid] = { fields: [] };
        }
    });

    // -------- SCHEMA OBJECT (v1.2) --------
    const schema = {
        meta: {
            recordType,
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

    const serializedSchema = JSON.stringify(schema, null, 2);

    // -------- FILE ATTACHMENT --------
    const attachment = file.create({
        name: `${recordType}.schema.json`,
        fileType: file.Type.JSON,
        contents: serializedSchema
    });

    // -------- EMAIL DELIVERY --------
    email.send({
        author: -5,
        recipients: EMAIL_RECIPIENT,
        replyTo: EMAIL_RECIPIENT,
        subject: `NetSuite Schema Export — ${recordType} (v1.2)`,
        body:
            `Attached is the v1.2 schema export for the ${recordType} record.\n\n` +
            '• Field categories included (body | ui | system)\n' +
            '• Body field metadata included (type/label/mandatory/disabled/displayType when available)\n' +
            '• Sublists: IDs only\n' +
            `• Generated at ${schema.meta.generatedAt}\n\n` +
            'This file is intended for local use in VS Code and Git.',
        attachments: [attachment]
    });

    log.audit({
        title: 'Schema Email Sent',
        details: {
            recordType,
            recipient: EMAIL_RECIPIENT,
            bodyFieldCount: rawBodyFields.length,
            sublistCount: sublists.length
        }
    });
};

/**
 * SUMMARIZE
 */
export const summarize: EntryPoints.MapReduce.summarize = (summary) => {
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

    summary.mapSummary.errors.iterator().each((key, error) => {
        log.error({
            title: `Map Error: ${  key}`,
            details: error
        });
        return true;
    });

    summary.reduceSummary.errors.iterator().each((key, error) => {
        log.error({
            title: `Reduce Error: ${  key}`,
            details: error
        });
        return true;
    });
};
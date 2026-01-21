/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * author: Jeremy Cady
 * Date: 01/21/2026
 * Version: 1.6.3
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

    let rec;
    try {
        rec = record.create({
            type: recordType,
            isDynamic: false
        });
    } catch (e) {
        log.error({
            title: 'Record Creation Failed',
            details: { recordType, error: String(e) }
        });
        return;
    }

    const rawFields = rec.getFields();
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

    for (let i = 0; i < rawFields.length; i++) {
        const rawFieldId = rawFields[i];
        const fieldIdStr = String(rawFieldId);

        let category: FieldCategory = 'body';

        if (typeof rawFieldId === 'string') {
            if (rawFieldId.indexOf('custpage_') === 0) category = 'ui';
            else if (rawFieldId.indexOf('_') === 0) category = 'system';
        }

        classifiedFields[fieldIdStr] = { category };

        if (category !== 'body') continue;

        try {
            const f = rec.getField({ fieldId: rawFieldId as any });

            if (!f) {
                log.debug({
                    title: 'Field Metadata Unavailable',
                    details: { recordType, fieldId: fieldIdStr, error: 'getField() returned null' }
                });
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
            log.debug({
                title: 'Field Metadata Error',
                details: { recordType, fieldId: fieldIdStr, error: String(e) }
            });
        }
    }

    const sublists = rec.getSublists();
    const sublistSchemas: { [sublistId: string]: { fields: string[] } } = {};
    const KNOWN_SUBLIST_NOTES: { [sublistId: string]: string } = {
        activities: 'FSM Task list; no sublist fields expected.'
    };

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

    const schemaFile = file.create({
        name: `${recordType}.schema.json`,
        fileType: file.Type.JSON,
        contents: JSON.stringify(schema, null, 2)
    });

    const saved = schemaFile.save();

    context.write({
        key: recordType,
        value: String(saved)
    });

    log.audit('Schema File Saved', { recordType, fileId: saved });
};

export const summarize: EntryPoints.MapReduce.summarize = (summary) => {
    const schemaFileIds: string[] = [];

    summary.output.iterator().each((key, value) => {
        schemaFileIds.push(String(value));
        return true;
    });

    const attachments: file.File[] = [];

    for (let i = 0; i < schemaFileIds.length; i++) {
        try {
            const f = file.load({ id: schemaFileIds[i] });
            attachments.push(f);
        } catch (e) {
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
        body: `Attached are the schema exports for the following record types:\n${
            SUPPORTED_RECORD_TYPES.map((r) => `• ${r}`).join('\n')
        // eslint-disable-next-line max-len
        }\n\nEach file includes field metadata, classification, and sublists.\n\nThese are intended for use in VS Code and Git.`,
        attachments
    });

    log.audit('Schema Email Sent', {
        schemaCount: schemaFileIds.length,
        filesAttached: attachments.length
    });
};
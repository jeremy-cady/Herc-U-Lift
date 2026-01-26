define(['N/search'], function (search) {
    // Assumption: Equipment Sales Form uses standard 'item' sublist
    var ITEM_SUBLIST_ID = 'item';
    var OBJECT_FIELD_ID = 'custcol_sna_hul_fleet_no';
    var unwrap = function (value) {
        if (value == null) {
            return null;
        }
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return null;
            }
            var first = value[0];
            if (first && typeof first === 'object' && 'value' in first) {
                return first.value;
            }
            return first;
        }
        if (typeof value === 'object' && value && 'value' in value) {
            return value.value;
        }
        return value;
    };
    var fieldChanged = function (ctx) {
        try {
            if (!ctx || ctx.ignoreFieldChange === true) {
                return;
            }
            if (ctx.sublistId !== ITEM_SUBLIST_ID) {
                return;
            }
            if (ctx.fieldId !== OBJECT_FIELD_ID) {
                return;
            }
            var rec_1 = ctx.currentRecord;
            if (!rec_1) {
                return;
            }
            var objectId = unwrap(rec_1.getCurrentSublistValue({
                sublistId: ITEM_SUBLIST_ID,
                fieldId: OBJECT_FIELD_ID
            }));
            if (!objectId) {
                return;
            }
            var lookup_1 = search.lookupFields({
                type: 'customrecord_sna_objects',
                id: String(objectId),
                columns: [
                    'custrecord_sna_fleet_code',
                    'cseg_sna_hul_eq_seg',
                    'custrecord_sna_description',
                    'cseg_hul_mfg'
                ]
            });
            var mappings = [
                { src: 'custrecord_sna_fleet_code', dst: 'custcol_sna_po_fleet_code' },
                { src: 'cseg_sna_hul_eq_seg', dst: 'cseg_sna_hul_eq_seg' },
                { src: 'custrecord_sna_description', dst: 'description' },
                { src: 'cseg_hul_mfg', dst: 'cseg_hul_mfg' }
            ];
            mappings.forEach(function (m) {
                var val = unwrap(lookup_1[m.src]);
                if (val != null) {
                    rec_1.setCurrentSublistValue({
                        sublistId: ITEM_SUBLIST_ID,
                        fieldId: m.dst,
                        value: val,
                        ignoreFieldChange: true
                    });
                }
            });
        }
        catch (_a) {
            // Dispatcher pattern: fail open
        }
    };
    return {
        fieldChanged: fieldChanged
    };
});

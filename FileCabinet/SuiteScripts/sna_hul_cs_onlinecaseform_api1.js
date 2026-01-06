/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function fieldChanged_hideInitial(type, name, linenum) {

        if (name == 'custevent_sna_hul_caseassetsite' || name == 'custbody_sna_ob_type') {
            var jobcat = nlapiGetFieldValue('custbody_sna_job_category');
            var jobtype = nlapiGetFieldValues('custbody_sna_ob_type');

            // job type where disabled
            /*var custbody_timco_modelno = ['1', '5', '6'];
            var custbody_sna_assessment_requested = ['1', '2', '4', '5', '6'];
            var custbody_timco_ic = ['1', '3', '4', '5', '6'];
            var custbody_timco_fccid = ['2', '3', '4', '5', '6'];
            var custbody_sna_target_certification_date = ['1', '5', '6'];
            var custbody_sna_certifcation_deferral_dat = ['1', '5', '6'];
            var custrecord_sna_model_number = ['1', '5', '6'];
            var custrecord_sna_product_name = ['1', '2', '3', '5', '6'];
            var custrecord_sna_product_desc = ['4', '5', '6'];
            var custrecord_sna_technical_docu_id = ['1', '2', '4', '5', '6'];
            var custrecord_sna_trademark = ['1', '2', '5', '6'];
            var custrecord_sna_fcc_test_site = ['2', '3', '4', '5', '6'];
            var custrecord_sna_ised_test_site = ['1', '3', '4', '5', '6'];*/

            // job type where enabled
            /*var custbody_timco_modelno = ['2', '3', '4'];
            var custbody_sna_assessment_requested = ['3'];
            var custbody_timco_ic = ['2'];
            var custbody_timco_fccid = ['1'];
            var custbody_sna_target_certification_date = ['2', '3', '4'];
            var custbody_sna_certifcation_deferral_dat = ['2', '3', '4'];
            var custrecord_sna_model_number = ['2', '3', '4'];
            var custrecord_sna_product_name = ['4'];
            var custrecord_sna_product_desc = ['1', '2', '3'];
            var custrecord_sna_technical_docu_id = ['3'];
            var custrecord_sna_trademark = ['3', '4'];
            var custrecord_sna_fcc_test_site = ['1'];
            var custrecord_sna_ised_test_site = ['2'];*/

            // track if enabled
            var custbody_timco_modelno = false;
            var custbody_sna_assessment_requested = false;
            var custbody_timco_ic = false;
            var custbody_timco_fccid = false;
            var custbody_sna_target_certification_date = false;
            var custbody_sna_certifcation_deferral_dat = false;
            var custrecord_sna_model_number = false;
            var custrecord_sna_product_name = false;
            var custrecord_sna_product_desc = false;
            var custrecord_sna_technical_docu_id = false;
            var custrecord_sna_trademark = false;
            var custrecord_sna_fcc_test_site = false;
            var custrecord_sna_ised_test_site = false;

            // Certification, Testing, Testing & Certification
            if (jobcat == '1' || jobcat == '2' || jobcat == '4') {

                // FCC
                if (inArray('1', jobtype)) {
                    custbody_timco_fccid = true; // FCCID
                    if (jobcat != '2') {
                        custbody_sna_target_certification_date = true; // Target Certification Date
                        custbody_sna_certifcation_deferral_dat = true; // Certification Deferral Date
                    }
                    custrecord_sna_product_desc = true; // Product Description
                    custrecord_sna_fcc_test_site = true; // FCC Test Site Number(s)
                }
                // ISED
                if (inArray('2', jobtype)) {
                    custbody_timco_modelno = true; // Model
                    custbody_timco_ic = true; // IC
                    if (jobcat != '2' ) {
                        custbody_sna_target_certification_date = true; // Target Certification Date
                        custbody_sna_certifcation_deferral_dat = true; // Certification Deferral Date
                    }
                    custrecord_sna_model_number = true; // Model Number
                    custrecord_sna_product_desc = true; // Product Description
                    custrecord_sna_ised_test_site = true; // ISED Test Site Number(s)
                }
                // CE
                if (inArray('3', jobtype)) {
                    custbody_timco_modelno = true; // Model
                    custbody_sna_assessment_requested = true; // Assessment Requested For
                    if (jobcat != '2') {
                        custbody_sna_target_certification_date = true;; // Target Certification Date
                        custbody_sna_certifcation_deferral_dat = true;; // Certification Deferral Date
                    }
                    custrecord_sna_model_number = true; // Model Number
                    custrecord_sna_product_desc = true;; // Product Description
                    custrecord_sna_technical_docu_id = true;; // Technical Documentation ID
                    custrecord_sna_trademark = true;; // Trademark
                }
                // MiC
                if (inArray('4', jobtype)) {
                    custbody_timco_modelno = true; // Model
                    if (jobcat != '2') {
                        custbody_sna_target_certification_date = true; // Target Certification Date
                        custbody_sna_certifcation_deferral_dat = true;; // Certification Deferral Date
                    }
                    custrecord_sna_model_number = true; // Model Number
                    custrecord_sna_product_name = true; // Product Name
                    custrecord_sna_trademark = true; // Trademark
                }

                ////////////////////////////////////////////////////////////////////////////////////////////

                // Model
                if (!custbody_timco_modelno) {
                    nlapiDisableField('custbody_timco_modelno', true);
                }
                else {
                    nlapiDisableField('custbody_timco_modelno', false);
                }

                // Assessment Requested For
                if (!custbody_sna_assessment_requested) {
                    nlapiDisableField('custbody_sna_assessment_requested', true);
                }
                else {
                    nlapiDisableField('custbody_sna_assessment_requested', false);
                }

                // IC
                if (!custbody_timco_ic) {
                    nlapiDisableField('custbody_timco_ic', true);
                }
                else {
                    nlapiDisableField('custbody_timco_ic', false);
                }

                // FCCID
                if (!custbody_timco_fccid) {
                    nlapiDisableField('custbody_timco_fccid', true);
                }
                else {
                    nlapiDisableField('custbody_timco_fccid', false);
                }

                // Target Certification Date
                if (!custbody_sna_target_certification_date) {
                    nlapiDisableField('custbody_sna_target_certification_date', true);
                }
                else {
                    nlapiDisableField('custbody_sna_target_certification_date', false);
                }

                // Certification Deferral Date
                if (!custbody_sna_certifcation_deferral_dat) {
                    nlapiDisableField('custbody_sna_certifcation_deferral_dat', true);
                }
                else {
                    nlapiDisableField('custbody_sna_certifcation_deferral_dat', false);
                }

                // Model Number
                if (!custrecord_sna_model_number) {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_model_number', true);
                }
                else {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_model_number', false);
                }

                // Product Name
                if (!custrecord_sna_product_name) {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_product_name', true);
                }
                else {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_product_name', false);
                }

                // Product Description
                if (!custrecord_sna_product_desc) {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_product_desc', true);
                }
                else {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_product_desc', false);
                }

                // Technical Documentation ID
                if (!custrecord_sna_technical_docu_id) {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_technical_docu_id', true);
                }
                else {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_technical_docu_id', false);
                }

                // Trademark
                if (!custrecord_sna_trademark) {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_trademark', true);
                }
                else {
                    nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_trademark', false);
                }

                // FCC Test Site Number(s)
                if (!custrecord_sna_fcc_test_site) {
                    nlapiDisableLineItemField('recmachcustrecord_sna_online_customer', 'custrecord_sna_fcc_test_site', true);
                }
                else {
                    nlapiDisableLineItemField('recmachcustrecord_sna_online_customer', 'custrecord_sna_fcc_test_site', false);
                }

                // ISED Test Site Number(s)
                if (!custrecord_sna_ised_test_site) {
                    nlapiDisableLineItemField('recmachcustrecord_sna_online_customer', 'custrecord_sna_ised_test_site', true);
                }
                else {
                    nlapiDisableLineItemField('recmachcustrecord_sna_online_customer', 'custrecord_sna_ised_test_site', false);
                }
            }
            // Others
            else {
                nlapiDisableField('custbody_timco_modelno', true); // Model
                nlapiDisableField('custbody_sna_assessment_requested', true); // Assessment Requested For
                nlapiDisableField('custbody_timco_ic', true); // IC
                nlapiDisableField('custbody_timco_fccid', true); // FCCID
                nlapiDisableField('custbody_sna_target_certification_date', true); // Target Certification Date
                nlapiDisableField('custbody_sna_certifcation_deferral_dat', true); // Certification Deferral Date

                nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_model_number', true); // Model Number
                nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_product_name', true); // Product Name
                nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_product_desc', true); // Product Description
                nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_technical_docu_id', true); // Technical Documentation ID
                nlapiDisableLineItemField('recmachcustrecord_sna_product_so', 'custrecord_sna_trademark', true); // Trademark

                nlapiDisableLineItemField('recmachcustrecord_sna_online_customer', 'custrecord_sna_fcc_test_site', true); // FCC Test Site Number(s)
                nlapiDisableLineItemField('recmachcustrecord_sna_online_customer', 'custrecord_sna_ised_test_site', true); // ISED Test Site Number(s)
            }
        }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function pageInit_hideInitial(type) {
    var casetype = nlapiGetFieldValue('category');

    alert(casetype);

    if (isEmpty(casetype)) {
        nlapiDisableField('custevent_sna_hul_caseassetsite', true);
    }

}

// UTILITY FUNCTIONS
function inArray(stValue, arrValue) {
    for (var i = arrValue.length - 1; i >= 0; i--) {
        if (stValue == arrValue[i]) {
            break;
        }
    }
    return (i > -1);
}

function isEmpty(stValue) {
    return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
        for (var k in v)
            return false;
        return true;
    })(stValue)));
}
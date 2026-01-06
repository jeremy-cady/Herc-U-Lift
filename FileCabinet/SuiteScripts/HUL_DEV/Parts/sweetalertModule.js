/**
 * sweetalertModule.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['./sweetalert2.all'], function (Swal) {
    
    function doNotInvoiceDummyItemSwalMessage() {
        console.log('Calling SweetAlert v2');
        
        setTimeout(function() {
            Swal.fire({
                icon: 'warning',
                title: 'BOGUS Item Cannot Be Invoiced',
                html: 'Bogus Item is an invalid item and must be removed before invoicing. Please see Parts to have removed.',
                confirmButtonText: 'OK',
                zIndex: 999999
            });
        }, 1000);
    }

    function partsIsEligibleSwalMessage(altPartName) {
        console.log('Calling parts eligible message');
        
        setTimeout(function() {
            var htmlMessage = altPartName ? 
                'Item is not eligible for sale.<br>Please add the following part instead:<br><span style="color:red">' + altPartName + '</span>' :
                'Item is not eligible for sale.<br>Check User Notes On Item Record';
                
            Swal.fire({
                icon: 'warning',
                title: 'Not Eligible For Resale',
                html: htmlMessage,
                confirmButtonText: 'OK',
                zIndex: 999999
            });
        }, 1000);
    }

    function customerCreditCardRequiredMessage() {
        console.log('Calling credit card required message');
        
        setTimeout(function() {
            Swal.fire({
                icon: 'warning',
                title: 'Credit Card Required',
                html: 'This Customer does not have a Credit Card on file. Their purchasing terms require that a Credit Card be on file. Please add a Payment Card before continuing.',
                confirmButtonText: 'OK',
                zIndex: 999999
            });
        }, 500);
    }

    return {
        doNotInvoiceDummyItemSwalMessage: doNotInvoiceDummyItemSwalMessage,
        partsIsEligibleSwalMessage: partsIsEligibleSwalMessage,
        customerCreditCardRequiredMessage: customerCreditCardRequiredMessage
    };
});
/* eslint-disable max-len */
/**
 * sweetalertModule.ts
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

// Declare Swal as external dependency (v2 syntax)
declare const Swal: {
    fire(options: {
        icon?: 'warning' | 'error' | 'success' | 'info';
        title: string;
        html?: string;
        text?: string;
        confirmButtonText?: string;
        zIndex?: number;
    }): void;
};

export function partsIsEligibleSwalMessage(altPartName?: string): void {
    console.log('Calling parts eligible message');

    setTimeout(() => {
        const htmlMessage = altPartName ?
            `Item is not eligible for sale.<br>Please add the following part instead:<br><span style="color:red">${altPartName}</span>` :
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

export function doNotInvoiceDummyItemSwalMessage(): void {
    console.log('Calling SweetAlert v2');
    setTimeout(() => {
        Swal.fire({
            icon: 'warning',
            title: 'BOGUS Item Cannot Be Invoiced',
            html: 'Bogus Item is an invalid item and must be removed before invoicing. Please see Parts to have removed.',
            confirmButtonText: 'OK',
            zIndex: 999999
        });
    }, 1000);
}

export function customerCreditCardRequiredMessage(): void {
    console.log('Calling credit card required message');

    setTimeout(() => {
        Swal.fire({
            icon: 'warning',
            title: 'Credit Card Required',
            html: 'This Customer does not have a Credit Card on file. Their purchasing terms require that a Credit Card be on file. Please add a Payment Card before continuing.',
            confirmButtonText: 'OK',
            zIndex: 999999
        });
    }, 500);
}
/**
 * @NApiVersion 2.1
 */
define(['N/ui/dialog'],
/**
 * @param{dialog} dialog
 */ (dialog) => {

        const sayIt = () => {
            dialog.alert({
                title: 'WASSUP',
                message: 'This is the message that goes with the title.'
            });
        };

        return { sayIt };

    });

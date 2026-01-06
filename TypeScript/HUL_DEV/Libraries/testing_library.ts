/**
 * test_library
 * @NApiVersion 2.x
 */

import * as dialog from 'N/ui/dialog';

const sayTheThing = () => {
    dialog.alert({
        title: 'HOLY CRAP IT WORKED',
        message: 'I can\'t believe this actually worked'
    });

    return sayTheThing;
};
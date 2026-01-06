/**
* @NApiVersion 2.x
* @NScriptType Suitelet
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/03/2024
* Version: 1.0
*/
define(["require", "exports", "N/log"], function (require, exports, log) {
    "use strict";
    /**
    * Definition of the Suitelet script trigger point.
    * @param {Object} context
    * @param {ServerRequest} context.request - Encapsulation of the incoming request
    * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
    * @Since 2015.2
    */
    function onRequest(ctx) {
        var message = 'What up sucka';
        log.debug('made it to suitelet', message);
    }
    return { onRequest: onRequest };
});

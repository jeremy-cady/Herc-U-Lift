/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/record'], function(record) {
  function post(request) {
    var caseId = request.caseId;
    var fileId = request.fileId;
    var recordType = request.recordType || 'supportcase'; // Default to supportcase for backward compatibility
    var recordId = request.recordId || caseId; // Support both caseId (legacy) and recordId
    
    if (!recordId || !fileId) {
      return { success: false, error: 'Missing recordId/caseId or fileId' };
    }
    
    try {
      record.attach({
        record: {
          type: 'file',
          id: fileId
        },
        to: {
          type: recordType,
          id: recordId
        }
      });
      
      return {
        success: true,
        message: 'File attached successfully',
        caseId: caseId, // Keep for backward compatibility
        recordId: recordId,
        fileId: fileId,
        recordType: recordType
      };
    } catch (e) {
      return {
        success: false,
        error: e.message
      };
    }
  }
  return {
    post: post
  };
});
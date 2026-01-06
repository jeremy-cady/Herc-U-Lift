/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 *
 *
 * @author noe de jesus
 * @description deletes record basing by using the provided saved search
 *
 */
define(['N/search', 'N/record', 'N/runtime', 'N/email', 'N/file', 'N/config', './shared/sna_hul_mod_utils'], function (
  search,
  record,
  runtime,
  email,
  file,
  config,
  SNA_UTILS,
) {
  const { isEmpty } = SNA_UTILS;

  function getInputData(context) {
    try {
      const script = runtime.getCurrentScript();
      const searchId = script.getParameter({ name: 'custscript_sna_hul_deletion_reference' });
      log.audit({
        title: 'SEARCH_ID',
        details: searchId,
      });
      if (isEmpty(searchId)) {
        log.error({
          title: 'MISSING_SAVED_SEARCH_PARAMETER',
          details: 'No saved search parameter was defined for this script deployment.',
        });
        return;
      }

      const searchObj = search.load({ id: searchId });
      return searchObj;
    }
    catch (err) {
      log.error({
        title: 'getInputData:UNEXPECTED_ERROR',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  function map(context) {
    const result = JSON.parse(context.value);
    const { values } = result;
    record.delete
      .promise({
        type: result.recordType,
        id: result.id,
      })
      .then(() => {
        log.audit('RECORD_DELETED', {
          recordId: result.id,
          values,
        });
        context.write({
          key: result.id,
          value: values,
        });
      })
      .catch((err) => {
        log.error({
          title: 'map:ERROR_IN_RECORD_DELETION',
          details: {
            message: err.message,
            stack: err.stack,
          },
        });
      });
  }

  function summarize(summary) {
    try {
      const script = runtime.getCurrentScript();
      const recipients = script.getParameter({ name: 'custscript_sna_hul_deletion_recipients' });
      log.audit({ title: 'EMAIL_RECIPIENTS', details: recipients });
      log.debug({
        title: '[Summarize]',
        details: JSON.stringify(summary.inputSummary),
      });

      let counter = 1;
      let totalRows = 0;
      let deletedRecords = 0;
      let recordsTable = '';
      summary.output.iterator().each((recordId, value) => {
        recordsTable += `<tr style="background-color:#ffffff;">
                    <td style="padding:12px;">${counter}</td>
                    <td style="padding:12px;">${recordId}</td>
                    <td style="padding:12px;">${value}</td>
                  </tr>`;
        deletedRecords++;
        counter++;
        totalRows++;
        return true;
      });

      if (recordsTable.length == 0) {
        recordsTable = `<tr style="background-color:#fff1f2;">
                    <td colspan="4" style="padding:12px;">No records were processed</td>
                  </tr>`;
      }

      counter = 1;
      let errorTable = '';
      summary.mapSummary.errors.iterator().each(function (key, err, executionNo) {
        errorTable += `<tr style="background-color:#fff1f2;">
                    <td style="padding:12px;">${counter}</td>
                    <td style="padding:12px;">${err.name}</td>
                    <td style="padding:12px;">${err.message}</td>
                    <td style="padding:12px;">${err.stack}</span></td>
                    <td style="padding:12px; color:#dc2626;">${executionNo}</td>
                  </tr>`;
        counter++;
        totalRows++;
        return true;
      });

      if (errorTable.length == 0) {
        errorTable = `<tr style="background-color:#fff1f2;">
                    <td colspan="5" style="padding:12px;">No errors logged</td>
                  </tr>`;
      }

      const searchId = script.getParameter({ name: 'custscript_sna_hul_deletion_reference' });
      const searchObj = search.load({ id: searchId });
      const remainingRecords = searchObj.runPaged().count;
      const templateFile = file.load({ id: './custom-templates/record-deletion.html' });
      let htmlString = templateFile.getContents();
      const companyInfo = config.load({ type: config.Type.COMPANY_INFORMATION });
      const summaryTable = `Last Run: ${new Date().toDateString()}<br/>
Remaining Records to be Processed: ${remainingRecords}<br/>
Map Stage Total Time (seconds): ${summary.mapSummary.seconds}<br/>
Total Records Processed: ${deletedRecords}<br/>
Search Id: ${searchId}`;
      const contents = {
        current_year: new Date().getFullYear(),
        company_name: companyInfo.getValue({ fieldId: 'companyname' }),
        records_table: recordsTable,
        errors_table: errorTable,
        summary_table: summaryTable,
      };
      Object.keys(contents).forEach((contentId) => {
        htmlString = htmlString.replace(`{{${contentId}}}`, contents[contentId]);
      });

      const emailAuthor = script.getParameter({ name: 'custscript_sn_hul_email_author' });
      email.send
        .promise({
          author: emailAuthor || 3548422,
          recipients: recipients.split(','),
          subject: 'Record Deletion Summary',
          body: htmlString,
        })
        .then(() => {
          log.audit('EMAIL_SENT');
        });
    }
    catch (err) {
      log.error({
        title: 'sumarize:UNEXPECTED_ERROR',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  return {
    getInputData,
    map,
    summarize,
  };
});

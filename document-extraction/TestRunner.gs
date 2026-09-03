/**
 * Immediate test runner.
 * Run runExtractionTests() in Apps Script and inspect Executions/Logs.
 */
function runExtractionTests() {
  var tests = [
    {
      name: 'Letter / Memo',
      text: [
        'TO : Legal Unit',
        'FROM : Procurement Unit',
        'SUBJECT : REQUEST FOR LEGAL CLARIFICATION ON THE SUBMISSION OF OMNIBUS SWORN STATEMENT (OSS)',
        'DATE: August 14, 2026',
        '',
        'I. Background',
        'The Procurement Unit respectfully requests the Legal Unit\'s clarification.'
      ].join('\n')
    },
    {
      name: 'Purchase Order',
      text: [
        'PURCHASE ORDER',
        'PO No.: 26-08-001',
        'ABC MEDICAL SUPPLIES',
        'Date: August 12, 2026',
        'Procurement Unit',
        'Item Description    Quantity    Amount',
        'Medical Supplies    10          50,000.00'
      ].join('\n')
    },
    {
      name: 'Purchase Request',
      text: [
        'PURCHASE REQUEST',
        'PR No. 2026-00125',
        'Office: Procurement Unit',
        'Date: 08/11/2026',
        'Requested Items',
        'Medical equipment and supplies'
      ].join('\n')
    },
    {
      name: 'Mayor\'s Permit',
      text: [
        'REPUBLIC OF THE PHILIPPINES',
        'CITY GOVERNMENT',
        'MAYOR\'S PERMIT',
        'Business Name: SAMPLE ENTERPRISE',
        'Permit No.: 2026-12345',
        'Issued: August 10, 2026',
        'Valid Until: December 31, 2026'
      ].join('\n')
    },
    {
      name: 'Unstructured document',
      text: [
        'ZAMBOANGA CITY MEDICAL CENTER',
        'REQUEST FOR DOCUMENTARY CLARIFICATION',
        '',
        'Please provide clarification regarding the required supporting documents.',
        'August 9, 2026'
      ].join('\n')
    }
  ];

  var output = tests.map(function(test) {
    var extracted = extractDocumentInformation(test.text);
    return {
      test: test.name,
      extracted: extracted
    };
  });

  Logger.log(JSON.stringify(output, null, 2));
  return output;
}

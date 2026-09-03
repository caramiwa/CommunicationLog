/**
 * Document Extraction Prototype — Phase 1
 *
 * Purpose:
 *   Parse OCR-like document text into fields useful to the Communication log.
 *
 * This phase deliberately does NOT read Drive files or modify AppSheet data.
 * It only tests extraction/parsing logic.
 *
 * Rules:
 *   - Never invent a value.
 *   - Prefer explicit labels (TO, FROM, SUBJECT, DATE).
 *   - If a field cannot be identified with reasonable confidence, return blank.
 *   - Existing Communication values are never overwritten (see mergeExtractedFields).
 */

function extractDocumentInformation(text) {
  text = normalizeOcrText_(text);

  return {
    dateOfDocument: extractDate_(text),
    subject: extractLabeledField_(text, ['SUBJECT', 'RE:', 'RE']),
    from: extractLabeledField_(text, ['FROM']),
    to: extractLabeledField_(text, ['TO', 'ATTN', 'ATTENTION']),
    prominentText: extractProminentText_(text)
  };
}

/**
 * Merge extraction results into an existing Communication record.
 * Existing non-empty values always win.
 */
function mergeExtractedFields(existing, extracted) {
  existing = existing || {};
  extracted = extracted || {};

  return {
    dateOfDocument: isBlank_(existing.dateOfDocument)
      ? (extracted.dateOfDocument || '')
      : existing.dateOfDocument,
    subject: isBlank_(existing.subject)
      ? (extracted.subject || '')
      : existing.subject,
    from: isBlank_(existing.from)
      ? (extracted.from || '')
      : existing.from,
    to: isBlank_(existing.to)
      ? (extracted.to || '')
      : existing.to
  };
}

function normalizeOcrText_(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractLabeledField_(text, labels) {
  var lines = text.split('\n');

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    for (var j = 0; j < labels.length; j++) {
      var label = labels[j];
      var pattern = new RegExp('^' + escapeRegExp_(label) + '\\s*[:\\-]?\\s*(.+)$', 'i');
      var match = line.match(pattern);

      if (match && match[1]) {
        var value = cleanFieldValue_(match[1]);
        if (value) return value;
      }
    }
  }

  return '';
}

function extractDate_(text) {
  var lines = text.split('\n');

  // First preference: explicitly labelled date.
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var labelled = line.match(/^DATE\s*[:\-]?\s*(.+)$/i);
    if (labelled && labelled[1]) {
      var dateValue = cleanFieldValue_(labelled[1]);
      if (dateValue) return dateValue;
    }
  }

  // Second preference: a date-looking value near the beginning of the document.
  // We return the original text rather than guessing a normalized date format.
  var datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b|\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/i;
  for (var k = 0; k < Math.min(lines.length, 20); k++) {
    var match = lines[k].match(datePattern);
    if (match) return match[0].trim();
  }

  return '';
}

/**
 * Conservative fallback for documents without standard correspondence labels.
 * We only return a short, prominent-looking line from the header area.
 * This is NOT treated as the Subject automatically by this prototype.
 */
function extractProminentText_(text) {
  var lines = text.split('\n');
  var candidates = [];

  for (var i = 0; i < Math.min(lines.length, 20); i++) {
    var line = lines[i].trim();
    if (!line || line.length < 4) continue;
    if (/^(TO|FROM|SUBJECT|DATE|ATTN|ATTENTION)\b/i.test(line)) continue;
    if (/^page\s+\d+/i.test(line)) continue;

    // Prominent text is more likely to be short and visually isolated.
    if (line.length <= 160) candidates.push(line);
  }

  return candidates.length ? candidates[0] : '';
}

function cleanFieldValue_(value) {
  return String(value || '')
    .replace(/^[\s:;\-]+/, '')
    .replace(/[\s;]+$/, '')
    .trim();
}

function escapeRegExp_(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isBlank_(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

/**
 * Manual Phase 1 test using the sample correspondence supplied during design.
 * Run testDocumentExtractionPrototype() from the Apps Script editor.
 */
function testDocumentExtractionPrototype() {
  var sample = [
    'TO : Legal Unit',
    'FROM : Procurement Unit',
    'SUBJECT : REQUEST FOR LEGAL CLARIFICATION ON THE SUBMISSION OF OMNIBUS SWORN STATEMENT (OSS) FOR PURCHASE ORDERS ISSUED PURSUANT TO A SINGLE PROCUREMENT PROJECT AND AWARD',
    'DATE: August 14, 2026',
    '',
    'I. Background',
    'The Procurement Unit respectfully requests the Legal Unit\'s clarification regarding the documentary requirement.'
  ].join('\n');

  var result = extractDocumentInformation(sample);
  Logger.log(JSON.stringify(result, null, 2));

  var existing = {
    dateOfDocument: '',
    subject: 'USER ENTERED SUBJECT',
    from: '',
    to: ''
  };

  Logger.log(JSON.stringify(mergeExtractedFields(existing, result), null, 2));
}

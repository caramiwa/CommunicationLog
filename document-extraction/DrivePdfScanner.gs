/**
 * Drive PDF/Image Scanner — Phase 2
 *
 * Reads an existing PDF/image in Google Drive, converts it to a temporary
 * Google Doc using Drive OCR, extracts the text, then passes that text to
 * extractDocumentInformation().
 *
 * The source file is never modified.
 * The temporary OCR document is trashed after extraction.
 */

function scanDriveDocument(fileIdOrUrl) {
  var fileId = extractDriveFileId_(fileIdOrUrl);
  if (!fileId) {
    throw new Error('Enter a valid Google Drive file ID or Drive URL.');
  }

  var sourceFile = DriveApp.getFileById(fileId);
  var sourceBlob = sourceFile.getBlob();
  var sourceName = sourceFile.getName();
  var sourceMimeType = sourceBlob.getContentType();

  if (!isSupportedDocument_(sourceMimeType, sourceName)) {
    throw new Error('Supported files: PDF, JPG, JPEG, PNG, GIF, WEBP.');
  }

  var tempDocId = null;

  try {
    var tempDoc = Drive.Files.create(
      {
        name: '[TEMP OCR] ' + sourceName,
        mimeType: 'application/vnd.google-apps.document'
      },
      sourceBlob,
      {
        fields: 'id,name,mimeType',
        ocrLanguage: 'en'
      }
    );

    tempDocId = tempDoc.id;

    // OCR/conversion can take a moment before the Google Doc is readable.
    var ocrText = waitForOcrText_(tempDocId, 8, 1000);
    var extracted = extractDocumentInformation(ocrText);

    return {
      success: true,
      sourceFile: {
        id: fileId,
        name: sourceName,
        mimeType: sourceMimeType,
        url: sourceFile.getUrl()
      },
      ocr: {
        textLength: ocrText.length,
        text: ocrText
      },
      extracted: extracted
    };
  } finally {
    if (tempDocId) {
      try {
        DriveApp.getFileById(tempDocId).setTrashed(true);
      } catch (cleanupError) {
        console.warn('OCR cleanup failed: ' + cleanupError);
      }
    }
  }
}

function waitForOcrText_(docId, attempts, delayMs) {
  var lastText = '';

  for (var i = 0; i < attempts; i++) {
    try {
      lastText = DocumentApp.openById(docId).getBody().getText().trim();
      if (lastText) return lastText;
    } catch (error) {
      // The converted document may not be readable yet.
    }
    Utilities.sleep(delayMs);
  }

  return lastText;
}

/**
 * Quick editor test.
 * Replace TEST_FILE_ID with an actual Drive file ID, then run this function.
 */
function testRealDriveDocument() {
  var TEST_FILE_ID = 'PASTE_YOUR_DRIVE_FILE_ID_HERE';

  if (TEST_FILE_ID === 'PASTE_YOUR_DRIVE_FILE_ID_HERE') {
    throw new Error('Replace TEST_FILE_ID with the ID of an actual PDF/image in Drive.');
  }

  var result = scanDriveDocument(TEST_FILE_ID);

  Logger.log('SOURCE: ' + result.sourceFile.name);
  Logger.log('--- OCR TEXT ---\n' + result.ocr.text);
  Logger.log('--- EXTRACTED FIELDS ---\n' + JSON.stringify(result.extracted, null, 2));

  return result;
}

function extractDriveFileId_(value) {
  var text = String(value || '').trim();
  if (!text) return '';

  if (/^[a-zA-Z0-9_-]{20,}$/.test(text)) return text;

  var match = text.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (match) return match[1];

  match = text.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (match) return match[1];

  return '';
}

function isSupportedDocument_(mimeType, fileName) {
  var supported = {
    'application/pdf': true,
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true
  };

  if (supported[mimeType]) return true;
  return /\.(pdf|jpe?g|png|gif|webp)$/i.test(String(fileName || ''));
}

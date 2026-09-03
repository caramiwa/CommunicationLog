/**
 * Document Extraction Web App — Phase 2
 *
 * Reads a PDF/image from Google Drive, uses Google Drive OCR by converting a
 * temporary copy to Google Docs, then passes the OCR text to the Phase 1 parser.
 *
 * IMPORTANT:
 * - This prototype does not write to AppSheet.
 * - It never overwrites any Communication fields.
 * - The Drive file itself is not modified.
 * - The temporary OCR Google Doc is moved to trash after extraction.
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Communication Document Extractor');
}

/**
 * Extract information from a Google Drive file.
 * Accepts either a Drive file ID or a full Drive URL.
 */
function extractFromDriveFile(fileIdOrUrl) {
  var fileId = extractDriveFileId_(fileIdOrUrl);
  if (!fileId) {
    throw new Error('Please enter a valid Google Drive file ID or Drive URL.');
  }

  var sourceFile = DriveApp.getFileById(fileId);
  var sourceBlob = sourceFile.getBlob();
  var sourceName = sourceFile.getName();
  var sourceMimeType = sourceBlob.getContentType();

  if (!isSupportedDocument_(sourceMimeType, sourceName)) {
    throw new Error(
      'Unsupported file type. Please use a PDF, JPG, JPEG, PNG, GIF, or WEBP file.'
    );
  }

  var tempDocId = null;

  try {
    // Google Drive OCR: create a temporary Google Doc from the source blob.
    var tempDoc = Drive.Files.create(
      {
        name: '[OCR TEMP] ' + sourceName,
        mimeType: 'application/vnd.google-apps.document'
      },
      sourceBlob,
      {
        fields: 'id,name,mimeType',
        ocrLanguage: 'en'
      }
    );

    tempDocId = tempDoc.id;

    // Give Drive a moment to finish OCR/conversion before reading the Doc.
    Utilities.sleep(1500);

    var ocrText = DocumentApp.openById(tempDocId).getBody().getText();
    var extracted = extractDocumentInformation(ocrText);

    return {
      success: true,
      fileName: sourceName,
      mimeType: sourceMimeType,
      textLength: ocrText.length,
      extracted: extracted,
      rawTextPreview: ocrText.substring(0, 5000)
    };
  } finally {
    if (tempDocId) {
      try {
        DriveApp.getFileById(tempDocId).setTrashed(true);
      } catch (cleanupError) {
        console.warn('Could not trash temporary OCR file: ' + cleanupError);
      }
    }
  }
}

function extractDriveFileId_(value) {
  var text = String(value || '').trim();
  if (!text) return '';

  // Plain Drive ID.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(text)) return text;

  // Common Drive URL formats.
  var match = text.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (match) return match[1];

  match = text.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (match) return match[1];

  return '';
}

function isSupportedDocument_(mimeType, fileName) {
  var supportedMimeTypes = {
    'application/pdf': true,
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true
  };

  if (supportedMimeTypes[mimeType]) return true;

  return /\.(pdf|jpe?g|png|gif|webp)$/i.test(String(fileName || ''));
}

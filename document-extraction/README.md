# Document Extraction Prototype — Phase 1

This prototype tests extraction logic independently of AppSheet and Google Drive.

## Current scope

Given OCR-like plain text, the parser attempts to identify:

- Date of Document
- Subject
- From
- To
- Prominent Text (conservative fallback for documents without correspondence labels)

## Safety rules

1. Extraction is explicit/manual; there is no automatic registration.
2. Existing field values must never be overwritten.
3. Uncertain fields remain blank.
4. The parser does not assume every document is a letter or memo.
5. Prominent Text is informational and is not automatically treated as Subject.

## Current files

- `DocumentExtraction.gs` — parser and Phase 1 test function.

## Next phases

1. Connect OCR from Google Drive/Google Docs.
2. Connect extraction output to the Communication record.
3. Add an AppSheet `Extract from Document` action.
4. Preserve the review-before-save workflow.

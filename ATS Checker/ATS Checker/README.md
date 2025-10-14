# ATS Checker (Chrome Extension, MV3)

A lightweight, local-first ATS-style matcher. Paste a Job Description, upload a PDF resume, and get:
- Extracted skills from both documents
- Matched skills list
- A coverage percentage: how many JD skills your resume covers
- Local storage of your inputs (using `chrome.storage.local`)

> **Privacy:** Everything runs inside your browser. No servers; nothing is uploaded.

## Install (Developer Mode)

1. Download and unzip this folder.
2. **Important:** Replace the placeholder files in `libs/pdfjs/` with the official **PDF.js** minified builds:
   - `libs/pdfjs/pdf.min.js`
   - `libs/pdfjs/pdf.worker.min.js`
   You can get them from the **Assets** of a release at the official PDF.js repo: https://github.com/mozilla/pdf.js/releases
3. Open **chrome://extensions** in Chrome.
4. Toggle **Developer mode** (top-right).
5. Click **Load unpacked** and select the unzipped **ATS Checker** folder.

## How it works

- PDF text is extracted via PDF.js (running locally in the extension).
- A small skills lexicon + heuristics identifies skill keywords/phrases.
- We compute overlap metrics and display a **coverage score** (recall against JD skills).
- Inputs are stored to `chrome.storage.local` so you can revisit without losing them.

## Notes & Customization

- Extend the skills lexicon in `popup.js` (`SKILLS_LEXICON`) to fit your field.
- The matching formula can be adapted. Currently, headline score = recall of JD skills covered by the resume.
- This is an **MVP**—for production hiring workflows, consider more advanced NLP (embeddings, taxonomies, section-aware parsing, etc.).
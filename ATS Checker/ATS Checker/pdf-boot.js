// External boot to satisfy MV3 CSP (no inline scripts)
(function () {
  if (window['pdfjsLib']) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdfjs/pdf.worker.min.js');
    } catch (e) {
      console.error('Failed to set PDF.js workerSrc:', e);
    }
  } else {
    console.error('PDF.js not loaded: replace libs/pdfjs/pdf.min.js with the official build.');
  }
})();
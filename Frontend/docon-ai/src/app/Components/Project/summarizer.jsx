import { useState } from 'react';
import { jsPDF } from 'jspdf';

const Summarizer = ({ onClose, projectId }) => {
  const [files, setFiles] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError('');
  };

  const handleClose = () => {
    // Reset all states when closing
    setFiles([]);
    setSummary('');
    setLoading(false);
    setError('');
    onClose(); // Call the parent's close handler
  };

  const generateEverything = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (projectId) {  // Assuming projectId is available in your component
      formData.append('project_id', projectId);
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/project';

      // Step 1: Generate vector store
      const vectorRes = await fetch(`${API_BASE}/generate-vector-store`, {
        method: 'POST',
        body: formData,
      });

      if (!vectorRes.ok) {
        const errorData = await vectorRes.json();
        throw new Error(errorData.detail || 'Vector store creation failed.');
      }

      // Step 2: Generate summary
      const summaryRes = await fetch(`${API_BASE}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        throw new Error(errorData.detail || 'Summary generation failed.');
      }

      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    // Create new PDF document
    const doc = new jsPDF();

    // Set title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Summary', 20, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Add a line separator
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 35, 190, 35);

    // Add the summary content with word wrapping
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // Split the text to handle line breaks properly
    const textLines = doc.splitTextToSize(summary, 170);
    doc.text(textLines, 20, 45);

    // Save the PDF
    doc.save('document_summary.pdf');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blur background */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-md" onClick={handleClose}></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal content */}
        <div
          className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 mx-auto border border-gray-100"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            disabled={loading}
            aria-label="Close summarizer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">📄 Document Summarizer</h2>

          {/* File upload section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF documents
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {files.length > 0
                        ? `${files.length} file(s) selected`
                        : 'Click to browse or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
            {error && !summary && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={generateEverything}
              disabled={files.length === 0 || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Generate Summary'
              )}
            </button>
          </div>

          {/* Summary section */}
          {summary && (
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📝 Generated Summary</h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAsPDF}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
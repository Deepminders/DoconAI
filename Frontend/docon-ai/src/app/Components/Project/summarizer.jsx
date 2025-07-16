import React, { useEffect, useState } from "react";
import { jsPDF } from 'jspdf';
import {
  FileText,
  Upload,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileCheck,
  Sparkles,
  ChevronRight,
  Clock,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

const ReportGenerator = ({ onClose, projectId }) => {
  const [files, setFiles] = useState([]);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableDocs, setAvailableDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [checkedDocs, setCheckedDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    if (!projectId) return;
    setLoadingDocs(true);
    fetch(`http://localhost:8000/api/doc/ProjectDocs/${projectId}`)
      .then(res => res.json())
      .then(data => setAvailableDocs(data.documents || []))
      .catch(() => setAvailableDocs([]))
      .finally(() => setLoadingDocs(false));
  }, [projectId]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError('');
  };

  const handleClose = () => {
    setFiles([]);
    setReport('');
    setLoading(false);
    setError('');
    onClose();
  };

  const generateReport = async () => {
    if (files.length === 0 && checkedDocs.length === 0) {
      setError('Please select at least one file or document');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();

    files.forEach(file => formData.append('files', file));

    for (const docId of checkedDocs) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/doc/download_direct/${docId}`);
        if (!res.ok) throw new Error('Failed to download document');
        const blob = await res.blob();
        const docInfo = availableDocs.find(d => d.document_id === docId);
        let filename = docInfo?.document_name || `document_${docId}.pdf`;
        if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
        formData.append('files', blob, filename);
      } catch (err) {
        setError(`Failed to fetch document ${docId}`);
        setLoading(false);
        return;
      }
    }

    if (projectId) {
      formData.append('project_id', projectId);
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/projects';

      const vectorRes = await fetch(`${API_BASE}/generate-vector-store`, {
        method: 'POST',
        body: formData,
      });

      if (!vectorRes.ok) {
        const errorData = await vectorRes.json();
        throw new Error(errorData.detail || 'Vector store creation failed.');
      }

      const reportRes = await fetch(`${API_BASE}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId
        }),
      });

      if (!reportRes.ok) {
        const errorData = await reportRes.json();
        throw new Error(errorData.detail || 'Report generation failed.');
      }

      const reportData = await reportRes.json();
      setReport(reportData.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT STATUS REPORT', 20, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Project ID: ${projectId}`, 20, 35);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 40, 190, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    let cleanedReport = report.replace(/={60,}/g, '').trim();
    cleanedReport = cleanedReport.replace(/\|[^|\n]*\|/g, '');
    cleanedReport = cleanedReport.replace(/\|[-:\s]+\|/g, '');

    const sections = cleanedReport.split(/\n\s*\n/);
    let currentY = 50;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 6;
    const margin = 20;
    const maxWidth = 170;

    sections.forEach((section) => {
      if (!section.trim()) return;
      const lines = section.split('\n');
      lines.forEach((line, index) => {
        if (currentY + lineHeight > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }
        if (!line.trim()) {
          currentY += lineHeight / 2;
          return;
        }
        if (line.match(/^[A-Z\s\d\.\-]+$/) && line.length < 50) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          currentY += 4;
        } else if (line.match(/^\d+\.\s+[A-Z]/) || line.includes('SUMMARY') || line.includes('STATUS')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
        }
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        wrappedLines.forEach((wrappedLine) => {
          if (currentY + lineHeight > pageHeight - 30) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(wrappedLine, margin, currentY);
          currentY += lineHeight;
        });
        currentY += 1;
      });
      currentY += 4;
    });

    doc.save(`project_${projectId}_status_report.pdf`);
  };

  const handleCheckboxChange = (docId) => {
    setCheckedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const getDocumentIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'meeting': return <Users className="h-4 w-4 text-blue-500" />;
      case 'progress': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'planning': return <Target className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced blur background */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-lg"
        onClick={handleClose}
      ></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal content */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 mx-auto border border-gray-100 transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Report Generator</h2>
            <p className="text-gray-600">Transform your project documents into comprehensive reports</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${activeTab === 'existing'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Project Documents</span>
              {availableDocs.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {availableDocs.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Upload New Documents</h3>
                </div>

                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {files.length > 0 ? `${files.length} file(s) selected` : 'Drop files here or click to browse'}
                      </h4>
                      <p className="text-gray-600 mb-4">PDF files only, up to 10MB each</p>
                      {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                              <FileText className="h-4 w-4" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
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
            )}

            {activeTab === 'existing' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Available Project Documents</h3>
                </div>

                {loadingDocs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading documents...</span>
                  </div>
                ) : availableDocs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No documents found for this project</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-80 overflow-y-auto">
                    {availableDocs.map(doc => (
                      <label
                        key={doc.document_id}
                        className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200"
                      >
                        <input
                          type="checkbox"
                          checked={checkedDocs.includes(doc.document_id)}
                          onChange={() => handleCheckboxChange(doc.document_id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1 flex items-center space-x-3 min-w-0">
                          {getDocumentIcon(doc.document_category)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{doc.document_name}</h4>
                            <p className="text-sm text-gray-500 capitalize">{doc.document_category}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && !report && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={generateReport}
              disabled={(files.length === 0 && checkedDocs.length === 0) || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate AI Report</span>
                </>
              )}
            </button>
          </div>

          {/* Report section */}
          {report && (
            <div className="border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Generated Report</h3>
                </div>
                <button
                  onClick={downloadAsPDF}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  {report.split(/\n\s*---+\s*\n/).map((section, idx) => {
                    const headingMatch = section.match(/^(\d+\.\s+)?([^\n]+)\n/);
                    let heading = '';
                    let content = section;
                    if (headingMatch) {
                      heading = headingMatch[2].trim();
                      content = section.slice(headingMatch[0].length).trim();
                    }

                    return (
                      <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                        {heading && (
                          <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span>{heading}</span>
                          </h4>
                        )}
                        <div className="prose prose-sm max-w-none">
                          {content.split('\n').map((para, i) => {
                            if (para.trim()) {
                              return (
                                <p key={i} className="mb-2 text-gray-700 leading-relaxed">
                                  {para.trim()}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
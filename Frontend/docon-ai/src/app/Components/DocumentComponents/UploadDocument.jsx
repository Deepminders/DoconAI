"use client";
import React, { useState, useRef } from 'react';
import { useNotifications } from '../Common/NotificationSystem';

export default function UploadDocument({ onUpload }) {
  const [projectId] = useState("687000c9df820986d0a5ba42");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState('initial');
  const [classificationData, setClassificationData] = useState(null);
  const [confirmedCategory, setConfirmedCategory] = useState('');

  const fileInputRef = useRef(null);
  const docNameRef = useRef(null);
  
  const notify = useNotifications();

  const handleFileSelection = (file) => {
    const allowedTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (file && (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension))) {
      setSelectedFile(file);
      setUploadStep('initial');
      setClassificationData(null);
      setConfirmedCategory('');
    } else {
      notify.error('Please select a valid PDF, DOCX, or Excel file.', { title: 'Invalid File Type' });
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelection(file);
  };

  const handleDragOver = (e) => { 
    e.preventDefault(); 
    setIsDragging(true); 
  };

  const handleDragLeave = (e) => { 
    e.preventDefault(); 
    setIsDragging(false); 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  };

  const handleClassify = async () => {
    if (!selectedFile) {
      notify.warning('Please select a file first.', { title: 'No File' });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/doc/classify', { 
        method: 'POST', 
        body: formData 
      });
      if (!response.ok) { 
        throw new Error('Document classification failed'); 
      }
      const data = await response.json();
      setClassificationData(data);
      setConfirmedCategory(data.predicted_category);
      setUploadStep('confirming');
      notify.info('Please confirm the document category.', { title: 'Classification Complete' });
    } catch (error) {
      console.error('Error during classification:', error);
      notify.error('Could not classify the document. Please try again.', { title: 'Classification Error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!classificationData) {
      notify.error('Classification data is missing. Please try again.', { title: 'Error' });
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('proj_id', projectId);
    formData.append('doc_name', docNameRef.current?.value || selectedFile.name);
    formData.append('confirmed_category', confirmedCategory);
    formData.append('temp_file_path', classificationData.temp_file_path);
    formData.append('original_filename', classificationData.original_filename);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/doc/upload', { 
        method: 'POST', 
        body: formData 
      });
      if (!response.ok) { 
        throw new Error('Final file upload failed'); 
      }
      const data = await response.json();
      notify.success(`Document ID: ${data.document_id} has been saved.`, { title: 'Upload Successful' });
      if (onUpload) onUpload();
      clearFile();
    } catch (error) {
      console.error('Error uploading file:', error);
      notify.error('There was a problem uploading your file.', { title: 'Upload Failed' });
    } finally {
      setIsLoading(false);
      setUploadStep('initial');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setClassificationData(null);
    setConfirmedCategory('');
    setUploadStep('initial');
    if(fileInputRef.current) fileInputRef.current.value = "";
    if(docNameRef.current) docNameRef.current.value = "";
  };

  return (
    <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
      <div className="flex-1 w-full">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-sky-900'
          }`} 
          onDragOver={handleDragOver} 
          onDragLeave={handleDragLeave} 
          onDrop={handleDrop}
        >
          <p className="text-sky-900 mb-4">Drag & drop a PDF, DOCX, or Excel file</p>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.docx,.xls,.xlsx" 
            ref={fileInputRef} 
            onChange={handleFileInputChange} 
            id="fileInput" 
            disabled={isLoading} 
          />
          <label 
            htmlFor="fileInput" 
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Choose File
          </label>
        </div>
        
        {selectedFile && (
          <>
            <div className="mt-4">
              <input 
                type="text" 
                className="w-full border border-sky-900 rounded-lg p-2 placeholder:text-sky-900 placeholder:opacity-30" 
                placeholder="Enter Document Name (optional)" 
                ref={docNameRef} 
                defaultValue={selectedFile.name.replace(/\.[^/.]+$/, "")} 
              />
            </div>
            {uploadStep === 'confirming' && classificationData && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-sky-900">Confirm Category</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Predicted Category: <span className="font-bold">{classificationData.predicted_category}</span>
                </p>
                <select 
                  className="w-full border border-sky-900 rounded-lg p-2" 
                  value={confirmedCategory} 
                  onChange={(e) => setConfirmedCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  <option value="Bill of Quantities (BOQ)">Bill of Quantities (BOQ)</option>
                  <option value="Contracts and Agreements">Contracts and Agreements</option>
                  <option value="Tender Documents">Tender Documents</option>
                  <option value="Progress Reports">Progress Reports</option>
                  <option value="Final Reports">Final Reports</option>
                  <option value="Cost Estimations">Cost Estimations</option>
                  <option value="Invoices and Financials">Invoices and Financials</option>
                  <option value="Drawings and Plans">Drawings and Plans</option>
                  <option value="Permits and Licenses">Permits and Licenses</option>
                  <option value="Safety and Compliance">Safety and Compliance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            <div className="mt-4 flex space-x-2">
              {uploadStep === 'initial' && (
                <button 
                  className="flex-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 py-2" 
                  onClick={handleClassify} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="inline-flex items-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      Classifying...
                    </div>
                  ) : (
                    'Classify & Proceed'
                  )}
                </button>
              )}
              {uploadStep === 'confirming' && (
                <button 
                  className="flex-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-all duration-200 py-2" 
                  onClick={handleConfirmUpload} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="inline-flex items-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Confirm & Upload'
                  )}
                </button>
              )}
              <button 
                className="flex-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-all duration-200 py-2" 
                onClick={clearFile} 
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
          </>
        )}
      </div>
      {selectedFile && (
        <div className="flex-1 w-full bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-sky-900 mb-2">File Details</h3>
          <p className="text-sky-900 break-words">
            <span className="font-medium">Name:</span> {selectedFile.name}
          </p>
          <p className="text-sky-900">
            <span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-sky-900">
            <span className="font-medium">Type:</span> {selectedFile.type}
          </p>
        </div>
      )}
    </div>
  );
}
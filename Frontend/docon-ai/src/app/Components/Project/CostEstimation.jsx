"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, DollarSign, Loader2, X, CheckCircle, ArrowRight } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CostEstimation = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    // Automatically trigger estimation when files change
    React.useEffect(() => {
        if (files.length > 0) {
            handleBOQUpload(files);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        setError(null);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
        setError(null);
    };

    const handleBOQUpload = async (uploadFiles) => {
        if (!uploadFiles || !uploadFiles.length) {
            setError("Please select BOQ files to upload.");
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            uploadFiles.forEach((file) => formData.append('files', file));

            const response = await fetch(`${API_BASE_URL}/api/cost/boq/process`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
            setFiles([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div className="w-full max-w-6xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 font-sans">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI-Powered Cost Estimation</h1>
                <p className="mt-2 text-md text-gray-500">
                    Upload your Bill of Quantities (BOQ) documents to get an instant cost estimate.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column: Uploader */}
                <div className="w-full">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'
                                }`}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                multiple
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                            <p className="text-gray-700 mb-2 font-semibold">
                                Drag & drop files here, or
                            </p>
                            <button
                                type="button"
                                onClick={onButtonClick}
                                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                browse from your computer
                            </button>
                        </div>
                        {dragActive && <div className="absolute inset-0" onDragLeave={handleDrag} onDrop={handleDrop}></div>}
                    </form>

                    {files.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">
                                Files to process
                            </h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(file.name)}
                                            className="p-1 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={handleBOQUpload}
                            disabled={loading || !files.length}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-lg text-white transition-all duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Estimate Cost <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="w-full bg-gray-50 p-6 rounded-xl border border-gray-200 min-h-[400px] flex flex-col justify-center">
                    {loading ? (
                        <div className="text-center text-gray-500">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                            <p className="font-semibold">Generating your estimate...</p>
                            <p className="text-sm">This may take a moment.</p>
                        </div>
                    ) : result ? (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-7 h-7 text-blue-600" />
                                <h3 className="text-xl font-bold text-blue-800">
                                    Estimation Complete
                                </h3>
                            </div>
                            <div className="text-center bg-white p-4 rounded-lg border mb-4">
                                <p className="text-sm text-gray-500 mb-1">Estimated Project Cost</p>
                                <p className="text-4xl font-extrabold text-gray-800 tracking-tight">
                                    ${result.predicted_cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </p>
                            </div>

                            {result.extracted_features && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Key Features Extracted</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {Object.entries(result.extracted_features).map(([key, value]) => (
                                            <div key={key} className="bg-white p-2 rounded-lg border text-gray-800">
                                                <span className="block capitalize font-medium text-gray-500 text-xs">{key.replace(/_/g, ' ')}</span>
                                                <span className="block font-semibold capitalize">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <DollarSign className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-semibold">Your cost estimate will appear here.</p>
                            <p className="text-sm">Upload a BOQ document to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CostEstimation;
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import "../../../CSS/documentcomparator/comparator.css";
import UserProfileMenu from "../../../Components/Common/UserProfileMenu";
import { toast } from "react-toastify";

export default function Home() {
  const [file, setFile] = useState(null);
  const [doc1, setDoc1] = useState("");
  const [doc2, setDoc2] = useState("");
  const [comparisonType, setComparisonType] = useState("text");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [uploading, setUploading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [activeStatus, setActiveStatus] = useState('documentComparator');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
  const checkScreenSize = () => {
    const mobile = window.innerWidth < 1024; // same breakpoint
    setIsMobile(mobile);
    setIsSidebarOpen(!mobile);
  };

  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  return () => window.removeEventListener('resize', checkScreenSize);
}, []);

const toggleSidebar = () => {
  setIsSidebarOpen(!isSidebarOpen);
};

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/document-list");
      setUploadedDocs(res.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/upload", formData);
      alert("File uploaded successfully.");
      setFile(null);
      fetchDocuments(); // <-- Fetch documents after upload
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleCompare = async () => {
    if (!doc1 || !doc2) {
      alert("Please select two documents.");
      return;
    }

    setComparing(true); // Show scanner
    setResult(""); // Clear previous result

    const formData = new FormData();
    formData.append("file1_name", doc1);
    formData.append("file2_name", doc2);
    formData.append("comparison_type", comparisonType);

    if (comparisonType === "text") {
      if (!topic) {
        alert("Please enter a topic for text-based comparison.");
        setComparing(false);
        return;
      }
      formData.append("topic", topic);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/compare", formData);
      setResult(JSON.stringify(res.data.result, null, 2));
    } catch (error) {
      console.error("Compare failed", error);
      alert("Comparison failed.");
    } finally {
      setComparing(false); // Hide scanner
    }
  };

  // Filter out doc1 from doc2 options
  const doc2Options = uploadedDocs.filter((d) => d !== doc1);

  return (
    
     <div className="flex h-screen overflow-hidden">
      

      <DocumentSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        active={'documentComparator'}
      />
       
      <main className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ease-in-out ${!isMobile && isSidebarOpen ? 'ml-60' : 'ml-0'}`}>
              <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-gray-900">User Management</h1>
          <UserProfileMenu />
        </div>

      {/* Upload Section */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="h5 mb-3">Upload a New Document</h2>
        <div className="file-upload">
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
          <button className="btn btn-success" onClick={handleUpload} disabled={uploading && !file}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Compare Section */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="h5 mb-3">Compare Documents</h2>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Document 1:</label>
            <select
              className="form-select"
              value={doc1}
              onChange={(e) => setDoc1(e.target.value)}
            >
              <option value="">Select Document 1</option>
              {uploadedDocs.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Document 2:</label>
            <select
              className="form-select"
              value={doc2}
              onChange={(e) => setDoc2(e.target.value)}
              disabled={!doc1}
            >
              <option value="">Select Document 2</option>
              {doc2Options.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Comparison Type:</label>
          <select
            className="form-select"
            value={comparisonType}
            onChange={(e) => setComparisonType(e.target.value)}
          >
            <option value="text">Text-Based Comparison</option>
            <option value="numeric">Numerical & Cost Comparison</option>
            <option value="timestamp">Timestamp and Author Changes</option>
            <option value="smart">AI Powered Smart Comparison</option>
          </select>
        </div>

        {comparisonType === "text" && (
          <div className="mb-3">
            <label className="form-label">Input a Topic:</label>
            <input
              type="text"
              className="form-control"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic for text-based comparison"
            />
          </div>
        )}

        <button className="btn btn-primary" onClick={handleCompare}>
          Compare
        </button>
      </div>

      <div className="p-4 border rounded">
        <h2 className="h5 mb-2">Comparison Result:</h2>
        <div className="result-box">
          {comparing ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span className="spinner-border text-primary" role="status" aria-hidden="true"></span>
              <span>Comparing...</span>
            </div>
          ) : result ? (
            (() => {
              let parsed;
              try {
                parsed = JSON.parse(result);
              } catch {
                return <pre className="bg-light p-3 rounded">{result}</pre>;
              }
              
              // Helper to render bullet points
              const renderList = (items) => {
                if (Array.isArray(items) && items.length > 0) {
                return (
                <ul className="mb-0 ps-3">
                 {items.map((item, idx) => (
                 <li key={idx} className="mb-2">{item}</li>
             ))}
        </ul>
    );
        } else {
            return <span className="text-muted">No data</span>;
  }
};

              return (
                <div>
                  <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
                    <span className="badge bg-info text-dark fs-5 px-3 py-2">
                      <strong>Topic:</strong> {parsed.topic}
                    </span>
                    <span className="badge bg-secondary text-light fs-6 px-3 py-2">
                      <strong>Comparison Type:</strong> {comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)}
                    </span>
                  </div>
                  <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
                    <span className="badge bg-primary text-light fs-6 px-3 py-2">
                      <strong>Document 1 Name:</strong> {doc1}
                    </span>
                    <span className="badge bg-success text-light fs-6 px-3 py-2">
                      <strong>Document 2 Name:</strong> {doc2}
                    </span>
                  </div>
                  <div className="table-responsive mb-3">
                    <table className="table table-bordered shadow-sm">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "50%" }} className="text-primary">Document 1</th>
                          <th style={{ width: "50%" }} className="text-success">Document 2</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{renderList(parsed.doc1)}</td>
                          <td>{renderList(parsed.doc2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="alert alert-success fs-6" role="alert">
                    <strong>Summary:</strong>
                    {renderList(parsed.summary)}
                  </div>
                </div>
              );
            })()
          ) : (
            "No result yet."
          )}
        </div>
      </div>
    </main>
    </div>
  );
}
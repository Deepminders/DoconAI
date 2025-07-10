"use client";
import React, { useRef, useState } from 'react'

const UploadDocument = () => {
const [user, setUser] = useState("Sample User" || localStorage.getItem("user"));
const [projectId, setProjectId] = useState("Sample Project" || localStorage.getItem("projectId"));
const fileInput = useRef("");
const filename = useRef("");


const handleFileUpload = async (e) => {
    e.preventDefault(); 
    const file = fileInput.current.files[0];
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }
    const formData = new FormData();
    formData.append('file', file);  
    // formData.append('user', user);
    // formData.append('projectId', projectId);
    formData.append('doc_name', filename.current.value); 

    try {
        const response = await fetch('http://127.0.0.1:8000/api/doc/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }

        const data = await response.json();
        alert(`File uploaded successfully: ${data.document_id}`);
        fileInput.current.value = ""; // Clear the file input   
        filename.current.value = ""; // Clear the filename input
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
    }

}

    return (
        <div className="flex flex-row items-center">
            <input
                type="file"
                className="border w-1/2  border-sky-900 rounded-lg mr-[20px] p-2 placeholder:text-sky-900 placeholder:opacity-30"
                accept=".pdf"
                ref={fileInput}
            />
            <input
                type="text"
                className=" border w-1/2 border-sky-900 rounded-lg mr-[20px] p-2 placeholder:text-sky-900 placeholder:opacity-30"
                placeholder='Document Name' ref={filename}
            />
            <button className="bg-blue-600 text-white rounded hover:bg-blue-200 hover:text-sky-950 cursor-pointer transition-all duration-200" onClick={handleFileUpload}>
                Upload
            </button>
        </div>
    )
}

export default UploadDocument;

"use client";

import React from "react";
import DocumentCategories from "./DocumentCategories";
import DocumentUpload from "./DocumentUpload";
import DocumentSearch from "./DocumentSearch";
import DocumentsTable from "./DocumentTable";
import DocumentActions from "./DocumentActions";

const DocumentManagement = ({
  documents, // <-- use the prop from parent
  categories,
  selectedDocs,
  onSearch,
  onToggleSelect,
  onGroupClick,
  onDeleteClick,
  projectId
}) => {
  return (
    <>
      <DocumentCategories categories={categories} />
      
      <DocumentSearch onSearch={onSearch} />
      <DocumentsTable
        documents={documents}
        selectedDocs={selectedDocs}
        onToggleSelect={onToggleSelect}
        projectId={projectId}
      />
      <DocumentActions
        onGroupClick={onGroupClick}
        onDeleteClick={onDeleteClick}
        selectedCount={selectedDocs.length}
      />
    </>
  );
};

export default DocumentManagement;
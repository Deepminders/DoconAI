"use client";

import React from "react";
import DocumentCategories from "./DocumentCategories";
import DocumentUpload from "./DocumentUpload";
import DocumentSearch from "./DocumentSearch";
import DocumentsTable from "./DocumentTable";
import DocumentActions from "./DocumentActions";

const DocumentManagement = ({
  documents,
  categories,
  selectedDocs,
  onSearch,
  onToggleSelect,
  onGroupClick,
  onDeleteClick
}) => (
  <>
    <DocumentCategories categories={categories} />
    <DocumentUpload />
    <DocumentSearch onSearch={onSearch} />
    <DocumentsTable
      documents={documents}
      selectedDocs={selectedDocs}
      onToggleSelect={onToggleSelect}
    />
    <DocumentActions
      onGroupClick={onGroupClick}
      onDeleteClick={onDeleteClick}
      selectedCount={selectedDocs.length}
    />
  </>
);

export default DocumentManagement;
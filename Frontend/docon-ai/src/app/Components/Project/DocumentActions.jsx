"use client";

import React from "react";
import Button from "./Button";
import { Trash2 } from "lucide-react";

const DocumentActions = ({ onGroupClick, onDeleteClick, selectedCount }) => (
  <div className="mt-4 flex justify-end gap-4">
    <Button
      label={`Group Documents (${selectedCount})`}
      color="blue"
      onClick={onGroupClick}
      disabled={selectedCount === 0}
    />
    <Button
      label={`Delete Documents (${selectedCount})`}
      color="red"
      onClick={onDeleteClick}
      disabled={selectedCount === 0}
      icon={<Trash2 size={18} />}
    />
  </div>
);

export default DocumentActions;
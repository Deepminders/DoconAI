"use client";

import React from "react";
import Button from "./Button";
import { Trash2, FileCheck2 } from "lucide-react";

const ProjectActions = ({ onDeleteProject }) => (
  <div className="mt-4 flex gap-3">
    <Button
      label="Delete Project"
      color="red"
      icon={<Trash2 size={18} />}
      onClick={onDeleteProject}
    />
    <Button
      label="Summarize"
      color="blue"
      icon={<FileCheck2 size={18} />}
    />
  </div>
);

export default ProjectActions;
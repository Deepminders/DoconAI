"use client";

import React, { useState } from "react";
import Button from "./Button";
import { Trash2, FileCheck2, Calculator } from "lucide-react";
import CostEstimation from './CostEstimation';

const ProjectActions = ({ onDeleteProject, onSummarize }) => {
    const [showCostEstimation, setShowCostEstimation] = useState(false);

    return (
        <>
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
                    onClick={onSummarize}
                />
                <Button
                    label="Calculate Cost"
                    color="green"
                    icon={<Calculator size={18} />}
                    onClick={() => setShowCostEstimation(true)}
                />
            </div>
            
            {showCostEstimation && (
                <CostEstimation 
                    projectId="your-project-id" 
                    onClose={() => setShowCostEstimation(false)} 
                />
            )}
        </>
    );
};

export default ProjectActions;
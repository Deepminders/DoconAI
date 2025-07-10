"use client";

import React, { useEffect, useState } from "react";
import {
    FileText,
    DollarSign,
    AlertTriangle,
    Loader2,
    Info,
} from "lucide-react";
import { Geist, Lobster, Pacifico, Dancing_Script, Montserrat, Acme } from 'next/font/google'

const geist = Geist({
    subsets: ['latin'],
})

const lobster = Lobster({
    subsets: ['latin'],
    weight: '400',
});

const pacifico = Pacifico({ subsets: ['latin'], weight: '400' });
const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '400' });
const montserrat = Montserrat({ subsets: ['latin'], weight: '600' });
const acme = Acme({ subsets: ['latin'], weight: '400' });

const FinanceBOQCostPredictor = ({ projectId }) => {
    const [financeBOQDocs, setFinanceBOQDocs] = useState([]);
    const [boqPredictions, setBoqPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch and filter Finance BOQ documents
    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        fetch(`http://localhost:8000/api/doc/project_docs/${projectId}`)
            .then((res) => res.json())
            .then((data) => {
                const mappedDocs = (data.documents || []).map((doc) => ({
                    ...doc,
                    name: doc.document_name,
                    category: doc.document_category,
                    document_id: doc.document_id,
                }));
                const financeBOQ = mappedDocs.filter(
                    (doc) =>
                        doc.category &&
                        doc.name &&
                        doc.category.toLowerCase() === "finance" &&
                        doc.name.toLowerCase().includes("boq")
                );
                setFinanceBOQDocs(financeBOQ);
            })
            .catch(() => {
                // You can add error handling for the fetch itself here
            })
            .finally(() => {
                setLoading(false);
            });
    }, [projectId]);

    // 2. Download and predict costs in parallel when documents are found
    useEffect(() => {
        const handleCostPrediction = async () => {
            const predictionPromises = financeBOQDocs.map(async (doc) => {
                try {
                    const res = await fetch(
                        `http://127.0.0.1:8000/api/doc/download/${doc.document_id}`
                    );
                    if (!res.ok) throw new Error("Download failed");
                    const blob = await res.blob();

                    const formData = new FormData();
                    let filename = doc.name || `document_${doc.document_id}.pdf`;
                    if (!filename.toLowerCase().endsWith(".pdf")) {
                        filename += ".pdf";
                    }
                    formData.append("files", blob, filename);

                    const predictRes = await fetch(
                        "http://127.0.0.1:8000/api/cost/boq/process",
                        {
                            method: "POST",
                            body: formData,
                        }
                    );

                    if (!predictRes.ok) {
                        const errData = await predictRes.json().catch(() => ({}));
                        throw new Error(errData.detail || "Prediction failed");
                    }

                    const prediction = await predictRes.json();
                    return { document_id: doc.document_id, ...prediction };
                } catch (err) {
                    return { document_id: doc.document_id, error: err.message };
                }
            });

            const results = await Promise.all(predictionPromises);
            setBoqPredictions(results);
        };

        if (financeBOQDocs.length > 0) {
            handleCostPrediction();
        }
    }, [financeBOQDocs]);

    // 3. Render UI based on state
    if (loading) {
        return (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-500">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                Loading Finance Documents...
            </div>
        );
    }

    if (financeBOQDocs.length === 0) {
        return (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                No Financial  documents found to analyze.
            </div>
        );
    }

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 ${geist.className}`}>
            <h2 className="text-xl text-gray-800 mb-1 font-semibold italic">
                Automated Cost Analysis
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Costs are automatically predicted for the following BOQ documents.
            </p>
            <div className="space-y-3">
                {financeBOQDocs.map((doc) => {
                    const prediction = boqPredictions.find(
                        (p) => p.document_id === doc.document_id
                    );

                    return (
                        <div
                            key={doc.document_id}
                            className="flex items-center justify-between bg-slate-50/70 p-4 rounded-lg border border-slate-200"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span className={`font-semibold text-gray-800 ${acme.className}`}>
                                    {doc.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-medium">
                                {!prediction ? (
                                    <span className="flex items-center gap-2 text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </span>
                                ) : prediction.error ? (
                                    <span className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="w-4 h-4" />
                                        {prediction.error}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-green-700">
                                        <span className="font-extrabold text-2xl text-blue-700 tracking-wide">
                                            ${prediction.predicted_cost?.toLocaleString(
                                                "en-US",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            ) || "0.00"}
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FinanceBOQCostPredictor;
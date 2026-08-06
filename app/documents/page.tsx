"use client";

import React, { useState, useEffect } from "react";
import { User, Project, Task } from "@/types";

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const getFormDataHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export default function DocumentHub() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [accessType, setAccessType] = useState("code");
    const [projectId, setProjectId] = useState<string>("");
    const [taskId, setTaskId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    
    // For unlocking
    const [unlockCode, setUnlockCode] = useState("");
    const [unlockingDocId, setUnlockingDocId] = useState<number | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/v1/documents/", { headers: getHeaders() });
            if (!res.ok) throw new Error("Failed to fetch documents");
            const data = await res.json();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;
        
        setLoading(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("access_type", accessType);
        formData.append("file", file);
        if (projectId) formData.append("project_id", projectId);
        if (taskId) formData.append("task_id", taskId);

        try {
            const res = await fetch("/api/v1/documents/", {
                method: "POST",
                headers: getFormDataHeaders(),
                body: formData
            });
            if (!res.ok) throw new Error("Upload failed");
            setTitle("");
            setFile(null);
            fetchDocuments();
        } catch (error) {
            console.error("Failed to upload document", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (docId: number) => {
        try {
            const params = new URLSearchParams({ passcode: unlockCode });
            const res = await fetch(`/api/v1/documents/${docId}/url?${params.toString()}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error("Invalid passcode");
            const data = await res.json();
            window.open(data.url, "_blank");
            setUnlockingDocId(null);
            setUnlockCode("");
        } catch (error) {
            alert("Invalid passcode or access denied.");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Document Hub</h1>
            
            <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">File</label>
                        <input 
                            type="file" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            required
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Link to Project (Optional)</label>
                            <input 
                                type="text"
                                placeholder="Project ID"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Link to Task (Optional)</label>
                            <input 
                                type="text"
                                placeholder="Task ID"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                                value={taskId}
                                onChange={(e) => setTaskId(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Security</label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                            value={accessType}
                            onChange={(e) => setAccessType(e.target.value)}
                        >
                            <option value="code">Passcode Protected (Auto-generated)</option>
                            <option value="access">Access Based (Specific Users)</option>
                        </select>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        {loading ? "Uploading..." : "Upload Document"}
                    </button>
                </form>
            </div>
            
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                            <h3 className="font-semibold text-lg mb-2">{doc.title}</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                {doc.access_type === "code" ? "🔒 Passcode Protected" : "👥 Access Restricted"}
                            </p>
                            
                            {unlockingDocId === doc.id ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Enter passcode"
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                                        value={unlockCode}
                                        onChange={(e) => setUnlockCode(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => handleUnlock(doc.id)}
                                        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium"
                                    >
                                        Unlock
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setUnlockingDocId(doc.id)}
                                    className="bg-gray-700 hover:bg-gray-600 w-full py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Open Document
                                </button>
                            )}
                        </div>
                    ))}
                    {documents.length === 0 && (
                        <p className="text-gray-400">No documents found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

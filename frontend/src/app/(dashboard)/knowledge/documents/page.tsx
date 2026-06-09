"use client";

import { useState } from "react";
import { Upload, FileText, Image, Trash2, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Doc {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc";
  size: string;
  uploaded: string;
  status: "processed" | "processing" | "error";
  category: string;
}

const INITIAL_DOCS: Doc[] = [
  { id: "1", name: "Product Catalogue 2026.pdf", type: "pdf", size: "3.2 MB", uploaded: "Jun 1, 2026", status: "processed", category: "Products" },
  { id: "2", name: "Return Policy.pdf", type: "pdf", size: "420 KB", uploaded: "May 15, 2026", status: "processed", category: "Policies" },
  { id: "3", name: "Delivery Zones Map.pdf", type: "pdf", size: "1.1 MB", uploaded: "May 10, 2026", status: "processed", category: "Delivery" },
  { id: "4", name: "Price List June 2026.pdf", type: "pdf", size: "680 KB", uploaded: "Jun 5, 2026", status: "processing", category: "Products" },
  { id: "5", name: "Store Photos.jpg", type: "image", size: "2.8 MB", uploaded: "Apr 20, 2026", status: "processed", category: "Brand" },
];

const CATEGORIES = ["All", "Products", "Policies", "Delivery", "Brand", "Other"];

const STATUS_CONFIG = {
  processed: { label: "Processed", color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle },
  processing: { label: "Processing...", color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
  error: { label: "Error", color: "text-red-600", bg: "bg-red-100", icon: AlertCircle },
};

const TYPE_ICONS = {
  pdf: { icon: FileText, color: "text-red-500", bg: "bg-red-50" },
  image: { icon: Image, color: "text-blue-500", bg: "bg-blue-50" },
  doc: { icon: FileText, color: "text-brand-500", bg: "bg-brand-50" },
};

export default function BusinessDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isDragging, setIsDragging] = useState(false);

  const filtered = activeCategory === "All" ? docs : docs.filter(d => d.category === activeCategory);

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const type: Doc["type"] = ext === "pdf" ? "pdf" : (ext === "jpg" || ext === "png" || ext === "jpeg") ? "image" : "doc";
      const newDoc: Doc = {
        id: Date.now().toString(),
        name: file.name,
        type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploaded: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "processing",
        category: "Other",
      };
      setDocs(prev => [newDoc, ...prev]);
      setTimeout(() => setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: "processed" } : d)), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Business Documents</h1>
        <p className="text-sm text-slate-500">Upload PDFs and images for the AI to reference when answering customer questions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{docs.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Documents</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{docs.filter(d => d.status === "processed").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Processed</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-amber-600">{docs.filter(d => d.status === "processing").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Processing</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-red-500">{docs.filter(d => d.type === "pdf").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">PDFs</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"}`}
      >
        <Upload size={28} className={`mx-auto mb-3 ${isDragging ? "text-brand-500" : "text-slate-400"}`} />
        <p className="text-sm font-medium text-slate-700">Drop files here or click to upload</p>
        <p className="text-xs text-slate-400 mt-1">Supports PDF, JPG, PNG, DOC up to 10MB</p>
        <label className="mt-4 inline-block cursor-pointer">
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const ext = file.name.split(".").pop()?.toLowerCase();
            const type: Doc["type"] = ext === "pdf" ? "pdf" : (ext === "jpg" || ext === "png" || ext === "jpeg") ? "image" : "doc";
            const newDoc: Doc = {
              id: Date.now().toString(), name: file.name, type,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploaded: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              status: "processing", category: "Other",
            };
            setDocs(prev => [newDoc, ...prev]);
            setTimeout(() => setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: "processed" } : d)), 2500);
          }} />
          <span className="btn-primary text-sm px-5 py-2">Choose Files</span>
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeCategory === cat ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="card !p-0 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.map((doc) => {
            const typeConfig = TYPE_ICONS[doc.type];
            const statusConfig = STATUS_CONFIG[doc.status];
            return (
              <div key={doc.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.bg}`}>
                  <typeConfig.icon size={18} className={typeConfig.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{doc.size}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{doc.uploaded}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">{doc.category}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                  <statusConfig.icon size={11} />
                  {statusConfig.label}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <Eye size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FileText size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No documents in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

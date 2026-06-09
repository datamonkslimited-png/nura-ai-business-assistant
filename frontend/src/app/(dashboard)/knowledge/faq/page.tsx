"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Search, Edit3, Trash2, X, ChevronDown, HelpCircle, Loader2 } from "lucide-react";
import { knowledgeApi, KnowledgeDocument } from "@/lib/api";

const CATEGORIES = ["All", "Delivery", "Returns", "Payments", "Products", "Pricing", "Other"];

const EMPTY_FORM = { question: "", answer: "", category: "General" };

export default function FAQPage() {
  const [faqs, setFaqs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeDocument | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await knowledgeApi.list("faq");
      setFaqs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  // For display: title = question, content = answer, doc_type category stored in title prefix or we use a local mapping
  // The API stores title + content. We map: title -> question, content -> answer.
  // Category is stored as part of title as "[Category] question" or we use a separate field.
  // Since the backend has no category column, we store category:question as title.
  const parseTitle = (title: string): { category: string; question: string } => {
    const match = title.match(/^\[([^\]]+)\]\s*(.*)/);
    if (match) return { category: match[1], question: match[2] };
    return { category: "General", question: title };
  };

  const buildTitle = (category: string, question: string) =>
    category && category !== "General" ? `[${category}] ${question}` : question;

  const filtered = faqs.filter((f) => {
    const { category, question } = parseTitle(f.title);
    return (
      (categoryFilter === "All" || category === categoryFilter) &&
      (question.toLowerCase().includes(search.toLowerCase()) ||
        f.content.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (faq: KnowledgeDocument) => {
    const { category, question } = parseTitle(faq.title);
    setEditing(faq);
    setForm({ question, answer: faq.content, category });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const title = buildTitle(form.category, form.question);
      if (editing) {
        const updated = await knowledgeApi.update(editing.id, { title, content: form.answer });
        setFaqs((prev) => prev.map((f) => (f.id === editing.id ? updated : f)));
      } else {
        const created = await knowledgeApi.create({ title, content: form.answer, doc_type: "faq" });
        setFaqs((prev) => [...prev, created]);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await knowledgeApi.delete(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete FAQ");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">FAQs & Q&A</h1>
          <p className="text-sm text-slate-500">Pre-loaded answers to common customer questions</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-1.5">
          <Plus size={15} /> Add FAQ
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{faqs.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total FAQs</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-brand-600">{faqs.filter((f) => f.is_active).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active FAQs</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">
            {new Set(faqs.map((f) => parseTitle(f.title).category)).size}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Categories</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{faqs.filter((f) => !f.is_active).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Inactive</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((faq) => {
            const { category, question } = parseTitle(faq.title);
            return (
              <div key={faq.id} className="card !p-0 overflow-hidden">
                <button
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <HelpCircle size={16} className="text-brand-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{question}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                          {category}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform ${
                            expandedId === faq.id ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>
                {expandedId === faq.id && (
                  <div className="px-4 pb-4">
                    <div className="ml-7 bg-slate-50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed">
                      {faq.content}
                    </div>
                    <div className="flex gap-2 mt-3 ml-7">
                      <button
                        onClick={() => openEdit(faq)}
                        className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline font-medium"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:underline font-medium"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No FAQs found. Add your first FAQ!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                {editing ? "Edit FAQ" : "Add FAQ"}
              </Dialog.Title>
              <Dialog.Close className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Question</label>
                <input
                  className="input-field"
                  placeholder="What do customers commonly ask?"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Answer</label>
                <textarea
                  className="input-field h-28 resize-none text-sm"
                  placeholder="Provide a clear, detailed answer..."
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== "All")
                    .concat(["General"])
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Dialog.Close className="btn-secondary flex-1 justify-center py-2.5 text-sm">
                Cancel
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 justify-center py-2.5 text-sm flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Save Changes" : "Add FAQ"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

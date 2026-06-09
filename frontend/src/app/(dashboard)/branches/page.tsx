"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, MapPin, Users, MoreHorizontal, Edit3, Trash2, X, Building2, Phone, CheckCircle } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  staffCount: number;
  status: "active" | "inactive";
  manager: string;
}

const INITIAL_BRANCHES: Branch[] = [
  { id: "1", name: "Westlands Branch", address: "Ring Road Westlands, Near Sarit Centre", city: "Nairobi", phone: "+254 712 111 222", staffCount: 8, status: "active", manager: "Amina Hassan" },
  { id: "2", name: "CBD Flagship Store", address: "Moi Avenue, Jubilee Insurance House 2nd Floor", city: "Nairobi", phone: "+254 723 333 444", staffCount: 12, status: "active", manager: "David Otieno" },
  { id: "3", name: "Karen Outlet", address: "Karen Shopping Centre, Lang'ata Road", city: "Nairobi", phone: "+254 734 555 666", staffCount: 5, status: "active", manager: "Grace Akinyi" },
  { id: "4", name: "Mombasa Branch", address: "Nyali Centre, Links Road", city: "Mombasa", phone: "+254 745 777 888", staffCount: 6, status: "inactive", manager: "Samuel Kiprop" },
];

const EMPTY_FORM = { name: "", address: "", city: "", phone: "", manager: "" };

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({ name: branch.name, address: branch.address, city: branch.city, phone: branch.phone, manager: branch.manager });
    setOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setBranches((prev) => prev.map((b) => b.id === editing.id ? { ...b, ...form } : b));
    } else {
      const newBranch: Branch = {
        id: Date.now().toString(), ...form,
        staffCount: 0, status: "active",
      };
      setBranches((prev) => [...prev, newBranch]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    setMenuOpen(null);
  };

  const toggleStatus = (id: string) => {
    setBranches((prev) => prev.map((b) => b.id === id ? { ...b, status: b.status === "active" ? "inactive" : "active" } : b));
    setMenuOpen(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500">Manage your business locations</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-1.5">
          <Plus size={15} /> Add Branch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{branches.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Branches</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{branches.filter(b => b.status === "active").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{branches.reduce((s, b) => s + b.staffCount, 0)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Staff</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{new Set(branches.map(b => b.city)).size}</p>
          <p className="text-xs text-slate-500 mt-0.5">Cities</p>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div key={branch.id} className="card relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-brand-600" />
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === branch.id ? null : branch.id)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg"
                >
                  <MoreHorizontal size={16} className="text-slate-400" />
                </button>
                {menuOpen === branch.id && (
                  <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[150px] p-1">
                    <button onClick={() => openEdit(branch)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={() => toggleStatus(branch.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                      <CheckCircle size={14} /> {branch.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(branch.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-1">{branch.name}</h3>
            <div className="space-y-1.5 text-sm text-slate-500">
              <div className="flex items-start gap-1.5">
                <MapPin size={13} className="shrink-0 mt-0.5" />
                <span>{branch.address}, {branch.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={13} />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={13} />
                <span>{branch.staffCount} staff members</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">Manager: <strong className="text-slate-700">{branch.manager}</strong></span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${branch.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {branch.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                {editing ? "Edit Branch" : "Add New Branch"}
              </Dialog.Title>
              <Dialog.Close className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch Name</label>
                <input className="input-field" placeholder="e.g. Westlands Branch" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                <input className="input-field" placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                <input className="input-field" placeholder="Nairobi, Mombasa..." value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <input className="input-field" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Manager Name</label>
                <input className="input-field" placeholder="Branch manager" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Dialog.Close className="btn-secondary flex-1 justify-center py-2.5 text-sm">Cancel</Dialog.Close>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                {editing ? "Save Changes" : "Add Branch"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

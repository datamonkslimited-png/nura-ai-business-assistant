"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Search, Edit3, Trash2, X, MoreHorizontal, Mail, Phone, Shield, UserCheck } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  role: string;
  branch: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  avatar: string;
  joinedDate: string;
}

const INITIAL_STAFF: Staff[] = [
  { id: "1", name: "Amina Hassan", role: "Senior Stylist", branch: "Westlands Branch", email: "amina@myboutique.co.ke", phone: "+254 712 111 001", status: "active", avatar: "AH", joinedDate: "Mar 2023" },
  { id: "2", name: "David Otieno", role: "Store Manager", branch: "CBD Flagship Store", email: "david@myboutique.co.ke", phone: "+254 723 222 002", status: "active", avatar: "DO", joinedDate: "Jan 2023" },
  { id: "3", name: "Grace Akinyi", role: "Branch Manager", branch: "Karen Outlet", email: "grace@myboutique.co.ke", phone: "+254 734 333 003", status: "active", avatar: "GA", joinedDate: "Jun 2023" },
  { id: "4", name: "Peter Kamau", role: "Sales Associate", branch: "Westlands Branch", email: "peter.k@myboutique.co.ke", phone: "+254 745 444 004", status: "active", avatar: "PK", joinedDate: "Sep 2023" },
  { id: "5", name: "Faith Wanjiku", role: "Cashier", branch: "CBD Flagship Store", email: "faith@myboutique.co.ke", phone: "+254 756 555 005", status: "active", avatar: "FW", joinedDate: "Nov 2023" },
  { id: "6", name: "Samuel Kipchoge", role: "Sales Associate", branch: "Mombasa Branch", email: "samuel@myboutique.co.ke", phone: "+254 767 666 006", status: "inactive", avatar: "SK", joinedDate: "Feb 2024" },
];

const ROLES = ["Store Manager", "Branch Manager", "Senior Stylist", "Stylist", "Sales Associate", "Cashier", "Security"];
const BRANCHES = ["Westlands Branch", "CBD Flagship Store", "Karen Outlet", "Mombasa Branch"];

const ROLE_COLORS: Record<string, string> = {
  "Store Manager": "bg-purple-100 text-purple-700",
  "Branch Manager": "bg-brand-100 text-brand-700",
  "Senior Stylist": "bg-amber-100 text-amber-700",
  "Stylist": "bg-emerald-100 text-emerald-700",
  "Sales Associate": "bg-slate-100 text-slate-600",
  "Cashier": "bg-blue-100 text-blue-700",
  "Security": "bg-red-100 text-red-700",
};

const AVATAR_COLORS = ["bg-brand-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-teal-500"];
const EMPTY_FORM = { name: "", role: "", branch: "", email: "", phone: "" };

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = staff.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (member: Staff) => {
    setEditing(member);
    setForm({ name: member.name, role: member.role, branch: member.branch, email: member.email, phone: member.phone });
    setOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setStaff((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...form } : s));
    } else {
      const newMember: Staff = {
        id: Date.now().toString(), ...form,
        status: "active",
        avatar: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
        joinedDate: new Date().toLocaleString("default", { month: "short", year: "numeric" }),
      };
      setStaff((prev) => [...prev, newMember]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setMenuOpen(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff</h1>
          <p className="text-sm text-slate-500">Manage your team members</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-1.5">
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Staff</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{staff.filter(s => s.status === "active").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{BRANCHES.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Branches</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{staff.filter(s => s.role.includes("Manager")).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Managers</p>
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search staff by name, role, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <UserCheck size={14} />
            {filtered.length} members
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Staff Member</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Branch</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((member, idx) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-400">Since {member.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-600"}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-slate-600">{member.branch}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail size={11} />{member.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={11} />{member.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${member.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal size={15} className="text-slate-400" />
                      </button>
                      {menuOpen === member.id && (
                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[140px] p-1">
                          <button onClick={() => openEdit(member)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                            <Edit3 size={13} /> Edit
                          </button>
                          <button onClick={() => handleDelete(member.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                {editing ? "Edit Staff Member" : "Add Staff Member"}
              </Dialog.Title>
              <Dialog.Close className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input className="input-field" placeholder="Jane Wanjiku" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="">Select role...</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch</label>
                <select className="input-field" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                  <option value="">Select branch...</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input className="input-field" type="email" placeholder="staff@business.co.ke" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input className="input-field" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Dialog.Close className="btn-secondary flex-1 justify-center py-2.5 text-sm">Cancel</Dialog.Close>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                {editing ? "Save Changes" : "Add Staff"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

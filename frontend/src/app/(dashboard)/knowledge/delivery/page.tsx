"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Truck, Edit3, Trash2, X, MapPin, Clock } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  areas: string;
  fee: number;
  estimatedTime: string;
  minOrder: number;
  active: boolean;
}

const INITIAL_ZONES: Zone[] = [
  { id: "1", name: "Nairobi CBD & Westlands", areas: "CBD, Westlands, Parklands, Upper Hill, Kilimani", fee: 0, estimatedTime: "Same day (before 12PM)", minOrder: 2000, active: true },
  { id: "2", name: "Nairobi Suburbs", areas: "Karen, Langata, Kibera, South B, South C, Embakasi", fee: 250, estimatedTime: "Same day or next day", minOrder: 0, active: true },
  { id: "3", name: "Nairobi Outskirts", areas: "Kasarani, Ruiru, Kiambu, Thika, Juja", fee: 350, estimatedTime: "Next day", minOrder: 0, active: true },
  { id: "4", name: "Mombasa", areas: "Mombasa Island, Nyali, Bamburi, Likoni", fee: 500, estimatedTime: "1-2 business days", minOrder: 3000, active: true },
  { id: "5", name: "Other Towns", areas: "Kisumu, Nakuru, Eldoret, Meru, Nyeri", fee: 650, estimatedTime: "2-3 business days", minOrder: 3000, active: true },
  { id: "6", name: "Rural Areas", areas: "Areas not covered above", fee: 850, estimatedTime: "3-5 business days", minOrder: 5000, active: false },
];

const EMPTY_FORM = { name: "", areas: "", fee: "", estimatedTime: "", minOrder: "" };

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (zone: Zone) => {
    setEditing(zone);
    setForm({ name: zone.name, areas: zone.areas, fee: String(zone.fee), estimatedTime: zone.estimatedTime, minOrder: String(zone.minOrder) });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setZones(prev => prev.map(z => z.id === editing.id ? { ...z, name: form.name, areas: form.areas, fee: parseInt(form.fee) || 0, estimatedTime: form.estimatedTime, minOrder: parseInt(form.minOrder) || 0 } : z));
    } else {
      setZones(prev => [...prev, { id: Date.now().toString(), name: form.name, areas: form.areas, fee: parseInt(form.fee) || 0, estimatedTime: form.estimatedTime, minOrder: parseInt(form.minOrder) || 0, active: true }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => setZones(prev => prev.filter(z => z.id !== id));
  const toggleActive = (id: string) => setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));

  const activeZones = zones.filter(z => z.active).length;
  const freeZones = zones.filter(z => z.fee === 0 && z.active).length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Delivery Zones</h1>
          <p className="text-sm text-slate-500">Define delivery areas, fees, and estimated times</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-1.5">
          <Plus size={15} /> Add Zone
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{activeZones}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Zones</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{freeZones}</p>
          <p className="text-xs text-slate-500 mt-0.5">Free Delivery</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">KSh {Math.max(...zones.filter(z => z.active).map(z => z.fee))}</p>
          <p className="text-xs text-slate-500 mt-0.5">Max Fee</p>
        </div>
      </div>

      {/* Zones */}
      <div className="space-y-3">
        {zones.map((zone) => (
          <div key={zone.id} className={`card ${!zone.active ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                <Truck size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${zone.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {zone.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 mt-1">
                      <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500">{zone.areas}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-slate-900">
                      {zone.fee === 0 ? <span className="text-emerald-600">Free</span> : `KSh ${zone.fee}`}
                    </p>
                    {zone.minOrder > 0 && (
                      <p className="text-xs text-slate-400">Min. KSh {zone.minOrder.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <Clock size={12} className="text-slate-400" />
                  <p className="text-xs text-slate-500">{zone.estimatedTime}</p>
                </div>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(zone)} className="flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium">
                    <Edit3 size={11} /> Edit
                  </button>
                  <button onClick={() => toggleActive(zone.id)} className="flex items-center gap-1 text-xs text-slate-500 hover:underline font-medium ml-2">
                    {zone.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(zone.id)} className="flex items-center gap-1 text-xs text-red-500 hover:underline font-medium ml-2">
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                {editing ? "Edit Zone" : "Add Delivery Zone"}
              </Dialog.Title>
              <Dialog.Close className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Zone Name</label>
                <input className="input-field" placeholder="e.g. Nairobi CBD" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Areas Covered</label>
                <textarea className="input-field h-20 resize-none text-sm" placeholder="List the areas, neighborhoods, towns..." value={form.areas} onChange={e => setForm({ ...form, areas: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery Fee (KSh)</label>
                  <input className="input-field text-sm" type="number" placeholder="0 for free" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Min. Order (KSh)</label>
                  <input className="input-field text-sm" type="number" placeholder="0 for none" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated Time</label>
                <input className="input-field" placeholder="e.g. Same day or 1-2 business days" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Dialog.Close className="btn-secondary flex-1 justify-center py-2.5 text-sm">Cancel</Dialog.Close>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                {editing ? "Save Changes" : "Add Zone"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Search, Grid3X3, List, Tag, MoreVertical, Edit, Trash2, Eye, Package } from "lucide-react";

const PRODUCTS = [
  {
    id: "1", name: "Black Elegance Dress", sku: "DR-001", price: 3200, stock: 15,
    category: "Fashion", image: null, status: "active", orders: 23,
  },
  {
    id: "2", name: "Red Evening Gown", sku: "DR-002", price: 5800, stock: 8,
    category: "Fashion", image: null, status: "active", orders: 11,
  },
  {
    id: "3", name: "White Casual Blouse", sku: "BL-001", price: 1800, stock: 0,
    category: "Fashion", image: null, status: "out_of_stock", orders: 7,
  },
  {
    id: "4", name: "Blue Denim Jeans", sku: "JN-001", price: 2500, stock: 22,
    category: "Fashion", image: null, status: "active", orders: 34,
  },
  {
    id: "5", name: "Gold Necklace Set", sku: "ACC-001", price: 4500, stock: 5,
    category: "Accessories", image: null, status: "active", orders: 9,
  },
];

export default function ProductsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Products <span className="text-slate-400 text-lg font-normal">{PRODUCTS.length} of 300</span></h2>
          <p className="section-sub">Manage your product catalog for your AI to sell</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search + view toggle */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setView("grid")}
            className={`p-2.5 ${view === "grid" ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2.5 ${view === "list" ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Package size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No products yet</h3>
          <p className="text-slate-500 text-sm mb-6">Add your first product so your AI can start selling</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} /> Add Your First Product
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card-hover group relative">
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-brand-50 to-purple-50 rounded-xl mb-3 flex items-center justify-center">
                <Tag size={32} className="text-brand-200" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.sku} · {p.category}</p>
                </div>
                <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-slate-900">KSh {p.price.toLocaleString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === "active" ? "badge-green" : "badge-red"
                }`}>
                  {p.status === "active" ? `${p.stock} in stock` : "Out of stock"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{p.orders} orders</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Product", "SKU", "Price", "Stock", "Orders", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                        <Tag size={14} className="text-brand-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">KSh {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.stock}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.orders}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === "active" ? "badge-green" : "badge-red"
                    }`}>
                      {p.status === "active" ? "Active" : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><Edit size={14} /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-brand-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New Product</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
                <input type="text" placeholder="e.g. Black Elegance Dress" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (KSh) *</label>
                  <input type="number" placeholder="3200" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Quantity</label>
                  <input type="number" placeholder="10" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select className="input-field">
                  <option>Fashion</option>
                  <option>Electronics</option>
                  <option>Food</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe this product for your AI..." className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Image</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors cursor-pointer">
                  <p className="text-sm text-slate-400">Drop image here or click to upload</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button className="btn-primary flex-1 py-3">Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

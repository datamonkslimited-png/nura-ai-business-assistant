"use client";

import { useState } from "react";
import {
  Search, Filter, Plus, MessageSquare, Phone, Check, CheckCheck,
  Bot, ChevronDown, Send, Paperclip, Image, Smile, MoreVertical,
  Facebook, Instagram, X
} from "lucide-react";

const CONVERSATIONS = [
  {
    id: "1", name: "Joyce Kamau", phone: "+254712345678", channel: "whatsapp",
    lastMsg: "Yes please send me the M-Pesa number", time: "2m", unread: 2, aiHandled: true, avatar: "J",
  },
  {
    id: "2", name: "Peter Mwangi", phone: "+254723456789", channel: "whatsapp",
    lastMsg: "Okay I have sent the payment", time: "5m", unread: 0, aiHandled: true, avatar: "P",
  },
  {
    id: "3", name: "Sarah Wanjiru", phone: "+254734567890", channel: "facebook",
    lastMsg: "Do you deliver to Westlands?", time: "12m", unread: 1, aiHandled: true, avatar: "S",
  },
  {
    id: "4", name: "James Ochieng", phone: "+254745678901", channel: "whatsapp",
    lastMsg: "I want to cancel my order please", time: "28m", unread: 0, aiHandled: false, avatar: "J",
  },
  {
    id: "5", name: "Faith Njeri", phone: "+254756789012", channel: "instagram",
    lastMsg: "Is the red dress available in size 14?", time: "1h", unread: 0, aiHandled: true, avatar: "F",
  },
  {
    id: "6", name: "David Kimani", phone: "+254767890123", channel: "whatsapp",
    lastMsg: "Thank you! Will pick up tomorrow", time: "2h", unread: 0, aiHandled: true, avatar: "D",
  },
];

const MESSAGES = [
  { id: "1", from: "customer", text: "Hello, I'd like to order the black dress", time: "10:20 AM" },
  { id: "2", from: "ai", text: "Hi Joyce! 👋 Great choice! The Black Elegance Dress is available in sizes 8, 10, 12, and 14. Which size would you like?\n\nPrice: KSh 3,200 including delivery to Nairobi.\n\nShall I place the order for you?", time: "10:20 AM" },
  { id: "3", from: "customer", text: "Size 12 please, I'm in Kilimani", time: "10:22 AM" },
  { id: "4", from: "ai", text: "Perfect! Here's your order summary:\n\n• Black Elegance Dress — Size 12\n• Delivery to Kilimani, Nairobi\n• Total: KSh 3,200\n\nTo confirm, please send payment via M-Pesa to:\n📱 Till Number: 123456\nAmount: KSh 3,200\n\nOnce you pay, I'll confirm your order and arrange delivery.", time: "10:22 AM" },
  { id: "5", from: "customer", text: "Yes please send me the M-Pesa number", time: "10:25 AM" },
];

const ChannelIcon = ({ channel }: { channel: string }) => {
  if (channel === "facebook") return <Facebook size={12} className="text-blue-500" />;
  if (channel === "instagram") return <Instagram size={12} className="text-pink-500" />;
  return <MessageSquare size={12} className="text-emerald-500" />;
};

export default function InboxPage() {
  const [selected, setSelected] = useState(CONVERSATIONS[0]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-white">
        {/* Header */}
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">Messages</h2>
            <div className="flex gap-2">
              <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                <Facebook size={12} /> Add Messenger
              </button>
              <button className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 border border-emerald-200">
                <MessageSquare size={12} /> Add WhatsApp
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {["all", "whatsapp", "facebook", "instagram"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone or message..."
              className="w-full pl-8 pr-4 py-2 text-sm bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* AI Status bar */}
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">All Conversations · {CONVERSATIONS.length}</span>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            AI Active
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={`w-full flex items-start gap-3 px-3 py-3 border-b border-slate-50 text-left hover:bg-slate-50 transition-colors ${
                selected.id === conv.id ? "bg-brand-50 border-l-2 border-l-brand-500" : ""
              }`}
            >
              <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 relative">
                {conv.avatar}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <ChannelIcon channel={conv.channel} />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{conv.name}</span>
                  <span className="text-xs text-slate-400">{conv.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMsg}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {conv.aiHandled && (
                    <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-medium">
                      AI
                    </span>
                  )}
                </div>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {conv.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="hidden md:flex flex-1 flex-col bg-surface-50">
        {/* Chat header */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold">
              {selected.avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.phone} · {selected.channel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
              <Bot size={12} /> AI On
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <Phone size={16} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "customer" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-xs lg:max-w-md`}>
                {msg.from === "ai" && (
                  <div className="flex items-center gap-1.5 mb-1 justify-end">
                    <Bot size={12} className="text-brand-500" />
                    <span className="text-xs text-brand-500 font-medium">AI Agent</span>
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                  msg.from === "customer"
                    ? "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                    : "bg-gradient-brand text-white rounded-tr-sm"
                }`}>
                  {msg.text}
                </div>
                <p className={`text-xs text-slate-400 mt-1 ${msg.from === "customer" ? "text-left" : "text-right"}`}>
                  {msg.time}
                  {msg.from !== "customer" && <CheckCheck size={12} className="inline ml-1 text-brand-300" />}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-100 p-3">
          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Paperclip size={16} /></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Image size={16} /></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Smile size={16} /></button>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-2.5 text-sm bg-surface-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform">
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
            <Bot size={12} className="text-brand-400" />
            AI is handling this conversation · <button className="text-brand-600 hover:underline">Take over</button>
          </p>
        </div>
      </div>
    </div>
  );
}

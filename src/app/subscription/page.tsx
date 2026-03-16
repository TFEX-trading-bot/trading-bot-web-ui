"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Edit2, Plus, Loader2, Bot, 
  Trash2, AlertTriangle, Menu 
} from "lucide-react";
import DashboardHeader from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import ProfileDropdown from "@/components/ProfileDropdown";
import axios from "axios";

// ✅ เชื่อมต่อกับ API บน Vercel
const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function AdminSubscriptionPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; subId: number | null }>({
    isOpen: false,
    subId: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    botNumber: 1,
    duration: 30
  });

  const fetchSubscriptions = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token || userRole?.toLowerCase() !== "admin") {
      alert("Unauthorized: Admins only");
      router.push("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/subscriptions`);
      const sortedData = response.data.sort((a: any, b: any) => a.id - b.id);
      setSubscriptions(sortedData);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const openModal = (sub: any = null) => {
    if (sub) {
      setEditingId(sub.id);
      setFormData({
        name: sub.name,
        price: sub.price.toString(),
        description: sub.description || "",
        botNumber: sub.botNumber,
        duration: sub.duration
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", price: "", description: "", botNumber: 1, duration: 30 });
    }
    setIsModalOpen(true);
  };

  const handleDeleteSub = async () => {
    if (!deleteModal.subId) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/subscriptions/${deleteModal.subId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(prev => prev.filter(s => s.id !== deleteModal.subId));
      setDeleteModal({ isOpen: false, subId: null });
      alert("Plan deleted successfully");
    } catch (err) {
      alert("Failed to delete plan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.price) < 0) {
      alert("Cannot set price lower than 0"); 
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      ...formData,
      price: Number(formData.price),
      botNumber: Number(formData.botNumber),
      duration: Number(formData.duration)
    };

    try {
      if (editingId) {
        await axios.patch(`${API_URL}/subscriptions/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Updated successfully");
      } else {
        await axios.post(`${API_URL}/subscriptions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Created successfully");
      }
      setIsModalOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving data");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-black">
      <Loader2 className="animate-spin text-[#8200DB] mb-2" size={40} />
      <p className="font-bold tracking-tight">Loading Plans...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative">
      {/* Backdrop สีดำโปร่งแสงสำหรับมือถือ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Hamburger Menu Drawer สำหรับมือถือ) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white text-black font-sans">
        {/* แถบด้านบนสำหรับมือถือ พร้อมปุ่ม Hamburger Menu */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 rounded-xl bg-purple-50 text-[#8200DB] hover:bg-purple-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="ml-4 text-[24px] font-black bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6] bg-clip-text text-transparent leading-normal tracking-tight pb-1">
              Subscription Plans
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title="Subscription Plans" />
        </div>

        <div className="p-8 lg:p-12 max-w-[1800px] w-full mx-auto overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            
            {subscriptions.map((sub) => (
              <div 
                key={sub.id} 
                className="group relative bg-[#F3E8FF] rounded-[2.5rem] p-8 border-2 border-[#E9D5FF] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-200/50 flex flex-col"
              >
                <div className="flex justify-between items-center mb-10">
                  <span className="text-[10px] font-black text-[#A855F7] tracking-[0.2em] uppercase opacity-50">ID: {sub.id}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(sub)} className="p-2 bg-white rounded-xl shadow-sm text-[#A855F7] hover:scale-110 transition-all"><Edit2 size={16} strokeWidth={2.5}/></button>
                    <button onClick={() => setDeleteModal({ isOpen: true, subId: sub.id })} className="p-2 bg-white rounded-xl shadow-sm text-rose-500 hover:bg-rose-50 hover:scale-110 transition-all"><Trash2 size={16} strokeWidth={2.5}/></button>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-[#6A0DAD] leading-tight truncate">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl lg:text-3xl font-bold text-[#6A0DAD]">฿</span>
                    <span className="text-5xl font-black text-[#6A0DAD] tracking-tighter">
                      {Number(sub.price).toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-[#A855F7] opacity-60">
                      /{sub.duration}d
                    </span>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/50">
                  <div className="flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-white/80">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-[#6A0DAD]"><Bot size={18} strokeWidth={2.5} /></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Limit</span>
                      <span className="text-xs font-black text-[#6A0DAD]">Max {sub.botNumber} Bots</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ✅ ปุ่มภายนอก: Add New Plan */}
            <button 
              onClick={() => openModal()}
              className="bg-[#F3E8FF]/40 rounded-[2.5rem] border-2 border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-[#A855F7] hover:bg-[#F3E8FF] transition-all min-h-[320px] gap-4 group"
            >
              <div className="p-4 bg-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <Plus size={40} strokeWidth={3} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Add New Plan</span>
            </button>
          </div>
        </div>

        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 text-black">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, subId: null })}></div>
            <div className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-black mb-2">Delete Plan?</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">This action cannot be undone. Are you sure you want to delete Plan ID: {deleteModal.subId}?</p>
                <div className="flex gap-4 w-full">
                  <button onClick={() => setDeleteModal({ isOpen: false, subId: null })} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-[10px] uppercase">Cancel</button>
                  <button onClick={handleDeleteSub} className="flex-1 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 shadow-lg transition-all text-[10px] uppercase">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-black">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-[#6A0DAD] mb-8">
                {editingId ? "Edit Subscription Plan" : "Create New Plan"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (฿)</label>
                    <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold resize-none outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Bots</label>
                    <input required type="number" value={formData.botNumber} onChange={(e) => setFormData({...formData, botNumber: Number(e.target.value)})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Duration</label>
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-2 h-full">
                       <button type="button" onClick={() => setFormData({...formData, duration: 30})} className={`flex-1 rounded-xl font-black text-[10px] uppercase transition-all ${formData.duration === 30 ? 'bg-[#6A0DAD] text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}>Monthly</button>
                       <button type="button" onClick={() => setFormData({...formData, duration: 365})} className={`flex-1 rounded-xl font-black text-[10px] uppercase transition-all ${formData.duration === 365 ? 'bg-[#6A0DAD] text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}>Yearly</button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  {/* ✅ ปุ่มภายใน Modal: เปลี่ยนข้อความตามโหมด Add/Edit */}
                  <button type="submit" className="flex-1 bg-[#6A0DAD] text-white py-4 rounded-2xl font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-lg">
                    {editingId ? "Update Plan" : "Create Plan"}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase hover:bg-slate-200 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
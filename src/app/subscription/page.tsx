"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Plus, Loader2, Bot, Type, DollarSign, MessageSquare } from "lucide-react";
import DashboardHeader from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import axios from "axios";

// ✅ URL ของ API ตามโครงสร้างโปรเจกต์
const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function AdminSubscriptionPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ State สำหรับควบคุม Popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    botNumber: 1,
    duration: 30
  });

  // ✅ 1. ฟังก์ชันดึงข้อมูลและเรียงตาม ID
  const fetchSubscriptions = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    // 🚩 ตรวจสอบสิทธิ์ Admin
    if (!token || userRole?.toLowerCase() !== "admin") {
      alert("สิทธิ์ไม่เพียงพอ: เฉพาะผู้ดูแลระบบเท่านั้น");
      router.push("/my-bot");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/subscriptions`);
      // ✅ เรียงลำดับตาม ID (น้อยไปมาก)
      const sortedData = response.data.sort((a: any, b: any) => a.id - b.id);
      setSubscriptions(sortedData);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      if (err.response?.status === 401) router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  // ✅ 2. ฟังก์ชันจัดการ Popup (Add/Edit)
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

  // ✅ 3. ฟังก์ชันบันทึกข้อมูล (POST/PATCH) ไปยัง NestJS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    // เตรียม Payload ให้ตรงกับ DTO
    const payload = {
      ...formData,
      botNumber: Number(formData.botNumber),
      duration: Number(formData.duration)
    };

    try {
      if (editingId) {
        // ✅ PATCH: /subscriptions/:id
        await axios.patch(`${API_URL}/subscriptions/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("แก้ไขข้อมูลสำเร็จ");
      } else {
        // ✅ POST: /subscriptions
        await axios.post(`${API_URL}/subscriptions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("เพิ่มแพ็กเกจสำเร็จ");
      }
      setIsModalOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-black font-bold">
      <Loader2 className="animate-spin text-[#8200DB] mb-2" size={40} />
      กำลังโหลดข้อมูล...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="sticky top-0 h-screen hidden md:block z-50">
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white text-black">
        <DashboardHeader title="Subscription Plans" />

        <div className="p-10 w-full">
          {/* ✅ Grid 3 คอลัมน์ชิดซ้าย */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            
            {subscriptions.map((sub) => (
              <div 
                key={sub.id} 
                className="group relative bg-[#F3E8FF] rounded-[2.5rem] p-10 border-2 border-[#E9D5FF] transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200/50"
              >
                {/* ID & Action Buttons */}
                <div className="flex justify-between items-start mb-6">
                  <span className="text-sm font-black text-[#A855F7] tracking-widest uppercase opacity-60">ID: {sub.id}</span>
                  <div className="flex gap-3 text-[#A855F7]">
                    <button onClick={() => openModal(sub)} className="hover:scale-125 transition-all">
                      <Edit2 size={24} strokeWidth={3} />
                    </button>
                    <button className="hover:text-rose-500 hover:scale-125 transition-all">
                      <X size={24} strokeWidth={4} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <h3 className="text-2xl font-black text-[#6A0DAD] truncate">{sub.name}</h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[#6A0DAD]">฿{Number(sub.price).toLocaleString()}</span>
                    <span className="text-2xl font-black text-[#A855F7]/60">/{sub.duration} Days</span>
                  </div>

                  {/* ✅ ส่วนแสดงจำนวนบอทจาก botNumber */}
                  <div className="pt-6 mt-4 border-t border-white/40">
                    <div className="flex items-center gap-3 text-[#6A0DAD] font-black">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-[#6A0DAD]">
                        <Bot size={24} strokeWidth={2.5} />
                      </div>
                      <span className="text-xl">Max {sub.botNumber || 0} Bots Authorized</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ปุ่ม Add New Plan */}
            <button 
              onClick={() => openModal()}
              className="bg-[#F3E8FF]/50 rounded-[2.5rem] border-4 border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-[#A855F7] hover:bg-[#F3E8FF] transition-all min-h-[280px] gap-4 group"
            >
              <div className="p-4 bg-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <Plus size={48} strokeWidth={3} />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em]">Add New Plan</span>
            </button>
          </div>
        </div>

        {/* ✅ Popup Modal พร้อม Informative Placeholders */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-black">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-3xl font-black text-[#6A0DAD] mb-8">
                {editingId ? "Edit Subscription Plan" : "Create New Subscription Plan"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500 uppercase flex items-center gap-2"><Type size={14}/> Name</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Gold Plan, Pro Tier" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500 uppercase flex items-center gap-2"><DollarSign size={14}/> Price</label>
                    <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="e.g. 1500.00" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 uppercase flex items-center gap-2"><MessageSquare size={14}/> Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the benefits of this plan..." className="w-full p-4 bg-slate-100 rounded-2xl font-bold resize-none outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500 uppercase flex items-center gap-2"><Bot size={14}/> Max Bot</label>
                    <input required type="number" value={formData.botNumber} onChange={(e) => setFormData({...formData, botNumber: Number(e.target.value)})} placeholder="e.g. 5" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#6A0DAD] transition-all" />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-black text-slate-500 uppercase mb-2">Duration</label>
                    <div className="flex bg-slate-100 p-2 rounded-2xl gap-2 h-full min-h-[58px]">
                       <button type="button" onClick={() => setFormData({...formData, duration: 30})} className={`flex-1 rounded-xl font-black text-sm uppercase transition-all ${formData.duration === 30 ? 'bg-[#6A0DAD] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200'}`}>Monthly</button>
                       <button type="button" onClick={() => setFormData({...formData, duration: 365})} className={`flex-1 rounded-xl font-black text-sm uppercase transition-all ${formData.duration === 365 ? 'bg-[#6A0DAD] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200'}`}>Yearly</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-[#6A0DAD] text-white py-4 rounded-2xl font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-200">
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
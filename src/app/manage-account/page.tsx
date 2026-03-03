"use client";

import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { CreditCard, User, Mail, Landmark, ShieldCheck, Loader2 } from "lucide-react";
import DashboardHeader from "@/components/Header";
import { useRouter } from "next/navigation";
import axios from "axios";

// ✅ เชื่อมต่อกับ API บน Vercel
const API_URL = "https://trading-bot-api-sigma.vercel.app"; 

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // ✅ 1. เพิ่ม State สำหรับชื่อที่จะใช้แสดงผล (จะเปลี่ยนเฉพาะตอนกด Save สำเร็จ)
  const [confirmedName, setConfirmedName] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    username: "",
    accountNumber: "", 
  });

  // ✅ ฟังก์ชันดึงข้อมูล Profile จาก API
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!userId || userId === "undefined" || !token) {
      router.push("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data;
      setFormData({
        id: user.id.toString(),
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        accountNumber: user.accountNumber || user.account_number || "", 
      });
      
      // ✅ 2. ตั้งค่าชื่อยืนยันเริ่มต้นจากข้อมูลที่ดึงมาครั้งแรก
      setConfirmedName(user.name || "");

    } catch (err: any) {
      console.error("Fetch Profile Error:", err);
      if (err.response?.status === 401) router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ ฟังก์ชันบันทึกการเปลี่ยนแปลง
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!formData.id) return;

    setIsUpdating(true);

    try {
      const response = await axios.patch(
        `${API_URL}/users/${formData.id}`,
        {
          name: formData.name,
          accountNumber: formData.accountNumber, 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ✅ 3. อัปเดตชื่อที่แสดงผลด้านบน เฉพาะเมื่อ API บันทึกสำเร็จ
      setConfirmedName(response.data.name);
      
      alert("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว!");
      
      setFormData(prev => ({ 
        ...prev, 
        name: response.data.name, 
        accountNumber: response.data.accountNumber 
      }));
    } catch (err: any) {
      console.error("Update Error:", err);
      alert(`ล้มเหลว: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#8200DB]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <aside className="sticky top-0 h-screen hidden md:block">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col">
        <DashboardHeader title="Profile Settings" />

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column - User Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center flex-1 text-black font-sans">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full bg-slate-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                    <User size={50} className="text-[#8200DB]" />
                  </div>
                </div>
                {/* ✅ 4. ใช้ confirmedName ตรงนี้ เพื่อไม่ให้ชื่อเปลี่ยนขณะกำลังพิมพ์ */}
                <h3 className="text-lg font-bold text-slate-800">{confirmedName}</h3>
                <p className="text-slate-400 text-sm mb-6">@{formData.username}</p>
              </div>

              {/* Billing Summary Card */}
              <div className="bg-gradient-to-br from-[#8200DB] to-[#5837F6] rounded-3xl p-6 text-white shadow-lg shadow-purple-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-white/20 p-2 rounded-xl"><CreditCard size={20} /></div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Active</span>
                </div>
                <p className="text-white/70 text-xs font-medium mb-1 font-sans">Current Plan</p>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-2xl font-bold font-sans italic">Basic</h2>
                  <span className="text-xl font-bold font-sans italic">฿99.00<span className="text-xs font-normal opacity-60">/mo</span></span>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/80 font-sans">
                  <ShieldCheck size={14} />
                  <span>Valid until 21/03/2026</span>
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 h-full flex flex-col text-black font-sans">
                <div className="mb-8 font-sans">
                  <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                  <p className="text-slate-400 text-sm">Update your personal details and billing information</p>
                </div>

                <form className="flex-1 flex flex-col justify-between" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider font-sans">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        {/* ช่องนี้จะใช้ formData.name เพื่อให้พิมพ์แก้ได้ปกติ */}
                        <input 
                          name="name" 
                          type="text" 
                          value={formData.name} 
                          onChange={handleChange} 
                          className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-[#8200DB] font-sans" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider font-sans">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="email" value={formData.email} disabled className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 cursor-not-allowed font-sans" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider font-sans">Bank Account</label>
                      <div className="relative">
                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input name="accountNumber" type="text" value={formData.accountNumber} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-[#8200DB] font-sans" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-6 border-t border-slate-50 flex items-center justify-end gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 font-sans">
                      Cancel
                    </button>
                    <button type="submit" disabled={isUpdating} className="px-10 py-3 bg-gradient-to-r from-[#8200DB] to-[#5837F6] text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 font-sans transition-all active:scale-95">
                      {isUpdating && <Loader2 size={18} className="animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
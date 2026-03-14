"use client";

import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { CreditCard, User, Mail, Landmark, ShieldCheck, Loader2, Menu } from "lucide-react";
import DashboardHeader from "@/components/Header";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useRouter } from "next/navigation";
import axios from "axios";

// ✅ เชื่อมต่อกับ API บน Vercel
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // ✅ 1. State สำหรับเก็บรายการแผนที่ดึงมาจาก API /subscriptions
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    username: "",
    accountNumber: "", 
    subscriptionId: null as number | null,
    subscriptionEndDate: null as string | null,
  });

  // ✅ 2. ฟังก์ชันดึงรายละเอียดแผนจากข้อมูลที่ดึงมาจาก API จริงๆ
  const getPlanDetails = (id: number | null) => {
    const activePlan = availablePlans.find(p => p.id === id);
    
    if (!activePlan) {
      return { name: "No Plan", price: "0.00", color: "from-slate-400 to-slate-500" };
    }

    const planColors: Record<number, string> = {
      1: "from-[#8200DB] to-[#5837F6]", // Basic
      2: "from-[#3B82F6] to-[#2DD4BF]", // Pro
      3: "from-[#F59E0B] to-[#EF4444]", // Gold
    };

    return {
      name: activePlan.name,
      price: typeof activePlan.price === 'number' ? activePlan.price.toFixed(2) : activePlan.price,
      color: planColors[activePlan.id] || "from-purple-500 to-indigo-500"
    };
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!userId || userId === "undefined" || !token) {
      router.push("/");
      return;
    }

    try {
      const [userRes, plansRes] = await Promise.all([
        axios.get(`${API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const user = userRes.data;
      setAvailablePlans(plansRes.data);

      setFormData({
        id: user.id.toString(),
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        accountNumber: user.accountNumber || user.account_number || "", 
        subscriptionId: user.subscription_id,
        subscriptionEndDate: user.subscription_end_date,
      });
      
      setConfirmedName(user.name || "");

    } catch (err: any) {
      console.error("Fetch Profile Error:", err);
      if (err.response?.status === 401) router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // ✅ เพิ่มการตรวจสอบข้อมูล (Validation) ก่อนส่ง API
    if (!formData.name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.accountNumber.trim()) {
      alert("Please enter your bank account number.");
      return;
    }

    if (!formData.id) return;
    setIsUpdating(true);

    try {
      const response = await axios.patch(
        `${API_URL}/users/${formData.id}`,
        {
          name: formData.name,
          accountNumber: formData.accountNumber, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmedName(response.data.name);
      alert("Changes saved successfully!");
      
      setFormData(prev => ({ 
        ...prev, 
        name: response.data.name, 
        accountNumber: response.data.accountNumber 
      }));
    } catch (err: any) {
      console.error("Update Error:", err);
      alert(`Failed: ${err.response?.data?.message || err.message}`);
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

  const currentPlan = getPlanDetails(formData.subscriptionId);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative">
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
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
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
              Profile
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title="Profile Settings" />
        </div>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column - Profile Summary & Plan Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-black">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full bg-slate-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                    <User size={50} className="text-[#8200DB]" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900">{confirmedName}</h3>
                <p className="text-slate-400 text-sm mb-2 font-bold tracking-tight">@{formData.username}</p>
              </div>

              <div className={`bg-gradient-to-br ${currentPlan.color} rounded-[2.5rem] p-8 text-white shadow-xl shadow-purple-200/50 transition-all duration-500`}>
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md"><CreditCard size={20} /></div>
                  <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                    {formData.subscriptionId ? 'Active' : 'No Plan'}
                  </span>
                </div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Membership Plan</p>
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-3xl font-black italic tracking-tighter">{currentPlan.name}</h2>
                  <div className="text-right">
                    <span className="text-2xl font-black italic">฿{currentPlan.price}</span>
                    <span className="text-[10px] block opacity-60 font-bold">/ MONTH</span>
                  </div>
                </div>
                <div className="pt-5 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/90 font-bold uppercase tracking-wide">
                  <ShieldCheck size={14} className="text-white" />
                  <span>
                    {formData.subscriptionEndDate 
                      ? `Expires: ${new Date(formData.subscriptionEndDate).toLocaleDateString('en-US')}` 
                      : 'Free Account Access'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Information Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 text-black">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                  <p className="text-slate-400 text-sm font-medium">Update your account settings and billing preferences.</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          name="name" type="text" value={formData.name} onChange={handleChange} 
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 font-bold transition-all" 
                          placeholder="Full Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="email" value={formData.email} disabled 
                          className="w-full pl-14 pr-6 py-4 bg-slate-100 border-none rounded-2xl text-slate-400 cursor-not-allowed font-bold" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Account Number</label>
                      <div className="relative">
                        <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          name="accountNumber" type="text" value={formData.accountNumber} onChange={handleChange} 
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 font-bold transition-all" 
                          placeholder="XXX-X-XXXXX-X"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50 flex items-center justify-end gap-6">
                    <button 
                      type="button" onClick={() => router.back()} 
                      className="text-slate-400 font-black text-sm hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit" disabled={isUpdating} 
                      className="px-12 py-4 bg-gradient-to-r from-[#8200DB] to-[#5837F6] text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-200 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      {isUpdating && <Loader2 size={18} className="animate-spin" />}
                      Save Profile
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
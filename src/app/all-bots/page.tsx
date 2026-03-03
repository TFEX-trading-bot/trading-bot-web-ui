"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Bot, User, Cpu, ShieldCheck, Loader2, Zap } from "lucide-react";
import DashboardHeader from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function AdminAllBotsPage() {
  const router = useRouter();
  const [allBots, setAllBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllBots = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token || userRole?.toLowerCase() !== "admin") {
      alert("สิทธิ์ไม่เพียงพอ: เฉพาะผู้ดูแลระบบเท่านั้น");
      router.push("/my-bot");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/bots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // ข้อมูลที่ได้จะเป็น Array ของ Bot object
      setAllBots(response.data);
    } catch (err: any) {
      console.error("Fetch All Bots Error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAllBots();
  }, [fetchAllBots]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-black">
        <Loader2 className="animate-spin text-[#8200DB] mb-4" size={40} />
        <p className="font-bold">กำลังโหลดข้อมูลบอทระบบ...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="sticky top-0 h-screen hidden md:block z-50">
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardHeader title="All Bots" />

        <div className="p-10 max-w-[1600px] w-full mx-auto overflow-y-auto text-black">
          {allBots.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold italic">-- ไม่พบข้อมูลบอทในระบบ --</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {allBots.map((bot) => (
                <div key={bot.id} className="bg-[#F3E8FF] rounded-[2.5rem] p-8 border-2 border-[#E9D5FF] relative transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200/50">
                  
                  {/* Header: ID & Status */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white rounded-xl text-[#A855F7] shadow-sm">
                        <Cpu size={18} />
                      </div>
                      <p className="text-[10px] font-black text-[#A855F7] uppercase tracking-[0.2em]">ID : {bot.id}</p>
                    </div>
                    {/* แสดงสถานะตาม API: RUNNING หรือ PAUSE */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 border ${bot.status === 'RUNNING' ? 'border-emerald-100 text-emerald-600' : 'border-rose-100 text-rose-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${bot.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{bot.status}</span>
                    </div>
                  </div>

                  {/* Bot Main Info */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-[#A855F7] text-[#A855F7] shadow-sm flex-shrink-0">
                      <Bot size={32} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-[#6A0DAD] truncate tracking-tight">
                        {/* แสดงชื่อหุ้น/สัญลักษณ์ที่บอทเทรด */}
                        {bot.stock} 
                      </h3>
                      <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                        <User size={12} /> Owner ID: {bot.userId} 
                      </p>
                    </div>
                  </div>

                  {/* Data Section: แสดง Bot Type ให้ตรงกับ Database */}
                  <div className="pt-6 border-t border-white/50 space-y-5">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Zap size={10} /> Bot Strategy Type
                        </p>
                        {/* ✅ ดึงค่า botType จาก API (เช่น POLICY หรือ AI) */}
                        <p className="text-xl font-black text-[#6A0DAD] tracking-tight">
                          {bot.botType} 
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1">
                          <ShieldCheck size={10} /> Visibility
                        </p>
                        <div className={`inline-block px-3 py-1 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${bot.public ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                          {bot.public ? 'Public' : 'Private'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
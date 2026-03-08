"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Bot, User, Cpu, ShieldCheck, Loader2, Zap } from "lucide-react";
import DashboardHeader from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function AdminAllBotsPage() {
  const router = useRouter();
  const [allBots, setAllBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllBots = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token || userRole?.toLowerCase() !== "admin") {
      alert("Unauthorized: Admins only");
      router.push("/");
      return;
    }

    try {
      const botResponse = await axios.get(`${API_URL}/bots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bots = botResponse.data;

      const botsWithUsernames = await Promise.all(
        bots.map(async (bot: any) => {
          try {
            const userResponse = await axios.get(`${API_URL}/users/${bot.userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return { 
              ...bot, 
              ownerName: userResponse.data.username || userResponse.data.name || `User ${bot.userId}` 
            };
          } catch (err) {
            return { ...bot, ownerName: `Unknown (ID: ${bot.userId})` };
          }
        })
      );

      setAllBots(botsWithUsernames);
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
        <p className="font-bold">Loading system bots...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="sticky top-0 h-screen hidden md:block z-50">
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white text-black">
        <DashboardHeader title="All Bots" />

        {/* ✅ ปรับ max-w เป็น 1800px เพื่อให้รองรับ 4 คอลัมน์ได้กว้างขึ้น */}
        <div className="p-6 lg:p-10 max-w-[1800px] w-full mx-auto overflow-y-auto">
          {allBots.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold italic tracking-widest">-- No bots found in the system --</div>
          ) : (
            /* ✅ แก้ไขจุดนี้: ปรับเป็น xl:grid-cols-4 เพื่อให้แสดง 4 คอลัมน์ */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allBots.map((bot) => (
                <div key={bot.id} className="bg-[#F3E8FF] rounded-[2rem] p-6 border-2 border-[#E9D5FF] relative transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50">
                  
                  {/* Header: ID & Status */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-lg text-[#A855F7] shadow-sm border border-purple-50">
                        <Cpu size={14} />
                      </div>
                      <p className="text-[9px] font-black text-[#A855F7] uppercase tracking-tighter">ID : {bot.id}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 border ${bot.status === 'RUNNING' ? 'border-emerald-100 text-emerald-600' : 'border-rose-100 text-rose-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${bot.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">{bot.status}</span>
                    </div>
                  </div>

                  {/* Bot Main Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-[#A855F7] text-[#A855F7] shadow-sm flex-shrink-0">
                      <Bot size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-[#6A0DAD] truncate tracking-tight leading-none mb-1.5">
                        {bot.stock} 
                      </h3>
                      <p className="text-[9px] font-bold text-[#A855F7] uppercase tracking-tighter flex items-center gap-1 opacity-80">
                        Owner : {bot.ownerName} 
                      </p>
                    </div>
                  </div>

                  {/* Data Section */}
                  <div className="pt-4 border-t border-white/50 space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Zap size={8} /> Bot Type
                        </p>
                        <p className="text-sm font-black text-[#6A0DAD] tracking-tight">
                          {bot.botType} 
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1">
                          <ShieldCheck size={8} /> Visibility
                        </p>
                        <div className={`inline-block px-2.5 py-1 text-white rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm ${bot.public ? 'bg-emerald-500' : 'bg-slate-400'}`}>
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
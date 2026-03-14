"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Bot, User, Cpu, ShieldCheck, Loader2, Zap, Menu } from "lucide-react";
import DashboardHeader from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function AdminAllBotsPage() {
  const router = useRouter();
  const [allBots, setAllBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      <main className="flex-1 flex flex-col min-w-0 bg-white text-black">
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
              All Bots
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title="All Bots" />
        </div>

        {/* ✅ ปรับ max-w เป็น 1800px เพื่อให้รองรับ 4 คอลัมน์ได้กว้างขึ้น */}
        <div className="p-6 lg:p-10 max-w-[1800px] w-full mx-auto overflow-y-auto">
          {allBots.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold italic tracking-widest">-- No bots found in the system --</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allBots.map((bot) => (
                <div 
                  key={bot.id} 
                  className="group relative rounded-[2rem] p-6 border-2 bg-[#F3E8FF] border-[#E9D5FF] transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50"
                >
                  {/* Status/Type Tag */}
                  <div className="absolute top-6 right-6">
                    <div className={`px-3 py-1 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${bot.public ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                      {bot.public ? 'Public' : 'Private'}
                    </div>
                  </div>

                  {/* Header: Icon + Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-[#A855F7] text-[#A855F7] shadow-sm flex-shrink-0">
                      <Bot size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 pr-12">
                      <p className="text-[9px] mb-2 font-black uppercase text-[#A855F7] opacity-70 tracking-tighter">
                        ID : {bot.id} | {bot.botType}
                      </p>
                      <h3 className="text-lg font-black text-[#6A0DAD] truncate tracking-tight leading-none">
                        {bot.stock || "Unknown Stock"}
                      </h3>
                    </div>
                  </div>

                  {/* Owner Info & PnL */}
                  <div className="mb-6 px-1 space-y-2">
                    <p className="text-xs text-slate-600 font-bold flex items-center gap-2 truncate">
                      <User size={14} className="text-[#A855F7]" /> Owner: {bot.ownerName}
                    </p>
                    <p className="text-xs text-slate-600 font-bold flex items-center gap-2 truncate">
                      <Zap size={14} className="text-[#A855F7]" /> PnL: <span className={Number(bot.totalPnL) >= 0 ? "text-emerald-500" : "text-rose-500"}>{Number(bot.totalPnL || 0).toLocaleString()} ฿</span>
                    </p>
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
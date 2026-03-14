"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, Bot as BotIcon, Menu } from "lucide-react"; 
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header";
import BotDisplayCard from '@/components/BotDisplayCard';
import AddBotCard from '@/components/AddBotCard';
import ProfileDropdown from "@/components/ProfileDropdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function MyBotPage() {
  const router = useRouter();
  const [bots, setBots] = useState<any[] | null>(null);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ 1. ฟังก์ชันดึงข้อมูลและเรียงลำดับตาม ID
  const fetchBots = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id"); 

    if (!userId || userId === "undefined" || !token) {
      console.warn("Session expired or User ID not found.");
      router.push("/"); 
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/bots/user/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      const rawData = Array.isArray(res.data) ? res.data : [];
      const sortedBots = rawData.sort((a: any, b: any) => a.id - b.id);
      
      setBots(sortedBots);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
      if (err.response?.status === 401) router.push("/");
      setBots([]); 
    }
  }, [router]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  // ✅ 2. ฟังก์ชันจัดการการคลิกนำทางไปยัง Dashboard
  const handleCardClick = (id: number) => {
    setNavigatingId(id); 
    router.push(`/bot-dashboard/${id}`);
  };

  // ✅ 3. ฟังก์ชันนำทางไปยังหน้าสร้างบอท
  const handleAddBotClick = () => {
    router.push('/create-bot');
  };

  // ✅ คำนวณผลรวม PnL เพื่อนำไปแสดงผลสรุป (Overview)
  const totalPnL = useMemo(() => {
    if (!bots) return 0;
    return bots.reduce((sum, bot) => sum + Number(bot.totalPnL || 0), 0);
  }, [bots]);

  const renderedBots = useMemo(() => {
    if (!bots) return null;

    return bots.map((bot) => {
      let cardVariant: "green" | "red" | "gray" = "gray";
      const pnl = Number(bot.totalPnL || 0);

      if (pnl > 0) cardVariant = "green";
      else if (pnl < 0) cardVariant = "red";

      return (
        <div 
          key={bot.id} 
          onClick={() => handleCardClick(bot.id)}
          onMouseEnter={() => router.prefetch(`/bot-dashboard/${bot.id}`)}
          className="group relative cursor-pointer active:scale-95 hover:scale-[1.02] transition-all duration-200"
        >
          {navigatingId === bot.id && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-[2rem]">
              <Loader2 className="animate-spin text-[#8200DB]" size={32} />
              <p className="text-[10px] font-black text-[#8200DB] mt-2 uppercase tracking-tighter">Entering...</p>
            </div>
          )}

          <BotDisplayCard
            name={bot.stock || "Unknown"} 
            price={pnl} 
            change={bot.change || "+0.00"} 
            changePct={bot.changePct || "0.00%"}
            currency="THB"
            variant={cardVariant} 
            botKind={bot.botType?.toLowerCase() === 'ai' ? 'ai' : 'manual'}
          />
        </div>
      );
    });
  }, [bots, router, navigatingId]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      
      {/* Backdrop สีดำโปร่งแสงสำหรับมือถือ (คลิกเพื่อปิดเมนู) */}
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

      <main className="flex flex-col flex-1 bg-white min-w-0">
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
              My Bot
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือเพื่อไม่ให้ซ้ำซ้อน */}
        <div className="hidden md:block">
          <DashboardHeader title="My Bot" />
        </div>

        <div className="p-8 overflow-y-auto">
          
          {/* --- Dashboard Overview Section --- */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm min-w-[240px] flex items-center gap-5">
               <div className={`p-4 rounded-2xl ${totalPnL >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  <TrendingUp size={28} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total PnL</p>
                 <p className={`text-3xl font-black tracking-tight ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {totalPnL > 0 ? '+' : ''}{totalPnL.toFixed(2)} <span className="text-sm font-bold opacity-70">THB</span>
                 </p>
               </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm min-w-[200px] flex items-center gap-5">
               <div className="p-4 rounded-2xl bg-purple-50 text-[#8200DB]">
                  <BotIcon size={28} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Bots</p>
                 <p className="text-3xl font-black text-slate-800 tracking-tight">
                   {bots ? bots.length : 0}
                 </p>
               </div>
            </div>
          </div>

          {/* --- Bot Cards Grid (ปรับเลย์เอาต์ให้แสดงผลได้ 5 คอลัมน์ในจอใหญ่) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 transition-opacity duration-300">
            {renderedBots}
            
            {/* ✅ ปุ่ม Add Bot Card ที่เชื่อมไปยังหน้า create-bot */}
            <div 
              onClick={handleAddBotClick}
              onMouseEnter={() => router.prefetch('/create-bot')}
              className="cursor-pointer active:scale-95 hover:scale-[1.02] transition-all duration-200"
            >
              <AddBotCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
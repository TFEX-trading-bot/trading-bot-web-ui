"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, Copy, Star, Zap, Loader2, ShieldCheck, SearchX } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/Header"; 

const API_URL = "https://trading-bot-api-sigma.vercel.app";

const cardColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-fuchsia-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-purple-600",
];

export default function MarketPlacePage() {
  const [bots, setBots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarketBots = useCallback(async () => {
    setIsLoading(true);
    try {
      const botRes = await axios.get(`${API_URL}/bots`);
      
      // ✅ กรองเฉพาะบอทที่เป็น PUBLIC และประเภท POLICY เท่านั้น (คัด AI ออก)
      const filteredBots = botRes.data.filter((bot: any) => 
        bot.public === true && 
        bot.bot_type === "POLICY"
      );

      // ดึงข้อมูล User และคำนวณสถิติ
      const botsWithDetails = await Promise.all(
        filteredBots.map(async (bot: any, index: number) => {
          try {
            const userRes = await axios.get(`${API_URL}/users/${bot.userId}`);
            
            const win = bot.win_count || 0;
            const loss = bot.loss_count || 0;
            const total = win + loss;
            const actualWinRate = total > 0 ? ((win / total) * 100).toFixed(1) : "0.0";

            return {
              ...bot,
              displayColor: cardColors[index % cardColors.length],
              userName: userRes.data.username || "Verified Trader",
              calculatedWinRate: actualWinRate
            };
          } catch (err) {
            return {
              ...bot,
              displayColor: cardColors[index % cardColors.length],
              userName: "Verified Trader",
              calculatedWinRate: "0.0"
            };
          }
        })
      );
        
      setBots(botsWithDetails);
    } catch (err) {
      console.error("Fetch Market Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketBots();
  }, [fetchMarketBots]);

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#8B5CF6] w-12 h-12" />
      <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Syncing Market Data...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800">
      <aside className="sticky top-0 h-screen hidden md:block z-40">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardHeader title="Market Place" />

        <div className="p-8 lg:p-12 max-w-[1600px] w-full mx-auto">
          
          {/* ✅ Empty State: ไร้ Border และปรับสีให้ชัดเจน */}
          {bots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-48 animate-in fade-in duration-700">
              <div className="mb-8">
                {/* ไอคอนสีม่วงเข้มเพื่อให้ตัดกับพื้นหลังขาว */}
                <SearchX size={80} className="text-[#8B5CF6] opacity-90" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-[0.2em]">ไม่พบเจอบอทในตลาด</h3>
              <p className="text-slate-500 text-sm font-bold uppercase mt-3 tracking-widest">ขณะนี้ยังไม่มีบอทประเภท POLICY ที่เปิดใช้งานแบบสาธารณะ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {bots.map((bot) => (
                <div 
                  key={bot.id}
                  className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-purple-100/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${bot.displayColor} opacity-5 rounded-full group-hover:opacity-10 transition-opacity`} />
                  
                  {/* Author Row */}
                  <div className="mb-8 flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${bot.displayColor} flex items-center justify-center text-[10px] text-white font-black`}>
                        {bot.userName.charAt(0).toUpperCase()}
                      </div>
                      {/* ✅ ชื่อ User ตัวตรง ไม่มี @ */}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {bot.userName}
                      </span>
                    </div>
                    <div className={`p-3 bg-gradient-to-br ${bot.displayColor} rounded-2xl text-white shadow-lg shadow-purple-100 transform group-hover:rotate-12 transition-transform`}>
                      <Zap size={18} fill="currentColor" />
                    </div>
                  </div>

                  {/* Bot Identity & Copy Rate */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {bot.stock} Bot
                    </h3>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                        <Users size={12} className="text-[#8B5CF6]" />
                        <p className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest">
                          {Number(bot.copy_rate || 0).toLocaleString()} Copy Trades
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 relative z-10">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total PnL</p>
                      <p className={`text-xl font-black ${bot.totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {bot.totalPnL >= 0 ? '+' : ''}{Number(bot.totalPnL).toLocaleString()} ฿
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Win Rate</p>
                      <div className="flex items-center justify-end gap-1">
                          <Star size={12} fill="#8B5CF6" className="text-[#8B5CF6]" />
                          <p className="text-xl font-black text-slate-800">{bot.calculatedWinRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#1E1B4B]/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20">
                    <button 
                      onClick={() => console.log("Copying Bot ID:", bot.id)}
                      className="flex items-center gap-3 bg-[#8B5CF6] text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all uppercase text-[11px] tracking-widest"
                    >
                      <Copy size={16} /> Copy Strategy
                    </button>
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
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, Copy, Star, Zap, Loader2, SearchX, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/Header"; 
// ✅ นำเข้า useRouter สำหรับการเปลี่ยนหน้า
import { useRouter } from "next/navigation";

const API_URL = "https://trading-bot-api-sigma.vercel.app";

const cardColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
];

export default function MarketPlacePage() {
  const [bots, setBots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ✅ เรียกใช้งาน router
  const router = useRouter();

  const fetchMarketBots = useCallback(async () => {
    setIsLoading(true);
    try {
      const botRes = await axios.get(`${API_URL}/bots`);
      
      const filteredBots = botRes.data.filter((bot: any) => 
        bot.public === true && bot.botType === "POLICY"
      );

      const botsWithDetails = await Promise.all(
        filteredBots.map(async (bot: any, index: number) => {
          try {
            const userRes = await axios.get(`${API_URL}/users/${bot.userId}`);
            
            const history = bot.orderHistories || [];
            const totalOrders = history.length;
            
            const winOrders = history.filter((order: any) => {
              const profit = Number(order.totalProfit || 0);
              return profit >= 0; 
            }).length;
            
            const winRateValue = totalOrders > 0 
              ? ((winOrders / totalOrders) * 100).toFixed(1) 
              : "0.0";

            return {
              ...bot,
              displayColor: cardColors[index % cardColors.length],
              userName: userRes.data.username || userRes.data.name || "System Trader",
              calculatedWinRate: winRateValue,
              totalTrades: totalOrders
            };
          } catch (err) {
            return {
              ...bot,
              displayColor: cardColors[index % cardColors.length],
              userName: "Verified Trader",
              calculatedWinRate: "0.0",
              totalTrades: 0
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
    <div className="h-screen flex flex-col items-center justify-center bg-white text-black font-sans">
      <Loader2 className="animate-spin text-[#8B5CF6] w-12 h-12" />
      <p className="mt-4 font-black uppercase tracking-widest text-[10px]">Processing Trade Statistics...</p>
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
          
          {bots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-48 animate-in fade-in duration-700">
              <SearchX size={80} className="text-[#8B5CF6] mb-8" />
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">ไม่พบเจอบอทในตลาด</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {bots.map((bot) => (
                <div 
                  key={bot.id}
                  className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-purple-100/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden text-black"
                >
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${bot.displayColor} opacity-5 rounded-full`} />
                  
                  <div className="mb-8 flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${bot.displayColor} flex items-center justify-center text-[10px] text-white font-black`}>
                        {bot.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                        {bot.userName}
                      </span>
                    </div>
                    <div className={`p-3 bg-gradient-to-br ${bot.displayColor} rounded-2xl text-white shadow-lg shadow-purple-200 transform group-hover:rotate-12 transition-transform`}>
                      <Zap size={18} fill="currentColor" />
                    </div>
                  </div>

                  <div className="mb-8 relative z-10">
                    <h3 className="text-2xl font-black tracking-tight leading-none">
                      {bot.stock} 
                    </h3>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                        <Users size={12} className="text-[#8B5CF6]" />
                        <p className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-wider">
                          {Number(bot.copyRate || 0).toLocaleString()} Copy Trades
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 relative z-10">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total PnL</p>
                      <p className={`text-xl font-black ${bot.totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {bot.totalPnL >= 0 ? '+' : ''}{Number(bot.totalPnL).toLocaleString()} ฿
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Win Rate</p>
                      <div className="flex items-center justify-end gap-1 font-black text-xl text-slate-800">
                        <Star size={12} fill="#8B5CF6" className="text-[#8B5CF6]" />
                        {bot.calculatedWinRate}%
                      </div>
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-[#1E1B4B]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center z-20 p-6">
                    <button 
                      // ✅ แก้ไข: เมื่อกดแล้วให้เปลี่ยนหน้าไปที่ create-copy-bot พร้อมส่ง id ไปทาง URL
                      onClick={() => router.push(`/create-copy-bot/${bot.id}`)}
                      className="w-full bg-[#8B5CF6] text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 font-sans"
                    >
                      <Copy size={16} /> Copy Trade
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
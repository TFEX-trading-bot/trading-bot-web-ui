"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, Copy, Star, Zap, Loader2, SearchX, TrendingUp, Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/Header"; 
import ProfileDropdown from "@/components/ProfileDropdown";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800 relative">
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
              Market Place
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title="Market Place" />
        </div>

        <div className="p-8 lg:p-12 max-w-[1600px] w-full mx-auto">
          
          {bots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-48 animate-in fade-in duration-700">
              <SearchX size={80} className="text-[#8B5CF6] mb-8" />
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">ไม่พบเจอบอทในตลาด</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bots.map((bot) => (
                <div 
                  key={bot.id}
                  className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col text-black"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${bot.displayColor} flex items-center justify-center text-sm text-white font-black shadow-md`}>
                        {bot.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Creator</p>
                        <p className="text-sm font-bold text-slate-800 leading-none">{bot.userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <Users size={12} className="text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-600">{Number(bot.copyRate || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-6 flex-grow">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{bot.stock}</h3>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Policy</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 mb-5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total PnL</span>
                      <span className={`text-sm font-black ${bot.totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {bot.totalPnL >= 0 ? '+' : ''}{Number(bot.totalPnL).toLocaleString()} ฿
                      </span>
                    </div>
                    <div className="flex flex-col items-center border-x border-slate-100">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Trades</span>
                      <span className="text-sm font-black text-slate-700">{bot.totalTrades || 0}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Win Rate</span>
                      <div className="flex items-center gap-1 font-black text-sm text-slate-700">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        {bot.calculatedWinRate}%
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/create-copy-bot/${bot.id}`)}
                    className="w-full bg-slate-50 hover:bg-[#8B5CF6] text-slate-600 hover:text-white py-3 rounded-xl font-black uppercase text-[11px] tracking-widest border border-slate-100 hover:border-[#8B5CF6] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    <Copy size={16} /> Copy Strategy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
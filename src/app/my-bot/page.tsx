"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; 
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header";
import BotDisplayCard from '@/components/BotDisplayCard';
import AddBotCard from '@/components/AddBotCard';

const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function MyBotPage() {
  const router = useRouter();
  const [bots, setBots] = useState<any[] | null>(null);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);

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
      
      // ✅ ตรวจสอบข้อมูลและสั่งเรียงลำดับ ID จากน้อยไปมาก
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

  // ✅ 2. ฟังก์ชันจัดการการคลิกนำทาง
  const handleCardClick = (id: number) => {
    setNavigatingId(id); 
    router.push(`/bot-dashboard/${id}`);
  };

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
          // ✅ โหลดหน้าถัดไปล่วงหน้าเมื่อเมาส์วาง ช่วยให้เปลี่ยนหน้าเร็วขึ้น
          onMouseEnter={() => router.prefetch(`/bot-dashboard/${bot.id}`)}
          className="group relative cursor-pointer active:scale-95 hover:scale-[1.02] transition-all duration-200"
        >
          {/* ✅ Loading Overlay แสดงสถานะขณะกำลังเปลี่ยนหน้า */}
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="sticky top-0 h-screen hidden md:block">
        <Sidebar />
      </aside>

      <main className="flex flex-col flex-1 bg-white">
        <DashboardHeader title="My Bot" />

        <div className="p-8">
          {/* ✅ แสดงบอทที่เรียง ID แล้วในรูปแบบ Grid 3-4 คอลัมน์ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 transition-opacity duration-300">
            {renderedBots}
            <AddBotCard />
          </div>
        </div>
      </main>
    </div>
  );
}
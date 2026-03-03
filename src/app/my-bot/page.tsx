"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header";
import BotDisplayCard from '@/components/BotDisplayCard';
import AddBotCard from '@/components/AddBotCard';

const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function MyBotPage() {
  // ✅ 1. ตั้งค่าเริ่มต้นให้เป็น null แทน [] เพื่อเช็คว่า "ยังไม่ได้ดึง" หรือ "ดึงมาแล้วแต่ไม่มีข้อมูล"
  const [bots, setBots] = useState<any[] | null>(null);

  const fetchBots = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id") || "1"; 

    try {
      const res = await axios.get(`${API_URL}/bots/user/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      setBots(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
      setBots([]); // กัน Error แล้วค้าง
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const renderedBots = useMemo(() => {
    // ✅ 2. ถ้า bots ยังเป็น null (กำลังโหลดครั้งแรก) ให้แสดงแค่โครงร่างหรือว่างไว้ก่อนแบบเงียบๆ
    if (!bots) return null;

    return bots.map((bot) => {
      let cardVariant: "green" | "red" | "gray" = "gray";
      const pnl = Number(bot.totalPnL || 0);

      if (pnl > 0) cardVariant = "green";
      else if (pnl < 0) cardVariant = "red";

      return (
        <BotDisplayCard
          key={bot.id}
          name={bot.stock || "Unknown"} 
          price={pnl} 
          change={bot.change || "+0.00"} 
          changePct={bot.changePct || "0.00%"}
          currency="THB"
          variant={cardVariant} 
          botKind={bot.botType?.toLowerCase() === 'ai' ? 'ai' : 'manual'}
        />
      );
    });
  }, [bots]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="sticky top-0 h-screen hidden md:block">
        <Sidebar />
      </aside>

      <main className="flex flex-col flex-1 bg-white">
        <DashboardHeader title="My Bot" />

        <div className="p-8">
          {/* ✅ 3. Grid จะขยายตัวตามจำนวนบอทที่มีจริง ทำให้จังหวะ Render ดูสมูทขึ้น */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 transition-opacity duration-300">
            {renderedBots}
            <AddBotCard />
          </div>
        </div>
      </main>
    </div>
  );
}
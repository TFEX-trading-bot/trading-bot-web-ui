"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header";
import BotDisplayCard from '@/components/BotDisplayCard';
import AddBotCard from '@/components/AddBotCard';

const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function MyBotPage() {
  const router = useRouter();
  const [bots, setBots] = useState<any[] | null>(null);

  const fetchBots = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id"); 

    // ✅ ปรับ Redirect ให้กลับไปหน้าหลักหากไม่มี Session
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
      
      setBots(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
      // หาก Token หมดอายุ (401) ให้กลับไป Login ใหม่
      if (err.response?.status === 401) router.push("/");
      setBots([]); 
    }
  }, [router]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const renderedBots = useMemo(() => {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 transition-opacity duration-300">
            {renderedBots}
            <AddBotCard />
          </div>
        </div>
      </main>
    </div>
  );
}
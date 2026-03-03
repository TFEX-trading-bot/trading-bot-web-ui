"use client";

import React, { useState, useEffect } from 'react';
import BotDisplayCard from '@/components/BotDisplayCard';
import AddBotCard from '@/components/AddBotCard';
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header";
import { Loader2 } from "lucide-react";
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function MyBotPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      const token = localStorage.getItem("token");
      // เช็คให้ชัวร์ว่า key ใน localStorage ตรงกับตอน Login (ซึ่งปกติคุณใช้ user_id)
      const userId = localStorage.getItem("user_id");
      
      // ตรวจสอบความถูกต้องของข้อมูลก่อนยิง API
      if (!userId || userId === "undefined" || !token) {
        console.warn("Auth data missing, stopping fetch");
        setLoading(false);
        return;
      }

      try {
        // ลองตรวจสอบที่ Backend ว่าใช้ /api/bots หรือแค่ /bots
        const res = await axios.get(`${API_URL}/api/bots/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setBots(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("Fetch error details:", err.response?.status, err.message);
        // ถ้ายัง 404 ให้ลองเอา /api ออกในใจแล้วลองเทสดูครับ
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="sticky top-0 h-screen hidden md:block">
        <Sidebar />
      </aside>

      <main className="flex flex-col flex-1 bg-white">
        <DashboardHeader title="My Bot" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-8">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-[#6A0DAD] w-12 h-12" />
              <p className="text-slate-400 font-medium italic">กำลังดึงข้อมูลบอทจากระบบ...</p>
            </div>
          ) : (
            <>
              {bots.map((bot) => (
                <BotDisplayCard
                  key={bot.id}
                  name={bot.stock || "Unknown Bot"} 
                  price={bot.current_price || 0} 
                  change={bot.change_value || "0.00"}
                  changePct={bot.change_pct || "0.00%"}
                  currency="THB"
                  variant={bot.status === 'RUNNING' ? 'green' : 'gray'}
                  botKind={bot.bot_type?.toLowerCase() === 'ai' ? 'ai' : 'manual'}
                />
              ))}
              <AddBotCard />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
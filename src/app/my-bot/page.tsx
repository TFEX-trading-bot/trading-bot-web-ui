"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar"; // ปรับ path ตามโปรเจกต์ของคุณ
import DashboardHeader from "@/components/Header"; // ปรับ path ตามโปรเจกต์ของคุณ
import BotDisplayCard from '@/components/BotDisplayCard';
import AddBotCard from '@/components/AddBotCard';

const API_URL = "http://localhost:3000";

export default function MyBotPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      const token = localStorage.getItem("token");
      // ดึง ID ของคุณ ping (ID: 1)
      const userId = localStorage.getItem("user_id") || "1"; 

      try {
        // ยิงไปที่ Endpoint ที่คุณเทสผ่านใน Postman แล้ว
        const res = await axios.get(`${API_URL}/bots/user/${userId}`, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        // เก็บข้อมูลบอท (ในภาพ Postman คือ [ {id: 44, stock: "S50H26", ...}, ... ])
        setBots(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar ด้านข้าง */}
      <aside className="sticky top-0 h-screen hidden md:block">
        <Sidebar />
      </aside>

      <main className="flex flex-col flex-1 bg-white">
        <DashboardHeader title="My Bot Portfolio" />

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[#6A0DAD] w-12 h-12" />
                <p className="text-slate-400 font-medium italic text-black">กำลังดึงข้อมูลพอร์ตของคุณ...</p>
              </div>
            ) : (
              <>
                {bots.length > 0 ? (
                  bots.map((bot) => (
                    <BotDisplayCard
                      key={bot.id}
                      // ✅ ใช้ 'stock' ตามที่โชว์ใน Postman
                      name={bot.stock || "Unknown"} 
                      // ✅ ปัจจุบัน API ยังไม่มีส่งราคาล่าสุดมา ให้ default เป็น 0
                      price={0} 
                      change="+0.00"
                      changePct="0.00%"
                      currency="THB"
                      // ✅ เช็คสถานะ RUNNING / PAUSE จาก Database
                      variant={bot.status === 'RUNNING' ? 'green' : 'gray'}
                      // ✅ ใช้ 'botType' (T ตัวใหญ่) ตาม JSON ที่ส่งมาจาก NestJS
                      botKind={bot.botType?.toLowerCase() === 'ai' ? 'ai' : 'manual'}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center text-slate-400">
                    ไม่พบบอทในระบบสำหรับผู้ใช้นี้
                  </div>
                )}
                {/* ปุ่มสำหรับเพิ่มบอทใหม่ */}
                <AddBotCard />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
// src/components/Pricing.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Loader2, ArrowRight, Gem } from "lucide-react";

// ตั้งค่า URL ของ API หลังบ้าน
const API_URL = "https://trading-bot-api-sigma.vercel.app";

interface PricingProps {
  onOpenAuth: () => void;
}

export default function Pricing({ onOpenAuth }: PricingProps) {
  // --- ส่วนที่ 1: การจัดการสถานะและการดึงข้อมูลจาก API ---
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/subscriptions`);
      // กรองเฉพาะแผนรายเดือน (30 วัน) และเรียงตามลำดับ ID
      const monthlyPlans = response.data
        .filter((sub: any) => sub.duration === 30)
        .sort((a: any, b: any) => a.id - b.id);
      setSubscriptions(monthlyPlans);
    } catch (err) {
      console.error("Fetch Pricing Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // แสดง Loading ระหว่างรอข้อมูล
  if (loading) return (
    <div className="py-24 flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
      <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Loading Plans...</p>
    </div>
  );

  return (
    <section id="pricing" className="py-24 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        {/* ส่วนหัวข้อหลัก (Header) */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">
            เลือกแผนการลงทุน <span className="text-[#6A0DAD]">ของคุณ</span>
          </h2>
          <p className="text-slate-500 text-base font-medium max-w-xl mx-auto">
            เริ่มต้นได้ง่ายๆ ตามขนาดพอร์ตและความต้องการของคุณ
          </p>
        </div>

        {/* --- ส่วนที่ 2: ตารางการ์ด Pricing (ปรับความสูงการ์ด) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {subscriptions.map((sub) => {
            return (
              <div
                key={sub.id}
                // ✅ ปรับความสูงขั้นต่ำที่ min-h-[600px] เพื่อให้การ์ดดูยาวและโปร่งขึ้น
                className="group relative bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col min-h-[500px]"
              >
                {/* Header: ไอคอน Gem รูปแบบเดียวกันทั้งหมด และชื่อ Plan */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#F5F3FF] text-[#8B5CF6] rounded-2xl shadow-sm">
                    <Gem size={26} /> 
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {sub.name}
                  </h3>
                </div>

                {/* รายละเอียดแพ็กเกจ (Description) */}
                <div className="mb-8">
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {sub.description || "Start trading with our smart AI algorithm and technical analysis tools."}
                  </p>
                </div>

                {/* --- ส่วนที่ 3: ราคาและปุ่ม (ถูกดันลงล่างด้วย mt-auto) --- */}
                <div className="mt-auto"> 
                  {/* ราคา (Price) - ขนาด 5xl กำลังพอดี ไม่ใหญ่เกินไป */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">
                        {sub.price === 0 ? "฿0" : `฿${Number(sub.price).toLocaleString()}`}
                      </span>
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-1">
                        /Month
                      </span>
                    </div>
                  </div>

                  {/* ปุ่มดำเนินการ (Select Plan) - ดีไซน์สีน้ำเงินเข้มตามรูปภาพ */}
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all bg-[#1E1B4B] text-white hover:bg-[#8B5CF6] flex items-center justify-center gap-2 group/btn active:scale-95 shadow-lg shadow-purple-50"
                  >
                    Get Started Now 
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
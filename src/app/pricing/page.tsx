"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { Loader2, ArrowRight, Package, Rocket, Gem } from "lucide-react";
import DashboardHeader from "@/components/Header";
import CheckoutSummary from "@/components/CheckoutSummary";
import PaymentModal from "@/components/PaymentModal";
import SuccessModal from "@/components/SuccessModal";

const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function PricingPage() {
  // --- ส่วนที่ 1: การจัดการ States ---
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States สำหรับควบคุมการเปิด/ปิดของ Modal แต่ละขั้นตอน
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // --- ส่วนที่ 2: การดึงข้อมูลจาก API ---
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/subscriptions`);
      setSubscriptions(response.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  // --- ส่วนที่ 3: การประมวลผลข้อมูล (Filtering & Sorting) ---
  // กรองแผนตามรอบการชำระเงินที่เลือก (30 วัน หรือ 365 วัน)
  const filteredPlans = useMemo(() => {
    const targetDuration = billingCycle === "monthly" ? 30 : 365;
    return subscriptions
      .filter((sub) => sub.duration === targetDuration)
      .sort((a, b) => a.price - b.price);
  }, [subscriptions, billingCycle]);

  // --- ส่วนที่ 4: Logic การเลือกแผนและการตรวจสอบสิทธิ์ ---
  const handleSelectPlan = (sub: any) => {
    const token = localStorage.getItem("token");
    
    // ตรวจสอบว่าผู้ใช้ Login หรือยังก่อนจะดำเนินการชำระเงิน
    if (!token) {
      alert("Please login to continue with the purchase.");
      return;
    }

    // บันทึกข้อมูลแผนที่เลือกลงใน State เพื่อส่งต่อให้ Modal
    setSelectedPlan({
      id: sub.id,
      name: sub.name,
      price: sub.price,
      botNumber: sub.botNumber,
      billingCycle: billingCycle === "monthly" ? "Month" : "Year",
      description: sub.description
    });
    
    setIsCheckoutOpen(true);
  };

  // --- ส่วนที่ 5: การจัดการด้านความสวยงาม (Visuals) ---
  // กำหนดไอคอนและสีพื้นหลังตามชื่อของแผน
  const getPlanVisuals = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("basic")) return { icon: <Package size={24} />, color: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]" };
    if (n.includes("pro")) return { icon: <Rocket size={24} />, color: "text-[#7C3AED]", bg: "bg-[#EDE9FE]" };
    return { icon: <Gem size={24} />, color: "text-[#6D28D9]", bg: "bg-[#F3E8FF]" };
  };

  // แสดงหน้าจอ Loading ระหว่างรอข้อมูลจาก API
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
      <p className="mt-4 font-bold text-slate-400">Loading Plans...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800">
      <aside className="sticky top-0 h-screen hidden md:block z-40">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardHeader title="Pricing Plans" />

        <div className="p-6 lg:p-10 w-full max-w-[1400px] mx-auto">
          
          {/* ปุ่มสลับรอบการชำระเงิน (Monthly / Yearly) */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-100/70 p-1 rounded-xl flex items-center border border-slate-200/50">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-8 py-2 rounded-lg font-black text-xs uppercase transition-all duration-300 ${
                  billingCycle === "monthly" ? "bg-white shadow-md text-[#8B5CF6]" : "text-slate-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-8 py-2 rounded-lg font-black text-xs uppercase transition-all duration-300 ${
                  billingCycle === "yearly" ? "bg-white shadow-md text-[#8B5CF6]" : "text-slate-400"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* ตารางแสดงแพ็กเกจราคา */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredPlans.map((sub) => {
              const visuals = getPlanVisuals(sub.name);
              
              return (
                <div
                  key={sub.id}
                  className="group relative bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-purple-100/40 transition-all duration-500 flex flex-col min-h-[550px]"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 ${visuals.bg} ${visuals.color} rounded-2xl shadow-sm`}>
                      {visuals.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{sub.name}</h3>
                    </div>
                  </div>
                  
                  {/* รายละเอียดคำอธิบายแพ็กเกจ */}
                  <div className="space-y-4 mb-10 flex-grow">
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      {sub.description || "Get full access to our trading automation tools with advanced analytics."}
                    </p>
                  </div>

                  {/* ส่วนแสดงราคาและการคำนวณเงิน */}
                  <div className="flex items-baseline gap-1 mb-10 pb-8 border-b border-slate-50">
                    <span className="text-6xl font-black text-slate-900 tracking-tighter">฿{Number(sub.price).toLocaleString()}</span>
                    <span className="text-slate-400 font-black text-xs uppercase tracking-widest">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>

                  {/* ปุ่มกดเพื่อเลือกแผนและเข้าสู่หน้าชำระเงิน */}
                  <button
                    onClick={() => handleSelectPlan(sub)}
                    className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all bg-[#1E1B4B] text-white hover:bg-[#8B5CF6] hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-100 flex items-center justify-center gap-2 group/btn"
                  >
                    Select Plan <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* --- ส่วนที่ 6: การจัดการ Modals (Checkout -> Payment -> Success) --- */}
      {selectedPlan && (
        <>
          {/* Modal สรุปยอดก่อนชำระเงิน */}
          <CheckoutSummary 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
            plan={selectedPlan} 
            onConfirm={() => { 
              setIsCheckoutOpen(false); 
              setTimeout(() => setIsPaymentOpen(true), 400); 
            }} 
          />
          
          {/* Modal แสดง QR Code สำหรับชำระเงิน */}
          <PaymentModal 
            isOpen={isPaymentOpen} 
            onClose={() => setIsPaymentOpen(false)}
            onSuccess={() => { 
              setIsPaymentOpen(false); 
              setTimeout(() => setIsSuccessOpen(true), 400); 
            }}
            planId={selectedPlan.id} 
          />

          {/* Modal แจ้งเตือนเมื่อทำรายการสำเร็จ */}
          <SuccessModal 
            isOpen={isSuccessOpen} 
            onClose={() => setIsSuccessOpen(false)}
            planName={selectedPlan.name}
          />
        </>
      )}
    </div>
  );
}
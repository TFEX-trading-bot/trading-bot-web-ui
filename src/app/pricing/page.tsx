"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { Loader2, ArrowRight, Package, Rocket, Gem, Menu, Check, AlertTriangle } from "lucide-react";
import DashboardHeader from "@/components/Header";
import CheckoutSummary from "@/components/CheckoutSummary";
import PaymentModal from "@/components/PaymentModal";
import SuccessModal from "@/components/SuccessModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useRouter } from "next/navigation";

const API_URL = "https://trading-bot-api-sigma.vercel.app";

export default function PricingPage() {
  const router = useRouter();
  // --- ส่วนที่ 1: การจัดการ States ---
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
  
  // States สำหรับควบคุมการเปิด/ปิดของ Modal แต่ละขั้นตอน
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isPendingAlertOpen, setIsPendingAlertOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  const handleSelectPlan = async (sub: any) => {
    const token = localStorage.getItem("token");
    
    // ตรวจสอบว่าผู้ใช้ Login หรือยังก่อนจะดำเนินการชำระเงิน
    if (!token) {
      alert("Please login to continue with the purchase.");
      return;
    }

    setIsCheckingPending(true);
    try {
      // ✅ เช็คประวัติการชำระเงินก่อนว่ามี PENDING ค้างอยู่หรือไม่
      const historyRes = await axios.get(`${API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const historyData = Array.isArray(historyRes.data) ? historyRes.data : (historyRes.data?.data || []);
      const hasPending = historyData.some((item: any) => item.status === "PENDING");

      if (hasPending) {
        setIsPendingAlertOpen(true);
        return; // บล็อกการไปหน้า Checkout
      }
    } catch (error) {
      console.error("Failed to check payment history:", error);
    } finally {
      setIsCheckingPending(false);
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
              Pricing Plans
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title="Pricing Plans" />
        </div>

        <div className="p-6 lg:p-10 w-full max-w-[1400px] mx-auto relative">
          {/* องค์ประกอบตกแต่งพื้นหลังเพิ่มความมีมิติ */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-[100px] pointer-events-none z-0" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none z-0" />
          
          {/* ปุ่มสลับรอบการชำระเงิน (Monthly / Yearly) */}
          <div className="flex justify-center mb-12 relative z-10">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 relative z-10">
            {filteredPlans.map((sub, index) => {
              const visuals = getPlanVisuals(sub.name);
              const isPopular = index === 1; // ไฮไลต์แพ็กเกจตรงกลางให้โดดเด่น
              
              return (
                <div
                  key={sub.id}
                  className={`group relative rounded-[3rem] p-8 md:p-10 border shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col min-h-[550px] ${
                    isPopular 
                      ? "bg-gradient-to-b from-[#1E1B4B] to-[#31105e] border-[#5D0CA1] text-white transform md:-translate-y-4 hover:-translate-y-6 hover:shadow-purple-900/30" 
                      : "bg-white border-slate-100 hover:border-purple-200 hover:-translate-y-2 hover:shadow-purple-100/40 text-slate-900"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 rounded-2xl shadow-sm ${isPopular ? "bg-white/10 text-white" : `${visuals.bg} ${visuals.color}`}`}>
                      {visuals.icon}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isPopular ? "text-purple-200" : "text-slate-400"}`}>Plan</p>
                      <h3 className={`text-2xl font-black tracking-tight ${isPopular ? "text-white" : "text-slate-900"}`}>{sub.name}</h3>
                    </div>
                  </div>
                  
                  {/* รายละเอียดคำอธิบายแพ็กเกจ */}
                  <div className="space-y-4 mb-10 flex-grow">
                    <p className={`text-sm font-medium leading-relaxed ${isPopular ? "text-purple-100" : "text-slate-500"}`}>
                      {sub.description || "Get full access to our trading automation tools with advanced analytics."}
                    </p>
                    {/* เพิ่ม Checklist ฟีเจอร์ให้ดูมีมูลค่ามากขึ้น */}
                    <ul className={`space-y-3 mt-6 text-sm font-semibold ${isPopular ? "text-white/90" : "text-slate-600"}`}>
                      <li className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full ${isPopular ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-600"}`}><Check size={12} strokeWidth={3} /></span> 
                        {sub.botNumber || "Unlimited"} Trading Bots
                      </li>
                      <li className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full ${isPopular ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-600"}`}><Check size={12} strokeWidth={3} /></span> 
                        Real-time Market Data
                      </li>
                      <li className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full ${isPopular ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-600"}`}><Check size={12} strokeWidth={3} /></span> 
                        Advanced AI Strategies
                      </li>
                    </ul>
                  </div>

                  {/* ส่วนแสดงราคาและการคำนวณเงิน */}
                  <div className={`flex items-baseline gap-1.5 mb-10 pb-8 border-b ${isPopular ? "border-white/10" : "border-slate-50"}`}>
                    <span className={`text-2xl lg:text-3xl font-bold ${isPopular ? "text-purple-200" : "text-slate-400"}`}>฿</span>
                    <span className="text-5xl lg:text-6xl font-black tracking-tighter">{Number(sub.price).toLocaleString()}</span>
                    <span className={`font-black text-xs uppercase tracking-widest ${isPopular ? "text-purple-200" : "text-slate-400"}`}>
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  {/* ปุ่มกดเพื่อเลือกแผนและเข้าสู่หน้าชำระเงิน */}
                  <button
                    onClick={() => handleSelectPlan(sub)}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2 group/btn ${
                      isPopular
                        ? "bg-white text-[#1E1B4B] hover:bg-purple-50 shadow-white/20"
                        : "bg-[#1E1B4B] text-white hover:bg-[#8B5CF6] shadow-purple-100"
                    }`}
                    disabled={isCheckingPending}
                  >
                    {isCheckingPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>Select Plan <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></>
                    )}
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

      {/* Modal แจ้งเตือนกรณีมีรายการค้างชำระ (Pending Payment) */}
      {isPendingAlertOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 text-black">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPendingAlertOpen(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black mb-3">Pending Payment</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                You have an incomplete payment transaction. Please complete or cancel the pending payment before purchasing a new plan.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => router.push('/manage-account?tab=billing')} 
                  className="w-full py-4 bg-[#6A0DAD] text-white font-black rounded-2xl hover:bg-[#5D0CA1] shadow-lg shadow-purple-200 transition-all text-xs uppercase tracking-widest active:scale-95"
                >
                  Go to Billing History
                </button>
                <button 
                  onClick={() => setIsPendingAlertOpen(false)} 
                  className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
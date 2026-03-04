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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

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

  const filteredPlans = useMemo(() => {
    const targetDuration = billingCycle === "monthly" ? 30 : 365;
    return subscriptions
      .filter((sub) => sub.duration === targetDuration)
      .sort((a, b) => a.price - b.price);
  }, [subscriptions, billingCycle]);

  const getPlanVisuals = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("basic")) return { icon: <Package size={24} />, bg: "bg-[#F5F3FF]" };
    if (n.includes("pro")) return { icon: <Rocket size={24} />, bg: "bg-[#F5F3FF]" };
    return { icon: <Gem size={24} />, bg: "bg-[#F5F3FF]" };
  };

  const handleSelectPlan = (sub: any) => {
    setSelectedPlan({
      id: sub.id,
      name: sub.name,
      price: sub.price,
      botNumber: sub.botNumber,
      billingCycle: billingCycle === "monthly" ? "Month" : "Year"
    });
    setIsCheckoutOpen(true);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-black">
      <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
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
          
          {/* ✅ ลด Margin Bottom ลงเพื่อให้เห็น Card ไวขึ้น */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredPlans.map((sub) => {
              const visuals = getPlanVisuals(sub.name);
              
              return (
                <div
                  key={sub.id}
                  // ✅ ลด Padding เป็น p-8 และ min-h เป็น 480px เพื่อให้สั้นลง
                  className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-100/40 transition-all duration-500 flex flex-col min-h-[480px]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 ${visuals.bg} rounded-xl text-[#8B5CF6]`}>
                      {visuals.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{sub.name}</h3>
                  </div>
                  
                  <p className="text-slate-400 text-sm font-bold mb-8 flex-grow leading-snug">
                    {sub.description || `Unlock up to ${sub.botNumber} bots.`}
                  </p>

                  {/* ✅ ลด Padding Bottom และ Margin Bottom */}
                  <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-slate-50">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">฿{Number(sub.price).toLocaleString()}</span>
                    <span className="text-slate-400 font-black text-[10px] uppercase">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(sub)}
                    className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-[#1E1B4B] text-white hover:bg-[#8B5CF6] flex items-center justify-center gap-2"
                  >
                    Select Plan <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {selectedPlan && (
        <>
          <CheckoutSummary 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
            plan={selectedPlan} 
            onConfirm={() => { setIsCheckoutOpen(false); setTimeout(() => setIsPaymentOpen(true), 300); }} 
          />
          <PaymentModal 
            isOpen={isPaymentOpen} 
            onClose={() => setIsPaymentOpen(false)}
            onSuccess={() => { setIsPaymentOpen(false); setTimeout(() => setIsSuccessOpen(true), 300); }}
            planId={selectedPlan?.id || 0}
          />
          <SuccessModal 
            isOpen={isSuccessOpen} 
            onClose={() => setIsSuccessOpen(false)}
            planName={selectedPlan?.name || ""}
          />
        </>
      )}
    </div>
  );
}
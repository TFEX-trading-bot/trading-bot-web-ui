"use client";

import React, { useState } from "react";
import { CreditCard, Lock, ShieldCheck, X, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planId: number; 
}

export default function PaymentModal({ isOpen, onClose, onSuccess, planId }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    // จำลองการเชื่อมต่อ API
    setTimeout(() => {
      console.log("Paid for plan:", planId);
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 text-black">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-10 animate-in fade-in zoom-in">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20} /></button>

        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 text-black">
          <CreditCard size={24} className="text-[#6A0DAD]" />
          <h3 className="text-xl font-black">Card Details</h3>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Holder Name</label>
            <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-purple-200" placeholder="Full Name" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
            <div className="relative">
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold tracking-[0.2em]" placeholder="0000 0000 0000 0000" />
              <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold" placeholder="MM/YY" />
             <input type="password" maxLength={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold" placeholder="CVV" />
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <ShieldCheck size={14} /> Secured & Encrypted
          </div>

          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[#7111B6] to-[#5837F6] text-white py-5 rounded-[24px] font-black shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { CheckCircle2, CreditCard, ShieldCheck, ArrowRight, X } from "lucide-react";

interface CheckoutSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  // เพิ่ม Prop นี้เพื่อบอกหน้าหลักว่ากดยืนยันแล้วนะ
  onConfirm: () => void; 
  plan: {
    name: string;
    price: string;
    billingCycle: string;
  };
}

export default function CheckoutSummary({ isOpen, onClose, onConfirm, plan }: CheckoutSummaryProps) {
  if (!isOpen) return null;

  const subtotal = parseInt(plan.price.replace(/,/g, ""));
  const vat = subtotal * 0.07;
  const total = subtotal + vat;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-[0_32px_64px_rgba(106,13,173,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6A0DAD] rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">สรุปคำสั่งซื้อ</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-10">
          <div className="bg-slate-50 rounded-[32px] p-6 mb-8 border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6A0DAD]">Selected Plan</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{plan.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#6A0DAD]">฿{plan.price}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">per {plan.billingCycle}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-10 px-2">
            <div className="flex justify-between text-sm font-bold text-slate-500">
              <span>ราคาแพ็กเกจ (Subtotal)</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-500">
              <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
              <span>฿{vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-px bg-slate-100 my-4" />
            <div className="flex justify-between items-end">
              <span className="text-lg font-black text-slate-900 uppercase tracking-tight">ยอดชำระสุทธิ</span>
              <span className="text-3xl font-black text-[#6A0DAD]">
                ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={onConfirm} // เมื่อกดให้เรียกฟังก์ชันเปิดป๊อปอัปถัดไป
              className="w-full bg-[#6A0DAD] hover:bg-[#5D0CA1] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-xl shadow-purple-200 transition-all transform active:scale-95 group"
            >
              <CreditCard size={20} />
              ดำเนินการต่อเพื่อชำระเงิน
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secured & Encrypted Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
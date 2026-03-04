"use client";

import React from "react";
import { Check, ArrowRight, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export default function SuccessModal({ isOpen, onClose, planName }: SuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToDashboard = () => {
    onClose();
    router.push("/my-bot"); // พากลับไปหน้า My Bot
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop - ใช้สีสว่างและเบลอมากขึ้นเพื่อให้ดูคลีน */}
      <div 
        className="absolute inset-0 bg-white/60 backdrop-blur-xl transition-opacity"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[50px] shadow-[0_40px_80px_rgba(16,185,129,0.15)] p-12 text-center animate-in fade-in zoom-in duration-500 border border-emerald-50">
        
        {/* Success Animation Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* วงแหวนเอฟเฟกต์ด้านหลัง */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-150 duration-1000" />
            <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200 animate-bounce">
              <Check size={48} strokeWidth={4} />
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <div className="flex items-center justify-center gap-2 text-emerald-500 font-black uppercase tracking-[0.2em] text-xs">
            <PartyPopper size={16} />
            Payment Successful
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            สำเร็จแล้ว <span className="text-[#6A0DAD]">!</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            ตอนนี้คุณได้อัปเกรดเป็น <span className="font-bold text-slate-800">{planName}</span> เรียบร้อยแล้ว
            <span className="block mt-1">ระบบบอทอัจฉริยะของคุณพร้อมทำงานทันที</span>
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoToDashboard}
          className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-slate-200 group"
        >
          ไปยังหน้า My Bot
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Trading Bot System • 2026
        </p>
      </div>
    </div>
  );
}
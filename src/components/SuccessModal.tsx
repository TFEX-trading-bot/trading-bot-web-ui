"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export default function SuccessModal({ isOpen, onClose, planName }: SuccessModalProps) {
  const router = useRouter();

  // --- ส่วนที่ 1: ตรวจสอบสถานะการเปิด/ปิด Modal ---
  if (!isOpen) return null;

  // --- ส่วนที่ 2: ฟังก์ชันนำทางไปยังหน้า Dashboard ---
  const handleGoToDashboard = () => {
    onClose();
    router.push("/my-bot"); // พากลับไปหน้า My Bot หลังจากทำรายการสำเร็จ
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* ส่วนของพื้นหลัง (Backdrop) - ใช้การเบลอเพื่อความ Minimal */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md transition-opacity" />

      {/* ส่วนเนื้อหาหลักของ Modal (Modal Content) - คงขนาด max-w-md และ p-12 ไว้เท่าเดิม */}
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.1)] p-12 text-center animate-in fade-in zoom-in duration-500">
        
        {/* ส่วนแสดงไอคอนแอนิเมชันความสำเร็จ (Success Icon) */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-125" />
            <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Check size={40} strokeWidth={4} />
            </div>
          </div>
        </div>

        {/* ส่วนแสดงข้อความแจ้งข่าวดี (Success Message) */}
        <div className="mb-10">
          <p className="text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
            Payment Successful
          </p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
            Congratulations<span className="text-[#6A0DAD]">!</span>
          </h2>
          
          {/* ปรับข้อความให้กระชับและแยกบรรทัดตามคำขอ */}
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">You have successfully upgraded to</p>
            <p className="text-xl font-black text-[#6A0DAD] uppercase tracking-wide">
              {planName}
            </p>
          </div>
        </div>

        {/* ส่วนปุ่มดำเนินการ (Action Button) */}
        <button
          onClick={handleGoToDashboard}
          className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-slate-100 group"
        >
          Go to My Bot
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* ส่วนท้ายแสดงชื่อระบบ */}
        <p className="mt-8 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          Trading Bot System • 2026
        </p>
      </div>
    </div>
  );
}
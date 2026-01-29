"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Settings } from 'lucide-react';

export default function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("User");

  // โหลดชื่อ User จาก LocalStorage ตอนเริ่ม
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      // ทำให้ตัวแรกเป็นตัวพิมพ์ใหญ่ (Capitalize)
      setUsername(storedName.charAt(0).toUpperCase() + storedName.slice(1));
    }
  }, []);

  const handleLogout = () => {
    // ล้างข้อมูลทั้งหมด
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    // ดีดกลับไปหน้า Login
    router.push("/login");
  };

  return (
    <div className="relative z-50">
      {/* ปุ่ม Profile สีม่วงสวยๆ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white pl-1 pr-4 py-1 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all transform active:scale-95 border border-white/10"
      >
        {/* รูปไอคอนคน (วงกลม) */}
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
          <User size={18} className="text-white" />
        </div>
        
        {/* ชื่อ User */}
        <span className="font-semibold text-sm tracking-wide">{username}</span>
        
        {/* ลูกศรชี้ลง */}
        <ChevronDown 
          size={16} 
          className={`text-white/70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* เมนู Dropdown (จะโผล่มาเมื่อกดปุ่ม) */}
      {isOpen && (
        <>
          {/* Backdrop ใสๆ ไว้คลิกปิดเมนู */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
             
             {/* Header ของเมนู */}
             <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{username}</p>
             </div>

             {/* รายการเมนู */}
             <div className="p-1">
               <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2 transition-colors font-medium">
                 <Settings size={16} />
                 Account Settings
               </button>
               
               <div className="h-px bg-slate-100 my-1 mx-2"></div>
               
               <button
                 onClick={handleLogout}
                 className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
               >
                 <LogOut size={16} />
                 Sign out
               </button>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

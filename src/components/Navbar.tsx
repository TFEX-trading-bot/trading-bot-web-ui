"use client";

import { useState, useEffect } from "react";
import { Bot, Menu, X } from "lucide-react";

interface NavbarProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  // --- ส่วนที่ 1: การจัดการสถานะ (State) ---
  const [isScrolled, setIsScrolled] = useState(false); // เช็คว่ามีการ Scroll หน้าจอหรือไม่
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ควบคุมการเปิด/ปิดเมนูบนมือถือ

  // --- ส่วนที่ 2: Effect สำหรับตรวจจับการ Scroll ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ข้อมูลรายการเมนู
  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Markets", href: "#market" },
    { name: "Performance", href: "#performance" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-purple-80/80 backdrop-blur-md shadow-[0_4px_20px_rgba(106,13,173,0.1)] border-b border-purple-100 py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ส่วนของ Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="bg-[#6A0DAD] p-2 rounded-xl shadow-lg shadow-purple-200 group-hover:rotate-6 transition-transform">
              <Bot className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Trading<span className="text-[#6A0DAD]"> Bot</span> System
            </span>
          </div>

          {/* Desktop Menu - แสดงผลบนหน้าจอขนาดใหญ่ */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-slate-600 hover:text-[#6A0DAD] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6A0DAD] transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Auth Buttons - ปุ่มเข้าสู่ระบบและสมัครสมาชิกสำหรับ Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => onOpenAuth("login")}
              className="text-sm font-bold text-slate-700 hover:text-[#6A0DAD] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth("register")}
              className="bg-[#6A0DAD] hover:bg-[#5D0CA1] text-white px-7 py-2.5 rounded-2xl text-sm font-bold transition-all transform hover:scale-105 shadow-xl shadow-purple-200 active:scale-95"
            >
              Start Investing
            </button>
          </div>

          {/* Mobile Menu Button - ปุ่มเปิดเมนูสำหรับหน้าจอมือถือ */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-900 p-2 focus:outline-none bg-purple-50 rounded-lg border border-purple-100 shadow-sm"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel - แผงเมนูที่จะแสดงเมื่อกดปุ่มบนมือถือ */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-purple-100 absolute w-full left-0 z-40 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="px-6 pt-4 pb-8 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-4 text-base font-bold text-slate-700 hover:text-[#6A0DAD] border-b border-purple-50 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-6 flex flex-col space-y-4">
              <button
                onClick={() => { onOpenAuth("login"); setIsMobileMenuOpen(false); }}
                className="w-full py-4 text-slate-700 font-bold border-2 border-purple-100 rounded-2xl hover:bg-purple-50 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => { onOpenAuth("register"); setIsMobileMenuOpen(false); }}
                className="w-full py-4 bg-[#6A0DAD] text-white rounded-2xl font-bold shadow-lg shadow-purple-200"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
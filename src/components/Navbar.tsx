// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { Bot, Menu, X } from "lucide-react";

interface NavbarProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "จุดเด่นระบบ", href: "#features" },
    { name: "ตลาดที่รองรับ", href: "#market" },
    { name: "ผลตอบแทน", href: "#performance" },
    { name: "แพ็กเกจ", href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "glass-effect shadow-lg bg-brand-dark/95" : "glass-effect"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="bg-brand-500 p-2 rounded-lg shadow-[0_0_15px_rgba(165,69,242,0.5)]">
              <Bot className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wide">
              Trading<span className="text-brand-500">Bot</span>System
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-brand-500 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => onOpenAuth("login")}
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => onOpenAuth("register")}
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg shadow-brand-500/30"
            >
              เริ่มต้นลงทุน
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-brand-500 p-2 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-brand-card/95 backdrop-blur-xl border-t border-gray-700 absolute w-full left-0 z-40 shadow-2xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-brand-500/20 rounded-lg transition-colors border-l-4 border-transparent hover:border-brand-500"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-6 flex flex-col space-y-3 border-t border-gray-700 mt-4">
              <button
                onClick={() => {
                  onOpenAuth("login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center py-3 text-gray-300 border border-gray-600 rounded-xl hover:border-brand-500 hover:text-brand-500 transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => {
                  onOpenAuth("register");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 shadow-lg shadow-brand-500/30"
              >
                สมัครสมาชิก
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/components/AuthModal.tsx
"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  setMode,
}: AuthModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-brand-card border border-brand-500/20 rounded-2xl shadow-2xl shadow-brand-500/10 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {mode === "login" ? (
          <div id="login-form">
            <h2 className="text-2xl font-bold text-white mb-2">
              ยินดีต้อนรับกลับ
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              เข้าสู่ระบบเพื่อจัดการพอร์ตการลงทุนของคุณ
            </p>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("ระบบกำลังเข้าสู่ระบบจำลอง...");
                onClose();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center text-gray-400">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-gray-700 bg-gray-900 text-brand-500 focus:ring-brand-500"
                  />{" "}
                  จำฉันไว้ในระบบ
                </label>
                <a href="#" className="text-brand-500 hover:text-brand-400">
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-500/30"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              ยังไม่มีบัญชี?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-brand-500 font-bold hover:underline"
              >
                สมัครสมาชิก
              </button>
            </div>
          </div>
        ) : (
          <div id="register-form">
            <h2 className="text-2xl font-bold text-white mb-2">
              สร้างบัญชีผู้ใช้
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              เริ่มต้นใช้บอทเทรดฟรีวันนี้
            </p>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("ขอบคุณที่สมัครสมาชิก! เจ้าหน้าที่จะติดต่อกลับ");
                onClose();
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ชื่อ
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    นามสกุล
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-500/30"
              >
                สมัครสมาชิก
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              มีบัญชีอยู่แล้ว?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-brand-500 font-bold hover:underline"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

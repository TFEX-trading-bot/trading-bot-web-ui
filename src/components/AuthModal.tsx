"use client";

import { X, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ดึง API URL จาก Env
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
}

export default function AuthModal({ isOpen, onClose, mode, setMode }: AuthModalProps) {
  const router = useRouter();
  
  // States สำหรับ Form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ป้องกันการ Scroll เมื่อ Modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setError(""); 
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // ✅ ฟังก์ชัน Login: ตรวจสอบสิทธิ์ผ่าน Role จาก Database
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // 1. บันทึกข้อมูลลง LocalStorage
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("user_id", res.data.user_id);
      
      // ✨ จุดสำคัญ: บันทึก role ที่ดึงมาจาก DB จริงๆ
      localStorage.setItem("role", res.data.role); 
      
      onClose();

      // 🚩 เปลี่ยนหน้าตาม Role (admin หรือ user)
      if (res.data.role?.toLowerCase() === "admin") {
        router.push("/clients"); // ไปหน้าจัดการลูกค้า
      } else {
        router.push("/my-bot"); // ไปหน้าบอทส่วนตัว
      }
      
    } catch (err: any) {
      // ตรวจสอบ Error จากรหัสผ่านผิด (401 Unauthorized)
      setError(err.response?.status === 401 ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, { name, email, password });
      alert("สร้างบัญชีสำเร็จ! กรุณาเข้าสู่ระบบ");
      setMode("login"); 
    } catch (err: any) {
      setError("การลงทะเบียนล้มเหลว อีเมลนี้อาจถูกใช้ไปแล้ว");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl p-8 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-2">{mode === "login" ? "ยินดีต้อนรับกลับ" : "สร้างบัญชีผู้ใช้"}</h2>
        <p className="text-gray-400 mb-6 text-sm">
          {mode === "login" ? "เข้าสู่ระบบเพื่อจัดการพอร์ตของคุณ" : "เริ่มต้นใช้บอทเทรดฟรีวันนี้"}
        </p>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 text-xs p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form className="space-y-4" onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="ชื่อของคุณ"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">อีเมล</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">รหัสผ่าน</label>
            <input
              type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500 hover:text-white">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ยืนยันรหัสผ่าน</label>
              <input
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400 font-medium">
          {mode === "login" ? (
            <>ยังไม่มีบัญชี? <button onClick={() => setMode("register")} className="text-purple-500 font-bold hover:underline">สมัครสมาชิก</button></>
          ) : (
            <>มีบัญชีอยู่แล้ว? <button onClick={() => setMode("login")} className="text-purple-500 font-bold hover:underline">เข้าสู่ระบบ</button></>
          )}
        </div>
      </div>
    </div>
  );
}
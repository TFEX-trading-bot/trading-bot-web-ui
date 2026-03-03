"use client";

import { X, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ตั้งค่า API URL ให้ตรงกับที่คุณทดสอบผ่าน Postman
const API_URL = "http://localhost:3000"; 

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
}

export default function AuthModal({ isOpen, onClose, mode, setMode }: AuthModalProps) {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setError(""); 
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // ✅ ฟังก์ชัน Login ที่แก้ไขการดึง user_id
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // 1. เก็บ Token
      localStorage.setItem("token", res.data.access_token);
      
      // 2. เก็บ Username
      localStorage.setItem("username", res.data.username || "ping");

      // 3. ✅ จุดสำคัญ: ดึง User ID ให้ถูกต้อง (เช็คตามโครงสร้าง JSON ของคุณ)
      // ปกติจะอยู่ใน res.data.user_id หรือ res.data.user.id
      const idToStore = res.data.user_id || res.data.user?.id || "1"; 
      localStorage.setItem("user_id", String(idToStore));
      
      console.log("Login Success! User ID stored:", idToStore);

      onClose();
      // รีเฟรชหน้าเพื่อให้ MyBotPage ดึงค่าใหม่จาก LocalStorage
      window.location.href = "/my-bot"; 
    } catch (err: any) {
      setError(err.response?.status === 401 ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl p-8 text-white">
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
              <label className="block text-sm font-medium text-gray-300 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ชื่อของคุณ"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">อีเมล</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="name@example.com"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">รหัสผ่าน</label>
            <input
              type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500 hover:text-white">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ยืนยันรหัสผ่าน</label>
              <input
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg shadow-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
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
"use client";

import { X, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ✅ ใช้ API URL ตามที่คุณกำหนด
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
}

export default function AuthModal({ isOpen, onClose, mode, setMode }: AuthModalProps) {
  const router = useRouter();
  
  // --- State สำหรับข้อมูล Form ---
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- เกณฑ์ความปลอดภัยรหัสผ่าน ---
  const requirements = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    { label: "Contains letters", test: (pw: string) => /[A-Za-z]/.test(pw) },
    { label: "Contains numbers", test: (pw: string) => /\d/.test(pw) },
  ];

  const isPasswordSecure = requirements.every(req => req.test(password));

  // --- จัดการ Modal Side Effects ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setError(""); 
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // --- ✅ ฟังก์ชัน Login (เพิ่มการเช็ค Role) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // 1. จัดเก็บข้อมูลพื้นฐานลง localStorage
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", res.data.username || "User");
      localStorage.setItem("user_id", String(res.data.user_id || res.data.user?.id));
      
      // 2. ✅ จัดเก็บ Role (ตรวจสอบว่า API ส่งค่า role มาใน res.data.role)
      // ถ้าไม่มีการส่งมา ให้ Default เป็น 'user'
      const userRole = (res.data.role || "user").toLowerCase();
      localStorage.setItem("role", userRole);
      
      onClose();

      // 3. ✅ เลือกหน้าปลายทางตามสิทธิ์ (Role-Based Redirection)
      if (userRole === "admin") {
        // ถ้าเป็น Admin ให้ไปหน้าจัดการลูกค้า
        window.location.href = "/clients"; 
      } else {
        // ถ้าเป็น User ทั่วไป ให้ไปหน้าบอทของฉัน
        window.location.href = "/my-bot"; 
      }
      
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชัน Register ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordSecure) {
      setError("Please fulfill all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, { 
        username: name, 
        name: name, 
        email: email, 
        password: password 
      });
      alert("Account created successfully!");
      setMode("login");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("This email is already registered.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-slate-900 font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-[2.5rem] shadow-xl p-10 animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black mb-2 tracking-tight">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">
          {mode === "login" ? "Log in to manage your portfolio" : "Start trading for free today"}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-xs p-3 rounded-xl mb-6 text-center font-bold italic">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-200 transition-all" 
                placeholder="Your Name" 
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-200 transition-all" 
              placeholder="name@example.com" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              placeholder="••••••••"
            />
          </div>

          {mode === "register" && password.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 font-medium">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Security Checklist</p>
              {requirements.map((req, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${req.test(password) ? "text-emerald-500 font-bold" : "text-slate-400"}`}>
                  {req.test(password) ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {req.label}
                </div>
              ))}
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Confirm Password</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="••••••••" 
              />
            </div>
          )}

          <button 
            type="submit" disabled={loading} 
            className={`w-full bg-[#6A0DAD] hover:bg-[#5D0CA1] text-white font-black py-4 rounded-xl shadow-lg shadow-purple-100 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Processing..." : mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
          {mode === "login" ? (
            <>Don't have an account? <button onClick={() => setMode("register")} className="text-[#6A0DAD] font-bold hover:underline">Sign Up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("login")} className="text-[#6A0DAD] font-bold hover:underline">Log In</button></>
          )}
        </div>
      </div>
    </div>
  );
}
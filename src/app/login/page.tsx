"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Facebook } from 'lucide-react'; 
import { useRouter } from 'next/navigation'; // ✅ เพิ่มตัวนี้เข้ามา

// Read API URL from environment (client-safe) with a sensible fallback for local dev
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function LoginPage() {
  const router = useRouter(); // ✅ ประกาศตัวแปร router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // 1. บันทึก Token
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("user_id", res.data.user_id);
      
      // 2. แจ้งเตือน (หรือจะเอาออกก็ได้ถ้าไม่อยากให้เด้ง)
      // alert("Login Success!"); 
      
      // 3. ✅ สั่งเปลี่ยนหน้าไปที่หน้า Dashboard (หน้าแรก) ทันที
      router.push("/"); 
      
    } catch (err: any) {
      console.error("Login Error:", err); // ดู Error จริงใน Console (F12)
      // เช็คว่า Error มาจาก Server หรือเปล่า
      if (err.response && err.response.status === 400) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-black">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Sign in</h1>
        <p className="text-center text-slate-400 mb-8">
          Don’t have account? <a href="/register" className="text-indigo-600 font-bold hover:underline">Sign up</a>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <span className="absolute left-3 top-3.5 text-slate-400">✉️</span>
          </div>

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span className="absolute left-3 top-3.5 text-slate-400">🔒</span>
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600"
            >
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="rounded text-indigo-600 focus:ring-indigo-500"/>
            <label htmlFor="remember" className="text-sm text-slate-600 font-medium">Remember me</label>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}

          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all transform active:scale-95"
          >
            Sign in
          </button>
        </form>

        <div className="mt-4 text-center">
            <a href="#" className="text-sm text-slate-400 hover:text-indigo-600">Forget Password?</a>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      
      alert("Sign-in successful!");
      
      // Redirect ตามสิทธิ์ผู้ใช้
      if (data.user.role === 'admin') {
        router.push("/client");
      } else {
        router.push("/my-bot");
      }
    } else {
      const errorData = await res.json();
      alert(errorData.message || "Invalid credentials");
    }
  } catch (error) {
    alert("Connection failed. Please try again.");
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 font-sans">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-4xl font-bold text-black">Sign in</h1>
        <p className="mb-8 text-gray-400">
          Don't have account? <Link href="/register" className="text-[#8200DB] hover:underline">Create an account</Link>
        </p>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email" 
              required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full rounded-2xl border border-gray-300 py-4 pl-12 pr-4 outline-none focus:border-[#8200DB]"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full rounded-2xl border border-gray-300 py-4 pl-12 pr-12 outline-none focus:border-[#8200DB]"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2 px-2 text-left">
            <input type="checkbox" id="remember" className="size-4 rounded border-gray-300 accent-[#8200DB]" />
            <label htmlFor="remember" className="text-sm font-semibold text-black">Remember me</label>
          </div>

          <button type="submit" className="w-full rounded-2xl bg-[#8200DB] py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-[#7100BD]">
            Sign in
          </button>
        </form>

        <button className="mt-6 text-sm text-gray-300 hover:text-gray-500">Forget Password?</button>
      </div>
    </div>
  );
}
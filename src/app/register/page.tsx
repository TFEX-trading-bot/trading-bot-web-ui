"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", agree: false });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match");

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Account created!");
        router.push("/my-bot");
      } else {
        const data = await res.json();
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 font-sans">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-4xl font-bold text-black">Create an account</h1>
        <p className="mb-8 text-gray-400">
          Already have account? <Link href="/login" className="text-[#8200DB] hover:underline">Sign in</Link>
        </p>

        <form onSubmit={handleSignUp} className="space-y-5">
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
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input 
              type="password" 
              placeholder="Confirm password" 
              required
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full rounded-2xl border border-gray-300 py-4 pl-12 pr-4 outline-none focus:border-[#8200DB]" 
            />
          </div>

          <div className="flex items-center gap-2 px-2 text-left">
            <input 
              type="checkbox" 
              id="terms" 
              required
              onChange={(e) => setFormData({...formData, agree: e.target.checked})}
              className="size-4 rounded border-gray-300 accent-[#8200DB]" 
            />
            <label htmlFor="terms" className="text-sm font-semibold text-black">
              I agree to the <span className="text-[#8200DB]">Terms of Service</span>
            </label>
          </div>

          <button type="submit" className="w-full rounded-2xl bg-[#8200DB] py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-[#7100BD]">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const API_URL = "http://localhost:3333";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
      await axios.post(`${API_URL}/auth/register`, { name, email, password });
      alert("Account created! Please log in.");
      window.location.href = "/login"; // Redirect
    } catch (err) {
      alert("Registration failed. Email might be taken.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Create an account</h1>
        <p className="text-center text-slate-400 mb-8">
          Already have account? <a href="/login" className="text-indigo-600 font-bold hover:underline">Sign in</a>
        </p>

        <form onSubmit={handleRegister} className="space-y-4 text-black">
          
          {/* Name - เพิ่มเข้ามา */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <span className="absolute left-3 top-3.5 text-slate-400">👤</span>
          </div>

          <div className="relative">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
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
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span className="absolute left-3 top-3.5 text-slate-400">🔒</span>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">
               {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <div className="relative">
            <input 
              type="password" 
              placeholder="Confirm Password" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <span className="absolute left-3 top-3.5 text-slate-400">🔒</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" required className="rounded text-indigo-600 focus:ring-indigo-500"/>
            <label className="text-sm text-slate-600">I agree to the <a href="#" className="text-purple-600 font-bold">Terms of Service</a></label>
          </div>

          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all mt-4"
          >
            Sign up
          </button>
        </form>
        
        {/* Social Icons (เหมือนหน้า Login)
        <div className="my-6 border-t border-slate-200 relative">
            <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-2 text-slate-400 text-sm">Or sign up with</span>
        </div> */}
       

      </div>
    </div>
  );
}
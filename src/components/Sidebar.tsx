"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bot, ShoppingBag, CircleDollarSign, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="flex flex-col h-full md:h-screen md:sticky md:top-0 w-[280px] flex-shrink-0 bg-gradient-to-br from-[#5D0CA1] via-[#4B0082] to-[#360062] text-white p-6 shadow-2xl select-none relative overflow-hidden z-50">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      
      {/* ✅ Logo Section - นำ Link ออกแล้ว */}
      <div className="flex items-center space-x-4 mb-10 mt-4 px-2 select-none group">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-20 transition duration-300"></div>
          <div className="relative bg-white/10 p-2 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl">
            <Bot className="text-white w-6 h-6" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight leading-none uppercase">Trading Bot</span>
          <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 mt-1 uppercase">System</span>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

      {/* Navigation Links */}
      <nav className="space-y-3 flex-1">
        {[
          { name: 'My Bot', path: '/my-bot', icon: LayoutDashboard },
          { name: 'Market Place', path: '/market-place', icon: ShoppingBag },
          { name: 'Pricing', path: '/pricing', icon: CircleDollarSign },
        ].map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link href={item.path} key={item.path}>
              <div 
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 
                active:scale-[0.96] relative
                ${active 
                  ? 'bg-white/15 backdrop-blur-2xl border border-white/20 shadow-lg' 
                  : 'hover:bg-white/5 border border-transparent hover:border-white/10'}`}
              >
                {/* Active Indicator Light */}
                {active && (
                  <div className="absolute left-0 w-1 h-5 bg-purple-400 rounded-full shadow-[0_0_15px_#A855F7]" />
                )}

                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl transition-all duration-500 
                    ${active 
                      ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30' 
                      : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:rotate-6'}`} />
                  </div>
                  <span className={`text-sm tracking-wide transition-all ${active ? 'font-black text-white' : 'font-medium text-white/60 group-hover:text-white'}`}>
                    {item.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
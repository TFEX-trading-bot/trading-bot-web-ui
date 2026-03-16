"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Terminal, CircleDollarSign, Bot } from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: 'Client', path: '/clients', icon: User },
    { name: 'All Bots', path: '/all-bots', icon: Terminal },
    { name: 'Subscription', path: '/subscription', icon: CircleDollarSign },
  ];

  return (
    <aside className="flex flex-col h-full md:h-screen md:sticky md:top-0 w-[280px] flex-shrink-0 bg-gradient-to-br from-[#5D0CA1] via-[#4B0082] to-[#360062] text-white p-6 shadow-2xl relative z-50 overflow-hidden">
      
      {/* ✅ Logo Section - เอา Link ออกแล้ว */}
      <div className="flex items-center space-x-4 mb-12 mt-4 px-2 select-none">
        <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl">
          <Bot className="text-white w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight leading-none uppercase">
            Trading Bot
          </span>
          <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 mt-1 uppercase">
            System
          </span>
        </div>
      </div>

      {/* Modern Separator */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

      {/* Navigation Links */}
      <nav className="space-y-4 flex-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link href={item.path} key={item.path}>
              <div 
                className={`group flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 relative
                ${active 
                  ? 'bg-white/20 backdrop-blur-2xl border border-white/20 shadow-lg scale-[1.02]' 
                  : 'hover:bg-white/5 border border-transparent hover:border-white/10'}`}
              >
                {/* Active Indicator Light */}
                {active && (
                  <div className="absolute left-0 w-1 h-6 bg-purple-400 rounded-full shadow-[0_0_15px_#A855F7]" />
                )}

                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl transition-all duration-500 
                    ${active 
                      ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30' 
                      : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
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

export default AdminSidebar;
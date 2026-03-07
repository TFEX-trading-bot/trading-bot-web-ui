"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // ✅ เพิ่ม Sidebar
import DashboardHeader from "@/components/Header"; // ✅ เพิ่ม Header
import { Info, Loader2, ShieldCheck, Zap, Wallet } from "lucide-react";

export default function CreateBotPage() {
  const params = useParams();
  const router = useRouter();
  const botIdFromUrl = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publicBotData, setPublicBotData] = useState<any>(null);

  // --- Form States ---
  const [investingAmount, setInvestingAmount] = useState("");
  const [auth, setAuth] = useState({ 
    broker_id: "SANDBOX", 
    app_code: "SANDBOX", 
    account_no: "", 
    pin: "", 
    app_id: "", 
    app_secret: "", 
    name_account: "" 
  });

  // 1. ดึงข้อมูลบอทต้นฉบับจาก API Sigma
  const fetchPublicBot = useCallback(async () => {
    if (!botIdFromUrl) return;
    try {
      const res = await axios.get(`https://trading-bot-api-sigma.vercel.app/bots/public/${botIdFromUrl}`);
      setPublicBotData(res.data);
    } catch (err) {
      console.error("Fetch Public Bot Error:", err);
    }
  }, [botIdFromUrl]);

  useEffect(() => {
    fetchPublicBot();
  }, [fetchPublicBot]);

  // 2. ฟังก์ชัน Submit ส่ง Payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicBotData || !botIdFromUrl) {
      alert("Strategy data is still loading...");
      return;
    }

    setIsSubmitting(true);
    try {
      const storedUserId = localStorage.getItem("user_id");
      const userId = storedUserId ? Number(storedUserId) : 1;

      const payload = {
        user_id: userId,
        stock: publicBotData.stock,
        timeframe: publicBotData.policy.timeframe || "15T",
        broker_id: auth.broker_id,
        app_code: auth.app_code,
        app_id: auth.app_id,
        app_secret: auth.app_secret,
        account_no: auth.account_no,
        pin: auth.pin,
        public: false,
        bot_type: "POLICY",
        strategy_config: {
          risk: {
            risk_pct: publicBotData.policy.risk.risk_pct,
            assigned_capital: Number(investingAmount),
            sl_model: publicBotData.policy.risk.sl_model,
            atr_period: publicBotData.policy.risk.atr_period,
            atr_mult: publicBotData.policy.risk.atr_mult,
            rr: publicBotData.policy.risk.rr,
            use_break_even: true
          },
          rules: publicBotData.policy.rules.map((r: any) => ({
            action: r.action,
            priority: r.priority || 1,
            indicator: r.and[0].indicator,
            period: r.and[0].period,
            op: r.and[0].op,
            right: {
              type: r.and[0].right.type,
              value: r.and[0].right.value
            }
          }))
        }
      };

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botIdFromUrl}/copy`);
      const response = await axios.post("http://localhost:8000/spawn-bot", payload);
      
      if (response.status === 200 || response.status === 201) {
        alert("Bot deployed and strategy installed successfully!");
        router.push("/my-bot"); 
      }
    } catch (error: any) {
      console.error("Deploy Error:", error);
      alert("Deployment Failed: " + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800">
      {/* ✅ Sidebar ด้านซ้าย */}
      <aside className="sticky top-0 h-screen hidden md:block z-40">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* ✅ DashboardHeader ด้านบน */}
        <DashboardHeader title="Deploy Strategy" />

        <div className="p-8 lg:p-12 max-w-[1000px] w-full mx-auto">
          
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Zap className="text-[#8B5CF6] fill-[#8B5CF6]" size={28} />
              Deploying: {publicBotData?.stock || "Loading..."}
            </h2>
            <p className="text-slate-400 font-medium mt-2">Configure your deployment settings and broker credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Investment Section */}
            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-xl shadow-sm text-[#8B5CF6]"><Wallet size={20}/></div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Investment Amount</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max investing amount (THB)</label>
                  <input 
                    type="number" 
                    required
                    value={investingAmount}
                    onChange={(e) => setInvestingAmount(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-100 transition-all" 
                    placeholder="Enter amount" 
                  />
                </div>
              </div>
            </div>

            {/* Broker Configuration */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl text-[#8B5CF6]"><ShieldCheck size={20}/></div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Broker Configuration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: "Broker ID", key: "broker_id" },
                  { label: "App Code", key: "app_code" },
                  { label: "Account Name", key: "name_account" },
                  { label: "Account Number", key: "account_no", placeholder: "Derivative Account" },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input 
                      value={(auth as any)[field.key]} 
                      onChange={e => setAuth({...auth, [field.key]: e.target.value})} 
                      placeholder={field.placeholder}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" 
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN</label>
                  <input 
                    type="password" 
                    value={auth.pin} 
                    onChange={e => setAuth({...auth, pin: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Authentication Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Authentication API</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application ID</label>
                  <input value={auth.app_id} onChange={e => setAuth({...auth, app_id: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Secret</label>
                  <input type="password" value={auth.app_secret} onChange={e => setAuth({...auth, app_secret: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
              </div>
              <button type="button" className="w-full py-4 border-2 border-[#8B5CF6] text-[#8B5CF6] font-black rounded-2xl hover:bg-purple-50 transition-all uppercase text-xs tracking-widest">Verify Connection</button>
            </div>

            <div className="pt-10 pb-20 flex justify-center">
              <button 
                type="submit" 
                disabled={isSubmitting || !publicBotData}
                className="w-full md:w-[400px] py-6 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-lg font-black rounded-full shadow-2xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all disabled:bg-slate-300 flex items-center justify-center gap-4 uppercase tracking-widest"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Bot"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
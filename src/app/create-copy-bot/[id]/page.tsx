"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header"; 
import { Info, Loader2, ShieldCheck, Zap, Wallet, CheckCircle2 } from "lucide-react";

// ✅ ฟังก์ชันแยกประเภทสินทรัพย์ (EQUITY หรือ DERIVATIVE)
const getSymbolType = (symbol: string) => {
    const derivativePrefixes = ["S50", "GO", "USD", "SVF", "JRF"];
    const isDerivative = derivativePrefixes.some(prefix => symbol.startsWith(prefix));
    return isDerivative ? "DERIVATIVE" : "EQUITY";
};

export default function CreateBotPage() {
  const params = useParams();
  const router = useRouter();
  const botIdFromUrl = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publicBotData, setPublicBotData] = useState<any>(null);

  // --- Verification States ---
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cashBalance, setCashBalance] = useState<number | null>(null);

  // --- Form States ---
  const [investingAmount, setInvestingAmount] = useState("");
  const [auth, setAuth] = useState({ 
    broker_id: "003", 
    app_code: "ALGO", 
    account_no: "", 
    pin: "", 
    app_id: "", 
    app_secret: ""
  });

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

  const resetVerification = () => {
    if (isVerified) {
      setIsVerified(false);
      setCashBalance(null);
    }
  };

  const handleAuthChange = (field: string, value: string) => {
    setAuth({ ...auth, [field]: value });
    resetVerification(); 
  };

  const handleVerify = async () => {
    const { broker_id, app_code, account_no, pin, app_id, app_secret } = auth;
    if (!broker_id || !app_code || !account_no || !pin || !app_id || !app_secret) {
      alert("❌ Please fill in all Broker and Authentication fields before verifying.");
      return;
    }

    setIsVerifying(true);
    try {
      const verifyPayload = { broker_id, app_code, app_id, app_secret, account_no, pin };
      const response = await axios.post("http://localhost:8000/verify-credentials", verifyPayload);
      
      if (response.data.status === "success") {
        setIsVerified(true);
        setCashBalance(response.data.cash_balance);
        alert(`✅ Verified Successfully!\nBalance: ${response.data.cash_balance.toLocaleString()} ฿`);
      }
    } catch (error: any) {
      setIsVerified(false);
      const errorMsg = error.response?.data?.message || "Verification failed. Please check your credentials.";
      alert("❌ Verification Failed: " + errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ เพิ่มข้อความแจ้งเตือนเมื่อยังไม่ได้ Verify
    if (!isVerified) {
      alert("❌ Deployment Failed: Please verify your credentials before creating the bot.");
      return;
    }

    if (!investingAmount || !publicBotData) {
      alert("❌ Deployment Failed: Please ensure all fields are filled correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const storedUserId = localStorage.getItem("user_id");
      const userId = storedUserId ? Number(storedUserId) : 1;

      const payload = {
        user_id: userId,
        stock: publicBotData.stock,
        bot_type: getSymbolType(publicBotData.stock), // ✅ EQUITY หรือ DERIVATIVE
        timeframe: publicBotData.policy.timeframe || "15T",
        broker_id: auth.broker_id,
        app_code: auth.app_code,
        app_id: auth.app_id,
        app_secret: auth.app_secret,
        account_no: auth.account_no,
        pin: auth.pin,
        public: false,
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
          rules: publicBotData.policy.rules.map((r: any) => {
            const conditions = r.and || r.or || [];
            const logicKey = r.and ? 'and' : 'or';
            return {
                action: r.action,
                priority: r.priority || 1,
                [logicKey]: conditions.map((c: any) => ({
                    indicator: c.indicator,
                    period: Number(c.period),
                    op: c.op,
                    right: c.right
                }))
            };
          })
        }
      };

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botIdFromUrl}/copy`);
      const response = await axios.post("http://localhost:8000/spawn-bot", payload);
      
      if (response.status === 200 || response.status === 201) {
        alert("✅ Bot deployed successfully!");
        router.push("/my-bot"); 
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message;
      alert("❌ Deployment Failed: " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800 relative">
      <aside className="sticky top-0 h-screen hidden md:block z-40">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardHeader title="Deploy Strategy" />

        <div className="p-8 lg:p-12 max-w-[1000px] w-full mx-auto space-y-12">
          
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Zap className="text-[#8B5CF6] fill-[#8B5CF6]" size={28} />
              Deploying: {publicBotData?.stock || "Loading..."}
            </h2>
            <p className="text-slate-400 font-medium mt-2 text-sm uppercase tracking-wider">Configure your deployment settings and broker credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Investment Section */}
            <section className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
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
            </section>

            {/* ✅ Bot Configuration (ตามภาพ ff5ea6) */}
            <section className="space-y-8">
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">Bot Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Broker ID</label>
                  <input value={auth.broker_id} onChange={e => handleAuthChange('broker_id', e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Code</label>
                  <input value={auth.app_code} onChange={e => handleAuthChange('app_code', e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                  <input value={auth.account_no} onChange={e => handleAuthChange('account_no', e.target.value)} placeholder="00000000" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN</label>
                  <input type="password" value={auth.pin} onChange={e => handleAuthChange('pin', e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
              </div>
            </section>

            {/* Authentication API Section */}
            <section className="space-y-8">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Authentication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application ID</label>
                  <input value={auth.app_id} onChange={e => handleAuthChange("app_id", e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Secret</label>
                  <input type="password" value={auth.app_secret} onChange={e => handleAuthChange("app_secret", e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <button 
                  type="button" 
                  onClick={handleVerify} 
                  disabled={isVerifying} 
                  className={`px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 ${isVerified ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-[#8B5CF6] text-white shadow-purple-100 hover:scale-[1.02] active:scale-95"}`}
                >
                  {isVerifying ? <Loader2 className="animate-spin" size={16} /> : (isVerified ? <CheckCircle2 size={16} /> : null)}
                  {isVerified ? "Verified" : "Verify Credential & Balance"}
                </button>
                {isVerified && cashBalance !== null && (
                  <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-left-2">
                    Cash Balance: {cashBalance.toLocaleString()} ฿
                  </div>
                )}
              </div>
            </section>

            {/* ✅ Fixed: ปุ่ม Create Bot (ปรับลด scale และเพิ่ม Alert ในฟังก์ชันส่งข้อมูล) */}
            <div className="pt-10 pb-20 flex justify-center">
              <button 
                type="submit" 
                disabled={isSubmitting || !publicBotData}
                className="w-full md:w-[400px] py-6 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-lg font-black rounded-full shadow-2xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-slate-300 flex items-center justify-center gap-4 uppercase tracking-widest"
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
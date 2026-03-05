"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Info, Loader2 } from "lucide-react";

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

  // State สำหรับเก็บ Rules (เพื่อส่ง Payload แม้จะซ่อน UI)
  const [rules, setRules] = useState<any[]>([]);

  // 1. ดึงข้อมูลบอทต้นฉบับจาก API Sigma
  useEffect(() => {
    if (botIdFromUrl) {
      axios.get(`https://trading-bot-api-sigma.vercel.app/bots/public/${botIdFromUrl}`)
        .then(res => setPublicBotData(res.data))
        .catch(err => console.error("Fetch Public Bot Error:", err));
    }
  }, [botIdFromUrl]);

  // ✅ แก้ไข Error: นิยาม removeRuleGroup เพื่อป้องกันปัญหาหาชื่อไม่พบ
  const removeRuleGroup = (id: number) => setRules(rules.filter(r => r.id !== id));

  // ✅ แก้ไข Error: ระบุประเภทข้อมูล (c: any) ในฟังก์ชัน updateCondition
  const updateCondition = (rid: number, cid: number, f: string, v: any) => 
    setRules(rules.map(r => r.id === rid ? { 
        ...r, 
        conditions: r.conditions.map((c: any) => c.id === cid ? { ...c, [f]: v } : c) 
    } : r));

  // 2. ฟังก์ชัน Submit ส่ง Payload และแจ้งการ Copy กลยุทธ์
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicBotData || !botIdFromUrl) {
      alert("⚠️ ข้อมูลกลยุทธ์ยังโหลดไม่เสร็จ");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ ดึง user_id จาก localStorage
      const storedUserId = localStorage.getItem("user_id");
      const userId = storedUserId ? Number(storedUserId) : 1;

      // --- สร้าง Payload สำหรับ Spawn Bot ---
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
        public: false, // บังคับส่ง false
        bot_type: "POLICY",
        strategy_config: {
          risk: {
            risk_pct: publicBotData.policy.risk.risk_pct,
            assigned_capital: Number(investingAmount), // ส่งค่าเงินลงทุนไปที่ assigned_capital
            sl_model: publicBotData.policy.risk.sl_model,
            atr_period: publicBotData.policy.risk.atr_period,
            atr_mult: publicBotData.policy.risk.atr_mult,
            rr: publicBotData.policy.risk.rr,
            use_break_even: true
          },
          // Mapping rules ให้ตรงตามตัวอย่าง Payload
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

      console.log("🚀 Steps: 1. Patch Copy Info -> 2. Post Spawn Bot");

      // ✅ ส่ง PATCH ไปที่ url /bots/[id]/copy โดยไม่มี body
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botIdFromUrl}/copy`);
      
      // ส่ง POST เพื่อสร้างบอทใหม่ที่ Port 8000
      const response = await axios.post("http://localhost:8000/spawn-bot", payload);
      
      if (response.status === 200 || response.status === 201) {
        alert("✅ บอทถูกสร้างและติดตั้งกลยุทธ์เรียบร้อย!");
        router.push("/my-bot"); 
      }
    } catch (error: any) {
      console.error("Deploy Error:", error);
      alert("❌ สร้างบอทไม่สำเร็จ: " + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-kanit">
      <Navbar onOpenAuth={() => {}} />

      <main className="max-w-5xl mx-auto pt-32 pb-40 px-6">
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-3xl font-black text-[#6A0DAD] mb-4 uppercase tracking-tight">Deploy Bot Strategy</h1>
          <p className="text-slate-400 text-sm font-bold">Configure your account to start trading with this strategy</p>
          {/* ✅ ส่วนสลับหน้า (Market/Backtest) ถูกเอาออกแล้ว */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          
          {/* ✅ ส่วน Max investing amount ปรับตำแหน่งและขนาด Font ให้เท่ากับ Broker ID */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Max investing amount</label>
              <input 
                type="number" 
                required
                value={investingAmount}
                onChange={(e) => setInvestingAmount(e.target.value)}
                className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold focus:ring-2 focus:ring-purple-200 transition-all" 
                placeholder="ระบุจำนวนเงินลงทุน" 
              />
            </div>
          </div>

          {/* Section: Broker Configuration */}
          <div className="space-y-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">Broker Configuration <Info size={18} className="text-purple-500" /></h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Broker ID</label>
                <input value={auth.broker_id} onChange={e => setAuth({...auth, broker_id: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">App Code</label>
                <input value={auth.app_code} onChange={e => setAuth({...auth, app_code: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Name Account</label>
                <input value={auth.name_account} onChange={e => setAuth({...auth, name_account: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Account Number</label>
                <input value={auth.account_no} onChange={e => setAuth({...auth, account_no: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold" placeholder="เลขบัญชีอนุพันธ์" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">PIN</label>
                <input type="password" value={auth.pin} onChange={e => setAuth({...auth, pin: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold" />
              </div>
            </div>
          </div>

          {/* Section: Authentication */}
          <div className="space-y-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Authentication</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Application ID</label>
                <input value={auth.app_id} onChange={e => setAuth({...auth, app_id: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Application Secret</label>
                <input type="password" value={auth.app_secret} onChange={e => setAuth({...auth, app_secret: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none text-slate-900 font-bold" />
              </div>
            </div>
            <button type="button" className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-100 hover:scale-[1.01] transition-all">Verify Credential & Balance</button>
          </div>

          <div className="pt-10 pb-20">
            <button 
              type="submit" 
              disabled={isSubmitting || !publicBotData}
              className="w-full py-6 bg-[#6A0DAD] text-white text-xl font-black rounded-full shadow-2xl shadow-purple-100 hover:bg-[#5D0CA1] transition-all disabled:bg-slate-300 flex items-center justify-center gap-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Deploy Bot Strategy"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
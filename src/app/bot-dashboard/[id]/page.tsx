"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bot, TrendingUp, TrendingDown, Loader2, ShieldCheck, ChevronDown } from "lucide-react";

// --- Interfaces ---
interface HistoryOrder {
  id: number; botId: number; orderId: string; priceAt: string;
  amount: number; action: "BUY" | "SELL"; totalProfit: string; dateTime: string;
}

interface BotData {
  id: number; stock: string; status: string; public: boolean; 
  totalPnL: number; history: HistoryOrder[];
  policy: { risk: { risk_pct: number; sl_model: string; atr_period: number; atr_mult: number; rr: number; }; };
}

export default function BotDetailPage() {
  const params = useParams();
  const botId = params.id;
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'configuration'>('dashboard');
  const [data, setData] = useState<BotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- States สำหรับ Configuration Form ---
  const [riskPct, setRiskPct] = useState(0);
  const [slModel, setSlModel] = useState("ATR");
  const [atrPeriod, setAtrPeriod] = useState(0);
  const [atrMult, setAtrMult] = useState(0);
  const [rrValue, setRrValue] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);

  // 1. ดึงข้อมูลบอท
  const fetchBotData = useCallback(async () => {
    if (!botId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`);
      if (!response.ok) throw new Error("Fetch failed");
      const result = await response.json();
      
      setData(result);
      // Sync ข้อมูลลงฟอร์ม
      setRiskPct(result.policy.risk.risk_pct);
      setSlModel(result.policy.risk.sl_model || "ATR");
      setAtrPeriod(result.policy.risk.atr_period);
      setAtrMult(result.policy.risk.atr_mult);
      setRrValue(result.policy.risk.rr || 0);
      setIsPrivate(!result.public);
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }, [botId]);

  useEffect(() => { fetchBotData(); }, [fetchBotData]);

  // 2. ควบคุมสถานะบอท (FastAPI :8000)
  const handleToggleBot = async () => {
    if (!data || isToggling) return;
    setIsToggling(true);
    const action = data.status === "RUNNING" ? "pause" : "resume";
    try {
      await fetch(`http://localhost:8000/bot/${botId}/${action}`, { method: "POST" });
      await fetchBotData();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Port 8000");
    } finally { setIsToggling(false); }
  };

  // 3. บันทึกการตั้งค่า (Nest.js :3000)
  const handleSaveConfig = async () => {
  setIsSaving(true);

  // --- ปรับ Payload ให้ตรงตาม Postman เป๊ะๆ ---
  // ไม่ต้องมี "policy" ครอบแล้ว ส่ง "risk" และ "public" ไปที่ Root เลย
  const payload = {
    public: !isPrivate, // ถ้าสวิตช์ Private เปิด (true) จะส่ง public เป็น false
    risk: {
      risk_pct: Number(riskPct),
      sl_model: slModel,
      atr_period: Number(atrPeriod),
      atr_mult: Number(atrMult),
      rr: Number(rrValue)
    }
  };

  // ตรวจสอบความถูกต้องใน Console ก่อนส่งจริง
  console.log("Working Payload (Same as Postman):", payload);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
      // ดึงข้อมูลล่าสุดจาก Database กลับมาแสดงผลทันที
      await fetchBotData();
    } else {
      const errorData = await response.json();
      console.error("Backend Error:", errorData);
      alert(`บันทึกไม่สำเร็จ: ${errorData.message || 'โครงสร้างข้อมูลไม่ถูกต้อง'}`);
    }
  } catch (err) {
    console.error("Connection Error:", err);
    alert("ไม่สามารถเชื่อมต่อกับ Server ได้ โปรดเช็ค NEXT_PUBLIC_API_URL");
  } finally {
    setIsSaving(false);
  }
};

  if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-[#6A0DAD] w-12 h-12" /></div>;

  const isLoss = (data?.totalPnL ?? 0) < 0;

  return (
    <div className="min-h-screen flex flex-col font-kanit bg-[#F8F9FB]">
      <Navbar onOpenAuth={() => {}} />
      <main className="flex-grow pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Header & Centered Tabs */}
        <div className="flex flex-col items-center mb-12 gap-8 text-center">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            {data?.stock} <span className="text-slate-200 mx-3">|</span> <span className="text-slate-400 font-medium text-2xl tracking-normal">ID : {botId}</span>
          </h2>
          
          <div className="bg-slate-200/60 p-1 rounded-2xl flex shadow-inner">
            <button onClick={() => setActiveTab('dashboard')} className={`px-12 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#8B5CF6] text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('configuration')} className={`px-12 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'configuration' ? 'bg-[#8B5CF6] text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Configuration</button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <section className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profits Card (Green/Red) */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Current Profits</h4>
                <div className={`p-8 rounded-3xl flex items-center gap-8 border transition-all ${isLoss ? 'bg-rose-50 border-rose-100' : 'bg-[#ECFDF5] border-emerald-100'}`}>
                  <div className={isLoss ? 'text-rose-500' : 'text-[#10B981]'}>{isLoss ? <TrendingDown size={56} /> : <TrendingUp size={56} />}</div>
                  <div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.1em] mb-1">Total PnL</p>
                    <p className={`text-4xl font-black ${isLoss ? 'text-rose-600' : 'text-[#10B981]'}`}>{data?.totalPnL.toLocaleString()} ฿</p>
                  </div>
                </div>
              </div>

              {/* Bot Status & Switch */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                {isToggling && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-purple-600"/></div>}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Bot Status</h4>
                  <div className="bg-[#F3E8FF] p-8 rounded-3xl flex items-center gap-6 border border-purple-50">
                    <div className="p-4 bg-white rounded-2xl shadow-sm"><Bot size={36} className="text-[#6A0DAD]" /></div>
                    <div>
                      <p className={`text-2xl font-black uppercase tracking-tight ${data?.status === 'RUNNING' ? 'text-emerald-600' : 'text-slate-400'}`}>{data?.status}</p>
                      <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
                        {data?.history && data.history.length > 0 
                          ? new Date(data.history[0].dateTime).toLocaleString('en-US', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true }).toUpperCase().replace(',','') 
                          : 'Waiting for orders'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100">
                  <div className="flex flex-col"><span className="font-bold text-slate-700 text-base">Bot Control</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">คลิกเพื่อ {data?.status === 'RUNNING' ? 'หยุดบอท' : 'เริ่มบอท'}</span></div>
                  <button onClick={handleToggleBot} className={`w-16 h-8 rounded-full transition-all relative ${data?.status === 'RUNNING' ? 'bg-[#8B5CF6]' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${data?.status === 'RUNNING' ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* --- FIX: Order History Table --- */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-black text-slate-800 mb-8">Order History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="pb-4 px-6">Price_at</th>
                      <th className="pb-4 px-6">Amount</th>
                      <th className="pb-4 px-6">Date-Time</th>
                      <th className="pb-4 px-6">Action</th>
                      <th className="pb-4 px-6 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.history && data.history.length > 0 ? data.history.map((order) => (
                      <tr key={order.id} className="group hover:translate-x-1 transition-all duration-300">
                        <td className="p-6 bg-slate-50/50 rounded-l-3xl font-black text-slate-700 underline decoration-purple-200">{parseFloat(order.priceAt).toFixed(2)} THB</td>
                        <td className="p-6 bg-slate-50/50 text-slate-500 font-bold">{order.amount}</td>
                        <td className="p-6 bg-slate-50/50 text-slate-400 text-[11px] font-bold">
                          {new Date(order.dateTime).toLocaleString('en-US', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true }).toUpperCase().replace(',','')}
                        </td>
                        <td className="p-6 bg-slate-50/50">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest ${order.action === 'BUY' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                            {order.action === 'BUY' ? 'Buy' : 'Sell'}
                          </span>
                        </td>
                        <td className={`p-6 bg-slate-50/50 rounded-r-3xl text-right font-black ${parseFloat(order.totalProfit) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {parseFloat(order.totalProfit) >= 0 ? '+' : ''}{parseFloat(order.totalProfit).toLocaleString()} ฿
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="text-center py-20 text-slate-300 font-bold tracking-widest">NO ORDER HISTORY AVAILABLE</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          /* --- CONFIGURATION VIEW --- */
          <section className="animate-in slide-in-from-bottom-8 duration-600 space-y-8 max-w-4xl mx-auto pb-20">
            <div className="flex justify-end">
              <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 flex items-center gap-6 shadow-sm">
                <span className="font-black text-slate-700 text-sm tracking-tight">Private Mode</span>
                <button 
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${isPrivate ? 'bg-[#8B5CF6]' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${isPrivate ? 'right-1.5' : 'left-1.5'}`}></div>
                </button>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-2xl"><ShieldCheck className="text-emerald-500" size={32} /></div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">Risk Management</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Risk Percentage (%)</label>
                  <input type="number" value={riskPct} onChange={(e)=>setRiskPct(Number(e.target.value))} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-700 focus:ring-4 focus:ring-purple-100 transition-all outline-none" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">SL Model Selection</label>
                  <div className="relative">
                    <select value={slModel} onChange={(e)=>setSlModel(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-700 appearance-none focus:ring-4 focus:ring-purple-100 transition-all outline-none cursor-pointer">
                      <option value="ATR">ATR (Volatility Based)</option>
                      <option value="ADX">ADX (Trend Strength)</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ATR Period (Days)</label>
                  <input type="number" value={atrPeriod} onChange={(e)=>setAtrPeriod(Number(e.target.value))} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-700 focus:ring-4 focus:ring-purple-100 transition-all outline-none" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ATR Multiplier</label>
                  <input type="number" value={atrMult} onChange={(e)=>setAtrMult(Number(e.target.value))} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-700 focus:ring-4 focus:ring-purple-100 transition-all outline-none" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Risk-Reward (RR)</label>
                  <input type="number" step="0.1" value={rrValue} onChange={(e)=>setRrValue(Number(e.target.value))} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-700 focus:ring-4 focus:ring-purple-100 transition-all outline-none" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-8 pt-6">
              <button 
                onClick={handleSaveConfig} 
                disabled={isSaving}
                className="px-20 py-5 bg-[#8B5CF6] text-white font-black rounded-3xl shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4"
              >
                {isSaving && <Loader2 className="animate-spin" />}
                Save Configuration
              </button>
              <button onClick={() => setActiveTab('dashboard')} className="px-20 py-5 bg-purple-100 text-[#8B5CF6] font-black rounded-3xl hover:bg-purple-200 transition-all active:scale-95">Cancel</button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
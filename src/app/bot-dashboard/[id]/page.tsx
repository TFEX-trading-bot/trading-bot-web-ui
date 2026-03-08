"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header"; 
import { 
  Bot, TrendingUp, TrendingDown, Loader2, 
  ShieldCheck, ChevronDown, Zap, Plus, Trash2 
} from "lucide-react";

// --- Configuration Constants ---
const INDICATOR_OPTIONS = ["RSI", "SMA", "EMA", "MACD", "STOCH", "ATR", "BBANDS", "OBV", "CLOSE", "OPEN", "HIGH", "LOW", "ADX", "DZV", "VWAP", "VOLUME", "HIGHN", "LOWN", "KELTNER", "DONCHIAN", "CHOP", "CRSI", "SUPERTREND"];
const CONDITION_OPTIONS = [
  { label: "Cross Above", value: "CROSS_ABOVE" },
  { label: "Cross Below", value: "CROSS_BELOW" },
  { label: "Greater (>)", value: "GREATER" },
  { label: "Less (<)", value: "LESS" }
];

interface BotData {
  id: number; stock: string; status: string; public: boolean; botType: string;
  totalPnL: number; history: any[];
  policy: { 
    risk: { risk_pct: number; sl_model: string; atr_period: number; atr_mult: number; rr: number; }; 
    rules: any[]; 
  };
}

export default function BotDetailPage() {
  const params = useParams();
  const botId = params.id;
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'configuration'>('dashboard');
  const [data, setData] = useState<BotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Configuration States (รองรับการลบเลข 0 จนว่างเปล่า) ---
  const [riskPct, setRiskPct] = useState<number | string>(0);
  const [slModel, setSlModel] = useState("ATR");
  const [atrPeriod, setAtrPeriod] = useState<number | string>(0);
  const [atrMult, setAtrMult] = useState<number | string>(0);
  const [rrValue, setRrValue] = useState<number | string>(0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState<any[]>([]);

  // 1. ดึงข้อมูลและ Re-map rules จากโครงสร้าง and/or
  const fetchBotData = useCallback(async () => {
    if (!botId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`);
      if (!response.ok) throw new Error("Fetch failed");
      const result = await response.json();
      
      setData(result);
      setRiskPct(result?.policy?.risk?.risk_pct ?? 0);
      setSlModel(result?.policy?.risk?.sl_model ?? "ATR");
      setAtrPeriod(result?.policy?.risk?.atr_period ?? 0);
      setAtrMult(result?.policy?.risk?.atr_mult ?? 0);
      setRrValue(result?.policy?.risk?.rr ?? 0);
      setIsPrivate(!result?.public);

      if (result?.policy?.rules && Array.isArray(result.policy.rules)) {
        const mappedRules = result.policy.rules.map((r: any) => ({
          id: Math.random(),
          action: r.action || "BUY",
          logic: r.or ? "OR" : "AND", // ตรวจสอบจาก API ว่าเป็น 'and' หรือ 'or'
          conditions: (r.and || r.or || []).map((c: any) => ({
            id: Math.random(),
            indicator: c.indicator || "",
            period: c.period || "",
            operator: c.op || "",
            rightType: c.right?.type || "VALUE",
            rightValue: c.right?.value ?? "",
            rightIndicator: c.right?.indicator || "",
            rightPeriod: c.right?.period || ""
          }))
        }));
        setRules(mappedRules);
      }
    } catch (err) { console.error("Fetch error:", err); } 
    finally { setIsLoading(false); }
  }, [botId]);

  useEffect(() => { fetchBotData(); }, [fetchBotData]);

  // --- UI Handlers ---
  const updateCondition = (rid: number, cid: number, f: string, v: any) => 
    setRules(rules.map(r => r.id === rid ? { 
        ...r, conditions: r.conditions.map((c: any) => c.id === cid ? { ...c, [f]: v } : c) 
    } : r));

  const updateRuleAction = (id: number, action: string) => 
    setRules(rules.map(r => r.id === id ? { ...r, action } : r));

  const setRuleLogic = (id: number, logic: "AND" | "OR") =>
    setRules(rules.map(r => r.id === id ? { ...r, logic } : r));

  const addRuleGroup = () => setRules([...rules, { 
    id: Date.now(), action: "SELL", logic: "AND",
    conditions: [{ id: Date.now() + 1, indicator: "", period: "", operator: "", rightType: "VALUE", rightValue: "", rightIndicator: "", rightPeriod: "" }] 
  }]);

  const removeRuleGroup = (id: number) => setRules(rules.filter(r => r.id !== id));

  const addSubRule = (groupId: number) => {
    setRules(rules.map(r => r.id === groupId ? {
      ...r, conditions: [...r.conditions, { id: Date.now(), indicator: "", period: "", operator: "", rightType: "VALUE", rightValue: "", rightIndicator: "", rightPeriod: "" }]
    } : r));
  };

  // 3. บันทึกข้อมูล: ปรับปรุง Payload ให้ตรงกับ Backend ใหม่
  const handleSaveConfig = async () => {
    const isRiskValid = Number(riskPct) > 0 && Number(rrValue) > 0 && Number(atrPeriod) > 0 && Number(atrMult) > 0;
    if (!isRiskValid) {
      alert("❌ กรุณากรอกข้อมูล Risk Management ให้ครบถ้วนและมากกว่า 0");
      return; 
    }

    setIsSaving(true);
    
    // ✅ การสร้าง Payload ตามโครงสร้างใหม่ที่คุณแก้ไขใน Backend
    const payload = {
      public: !isPrivate,
      policy: {
        risk: { 
          risk_pct: Number(riskPct), sl_model: slModel, 
          atr_period: Number(atrPeriod), atr_mult: Number(atrMult), rr: Number(rrValue) 
        },
        rules: rules.map((r, idx) => {
          const logicKey = r.logic.toLowerCase(); // ส่งเป็น 'and' หรือ 'or'
          return {
            action: r.action,
            priority: idx + 1,
            [logicKey]: r.conditions.map((c: any) => ({
              indicator: c.indicator,
              period: Number(c.period),
              op: c.operator, 
              right: c.rightType === "VALUE" 
                ? { type: "VALUE", value: Number(c.rightValue) } 
                : { type: "INDICATOR", indicator: c.rightIndicator, period: Number(c.rightPeriod) }
            }))
          };
        })
      }
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) { 
        alert("✅ อัปเดตกลยุทธ์เรียบร้อยแล้ว!"); 
        await fetchBotData(); // ดึงข้อมูลใหม่เพื่อ Re-map UI
      } else {
        alert("❌ บันทึกไม่สำเร็จ: เซิร์ฟเวอร์ไม่ยอมรับข้อมูล");
      }
    } catch (err) { alert("❌ เชื่อมต่อ API ไม่สำเร็จ"); }
    finally { setIsSaving(false); }
  };

  const handleToggleBot = async () => {
    if (!data || isToggling) return;
    setIsToggling(true);
    const action = data.status === "RUNNING" ? "pause" : "resume";
    try {
      await fetch(`http://localhost:8000/bot/${botId}/${action}`, { method: "POST" });
      await fetchBotData();
    } catch (err) { alert("Error Port 8000"); }
    finally { setIsToggling(false); }
  };

  if (isLoading) return <div className="h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-[#8B5CF6] w-12 h-12" /></div>;

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800">
      <aside className="sticky top-0 h-screen hidden md:block z-40">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardHeader title={`Bot Details`} />

        <div className="flex-grow p-8 lg:p-12 max-w-[1400px] w-full mx-auto">
          
          <div className="flex flex-col items-center mb-16 gap-8 text-center">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              {data?.stock} <span className="text-slate-200 mx-3">|</span> <span className="text-slate-400 font-medium text-2xl tracking-normal">ID : {botId}</span>
            </h2>
            
            <div className="flex p-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm gap-2">
              <button onClick={() => setActiveTab('dashboard')} className={`px-12 py-3 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#8B5CF6] text-white shadow-xl shadow-purple-200' : 'text-slate-400 hover:text-slate-600'}`}>Dashboard</button>
              {data?.botType !== "AI" && (
                <button onClick={() => setActiveTab('configuration')} className={`px-12 py-3 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'configuration' ? 'bg-[#8B5CF6] text-white shadow-xl shadow-purple-200' : 'text-slate-400 hover:text-slate-600'}`}>Configuration</button>
              )}
            </div>
          </div>

          {activeTab === 'dashboard' ? (
            <section className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Current Profits</h4>
                  <div className={`p-8 rounded-3xl flex items-center gap-8 border transition-all ${(data?.totalPnL ?? 0) < 0 ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'}`}>
                    {(data?.totalPnL ?? 0) < 0 ? <TrendingDown size={56}/> : <TrendingUp size={56}/>}
                    <div><p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total PnL</p><p className="text-4xl font-black">{data?.totalPnL.toLocaleString()} ฿</p></div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative flex flex-col justify-between overflow-hidden">
                  {isToggling && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-purple-600"/></div>}
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Bot Status</h4>
                    <div className="bg-purple-50 p-8 rounded-3xl flex items-center gap-6 border border-purple-100">
                      <div className="p-4 bg-white rounded-2xl shadow-sm"><Bot size={36} className="text-[#8B5CF6]" /></div>
                      <p className={`text-2xl font-black uppercase tracking-tight ${data?.status === 'RUNNING' ? 'text-emerald-600' : 'text-slate-400'}`}>{data?.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100">
                    <span className="font-bold text-slate-700">Bot Control</span>
                    <button onClick={handleToggleBot} className={`w-16 h-8 rounded-full relative transition-all ${data?.status === 'RUNNING' ? 'bg-[#8B5CF6]' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${data?.status === 'RUNNING' ? 'left-9' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order History Table */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black text-slate-800 mb-8">Order History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="pb-4 px-6">Price_at</th><th className="pb-4 px-6">Amount</th><th className="pb-4 px-6">Date-Time</th><th className="pb-4 px-6 text-center">Action</th><th className="pb-4 px-6 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.history && data.history.length > 0 ? data.history.map((order: any) => (
                        /* ✅ ลบ group และ hover effect ที่ทำให้เกิดเงาสีม่วงออกถาวร */
                        <tr key={order.id} className="transition-all duration-300">
                          <td className="p-6 bg-slate-50/50 rounded-l-3xl font-black text-slate-700">{parseFloat(order.priceAt).toFixed(2)} THB</td>
                          <td className="p-6 bg-slate-50/50 text-slate-500 font-bold">{order.amount}</td>
                          <td className="p-6 bg-slate-50/50 text-slate-400 text-[11px] font-bold">{new Date(order.dateTime).toLocaleString().toUpperCase()}</td>
                          <td className="p-6 bg-slate-50/50 text-center"><span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${order.action === 'BUY' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{order.action}</span></td>
                          <td className={`p-6 bg-slate-50/50 rounded-r-3xl text-right font-black ${parseFloat(order.totalProfit) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{parseFloat(order.totalProfit).toLocaleString()} ฿</td>
                        </tr>
                      )) : <tr><td colSpan={5} className="text-center py-20 text-slate-300 font-bold tracking-widest uppercase">NO ORDER HISTORY AVAILABLE</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : (
            /* --- CONFIGURATION VIEW --- */
            <section className="animate-in slide-in-from-bottom-8 duration-600 space-y-12 max-w-5xl mx-auto pb-20">
              <div className="flex justify-end">
                <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 flex items-center gap-6 shadow-sm">
                  <span className="font-black text-slate-700 text-sm tracking-tight">Private Mode</span>
                  <button onClick={() => setIsPrivate(!isPrivate)} className={`w-12 h-6 rounded-full relative transition-all ${isPrivate ? 'bg-[#8B5CF6]' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPrivate ? 'right-1.5' : 'left-1.5'}`}></div></button>
                </div>
              </div>

              {/* Advance Setting Section */}
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                <div className="flex items-center gap-4"><Zap className="text-amber-500 fill-amber-500" size={32} /><h4 className="text-2xl font-black text-slate-800 tracking-tight">Advance Setting</h4></div>
                <div className="space-y-12">
                  <div className="grid grid-cols-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-50 pb-4"><span>Indicator</span><span>Condition</span><span>Value/Indicator</span><span>Action</span></div>
                  {rules.map((rule, rIdx) => (
                    <div key={rule.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-50/30 space-y-8 relative">
                      <div className="flex justify-between items-center">
                        <span className="bg-slate-800 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">Group #{rIdx+1}</span>
                        <div className="flex items-center gap-4">
                          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 h-11 min-w-[100px] flex items-center">
                             <select value={rule.action} onChange={(e) => updateRuleAction(rule.id, e.target.value)} className="appearance-none w-full bg-transparent font-black text-sm outline-none px-4 pr-10 text-slate-900" style={{ color: rule.action === 'BUY' ? '#10B981' : '#EF4444' }}><option value="BUY">BUY</option><option value="SELL">SELL</option></select>
                             <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-400" />
                          </div>
                          {rIdx > 0 && <button onClick={() => removeRuleGroup(rule.id)} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={20}/></button>}
                        </div>
                      </div>
                      {rule.conditions.map((cond: any) => (
                        <div key={cond.id} className="grid grid-cols-4 gap-6 items-center">
                          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="relative flex-1 bg-slate-50 rounded-xl h-10 flex items-center">
                              <select value={cond.indicator} onChange={e => updateCondition(rule.id, cond.id, 'indicator', e.target.value)} className="appearance-none w-full bg-transparent font-bold text-xs outline-none px-3 pr-8"><option value="">เลือก</option>{INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                              <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-300" />
                            </div>
                            <div className="w-12 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><input value={cond.period} onChange={e => updateCondition(rule.id, cond.id, 'period', e.target.value)} className="bg-transparent w-full text-center text-xs font-bold outline-none" placeholder="Pd" /></div>
                          </div>
                          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm h-14 flex items-center">
                            <div className="relative w-full bg-slate-50 rounded-xl h-10 flex items-center px-3">
                              <select value={cond.operator} onChange={e => updateCondition(rule.id, cond.id, 'operator', e.target.value)} className="appearance-none w-full bg-transparent font-bold text-xs outline-none text-center cursor-pointer"><option value="">เลือก</option>{CONDITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                              <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-300" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="relative flex-1 bg-slate-50 rounded-xl h-10 flex items-center px-2">
                              <select value={cond.rightType} onChange={e => updateCondition(rule.id, cond.id, 'rightType', e.target.value)} className="appearance-none bg-transparent font-bold text-[10px] w-14 outline-none text-slate-400 uppercase border-r border-slate-100 mr-2 pr-4"><option value="VALUE">VAL</option><option value="INDICATOR">IND</option></select>
                              {cond.rightType === 'VALUE' ? (
                                <input value={cond.rightValue} onChange={e => updateCondition(rule.id, cond.id, 'rightValue', e.target.value)} className="bg-transparent w-full font-bold text-xs outline-none" placeholder="ค่า" />
                              ) : (
                                <select value={cond.rightIndicator} onChange={e => updateCondition(rule.id, cond.id, 'rightIndicator', e.target.value)} className="appearance-none bg-transparent font-bold text-xs w-full outline-none"><option value="">เลือก</option>{INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                              )}
                            </div>
                            {cond.rightType === 'INDICATOR' && (<div className="w-12 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><input value={cond.rightPeriod} onChange={e => updateCondition(rule.id, cond.id, 'rightPeriod', e.target.value)} className="bg-transparent w-full text-center text-xs font-bold outline-none" placeholder="Pd" /></div>)}
                          </div>
                          <div className={`text-center font-black text-xs uppercase tracking-widest ${rule.action === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>{rule.action}</div>
                        </div>
                      ))}
                      <div className="flex gap-4 pt-4 ml-2">
                        <button onClick={() => setRuleLogic(rule.id, 'AND')} className={`px-6 py-2 rounded-full text-[10px] font-black border transition-all ${rule.logic === 'AND' ? 'bg-purple-100 text-[#6A0DAD] border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>AND</button>
                        <button onClick={() => setRuleLogic(rule.id, 'OR')} className={`px-6 py-2 rounded-full text-[10px] font-black border transition-all ${rule.logic === 'OR' ? 'bg-purple-100 text-[#6A0DAD] border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>OR</button>
                        <button onClick={() => addSubRule(rule.id)} className="px-6 py-2 rounded-full text-[10px] font-black bg-white text-slate-400 border border-slate-100 hover:bg-slate-50">+ SUB-RULE</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addRuleGroup} className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-slate-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"><Plus size={18} /> Add Logic Group</button>
                </div>
              </div>

              {/* Risk Management Section */}
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
                <div className="flex items-center gap-4"><ShieldCheck className="text-emerald-500" size={32} /><h4 className="text-2xl font-black text-slate-800 tracking-tight">Risk Management</h4></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-4"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Risk Percentage (%)</label><input type="number" value={riskPct} onChange={(e)=>setRiskPct(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-900 focus:ring-4 focus:ring-purple-100 outline-none" /></div>
                  <div className="space-y-4"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Risk-Reward (RR)</label><input type="number" step="0.1" value={rrValue} onChange={(e)=>setRrValue(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-900 focus:ring-4 focus:ring-purple-100 outline-none" /></div>
                  <div className="space-y-4"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">ATR Period</label><input type="number" value={atrPeriod} onChange={(e)=>setAtrPeriod(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-900 focus:ring-4 focus:ring-purple-100 outline-none" /></div>
                  <div className="space-y-4"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">ATR Multiplier</label><input type="number" step="0.1" value={atrMult} onChange={(e)=>setAtrMult(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black text-slate-900 focus:ring-4 focus:ring-purple-100 outline-none" /></div>
                </div>
              </div>
              <div className="flex justify-center gap-8 pt-10">
                <button onClick={handleSaveConfig} disabled={isSaving} className="px-20 py-6 bg-[#8B5CF6] text-white text-lg font-black rounded-full shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4">{isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}</button>
                <button onClick={() => setActiveTab('dashboard')} className="px-16 py-6 bg-slate-100 text-slate-400 font-black rounded-full hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
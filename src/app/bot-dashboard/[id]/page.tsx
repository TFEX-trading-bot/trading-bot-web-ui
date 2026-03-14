"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header"; 
import ProfileDropdown from "@/components/ProfileDropdown";
import { 
  Bot, TrendingUp, TrendingDown, Loader2, 
  ShieldCheck, ChevronDown, Zap, Plus, Trash2, Menu, ArrowLeft
} from "lucide-react";
import axios from "axios";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

export default function BotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.id;
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'configuration'>('dashboard');
  const [data, setData] = useState<BotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/bots/${botId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = response.data;
      
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
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/bots/${botId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 || response.status === 204) { 
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
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/bots/${botId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchBotData();
    } catch (err) { alert("❌ ทำรายการไม่สำเร็จ"); }
    finally { setIsToggling(false); }
  };

  if (isLoading) return <div className="h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-[#8B5CF6] w-12 h-12" /></div>;

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800 relative">
      {/* Backdrop สีดำโปร่งแสงสำหรับมือถือ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Hamburger Menu Drawer สำหรับมือถือ) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* แถบด้านบนสำหรับมือถือ พร้อมปุ่ม Hamburger Menu */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 rounded-xl bg-purple-50 text-[#8200DB] hover:bg-purple-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="ml-4 text-[24px] font-black bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6] bg-clip-text text-transparent leading-normal tracking-tight pb-1">
              Bot Details
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title={`Bot Details`} />
        </div>

        <div className="flex-grow p-8 lg:p-12 max-w-[1400px] w-full mx-auto">
          
          {/* ปุ่มย้อนกลับ (Back Button) ด้านบน */}
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-400 hover:text-[#6A0DAD] transition-colors font-bold text-[11px] tracking-widest uppercase mb-6 w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Bots
          </button>

          <div className="flex flex-col items-center mb-10 gap-6 text-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {data?.stock} <span className="text-slate-200 mx-3">|</span> <span className="text-slate-400 font-medium text-xl tracking-normal">ID : {botId}</span>
            </h2>
            
            <div className="flex p-1.5 bg-slate-100 rounded-full border border-slate-200 shadow-inner gap-1">
              <button onClick={() => setActiveTab('dashboard')} className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#8B5CF6] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
              {data?.botType !== "AI" && (
                <button onClick={() => setActiveTab('configuration')} className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'configuration' ? 'bg-[#8B5CF6] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Configuration</button>
              )}
            </div>
          </div>

          {activeTab === 'dashboard' ? (
            <section className="space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h4 className="text-base font-bold text-slate-800 mb-4 tracking-tight">Current Profits</h4>
                  <div className={`p-5 rounded-2xl flex items-center gap-5 border transition-all ${(data?.totalPnL ?? 0) < 0 ? 'bg-rose-50/50 border-rose-100 text-rose-500' : 'bg-emerald-50/50 border-emerald-100 text-emerald-500'}`}>
                    <div className={`p-3 rounded-xl ${(data?.totalPnL ?? 0) < 0 ? 'bg-rose-100' : 'bg-emerald-100'}`}>{(data?.totalPnL ?? 0) < 0 ? <TrendingDown size={32}/> : <TrendingUp size={32}/>}</div>
                    <div><p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Total PnL</p><p className="text-3xl font-black">{data?.totalPnL.toLocaleString()} <span className="text-lg">฿</span></p></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative flex flex-col justify-between overflow-hidden">
                  {isToggling && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-purple-600"/></div>}
                  <div>
                    <h4 className="text-base font-bold text-slate-800 mb-4 tracking-tight">Bot Status</h4>
                    <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-5 border border-slate-100">
                      <div className="p-3 bg-white rounded-xl shadow-sm"><Bot size={32} className="text-[#8B5CF6]" /></div>
                      <p className={`text-xl font-black uppercase tracking-tight ${data?.status === 'RUNNING' ? 'text-emerald-600' : 'text-slate-400'}`}>{data?.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                    <span className="font-bold text-sm text-slate-600">Bot Control</span>
                    <button onClick={handleToggleBot} className={`w-12 h-6 rounded-full relative transition-all ${data?.status === 'RUNNING' ? 'bg-[#8B5CF6]' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${data?.status === 'RUNNING' ? 'left-7' : 'left-1'}`} />
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
            <section className="animate-in slide-in-from-bottom-8 duration-600 space-y-5 max-w-4xl mx-auto pb-20">
              <div className="flex justify-end">
                <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                  <span className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Private Mode</span>
                  <button type="button" onClick={() => setIsPrivate(!isPrivate)} className={`w-8 h-4 rounded-full relative transition-all ${isPrivate ? 'bg-[#8B5CF6]' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isPrivate ? 'right-0.5' : 'left-0.5'}`}></div></button>
                </div>
              </div>

              {/* Advance Setting Section */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2"><Zap className="text-amber-500 fill-amber-500" size={18} /><h4 className="text-lg font-black text-slate-800 tracking-tight">Advance Setting</h4></div>
                <div className="space-y-5">
                  <div className="grid grid-cols-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-50 pb-3"><span>Indicator</span><span>Condition</span><span>Value/Indicator</span><span>Action</span></div>
                  {rules.map((rule, rIdx) => (
                    <div key={rule.id} className="p-4 md:p-6 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 relative">
                      <div className="flex justify-between items-center">
                        <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">Group #{rIdx+1}</span>
                        <div className="flex items-center gap-3">
                          <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 h-9 min-w-[90px] flex items-center">
                             <select value={rule.action} onChange={(e) => updateRuleAction(rule.id, e.target.value)} className="appearance-none w-full bg-transparent font-black text-sm outline-none px-4 pr-10 cursor-pointer" style={{ color: rule.action === 'BUY' ? '#10B981' : '#EF4444' }}><option value="BUY">BUY</option><option value="SELL">SELL</option></select>
                             <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-400" />
                          </div>
                          {rIdx > 0 && <button type="button" onClick={() => removeRuleGroup(rule.id)} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={18}/></button>}
                        </div>
                      </div>
                      {rule.conditions.map((cond: any) => (
                        <div key={cond.id} className="grid grid-cols-4 gap-4 items-center">
                          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm h-11">
                            <div className="relative flex-1 bg-slate-50 rounded-lg h-full flex items-center">
                              <select value={cond.indicator} onChange={e => updateCondition(rule.id, cond.id, 'indicator', e.target.value)} className="appearance-none w-full bg-transparent font-bold text-xs outline-none text-slate-900 px-3 cursor-pointer pr-8"><option value="">เลือก</option>{INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                              <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-300" />
                            </div>
                            <div className="w-10 h-full bg-slate-100 rounded-lg flex items-center justify-center"><input value={cond.period} onChange={e => updateCondition(rule.id, cond.id, 'period', e.target.value)} className="bg-transparent w-full text-center text-xs font-bold outline-none" placeholder="Pd" /></div>
                          </div>
                          <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm h-11 flex items-center">
                            <div className="relative w-full bg-slate-50 rounded-lg h-full flex items-center px-2">
                              <select value={cond.operator} onChange={e => updateCondition(rule.id, cond.id, 'operator', e.target.value)} className="appearance-none w-full bg-transparent font-bold text-xs outline-none text-slate-900 text-center cursor-pointer px-3 pr-8"><option value="">เลือกเงื่อนไข</option>{CONDITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                              <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-300" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm h-11">
                            <div className="relative flex-1 bg-slate-50 rounded-lg h-full flex items-center px-2">
                              <select value={cond.rightType} onChange={e => updateCondition(rule.id, cond.id, 'rightType', e.target.value)} className="appearance-none bg-transparent font-bold text-[10px] w-14 outline-none text-slate-400 uppercase border-r border-slate-100 mr-2 pr-4"><option value="VALUE">VAL</option><option value="INDICATOR">IND</option></select>
                              {cond.rightType === 'VALUE' ? (
                                <input value={cond.rightValue} onChange={e => updateCondition(rule.id, cond.id, 'rightValue', e.target.value)} className="bg-transparent w-full font-bold text-xs text-slate-900 outline-none" placeholder="ค่า" />
                              ) : (
                                <select value={cond.rightIndicator} onChange={e => updateCondition(rule.id, cond.id, 'rightIndicator', e.target.value)} className="appearance-none bg-transparent font-bold text-xs w-full outline-none text-slate-900 pr-6"><option value="">เลือก</option>{INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                              )}
                            </div>
                            {cond.rightType === 'INDICATOR' && (<div className="w-10 h-full bg-slate-100 rounded-lg flex items-center justify-center"><input value={cond.rightPeriod} onChange={e => updateCondition(rule.id, cond.id, 'rightPeriod', e.target.value)} className="bg-transparent w-full text-center text-xs font-bold outline-none" placeholder="Pd" /></div>)}
                          </div>
                          <div className={`text-center font-black text-xs uppercase tracking-widest ${rule.action === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>{rule.action}</div>
                        </div>
                      ))}
                      <div className="flex gap-3 pt-2 ml-1">
                        <button type="button" onClick={() => setRuleLogic(rule.id, 'AND')} className={`px-6 py-1.5 rounded-full text-[10px] font-black border transition-all ${rule.logic === 'AND' ? 'bg-purple-100 text-[#6A0DAD] border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>AND</button>
                        <button type="button" onClick={() => setRuleLogic(rule.id, 'OR')} className={`px-6 py-1.5 rounded-full text-[10px] font-black border transition-all ${rule.logic === 'OR' ? 'bg-purple-100 text-[#6A0DAD] border-purple-200' : 'bg-white text-slate-400 border-slate-100'}`}>OR</button>
                        <button type="button" onClick={() => addSubRule(rule.id)} className="px-6 py-1.5 rounded-full text-[10px] font-black bg-white text-slate-400 border border-slate-100 hover:bg-slate-50">+ SUB-RULE</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addRuleGroup} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all mt-2"><Plus size={16} /> Add Logic Group</button>
                </div>
              </div>

              {/* Risk Management Section */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2"><ShieldCheck className="text-emerald-500" size={18} /><h4 className="text-lg font-black text-slate-800 tracking-tight">Risk Management</h4></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Percentage (%)</label><input type="number" value={riskPct} onChange={(e)=>setRiskPct(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk-Reward (RR)</label><input type="number" step="0.1" value={rrValue} onChange={(e)=>setRrValue(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ATR Period</label><input type="number" value={atrPeriod} onChange={(e)=>setAtrPeriod(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ATR Multiplier</label><input type="number" step="0.1" value={atrMult} onChange={(e)=>setAtrMult(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" /></div>
                </div>
              </div>
              <div className="pt-8 pb-12 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                <button type="button" onClick={() => setActiveTab('dashboard')} className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                <button type="button" onClick={handleSaveConfig} disabled={isSaving} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#8200DB] to-[#5837F6] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-200 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin size-4" /> : "Save Changes"}</button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
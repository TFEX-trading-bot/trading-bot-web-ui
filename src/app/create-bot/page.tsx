"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar"; // ✅ เพิ่ม Sidebar
import DashboardHeader from "@/components/Header"; // ✅ เพิ่ม Header
import Footer from "@/components/Footer";
import { ChevronDown, Info, Plus, Trash2, Zap, Search, Loader2, Menu } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import axios from "axios"; // มั่นใจว่าได้ติดตั้ง axios แล้ว
import { useRouter } from "next/navigation";

// --- Configuration ---
const INDICATOR_OPTIONS = [
  "RSI", "SMA", "EMA", "MACD", "STOCH", "ATR", "BBANDS", "OBV", 
  "CLOSE", "OPEN", "HIGH", "LOW", "ADX", "DZV", "VWAP", "VOLUME", 
  "HIGHN", "LOWN", "KELTNER", "DONCHIAN", "CHOP", "CRSI", "SUPERTREND"
];

const CONDITION_OPTIONS = [
  { label: "Cross Above", value: "CROSS_ABOVE" },
  { label: "Cross Below", value: "CROSS_BELOW" },
  { label: "Greater (>)", value: "GREATER" },
  { label: "Less (<)", value: "LESS" }
];

const generateMarketSymbols = () => {
    const products = ["S50", "GO", "USD", "SVF", "JRF"];
    const months = ["H", "M", "U", "Z"];
    const currentYear = new Date().getFullYear() % 100; 
    const years = [currentYear, currentYear + 1];
    let generated: string[] = [];
    products.forEach(p => years.forEach(y => months.forEach(m => generated.push(`${p}${m}${y}`))));
    const stocks = ["ADVANC", "AOT", "KBANK", "PTT", "SCB", "GULF", "CPALL", "DELTA"];
    return [...generated, ...stocks].sort();
};

export default function CreateBotPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Market");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const allSymbols = useMemo(() => generateMarketSymbols(), []);
    const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- Form States ---
    const [basicInfo, setBasicInfo] = useState({ stock: "", assigned_capital: "" });
    const [auth, setAuth] = useState({ 
        broker_id: "SANDBOX", app_code: "SANDBOX", account_no: "", pin: "", 
        app_id: "", app_secret: "" 
    });
    const [risk, setRisk] = useState({ risk_pct: 2, rr: 1.5, atr_period: 14, atr_mult: 2 });

    const [rules, setRules] = useState<any[]>([
        { 
            id: Date.now(), 
            action: "BUY", 
            conditions: [{ id: Date.now() + 1, indicator: "RSI", period: 14, operator: "GREATER", rightType: "VALUE", rightValue: 30, rightIndicator: "SMA", rightPeriod: 14 }]
        }
    ]);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Handlers ---
    const updateCondition = (rid: number, cid: number, f: string, v: any) => 
        setRules(rules.map(r => r.id === rid ? { ...r, conditions: r.conditions.map((c:any) => c.id === cid ? { ...c, [f]: v } : c) } : r));

    const updateRuleAction = (id: number, action: string) => 
        setRules(rules.map(r => r.id === id ? { ...r, action } : r));

    const addRuleGroup = () => setRules([...rules, { 
        id: Date.now(), action: "SELL", 
        conditions: [{ id: Date.now() + 1, indicator: "RSI", period: 14, operator: "LESS", rightType: "VALUE", rightValue: 70, rightIndicator: "SMA", rightPeriod: 14 }] 
    }]);

    const addSubRule = (groupId: number) => {
        setRules(rules.map(r => r.id === groupId ? {
            ...r, conditions: [...r.conditions, { id: Date.now(), indicator: "SMA", period: 14, operator: "GREATER", rightType: "VALUE", rightValue: 0, rightIndicator: "SMA", rightPeriod: 14 }]
        } : r));
    };

    // --- 🚀 SUBMIT FUNCTION ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const storedUserId = localStorage.getItem("user_id");
            const userId = storedUserId ? Number(storedUserId) : 1;

            const payload = {
                user_id: userId,
                stock: basicInfo.stock,
                timeframe: "15T",
                broker_id: auth.broker_id,
                app_code: auth.app_code,
                app_id: auth.app_id,
                app_secret: auth.app_secret,
                account_no: auth.account_no,
                pin: auth.pin,
                public: "true", 
                bot_type: "POLICY",
                strategy_config: {
                    risk: {
                        risk_pct: Number(risk.risk_pct),
                        sl_model: "ATR",
                        atr_period: Number(risk.atr_period),
                        atr_mult: Number(risk.atr_mult),
                        rr: Number(risk.rr)
                    },
                    rules: rules.map((r, index) => ({
                        action: r.action,
                        priority: index + 1,
                        and: r.conditions.map((c: any) => ({
                            indicator: c.indicator,
                            period: Number(c.period),
                            op: c.operator,
                            right: c.rightType === "VALUE" 
                                ? { type: "VALUE", value: Number(c.rightValue) } 
                                : { type: "INDICATOR", indicator: c.rightIndicator, period: Number(c.rightPeriod) }
                        }))
                    }))
                }
            };

            const response = await axios.post("http://localhost:8000/spawn-bot", payload);
            if (response.status === 200 || response.status === 201) {
                alert("✅ Live Bot Created Successfully!");
            }
        } catch (error: any) {
            const msg = error.response?.data?.detail ? JSON.stringify(error.response.data.detail) : error.message;
            alert("❌ Failed to create bot: " + msg);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                      Create Bot
                    </span>
                  </div>
                  <ProfileDropdown />
                </div>

                {/* ซ่อน Header ของ Desktop บนมือถือ */}
                <div className="hidden md:block">
                    <DashboardHeader title="Create Your Trading Bot" />
                </div>

                <div className="flex-grow p-6 lg:p-8 max-w-5xl w-full mx-auto">
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex bg-slate-100 p-1.5 rounded-full shadow-inner gap-1">
                            <button type="button" onClick={() => setActiveTab("Market")} className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "Market" ? "bg-[#8B5CF6] text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}>Market</button>
                            <button type="button" onClick={() => setActiveTab("Backtest")} className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "Backtest" ? "bg-[#8B5CF6] text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}>Backtest</button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Stock Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 relative" ref={searchRef}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                                <div className="relative">
                                    <input value={basicInfo.stock} onChange={e => {
                                        const val = e.target.value.toUpperCase();
                                        setBasicInfo({...basicInfo, stock: val});
                                        if (val.length > 0) {
                                            setFilteredSymbols(allSymbols.filter(s => s.includes(val)).slice(0, 10));
                                            setShowSuggestions(true);
                                        } else setShowSuggestions(false);
                                    }} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" placeholder="S50H26" />
                                    <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
                                    {showSuggestions && (
                                        <div className="absolute z-50 w-full bg-white border border-slate-100 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto">
                                            {filteredSymbols.map(s => <div key={s} onClick={() => { setBasicInfo({...basicInfo, stock: s}); setShowSuggestions(false); }} className="px-5 py-3 hover:bg-purple-50 cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50">{s}</div>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max investing amount</label>
                                <input type="number" onChange={(e) => setBasicInfo({...basicInfo, assigned_capital: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" placeholder="0" />
                            </div>
                        </div>

                        {/* Broker Configuration */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">Broker Configuration <Info size={16} className="text-purple-500" /></h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Broker ID</label>
                                    <input value={auth.broker_id} onChange={e => setAuth({...auth, broker_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Code</label>
                                    <input value={auth.app_code} onChange={e => setAuth({...auth, app_code: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account No.</label>
                                    <input value={auth.account_no} onChange={e => setAuth({...auth, account_no: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN</label>
                                    <input type="password" value={auth.pin} onChange={e => setAuth({...auth, pin: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Authentication */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-black text-slate-800">Authentication</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application ID</label>
                                    <input value={auth.app_id} onChange={e => setAuth({...auth, app_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Secret</label>
                                    <input type="password" value={auth.app_secret} onChange={e => setAuth({...auth, app_secret: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Advance Setting */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">Advance Setting <Zap size={18} className="text-amber-500" /></h3>
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                                <div className="grid grid-cols-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-50 pb-3">
                                    <span>Indicator</span>
                                    <span>Condition</span>
                                    <span>Value/Indicator</span>
                                    <span>Action</span>
                                </div>

                                {rules.map((rule) => (
                                    <div key={rule.id} className="p-4 md:p-6 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 relative">
                                        {rule.conditions.map((cond: any, cIdx: number) => (
                                            <div key={cond.id} className="grid grid-cols-4 gap-4 items-center">
                                                {/* LEFT INDICATOR */}
                                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm h-11">
                                                    <div className="relative flex-1 bg-slate-50 rounded-lg h-full flex items-center">
                                                        <select value={cond.indicator} onChange={e => updateCondition(rule.id, cond.id, 'indicator', e.target.value)} className="appearance-none w-full bg-transparent font-bold text-xs outline-none text-slate-900 px-3 cursor-pointer pr-8">
                                                            <option value="">เลือก</option>
                                                            {INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-400" />
                                                    </div>
                                                    <div className="w-10 h-full bg-slate-100 rounded-lg flex items-center justify-center">
                                                        <input value={cond.period} onChange={e => updateCondition(rule.id, cond.id, 'period', e.target.value)} className="bg-transparent w-full text-center text-xs font-bold text-slate-900 outline-none" placeholder="Pd" />
                                                    </div>
                                                </div>

                                                {/* CONDITION */}
                                                <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm h-11 flex items-center">
                                                    <div className="relative w-full bg-slate-50 rounded-lg h-full flex items-center px-2">
                                                        <select value={cond.operator} onChange={e => updateCondition(rule.id, cond.id, 'operator', e.target.value)} className="appearance-none w-full bg-transparent font-bold text-xs outline-none text-slate-900 text-center cursor-pointer px-3 pr-8">
                                                            <option value="">เลือกเงื่อนไข</option>
                                                            {CONDITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-400" />
                                                    </div>
                                                </div>

                                                {/* VALUE / INDICATOR */}
                                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm h-11">
                                                    <div className="relative flex-1 bg-slate-50 rounded-lg h-full flex items-center px-2">
                                                        <select value={cond.rightType} onChange={e => updateCondition(rule.id, cond.id, 'rightType', e.target.value)} className="appearance-none bg-transparent font-bold text-[10px] w-14 outline-none text-slate-400 uppercase border-r border-slate-100 mr-2 pr-4">
                                                            <option value="VALUE">VAL</option>
                                                            <option value="INDICATOR">IND</option>
                                                        </select>
                                                        
                                                        {cond.rightType === 'VALUE' ? (
                                                            <input value={cond.rightValue} onChange={e => updateCondition(rule.id, cond.id, 'rightValue', e.target.value)} className="bg-transparent w-full font-bold text-xs text-slate-900 outline-none" placeholder="ค่า" />
                                                        ) : (
                                                            <select value={cond.rightIndicator} onChange={e => updateCondition(rule.id, cond.id, 'rightIndicator', e.target.value)} className="appearance-none bg-transparent font-bold text-xs w-full outline-none text-slate-900 pr-6">
                                                                <option value="">เลือก</option>
                                                                {INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                        )}
                                                    </div>
                                                    {cond.rightType === 'INDICATOR' && (
                                                        <div className="w-10 h-full bg-slate-100 rounded-lg flex items-center justify-center">
                                                            <input value={cond.rightPeriod} onChange={e => updateCondition(rule.id, cond.id, 'rightPeriod', e.target.value)} className="bg-transparent w-full text-center text-xs font-bold text-slate-900 outline-none" placeholder="Pd" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ACTION */}
                                                <div className="flex justify-end items-center gap-3">
                                                    {cIdx === 0 && (
                                                        <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 h-9 min-w-[90px] flex items-center">
                                                            <select value={rule.action} onChange={(e) => updateRuleAction(rule.id, e.target.value)} className="appearance-none w-full bg-transparent font-black text-sm outline-none cursor-pointer px-4 pr-10" style={{ color: rule.action === 'BUY' ? '#10B981' : '#EF4444' }}>
                                                                <option value="BUY">BUY</option><option value="SELL">SELL</option>
                                                            </select>
                                                            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <button type="button" onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex gap-3 pt-2 ml-1">
                                            <button type="button" className="px-6 py-1.5 rounded-full text-[10px] font-black bg-purple-100 text-[#6A0DAD] border-purple-200">AND</button>
                                            <button type="button" onClick={() => addSubRule(rule.id)} className="px-6 py-1.5 rounded-full text-[10px] font-black bg-white text-slate-400 border border-slate-200 hover:bg-slate-50">+ SUB-RULE</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addRuleGroup} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all mt-2"><Plus size={16} /> Add Logic Group</button>
                            </div>
                        </div>

                        {/* Risk Management */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">Risk Management <Zap size={18} className="text-emerald-500" /></h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk per trade (%)</label>
                                    <input type="number" step="0.1" value={risk.risk_pct} onChange={e => setRisk({...risk, risk_pct: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Reward Ratio</label>
                                    <input type="number" step="0.1" value={risk.rr} onChange={e => setRisk({...risk, rr: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ATR Period</label>
                                    <input type="number" value={risk.atr_period} onChange={e => setRisk({...risk, atr_period: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ATR Multiplier</label>
                                    <input type="number" step="0.1" value={risk.atr_mult} onChange={e => setRisk({...risk, atr_mult: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-900 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 pb-12 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                            <button 
                                type="button" 
                                onClick={() => router.back()} 
                                className="w-full sm:w-auto px-8 py-4 text-slate-400 font-black text-xs hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#8200DB] to-[#5837F6] text-white text-xs font-black rounded-xl shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                {isSubmitting ? "Processing..." : "Create Bot"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
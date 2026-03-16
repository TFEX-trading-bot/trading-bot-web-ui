"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar"; 
import DashboardHeader from "@/components/Header"; 
import Footer from "@/components/Footer";
import { 
  ChevronDown, Info, Plus, Trash2, Zap, Search, Loader2, Menu, 
  X, ArrowUpRight, ShieldCheck, Lock, Globe, CheckCircle2,
  LineChart as LineChartIcon 
} from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import axios from "axios"; 
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Configuration ---
const INDICATOR_OPTIONS = ["RSI", "SMA", "EMA", "MACD", "STOCH", "ATR", "BBANDS", "OBV", "CLOSE", "OPEN", "HIGH", "LOW", "ADX", "DZV", "VWAP", "VOLUME", "HIGHN", "LOWN", "KELTNER", "DONCHIAN", "CHOP", "CRSI", "SUPERTREND"];
const CONDITION_OPTIONS = [{ label: "Cross Above", value: "CROSS_ABOVE" }, { label: "Cross Below", value: "CROSS_BELOW" }, { label: "Greater (>)", value: "GREATER" }, { label: "Less (<)", value: "LESS" }];

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const allSymbols = useMemo(() => generateMarketSymbols(), []);
    const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- States ---
    const [botModel, setBotModel] = useState<"AI" | "Policy">("Policy");
    const [isBacktesting, setIsBacktesting] = useState(false);
    const [backtestData, setBacktestData] = useState<any>(null);
    
    // --- Verification States ---
    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [cashBalance, setCashBalance] = useState<number | null>(null);

    const [basicInfo, setBasicInfo] = useState({ stock: "", assigned_capital: "" });
    const [auth, setAuth] = useState({ 
        broker_id: "003", app_code: "ALGO", account_no: "", pin: "", 
        app_id: "", app_secret: "" 
    });
    const [risk, setRisk] = useState({ risk_pct: 2, rr: 1.5, atr_period: 14, atr_mult: 2 });
    const [rules, setRules] = useState<any[]>([
        { id: Date.now(), action: "BUY", logic: "AND", conditions: [{ id: Date.now() + 1, indicator: "RSI", period: 14, operator: "LESS", rightType: "VALUE", rightValue: 30, rightIndicator: "", rightPeriod: "" }] }
    ]);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- 🔐 Reset Verification Helper ---
    // เรียกใช้ฟังก์ชันนี้เมื่อมีการแก้ข้อมูล Authentication
    const resetVerification = () => {
        if (isVerified) {
            setIsVerified(false);
            setCashBalance(null);
        }
    };

    const handleAuthChange = (field: string, value: string) => {
        setAuth({ ...auth, [field]: value });
        resetVerification(); // บังคับให้ต้อง verify ใหม่หากมีการแก้ข้อมูล
    };

    // --- 🔐 Verify Credentials ---
    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const verifyPayload = {
                broker_id: auth.broker_id, app_code: auth.app_code, app_id: auth.app_id,
                app_secret: auth.app_secret, account_no: auth.account_no, pin: auth.pin
            };
            const response = await axios.post("http://localhost:8000/verify-credentials", verifyPayload);
            if (response.data.status === "success") {
                setIsVerified(true);
                setCashBalance(response.data.cash_balance);
                alert(`✅ Verified Successfully!\nBalance: ${response.data.cash_balance.toLocaleString()} ฿`);
            }
        } catch (error: any) {
            setIsVerified(false);
            alert("❌ Verify Failed: Invalid Credentials.");
        } finally { setIsVerifying(false); }
    };

    // --- Logic Handlers ---
    const updateCondition = (rid: number, cid: number, f: string, v: any) => 
        setRules(rules.map(r => r.id === rid ? { ...r, conditions: r.conditions.map((c:any) => c.id === cid ? { ...c, [f]: v } : c) } : r));
    const updateRuleAction = (id: number, action: string) => setRules(rules.map(r => r.id === id ? { ...r, action } : r));
    const setRuleLogic = (id: number, logic: "AND" | "OR") => setRules(rules.map(r => r.id === id ? { ...r, logic } : r));
    const addRuleGroup = () => setRules([...rules, { id: Date.now(), action: "SELL", logic: "AND", conditions: [{ id: Date.now() + 1, indicator: "", period: "", operator: "", rightType: "VALUE", rightValue: "", rightIndicator: "", rightPeriod: "" }] }]);
    const removeRuleGroup = (id: number) => setRules(rules.filter(r => r.id !== id));
    const addSubRule = (groupId: number) => setRules(rules.map(r => r.id === groupId ? { ...r, conditions: [...r.conditions, { id: Date.now(), indicator: "", period: "", operator: "", rightType: "VALUE", rightValue: "", rightIndicator: "", rightPeriod: "" }] } : r));
    const removeSubRule = (rid: number, cid: number) => setRules(rules.map(r => r.id === rid ? { ...r, conditions: r.conditions.filter((c:any) => c.id !== cid) } : r));

    // --- 🛠 Backtest ---
    const handleRunBacktest = async () => {
        setIsBacktesting(true);
        const flatRules = rules.flatMap((group, gIdx) => group.conditions.map((cond: any, cIdx: number) => ({
            id: `rule_${gIdx}_${cIdx}`, action: group.action, priority: gIdx + 1, indicator: cond.indicator, period: Number(cond.period), op: cond.operator,
            right: cond.rightType === "VALUE" ? { type: "VALUE", value: Number(cond.rightValue) } : { type: "INDICATOR", indicator: cond.rightIndicator, period: Number(cond.rightPeriod) }
        })));
        try {
            const response = await axios.post("http://localhost:8000/backtest/policy", {
                stock: basicInfo.stock || "QH", timeframe: "15T", initial_capital: Number(basicInfo.assigned_capital || 100000), slippage: 0.01, commission_rate: 0.0005,
                strategy_config: { risk: { ...risk, sl_model: "ATR", contract_multiplier: 1 }, rules: flatRules }
            });
            if (response.data.status === "success") setBacktestData(response.data);
        } catch (error) { alert("Backtest Server Error"); } finally { setIsBacktesting(false); }
    };

    // --- 🚀 SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === "Backtest") { handleRunBacktest(); return; }

        // Validation Logic
        const isBasicValid = basicInfo.stock && basicInfo.assigned_capital;
        const isAuthValid = auth.broker_id && auth.app_code && auth.account_no && auth.pin && auth.app_id && auth.app_secret;
        if (!isBasicValid || !isAuthValid) {
            alert("❌ Deployment Failed: Please fill in all required fields in the form.");
            return;
        }

        if (!isVerified) {
            alert("❌ Deployment Failed: Please verify your credentials first.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                user_id: localStorage.getItem("user_id") || 1, stock: basicInfo.stock, timeframe: "15T", broker_id: auth.broker_id, app_code: auth.app_code, 
                app_id: auth.app_id, app_secret: auth.app_secret, account_no: auth.account_no, pin: auth.pin, public: "true", bot_type: botModel.toUpperCase(),
                strategy_config: { risk: { ...risk, sl_model: "ATR" }, rules: rules.map((r, i) => ({ action: r.action, priority: i + 1, [r.logic.toLowerCase()]: r.conditions.map((c: any) => ({ indicator: c.indicator, period: Number(c.period), op: c.operator, right: c.rightType === "VALUE" ? { type: "VALUE", value: Number(c.rightValue) } : { type: "INDICATOR", indicator: c.rightIndicator, period: Number(c.rightPeriod) } })) })) }
            };
            await axios.post("http://localhost:8000/spawn-bot", payload);
            alert("✅ Bot Strategy Deployed Successfully!");
        } catch (error: any) { alert("❌ Error: " + error.message); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFCFE] font-sans text-slate-800 relative">
            <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}><Sidebar /></aside>
            
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <div className="hidden md:block"><DashboardHeader title="Create Your Trading Bot" /></div>

                <div className="flex-grow p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-10">
                    <div className="flex justify-center">
                        <div className="flex bg-slate-100 p-1.5 rounded-full shadow-inner gap-1">
                            <button type="button" onClick={() => setActiveTab("Market")} className={`px-10 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "Market" ? "bg-[#8B5CF6] text-white shadow-md" : "text-slate-500"}`}>Market</button>
                            <button type="button" onClick={() => setActiveTab("Backtest")} className={`px-10 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "Backtest" ? "bg-[#8B5CF6] text-white shadow-md" : "text-slate-500"}`}>Backtest</button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Stock & Amount */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 relative" ref={searchRef}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                                <div className="relative">
                                    <input value={basicInfo.stock} onChange={e => { const val = e.target.value.toUpperCase(); setBasicInfo({...basicInfo, stock: val}); setFilteredSymbols(allSymbols.filter(s => s.includes(val)).slice(0, 10)); setShowSuggestions(val.length > 0); }} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-slate-900 border-none" placeholder="Symbol" />
                                    <Search className="w-4 h-4 text-slate-400 absolute right-4 top-4" />
                                    {showSuggestions && (<div className="absolute z-50 w-full bg-white border rounded-xl shadow-2xl mt-1 max-h-40 overflow-y-auto">{filteredSymbols.map(s => <div key={s} onClick={() => { setBasicInfo({...basicInfo, stock: s}); setShowSuggestions(false); }} className="px-4 py-2 hover:bg-purple-50 cursor-pointer font-bold text-sm border-b last:border-0">{s}</div>)}</div>)}
                                </div>
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max investing amount</label><input type="number" onChange={(e) => setBasicInfo({...basicInfo, assigned_capital: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-slate-900" /></div>
                        </section>

                        {/* Bot Configuration */}
                        <section className="space-y-8">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Bot Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Broker ID</label><input value={auth.broker_id} onChange={e => handleAuthChange('broker_id', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Code</label><input value={auth.app_code} onChange={e => handleAuthChange('app_code', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label><input value={auth.account_no} onChange={e => handleAuthChange('account_no', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN</label><input type="password" value={auth.pin} onChange={e => handleAuthChange('pin', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" /></div>
                            </div>
                        </section>

                        {/* Authentication & Verify */}
                        <section className="space-y-8">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Authentication</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application ID</label><input value={auth.app_id} onChange={e => handleAuthChange('app_id', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" /></div>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Secret</label><input type="password" value={auth.app_secret} onChange={e => handleAuthChange('app_secret', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                                <button type="button" onClick={handleVerify} disabled={isVerifying} className={`px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 ${isVerified ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-[#8B5CF6] text-white shadow-purple-100 active:scale-95"}`}>
                                    {isVerifying ? <Loader2 className="animate-spin" size={16} /> : (isVerified ? <CheckCircle2 size={16} /> : null)}
                                    {isVerified ? "Verified" : "Verify Credential & Balance"}
                                </button>
                                {isVerified && cashBalance !== null && (
                                    <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-left-2">Cash Balance: {cashBalance.toLocaleString()} ฿</div>
                                )}
                            </div>
                        </section>

                        {/* Model Selection */}
                        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">Model</h4>
                            <div className="flex gap-12 ml-4">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center"><input type="radio" checked={botModel === "AI"} onChange={() => setBotModel("AI")} className="peer appearance-none w-8 h-8 rounded-full border-4 border-slate-100 checked:border-[#8B5CF6] transition-all" /><div className="absolute w-4 h-4 rounded-full bg-transparent peer-checked:bg-[#8B5CF6] transition-all" /></div>
                                    <span className={`text-lg font-black ${botModel === "AI" ? 'text-slate-800' : 'text-slate-400'}`}>AI</span>
                                </label>
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center"><input type="radio" checked={botModel === "Policy"} onChange={() => setBotModel("Policy")} className="peer appearance-none w-8 h-8 rounded-full border-4 border-slate-100 checked:border-[#8B5CF6] transition-all" /><div className="absolute w-4 h-4 rounded-full bg-transparent peer-checked:bg-[#8B5CF6] transition-all" /></div>
                                    <span className={`text-lg font-black ${botModel === "Policy" ? 'text-slate-800' : 'text-slate-400'}`}>Policy</span>
                                </label>
                            </div>
                        </section>

                        {botModel === "Policy" && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="space-y-5">
                                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">Advance Setting <Zap size={18} className="text-amber-500" /></h3>
                                    <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-6">
                                        <div className="grid grid-cols-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b pb-3"><span>Indicator</span><span>Condition</span><span>Value/Indicator</span><span>Action</span></div>
                                        {rules.map((rule) => (
                                            <div key={rule.id} className="p-6 border rounded-2xl bg-slate-50/50 space-y-4 relative">
                                                {rule.conditions.map((cond: any, cIdx: number) => (
                                                    <div key={cond.id} className="grid grid-cols-4 gap-6 items-center">
                                                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border h-12 shadow-sm">
                                                            <select value={cond.indicator} onChange={e => updateCondition(rule.id, cond.id, 'indicator', e.target.value)} className="appearance-none w-full bg-transparent font-bold text-xs outline-none px-2">{INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                                                            <input value={cond.period} onChange={e => updateCondition(rule.id, cond.id, 'period', e.target.value)} className="w-10 text-center text-xs font-bold bg-slate-50 rounded" placeholder="Pd" />
                                                        </div>
                                                        <div className="bg-white p-1.5 rounded-xl border h-12 flex items-center px-2 relative shadow-sm"><select value={cond.operator} onChange={e => updateCondition(rule.id, cond.id, 'operator', e.target.value)} className="appearance-none w-full font-bold text-xs text-center">{CONDITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><ChevronDown size={14} className="absolute right-2 text-slate-400" /></div>
                                                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border h-12 shadow-sm">
                                                            <select value={cond.rightType} onChange={e => updateCondition(rule.id, cond.id, 'rightType', e.target.value)} className="appearance-none font-bold text-[10px] w-14 outline-none border-r mr-2 pr-2 uppercase"><option value="VALUE">VAL</option><option value="INDICATOR">IND</option></select>
                                                            {cond.rightType === 'VALUE' ? <input value={cond.rightValue} onChange={e => updateCondition(rule.id, cond.id, 'rightValue', e.target.value)} className="w-full text-xs font-bold outline-none" placeholder="Value" /> : 
                                                                <div className="flex gap-1 items-center"><select value={cond.rightIndicator} onChange={e => updateCondition(rule.id, cond.id, 'rightIndicator', e.target.value)} className="appearance-none font-bold text-xs w-full">{INDICATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select><input value={cond.rightPeriod} onChange={e => updateCondition(rule.id, cond.id, 'rightPeriod', e.target.value)} className="w-10 h-7 bg-slate-50 text-center text-[10px] font-bold" placeholder="Pd" /></div>
                                                            }
                                                        </div>
                                                        <div className="flex justify-end gap-3 items-center">
                                                            <select value={rule.action} onChange={(e) => updateRuleAction(rule.id, e.target.value)} className="font-black text-sm outline-none px-2 bg-transparent" style={{ color: rule.action === 'BUY' ? '#10B981' : '#EF4444' }}><option value="BUY">BUY</option><option value="SELL">SELL</option></select>
                                                            <button type="button" onClick={() => removeRuleGroup(rule.id)} className="text-slate-200 hover:text-rose-500"><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex gap-4 pt-1"><div className="flex bg-white rounded-full p-1 border shadow-sm"><button type="button" onClick={() => setRuleLogic(rule.id, 'AND')} className={`px-6 py-1 rounded-full text-[10px] font-black transition-all ${rule.logic === 'AND' ? 'bg-[#8B5CF6] text-white' : 'text-slate-400'}`}>AND</button><button type="button" onClick={() => setRuleLogic(rule.id, 'OR')} className={`px-6 py-1 rounded-full text-[10px] font-black transition-all ${rule.logic === 'OR' ? 'bg-[#8B5CF6] text-white' : 'text-slate-400'}`}>OR</button></div><button type="button" onClick={() => addSubRule(rule.id)} className="text-[10px] font-black text-[#8B5CF6] hover:underline uppercase tracking-widest">+ ADD CONDITION</button></div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addRuleGroup} className="w-full py-5 border-2 border-dashed rounded-[2rem] text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"><Plus size={18} /> Add Logic Group</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10">
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk per trade (%)</label><input type="number" step="0.1" value={risk.risk_pct} onChange={e => setRisk({...risk, risk_pct: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Reward Ratio</label><input type="number" step="0.1" value={risk.rr} onChange={e => setRisk({...risk, rr: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ATR Period</label><input type="number" value={risk.atr_period} onChange={e => setRisk({...risk, atr_period: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ATR Multiplier</label><input type="number" step="0.1" value={risk.atr_mult} onChange={e => setRisk({...risk, atr_mult: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm" /></div>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 pb-12 border-t flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                            <button type="button" onClick={() => router.back()} className="px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Cancel</button>
                            <button type="submit" disabled={isSubmitting || isBacktesting} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#8200DB] to-[#5837F6] text-white text-xs font-black rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest">
                                {isSubmitting || isBacktesting ? <Loader2 className="animate-spin" size={16} /> : (activeTab === "Backtest" ? "Run Backtest" : "Deploy Bot Strategy")}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Backtest Result Pop-up */}
            {backtestData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
                    <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4"><LineChartIcon className="text-purple-600" size={24}/><h3 className="text-2xl font-black text-slate-800 tracking-tight">Backtest Report: {basicInfo.stock || "QH"}</h3></div>
                            <button onClick={() => setBacktestData(null)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <div className="overflow-y-auto p-10 space-y-10">
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                <BacktestSummaryCard label="Final Equity" value={`${backtestData.summary.final_equity.toLocaleString()} ฿`} />
                                <BacktestSummaryCard label="Total PnL" value={`${backtestData.summary.total_net_pnl.toLocaleString()} ฿`} color={backtestData.summary.total_net_pnl >= 0 ? "text-emerald-500" : "text-rose-500"} />
                                <BacktestSummaryCard label="Total Trades" value={backtestData.summary.total_trades} />
                                <BacktestSummaryCard label="Win Rate" value={`${backtestData.summary.win_rate}%`} />
                                <BacktestSummaryCard label="Max Drawdown" value={`${backtestData.summary.max_drawdown_pct}%`} color="text-rose-500" />
                            </div>
                            <div className="bg-slate-50 p-8 rounded-[2rem] border shadow-inner">
                                <h4 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-700 tracking-tight"><ArrowUpRight size={18}/> Equity Curve</h4>
                                <div className="h-[350px] w-full overflow-hidden">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={backtestData.equity_curve}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="time" hide />
                                            <YAxis domain={['auto', 'auto']} stroke="#94A3B8" fontSize={12} tickFormatter={(val) => `${(val/1000).toFixed(1)}k`} />
                                            <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} ฿`, "Equity"]} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            <Line type="monotone" dataKey="equity" stroke="#8B5CF6" strokeWidth={4} dot={false} animationDuration={2000} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-white border-t flex justify-end gap-4"><button onClick={() => setBacktestData(null)} className="px-10 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[11px]">Close</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BacktestSummaryCard({ label, value, color = "text-slate-800" }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border text-center shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className={`text-xl font-black ${color}`}>{value}</p></div>
  );
}
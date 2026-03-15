"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import { CreditCard, User, Mail, Landmark, ShieldCheck, Loader2, Menu, Bot, Settings, Save, ChevronDown } from "lucide-react";
import DashboardHeader from "@/components/Header";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentModal from "@/components/PaymentModal";
import axios from "axios";

// ✅ เชื่อมต่อกับ API บน Vercel
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://trading-bot-api-sigma.vercel.app";

// ✅ เปลี่ยนจาก export default ProfilePage เป็น Component ธรรมดา
function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // ✅ State สำหรับ Tab และ ประวัติการชำระเงิน
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  
  // ✅ State สำหรับ Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);

  // ✅ 1. State สำหรับเก็บรายการแผนที่ดึงมาจาก API /subscriptions
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    username: "",
    bankName: "",
    accountNumber: "", 
    subscriptionId: null as number | null,
    subscriptionEndDate: null as string | null,
  });

  // ✅ 2. ฟังก์ชันดึงรายละเอียดแผนจากข้อมูลที่ดึงมาจาก API จริงๆ
  const getPlanDetails = (id: number | null) => {
    const activePlan = availablePlans.find(p => String(p.id) === String(id));
    
    if (!activePlan) {
      return { 
        name: "No Plan", 
        price: "0.00", 
        description: "You don't have an active subscription.",
        botNumber: 0,
        color: "from-slate-400 to-slate-500" 
      };
    }

    const planColors: Record<number, string> = {
      1: "from-[#8200DB] via-[#7111B6] to-[#5837F6]", // Basic
      2: "from-[#2563EB] via-[#3B82F6] to-[#06B6D4]", // Pro
      3: "from-[#D97706] via-[#F59E0B] to-[#FBBF24]", // Gold
    };

    return {
      name: activePlan.name,
      price: typeof activePlan.price === 'number' ? activePlan.price.toFixed(2) : activePlan.price,
      // รองรับชื่อฟิลด์ทั้งแบบ snake_case และ camelCase จาก Backend
      description: activePlan.description || "",
      botNumber: activePlan.bot_number || activePlan.botNumber || activePlan.max_bots || 0,
      color: planColors[activePlan.id] || "from-purple-500 to-indigo-500"
    };
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!userId || userId === "undefined" || !token) {
      router.push("/");
      return;
    }

    try {
      // ✅ ดึงข้อมูล User, Plans และ History พร้อมกัน
      const [userRes, plansRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/payments/history`, { headers: { Authorization: `Bearer ${token}` } }).catch((err) => {
          // ✅ เปลี่ยนมาพ่น Error แจ้งเตือนใน Console แทนการซ่อนไว้
          console.error("History API Error:", err.response?.data || err.message);
          return { data: [] }; 
        })
      ]);

      const user = userRes.data;
      setAvailablePlans(plansRes.data);
      
      // ✅ รองรับทั้งกรณีที่ API ส่งคืน Array ตรงๆ หรือมี Object { data: [...] } ครอบมาอีกชั้น
      const rawHistory = Array.isArray(historyRes.data) 
        ? historyRes.data 
        : (Array.isArray(historyRes.data?.data) ? historyRes.data.data : []);

      // ✅ จัดเรียงประวัติการชำระเงินจากรายการใหม่ล่าสุดไปเก่า
      const sortedHistory = rawHistory.sort((a: any, b: any) => 
        new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()
      );
        
      setBillingHistory(sortedHistory);

      // ✅ แยก BankName และ AccountNumber ออกจากกันด้วยช่องว่าง
      const fetchedAccNum = user.accountNumber || user.account_number || "";
      let initialBankName = "";
      let initialAccNum = fetchedAccNum;
      
      const spaceIdx = fetchedAccNum.indexOf(" ");
      if (spaceIdx !== -1) {
        initialBankName = fetchedAccNum.substring(0, spaceIdx);
        initialAccNum = fetchedAccNum.substring(spaceIdx + 1);
      }

      setFormData({
        id: user.id.toString(),
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        bankName: initialBankName,
        accountNumber: initialAccNum, 
        // ✅ ดักการอ่านค่าครอบคลุมทั้ง snake_case, camelCase และแบบ Object
        subscriptionId: user.subscriptionId || user.subscription_id || user.subscription?.id || null,
        subscriptionEndDate: user.subscriptionEndDate || user.subscription_end_date || null,
      });
      
      setConfirmedName(user.name || "");

    } catch (err: any) {
      console.error("Fetch Profile Error:", err);
      if (err.response?.status === 401) router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ ตรวจจับการเปลี่ยนแปลงของ URL Parameter (เช่น ?tab=billing) แบบ Real-time
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "billing") {
      setActiveTab("billing");
    } else {
      setActiveTab("profile");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // ✅ เพิ่มการตรวจสอบข้อมูล (Validation) ก่อนส่ง API
    if (!formData.name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.bankName) {
      alert("Please select your bank.");
      return;
    }

    if (!formData.accountNumber.trim()) {
      alert("Please enter your bank account number.");
      return;
    }

    if (!formData.id) return;
    setIsUpdating(true);

    // ✅ รวมชื่อธนาคารและหมายเลขบัญชีเข้าด้วยกัน (คั่นด้วยช่องว่าง) ก่อนส่ง API
    const combinedAccountNumber = `${formData.bankName} ${formData.accountNumber}`;

    try {
      const response = await axios.patch(
        `${API_URL}/users/${formData.id}`,
        {
          name: formData.name,
          accountNumber: combinedAccountNumber, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmedName(response.data.name);
      alert("Changes saved successfully!");
      
      // ✅ แยกค่าจาก Response ของ API เพื่ออัปเดต State อีกครั้ง
      const updatedAccNum = response.data.accountNumber || response.data.account_number || combinedAccountNumber;
      let resBankName = formData.bankName;
      let resAccNum = formData.accountNumber;
      const resSpaceIdx = updatedAccNum.indexOf(" ");
      if (resSpaceIdx !== -1) {
        resBankName = updatedAccNum.substring(0, resSpaceIdx);
        resAccNum = updatedAccNum.substring(resSpaceIdx + 1);
      }

      setFormData(prev => ({ 
        ...prev, 
        name: response.data.name, 
        bankName: resBankName,
        accountNumber: resAccNum 
      }));
    } catch (err: any) {
      console.error("Update Error:", err);
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#8200DB]" size={40} />
      </div>
    );
  }

  const currentPlan = getPlanDetails(formData.subscriptionId);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative">
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
              Profile
            </span>
          </div>
          <ProfileDropdown />
        </div>

        {/* ซ่อน Header ของ Desktop บนมือถือ */}
        <div className="hidden md:block">
          <DashboardHeader title="Profile Settings" />
        </div>

        <div className="p-6 md:p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column - Profile Summary & Plan Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* ✅ Profile Overview Card */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-100 to-indigo-50"></div>
                <div className="relative mb-4 mt-2">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center z-10 relative">
                    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                      <User size={40} className="text-[#8200DB]/70" />
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full z-20"></div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{confirmedName || "User"}</h3>
                <p className="text-[#8200DB] text-sm font-bold tracking-wide mt-1">@{formData.username}</p>
                <div className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 w-full justify-center">
                   <Mail size={14} className="text-slate-400" />
                   <span className="text-xs font-bold text-slate-600 truncate">{formData.email}</span>
                </div>
              </div>

              {/* ✅ Subscription Plan Card */}
              <div className={`bg-gradient-to-br ${currentPlan.color} rounded-[2rem] p-8 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden flex flex-col h-full`}>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
                
                <div className="relative z-10 flex flex-col flex-1">
                  {/* Header: Name & Status Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">{currentPlan.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${formData.subscriptionId ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-50' : 'bg-white/20 border-white/20 text-white'}`}>
                      {formData.subscriptionId ? 'Active' : 'No Plan'}
                    </span>
                  </div>
              
                  {/* Price */}
                  <div className="mb-8 flex items-baseline gap-1.5">
                    <span className="text-2xl md:text-3xl font-bold text-white/80">฿</span>
                    <span className="text-4xl md:text-5xl font-black tracking-tighter">{currentPlan.price}</span>
                    <span className="text-xs font-bold text-white/80 uppercase tracking-widest ml-1">/ Month</span>
                  </div>

                  {/* Details / Features List */}
                  <div className="flex-1 mb-8 space-y-4 text-sm">
                    {currentPlan.name !== "No Plan" ? (
                      <>
                        <p className="leading-relaxed text-white/95 font-medium">{currentPlan.description}</p>
                        <div className="pt-5 mt-4 border-t border-white/20 flex flex-col gap-3 font-medium">
                          <div className="flex justify-between items-center">
                            <span className="text-white/80">Bot Limit</span>
                            <span className="font-bold bg-white/20 px-2.5 py-1 rounded-md text-xs">{currentPlan.botNumber} Bots</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/80">Expires On</span>
                            <span className="font-bold">
                              {formData.subscriptionEndDate 
                                ? new Date(formData.subscriptionEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'Lifetime'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-white/90 leading-relaxed font-medium text-center py-4">
                        Upgrade your plan to unlock AI trading bots and advanced features.
                      </p>
                    )}
                  </div>
                    
                  {/* Action Button */}
                  <div className="mt-auto">
                    <button 
                      onClick={() => router.push('/pricing')}
                      className="w-full py-4 bg-white text-[#8200DB] rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-slate-50 hover:shadow-lg transition-all shadow-md active:scale-95 flex items-center justify-center"
                    >
                      {formData.subscriptionId ? 'Upgrade Plan' : 'View Plans'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tabs and Content */}
            <div className="lg:col-span-8 flex flex-col">
              
              <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 text-black flex-1 flex flex-col">
                {/* ส่วนหัวสำหรับสลับ Tab */}
                <div className="px-6 md:px-10 pt-6 md:pt-8 flex items-center space-x-6 overflow-x-auto hide-scrollbar border-b border-slate-100">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-4 font-bold transition-all text-sm md:text-base border-b-2 whitespace-nowrap -mb-[1px] ${
                      activeTab === "profile" ? "text-[#8200DB] border-[#8200DB]" : "text-slate-400 border-transparent hover:text-slate-600"
                    }`}
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className={`pb-4 font-bold transition-all text-sm md:text-base border-b-2 whitespace-nowrap -mb-[1px] ${
                      activeTab === "billing" ? "text-[#8200DB] border-[#8200DB]" : "text-slate-400 border-transparent hover:text-slate-600"
                    }`}
                  >
                    Billing History
                  </button>
                </div>

                {/* เนื้อหาหลักตาม Tab ที่เลือก */}
                <div key={activeTab} className="p-6 md:p-10 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "profile" ? (
                  <>
                    <div className="mb-8 pb-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1.5">Account Settings</h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">Manage your personal information and billing preferences.</p>
                      </div>
                      <div className="hidden md:flex p-3 bg-purple-50 rounded-2xl text-[#8200DB]">
                        <Settings size={24} />
                      </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2.5 group">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-[#8200DB] transition-colors">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8200DB] transition-colors">
                              <User size={16} />
                            </div>
                            <input 
                              name="name" type="text" value={formData.name} onChange={handleChange} 
                              className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none hover:border-purple-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white text-slate-900 text-sm font-semibold transition-all shadow-sm" 
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail size={16} />
                            </div>
                            <input 
                              type="email" value={formData.email} disabled 
                              className="w-full pl-11 pr-5 py-3 bg-slate-100 border border-slate-100 rounded-xl text-slate-500 text-sm cursor-not-allowed font-semibold opacity-70 shadow-sm" 
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold ml-1.5">* Email cannot be changed.</p>
                        </div>

                        {/* Bank Name Dropdown */}
                        <div className="space-y-2.5 group">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-[#8200DB] transition-colors">
                            Bank Name
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8200DB] transition-colors">
                              <Landmark size={16} />
                            </div>
                            <select 
                              name="bankName" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                              className="w-full appearance-none pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none hover:border-purple-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white text-slate-900 text-sm font-semibold transition-all cursor-pointer shadow-sm"
                            >
                              <option value="" disabled>Select Bank</option>
                              <option value="KBANK">Kasikornbank (KBANK)</option>
                              <option value="SCB">Siam Commercial Bank (SCB)</option>
                              <option value="BBL">Bangkok Bank (BBL)</option>
                              <option value="KTB">Krungthai Bank (KTB)</option>
                              <option value="BAY">Bank of Ayudhya (Krungsri)</option>
                              <option value="TTB">TMBThanachart (TTB)</option>
                              <option value="GSB">Government Savings Bank (GSB)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>

                        {/* Bank Account Number */}
                        <div className="space-y-2.5 group">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-[#8200DB] transition-colors">
                            Account Number
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8200DB] transition-colors">
                              <CreditCard size={16} />
                            </div>
                            <input 
                              name="accountNumber" type="text" value={formData.accountNumber} onChange={handleChange} 
                              className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none hover:border-purple-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white text-slate-900 text-sm font-semibold transition-all shadow-sm" 
                              placeholder="e.g. 123-4-56789-0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 mt-auto border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                        <button 
                          type="button" onClick={() => router.back()} 
                          className="w-full sm:w-auto px-6 py-3 text-slate-500 font-bold text-xs hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" disabled={isUpdating} 
                          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#8200DB] to-[#5837F6] hover:from-[#7111B6] hover:to-[#4C28D9] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:shadow-purple-200 flex items-center justify-center gap-2.5 transition-all active:scale-95 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="mb-8 pb-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1.5">Billing History</h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">View your past transactions and pending payments.</p>
                      </div>
                    </div>
                    <div className="space-y-4 flex-1">
                      {billingHistory.length > 0 ? (
                        billingHistory.map((item: any, index: number) => (
                          <div key={item.id || index} className={`flex items-center justify-between p-5 border rounded-2xl ${item.status === 'PENDING' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div>
                              <p className="font-bold text-slate-800">{item.subscription?.name || availablePlans.find(p => p.id === item.subscriptionId)?.name || `Plan #${item.subscriptionId}`}</p>
                              <p className="text-xs text-slate-500 mt-1">TxID: #{item.id} • {new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${item.status === 'PENDING' ? 'text-orange-600 bg-orange-200/50' : 'text-emerald-600 bg-emerald-200/50'}`}>
                                {item.status}
                              </span>
                              {item.status === 'PENDING' && (
                                <button 
                                  onClick={() => {
                                    setSelectedPlanId(item.subscriptionId || 0);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="text-xs bg-[#8200DB] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 transition-colors"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                         <div className="text-center py-12">
                            <p className="text-slate-400 font-bold mb-4">No billing history found.</p>
                         </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal สำหรับจ่ายรายการที่ค้าง (Pending) */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchData(); // ดึงข้อมูลใหม่เพื่ออัปเดตสเตตัสรายการที่ชำระสำเร็จ
          }}
          planId={selectedPlanId}
        />
      )}
    </div>
  );
}

// ✅ สร้าง Page Component หลักที่ครอบด้วย Suspense
export default function ProfilePage() {
  return (
    <Suspense 
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-[#8200DB]" size={40} />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, QrCode, ShieldCheck, AlertCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ตั้งค่า URL ของ API หลังบ้าน
const API_URL = "https://trading-bot-api-sigma.vercel.app";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planId: number; 
}

export default function PaymentModal({ isOpen, onClose, onSuccess, planId }: PaymentModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State สำหรับเก็บข้อมูลการชำระเงินที่ได้จาก API
  const [paymentData, setPaymentData] = useState<{ 
    transactionId: number; 
    qrImage: string; 
    amount: string;
    status: string;
  } | null>(null);
  
  // ใช้ useRef เพื่อเก็บค่า Timer สำหรับการตรวจสอบสถานะอัตโนมัติ (Polling)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // --- ส่วนที่ 1: จัดการ Lifecycle ของ Modal ---
  useEffect(() => {
    // ถ้า Modal เปิดและมี planId ให้เริ่มขั้นตอนการจ่ายเงิน
    if (isOpen && planId && planId !== 0) {
      handleInitialPayment();
    } else {
      // ถ้า Modal ปิด ให้หยุดการเช็คสถานะและล้างข้อมูล
      stopPolling();
      setPaymentData(null);
    }
    // Cleanup function เมื่อ Component ถูกถอดออก
    return () => stopPolling();
  }, [isOpen, planId]);

  // --- ส่วนที่ 2: ตรวจสอบการเปลี่ยนสถานะการชำระเงิน ---
  useEffect(() => {
    // ถ้าสถานะเป็น PENDING ให้เริ่มการตรวจสอบสถานะทุกๆ 5 วินาที
    if (paymentData && paymentData.status === "PENDING") {
      startPolling(paymentData.transactionId);
    } 
    // ถ้าสถานะเป็น SUCCESS ให้หยุดเช็คและเรียกฟังก์ชันทำงานสำเร็จ
    else if (paymentData && paymentData.status === "SUCCESS") {
      stopPolling();
      onSuccess();
    }
  }, [paymentData]);

  // ฟังก์ชันหยุดการตรวจสอบสถานะ
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // --- ส่วนที่ 3: ระบบ Polling (เช็คสถานะอัตโนมัติ) ---
  const startPolling = (txId: number) => {
    stopPolling();
    // ตั้งเวลาตรวจสอบทุก 5 วินาที (5000ms)
    pollingInterval.current = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/payments/status/${txId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // หาก API ตอบกลับว่าจ่ายเงินสำเร็จ ให้เปลี่ยน State
        if (response.data.status === "SUCCESS") {
          setPaymentData(prev => prev ? { ...prev, status: "SUCCESS" } : null);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); 
  };

  // --- ส่วนที่ 4: การขอ QR Code ครั้งแรก ---
  const handleInitialPayment = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("token");

    // ตรวจสอบความปลอดภัยเบื้องต้น
    if (!token) {
      alert("Please login before making a payment.");
      router.push("/");
      return;
    }

    try {
      // ส่งข้อมูลไปยัง API เพื่อสร้างหรือดึงข้อมูล QR Code (ถ้ามีรายการค้างอยู่จะดึงอันเดิมมาให้)
      const response = await axios.post(
        `${API_URL}/payments/qr`, 
        { subscriptionId: Number(planId) }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaymentData(response.data);
    } catch (error: any) {
      console.error("Axios Error Detail:", error.response?.data);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        router.push("/");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // --- ส่วนที่ 5: การแสดงผล UI ---
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 text-black font-sans">
      {/* พื้นหลังโปร่งแสงมืดๆ */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* ตัวกล่อง Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in duration-300">
        {/* ปุ่มปิด Modal */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={24} />
        </button>

        {/* ส่วนหัว Modal */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
          <div className="p-2 bg-purple-50 rounded-xl text-[#6A0DAD]">
            <QrCode size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight">PromptPay QR Payment</h3>
        </div>

        {/* สถานะขณะกำลังดึงข้อมูล */}
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#8B5CF6]" size={48} />
            <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-[10px]">
              Checking payment status...
            </p>
          </div>
        ) : paymentData ? (
          /* แสดงผลเมื่อมีข้อมูลการชำระเงิน */
          <div className="flex flex-col items-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* แสดงยอดเงินและหมายเลขรายการ */}
            <div className="text-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Amount to Pay
              </p>
              <p className="text-5xl font-black text-[#6A0DAD]">฿{Number(paymentData.amount).toLocaleString()}</p>
              <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-widest">
                TxID: #{paymentData.transactionId} | Status: <span className="text-amber-500">{paymentData.status}</span>
              </p>
            </div>

            {/* ส่วนแสดงรูปภาพ QR Code */}
            <div className="relative p-6 bg-white border-4 border-slate-50 rounded-[2.5rem] shadow-xl">
              <img src={paymentData.qrImage} alt="Payment QR" className="w-64 h-64 object-contain" />
              
              {/* Overlay แสดงสถานะเมื่อจ่ายเงินสำเร็จ (Success) */}
              {paymentData.status === "SUCCESS" && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-[2.5rem]">
                  <Loader2 className="animate-spin text-emerald-500" size={48} />
                </div>
              )}
            </div>

            <div className="w-full text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <ShieldCheck size={16} /> Secured by Omise Gateway
              </div>
              <p className="text-xs text-slate-400 font-bold animate-pulse">
                Waiting for payment confirmation...
              </p>
              {/* ปุ่มปิดเพื่อไปทำอย่างอื่นก่อน */}
              <button 
                onClick={onClose}
                className="w-full py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-sm tracking-widest active:scale-95"
              >
                Pay Later
              </button>
            </div>
          </div>
        ) : (
          /* แสดงผลเมื่อเกิดข้อผิดพลาด */
          <div className="flex flex-col items-center justify-center py-20 text-rose-500">
            <AlertCircle size={48} className="mb-4" />
            <p className="font-bold">Failed to connect to payment system</p>
            <button 
              onClick={handleInitialPayment} 
              className="mt-4 text-[#6A0DAD] font-black uppercase text-xs underline decoration-2 underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
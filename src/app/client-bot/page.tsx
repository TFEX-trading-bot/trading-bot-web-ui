// "use client";

// import { useState, useEffect } from "react"; 
// // 1. นำเข้า ProfileDropdown แทน TopUserButton
// import ProfileDropdown from "@/components/ProfileDropdown"; 
// import BotCard from "@/components/BotCard";
// import { useSearchParams } from "next/navigation";

// export default function ClientBotsPage() {
//   const qp = useSearchParams();
//   const name = qp.get("name") ?? "Customer";
//   const clientId = qp.get("clientId");

//   const [bots, setBots] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchClientBots = async () => {
//       if (!clientId) return;
//       try {
//         // ดึงข้อมูลบอทเฉพาะของลูกค้าคนนี้สำหรับ Admin
//         const response = await fetch(`http://localhost:3001/api/admin/bots?clientId=${clientId}`);
//         const data = await response.json();
//         setBots(data);
//       } catch (error) {
//         console.error("Error fetching client bots:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchClientBots();
//   }, [clientId]);

//   const botCount = bots.length;

//   return (
//     <section className="min-h-screen w-full bg-white">
//       <div className="flex">
//         <div className="flex-1">
//           {/* Top bar */}
//           <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
//             <div className="flex items-center px-8 py-4">
//               <div className="min-w-0">
//                 <h1 className="text-[30px] font-extrabold text-black truncate">
//                   {name}
//                   <span className="ml-2 font-semibold text-black/60">
//                     ({botCount} Bot)
//                   </span>
//                 </h1>
//                 <div className="mt-0.5 text-md font-semibold text-black/60">
//                   ID : {clientId ?? "—"}
//                 </div>
//               </div>
//               <div className="ml-auto">
//                 {/* 2. เปลี่ยนมาใช้ ProfileDropdown ซึ่งจะแสดงเฉพาะปุ่ม Logout สำหรับ Admin */}
//                 <ProfileDropdown />
//               </div>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="px-8 py-8">
//             {isLoading ? (
//               <div className="text-center py-10 text-gray-400 animate-pulse">
//                 Loading Bots...
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
//                 {bots.map((b: any, i: number) => (
//                   <BotCard
//                     key={`${b.id_bot}-${i}`}
//                     ticker={b.ticker}
//                     id={b.id_bot}
//                     strategy={b.strategy}
//                     onClick={() => {
//                        console.log("Selected bot ID:", b.id_bot);
//                     }}
//                   />
//                 ))}
//               </div>
//             )}

//             {!isLoading && bots.length === 0 && (
//               <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-xl">
//                  <p className="text-gray-400">This client doesn't have any bots.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
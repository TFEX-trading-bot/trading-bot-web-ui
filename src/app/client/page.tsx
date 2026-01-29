"use client";

import { useState, useEffect } from "react";
// 1. นำเข้า ProfileDropdown แทน TopUserButton
import ProfileDropdown from "@/components/ProfileDropdown"; 
import ClientCard from "@/components/ClientCard";
import { useRouter } from "next/navigation";

export default function ClientPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ดึงข้อมูลรายชื่อลูกค้าทั้งหมดสำหรับ Admin
        const response = await fetch("http://localhost:3001/api/admin/client");
        const result = await response.json();
        setUsers(result);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <section className="min-h-screen w-full bg-white">
      <div className="flex">
        <div className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
            <div className="flex items-center px-8 py-4">
              <h1 className="text-[30px] font-extrabold 
                             bg-gradient-to-r from-[#7111B6] via-[#901CFA] to-[#5837F6]
                             bg-clip-text text-transparent">
                Client
              </h1>
              <div className="ml-auto">
                {/* 2. เปลี่ยนมาใช้ ProfileDropdown ซึ่งจะแสดงเฉพาะปุ่ม Logout สำหรับ Admin */}
                <ProfileDropdown />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {isLoading ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">
                Loading Clients...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {users.map((c: any, i: number) => (
                  <ClientCard
                    key={`${c.id_user}-${i}`}
                    id={c.id_user}
                    name={c.name}
                    onClick={() =>
                      router.push(
                        `/client-bot?clientId=${c.id_user}&name=${encodeURIComponent(c.name)}`
                      )
                    }
                  />
                ))}
              </div>
            )}
            
            {!isLoading && users.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No clients found in system.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
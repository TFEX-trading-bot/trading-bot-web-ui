import React from 'react'
import { Plus } from 'lucide-react'

export default function AddBotCard() {
  return (
    <button className="group flex h-[180px] w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#D8B4FE] bg-[#F3E8FF] transition-all hover:bg-[#E9D5FF] hover:border-[#C084FC]">
      
      {/* Plus Icon Box */}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9D5FF] text-[#9333EA] shadow-sm transition-transform group-hover:scale-110">
        <Plus className="h-6 w-6 stroke-[3]" />
      </div>

      <span className="mt-3 text-sm font-bold text-[#9333EA]">
        Add New Bot
      </span>
    </button>
  )
}
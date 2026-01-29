import React from 'react';
import { BarChart2, User } from 'lucide-react';

interface PolicyCardProps {
  name: string;
  profit: string;
  users: number;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ name, profit, users }) => {
  return (
    <div className="flex h-[210px] flex-col justify-between rounded-2xl bg-[#E9D5FF] p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
      
      {/* Top Section */}
      <div className="flex items-start gap-4">
        {/* Icon Box */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED] text-white shadow-sm">
          <BarChart2 className="h-8 w-8" />
        </div>
        
        {/* Text Details */}
        <div className="pt-1">
          <h3 className="text-xl font-bold text-slate-900 leading-tight">{name}</h3>
          <div className="flex items-center gap-1 text-base font-bold text-slate-800 mt-1">
            <span className="text-xs">↗</span>
            <span>{profit}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Users count */}
      <div className="flex items-center gap-2 text-slate-700">
        <User className="h-5 w-5 fill-slate-700" />
        <span className="text-base font-semibold">{users}</span>
      </div>
      
    </div>
  );
};

export default PolicyCard;
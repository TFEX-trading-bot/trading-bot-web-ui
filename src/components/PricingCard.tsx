import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  description?: string;
  onGetStarted?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, description, onGetStarted }) => {
  return (
    <div className="flex h-[450px] w-full max-w-[320px] flex-col justify-between rounded-[32px] bg-gradient-to-b from-[#F3E8FF] to-[#E9D5FF] p-8 shadow-sm transition-transform hover:-translate-y-2 hover:shadow-xl">
      
      {/* Top Content */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-medium text-slate-800">{title}</h3>
        <div className="text-4xl font-bold text-slate-900">
          {price}
        </div>
        
        {/* Description (แสดงเฉพาะถ้ามีข้อมูล) */}
        {description && (
          <p className="text-sm font-medium text-slate-500/80 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Button Section */}
      <div className="mt-auto">
        <button
          onClick={onGetStarted}
          className="w-full rounded-full bg-[#9333EA] py-3 text-base font-bold text-white shadow-md transition-all hover:bg-[#7E22CE] hover:shadow-lg active:scale-95"
        >
          Get Started
        </button>
      </div>
      
    </div>
  );
};

export default PricingCard;
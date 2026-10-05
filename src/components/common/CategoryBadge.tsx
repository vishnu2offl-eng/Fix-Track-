import React from 'react';
import type { CategoryType } from '../../types';
import { Droplet, Zap, Lock, Building, MoreHorizontal, ArrowUpDown } from 'lucide-react';

interface CategoryBadgeProps {
  category: CategoryType | string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  className = '' 
}) => {
  switch (category) {
    case 'Plumbing':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] ${className}`}>
          <Droplet className="w-3.5 h-3.5 fill-current/20 stroke-[2]" />
          Plumbing
        </span>
      );
    case 'Electrical':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] ${className}`}>
          <Zap className="w-3.5 h-3.5 fill-current/20 stroke-[2]" />
          Electrical
        </span>
      );
    case 'Door / Lock':
    case 'Door/Lock':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] ${className}`}>
          <Lock className="w-3.5 h-3.5 stroke-[2]" />
          Door / Lock
        </span>
      );
    case 'Lift':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] ${className}`}>
          <ArrowUpDown className="w-3.5 h-3.5 stroke-[2]" />
          Lift
        </span>
      );
    case 'Common Area':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] ${className}`}>
          <Building className="w-3.5 h-3.5 stroke-[2]" />
          Common Area
        </span>
      );
    case 'Other':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] ${className}`}>
          <MoreHorizontal className="w-3.5 h-3.5 stroke-[2]" />
          {category || 'Other'}
        </span>
      );
  }
};

import React from 'react';
import type { ReportStatus } from '../../types';
import { Check, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '', 
  showIcon = true 
}) => {
  switch (status) {
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] ${className}`}>
          {showIcon && <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />}
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#4F46E5] border border-[#C7D2FE] ${className}`}>
          {showIcon && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          Resolved
        </span>
      );
    case 'Confirmed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] ${className}`}>
          {showIcon && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          Confirmed
        </span>
      );
    case 'Acknowledged':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] ${className}`}>
          {showIcon && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          Acknowledged
        </span>
      );
    case 'Reported':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 stroke-[2]" />}
          {status || 'Reported'}
        </span>
      );
  }
};

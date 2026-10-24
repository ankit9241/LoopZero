import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  heading: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  heading,
  description,
  action,
  secondaryAction,
  className = ''
}) => {
  return (
    <div
      className={`border border-dashed border-[#DCDAD0] rounded-xl p-8 sm:p-12 text-center bg-[#FAF9F5]/60 flex flex-col items-center justify-center ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 rounded-full bg-[#EFECE3] border border-[#E5E4DC] flex items-center justify-center text-[#536B4F] mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-editorial text-2xl text-[#20211D] font-normal tracking-tight max-w-md">
        {heading}
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-[#777970] max-w-sm leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};

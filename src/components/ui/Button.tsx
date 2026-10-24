import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536B4F] focus-visible:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-md',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-md'
  };

  const variantStyles = {
    primary:
      'bg-[#536B4F] text-[#F7F6F2] hover:bg-[#465B43] active:bg-[#3D503B] shadow-xs border border-[#485E44]',
    secondary:
      'bg-[#FFFFFF] text-[#20211D] hover:bg-[#F2F1ED] active:bg-[#ECEBE4] border border-[#E5E4DC] shadow-2xs',
    outline:
      'bg-transparent text-[#20211D] hover:bg-[#EAF0E6] active:bg-[#DDE7D8] border border-[#C8D8C2]',
    ghost:
      'bg-transparent text-[#777970] hover:text-[#20211D] hover:bg-[#ECEBE4] active:bg-[#E5E4DC]',
    danger:
      'bg-[#FFFFFF] text-[#A33A2B] hover:bg-[#FCECE9] active:bg-[#F8D9D4] border border-[#F4C5BE]'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

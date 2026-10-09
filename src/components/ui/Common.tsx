import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'ox' | 'sos';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none shadow-md cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1',
    secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-400 hover:to-red-500 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border-none shadow-none',
    outline: 'bg-slate-800/40 border-2 border-slate-600 hover:border-slate-400 text-slate-200 hover:bg-slate-700/50 shadow-none',
    ox: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 shadow-indigo-500/25',
    sos: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-b-4 border-purple-900 active:border-b-0 active:translate-y-1 shadow-pink-500/25',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
    md: 'px-5 py-2.5 text-sm sm:text-base gap-2',
    lg: 'px-6 py-3.5 text-base sm:text-lg gap-2.5 rounded-2xl',
    xl: 'px-8 py-4 text-lg sm:text-xl gap-3 rounded-3xl font-extrabold',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// Modal Component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          'w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative animate-pop-in text-slate-100 max-h-[90vh] overflow-y-auto',
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="text-xl font-bold font-fredoka text-slate-100">{title}</div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Avatar Badge
export const AvatarBadge: React.FC<{
  avatar: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ringColor?: string;
}> = ({ avatar, size = 'md', className, ringColor = 'ring-indigo-500' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-base ring-2',
    md: 'w-12 h-12 text-2xl ring-2',
    lg: 'w-16 h-16 text-3xl ring-4',
    xl: 'w-20 h-20 text-4xl ring-4',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-slate-800/80 flex items-center justify-center shadow-lg transition-transform',
        sizes[size],
        ringColor,
        className
      )}
    >
      <span>{avatar}</span>
    </div>
  );
};

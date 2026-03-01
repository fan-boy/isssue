'use client';

import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';

// ============================================
// DESIGN TOKENS
// ============================================

export const colors = {
  // Backgrounds
  bg: {
    primary: '#0a0a0a',
    secondary: '#141414',
    tertiary: '#1a1a1a',
    paper: '#faf9f6',
  },
  // Text
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.6)',
    muted: 'rgba(255,255,255,0.4)',
    dark: '#2d2d2d',
    darkMuted: '#666666',
  },
  // Borders
  border: {
    subtle: 'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.2)',
  },
  // Status
  status: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
} as const;

// ============================================
// BUTTON
// ============================================

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, loading, disabled, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[#faf9f6] text-[#2d2d2d] hover:bg-white',
      secondary: 'bg-transparent border border-white/10 text-white/70 hover:bg-white/5 hover:text-white',
      ghost: 'bg-transparent text-white/50 hover:text-white hover:bg-white/5',
      danger: 'bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

// ============================================
// INPUT
// ============================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-white/60 mb-2">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors ${error ? 'border-red-500/50' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-sm mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================
// SELECT
// ============================================

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-white/60 mb-2">{label}</label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30 transition-colors ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = 'Select';

// ============================================
// CARD
// ============================================

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`bg-[#1a1a1a] border border-white/10 rounded-sm ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// AVATAR
// ============================================

interface AvatarProps {
  src?: string | null;
  name?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, color = '#6366f1', size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initial = name?.charAt(0)?.toUpperCase() || '?';

  if (src) {
    return (
      <img 
        src={src} 
        alt={name || 'Avatar'} 
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-medium ${sizes[size]} ${className}`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}

// ============================================
// HEADER
// ============================================

interface HeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export function Header({ title, backHref, backLabel = '←', actions }: HeaderProps) {
  return (
    <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backHref && (
            <Link href={backHref} className="text-white/50 hover:text-white transition-colors">
              {backLabel}
            </Link>
          )}
          {title && <span className="text-xl font-semibold text-white">{title}</span>}
        </div>
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>
    </header>
  );
}

// ============================================
// PAGE CONTAINER
// ============================================

interface PageContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PageContainer({ children, size = 'lg', className = '' }: PageContainerProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
  };

  return (
    <div className={`${sizes[size]} mx-auto px-6 py-12 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// MESSAGE
// ============================================

interface MessageProps {
  type: 'success' | 'error' | 'info';
  children: ReactNode;
}

export function Message({ type, children }: MessageProps) {
  const styles = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-sm border ${styles[type]}`}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// MAGAZINE COVER
// ============================================

interface MagazineCoverProps {
  title: string;
  issueNumber?: number;
  date?: string;
  subtitle?: string;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MagazineCover({ 
  title, 
  issueNumber, 
  date, 
  subtitle,
  isActive,
  size = 'md',
  className = '' 
}: MagazineCoverProps) {
  const sizes = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div className={`aspect-[3/4] rounded-sm bg-[#faf9f6] shadow-md relative overflow-hidden ${sizes[size]} ${className}`}>
      {/* Paper texture */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between text-[#2d2d2d]">
          <span className="text-[10px] font-light tracking-widest uppercase">
            {issueNumber ? `Issue ${issueNumber}` : 'New'}
          </span>
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-[#2d2d2d] animate-pulse" title="In progress" />
          )}
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-serif text-[#2d2d2d] tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[9px] text-[#999] mt-1 uppercase tracking-widest">{subtitle}</span>
          )}
        </div>
        
        <div className="flex items-end justify-between text-[9px] text-[#999] uppercase tracking-wider">
          {date && <span>{date}</span>}
        </div>
      </div>
      
      {/* Spine effect */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-black/10 to-transparent" />
    </div>
  );
}

// ============================================
// MODAL
// ============================================

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-sm p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-xl font-semibold text-white mb-6">{title}</h2>}
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {subtitle && <p className="text-white/40 text-sm uppercase tracking-widest mb-1">{subtitle}</p>}
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

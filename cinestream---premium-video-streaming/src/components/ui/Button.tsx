import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Optional — size="icon" wale buttons me sirf `icon` hota hai, koi label nahi. */
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-7 py-3.5 gap-2.5 min-h-[50px] font-semibold',
    icon: 'p-2.5 min-h-[42px] min-w-[42px] rounded-full',
  };

  const variants = {
    primary: 'bg-gradient-to-br from-crimson-500 via-crimson-600 to-wine-700 hover:from-crimson-400 hover:via-crimson-500 hover:to-wine-600 text-white shadow-lg shadow-crimson-600/40 border border-crimson-300/25 hover:shadow-crimson-500/60 hover:-translate-y-0.5',
    secondary: 'glass text-white hover:border-crimson-400/40 light:text-neutral-900 hover:-translate-y-0.5',
    outline: 'border border-white/20 hover:border-crimson-400/60 text-white hover:bg-crimson-500/10 dark:border-white/20 dark:text-white light:border-crimson-200 light:text-neutral-800 light:hover:bg-crimson-50',
    ghost: 'text-neutral-300 hover:text-white hover:bg-white/10 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5 light:text-neutral-600 light:hover:text-neutral-900 light:hover:bg-neutral-100',
    glass: 'glass-ember text-white hover:border-crimson-300/50 hover:-translate-y-0.5',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};

import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-out active:scale-[0.97]";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 btn-glow",
    secondary: "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:-translate-y-0.5",
    outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:-translate-y-0.5",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25",
  };

  const sizes = {
    default: "h-11 px-5 py-2",
    sm: "h-9 rounded-lg px-3 text-sm",
    lg: "h-13 rounded-xl px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };

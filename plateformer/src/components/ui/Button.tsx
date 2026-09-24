import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'menuGreen' | 'menuBlue';
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'px-4 py-2 uppercase font-bold tracking-wider border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all';
  const variants = {
    primary: 'bg-red-600 border-white text-white hover:bg-red-500',
    secondary: 'bg-amber-400 border-black text-black hover:bg-amber-300',
    danger: 'bg-zinc-800 border-red-500 text-red-500 hover:bg-zinc-700',
    menuGreen: 'menu-button menu-button-green',
    menuBlue: 'menu-button menu-button-blue',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
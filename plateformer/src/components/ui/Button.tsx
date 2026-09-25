import React from 'react';
import './Button.css';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'menuGreen' | 'menuBlue';
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: '',
    secondary: '',
    danger: '',
    menuGreen: 'menu-button menu-button-green',
    menuBlue: 'menu-button menu-button-blue',
  };
  return <button className={`game-button ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
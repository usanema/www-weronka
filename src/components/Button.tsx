import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  href, 
  variant = 'primary', 
  className = '',
  onClick 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border rounded-full font-medium transition-all duration-300 transform hover:-translate-y-1";
  
  const variants = {
    primary: "border-transparent text-white bg-primary hover:bg-opacity-90 shadow-lg hover:shadow-primary/30",
    secondary: "border-transparent text-primary bg-secondary hover:bg-opacity-80",
    outline: "border-primary text-primary hover:bg-primary/5",
    white: "border-transparent text-primary bg-white hover:bg-gray-50 shadow-lg",
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

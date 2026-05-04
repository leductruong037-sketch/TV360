import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-16',
  };

  const height = sizes[size];

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://img-zlr2.tv360.vn/tv360-static/static/web/images/logo_new.svg" 
        alt="TV360" 
        className={`${height} w-auto object-contain`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;

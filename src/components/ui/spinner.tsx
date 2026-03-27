'use client';

import React from 'react';

/**
 * A premium circular spinner component as requested.
 * Replaces logo/branding-based loaders with a clean, indeterminate circular progress indicator.
 */
export function Spinner({ 
  size = "sm", 
  color = "text-[#ff4d6d]",
  className = "" 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl', 
  color?: string,
  className?: string
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4"
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Track */}
      <div 
        className={`${sizeClasses[size]} rounded-full border-slate-900/5`}
        aria-hidden="true"
      />
      {/* Animated Spinner Part */}
      <div 
        className={`absolute ${sizeClasses[size]} rounded-full border-t-slate-900 animate-spin`}
        style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
      />
    </div>
  );
}

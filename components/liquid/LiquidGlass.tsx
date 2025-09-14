"use client";

import React from 'react';

export interface LiquidGlassProps {
  className?: string;
  children?: React.ReactNode;
  radius?: number; // px
  blur?: number;   // px
  borderAlpha?: number; // 0-1
  tint?: string;   // base tint color
  animated?: boolean; // enable shine animation
  style?: React.CSSProperties;
}

/**
 * LiquidGlass – lightweight glassmorphism wrapper
 * Inspired by rdev/liquid-glass-react, implemented with CSS variables
 */
export default function LiquidGlass({
  className = '',
  children,
  radius = 16,
  blur = 18,
  borderAlpha = 0.5,
  tint = '#ffffff',
  animated = true,
  style,
}: LiquidGlassProps) {
  const vars: React.CSSProperties = {
    // CSS variables consumed by .lg-wrap styles
    ['--lg-radius' as any]: `${radius}px`,
    ['--lg-blur' as any]: `${blur}px`,
    ['--lg-border-alpha' as any]: borderAlpha,
    ['--lg-tint' as any]: tint,
    ['--lg-shine-speed' as any]: animated ? '10s' : '0s',
    ...style,
  };
  return (
    <div className={`lg-wrap ${className}`} style={vars}>
      {children}
    </div>
  );
}


"use client";

import React from 'react';
import { ThemeVariant } from '@/types/theme';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  variant?: ThemeVariant;
}

export default function ChatHeader({
  title = 'AI Chat 预览',
  subtitle = '所见即所得 · 移动端效果',
  logoUrl,
  variant = 'edge',
}: ChatHeaderProps) {
  const styles = {
    edge: 'bg-white',
    cards: 'bg-white',
    bubble: 'bg-white',
  } as const;

  return (
    <div className={`${styles[variant]}`}>
      <div className="px-3 py-2">
        <div className="min-w-0 text-center">
          <div className="text-[16px] font-medium leading-tight text-gray-900 truncate">
            {title}
          </div>
          <div className="text-[11px] leading-tight mt-0.5 text-gray-500 truncate">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    cards: 'bg-gradient-to-r from-slate-50 to-white',
    bubble: 'bg-white',
  } as const;
  const content = (
    <div className="px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="w-6 h-6 mr-2 rounded" />
          ) : (
            <div className={`mr-2 w-6 h-6 rounded bg-gray-900 text-white text-[12px] flex items-center justify-center`}>AI</div>
          )}
          <div>
            <div className={`text-sm font-medium leading-none text-gray-900`}>{title}</div>
            <div className={`text-[11px] leading-none mt-0.5 text-gray-500`}>{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
  return <div className={`${styles[variant]}`}>{content}</div>;
}

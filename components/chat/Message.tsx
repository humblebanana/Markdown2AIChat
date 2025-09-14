"use client";

import React from 'react';
import { ThemeVariant } from '@/types/theme';

type Role = 'ai' | 'user' | 'system';

interface MessageProps {
  role: Role;
  children: React.ReactNode;
  variant?: ThemeVariant;
  fullBleed?: boolean; // 对AI消息启用全宽无边界样式
}

export default function Message({ role, children, variant = 'edge', fullBleed = false }: MessageProps) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  const bubbleBase = 'max-w-[74%] px-3 py-2 text-[14px] rounded-2xl';
  const aiTypeTune: Record<ThemeVariant, string> = {
    edge: 'text-[15px] leading-[1.68]',
    cards: 'text-[14.5px] leading-[1.62]',
    bubble: 'text-[14px] leading-[1.55]'
  } as const;
  const userTypeTune: Record<ThemeVariant, string> = {
    edge: 'text-[14px] leading-[1.55] font-medium',
    cards: 'text-[14px] leading-[1.55] font-medium',
    bubble: 'text-[14px] leading-[1.5] font-medium'
  } as const;
  const styles = {
    bubble: {
      ai: 'bg-white text-gray-900 rounded-tl-md shadow-sm border border-gray-100',
      user: 'bg-gradient-to-r from-pink-50 to-rose-50 text-gray-900 rounded-tr-md shadow-sm',
      system: 'bg-gray-100 text-gray-600 rounded-md',
    },
    edge: {
      ai: 'bg-transparent',
      user: 'bg-gray-100 text-gray-900 rounded-2xl',
      system: 'bg-gray-100 text-gray-600 rounded-md',
    },
    cards: {
      ai: 'bg-white text-gray-900 rounded-xl shadow-md border border-gray-100',
      user: 'bg-gray-100 text-gray-900 rounded-2xl',
      system: 'bg-gray-50 text-gray-600 rounded-md border border-gray-100',
    },
  } as const;

  // AI 全屏无边界样式（edge 模式）
  if (role === 'ai' && fullBleed) {
    const textColor = 'text-gray-900';
    return (
      <div className={`w-full flex justify-start mb-2 ${textColor}`}>
        <div className="w-full px-1.5">{children}</div>
      </div>
    );
  }

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* 无 avatar：遵循产品要求 */}
      <div className={`${bubbleBase} ${isSystem ? styles[variant].system : isUser ? styles[variant].user : styles[variant].ai} ${isSystem ? 'text-[13px] leading-[1.5]' : isUser ? userTypeTune[variant] : aiTypeTune[variant]}`}>
        {children}
      </div>
    </div>
  );
}

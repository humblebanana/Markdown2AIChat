"use client";

import React from 'react';
import { ThemeVariant } from '@/types/theme';

interface StyleToolbarProps {
  themeVariant: ThemeVariant;
  setThemeVariant: (v: ThemeVariant) => void;
  inline?: boolean; // 在外部工具栏中内联显示
}

export default function StyleToolbar({ themeVariant, setThemeVariant, inline = false }: StyleToolbarProps) {
  return (
    <div className={inline ? 'flex items-center gap-2' : 'flex items-center justify-end p-2 bg-gray-100'}>
      <div className="bg-white border border-gray-200 rounded-full shadow-sm p-0.5 flex items-center">
        <button
            onClick={() => setThemeVariant('edge')}
            title="全幅沉浸"
          className={`min-w-[48px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
            themeVariant === 'edge' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          全幅
        </button>
        <button
          onClick={() => setThemeVariant('cards')}
          title="分段卡片"
          className={`min-w-[48px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
            themeVariant === 'cards' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          卡片
        </button>
        <button
          onClick={() => setThemeVariant('bubble')}
          title="经典气泡"
          className={`min-w-[48px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
            themeVariant === 'bubble' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          气泡
        </button>
      </div>
    </div>
  );
}

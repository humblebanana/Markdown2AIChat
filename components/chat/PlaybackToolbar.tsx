"use client";

import React from 'react';
import { ThemeVariant } from '@/types/theme';

export type StreamStrategy = 'char' | 'block';
export type StreamSpeed = 'slow' | 'normal' | 'fast';

interface PlaybackToolbarProps {
  streamStrategy: StreamStrategy;
  setStreamStrategy: (s: StreamStrategy) => void;
  streamSpeed: StreamSpeed;
  setStreamSpeed: (s: StreamSpeed) => void;
  isStreaming: boolean;
  onPlay: () => void;
  onStop: () => void;
  disabled?: boolean;
  themeVariant?: ThemeVariant; // kept for compatibility (unused)
  setThemeVariant?: (v: ThemeVariant) => void; // kept for compatibility (unused)
}

export default function PlaybackToolbar({
  streamStrategy,
  setStreamStrategy,
  streamSpeed,
  setStreamSpeed,
  isStreaming,
  onPlay,
  onStop,
  disabled = false,
}: PlaybackToolbarProps) {
  return (
    <div className="flex items-center justify-end p-2 bg-gray-100">
      <div className="flex items-center gap-2">
        {/* 策略分段切换 */}
        <div className="bg-white border border-gray-200 rounded-full shadow-sm p-0.5 flex items-center">
          <button
            onClick={() => setStreamStrategy('char')}
            title="字符模式"
            className={`min-w-[44px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all ${
              streamStrategy === 'char' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            字符
          </button>
          <button
            onClick={() => setStreamStrategy('block')}
            title="整块模式"
            className={`min-w-[44px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all ${
              streamStrategy === 'block' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            整块
          </button>
        </div>

        {/* 速度分段切换 */}
        <div className="bg-white border border-gray-200 rounded-full shadow-sm p-0.5 flex items-center">
          <button
            onClick={() => setStreamSpeed('slow')}
            title="慢速"
            className={`min-w-[40px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all ${
              streamSpeed === 'slow' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            慢
          </button>
          <button
            onClick={() => setStreamSpeed('normal')}
            title="中速"
            className={`min-w-[40px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all ${
              streamSpeed === 'normal' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            中
          </button>
          <button
            onClick={() => setStreamSpeed('fast')}
            title="快速"
            className={`min-w-[40px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all ${
              streamSpeed === 'fast' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            快
          </button>
        </div>

        {/* 播放按钮 */}
        {!isStreaming ? (
          <button
            onClick={onPlay}
            disabled={disabled}
            className={`bg-white border border-gray-200 rounded-full shadow-sm px-3 py-1 text-sm font-medium transition-all ${
              !disabled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'
            }`}
            title="点击播放流式动画（模拟AI逐字生成）"
          >
            <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z"/></svg>
            播放
          </button>
        ) : (
          <button
            onClick={onStop}
            className="bg-white border border-gray-200 rounded-full shadow-sm px-3 py-1 text-sm font-medium transition-all text-gray-700 hover:bg-gray-100"
            title="停止并切回静态完整展示"
          >
            <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6h12v12H6z"/></svg>
            停止
          </button>
        )}
      </div>
    </div>
  );
}


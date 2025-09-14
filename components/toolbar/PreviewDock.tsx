"use client";

import React from 'react';
import PlaybackToolbar, { StreamSpeed, StreamStrategy } from '@/components/chat/PlaybackToolbar';
import StyleToolbar from '@/components/chat/StyleToolbar';
import { ThemeVariant } from '@/types/theme';

interface PreviewDockProps {
  // Left group: playback
  streamStrategy: StreamStrategy;
  setStreamStrategy: (s: StreamStrategy) => void;
  streamSpeed: StreamSpeed;
  setStreamSpeed: (s: StreamSpeed) => void;
  isStreaming: boolean;
  onPlay: () => void;
  onStop: () => void;
  playbackDisabled?: boolean;

  // Center group: style
  themeVariant: ThemeVariant;
  setThemeVariant: (v: ThemeVariant) => void;

  // Right group moved to page header
  previewMode?: 'single' | 'full';
  onPreviewModeChange?: (mode: 'single' | 'full') => void;
  onSaveImage?: () => void;
  saveDisabled?: boolean;
  isSaving?: boolean;

  // Sidebar toggle
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
}

export default function PreviewDock({
  streamStrategy,
  setStreamStrategy,
  streamSpeed,
  setStreamSpeed,
  isStreaming,
  onPlay,
  onStop,
  playbackDisabled = false,
  themeVariant,
  setThemeVariant,
  previewMode,
  onPreviewModeChange,
  onSaveImage,
  saveDisabled = false,
  isSaving = false,
  showSidebar = true,
  onToggleSidebar,
}: PreviewDockProps) {
  const [playbackExpanded, setPlaybackExpanded] = React.useState(false);
  return (
    <div className="sticky top-0 z-20 px-2 pt-2 pb-2" data-role="preview-dock">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left: Playback + optional sidebar reveal */}
        <div className="justify-self-start flex items-center gap-2">
          {!showSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              title="显示输入面板"
              aria-label="显示输入面板"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {!playbackExpanded ? (
            <button
              onClick={() => setPlaybackExpanded(true)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-[12px] text-gray-700 hover:bg-gray-100"
              title="展开播放控制"
            >
              <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z"/></svg>
              播放
            </button>
          ) : (
            <div className="flex items-center">
              <PlaybackToolbar
                streamStrategy={streamStrategy}
                setStreamStrategy={setStreamStrategy}
                streamSpeed={streamSpeed}
                setStreamSpeed={setStreamSpeed}
                isStreaming={isStreaming}
                onPlay={onPlay}
                onStop={onStop}
                disabled={playbackDisabled}
              />
              <button
                onClick={() => setPlaybackExpanded(false)}
                className="ml-2 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-[12px] text-gray-700 hover:bg-gray-100"
                title="收起播放控制"
              >
                收起
              </button>
            </div>
          )}
        </div>

        {/* Center: Style switcher */}
        <div className="justify-self-center">
          <StyleToolbar inline themeVariant={themeVariant} setThemeVariant={setThemeVariant} />
        </div>

        {/* Right: View + Save (kept in dock) */}
        <div className="justify-self-end flex items-center gap-2">
          <div className="bg-gray-50 border border-gray-200 rounded-full p-0.5 flex items-center">
            <button
              onClick={() => onPreviewModeChange && onPreviewModeChange('single')}
              title="单屏模式"
              className={`min-w-[48px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all ${
                previewMode === 'single' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              单屏
            </button>
            <button
              onClick={() => onPreviewModeChange && onPreviewModeChange('full')}
              title="全屏模式"
              className={`min-w-[48px] text-center flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full transition-all ${
                previewMode === 'full' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              全屏
            </button>
          </div>

          <button
            onClick={onSaveImage}
            disabled={saveDisabled}
            className={`
              group relative flex items-center justify-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full
              text-sm font-medium rounded-md transition-all duration-200
              text-gray-600 hover:bg-gray-100 hover:text-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
              active:scale-95
            `}
            title="保存移动端预览图片 (PNG格式，高质量)"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                <span>保存图片</span>
              </>
            )}
          </button>
        </div>
        </div>
    </div>
  );
}

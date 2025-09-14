import React from 'react';
import { ThemeVariant } from '@/types/theme';
import LiquidGlass from '@/components/liquid/LiquidGlass';

/**
 * 模拟移动端底部的输入框组件
 * 该组件严格按照提供的HTML和CSS进行复刻
 */
const MobileInputBar: React.FC<{ variant?: ThemeVariant }> = ({ variant = 'edge' }) => {

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '83px',
    zIndex: 30,
    // 透明承载层，液态玻璃由内部组件提供
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <LiquidGlass
        radius={18}
        blur={18}
        borderAlpha={variant === 'edge' ? 0.4 : 0.55}
        tint={variant === 'edge' ? '#ffffff' : '#f8fafc'}
        className="w-full"
        style={{ padding: '10px 12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
          {/* 左侧功能按钮（占位：主题/附件） */}
          <button
            type="button"
            aria-label="附件"
            className="group"
            style={{
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 9999,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.45))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(16,24,40,0.12)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.88 17.05a2 2 0 1 1-2.83-2.83l8.49-8.49"/>
            </svg>
          </button>

          {/* 文本输入区域 */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <textarea
              placeholder="请输入你的问题"
              rows={1}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                resize: 'none',
                fontSize: 14,
                color: '#111827',
                padding: 0,
                lineHeight: '1.4',
                maxHeight: 50,
              }}
            />
          </div>

          {/* 右侧发送按钮 */}
          <button
            type="button"
            aria-label="发送"
            style={{
              width: 32,
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 9999,
              background: 'linear-gradient(180deg, #111827, #0b1220)',
              color: '#fff',
              boxShadow: '0 4px 10px rgba(17,24,39,0.25)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </LiquidGlass>
    </div>
  );
};

export default MobileInputBar;

'use client';

import React, { useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { domToCanvas } from 'modern-screenshot';
import InputPanel from '@/components/input/InputPanel';
// toolbars are composed in PreviewDock
import MobilePreviewHTML from '@/components/preview/MobilePreviewHTML';
import PreviewDock from '@/components/toolbar/PreviewDock';
import { ThemeVariant } from '@/types/theme';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { parseMarkdownContent } from '@/lib/markdown/parser';
import { renderMarkdownElements } from '@/lib/markdown/renderer';
import { RenderedElement } from '@/types/markdown';
import { debugMarkdownRendering, debugAreaMapping } from '@/lib/debug/markdown-debug';
import { DEFAULT_DEVICE_ID, DEVICE_PRESETS, DeviceSize, DeviceSelectorState } from '@/types/device';
import { useDeviceStorage } from '@/hooks/use-device-storage';
import DeviceSelector from '@/components/device/DeviceSelector';

/**
 * 主应用 - Markdown到移动端预览的转换工具
 */
export default function Home() {
  // 输入状态
  const [queryValue, setQueryValue] = useState('');
  const [markdownValue, setMarkdownValue] = useState('');
  
  // 渲染状态
  const [renderedElements, setRenderedElements] = useState<RenderedElement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDebugBounds, setShowDebugBounds] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // 截图状态
  const [isSaving, setIsSaving] = useState(false);
  
  // 面板宽度状态（三档模式：25%, 50%, 75%）
  const widthPresets = [25, 50, 75];
  const [sidebarWidth, setSidebarWidth] = useState(33);
  const [isResizing, setIsResizing] = useState(false);
  
  const [previewMode, setPreviewMode] = useState<'single' | 'full'>('single');
  // 预览模式状态（单屏/全屏）
  const [showShortcutHint, setShowShortcutHint] = useState(true);

  // 流式播放（打字机）相关状态
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMarkdown, setStreamedMarkdown] = useState('');
  const [streamSpeed, setStreamSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [streamStrategy, setStreamStrategy] = useState<'char' | 'block'>('char');
  const streamTimerRef = React.useRef<number | null>(null);
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('edge');

  // 客户端平台检测状态
  const [isMac, setIsMac] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);

  // 设备尺寸相关状态
  const [deviceState, setDeviceState] = useState<DeviceSelectorState>({
    selectedDeviceId: DEFAULT_DEVICE_ID,
    customSize: { width: 393, height: 852 },
    isLandscape: false,
    zoomLevel: 1.0
  });

  // 使用本地存储保存设备偏好
  useDeviceStorage(deviceState, setDeviceState);
  
  // 防抖处理，300ms延迟
  const debouncedMarkdown = useDebouncedValue(markdownValue, 300);

  // 设备尺寸处理函数
  const handleDeviceChange = (deviceId: string) => {
    setDeviceState(prev => ({ ...prev, selectedDeviceId: deviceId }));
  };

  const handleCustomSizeChange = (size: DeviceSize) => {
    setDeviceState(prev => ({ ...prev, customSize: size }));
  };

  const handleOrientationToggle = () => {
    setDeviceState(prev => ({ ...prev, isLandscape: !prev.isLandscape }));
  };

  const handleZoomChange = (zoom: number) => {
    setDeviceState(prev => ({ ...prev, zoomLevel: zoom }));
  };

  // 获取当前设备尺寸
  const getCurrentDeviceSize = (): DeviceSize => {
    if (deviceState.selectedDeviceId === 'custom') {
      return deviceState.customSize;
    }
    const device = DEVICE_PRESETS.find(d => d.id === deviceState.selectedDeviceId);
    return device?.size || { width: 393, height: 852 };
  };

  // 拖拽调整宽度的处理函数（自由拖拽）
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.main-content-container') as HTMLElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      let newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      
      // 限制最小和最大宽度
      if (newWidth < 15) newWidth = 15;
      if (newWidth > 67) newWidth = 67;
      
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // TODO(human): 添加双击重置宽度功能

  // 计算每次迭代追加的字符数（近似 token 数）
  const getChunkSize = React.useCallback(() => {
    // 更快的字符推进量（影响三种策略的进度）
    switch (streamSpeed) {
      case 'slow':
        return 2; // 2 chars/step
      case 'fast':
        return 12; // 12 chars/step
      case 'normal':
      default:
        return 6; // 6 chars/step
    }
  }, [streamSpeed]);

  // 开始或重启流式播放
  const startStreaming = React.useCallback(() => {
    if (!markdownValue.trim()) return;
    // 清理可能存在的计时器
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setStreamedMarkdown('');
    setIsStreaming(true);

    let index = 0;
    const total = markdownValue.length;
    // 更快的间隔（slow/normal/fast）：约 ~20/75/200 chars/sec（视内容而定）
    const interval = streamSpeed === 'slow' ? 100 : streamSpeed === 'normal' ? 80 : 60;
    const id = window.setInterval(() => {
      const size = getChunkSize();
      index = Math.min(total, index + size);
      setStreamedMarkdown(markdownValue.slice(0, index));
      if (index >= total) {
        // 完成
        window.clearInterval(id);
        streamTimerRef.current = null;
        setIsStreaming(false);
      }
    }, interval);
    streamTimerRef.current = id;
  }, [getChunkSize, markdownValue]);

  // 停止流式播放并切回静态完整展示
  const stopStreaming = React.useCallback(() => {
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
    setStreamedMarkdown(markdownValue);
  }, [markdownValue]);

  // 当原始Markdown变更时，同步或重启流式
  useEffect(() => {
    if (!markdownValue.trim()) {
      // 清空
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      setIsStreaming(false);
      setStreamedMarkdown('');
      return;
    }
    if (isStreaming) {
      // 重启，保证从头播放
      startStreaming();
    } else {
      // 非流式：直接静态展示
      setStreamedMarkdown(markdownValue);
    }
  }, [markdownValue]);

  // 在速度变化且处于流式时，平滑重启以采用新的速度
  useEffect(() => {
    if (isStreaming) {
      startStreaming();
    }
  }, [streamSpeed]);

  // 组件卸载时清理计时器
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
    };
  }, []);

  // 客户端平台检测 - 避免Hydration错误
  useEffect(() => {
    setIsClientSide(true);
    setIsMac(navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // 初次进入显示一次轻提示，随后自动隐藏
  useEffect(() => {
    if (!showShortcutHint) return;
    const t = setTimeout(() => setShowShortcutHint(false), 3500);
    return () => clearTimeout(t);
  }, [showShortcutHint]);

  // 保存移动端预览图片功能 - 支持全屏模式的高质量截图
  const handleSaveImage = async () => {
    if (!markdownValue.trim() || isProcessing || isSaving) return;

    setIsSaving(true);
    console.log('📸 [截图] 开始高质量截图流程...');

    try {
      // 查找目标元素 - 手机框架容器
      const mobileFrame = document.querySelector('.mobile-device-frame') as HTMLElement;

      if (!mobileFrame) {
        console.error('❌ [截图] 找不到手机框架元素');
        throw new Error('找不到移动端预览容器\n\n请确保移动端预览已正常显示');
      }

      console.log('✅ [截图] 找到手机框架:', {
        className: mobileFrame.className,
        originalSize: `${mobileFrame.offsetWidth}x${mobileFrame.offsetHeight}`,
        currentTransform: window.getComputedStyle(mobileFrame).transform
      });

      // 是否为全屏缩放模式（不对真实DOM做任何可见修改，使用克隆样式覆盖）
      const isScaled = previewMode === 'full';

      // 📌 导出范围与视口信息
      // 目标：导出当前可视区域，而不是始终从内容顶部开始
      const isSingle = previewMode === 'single';
      const viewportWidth = mobileFrame.clientWidth;
      const viewportHeight = mobileFrame.clientHeight;

      // 定位可滚动容器与其内容
      const scroller = mobileFrame.querySelector('[data-role="mobile-scrollview"]') as HTMLElement | null;
      const scrollContent = scroller?.querySelector('[data-role="mobile-scrollcontent"]') as HTMLElement | null;

      // 记录原始状态，便于恢复
      const scrollAdjust = {
        applied: false,
        originalOverflow: '',
        originalTransform: '',
        originalScrollTop: 0,
      };

      if (isSingle && scroller && scrollContent) {
        // 在截图前，将滚动偏移“转化”为内容的负向位移
        // 这样克隆DOM时即便滚动位置不被保留，视觉上仍可获得当前视口内容
        scrollAdjust.applied = true;
        scrollAdjust.originalOverflow = scroller.style.overflow;
        scrollAdjust.originalTransform = scrollContent.style.transform;
        scrollAdjust.originalScrollTop = scroller.scrollTop;

        // 隐藏以避免用户看到瞬时跳动
        const originalVisibilityLocal = mobileFrame.style.visibility;
        mobileFrame.style.visibility = 'hidden';

        scroller.style.overflow = 'hidden';
        scroller.scrollTop = 0; // 避免库重置滚动产生影响
        scrollContent.style.transform = `translateY(-${scrollAdjust.originalScrollTop}px)`;

        // 强制重绘并恢复可视
        mobileFrame.offsetHeight;
        mobileFrame.style.visibility = originalVisibilityLocal;
      }

      // 📸 临时添加截图优化样式
      console.log('🎨 [截图] 应用截图优化样式...');
      const screenshotOptimizationStyle = document.createElement('style');
      screenshotOptimizationStyle.id = 'screenshot-optimization';
      screenshotOptimizationStyle.textContent = `
        .mobile-device-frame, .mobile-device-frame * {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE */
        }
        .mobile-device-frame::-webkit-scrollbar,
        .mobile-device-frame *::-webkit-scrollbar {
          display: none !important; /* Chrome, Safari */
        }
        .mobile-device-frame {
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(screenshotOptimizationStyle);

      console.log('📏 [截图] 截图时尺寸:', {
        width: mobileFrame.offsetWidth,
        height: mobileFrame.offsetHeight,
        viewportWidth,
        viewportHeight,
        scrollHeight: mobileFrame.scrollHeight,
        innerScrollTop: scroller?.scrollTop || 0,
      });

      // 等待内容完全渲染
      console.log('⏳ [截图] 等待内容渲染完成...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // 生成文件名
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);

      const filename = `Mobile Preview-${timestamp}.png`;

      let dataURL: string | null = null;

      // 计算捕获尺寸（单屏：视口；全屏：整页）
      const captureWidth = isSingle ? viewportWidth : 390;
      const captureHeight = isSingle ? viewportHeight : mobileFrame.scrollHeight;

      // 🎯 方案1: html-to-image (主要方案) - 针对移动端优化
      try {
        console.log('🚀 [截图] 尝试 html-to-image (移动端优化)...');

        const options: Parameters<typeof htmlToImage.toPng>[1] = {
          quality: 1.0,
          backgroundColor: '#ffffff', // 纯白背景，避免灰色干扰
          pixelRatio: 2, // 2倍分辨率，确保清晰度
          width: captureWidth,
          height: captureHeight,
          cacheBust: true,
          filter: (node: HTMLElement) => {
            // 过滤掉可能的滚动条和干扰元素
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const style = window.getComputedStyle(element);

              // 跳过预览Dock（即使将来变更为整页截图也不包含）
              if (element.dataset && element.dataset.role === 'preview-dock') return false;
              if (element.closest && element.closest('[data-role="preview-dock"]')) return false;
              // 跳过绝对定位的滚动条或浮层元素
              if (style.position === 'absolute' && element.tagName !== 'DIV') return false;
              // 跳过可能的滚动条元素
              if (element.className.includes('scrollbar')) return false;
              // 跳过可能的overlay元素
              if (element.className.includes('overlay')) return false;
            }
            return true;
          },
          style: {
            // 确保无额外变形和干净的显示
            transform: 'none',
            transformOrigin: 'initial',
            overflow: 'hidden', // 隐藏可能的滚动条
            scrollbarWidth: 'none', // 隐藏滚动条(Firefox)
          }
        };

        dataURL = await htmlToImage.toPng(mobileFrame, options);
        console.log('✅ [截图] html-to-image 成功!');

      } catch (htmlToImageError) {
        console.warn('⚠️ [截图] html-to-image 失败:', htmlToImageError);

        // 🎯 方案2: modern-screenshot (备选方案)
        try {
          console.log('🔄 [截图] 尝试 modern-screenshot...');

          const canvas = await domToCanvas(mobileFrame, {
            backgroundColor: '#f3f4f6',
            scale: 2, // 2倍缩放确保质量
            quality: 1.0,
            width: captureWidth,
            height: captureHeight
          });

          dataURL = canvas.toDataURL('image/png', 1.0);
          console.log('✅ [截图] modern-screenshot 成功!');

        } catch (modernScreenshotError) {
          console.warn('⚠️ [截图] modern-screenshot 失败:', modernScreenshotError);

          // 🎯 方案3: html-to-image 简化配置
          try {
            console.log('🔄 [截图] 尝试 html-to-image 简化配置...');

            dataURL = await htmlToImage.toPng(mobileFrame, {
              quality: 0.9,
              backgroundColor: '#f3f4f6',
              pixelRatio: 1,
              cacheBust: false
            });
            console.log('✅ [截图] html-to-image 简化配置成功!');

          } catch (fallbackError) {
            console.error('❌ [截图] 所有截图方案都失败了:', fallbackError);
            throw new Error('截图库无法处理当前页面内容');
          }
        }
      }

      // 无需恢复：未对真实DOM的缩放做改动

      // 恢复滚动相关的临时样式与位置
      if (scrollAdjust.applied && scroller && scrollContent) {
        scroller.style.overflow = scrollAdjust.originalOverflow;
        scrollContent.style.transform = scrollAdjust.originalTransform;
        scroller.scrollTop = scrollAdjust.originalScrollTop;
      }

      // 🧹 清理截图优化样式
      console.log('🧹 [截图] 清理截图优化样式...');
      const screenshotStyle = document.getElementById('screenshot-optimization');
      if (screenshotStyle) {
        screenshotStyle.remove();
      }

      if (!dataURL || dataURL.length < 1000) {
        throw new Error(`生成的图片数据异常: ${dataURL ? dataURL.length : 'null'} bytes`);
      }

      // 🎉 下载文件
      console.log('💾 [截图] 开始下载...');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const sizeKB = Math.round(dataURL.length / 1024);
      console.log(`🎉 [截图] 高质量保存成功: ${filename} (${sizeKB}KB)`);

    } catch (error) {
      console.error('💥 [截图] 流程失败:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // 确保恢复缩放状态（错误情况下）
      if (previewMode === 'full') {
        const mobileFrame = document.querySelector('.mobile-device-frame') as HTMLElement;
        if (mobileFrame) {
          // 恢复可见性
          const originalVisibility = mobileFrame.dataset.originalVisibility || '';
          mobileFrame.style.visibility = originalVisibility;

          // 恢复过渡动画
          const originalTransition = mobileFrame.dataset.originalTransition || '';
          mobileFrame.style.transition = originalTransition;

          // 清理内联样式，恢复到CSS控制的状态
          mobileFrame.style.transform = '';
          mobileFrame.style.transformOrigin = '';

          // 清理临时数据
          delete mobileFrame.dataset.originalTransition;
          delete mobileFrame.dataset.originalVisibility;
        }
      }

      // 🧹 清理截图优化样式（错误情况下）
      const errorScreenshotStyle = document.getElementById('screenshot-optimization');
      if (errorScreenshotStyle) {
        errorScreenshotStyle.remove();
      }

      // 用户友好的错误处理
      if (errorMessage.includes('找不到移动端预览容器')) {
        alert(`${errorMessage}\n\n💡 建议：\n1. 确保已输入Markdown内容\n2. 等待页面完全加载\n3. 检查移动端预览是否正常显示`);
      } else {
        alert(`截图保存失败: ${errorMessage}\n\n🛠️ 可以尝试：\n1. 切换到单屏模式再尝试截图\n2. 刷新页面后重试\n3. 使用浏览器截图功能：\n   • Chrome: F12 → 选择元素 → 右键 → "Capture node screenshot"\n   • Firefox: F12 → 截图工具`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 键盘快捷键处理 (切换预览模式)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // 检测平台：Mac使用metaKey (Cmd)，Windows使用ctrlKey (Ctrl)
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (!modifierKey) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPreviewMode('single');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPreviewMode('full');
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [isMac]);

  // 处理Markdown内容变化
  useEffect(() => {
    const processMarkdown = async () => {
      if (!debouncedMarkdown.trim()) {
        setRenderedElements([]);
        return;
      }

      setIsProcessing(true);
      
      try {
        // 解析Markdown
        const parsedContent = parseMarkdownContent(debouncedMarkdown);
        
        // 渲染为React组件
        const rendered = renderMarkdownElements(parsedContent.elements);
        
        // 开发环境调试
        if (process.env.NODE_ENV === 'development') {
          debugMarkdownRendering(debouncedMarkdown, parsedContent.elements, rendered);
          debugAreaMapping();
        }
        
        setRenderedElements(rendered);
      } catch (error) {
        console.error('Markdown处理失败:', error);
        setRenderedElements([]);
      } finally {
        setIsProcessing(false);
      }
    };

    processMarkdown();
  }, [debouncedMarkdown]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
            MACH - Markdown2AIChat
            </h1>
            <p className="text-sm text-gray-600 mt-1">
            一键将 Markdown 渲染为高保真移动端 AI Chat 界面，所见即所得，可模拟流式生成，并支持一键导出
            </p>
          </div>

          {/* GitHub 链接 */}
          <a
            href="https://github.com/humblebanana/Markdown2AIChat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            title="View on GitHub"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">GitHub</span>
          </a>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden main-content-container">
        {/* 左侧输入面板 */}
        <div 
          className={`flex flex-col transition-all duration-300 ease-in-out ${
            showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${showSidebar ? 'border-r border-gray-100 shadow-sm' : ''}`}
          style={{
            width: showSidebar ? `${sidebarWidth}%` : '0%',
            overflow: showSidebar ? 'visible' : 'hidden'
          }}
        >
          {showSidebar && (
            <InputPanel
              queryValue={queryValue}
              markdownValue={markdownValue}
              onQueryChange={setQueryValue}
              onMarkdownChange={setMarkdownValue}
              isProcessing={isProcessing}
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
            />
          )}
        </div>

        {/* 拖拽分割线 - 仅在侧边栏显示时显示 */}
        {showSidebar && (
          <div
            className={`w-1 bg-gray-100 hover:bg-gray-200 cursor-col-resize flex-shrink-0 transition-colors duration-200 ${
              isResizing ? 'bg-blue-300' : ''
            } group`}
            onMouseDown={handleMouseDown}
            title="拖拽切换档位 (25% / 50% / 75%)"
          >
            {/* 拖拽指示器 */}
            <div className="h-full w-full relative flex items-center justify-center">
              <div className={`w-0.5 h-8 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors duration-200 ${
                isResizing ? 'bg-blue-400' : ''
              }`}></div>
            </div>
          </div>
        )}

        {/* 右侧预览面板 */}
        <div 
          className="flex flex-col transition-all duration-300 ease-in-out relative"
          style={{
            width: showSidebar ? `${100 - sidebarWidth}%` : '100%'
          }}
        >
          {/* 顶部控制Dock：左(播放) / 中(样式) / 右(视图+保存) */}
          <PreviewDock
            streamStrategy={streamStrategy}
            setStreamStrategy={setStreamStrategy}
            streamSpeed={streamSpeed}
            setStreamSpeed={setStreamSpeed}
            isStreaming={isStreaming}
            onPlay={startStreaming}
            onStop={stopStreaming}
            playbackDisabled={!markdownValue.trim()}
            themeVariant={themeVariant}
            setThemeVariant={setThemeVariant}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            onSaveImage={handleSaveImage}
            saveDisabled={!markdownValue.trim() || isProcessing || isSaving}
            isSaving={isSaving}
            showSidebar={showSidebar}
            onToggleSidebar={() => setShowSidebar(true)}
          />
          
          {/* 预览内容区域 */}
          <div className={`flex-1 ${previewMode === 'single' ? 'overflow-hidden' : 'overflow-y-auto'} relative`}>
            <MobilePreviewHTML
              markdownContent={markdownValue}
              queryValue={queryValue}
              isLoading={isProcessing}
              isStreaming={isStreaming}
              streamProgress={isStreaming ? streamedMarkdown.length : Number.POSITIVE_INFINITY}
              streamStrategy={streamStrategy}
              showDebugBounds={showDebugBounds}
              previewMode={previewMode}
              showSidebar={showSidebar}
              sidebarWidth={sidebarWidth}
              themeVariant={themeVariant}
              deviceSize={getCurrentDeviceSize()}
              isLandscape={deviceState.isLandscape}
              zoomLevel={deviceState.zoomLevel}
            />

            {/* 设备尺寸选择器 - 浮动在右下角 */}
            <DeviceSelector
              selectedDeviceId={deviceState.selectedDeviceId}
              customSize={deviceState.customSize}
              isLandscape={deviceState.isLandscape}
              zoomLevel={deviceState.zoomLevel}
              onDeviceChange={handleDeviceChange}
              onCustomSizeChange={handleCustomSizeChange}
              onOrientationToggle={handleOrientationToggle}
              onZoomChange={handleZoomChange}
            />

            {/* 角落轻提示：Notion风格，首次自动显示，常态极淡，悬停更清晰 */}
            <div
              className={`hidden md:flex items-center gap-1 fixed bottom-3 left-3 md:bottom-4 md:left-4 z-40
              text-[12px] text-gray-600 select-none transition-opacity pointer-events-none
              ${showShortcutHint ? 'opacity-90' : 'opacity-90 hover:opacity-100'}`}
              aria-hidden="true"
              title="使用键盘快捷键切换视图"
            >
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded">{isMac ? '⌘' : 'Ctrl'}</span>
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded">←</span>
              <span className="text-gray-400">/</span>
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded">→</span>
              <span className="ml-1 text-gray-500">切换视图</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

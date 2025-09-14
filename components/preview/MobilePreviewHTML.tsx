'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MobileInputBar from './MobileInputBar';
import ChatHeader from '@/components/chat/ChatHeader';
import Message from '@/components/chat/Message';
import ProductCard from '@/components/product/ProductCard';
import { getProductMockData } from '@/lib/product/productUtils';

// 通用SKU检测和渲染函数
const renderWithSkuCards = (
  children: React.ReactNode,
  showDebugBounds = false,
  blockReady: boolean = true
): React.ReactNode => {
  // 将children转换为字符串来检查
  const childrenString = React.Children.toArray(children)
    .map(child => {
      if (typeof child === 'string') return child;
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
        return typeof child.props.children === 'string' ? (child.props.children as string) : '';
      }
      return '';
    })
    .join('');

  // 检查是否包含sku_id格式的链接
  const skuLinkRegex = /\[([^\]]+)\]\(<sku_id>(\d+)<\/sku_id>\)/g;
  const matches = childrenString.match(skuLinkRegex);
  
  if (matches && matches.length > 0) {
    // 解析每个匹配项
    type SkuPart = { type: 'sku_card'; skuId: string; title: string };
    type TextPart = { type: 'text'; content: string };
    type Part = SkuPart | TextPart;
    const parts: Part[] = [];
    let lastIndex = 0;
    let match;
    
    const regex = /\[([^\]]+)\]\(<sku_id>(\d+)<\/sku_id>\)/g;
    while ((match = regex.exec(childrenString)) !== null) {
      // 添加匹配前的文本
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: childrenString.slice(lastIndex, match.index)
        });
      }
      
      // 添加商品卡片
      parts.push({
        type: 'sku_card',
        skuId: match[2],
        title: match[1]
      });
      
      lastIndex = regex.lastIndex;
    }
    
    // 添加剩余文本
    if (lastIndex < childrenString.length) {
      parts.push({
        type: 'text',
        content: childrenString.slice(lastIndex)
      });
    }
    
    return (
      <div className="mb-2">
        {parts.map((part, index) => {
          if (part.type === 'sku_card') {
            const productData = getProductMockData(part.skuId, part.title);
            return (
              <ProductCard 
                key={`sku-${part.skuId}-${index}`}
                product={productData}
                showDebugBounds={showDebugBounds}
                skeleton={!blockReady}
              />
            );
          } else {
            return part.content.trim() ? (
              <span key={`text-${index}`}>
                {part.content.trim()}
              </span>
            ) : null;
          }
        })}
      </div>
    );
  }
  
  // 如果没有SKU链接，返回原始内容
  return children;
};

interface MobilePreviewHTMLProps {
  markdownContent: string; // 直接接收原始Markdown文本
  queryValue?: string; // 用户查询内容
  isLoading?: boolean;
  isStreaming?: boolean;
  streamProgress?: number; // 流式进度（基于字符数）
  streamStrategy?: 'char' | 'block';
  showDebugBounds?: boolean;
  previewMode?: 'single' | 'full'; // 预览模式：单屏或全屏
  showSidebar?: boolean; // 侧边栏显示状态，用于计算可用空间
  sidebarWidth?: number; // 侧边栏宽度百分比，用于精确计算缩放
  themeVariant?: import('@/types/theme').ThemeVariant;
}

/**
 * 基于京言AI助手HTML结构的移动端预览组件
 * 复刻完整的聊天界面和产品展示布局
 */
export default function MobilePreviewHTML({
  markdownContent,
  queryValue = '',
  isLoading = false,
  isStreaming = false,
  streamProgress = Number.POSITIVE_INFINITY,
  streamStrategy = 'char',
  showDebugBounds = false,
  previewMode = 'single',
  showSidebar = true,
  sidebarWidth = 50,
  themeVariant = 'edge'
}: MobilePreviewHTMLProps) {
  
  const isSingleMode = previewMode === 'single';
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  // 智能跟随滚动：仅在接近底部时自动滚动
  const autoFollowRef = useRef(true);
  const SCROLL_FOLLOW_THRESHOLD = 120; // px

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distanceToBottom = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
    autoFollowRef.current = distanceToBottom < SCROLL_FOLLOW_THRESHOLD;
  };

  // 在单屏模式流式播放时，自动跟随滚动到底部（若用户接近底部）
  useEffect(() => {
    if (!isSingleMode || !isStreaming) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const id = window.requestAnimationFrame(() => {
      if (autoFollowRef.current) {
        try {
          scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
        } catch {
          scroller.scrollTop = scroller.scrollHeight;
        }
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [markdownContent, isStreaming, isSingleMode, streamProgress]);
  
  // 计算全屏模式的缩放比例 - 确保完整内容可见
  const getScaleRatio = () => {
    if (typeof window === 'undefined') return 0.5; // SSR默认值
    
    // 计算可用的显示区域
    const availableWidth = showSidebar ? 
      window.innerWidth * (100 - sidebarWidth) / 100 - 60 : window.innerWidth - 60;
    const availableHeight = window.innerHeight - 200; // 减去头部和控制栏高度
    
    // 移动端原始尺寸
    const targetWidth = 390;
    const targetHeight = 1800; // 预估长内容的高度
    
    // 基于宽度和高度计算缩放比例，取较小值确保完整显示
    const widthRatio = availableWidth / targetWidth;
    const heightRatio = availableHeight / targetHeight;
    
    // 选择更小的比例，确保内容完整可见，范围控制在0.3-0.8之间
    const ratio = Math.min(0.8, Math.max(0.3, Math.min(widthRatio, heightRatio)));
    return Number(ratio.toFixed(2));
  };
  
  const scaleRatio = !isSingleMode ? getScaleRatio() : 1;
  
  return (
    <div className={`flex justify-center bg-gray-50 mobile-preview-container transition-all duration-300 ${ 
      isSingleMode ? 'h-full items-start' : 'min-h-full items-start overflow-y-auto p-2'
    }`}> 
      {/* 手机框架容器 */}
      <div
        className={`relative flex flex-col bg-white overflow-hidden mobile-device-frame transition-all duration-300 ${
          isSingleMode
            ? 'rounded-2xl shadow-2xl'
            : 'rounded-lg shadow-lg'
        }`}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Helvetica Neue", Helvetica, "PingFang SC", "HarmonyOS Sans SC", "MiSans", "OPPOSans", "Noto Sans SC", "Source Han Sans SC", "Hiragino Sans GB", "Segoe UI", Roboto, Arial, sans-serif',
          ...(isSingleMode
            ? {
                width: '390px',
                height: '844px',
                minWidth: '390px',
                minHeight: '844px'
              }
            : {
                width: '390px',
                minWidth: '390px',
                height: 'auto',
                minHeight: 'auto',
                maxHeight: 'none', // 允许内容完全展开
                transform: `scale(${scaleRatio})`,
                transformOrigin: 'top center',
                marginBottom: `${(1 - scaleRatio) * 200}px` // 补偿缩放造成的空间变化
              })
        }}
      >
      {/* 顶部导航栏（通用品牌化） */}
      <ChatHeader variant={themeVariant} />

      {/* 消息滚动视图 */}
      <div 
        className={`bg-gray-100 ${ 
          isSingleMode 
            ? 'flex-1 overflow-y-auto' 
            : 'overflow-visible'
        }`}
        style={{ 
          backgroundColor: 'rgb(255, 255, 255)',
          paddingBottom: isSingleMode ? '83px' : '0' // 为输入框预留空间
        }}
        ref={scrollerRef}
        data-role="mobile-scrollview"
        onScroll={handleScroll}
      >
        <div className="pt-4 pb-2 px-2" data-role="mobile-scrollcontent">


          {/* 用户消息气泡 */}
          {queryValue && (
            <Message role="user" variant={themeVariant}>{queryValue}</Message>
          )}

          {/* AI回复消息卡片 */}
          <div className="message-card mb-4">
            <div className="bg-white">
              <div className="p-2">
                {/* 分析推导过程（折叠） */}
                <div className="mb-4">
                  <div className="flex items-center text-xs text-gray-500 cursor-pointer">
                    <span>查看分析推导过程</span>
                    <img 
                      className="ml-1 w-3 h-3" 
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkBAMAAAATLoWrAAAAJ1BMVEUAAACHi5OJjZWJjJaIi5SIi5OHj5eJjJSJipWHi5OKjJWGjJOIi5QRV08UAAAADHRSTlMAoH9fv5Agz6+Ab1BVgQ4YAAAAWklEQVQoz2MYjiBjA4zF5QZl1ByGCekcgTJkzhhAGExnjkKFGM9AlemcEWBAKIMoOggk4coQihDK4IoQyuCKEMrgihDK4IoQyuCKEMrgihDKDmL4nXUCw3AFAJvMHijdGqNSAAAAAElFTkSuQmCC" 
                      alt=""
                    />
                  </div>
                </div>

                {/* Markdown内容渲染区域 - 块级流式/静态 */}
                <div className="markdown-global-style-floor">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-gray-500 text-sm">AI正在分析中...</span>
                    </div>
                  ) : (
                    <div className={`space-y-4 ${showDebugBounds ? 'border border-red-300 bg-red-50 p-2' : ''}`}>
                      {(() => {
                        const content = !markdownContent ? (
                          <div className="text-gray-500 text-sm text-left py-2">等待输入Markdown内容...</div>
                        ) : !isStreaming || !isFinite(streamProgress) ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold text-gray-900 mb-2">
                                {renderWithSkuCards(children, showDebugBounds, true)}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-semibold text-gray-800 mb-1.5">
                                {renderWithSkuCards(children, showDebugBounds, true)}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-semibold text-gray-800 mb-1.5">
                                {renderWithSkuCards(children, showDebugBounds, true)}
                              </h3>
                            ),
                            p: ({ children }: { children?: React.ReactNode }) => {
                              // 将children转换为字符串来检查
                              const childrenString = React.Children.toArray(children)
                                .map(child => {
                                  if (typeof child === 'string') return child;
                                  if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
                                    return typeof child.props.children === 'string' ? (child.props.children as string) : '';
                                  }
                                  return '';
                                })
                                .join('');
                              
                              console.log('Paragraph children:', children);
                              console.log('Paragraph string:', childrenString);
                              
                              // 检查是否包含sku_id格式的链接
                              const skuLinkRegex = /\[([^\]]+)\]\(<sku_id>(\d+)<\/sku_id>\)/g;
                              
                              const matches = childrenString.match(skuLinkRegex);
                              
                              if (matches && matches.length > 0) {
                                console.log('Found SKU links in paragraph:', matches);
                                
                                // 解析每个匹配项
                                type SkuPart = { type: 'sku_card'; skuId: string; title: string };
                                type TextPart = { type: 'text'; content: string };
                                type Part = SkuPart | TextPart;
                                const parts: Part[] = [];
                                let lastIndex = 0;
                                let match;
                                
                                const regex = /\[([^\]]+)\]\(<sku_id>(\d+)<\/sku_id>\)/g;
                                while ((match = regex.exec(childrenString)) !== null) {
                                  // 添加匹配前的文本
                                  if (match.index > lastIndex) {
                                    parts.push({
                                      type: 'text',
                                      content: childrenString.slice(lastIndex, match.index)
                                    });
                                  }
                                  
                                  // 添加商品卡片
                                  parts.push({
                                    type: 'sku_card',
                                    skuId: match[2],
                                    title: match[1]
                                  });
                                  
                                  lastIndex = regex.lastIndex;
                                }
                                
                                // 添加剩余文本
                                if (lastIndex < childrenString.length) {
                                  parts.push({
                                    type: 'text',
                                    content: childrenString.slice(lastIndex)
                                  });
                                }
                                
                                return (
                                  <div className="mb-2">
                                    {parts.map((part, index) => {
                                      if (part.type === 'sku_card') {
                                        const productData = getProductMockData(part.skuId, part.title);
                                        return (
                                          <ProductCard 
                                            key={`sku-${part.skuId}-${index}`}
                                            product={productData}
                                            showDebugBounds={showDebugBounds}
                                          />
                                        );
                                      } else {
                                        return part.content.trim() ? (
                                          <p key={`text-${index}`} className="text-sm text-gray-700 leading-relaxed mb-2">
                                            {part.content.trim()}
                                          </p>
                                        ) : null;
                                      }
                                    })}
                                  </div>
                                );
                              }
                              
                              // 普通段落正常处理
                              return <p className="text-sm text-gray-700 leading-relaxed mb-2">{children}</p>;
                            },
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-3">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-3">{children}</ol>,
                            li: ({ children }) => (
                              <li className="text-sm text-gray-700">
                                {renderWithSkuCards(children, showDebugBounds)}
                              </li>
                            ),
                            blockquote: ({ children }) => (
                              <div className="text-sm text-gray-600 italic mb-2">
                                {renderWithSkuCards(children, showDebugBounds)}
                              </div>
                            ),
                            code: ({ children }) => {
                              // 检查是否是内联代码（没有换行符）
                              const isInline = typeof children === 'string' && !children.includes('\n');
                              return isInline ? (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                              ) : (
                                <pre className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto mb-3">
                                  <code>{children}</code>
                                </pre>
                              );
                            },
                            table: ({ children }) => (
                              <div className="overflow-x-auto mb-4">
                                <table className="min-w-full text-xs border border-gray-200 bg-white">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children }) => <tr>{children}</tr>,
                            th: ({ children }) => (
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 border-b border-gray-300 border-r border-gray-200">
                                {renderWithSkuCards(children, showDebugBounds, true)}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 text-gray-700 border-b border-gray-200 border-r border-gray-200">
                                {renderWithSkuCards(children, showDebugBounds, true)}
                              </td>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {renderWithSkuCards(children, showDebugBounds, true)}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">
                                {renderWithSkuCards(children, showDebugBounds, true)}
                              </em>
                            ),
                            a: ({ href, children }) => {
                              // 普通链接正常处理
                              return <a href={href} className="text-blue-600 underline">{children}</a>;
                            },
                          }}>
{markdownContent}
                          </ReactMarkdown>
                        ) : (
                          <StreamingBlocks
                            markdown={markdownContent}
                            progress={streamProgress}
                            strategy={streamStrategy}
                            showDebugBounds={showDebugBounds}
                          />
                        );

                        const wrapped = (
                          <div className={`mdx-typography mdx-${themeVariant}`}>
                            {content}
                          </div>
                        );
                        if (themeVariant === 'edge') {
                          return <Message role="ai" variant={'edge'} fullBleed>{wrapped}</Message>;
                        }
                        if (themeVariant === 'cards') {
                          return <div className="bg-white border border-gray-100 rounded-xl shadow-md p-3">{wrapped}</div>;
                        }
                        return <Message role="ai" variant={'bubble'}>{wrapped}</Message>;
                      })()}
                      {/* 打字机提示（仅在流式播放时显示） */}
                      {isStreaming && (
                        <div className="flex items-center text-xs text-gray-500 pt-1">
                          <span className="inline-flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            正在生成...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 底部操作栏 */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-xs text-gray-500">
                      <img 
                        className="w-4 h-4 mr-1" 
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAANlBMVEUAAACIi5SHjJSEi5OJi5SHiZOIi5SIipSIi5SHi5SJi5SHiZOHipOIipSIi5OIi5OIjJOIi5Q5RYHaAAAAEXRSTlMA4CAQ70DAkM+gMIBgsHDQkEs4CzkAAAFCSURBVDjLjZXbsoMgDEUD4X6x9f9/9hjkwAA2uB+cdrLcCRADjEJts1DnqZyJGhhpe1FdyodfoDkXGfkAoq1R4W2MNn/qX4szKcXtcrSITHcWMRkHVUA9ve8LGxZSPCw5UTIVpuxOwoOkI7aFsJAIj0JixX/QVpJhbc2xLnPdnHsdtCeJPUTanLL664cHVqba0t5JHtW1WlXct7YKQW8qRcp8lAoin1+qUyRAqoC8HWMaSxfQ+WZw9Bi19lHhQZE1I+krquB6RIA3cEd5uBewh3MA0Y51q0zWO/VmRQ4YW+F4h+LSLnwFesPIocd5t/odmp1tan2q33yGNf5983G/Hxm91flBJOQ83tJK6jbeOlvGq5fLHG/kOopTo/GYR3GLfM9bLtOA92Ic8JPx07Xx62yCHy8jy19d0XzURYls9ZT6D8WaGTdYh6LBAAAAAElFTkSuQmCC" 
                        alt=""
                      />
                    </button>
                    <button className="flex items-center text-xs text-gray-500">
                      <img 
                        className="w-4 h-4 mr-1" 
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAANlBMVEUAAACIi5SHipOJi5SDi5KHiZOIipSIi5SHipWIipSIi5SHi5SHipKIi5SHipSHi5SHipWIi5Sigds/AAAAEXRSTlMA3yDvEECgwGCQgM9gULBwMIDGfEcAAAEzSURBVDjLtZTdtoQgCIUNULOyn/d/2aNxitJGmovZFylrfW4RTPNrQZwmuxYx1BwN3barc7BzASW+g9tFDihc40BCwu4o6soY7iSGydroDkpiZoXE4dil54XLYbSgsO6cytKxiDefZxOTF1FwaYuCtWmSx2iastmWB2cU+d02sLluG/ICNKowZcAfVXM6ulFTPQv6DYqM6gmgya3RUZ+onScVTfvPZnlb14Wr++ZUqzGdngFgKmsa878ytEBG+jQSNmzlEsKxZtYy5X0J2f9J5d2PaY7QOBM7yd9FjUSl9ZTD8ZGlsbABFLYmEYrOMVuRdd97eUSKPPlINXszsMhkpYjbrcX8GmL8VBYxthytH0ro/5/XBPLUU+MKMcwgLqYhmLdTHhqgPK+Sswr73rwTPW79BxPrGSWdVD53AAAAAElFTkSuQmCC" 
                        alt=""
                      />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    内容由AI生成
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 条件渲染的移动端输入框 */}
      {isSingleMode && <MobileInputBar variant={themeVariant} />}
      
      </div>
    </div>
  );
}

// 块级流式渲染组件
function StreamingBlocks({
  markdown,
  progress,
  strategy,
  showDebugBounds,
}: {
  markdown: string;
  progress: number;
  strategy: 'char' | 'block';
  showDebugBounds: boolean;
}) {
  type Block = { type: 'heading' | 'list' | 'code' | 'table' | 'paragraph' | 'blockquote'; raw: string; text: string };
  const blocks: Block[] = useMemo(() => {
    const lines = markdown.split('\n');
    const res: Block[] = [];
    let i = 0;
    const flushParagraph = (buf: string[]) => {
      if (!buf.length) return;
      const raw = buf.join('\n');
      res.push({ type: 'paragraph', raw, text: raw });
      buf.length = 0;
    };
    let paragraphBuf: string[] = [];

    while (i < lines.length) {
      const line = lines[i];
      // fenced code
      if (/^```/.test(line)) {
        flushParagraph(paragraphBuf);
        const start = i;
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) i++;
        const end = Math.min(i, lines.length - 1);
        const raw = lines.slice(start, end + 1).join('\n');
        res.push({ type: 'code', raw, text: raw });
        i++;
        continue;
      }
      // table block
      if (line.includes('|')) {
        flushParagraph(paragraphBuf);
        const start = i;
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) i++;
        const raw = lines.slice(start, i).join('\n');
        res.push({ type: 'table', raw, text: raw });
        continue;
      }
      // list block
      if (/^\s*([*\-+]\s+|\d+\.\s+)/.test(line)) {
        flushParagraph(paragraphBuf);
        const start = i;
        while (i < lines.length && /^\s*([*\-+]\s+|\d+\.\s+)/.test(lines[i])) i++;
        const raw = lines.slice(start, i).join('\n');
        res.push({ type: 'list', raw, text: raw });
        continue;
      }
      // heading
      if (/^#{1,6}\s+/.test(line)) {
        flushParagraph(paragraphBuf);
        res.push({ type: 'heading', raw: line, text: line });
        i++;
        continue;
      }
      // blockquote
      if (/^>\s+/.test(line)) {
        flushParagraph(paragraphBuf);
        const start = i;
        while (i < lines.length && /^>\s+/.test(lines[i])) i++;
        const raw = lines.slice(start, i).join('\n');
        res.push({ type: 'blockquote', raw, text: raw });
        continue;
      }
      // empty line
      if (!line.trim()) {
        flushParagraph(paragraphBuf);
        i++;
        continue;
      }
      paragraphBuf.push(line);
      i++;
    }
    flushParagraph(paragraphBuf);
    return res;
  }, [markdown]);

  // 字符模式直接按照可见字符数推进

  const out: React.ReactNode[] = [];
  let consumed = 0;
  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b];
    const len = block.text.length;
    const fullyVisible = consumed + len <= progress;
    const remaining = Math.max(0, progress - consumed);

    if (block.type === 'code') {
      if (fullyVisible) {
        out.push(
          <ReactMarkdown key={`b-${b}`} remarkPlugins={[remarkGfm]}>
{block.raw}
          </ReactMarkdown>
        );
      } else {
        out.push(
          <div key={`b-${b}-code-skeleton`} className="mb-4">
            <div className="animate-pulse rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="h-3 bg-gray-200 rounded w-11/12 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-4/5 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/5" />
            </div>
          </div>
        );
      }
      consumed += len;
      continue;
    }

    if (block.type === 'table') {
      if (fullyVisible) {
        out.push(
          <ReactMarkdown key={`b-${b}`} remarkPlugins={[remarkGfm]}>
{block.raw}
          </ReactMarkdown>
        );
      } else {
        out.push(
          <div key={`b-${b}-table-skeleton`} className="overflow-x-auto mb-4">
            <div className="min-w-full text-xs border border-gray-200 bg-white">
              <div className="h-8 bg-gray-100 border-b border-gray-200 animate-pulse" />
              <div className="h-6 border-b border-gray-100 animate-pulse" />
              <div className="h-6 border-b border-gray-100 animate-pulse" />
            </div>
          </div>
        );
      }
      consumed += len;
      continue;
    }

    if (fullyVisible) {
      out.push(
        <ReactMarkdown key={`b-${b}`} remarkPlugins={[remarkGfm]} components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{renderWithSkuCards(children, showDebugBounds, true)}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 mb-1.5">{renderWithSkuCards(children, showDebugBounds, true)}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mb-1.5">{renderWithSkuCards(children, showDebugBounds, true)}</h3>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-gray-900 border-b border-gray-300 border-r border-gray-200">{renderWithSkuCards(children, showDebugBounds, true)}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-gray-700 border-b border-gray-200 border-r border-gray-200">{renderWithSkuCards(children, showDebugBounds, true)}</td>,
          strong: ({ children }) => <strong className="font-semibold">{renderWithSkuCards(children, showDebugBounds, true)}</strong>,
          em: ({ children }) => <em className="italic">{renderWithSkuCards(children, showDebugBounds, true)}</em>,
        }}>
{block.raw}
        </ReactMarkdown>
      );
      consumed += len;
      continue;
    }

    // 部分可见：根据策略处理
    if (strategy === 'block') {
      // 整块模式：当前块未完成时不展示内容，展示占位
      out.push(
        <div key={`b-${b}-skeleton`} className="mb-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-10/12 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-8/12" />
          </div>
        </div>
      );
      break;
    } else {
      // 字符模式：揭示当前块的可见部分
      const visibleChars = Math.max(0, Math.min(remaining, len));
      const visibleRaw = block.raw.slice(0, visibleChars);
      out.push(
        <div key={`b-${b}-partial`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{renderWithSkuCards(children, showDebugBounds, true)}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 mb-1.5">{renderWithSkuCards(children, showDebugBounds, true)}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mb-1.5">{renderWithSkuCards(children, showDebugBounds, true)}</h3>,
            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-gray-900 border-b border-gray-300 border-r border-gray-200">{renderWithSkuCards(children, showDebugBounds, true)}</th>,
            td: ({ children }) => <td className="px-3 py-2 text-gray-700 border-b border-gray-200 border-r border-gray-200">{renderWithSkuCards(children, showDebugBounds, true)}</td>,
            strong: ({ children }) => <strong className="font-semibold">{renderWithSkuCards(children, showDebugBounds, true)}</strong>,
            em: ({ children }) => <em className="italic">{renderWithSkuCards(children, showDebugBounds, true)}</em>,
          }}>
{visibleRaw}
          </ReactMarkdown>
          {/* 闪烁光标 */}
          <span className="typing-caret" aria-hidden="true" />
          {/* 渐隐遮罩，避免暴露未完成内容 */}
          <div className="reveal-mask"><div className="reveal-fade" /></div>
        </div>
      );
      break; // 仅渲染到当前块
    }
  }

  return <>{out}</>;
}

# Markdown → Mobile AI Chat Preview

双语 | Bilingual (中文 / English)

—

中文简介

这是一个将 Markdown 渲染为“移动端 AI Chat”界面的高保真预览工具。它提供流式（逐字/整块）播放、三种可切换的聊天样式、紧凑的工具栏、现代系统字体栈，以及带 Liquid Glass 质感的输入栏，适合做产品稿/效果演示/截图导出。

核心特性

- 流式播放：字符/整块两种策略，慢/中/快三档速度，自动跟随滚动
- 三种风格：edge（AI 全幅沉浸）、cards（卡片信息密度）、bubble（经典气泡）
- 工具栏：样式切换置于最左，视图（单屏/全屏）与保存同列；播放工具栏独立
- 输入栏：Liquid Glass（毛玻璃）风格，主操作按钮凸显
- 字体与排版：现代系统字体栈，按风格细化字号/行高/段距
- 截图导出：基于 html-to-image 与 modern-screenshot 的 PNG 导出

快速开始

- 环境要求：Node.js 18+（推荐 20）
- 安装依赖：`npm install`
- 本地开发：`npm run dev` 打开 http://localhost:3000
- 生产构建：`npm run build`；启动预览：`npm start`

部署到 Vercel

- 新建 Vercel 项目，Framework 选择 Next.js
- Install Command: 默认或 `npm ci`
- Build Command: `next build`
- Output Directory: `.next`
- Node.js 版本：18 或 20（Project Settings → General）

使用说明

- 左侧输入 Markdown，右侧实时预览移动端聊天效果
- 顶部工具栏：
  - 最左侧“样式”切换 edge/cards/bubble
  - 同行右侧切换“单屏/全屏”、保存图片（PNG）
  - 下一行播放工具栏：字符/整块策略、速度、播放/停止
- 单屏模式下，流式播放会在接近底部时自动跟随滚动

关键文件

- `app/page.tsx`：主页面、状态与工具栏、截图逻辑
- `components/preview/MobilePreviewHTML.tsx`：移动端预览（Markdown 渲染 + 流式播放）
- `components/chat/StyleToolbar.tsx`、`components/chat/PlaybackToolbar.tsx`、`components/chat/Message.tsx`
- `components/preview/MobileInputBar.tsx`：液态玻璃输入栏
- `components/liquid/LiquidGlass.tsx` 与 `app/globals.css`：毛玻璃样式

技术栈

- Next.js 15、React 19、TypeScript 5、Tailwind CSS v4
- react-markdown、remark-gfm、html-to-image、modern-screenshot

—

English Introduction

This project turns Markdown into a high-fidelity “mobile AI chat” preview. It features streaming playback (char/block), three distinct visual styles, compact toolbars, a modern system font stack, and a liquid glass input bar—ideal for product mocks, demos, and screenshots.

Highlights

- Streaming playback: char/block strategies, slow/normal/fast speeds, auto-follow scroll
- Three styles: edge (full-bleed AI), cards (denser info), bubble (classic chat)
- Toolbars: style switch on the far left; view (single/full) + save on the same row; playback toolbar separated
- Input bar: liquid glass look with a prominent primary action
- Typography: modern system font stack with per-style tuning for size/leading/spacing
- Screenshot export: PNG via html-to-image and modern-screenshot

Quick Start

- Requirements: Node.js 18+ (20 recommended)
- Install deps: `npm install`
- Dev server: `npm run dev` then open http://localhost:3000
- Production build: `npm run build`; start: `npm start`

Deploy to Vercel

- Create a Vercel project → Framework: Next.js
- Install Command: default or `npm ci`
- Build Command: `next build`
- Output Directory: `.next`
- Node.js: 18 or 20 (Project Settings → General)

How To Use

- Enter Markdown on the left; preview renders a mobile chat on the right
- Top toolbar:
  - Far-left style switch: edge/cards/bubble
  - Same row: switch single/full view, save PNG
  - Next row playback toolbar: char/block strategy, speed, play/stop
- In single-screen mode, streaming auto-scrolls if near the bottom

Key Files

- `app/page.tsx`: main page, state, toolbars, screenshot logic
- `components/preview/MobilePreviewHTML.tsx`: mobile preview (Markdown + streaming)
- `components/chat/StyleToolbar.tsx`, `components/chat/PlaybackToolbar.tsx`, `components/chat/Message.tsx`
- `components/preview/MobileInputBar.tsx`: liquid glass input bar
- `components/liquid/LiquidGlass.tsx` + `app/globals.css`: glassmorphism styles

Stack

- Next.js 15, React 19, TypeScript 5, Tailwind CSS v4
- react-markdown, remark-gfm, html-to-image, modern-screenshot

Contributing

- Issues and PRs are welcome. See `AGENTS.md` for repo tips and conventions.

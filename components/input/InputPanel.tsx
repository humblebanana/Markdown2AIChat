'use client';

import React, { useState } from 'react';
import QueryInput from './QueryInput';
import MarkdownInput from './MarkdownInput';

interface InputPanelProps {
  queryValue: string;
  markdownValue: string;
  onQueryChange: (value: string) => void;
  onMarkdownChange: (value: string) => void;
  isProcessing?: boolean;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
}

/**
 * 输入面板容器 - 包含查询输入和Markdown输入
 * 对应原型图左侧的双输入面板布局
 */
export default function InputPanel({ 
  queryValue, 
  markdownValue, 
  onQueryChange, 
  onMarkdownChange, 
  isProcessing = false,
  showSidebar = true,
  onToggleSidebar
}: InputPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  return (
    <div className="input-panel h-full bg-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* 标题和侧边栏切换按钮 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">编辑区域</h2>
          </div>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              title="隐藏侧边栏"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* 查询输入 */}
        <QueryInput
          value={queryValue}
          onChange={onQueryChange}
          disabled={isProcessing}
        />

        {/* 快速测试（重构版） */}
        <QuickTests
          onSelect={(presetId) => setSelectedPreset(presetId)}
          selectedId={selectedPreset}
          onApply={(payload) => {
            onMarkdownChange(payload.content);
            onQueryChange(payload.title);
          }}
        />

        {/* Markdown输入 */}
        <MarkdownInput
          value={markdownValue}
          onChange={onMarkdownChange}
          disabled={isProcessing}
        />

        {/* 处理状态指示器 */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-gray-600"></div>
            <span className="ml-3 text-sm text-gray-600 font-medium">渲染中...</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 重构后的“快速测试”区块
 */
function QuickTests({
  selectedId,
  onSelect,
  onApply,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApply: (payload: { title: string; content: string }) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 预设用例集合（含远程与内置）
  const presets: Array<{
    id: string;
    title: string;
    subtitle: string;
    type: 'remote' | 'inline';
    source?: string; // remote path
    content?: string; // inline markdown
  }> = [
    {
      id: 'basic',
      title: '基础Markdown测试',
      subtitle: '标题/段落/列表/表格基础元素',
      type: 'remote',
      source: '/test-simple.md',
    },
    {
      id: 'ipad',
      title: '数字绘画二手 iPad 推荐',
      subtitle: '长文结构 + 列表/图片占位',
      type: 'remote',
      source: '/test-ipad.md',
    },
    {
      id: 'lit-review',
      title: 'RAG文献综述模板',
      subtitle: '研究问题/方法/对比/引用',
      type: 'inline',
      content: `### **文献综述：检索增强生成（RAG）技术发展与前沿探索**

**摘要：** 检索增强生成（RAG）作为一种将外部知识库与大语言模型（LLM）相结合的新范式，有效缓解了传统大模型在知识实时性、事实准确性和可解释性方面的固有缺陷。本综述旨在梳理RAG的核心概念、关键技术组成、发展脉络及其面临的主要挑战，并展望其未来研究方向。

#### **1. 引言：大语言模型的局限与RAG的兴起**

大语言模型（LLMs），如GPT系列，展现了强大的自然语言理解和生成能力。然而，它们也存在一些固有的局限：

*   **知识截断：** 模型的知识被“冻结”在其训练数据的截止日期，无法获取最新的信息。
*   **模型幻觉：** 在处理其知识边界之外或不确定的信息时，模型可能会编造看似合理但实际上是错误的内容。
*   **缺乏可追溯性：** 模型的回答过程是一个“黑箱”，用户难以验证信息的来源和准确性。

为了解决这些问题，研究人员提出了检索增强生成（RAG）框架。其核心思想是在语言模型生成答案之前，先从一个大规模的、可实时更新的知识库（如维基百科、企业内部文档、搜索引擎等）中检索相关信息片段，然后将这些信息作为上下文提供给模型，引导其生成更准确、更可靠的回答。

#### **2. RAG的核心工作流程与关键组件**

一个典型的RAG系统主要包含两个阶段：**检索（Retrieval）** 和 **生成（Generation）**。

*   **数据索引（Indexing）：** 这是准备阶段。原始文档（如PDF、HTML等）被分割成更小的文本块（Chunks）。接着，通过一个编码模型（Embedding Model）将这些文本块转换为高维向量，并存储在专门的向量数据库中。这个过程使得文本内容可以被高效地进行语义相似度搜索。
*   **检索阶段（Retrieval）：** 当用户提出问题时，系统首先使用相同的编码模型将问题也转换为一个向量。然后，在向量数据库中进行相似性搜索，找出与问题向量最接近的文本块向量，这些文本块被认为是与问题最相关的信息。
*   **生成阶段（Generation）：** 检索到的相关文本块与用户的原始问题一起，被整合成一个增强的提示（Augmented Prompt）。这个提示随后被提交给大语言模型。LLM利用提供的上下文信息来生成一个内容详实、有据可依的答案。

这个流程不仅为模型提供了即时更新的知识，还因为答案基于具体的检索内容，使得事实核查和来源追溯成为可能。

#### **3. RAG技术的发展：从朴素到高级**

RAG技术正在经历一个从简单到复杂的演进过程。从最初的“朴素RAG”到引入了更多优化环节的“高级RAG”，再到具备高度灵活性的“模块化RAG”，其能力和应用场景不断扩展。

为了更直观地理解它们的区别，下表对这三个发展阶段进行了对比：

| 特性维度 | 朴素RAG (Naive RAG) | 高级RAG (Advanced RAG) | 模块化RAG (Modular RAG) |
| :--- | :--- | :--- | :--- |
| **核心流程** | 固定的“索引-检索-生成”线性流程。 | 在核心流程前后增加了优化步骤。 | 流程高度灵活，由多个可插拔模块动态组合。 |
| **检索策略** | 对用户原始查询直接进行一次性向量相似度搜索。 | 引入查询重写/扩展、文档重排序（Re-ranking）等优化手段。 | 可能进行迭代式检索、自适应检索，或融合多种检索方法。 |
| **上下文处理** | 将检索到的文本块直接拼接作为上下文。 | 对检索内容进行筛选、排序和压缩，以优化上下文窗口的利用。 | 拥有专门的记忆模块或上下文整合模块，能处理更复杂的关系。 |
| **架构** | 单体式、耦合度高。 | 准模块化，在固定流程中加入新功能。 | 完全模块化，各功能（如搜索、记忆）解耦，可自由编排。 |
| **适用场景** | 简单的问答、事实查询。 | 应对较复杂的查询，提升检索和生成的质量。 | 处理需要多步推理、多源信息整合的复杂任务，或与Agent结合。 |
| **主要缺点** | 检索质量不稳定，易受查询表述影响，上下文利用效率低。 | 系统复杂度增加，需要更多调优工作。 | 架构设计和模块协同的难度大，对系统编排能力要求高。 |

#### **4. 面临的挑战与未来展望**

尽管RAG取得了显著进展，但仍面临诸多挑战：

1.  **检索质量：** 检索的准确性是整个系统的瓶颈。“大海捞针”问题依然存在，如何精确地从海量文档中找到最相关的片段是核心难题。
2.  **上下文整合：** 如何有效处理检索到的多个、甚至可能相互矛盾的文本块，并将其无缝整合到生成过程中，是对LLM能力的一大考验。
3.  **评估体系：** 如何全面、客观地评估一个RAG系统的端到端性能，目前仍缺乏统一的标准。评估需要涵盖检索准确率、生成答案的忠实度和信息整合能力等多个维度。
4.  **成本与效率：** 维护一个大规模的向量数据库并进行实时检索需要大量的计算资源，尤其是在高并发场景下。

未来，RAG的研究将更侧重于智能化、自动化和端到端的优化。混合检索（结合关键词、语义和结构化数据）、LLM自主判断何时及如何进行检索（自适应RAG），以及将RAG与Agent智能体技术深度融合，将是值得关注的重要发展方向。

`,
    },
    {
      id: 'Strategic Report',
      title: '投资分析报告',
      subtitle: '研究问题/方法/对比/引用',
      type: 'inline',
      content: `

## 1. 交易概述

2025年9月10日，贝恩资本（Bain Capital）宣布与东阳光集团领衔的财团达成协议，以280亿元人民币（约合40亿美元）的价格出售其持有的秦淮数据集团（Chindata Group）中国区业务100%的股权。这笔交易是中国数据中心行业历史上规模最大的并购交易，也是2025年至今中国最大的跨境并购交易之一。

## 2. 投资回报分析

贝恩资本对秦淮数据的投资始于2019年，历时约6.7年，期间经历了一系列复杂的资本运作，包括初始投资、追加投资、推动上市、私有化和最终出售。我们对整个投资过程进行了详细的财务分析，估算出贝恩资本的投资回报情况如下：

### 2.1. 投资时间线与现金流

| 时间         | 事件                                       | 现金流（亿元人民币） |
|--------------|--------------------------------------------|----------------------|
| 2019年初     | 从网宿科技收购秦淮数据股份                 | -10.0                |
| 2019年       | 追加投资5.7亿美元                          | -39.9                |
| 2020年9月    | 秦淮数据纳斯达克上市，转让老股收回部分投资 | +35.0                |
| 2023年8月    | 私有化秦淮数据                             | -228.0               |
| 2025年9月    | 出售给东阳光集团                           | +280.0               |

### 2.2. 总体投资回报

- **总投资成本：** 277.9亿元人民币
- **总收益：** 315.0亿元人民币
- **净收益：** 37.1亿元人民币
- **总回报率：** 13.4%
- **投资期间：** 约6.7年
- **年化回报率：** 1.9%
- **内部收益率（IRR）：** 5.6%

### 2.3. 分阶段回报分析

- **第一阶段（2019-2020年，初始投资到IPO）：** 这一阶段贝恩资本的投资回报率为-29.9%，年化回报率为-19.2%。这主要是因为IPO时仅部分退出，回收资金尚未覆盖全部初始投资。
- **第二阶段（2023-2025年，私有化到出售）：** 这一阶段的回报率非常可观，达到了22.8%，年化回报率为10.2%。这得益于贝恩资本在私有化后对秦淮数据的整合以及在AI热潮下数据中心估值的提升。

## 3. 交易背景与投资思路

### 3.1. 投资背景

- **行业东风：** 2019年前后，中国数据中心行业进入高速发展期，云计算、大数据、人工智能等技术的快速发展带来了对数据中心需求的激增。
- **精准眼光：** 贝恩资本精准地预见到超大规模（Hyperscale）数据中心将成为市场主流，并选择了与字节跳动等头部互联网公司深度绑定的秦淮数据作为投资标的。

### 3.2. 投资思路

- **深度赋能：** 贝恩资本不仅仅是财务投资者，更在秦淮数据的发展过程中扮演了重要角色，包括推动其与Bridge Data Centres合并，拓展海外业务，以及在公司治理、资本运作等方面提供支持。
- **灵活退出：** 贝恩资本在整个投资周期中展现了灵活的退出策略。先是通过IPO实现部分退出，降低风险；在市场变化后，果断进行私有化，以期获得更高回报；最终在AI浪潮推高数据中心估值的时机，成功将资产出售给产业资本，实现了投资收益的最大化。

## 4. 总结

贝恩资本对秦淮数据集团的投资是一次教科书式的私募股权投资案例。从精准的行业判断、深度的投后管理，到灵活的退出策略，都体现了其作为全球顶级投资机构的专业能力。虽然整体回报率在数字上并非惊人，但考虑到投资期间全球经济的波动以及复杂的资本运作过程，这次交易无疑是一次非常成功的投资。


`,
    }
    
  ];

  const handleClick = async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    onSelect(presetId);

    try {
      setLoadingId(presetId);
      if (preset.type === 'remote' && preset.source) {
        const res = await fetch(preset.source);
        const text = await res.text();
        onApply({ title: preset.title, content: text });
      } else if (preset.type === 'inline' && preset.content) {
        onApply({ title: preset.title, content: preset.content });
      }
    } catch (e) {
      console.error('加载测试预设失败:', e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">快速测试</span>
        <button
          onClick={() => onApply({ title: '空白文档', content: '' })}
          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition"
          title="清空输入"
        >
          清空
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => {
          const active = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleClick(p.id)}
              aria-pressed={active}
              className={`flex items-center justify-between px-3 py-2 text-[13px] rounded-md border min-h-[40px] transition-colors duration-150 select-none ${
                active
                  ? 'border-gray-300 bg-gray-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300'
              }`}
              title={p.subtitle || p.title}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] text-gray-700 border border-gray-200 flex-shrink-0">
                  {p.type === 'remote' ? 'R' : 'I'}
                </span>
                <span className="truncate">{p.title}</span>
              </span>
              {loadingId === p.id ? (
                <span className="inline-block w-3 h-3 ml-2 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
              ) : active ? (
                <svg className="w-4 h-4 text-gray-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

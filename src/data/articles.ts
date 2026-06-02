/**
 * 文章数据中心 — 添加新文章只需在这里加一条。
 *
 * 每个字段说明：
 *   id           自增数字，唯一
 *   slug         URL 短名，英文，例如 /read/my-post
 *   title        文章标题（支持中文）
 *   author       作者
 *   description  卡片上显示的摘要
 *   tags         标签数组，archive 页面自动生成筛选
 *   pageCount    PDF 页数
 *   fileSize     文件大小，如 "256 KB"
 *   pdfUrl       PDF 路径，相对于 public/，如 "/pdfs/文章名.pdf"
 *   thumbnailUrl 封面图，用 PDF 第一页自动生成，填同 pdfUrl 即可
 *   date         发布日期 YYYY-MM-DD
 *   readingTime  预估阅读时间，如 "15 min"
 *   language     语言
 *   format       格式，填 "PDF"
 *   content      可选，全文内容（用于搜索）
 *
 * 添加步骤：
 *   1. 把 PDF 放到 public/pdfs/
 *   2. 在下面 articles 数组追加一条
 */

import type { Post } from '@/types';

export const articles: Post[] = [
  {
    id: '1',
    slug: 'power-periodicity',
    title: '关系的幂次周期性',
    author: 'X12101X',
    description: '关于关系幂次周期性的数学探讨。',
    tags: ['Research', 'Mathematics'],
    pageCount: 0,
    fileSize: '136 KB',
    pdfUrl: '/pdfs/关系的幂次周期性-3.pdf',
    thumbnailUrl: '/pdfs/关系的幂次周期性-3.pdf',
    date: '2025-05-30',
    readingTime: '10 min',
    language: 'Chinese',
    format: 'PDF',
    content: '关系的幂次周期性研究。',
  },
  {
    id: '2',
    slug: 'Linear Algebra Done Right, fourth edition',
    title: '线性代数应该这样学',
    author: 'Sheldon Axler',
    description: '《线性代数应该这样学》原书译本。(文件较大，建议下载后查看)',
    tags: ['Mathematics'],
    pageCount: 341,
    fileSize: '136 KB',
    pdfUrl: '/pdfs/LADR4eChinese.pdf',
    thumbnailUrl: '/pdfs/LADR4eChinese.pdf',
    date: '1994-1-1',
    readingTime: 'infinity',
    language: 'Chinese',
    format: 'PDF',
    content: '线性代数应该这样学。',
  },

];

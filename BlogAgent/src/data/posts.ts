import { articles } from './articles';
import type { Post, TagCount } from '@/types';

// Re-export as mockPosts for backward compatibility
export const mockPosts: Post[] = articles;

export function getAllTags(): TagCount[] {
  const tagMap = new Map<string, number>();
  articles.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostBySlug(slug: string): Post | undefined {
  return articles.find((p) => p.slug === slug);
}

export function getPostsByTag(tag: string): Post[] {
  if (tag === 'All') return articles;
  return articles.filter((p) => p.tags.includes(tag));
}

export function sortPosts(posts: Post[], sort: string): Post[] {
  const sorted = [...posts];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case 'pages':
      return sorted.sort((a, b) => b.pageCount - a.pageCount);
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

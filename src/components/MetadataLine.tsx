import { FileText, Clock, Eye, Calendar } from 'lucide-react';
import type { Post } from '@/types';

interface MetadataLineProps {
  post: Post;
}

export default function MetadataLine({ post }: MetadataLineProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1" style={{ color: 'var(--indigo)' }}>
      <span className="flex items-center gap-1 text-[13px]">
        <FileText size={14} />
        {post.pageCount} pages
      </span>
      <span>·</span>
      <span className="flex items-center gap-1 text-[13px]">
        <Clock size={14} />
        {post.readingTime}
      </span>
      <span>·</span>
      <span className="flex items-center gap-1 text-[13px]">
        <Eye size={14} />
        {post.fileSize}
      </span>
      <span>·</span>
      <span className="flex items-center gap-1 text-[13px]">
        <Calendar size={14} />
        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </span>
    </div>
  );
}

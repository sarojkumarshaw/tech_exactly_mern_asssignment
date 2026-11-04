import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, MessageSquare, Tag } from 'lucide-react';

export const PostCard = ({ post }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800';

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover Image & Category Pill */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <img
            src={post.coverImage || defaultImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
              {post.category || 'Article'}
            </span>
            {post.isDeleted && (
              <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                Soft Deleted
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <Link to={`/posts/${post.slug}`}>
            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">
            {post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 140) + '...'}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Author & Footer Meta */}
      <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              {post.author?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {post.author?.name || 'Dev Author'}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.viewsCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {post.commentsCount ?? 0}
          </span>
        </div>
      </div>
    </article>
  );
};


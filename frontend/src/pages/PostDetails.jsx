import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CommentSection } from '../components/CommentSection';
import {
  Calendar,
  Clock,
  Eye,
  Tag,
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Share2
} from 'lucide-react';

export const PostDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts/${slug}`);
        setPost(res.data.data);
      } catch (err) {
        showToast(err.response?.data?.error?.message || 'Article not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate, showToast]);

  const isAuthor = user && post && (user._id === post.author?._id || user.id === post.author?._id);
  const canModify = isAuthor || isAdmin;

  const handleSoftDelete = async () => {
    if (!window.confirm('Are you sure you want to soft delete this article?')) return;

    setActionLoading(true);
    try {
      await api.delete(`/posts/${post._id}`);
      showToast('Article moved to archive (soft deleted)', 'warning');
      setPost((prev) => ({ ...prev, isDeleted: true }));
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete article', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/posts/${post._id}/restore`);
      showToast('Article restored successfully!', 'success');
      setPost((prev) => ({ ...prev, isDeleted: false }));
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to restore article', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Article link copied to clipboard!', 'info');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-12 bg-slate-200 rounded w-full"></div>
          <div className="aspect-[16/9] bg-slate-200 rounded-3xl"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button & Controls */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to articles
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>

          {canModify && (
            <>
              <Link
                to={`/edit-post/${post._id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/80 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Link>

              {post.isDeleted ? (
                <button
                  onClick={handleRestore}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore Post
                </button>
              ) : (
                <button
                  onClick={handleSoftDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Soft Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Soft Delete Banner Alert */}
      {post.isDeleted && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Article is Soft Deleted
              </h4>
              <p className="text-xs text-amber-700">
                This post is hidden from the public feed. You have access because you are an admin or the author.
              </p>
            </div>
          </div>
          <button
            onClick={handleRestore}
            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700"
          >
            Restore Now
          </button>
        </div>
      )}

      {/* Category Pill */}
      <div className="mb-4">
        <span className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
          {post.category || 'General'}
        </span>
      </div>

      {/* Article Title */}
      <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
        {post.title}
      </h1>

      {/* Author & Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/20"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
              {post.author?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {post.author?.name || 'Dev Author'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase">
                {post.author?.role || 'Author'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.max(1, Math.ceil((post.content?.split(' ').length || 0) / 200))} min read
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-slate-400" />
            {post.viewsCount || 0} views
          </span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-mono text-[11px]">
            /{post.slug}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-10 rounded-3xl overflow-hidden aspect-[16/9] shadow-xl border border-slate-200">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base sm:text-lg whitespace-pre-line font-normal space-y-4">
        {post.content}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Related Tags:
          </span>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Live Comments Discussion */}
      <CommentSection postId={post._id} />
    </article>
  );
};

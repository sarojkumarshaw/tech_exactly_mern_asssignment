import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  Check,
  X,
  CornerDownRight,
  AlertCircle
} from 'lucide-react';

export const CommentSection = ({ postId }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { socket, showToast } = useNotification();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/post/${postId}`);
        setComments(res.data.data);
      } catch (err) {
        showToast(err.response?.data?.error?.message || 'Failed to load comments', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, showToast]);

  // Join post room for real-time live comments
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_post', postId);

    const handleNewComment = (comment) => {
      setComments((prev) => {
        // Prevent duplicate if sent by self
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [comment, ...prev];
      });
    };

    const handleDeleteComment = ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    };

    socket.on('new_comment', handleNewComment);
    socket.on('delete_comment', handleDeleteComment);

    return () => {
      socket.emit('leave_post', postId);
      socket.off('new_comment', handleNewComment);
      socket.off('delete_comment', handleDeleteComment);
    };
  }, [socket, postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/comments/post/${postId}`, {
        content: newComment.trim()
      });

      const created = res.data.data;
      // Optimistic/immediate add if socket hasn't delivered yet
      setComments((prev) => {
        if (prev.some((c) => c._id === created._id)) return prev;
        return [created, ...prev];
      });

      setNewComment('');
      showToast('Comment posted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await api.put(`/comments/${commentId}`, {
        content: editContent.trim()
      });

      const updated = res.data.data;
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: updated.content, isEdited: true } : c))
      );
      setEditingId(null);
      showToast('Comment updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update comment', 'error');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast('Comment removed', 'success');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div className="mt-14 pt-10 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Discussion ({comments.length})
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Real-time
        </span>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the discussion... Share your thoughts, questions, or insights."
              className="w-full bg-transparent resize-none outline-none text-slate-800 placeholder-slate-400 text-sm"
            />
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 mt-2">
              <span className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-700">{user.name}</strong>
              </span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            <p className="text-sm font-medium text-slate-700">
              Sign in to join the conversation and leave a comment.
            </p>
          </div>
          <a
            href="/login"
            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 shadow-sm"
          >
            Log In
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Loading discussion...</div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-400 font-medium">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isAuthor = user && (user._id === comment.author?._id || user.id === comment.author?._id);
            const canManage = isAuthor || isAdmin;
            const isEditing = editingId === comment._id;

            return (
              <div
                key={comment._id}
                className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {comment.author?.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {comment.author?.name || 'Anonymous User'}
                        </span>
                        {comment.author?.role === 'admin' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                        {comment.isEdited && <span className="text-slate-400 italic">(edited)</span>}
                      </div>
                    </div>
                  </div>

                  {canManage && !isEditing && (
                    <div className="flex items-center gap-1">
                      {isAuthor && (
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Comment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title={isAdmin ? 'Delete as Admin' : 'Delete Comment'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment Body / Edit Form */}
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={2}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed pl-11">
                    {comment.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

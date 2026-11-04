import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Pagination } from '../components/Pagination';
import {
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MyPosts = () => {
  const { showToast } = useNotification();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/my-posts', {
        params: { page: currentPage, limit: 8, includeDeleted: 'true' }
      });
      setPosts(res.data.data);
      setPagination(res.data.meta);
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to fetch your posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [currentPage]);

  const handleSoftDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to soft delete this post?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      showToast('Post soft deleted', 'warning');
      fetchMyPosts();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete post', 'error');
    }
  };

  const handleRestore = async (postId) => {
    try {
      await api.patch(`/posts/${postId}/restore`);
      showToast('Post restored successfully!', 'success');
      fetchMyPosts();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to restore post', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-600" />
            My Published Articles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal articles, edit content, and recover archived/soft-deleted posts.
          </p>
        </div>

        <Link
          to="/create-post"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Article
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading your articles...</div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">You haven't written any articles yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            Share your knowledge with the software engineering community today!
          </p>
          <Link
            to="/create-post"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-md"
          >
            Start Writing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Article</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Published Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 max-w-xs sm:max-w-md">
                      <Link
                        to={`/posts/${post.slug}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400">
                        /{post.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                        {post.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {post.isDeleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          Soft Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Published
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/posts/${post.slug}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Article"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/edit-post/${post._id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {post.isDeleted ? (
                          <button
                            onClick={() => handleRestore(post._id)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Restore Article"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSoftDelete(post._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Soft Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              pagination={pagination}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { Pagination } from '../components/Pagination';
import {
  Search,
  Sparkles,
  BookOpen,
  Layers,
  Shield,
  Radio,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Engineering', 'Database', 'WebSockets', 'Architecture', 'General'];

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 6
        };
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        const res = await api.get('/posts', { params });
        setPosts(res.data.data);
        setPagination(res.data.meta);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, selectedCategory, debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header with Tech Exactly Branding */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 md:p-14 overflow-hidden shadow-2xl mb-8 border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.25),transparent_50%)]" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 backdrop-blur-md rounded-full text-blue-300 text-xs font-bold mb-5 border border-blue-400/20 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Tech Exactly • Full-Stack MERN Assignment
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
            Precision Software Engineering <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Architecture</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed max-w-2xl">
            A production-grade blog ecosystem featuring <strong>Role-Based Access Control (RBAC)</strong>, <strong>Dual-Token JWT Security</strong>, <strong>Soft Deletes with Recovery</strong>, <strong>Winston Error &amp; DB Logging</strong>, and <strong>Live Socket.io Notifications</strong>.
          </p>

          {/* Search Bar */}
          <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/30 transition-all text-slate-800 max-w-xl">
            <Search className="w-5 h-5 text-slate-300 focus-within:text-blue-600 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, keywords or topic..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Ticker / Spec Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800">RBAC Security</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Admin vs User</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800">Dual JWT Tokens</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">15m Acc + 7d Ref</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
            <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800">Socket.io Push</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Live Events</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800">Soft Deletes</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Admin Recovery</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800">OAuth 2.0</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Passport + Google</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
          <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800">Clean Arch</div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Winston Logging</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
          <Layers className="w-4 h-4" />
          Topics:
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          {selectedCategory === 'All' ? 'Latest Publications' : `${selectedCategory} Articles`}
        </h2>
        {pagination && (
          <span className="text-xs font-semibold text-slate-500">
            Showing {posts.length} of {pagination.totalDocs} articles
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="aspect-[16/9] bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No articles found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No articles matching "${searchQuery}". Try a different search term.`
              : 'There are no published articles in this category yet.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </div>
  );
};

export default Home;

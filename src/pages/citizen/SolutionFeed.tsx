import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ExternalLink, 
  Tag, 
  MapPin, 
  Trash2, 
  Send, 
  Layers,
  Search,
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface Solution {
  _id: string;
  developer: {
    _id: string;
    name: string;
    region?: string;
  };
  title: string;
  description: string;
  techStack: string[];
  targetCategory: string;
  repoUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  vouchCount: number;
  commentCount: number;
  shareCount: number;
  status: 'submitted' | 'under_review' | 'matched' | 'deployed';
  vouched: boolean;
  createdAt: string;
}

interface Comment {
  _id: string;
  solution: string;
  user: {
    _id: string;
    name: string;
    role: string;
  };
  text: string;
  createdAt: string;
}

// Sub-component to manage comment threads efficiently
const CommentThread: React.FC<{ 
  solutionId: string; 
  user: any; 
  onCommentCountChange: (newCount: number) => void; 
}> = ({ solutionId, user, onCommentCountChange }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/api/solutions/${solutionId}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
        onCommentCountChange(response.data.comments.length);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [solutionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await axiosClient.post(`/api/solutions/${solutionId}/comments`, {
        text: newComment
      });
      if (response.data.success) {
        toast.success('Comment posted successfully!');
        setNewComment('');
        // Re-fetch comments
        fetchComments();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to post comment.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await axiosClient.delete(`/api/comments/${commentId}`);
      if (response.data.success) {
        toast.success('Comment deleted.');
        // Re-fetch comments
        fetchComments();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete comment.';
      toast.error(msg);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">Discussion Forum</h4>

      {/* Comment Form */}
      {(user?.role === 'citizen' || user?.role === 'developer') ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            type="text"
            placeholder="Type your feedback or comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 rounded-xl px-4 flex items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <p className="text-[10px] text-slate-500 italic">Evaluating Member of Parliament cannot write comments.</p>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-center">
          <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-500 py-1">No feedback has been logged yet. Be the first to express support!</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const commentAuthorId = typeof comment.user === 'object' ? comment.user._id : comment.user;
            const isAuthor = commentAuthorId === user?.id || commentAuthorId?._id === user?.id;
            return (
              <div key={comment._id} className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex justify-between items-start hover:border-slate-800 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-slate-200">{comment.user?.name || 'Anonymous User'}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-1.5 py-0.2 text-slate-500 rounded">
                      {comment.user?.role}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{comment.text}</p>
                </div>

                {isAuthor && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-slate-600 hover:text-rose-400 p-1.5 bg-transparent hover:bg-rose-500/10 rounded-lg transition-all border border-transparent cursor-pointer"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SolutionFeed: React.FC = () => {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');

  // Track expanded comments per solution ID
  const [expandedSolutions, setExpandedSolutions] = useState<{ [id: string]: boolean }>({});

  const categories = ['water', 'road', 'electricity', 'sanitation', 'health', 'education', 'other'];

  const fetchFeed = async (resetPage = false) => {
    try {
      const targetPage = resetPage ? 1 : page;
      if (resetPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (region) params.append('region', region);
      params.append('page', targetPage.toString());
      params.append('limit', '5');

      const response = await axiosClient.get(`/api/feed/solutions?${params.toString()}`);
      if (response.data.success) {
        if (resetPage) {
          setSolutions(response.data.solutions);
        } else {
          setSolutions(prev => {
            // Filter duplicates if any
            const existingIds = new Set(prev.map(s => s._id));
            const news = response.data.solutions.filter((s: Solution) => !existingIds.has(s._id));
            return [...prev, ...news];
          });
        }
        setHasMore(response.data.hasMore);
      }
    } catch (err) {
      console.error('Failed to load solutions feed:', err);
      toast.error('Failed to retrieve solution feeds.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchFeed(true);
  }, [category, region]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Directly fetch for nextPage
    setTimeout(() => {
      fetchFeed(false);
    }, 50);
  };

  useEffect(() => {
    if (page > 1) {
      fetchFeed(false);
    }
  }, [page]);

  const handleVouchToggle = async (id: string) => {
    // Check evaluator role block
    if (user?.role === 'mp') {
      toast.error('MPs are evaluators and cannot vouch.');
      return;
    }

    // Optimistic UI updates
    setSolutions(prev => prev.map(s => {
      if (s._id === id) {
        const currentlyVouched = s.vouched;
        return {
          ...s,
          vouched: !currentlyVouched,
          vouchCount: currentlyVouched ? Math.max(0, s.vouchCount - 1) : s.vouchCount + 1
        };
      }
      return s;
    }));

    try {
      const response = await axiosClient.post(`/api/solutions/${id}/vouch`);
      if (response.data.success) {
        const actVouched = response.data.vouched;
        // Re-sync with final server status to be extremely bulletproof
        setSolutions(prev => prev.map(s => {
          if (s._id === id) {
            return {
              ...s,
              vouched: actVouched,
              vouchCount: response.data.solution.vouchCount
            };
          }
          return s;
        }));
        toast.success(actVouched ? 'Vouched successfully!' : 'Vouch removed.');
      }
    } catch (err: any) {
      // Revert optimistic change on failure
      fetchFeed(true);
      const msg = err.response?.data?.message || 'Vouching failed.';
      toast.error(msg);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const response = await axiosClient.post(`/api/solutions/${id}/share`);
      if (response.data.success) {
        // Increment share count in UI
        setSolutions(prev => prev.map(s => {
          if (s._id === id) {
            return { ...s, shareCount: response.data.shareCount };
          }
          return s;
        }));

        // Copy link to clipboard
        navigator.clipboard.writeText(response.data.shareableLink);
        toast.success('Shareable link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share tracking failure', err);
      toast.error('Failed to register share event.');
    }
  };

  const toggleComments = (id: string) => {
    setExpandedSolutions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const updateCardCommentCount = (id: string, newCount: number) => {
    setSolutions(prev => prev.map(s => {
      if (s._id === id) {
        return { ...s, commentCount: newCount };
      }
      return s;
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      case 'matched':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';
      case 'under_review':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 text-white" id="solutions-feed-page">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-teal-400 animate-pulse" />
                <span className="text-teal-400 text-xs font-extrabold uppercase tracking-widest">Social Feed Layer</span>
              </div>
              <h1 className="text-2xl font-black mt-1 text-slate-100 uppercase tracking-tight">Community Solutions Feed</h1>
              <p className="text-slate-400 text-sm mt-1">
                Explore tech prototypes built by developers to address real citizen challenges. Log feedback and vouch to support them.
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-slate-950/50 border border-slate-800 p-3 rounded-xl">
              <div className="text-center px-4">
                <span className="block text-lg font-black text-teal-400">{solutions.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Listed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center space-x-2 shrink-0 text-slate-400">
            <Search className="w-4 h-4 text-teal-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Refine Feed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
            </div>

            {/* Region Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Developer Region..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-teal-500"
              />
              <div className="absolute right-3.5 top-3 pointer-events-none text-slate-500 text-xs">📍</div>
            </div>
          </div>
        </div>

        {/* Solutions List */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 font-medium text-xs mt-3.5 uppercase tracking-wider">Fetching solutions archive...</p>
          </div>
        ) : solutions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl space-y-3">
            <Layers className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-slate-300 text-sm font-semibold">No solutions matched your active criteria.</p>
            <p className="text-slate-500 text-xs">Try clearing filters or check back later for new developer submissions.</p>
          </div>
        ) : (
          <div className="space-y-6" id="solutions-feed-container">
            {solutions.map((sol) => (
              <div 
                key={sol._id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 hover:border-slate-700 transition-all relative overflow-hidden"
              >
                {/* Deployed Badge Watermark/Top bar */}
                {sol.status === 'deployed' && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Deployed</span>
                  </div>
                )}

                {/* Developer Profile Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-bold">Created by</span>
                      <span className="text-sm font-black text-slate-100">{sol.developer?.name || 'Anonymous Developer'}</span>
                    </div>
                    {sol.developer?.region && (
                      <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-bold">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        <span>{sol.developer.region}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 mr-12 sm:mr-0">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-slate-400 px-2 py-0.5 border border-slate-800 rounded">
                      {sol.targetCategory}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${getStatusBadgeColor(sol.status)}`}>
                      {sol.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-teal-400 tracking-tight">{sol.title}</h3>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">{sol.description}</p>
                </div>

                {/* Tech Stack Tags */}
                {sol.techStack && sol.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sol.techStack.map((tech, idx) => (
                      <span 
                        key={idx} 
                        className="text-[9px] font-extrabold font-mono uppercase tracking-wider bg-slate-950 text-slate-400 border border-slate-800/80 px-2 py-0.5 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* External Resource Links */}
                {(sol.repoUrl || sol.demoUrl || sol.docsUrl) && (
                  <div className="flex flex-wrap gap-4 text-xs font-bold pt-1">
                    {sol.repoUrl && (
                      <a 
                        href={sol.repoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-400 hover:text-teal-400 flex items-center space-x-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}
                    {sol.demoUrl && (
                      <a 
                        href={sol.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-400 hover:text-teal-400 flex items-center space-x-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {sol.docsUrl && (
                      <a 
                        href={sol.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-400 hover:text-teal-400 flex items-center space-x-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Documentation</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="h-px bg-slate-800/60 my-2"></div>

                {/* Card Action Controls: Vouch, Comment, Share */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <div className="flex items-center space-x-5">
                    {/* Vouch Toggle Button */}
                    <button
                      onClick={() => handleVouchToggle(sol._id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        sol.vouched 
                          ? 'text-rose-400 bg-rose-950/20 border-rose-900/30' 
                          : 'hover:text-rose-400 bg-transparent border-transparent'
                      }`}
                      title={sol.vouched ? 'Remove Vouch' : 'Vouch for this Solution'}
                    >
                      <Heart className={`w-4 h-4 transition-transform active:scale-125 ${sol.vouched ? 'fill-rose-400 text-rose-400' : ''}`} />
                      <span>{sol.vouchCount || 0} Support</span>
                    </button>

                    {/* Toggle Comments Button */}
                    <button
                      onClick={() => toggleComments(sol._id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        expandedSolutions[sol._id]
                          ? 'text-teal-400 bg-teal-950/20 border-teal-900/30'
                          : 'hover:text-teal-400 bg-transparent border-transparent'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{sol.commentCount || 0} Feedback</span>
                    </button>
                  </div>

                  {/* Share Tracking Link Copy */}
                  <button
                    onClick={() => handleShare(sol._id)}
                    className="flex items-center space-x-1.5 hover:text-teal-400 px-3 py-1.5 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-950 transition-all cursor-pointer"
                    title="Copy Shareable Link"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{sol.shareCount || 0} Shares</span>
                  </button>
                </div>

                {/* Discussion Thread Drawer */}
                {expandedSolutions[sol._id] && (
                  <CommentThread 
                    solutionId={sol._id} 
                    user={user} 
                    onCommentCountChange={(newCount) => updateCardCommentCount(sol._id, newCount)} 
                  />
                )}

              </div>
            ))}
          </div>
        )}

        {/* Load More Pagination Trigger */}
        {hasMore && (
          <div className="text-center pt-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-slate-900 border border-slate-850 hover:border-teal-500 text-teal-400 hover:text-teal-300 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-teal-500/5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? 'Loading Feeds...' : 'Retrieve More Solutions'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

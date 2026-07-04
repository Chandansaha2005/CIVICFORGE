import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ExternalLink, 
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
    <div className="mt-4 pt-4 border-t border-[#E5DEC9]/60 space-y-4 animate-fade-in">
      <h4 className="text-xs font-black uppercase tracking-wider text-[#3F6C51]">Discussion Forum</h4>

      {/* Comment Form */}
      {(user?.role === 'citizen' || user?.role === 'developer') ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            type="text"
            placeholder="Type your feedback or comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            className="flex-1 neumorphic-concave px-4 py-2.5 text-xs text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-[#3F6C51] hover:bg-[#2d4d3a] disabled:bg-slate-300 text-white disabled:text-slate-500 rounded-xl px-4 flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-[3px_3px_6px_rgba(63,108,81,0.2),-3px_-3px_6px_#FFFFFF]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <p className="text-[10px] text-[#9A8C7F] font-bold italic">Evaluating Member of Parliament cannot write comments.</p>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-center">
          <div className="w-4 h-4 border-2 border-[#3F6C51] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-[#9A8C7F] font-bold py-1">No feedback has been logged yet. Be the first to express support!</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const commentAuthorId = typeof comment.user === 'object' ? comment.user._id : comment.user;
            const isAuthor = commentAuthorId === user?.id || commentAuthorId?._id === user?.id;
            return (
              <div key={comment._id} className="bg-[#FAF6ED] border border-[#E5DEC9]/40 rounded-2xl p-3 flex justify-between items-start hover:border-[#E5DEC9]/80 transition-all shadow-[inset_1px_1px_3px_rgba(142,130,114,0.06)]">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-[#3A2E2B]">{comment.user?.name || 'Anonymous User'}</span>
                    <span className="text-[8px] font-black uppercase tracking-wider bg-[#FFFDF9] border border-[#E5DEC9]/40 px-1.5 py-0.2 text-[#9A8C7F] rounded">
                      {comment.user?.role}
                    </span>
                    <span className="text-[10px] text-[#9A8C7F] font-bold">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#3A2E2B] font-bold leading-relaxed">{comment.text}</p>
                </div>

                {isAuthor && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-[#9A8C7F] hover:text-[#E76F51] p-1.5 bg-[#FFFDF9] border border-white/40 shadow-[2px_2px_4px_rgba(142,130,114,0.08),-2px_-2px_4px_#FFFFFF] rounded-xl transition-all cursor-pointer"
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
        return 'bg-[#FAF6ED] text-emerald-600 border border-emerald-500/25 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.1)]';
      case 'matched':
        return 'bg-[#FAF6ED] text-[#3F6C51] border border-[#3F6C51]/25 shadow-[inset_1px_1px_3px_rgba(63,108,81,0.1)]';
      case 'under_review':
        return 'bg-[#FAF6ED] text-amber-600 border border-amber-500/25 shadow-[inset_1px_1px_3px_rgba(217,119,6,0.1)]';
      default:
        return 'bg-[#FAF6ED] text-[#9A8C7F] border border-[#E5DEC9]/50';
    }
  };

  return (
    <div className="bg-[#FAF6ED] min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 text-[#3A2E2B]" id="solutions-feed-page">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Hero Banner */}
        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-white/40 shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] relative overflow-hidden animate-fade-in">
          <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#3F6C51] animate-pulse" />
                <span className="text-[#3F6C51] text-xs font-black uppercase tracking-widest">Social Feed Layer</span>
              </div>
              <h1 className="text-2xl font-black mt-1 text-[#3A2E2B] uppercase tracking-tight">Community Solutions Feed</h1>
              <p className="text-[#9A8C7F] text-xs mt-1 font-bold">
                Explore tech prototypes built by developers to address real citizen challenges. Log feedback and vouch to support them.
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-[#FAF6ED] border border-white/40 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)] p-3 rounded-2xl">
              <div className="text-center px-4">
                <span className="block text-lg font-black text-[#3F6C51]">{solutions.length}</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Listed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF] animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center space-x-2 shrink-0 text-[#9A8C7F]">
            <Search className="w-4 h-4 text-[#3F6C51]" />
            <span className="text-xs font-black uppercase tracking-wider">Refine Feed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full neumorphic-concave px-4 py-2.5 text-xs font-bold text-[#3A2E2B] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-[#9A8C7F] text-[10px]">▼</div>
            </div>

            {/* Region Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Developer Region..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full neumorphic-concave px-4 py-2.5 text-xs font-bold text-[#3A2E2B] focus:outline-none placeholder-[#9A8C7F]/60"
              />
              <div className="absolute right-3.5 top-3 pointer-events-none text-[#9A8C7F] text-xs">📍</div>
            </div>
          </div>
        </div>

        {/* Solutions List */}
        {loading ? (
          <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-16 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]">
            <div className="w-8 h-8 border-3 border-[#3F6C51] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[#9A8C7F] font-black text-xs mt-3.5 uppercase tracking-wider">Fetching solutions archive...</p>
          </div>
        ) : solutions.length === 0 ? (
          <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-16 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-3 animate-fade-in">
            <Layers className="w-10 h-10 text-[#9A8C7F] mx-auto" />
            <p className="text-[#3A2E2B] text-sm font-black">No solutions matched your active criteria.</p>
            <p className="text-[#9A8C7F] text-xs font-bold">Try clearing filters or check back later for new developer submissions.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '150ms' }} id="solutions-feed-container">
            {solutions.map((sol) => (
              <div 
                key={sol._id} 
                className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-6 shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-4 hover:bg-[#FFFDF9]/95 transition-all duration-300 relative overflow-hidden"
              >
                {/* Deployed Badge Watermark/Top bar */}
                {sol.status === 'deployed' && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Deployed</span>
                  </div>
                )}

                {/* Developer Profile Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#9A8C7F] font-bold">Created by</span>
                      <span className="text-sm font-black text-[#3A2E2B]">{sol.developer?.name || 'Anonymous Developer'}</span>
                    </div>
                    {sol.developer?.region && (
                      <div className="flex items-center space-x-1 text-[10px] text-[#9A8C7F] font-bold">
                        <MapPin className="w-3 h-3 text-[#E76F51]" />
                        <span>{sol.developer.region}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 mr-12 sm:mr-0">
                    <span className="bg-[#FAF6ED] text-[#9A8C7F] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-[#E5DEC9]/60 rounded-md">
                      {sol.targetCategory}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 border rounded-full ${getStatusBadgeColor(sol.status)}`}>
                      {sol.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-[#3F6C51] tracking-tight">{sol.title}</h3>
                  <p className="text-[#3A2E2B] text-xs font-bold leading-relaxed">{sol.description}</p>
                </div>

                {/* Tech Stack Tags */}
                {sol.techStack && sol.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sol.techStack.map((tech, idx) => (
                      <span 
                        key={idx} 
                        className="text-[9px] font-black font-mono uppercase tracking-wider bg-[#FAF6ED] text-[#9A8C7F] border border-[#E5DEC9]/60 px-2 py-0.5 rounded-md"
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
                        className="text-[#9A8C7F] hover:text-[#3F6C51] flex items-center space-x-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#3F6C51]" />
                        <span>Source Code</span>
                      </a>
                    )}
                    {sol.demoUrl && (
                      <a 
                        href={sol.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#9A8C7F] hover:text-[#3F6C51] flex items-center space-x-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#3F6C51]" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {sol.docsUrl && (
                      <a 
                        href={sol.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#9A8C7F] hover:text-[#3F6C51] flex items-center space-x-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#3F6C51]" />
                        <span>Documentation</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="h-px bg-[#E5DEC9]/60 my-2"></div>

                {/* Card Action Controls: Vouch, Comment, Share */}
                <div className="flex items-center justify-between text-xs font-bold text-[#9A8C7F]">
                  <div className="flex items-center space-x-5">
                    {/* Vouch Toggle Button */}
                    <button
                      onClick={() => handleVouchToggle(sol._id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        sol.vouched 
                          ? 'text-[#E76F51] bg-[#FAF6ED] border border-white/50 shadow-[inset_2px_2px_4px_rgba(231,111,81,0.1)]' 
                          : 'bg-[#FFFDF9] border border-white/40 shadow-[3px_3px_6px_rgba(142,130,114,0.08),-3px_-3px_6px_#FFFFFF] text-[#9A8C7F] hover:text-[#E76F51]'
                      }`}
                      title={sol.vouched ? 'Remove Vouch' : 'Vouch for this Solution'}
                    >
                      <Heart className={`w-4 h-4 transition-transform active:scale-125 ${sol.vouched ? 'fill-[#E76F51] text-[#E76F51]' : ''}`} />
                      <span>{sol.vouchCount || 0} Support</span>
                    </button>

                    {/* Toggle Comments Button */}
                    <button
                      onClick={() => toggleComments(sol._id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        expandedSolutions[sol._id]
                          ? 'text-[#3F6C51] bg-[#FAF6ED] border border-white/50 shadow-[inset_2px_2px_4px_rgba(63,108,81,0.1)]'
                          : 'bg-[#FFFDF9] border border-white/40 shadow-[3px_3px_6px_rgba(142,130,114,0.08),-3px_-3px_6px_#FFFFFF] text-[#9A8C7F] hover:text-[#3F6C51]'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{sol.commentCount || 0} Feedback</span>
                    </button>
                  </div>

                  {/* Share Tracking Link Copy */}
                  <button
                    onClick={() => handleShare(sol._id)}
                    className="flex items-center space-x-1.5 bg-[#FFFDF9] border border-white/40 shadow-[3px_3px_6px_rgba(142,130,114,0.08),-3px_-3px_6px_#FFFFFF] text-[#9A8C7F] hover:text-[#3F6C51] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
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
              className="bg-[#FFFDF9] border border-white/40 hover:shadow-[inset_2px_2px_4px_rgba(142,130,114,0.1)] text-[#3F6C51] hover:text-[#2d4d3a] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_6px_rgba(142,130,114,0.08),-3px_-3px_6px_#FFFFFF] transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? 'Loading Feeds...' : 'Retrieve More Solutions'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};


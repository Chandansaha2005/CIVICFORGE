import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  Cpu, 
  Volume2, 
  Image as ImageIcon, 
  X,
  Plus,
  ArrowUpDown,
  ListFilter,
  Check,
  TrendingUp,
  Award,
  BookOpen,
  Github,
  Monitor
} from 'lucide-react';

interface Problem {
  _id: string;
  category: string;
  description: string;
  inputType: 'text' | 'photo' | 'voice';
  mediaUrl?: string;
  transcript?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  stressScore: number;
  recurrenceCount: number;
  infrastructureGapScore: number;
  urgencyScore: number;
  status: string;
  createdAt: string;
}

export const ProblemFeed: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters and Sorting
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'urgency' | 'newest'>('urgency');

  // Modal Solution Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryForSolution, setSelectedCategoryForSolution] = useState('water');
  const [selectedProblemDesc, setSelectedProblemDesc] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['water', 'road', 'electricity', 'sanitation', 'health', 'education', 'other'];

  const fetchProblems = async (resetPage = false) => {
    try {
      const targetPage = resetPage ? 1 : page;
      if (resetPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('sort', sort);
      params.append('page', targetPage.toString());
      params.append('limit', '5');

      const response = await axiosClient.get(`/api/feed/problems?${params.toString()}`);
      if (response.data.success) {
        if (resetPage) {
          setProblems(response.data.problems);
        } else {
          setProblems(prev => {
            const existingIds = new Set(prev.map(p => p._id));
            const news = response.data.problems.filter((p: Problem) => !existingIds.has(p._id));
            return [...prev, ...news];
          });
        }
        setHasMore(response.data.hasMore);
      }
    } catch (err) {
      console.error('Failed to fetch problems feed:', err);
      toast.error('Failed to load civic problems feed.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProblems(true);
  }, [category, sort]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setTimeout(() => {
      fetchProblems(false);
    }, 50);
  };

  useEffect(() => {
    if (page > 1) {
      fetchProblems(false);
    }
  }, [page]);

  const openSubmitModal = (problem: Problem) => {
    setSelectedCategoryForSolution(problem.category);
    setSelectedProblemDesc(problem.description);
    setTitle(`Prototype Solution for ${problem.category.toUpperCase()}`);
    setDescription('');
    setTechStack('');
    setRepoUrl('');
    setDemoUrl('');
    setDocsUrl('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill out the title and description.');
      return;
    }

    try {
      setSubmitting(true);
      const formattedTech = techStack
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const response = await axiosClient.post('/api/solutions', {
        title: title.trim(),
        description: description.trim(),
        techStack: formattedTech,
        targetCategory: selectedCategoryForSolution,
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        docsUrl: docsUrl.trim() || undefined
      });

      if (response.data.success) {
        toast.success('Your civic prototype solution was registered! Matchmaking link established.');
        setIsModalOpen(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit solution.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyBadgeColor = (score: number) => {
    if (score >= 70) {
      return 'bg-rose-950/40 text-rose-400 border-rose-900/30';
    } else if (score >= 40) {
      return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
    } else {
      return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
    }
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 text-white" id="problems-feed-page">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest">Developer Marketplace</span>
              </div>
              <h1 className="text-2xl font-black mt-1 text-slate-100 uppercase tracking-tight">Civic Problems & Demands Feed</h1>
              <p className="text-slate-400 text-sm mt-1">
                Browse verified and pending citizen complaints ranked by spatial urgency. Build and register targeted solution prototypes.
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-slate-950/50 border border-slate-800 p-3 rounded-xl">
              <div className="text-center px-4">
                <span className="block text-lg font-black text-emerald-400">{problems.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Listed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Sort Controllers */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-2 shrink-0 text-slate-400">
            <ListFilter className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Refine Queue</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {/* Category selection */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="">All Problem Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
            </div>

            {/* Sort Toggle */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'urgency' | 'newest')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="urgency">Sort by Urgency Score (High to Low)</option>
                <option value="newest">Sort by Submission Date (Newest First)</option>
              </select>
              <div className="absolute right-3.5 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
            </div>
          </div>
        </div>

        {/* Problems Queue */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 font-medium text-xs mt-3.5 uppercase tracking-wider">Loading verified civic demands...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-slate-300 text-sm font-semibold">No active community problems matched your search.</p>
            <p className="text-slate-500 text-xs">All citizen complaints have been matched or cleared for this category.</p>
          </div>
        ) : (
          <div className="space-y-6" id="problems-feed-container">
            {problems.map((prob) => (
              <div 
                key={prob._id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 hover:border-slate-700 transition-all relative overflow-hidden"
              >
                {/* Score badge in top corner */}
                <div className={`absolute top-0 right-0 border-b border-l rounded-bl-xl px-4 py-2 text-xs font-extrabold tracking-tight ${getUrgencyBadgeColor(prob.urgencyScore)}`}>
                  Urgency Score: {prob.urgencyScore}/100
                </div>

                {/* Top line info */}
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-slate-400 px-2 py-0.5 border border-slate-800 rounded">
                    {prob.category}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center space-x-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(prob.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                {/* Description & Transcript */}
                <div className="space-y-2 pt-1.5">
                  <p className="text-slate-200 text-sm font-semibold leading-relaxed pr-24 sm:pr-0">
                    {prob.description}
                  </p>

                  {/* Attachment voice audio */}
                  {prob.inputType === 'voice' && prob.mediaUrl && (
                    <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl space-y-2 max-w-md">
                      <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs">
                        <Volume2 className="w-4 h-4" />
                        <span>Voice Recording</span>
                      </div>
                      <audio controls src={prob.mediaUrl} className="w-full h-8" />
                      {prob.transcript && (
                        <p className="text-xs text-slate-400 italic font-medium">"Transcribed: {prob.transcript}"</p>
                      )}
                    </div>
                  )}

                  {/* Attachment image */}
                  {prob.inputType === 'photo' && prob.mediaUrl && (
                    <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 bg-slate-950 inline-flex items-center">
                      <img src={prob.mediaUrl} alt="Complaint Media" className="object-cover max-h-52 rounded-md p-1" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                {/* Scoring metrics breakdown grid */}
                <div className="grid grid-cols-3 gap-2.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 text-center">
                  <div>
                    <span className="block text-xs font-extrabold text-rose-400">{prob.stressScore}/100</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Citizen Stress</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold text-amber-400">×{prob.recurrenceCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Cluster Size</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold text-teal-400">{prob.infrastructureGapScore}/100</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Infrastructure Gap</span>
                  </div>
                </div>

                {/* Footer and Submit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate max-w-[280px] sm:max-w-md">{prob.location?.address}</span>
                  </div>

                  <button
                    onClick={() => openSubmitModal(prob)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    <span>Submit Solution</span>
                  </button>
                </div>

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
              className="bg-slate-900 border border-slate-850 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? 'Syncing...' : 'View Older Demands'}
            </button>
          </div>
        )}

      </div>

      {/* Submit Solution Overlay Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="solution-submission-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white bg-slate-950 border border-slate-850 p-1 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-4 shrink-0 pr-8">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 px-2.5 py-1 rounded">
                Targeting: {selectedCategoryForSolution.toUpperCase()}
              </span>
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight pt-1">Register Prototype Solution</h2>
              <div className="bg-slate-950/50 border border-slate-850 p-2.5 rounded-xl mt-2 text-[11px] text-slate-400 font-medium leading-relaxed italic max-h-16 overflow-y-auto">
                "For issue: {selectedProblemDesc}"
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1.5">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">Solution Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IoT Acoustic Pipeline Pressure Monitor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">Technical Details & Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your prototype's technical features, how citizens run it, and hardware or cloud dependencies."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl p-4 text-xs font-medium text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">Tech Stack (comma-separated tags)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python, YOLOv8, MQTT"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">Source Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">Live Web Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">Developer Docs URL</label>
                <input
                  type="url"
                  placeholder="https://docs.example.org"
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end shrink-0 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl border border-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center"
                >
                  {submitting ? 'Submitting...' : 'Register Solution'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

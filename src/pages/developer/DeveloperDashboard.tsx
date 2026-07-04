import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { SolutionCard } from '../../components/SolutionCard';
import { ShieldAlert, Cpu, Terminal, Github, ExternalLink, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Grievance {
  _id: string;
  category: string;
  description: string;
  location: { address: string };
  urgencyScore: number;
  recurrenceCount: number;
  createdAt: string;
}

interface Solution {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  targetCategory: string;
  repoUrl?: string;
  demoUrl?: string;
  vouchCount: number;
  status: string;
  createdAt: string;
}

export const DeveloperDashboard: React.FC = () => {
  const [openRfps, setOpenRfps] = useState<Grievance[]>([]);
  const [mySolutions, setMySolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [targetCategory, setTargetCategory] = useState('water');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Let's call /api/solutions/mine to fetch developer's own solutions
      const solResponse = await axiosClient.get('/api/solutions/mine');
      
      // Fetch public list of grievances to display as "Civic RFPs"
      const publicGrievances = await axiosClient.get('/api/grievances');

      if (publicGrievances.data.success) {
        // Show verified/pending complaints as Open RFPs
        const openIssues = publicGrievances.data.grievances.filter(
          (g: any) => g.status === 'verified' || g.status === 'pending_review'
        );
        setOpenRfps(openIssues);
      }

      if (solResponse.data.success) {
        setMySolutions(solResponse.data.solutions);
      }
    } catch (err) {
      console.error('Failed to sync developer panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const techStack = techStackInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await axiosClient.post('/api/solutions', {
        title,
        description,
        techStack,
        targetCategory,
        repoUrl: repoUrl || undefined,
        demoUrl: demoUrl || undefined
      });

      if (response.data.success) {
        toast.success('Your civic prototype solution has been registered successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setRepoUrl('');
        setDemoUrl('');
        setTechStackInput('');
        loadAllData();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit prototype.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadgeColor = (score: number) => {
    if (score >= 75) return 'text-[#E76F51] bg-[#FAF6ED] border border-[#E76F51]/25 shadow-[inset_1px_1px_3px_rgba(231,111,81,0.1)]';
    if (score >= 45) return 'text-amber-600 bg-[#FAF6ED] border border-amber-500/25 shadow-[inset_1px_1px_3px_rgba(217,119,6,0.1)]';
    return 'text-emerald-600 bg-[#FAF6ED] border border-emerald-500/25 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.1)]';
  };

  return (
    <div className="bg-[#FAF6ED] min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 text-[#3A2E2B]" id="developer-dashboard">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-[#FFFDF9] text-[#3A2E2B] p-6 rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] border border-white/40">
          <div>
            <span className="text-[#3F6C51] text-xs font-black uppercase tracking-widest">Developer Prototyping Hub</span>
            <h1 className="text-2xl font-black mt-1">Open-Source Civic Solution Registry</h1>
            <p className="text-[#9A8C7F] text-xs mt-1 font-bold">Build open prototypes (React apps, Python tools, Edge IoT) to address verified community demands.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-[#FAF6ED] border border-white/40 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)] px-5 py-3 rounded-2xl">
              <span className="block text-xl font-black text-emerald-600">{mySolutions.length}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">My Prototypes</span>
            </div>
            <div className="text-center bg-[#FAF6ED] border border-white/40 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)] px-5 py-3 rounded-2xl">
              <span className="block text-xl font-black text-[#3F6C51]">
                {mySolutions.reduce((sum, s) => sum + s.vouchCount, 0)}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Total Vouches</span>
            </div>
          </div>
        </div>

        {/* Core Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Civic RFPs Marketplace & Post Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Open Demands List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-[#3F6C51]" />
                  <h2 className="text-lg font-black text-[#3A2E2B]">Open Civic Demands (RFPs)</h2>
                </div>
                <span className="text-xs font-bold text-[#9A8C7F]">{openRfps.length} Open Issues</span>
              </div>

              {loading ? (
                <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-8 text-center shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF]">
                  <div className="w-6 h-6 border-2 border-[#3F6C51] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[#9A8C7F] text-xs font-black mt-3 uppercase tracking-wider">Syncing RFPs...</p>
                </div>
              ) : openRfps.length === 0 ? (
                <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-8 text-center shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF]">
                  <p className="text-[#3A2E2B] text-sm font-black">No active public grievances require matching.</p>
                  <p className="text-[#9A8C7F] text-xs mt-1 font-bold">Check back later or view completed projects.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1" id="open-rfps-list">
                  {openRfps.map((rfp) => (
                    <div key={rfp._id} className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-4 shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF] flex justify-between items-start space-x-3 hover:bg-[#FAF6ED]/60 transition-all duration-300">
                      <div className="space-y-1.5 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-[#FAF6ED] text-[#9A8C7F] px-2 py-0.5 border border-[#E5DEC9]/60 shadow-[inset_1px_1px_2px_rgba(142,130,114,0.06)] rounded-md">
                            {rfp.category}
                          </span>
                          <span className="text-[10px] text-[#9A8C7F] flex items-center space-x-1 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-[#E76F51]" />
                            <span className="truncate max-w-[140px]">{rfp.location?.address}</span>
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#3A2E2B] leading-relaxed line-clamp-2">{rfp.description}</p>
                      </div>

                      <div className={`flex flex-col items-center justify-center border rounded-xl px-2.5 py-1 text-center shrink-0 min-w-16 ${getUrgencyBadgeColor(rfp.urgencyScore)}`}>
                        <span className="text-xs font-black">{rfp.urgencyScore}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-[#9A8C7F]">Priority</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to submit a prototype */}
            <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-6 shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-6" id="submit-prototype-card">
              <div className="flex items-center space-x-2 border-b border-[#E5DEC9]/60 pb-3">
                <Terminal className="w-5 h-5 text-[#3F6C51]" />
                <h2 className="text-base font-black text-[#3A2E2B]">Register Technical Prototype Solution</h2>
              </div>

              <form onSubmit={handleSubmitSolution} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#9A8C7F] uppercase tracking-wider">Prototype Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. IoT AquaSensor Leak-Guard"
                      className="w-full neumorphic-concave px-3 py-2 text-xs text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#9A8C7F] uppercase tracking-wider">Target Problem Category</label>
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value)}
                      className="w-full neumorphic-concave px-3 py-2.5 text-xs text-[#3A2E2B] font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="water">Water / Clogged Drains</option>
                      <option value="road">Roads / Potholes</option>
                      <option value="electricity">Electricity / Power Grid</option>
                      <option value="sanitation">Sanitation / Waste Disposal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#9A8C7F] uppercase tracking-wider">Solution Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a clear technical explanation. How does your prototype work? What software or IoT hardware stack are you using? How does it resolve the target issues?"
                    className="w-full neumorphic-concave px-3 py-2 text-xs text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#9A8C7F] uppercase tracking-wider">GitHub Repo URL</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#9A8C7F]">
                        <Github className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full neumorphic-concave pl-8 pr-3 py-2.5 text-xs text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#9A8C7F] uppercase tracking-wider">Live Demo / App URL</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#9A8C7F]">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="url"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="https://demo.vercel.app/..."
                        className="w-full neumorphic-concave pl-8 pr-3 py-2.5 text-xs text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#9A8C7F] uppercase tracking-wider">Tech Stack Tags (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="e.g. React, Node.js, Mongoose, Leaflet.js"
                    className="w-full neumorphic-concave px-3 py-2 text-xs text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3F6C51] hover:bg-[#2d4d3a] text-white font-black py-2.5 px-4 rounded-xl shadow-[3px_3px_6px_rgba(63,108,81,0.25),-3px_-3px_6px_#FFFFFF] hover:shadow-inner transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider border border-white/20"
                  id="dev-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving Registry...</span>
                    </>
                  ) : (
                    <span>Register Technical Prototype</span>
                  )}
                </button>

              </form>

            </div>

          </div>

          {/* My Posted Solutions List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <Cpu className="w-5 h-5 text-[#3F6C51]" />
              <h2 className="text-lg font-black text-[#3A2E2B]">My Prototype Registry</h2>
            </div>

            {loading ? (
              <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF]">
                <div className="w-6 h-6 border-2 border-[#3F6C51] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[#9A8C7F] text-xs font-black mt-3.5 uppercase tracking-wider">Syncing prototypes...</p>
              </div>
            ) : mySolutions.length === 0 ? (
              <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF]">
                <p className="text-[#3A2E2B] text-sm font-black">No prototypes registered yet.</p>
                <p className="text-[#9A8C7F] text-xs mt-1 font-bold">Use the submission card below to register your first project!</p>
              </div>
            ) : (
              <div className="space-y-4" id="my-prototypes-list">
                {mySolutions.map((sol) => (
                  <SolutionCard 
                    key={sol._id} 
                    solution={sol as any} 
                    userRole="developer" 
                    onVouched={() => loadAllData()} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};


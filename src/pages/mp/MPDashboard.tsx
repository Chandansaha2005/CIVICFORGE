import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { HeatmapView } from '../../components/HeatmapView';
import { PriorityMatrixTable } from '../../components/PriorityMatrixTable';
import { SolutionCard } from '../../components/SolutionCard';
import { 
  Landmark, 
  Map, 
  TableProperties, 
  Cpu, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Check,
  IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Grievance {
  _id: string;
  category: string;
  description: string;
  inputType: string;
  mediaUrl: string;
  transcript: string;
  location: { lat: number; lng: number; address: string };
  stressScore: number;
  recurrenceCount: number;
  infrastructureGapScore: number;
  urgencyScore: number;
  status: string;
  citizen?: { name: string; email: string };
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
  developer?: { name: string };
  createdAt: string;
}

interface Blueprint {
  _id: string;
  mp: { name: string };
  grievanceCluster: Grievance[];
  matchedSolution: Solution | null;
  generatedTitle: string;
  generatedSummary: string;
  estimatedBudget: string;
  status: 'draft' | 'approved';
  createdAt: string;
}

type TabType = 'heatmap' | 'priority' | 'matchmaker' | 'blueprints';

export const MPDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('heatmap');
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  
  // Matchmaker state
  const [matchedSolutions, setMatchedSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [generatingProposal, setGeneratingProposal] = useState(false);

  // Blueprints state
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loadingBlueprints, setLoadingBlueprints] = useState(false);
  const [loadingGeneral, setLoadingGeneral] = useState(true);

  const fetchGrievances = async () => {
    try {
      setLoadingGeneral(true);
      const response = await axiosClient.get('/api/priority-matrix');
      if (response.data.success) {
        setGrievances(response.data.matrix);
      }
    } catch (err) {
      console.error('Failed to sync grievances queue:', err);
      toast.error('Grievance queue sync failed.');
    } finally {
      setLoadingGeneral(false);
    }
  };

  const fetchBlueprints = async () => {
    try {
      setLoadingBlueprints(true);
      const response = await axiosClient.get('/api/blueprints');
      if (response.data.success) {
        setBlueprints(response.data.blueprints);
      }
    } catch (err) {
      console.error('Failed to load blueprints:', err);
    } finally {
      setLoadingBlueprints(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
    fetchBlueprints();
  }, []);

  // Sync suggestion matches if active grievance selection changes
  useEffect(() => {
    if (!selectedGrievance) {
      setMatchedSolutions([]);
      setSelectedSolution(null);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const response = await axiosClient.get(`/api/matches/suggestions/${selectedGrievance._id}`);
        if (response.data.success) {
          setMatchedSolutions(response.data.suggestions);
          // Auto-select top suggestion with most vouches
          if (response.data.suggestions.length > 0) {
            setSelectedSolution(response.data.suggestions[0]);
          } else {
            setSelectedSolution(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch matched developer prototypes:', err);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [selectedGrievance]);

  // Handle grievance verification
  const handleVerifyGrievance = async (id: string) => {
    try {
      const response = await axiosClient.patch(`/api/grievances/${id}/verify`);
      if (response.data.success) {
        toast.success('Grievance marked as officially verified!');
        fetchGrievances();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to verify grievance.');
    }
  };

  // Triggers Gemini AI generation for new project proposal (blueprint)
  const handleGenerateProposal = async () => {
    if (!selectedGrievance) {
      toast.error('Please select an active grievance cluster first.');
      return;
    }

    try {
      setGeneratingProposal(true);
      const response = await axiosClient.post('/api/blueprints/generate', {
        grievanceIds: [selectedGrievance._id],
        solutionId: selectedSolution ? selectedSolution._id : undefined
      });

      if (response.data.success) {
        toast.success('Project Blueprint draft generated successfully via Gemini!');
        fetchBlueprints();
        fetchGrievances();
        // Clear active selection and move to review tab
        setSelectedGrievance(null);
        setSelectedSolution(null);
        setActiveTab('blueprints');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gemini Proposal generation failed.');
    } finally {
      setGeneratingProposal(false);
    }
  };

  // MP approves project proposal for budget deployment
  const handleApproveProposal = async (blueprintId: string) => {
    try {
      const response = await axiosClient.patch(`/api/blueprints/${blueprintId}/approve`);
      if (response.data.success) {
        toast.success('Proposal officially approved for direct constituency fund release!');
        fetchBlueprints();
        fetchGrievances();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to authorize proposal funding.');
    }
  };

  const getRoleIconBadge = (role: string) => {
    return <Landmark className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8" id="mp-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* MP Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
          <div>
            <span className="text-amber-400 text-xs font-extrabold uppercase tracking-widest">MP Constituency Control Panel</span>
            <h1 className="text-2xl font-black mt-1">Constituency Development & Evaluation Station</h1>
            <p className="text-slate-400 text-sm mt-1">Harnessing multi-source data fusion and Gemini AI models to prioritize community distress and fund digital prototypes.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-slate-800/50 border border-slate-750 px-5 py-3 rounded-xl">
              <span className="block text-xl font-bold text-amber-400">
                {grievances.filter(g => g.status === 'verified' || g.status === 'pending_review').length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unresolved RFPs</span>
            </div>
            <div className="text-center bg-slate-800/50 border border-slate-750 px-5 py-3 rounded-xl">
              <span className="block text-xl font-bold text-teal-400">
                {blueprints.filter(b => b.status === 'approved').length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Funded initiatives</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap border-b border-slate-800 gap-1" id="mp-dashboard-tabs">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'heatmap' 
                ? 'border-teal-500 text-teal-400 bg-slate-900 rounded-t-xl' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-heatmap-btn"
          >
            <Map className="w-4 h-4" />
            <span>Geo-Distress Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('priority')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'priority' 
                ? 'border-teal-500 text-teal-400 bg-slate-900 rounded-t-xl' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-priority-btn"
          >
            <TableProperties className="w-4 h-4" />
            <span>Priority Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('matchmaker')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'matchmaker' 
                ? 'border-teal-500 text-teal-400 bg-slate-900 rounded-t-xl' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-matchmaker-btn"
          >
            <Cpu className="w-4 h-4" />
            <span>Solution Matchmaker</span>
            {selectedGrievance && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('blueprints')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'blueprints' 
                ? 'border-teal-500 text-teal-400 bg-slate-900 rounded-t-xl' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-blueprints-btn"
          >
            <FileText className="w-4 h-4" />
            <span>Project Proposals ({blueprints.length})</span>
          </button>
        </div>

        {/* Tab Workspaces */}
        <div className="space-y-4">

          {/* 1. HEATMAP VIEW */}
          {activeTab === 'heatmap' && (
            <div className="bg-slate-900 p-6 border border-slate-800 rounded-3xl shadow-xl">
              <HeatmapView />
            </div>
          )}

          {/* 2. PRIORITY MATRIX VIEW */}
          {activeTab === 'priority' && (
            <div className="bg-slate-900 p-6 border border-slate-800 rounded-3xl shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-100">Dynamic Priority Matrix Queue</h3>
                <p className="text-xs text-slate-400 font-medium">Verified citizen demands compiled and ranked via compound score weights (40% Recurrence, 30% Citizen Distress, 30% Infrastructure Deficits).</p>
              </div>

              {loadingGeneral ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
                  <p className="text-slate-400 font-semibold text-xs mt-3 uppercase tracking-wider">Compiling demographic matrices...</p>
                </div>
              ) : (
                <PriorityMatrixTable 
                  data={grievances} 
                  selectedGrievanceId={selectedGrievance?._id}
                  onSelectGrievance={(g) => {
                    setSelectedGrievance(g);
                    toast.success(`Selected cluster: "${g.description.substring(0, 30)}..."! Please switch to Matchmaker tab to view prototype suggested matches!`);
                  }}
                  onVerify={handleVerifyGrievance}
                />
              )}
            </div>
          )}

          {/* 3. MATCHMAKER VIEW */}
          {activeTab === 'matchmaker' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Selected Grievance details */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-extrabold text-slate-100">Selected Community RFP</h3>
                </div>

                {selectedGrievance ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-teal-950/40 text-teal-400 px-2.5 py-1 border border-teal-900/30 rounded-full">
                        {selectedGrievance.category}
                      </span>
                      <span className="text-xs font-bold text-slate-400">AI Priority: {selectedGrievance.urgencyScore}/100</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-200 text-sm font-semibold leading-relaxed">{selectedGrievance.description}</p>
                      <p className="text-xs text-slate-500 font-medium italic">Located near: {selectedGrievance.location?.address}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-805 text-center">
                      <div>
                        <span className="block text-xs font-black text-slate-200">{selectedGrievance.recurrenceCount}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Reports</span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-slate-200">{selectedGrievance.stressScore}%</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Distress</span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-slate-200">{selectedGrievance.infrastructureGapScore}%</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Deficit</span>
                      </div>
                    </div>

                    {selectedGrievance.inputType === 'voice' && selectedGrievance.transcript && (
                      <div className="p-3 bg-teal-950/20 border border-teal-900/30 rounded-lg text-xs text-teal-300 italic">
                        "Transcribed: {selectedGrievance.transcript}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={handleGenerateProposal}
                        disabled={generatingProposal}
                        className="w-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:brightness-105 transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs uppercase tracking-wider"
                        id="generate-proposal-btn"
                      >
                        {generatingProposal ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Compiling Gemini Proposal...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-slate-950" />
                            <span>AI-Draft Project Proposal</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-slate-500 text-center mt-2 font-medium">Triggers Gemini to compile a budget proposal using the selected developer tool.</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3.5">
                    <p className="text-slate-400 text-sm font-semibold">No community grievance has been selected.</p>
                    <button
                      onClick={() => setActiveTab('priority')}
                      className="bg-slate-950 hover:bg-slate-900 text-slate-300 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 mx-auto cursor-pointer border border-slate-800"
                    >
                      <span>Select from Priority Matrix</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Matched Developer Prototypes */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center space-x-2 px-1">
                  <Cpu className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-extrabold text-slate-100">Category Matched Developer Prototypes</h3>
                </div>

                {!selectedGrievance ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                    <p className="text-slate-400 text-sm font-semibold">Select a community RFP on the left to display matching open-source solutions.</p>
                  </div>
                ) : loadingMatches ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                    <Loader2 className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs font-semibold mt-3.5 uppercase tracking-wider">Querying category matching algorithms...</p>
                  </div>
                ) : matchedSolutions.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl space-y-2">
                    <p className="text-slate-300 text-sm font-semibold">No developer prototypes registered for "{selectedGrievance.category}" issues yet.</p>
                    <p className="text-slate-450 text-xs">You can still generate a standard project proposal draft using standard AI contractors!</p>
                    <button
                      onClick={handleGenerateProposal}
                      disabled={generatingProposal}
                      className="mt-4 bg-teal-500 hover:bg-teal-450 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center space-x-1.5 mx-auto shadow cursor-pointer border border-teal-400/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft proposal without prototype</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="matched-prototypes-grid">
                    {matchedSolutions.map((sol) => (
                      <SolutionCard
                        key={sol._id}
                        solution={sol as any}
                        userRole="mp"
                        onSelect={() => setSelectedSolution(sol)}
                        isSelected={selectedSolution?._id === sol._id}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 4. BLUEPRINT REVIEW VIEW */}
          {activeTab === 'blueprints' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-100">Funding-Ready Project Proposals</h3>
                <p className="text-xs text-slate-450 font-medium">Review and authorize executive project briefs drafted by Google Gemini based on live community demand and developer prototype tools.</p>
              </div>

              {loadingBlueprints ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                  <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
                  <p className="text-slate-400 text-xs font-semibold mt-3.5 uppercase tracking-wider">Syncing proposal catalogs...</p>
                </div>
              ) : blueprints.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                  <p className="text-slate-350 text-sm font-semibold">No project proposal drafts have been generated yet.</p>
                  <p className="text-slate-500 text-xs mt-1">Select a community RFP in the Priority Matrix and draft a proposal inside the Matchmaker tab!</p>
                </div>
              ) : (
                <div className="space-y-6" id="proposals-catalog-list">
                  {blueprints.map((b) => (
                    <div key={b._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all">
                      
                      {/* Blueprint Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-550 px-2 py-0.5 border border-amber-500/20 rounded">
                              Gemini Proposal
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${
                              b.status === 'approved' 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                                : 'bg-amber-950/40 text-amber-400 border-amber-900/30'
                            }`}>
                              {b.status === 'approved' ? 'Funded & Approved' : 'Draft Proposal'}
                            </span>
                          </div>
                          <h4 className="text-lg font-extrabold text-slate-100 leading-snug">{b.generatedTitle}</h4>
                        </div>

                        {/* Estimated Budget Banner */}
                        <div className="flex items-center space-x-1.5 bg-slate-950 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs border border-slate-850 shrink-0">
                          <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                          <span>Budget: {b.estimatedBudget}</span>
                        </div>
                      </div>

                      {/* Matched items indicator */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-850 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-500 uppercase text-[9px] block">Community RFP Cluster</span>
                          <span className="text-slate-300 font-bold truncate block">
                            {b.grievanceCluster && b.grievanceCluster.length > 0 
                              ? `"${b.grievanceCluster[0].description.substring(0, 50)}..." (${b.grievanceCluster.length} grievance)`
                              : 'Standard cluster'}
                          </span>
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-500 uppercase text-[9px] block">Digital Solution Partner</span>
                          <span className="text-slate-300 font-bold truncate block">
                            {b.matchedSolution ? b.matchedSolution.title : 'General Public Contractor'}
                          </span>
                        </div>
                      </div>

                      {/* Proposal Document Body (preserves text formatting) */}
                      <div className="whitespace-pre-wrap leading-relaxed text-xs font-medium font-mono bg-slate-950 text-emerald-400 p-5 rounded-xl border border-slate-850 max-h-96 overflow-y-auto">
                        {b.generatedSummary}
                      </div>

                      {/* Approval Actions */}
                      <div className="flex justify-between items-center border-t border-slate-800/60 pt-4">
                        <span className="text-[10px] text-slate-500 font-bold">Generated on {new Date(b.createdAt).toLocaleDateString()}</span>
                        
                        {b.status === 'draft' ? (
                          <button
                            onClick={() => handleApproveProposal(b._id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>Verify & Approve Funding</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-emerald-400 font-extrabold text-xs">
                            <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-950/20" />
                            <span>Authorized & Funded</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

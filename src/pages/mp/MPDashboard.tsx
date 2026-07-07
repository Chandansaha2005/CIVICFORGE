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
  aiPriorityScore: number;
  aiPriorityExplanation: string;
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

  return (
    <div className="bg-[#FAF6ED] min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 text-[#3A2E2B]" id="mp-dashboard">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* MP Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-[#FFFDF9] p-6 rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] border border-white/40">
          <div>
            <span className="text-[#E76F51] text-xs font-black uppercase tracking-widest">MP Constituency Control Panel</span>
            <h1 className="text-2xl font-black mt-1 text-[#3A2E2B]">Constituency Development & Evaluation Station</h1>
            <p className="text-[#9A8C7F] text-xs font-bold mt-1">Harnessing multi-source data fusion and Gemini AI models to prioritize community distress and fund digital prototypes.</p>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={async () => {
                const toastId = toast.loading('Triggering background AI Prioritization...');
                try {
                  await axiosClient.post('/api/priority-matrix/prioritize-all');
                  toast.success('AI Daemon launched! Scores will update shortly.', { id: toastId });
                  setTimeout(fetchGrievances, 3000);
                } catch (e) {
                  toast.error('Failed to trigger AI sync.', { id: toastId });
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF6ED] text-[#E76F51] border border-[#E76F51]/30 hover:bg-[#FFFDF9] rounded-xl shadow-sm text-xs font-black uppercase transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Force Sync</span>
            </button>
            <div className="text-center bg-[#FAF6ED] border border-white/40 px-5 py-3 rounded-2xl shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)]">
              <span className="block text-xl font-black text-[#E76F51]">
                {grievances.filter(g => g.status === 'verified' || g.status === 'pending_review').length}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Unresolved RFPs</span>
            </div>
            <div className="text-center bg-[#FAF6ED] border border-white/40 px-5 py-3 rounded-2xl shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)]">
              <span className="block text-xl font-black text-emerald-600">
                {blueprints.filter(b => b.status === 'approved').length}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Funded initiatives</span>
            </div>
          </div>
        </div>

        

        {/* Tab Selection Row */}
        <div className="flex flex-wrap border-b border-[#E5DEC9]/60 gap-1" id="mp-dashboard-tabs">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'heatmap' 
                ? 'border-[#3F6C51] text-[#3F6C51] bg-[#FFFDF9] rounded-t-2xl shadow-sm' 
                : 'border-transparent text-[#9A8C7F] hover:text-[#3F6C51] hover:bg-[#FFFDF9]/40'
            }`}
            id="tab-heatmap-btn"
          >
            <Map className="w-4 h-4 text-[#3F6C51]" />
            <span>Geo-Distress Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('priority')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'priority' 
                ? 'border-[#3F6C51] text-[#3F6C51] bg-[#FFFDF9] rounded-t-2xl shadow-sm' 
                : 'border-transparent text-[#9A8C7F] hover:text-[#3F6C51] hover:bg-[#FFFDF9]/40'
            }`}
            id="tab-priority-btn"
          >
            <TableProperties className="w-4 h-4 text-[#3F6C51]" />
            <span>Priority Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('matchmaker')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'matchmaker' 
                ? 'border-[#3F6C51] text-[#3F6C51] bg-[#FFFDF9] rounded-t-2xl shadow-sm' 
                : 'border-transparent text-[#9A8C7F] hover:text-[#3F6C51] hover:bg-[#FFFDF9]/40'
            }`}
            id="tab-matchmaker-btn"
          >
            <Cpu className="w-4 h-4 text-[#3F6C51]" />
            <span>Solution Matchmaker</span>
            {selectedGrievance && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E76F51] rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('blueprints')}
            className={`flex items-center space-x-2 py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'blueprints' 
                ? 'border-[#3F6C51] text-[#3F6C51] bg-[#FFFDF9] rounded-t-2xl shadow-sm' 
                : 'border-transparent text-[#9A8C7F] hover:text-[#3F6C51] hover:bg-[#FFFDF9]/40'
            }`}
            id="tab-blueprints-btn"
          >
            <FileText className="w-4 h-4 text-[#3F6C51]" />
            <span>Project Proposals ({blueprints.length})</span>
          </button>
        </div>

        {/* Tab Workspaces */}
        <div className="space-y-4">

          {/* 1. HEATMAP VIEW */}
          {activeTab === 'heatmap' && (
            <div className="bg-[#FFFDF9] p-6 border border-white/40 rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]">
              <HeatmapView />
            </div>
          )}

          {/* 2. PRIORITY MATRIX VIEW */}
          {activeTab === 'priority' && (
            <div className="bg-[#FFFDF9] p-6 border border-white/40 rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-6">
              <div>
                <h3 className="text-base font-black text-[#3A2E2B]">Dynamic Priority Matrix Queue</h3>
                <p className="text-xs text-[#9A8C7F] font-bold">Verified citizen demands compiled and ranked via compound score weights (40% Recurrence, 30% Citizen Distress, 30% Infrastructure Deficits).</p>
              </div>

              {loadingGeneral ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-[#3F6C51] animate-spin mx-auto" />
                  <p className="text-[#9A8C7F] font-black text-xs mt-3 uppercase tracking-wider">Compiling demographic matrices...</p>
                </div>
              ) : (
                <PriorityMatrixTable 
                  data={grievances} 
                  selectedGrievanceId={selectedGrievance?._id}
                  onSelectGrievance={(g) => {
                    setSelectedGrievance(g);
                    toast.success(`Selected cluster: "${g.description.substring(0, 30)}..."! Switch to Matchmaker tab to view suggested matches.`);
                  }}
                  onVerify={handleVerifyGrievance}
                  onRefresh={fetchGrievances}
                />
              )}
            </div>
          )}

          {/* 3. MATCHMAKER VIEW */}
          {activeTab === 'matchmaker' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Selected Grievance details */}
              <div className="lg:col-span-5 bg-[#FFFDF9] border border-white/40 rounded-3xl p-6 shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-5">
                <div className="flex items-center space-x-2 border-b border-[#E5DEC9]/60 pb-3">
                  <ShieldCheck className="w-5 h-5 text-[#3F6C51]" />
                  <h3 className="text-base font-black text-[#3A2E2B]">Selected Community RFP</h3>
                </div>

                {selectedGrievance ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-[#FAF6ED] text-[#9A8C7F] px-2.5 py-1 border border-[#E5DEC9]/60 rounded-md shadow-sm">
                        {selectedGrievance.category}
                      </span>
                      <span className="text-xs font-bold text-[#9A8C7F]">AI Priority: {selectedGrievance.urgencyScore}/100</span>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[#3A2E2B] text-sm font-bold leading-relaxed">{selectedGrievance.description}</p>
                      <p className="text-xs text-[#9A8C7F] font-bold italic">Located near: {selectedGrievance.location?.address}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#FAF6ED] p-3 rounded-2xl border border-[#E5DEC9]/60 text-center shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)]">
                      <div>
                        <span className="block text-xs font-black text-[#3A2E2B]">{selectedGrievance.recurrenceCount}</span>
                        <span className="text-[9px] uppercase font-black text-[#9A8C7F] tracking-wider">Reports</span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-[#3A2E2B]">{selectedGrievance.stressScore}%</span>
                        <span className="text-[9px] uppercase font-black text-[#9A8C7F] tracking-wider">Distress</span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-[#3A2E2B]">{selectedGrievance.infrastructureGapScore}%</span>
                        <span className="text-[9px] uppercase font-black text-[#9A8C7F] tracking-wider">Deficit</span>
                      </div>
                    </div>

                    {selectedGrievance.inputType === 'voice' && selectedGrievance.transcript && (
                      <div className="p-3 bg-[#FAF6ED] border border-[#E5DEC9]/60 rounded-2xl text-xs text-[#3F6C51] italic shadow-[inset_1px_1px_2px_rgba(142,130,114,0.06)]">
                        "Transcribed: {selectedGrievance.transcript}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E5DEC9]/60">
                      <button
                        onClick={handleGenerateProposal}
                        disabled={generatingProposal}
                        className="w-full bg-[#3F6C51] hover:bg-[#2d4d3a] text-white font-black py-3 px-4 rounded-2xl shadow-[3px_3px_6px_rgba(63,108,81,0.25),-3px_-3px_6px_#FFFFFF] flex items-center justify-center space-x-1.5 cursor-pointer text-xs uppercase tracking-wider"
                        id="generate-proposal-btn"
                      >
                        {generatingProposal ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Compiling Gemini Proposal...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-white" />
                            <span>AI-Draft Project Proposal</span>
                          </>
                        )}
                      </button>
                      <p className="text-[9px] text-[#9A8C7F] text-center mt-2 font-black">Triggers Gemini to compile a budget proposal using the selected developer tool.</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3.5">
                    <p className="text-[#9A8C7F] text-sm font-bold">No community grievance has been selected.</p>
                    <button
                      onClick={() => setActiveTab('priority')}
                      className="bg-[#FAF6ED] hover:bg-[#FFFDF9] text-[#3F6C51] hover:text-[#2d4d3a] font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 mx-auto cursor-pointer border border-[#E5DEC9]/60 shadow-sm"
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
                  <Cpu className="w-5 h-5 text-[#3F6C51]" />
                  <h3 className="text-lg font-black text-[#3A2E2B]">Category Matched Developer Prototypes</h3>
                </div>

                {!selectedGrievance ? (
                  <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]">
                    <p className="text-[#9A8C7F] text-sm font-bold">Select a community RFP on the left to display matching open-source solutions.</p>
                  </div>
                ) : loadingMatches ? (
                  <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]">
                    <Loader2 className="w-6 h-6 border-2 border-[#3F6C51] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[#9A8C7F] text-xs font-black mt-3.5 uppercase tracking-wider">Querying category matching algorithms...</p>
                  </div>
                ) : matchedSolutions.length === 0 ? (
                  <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-3">
                    <p className="text-[#3A2E2B] text-sm font-black">No developer prototypes registered for "{selectedGrievance.category}" issues yet.</p>
                    <p className="text-[#9A8C7F] text-xs font-bold">You can still generate a standard project proposal draft using standard AI contractors!</p>
                    <button
                      onClick={handleGenerateProposal}
                      disabled={generatingProposal}
                      className="mt-4 bg-[#FAF6ED] hover:bg-[#FFFDF9] border border-[#E5DEC9]/60 text-[#3F6C51] hover:text-[#2d4d3a] shadow-sm font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 mx-auto cursor-pointer"
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
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-black text-[#3A2E2B]">Funding-Ready Project Proposals</h3>
                <p className="text-xs text-[#9A8C7F] font-bold">Review and authorize executive project briefs drafted by Google Gemini based on live community demand and developer prototype tools.</p>
              </div>

              {loadingBlueprints ? (
                <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]">
                  <Loader2 className="w-8 h-8 text-[#3F6C51] animate-spin mx-auto" />
                  <p className="text-[#9A8C7F] text-xs font-black mt-3.5 uppercase tracking-wider">Syncing proposal catalogs...</p>
                </div>
              ) : blueprints.length === 0 ? (
                <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]">
                  <p className="text-[#9A8C7F] text-sm font-bold">No project proposal drafts have been generated yet.</p>
                  <p className="text-[#9A8C7F] text-xs font-bold mt-1">Select a community RFP in the Priority Matrix and draft a proposal inside the Matchmaker tab!</p>
                </div>
              ) : (
                <div className="space-y-6" id="proposals-catalog-list">
                  {blueprints.map((b) => (
                    <div key={b._id} className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-6 shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-4 hover:bg-[#FAF6ED]/50 transition-all duration-300">
                      
                      {/* Blueprint Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-[#FAF6ED] text-[#9A8C7F] border border-[#E5DEC9]/60 px-2 py-0.5 rounded shadow-sm">
                              Gemini Proposal
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full ${
                              b.status === 'approved' 
                                ? 'bg-[#FAF6ED] text-emerald-600 border-emerald-500/20 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.1)]' 
                                : 'bg-[#FAF6ED] text-amber-600 border-amber-500/20 shadow-[inset_1px_1px_3px_rgba(217,119,6,0.1)]'
                            }`}>
                              {b.status === 'approved' ? 'Funded & Approved' : 'Draft Proposal'}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-[#3A2E2B] leading-snug">{b.generatedTitle}</h4>
                        </div>

                        {/* Estimated Budget Banner */}
                        <div className="flex items-center space-x-1.5 bg-[#FAF6ED] border border-[#E5DEC9]/60 text-[#3A2E2B] font-bold p-2 rounded-2xl text-xs shadow-sm shrink-0">
                          <IndianRupee className="w-3.5 h-3.5 text-[#E76F51]" />
                          <span>Budget: {b.estimatedBudget}</span>
                        </div>
                      </div>

                      {/* Matched items indicator */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#FAF6ED] p-3 rounded-2xl border border-[#E5DEC9]/60 text-xs shadow-[inset_1px_1px_2px_rgba(142,130,114,0.06)]">
                        <div>
                          <span className="font-black text-[#9A8C7F] uppercase text-[9px] block">Community RFP Cluster</span>
                          <span className="text-[#3A2E2B] font-bold truncate block">
                            {b.grievanceCluster && b.grievanceCluster.length > 0 
                              ? `"${b.grievanceCluster[0].description.substring(0, 50)}..." (${b.grievanceCluster.length} grievance)`
                              : 'Standard cluster'}
                          </span>
                        </div>
                        <div>
                          <span className="font-black text-[#9A8C7F] uppercase text-[9px] block">Digital Solution Partner</span>
                          <span className="text-[#3A2E2B] font-bold truncate block">
                            {b.matchedSolution ? b.matchedSolution.title : 'General Public Contractor'}
                          </span>
                        </div>
                      </div>

                      {/* Proposal Document Body (preserves text formatting) */}
                      <div className="whitespace-pre-wrap leading-relaxed text-xs font-bold font-mono bg-[#FAF6ED] text-[#3F6C51] p-5 rounded-2xl border border-[#E5DEC9]/60 max-h-96 overflow-y-auto shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)]">
                        {b.generatedSummary}
                      </div>

                      {/* Approval Actions */}
                      <div className="flex justify-between items-center border-t border-[#E5DEC9]/65 pt-4">
                        <span className="text-[10px] text-[#9A8C7F] font-bold">Generated on {new Date(b.createdAt).toLocaleDateString()}</span>
                        
                        {b.status === 'draft' ? (
                          <button
                            onClick={() => handleApproveProposal(b._id)}
                            className="bg-[#FFFDF9] hover:bg-[#FAF6ED] border border-white/50 text-[#3F6C51] hover:text-[#2d4d3a] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-[3px_3px_6px_rgba(142,130,114,0.08),-3px_-3px_6px_#FFFFFF] cursor-pointer flex items-center space-x-1.5"
                          >
                            <Check className="w-4 h-4 text-[#3F6C51]" />
                            <span>Verify & Approve Funding</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-emerald-600 font-black text-xs">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
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

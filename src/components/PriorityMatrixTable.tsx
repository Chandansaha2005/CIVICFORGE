import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  MapPin, 
  Sparkles, 
  Check 
} from 'lucide-react';

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
  topSolution?: { 
    _id: string; 
    title: string; 
    developer?: { 
      name: string 
    }; 
    vouchCount: number; 
    aiMatchScore?: number; 
  } | null;
  weeklyMomentum?: number;
}

interface PriorityMatrixTableProps {
  data: Grievance[];
  onSelectGrievance: (grievance: Grievance) => void;
  selectedGrievanceId?: string;
  onVerify: (id: string) => Promise<void>;
}

export const PriorityMatrixTable: React.FC<PriorityMatrixTableProps> = ({ 
  data, onSelectGrievance, selectedGrievanceId, onVerify 
}) => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Set default sort to aiPriorityScore
  const [sortField, setSortField] = useState<'aiPriorityScore' | 'recurrenceCount' | 'stressScore' | 'infrastructureGapScore'>('aiPriorityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ... [Keep handleSort and filtering logic]
  const handleSort = (field: any) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const getAIBadge = (score: number) => {
    if (score >= 80) return 'bg-[#FAF6ED] text-[#E76F51] border-[#E76F51]/30 shadow-[inset_1px_1px_3px_rgba(231,111,81,0.1)]';
    if (score >= 50) return 'bg-[#FAF6ED] text-amber-600 border-amber-500/30 shadow-[inset_1px_1px_3px_rgba(217,119,6,0.1)]';
    return 'bg-[#FAF6ED] text-emerald-600 border-emerald-500/30 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.1)]';
  };

  const filteredData = data
    .filter(item => { /* ... existing filter logic ... */ return true; })
    .sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  return (
    <div className="space-y-4" id="priority-matrix-table-container">
      {/* 1. Filters & Search Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search by keywords or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full neumorphic-concave px-4 py-2.5 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="neumorphic-concave px-4 py-2.5 text-sm text-[#3A2E2B] font-bold focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="water">Water</option>
          <option value="road">Roads / Potholes</option>
          <option value="electricity">Electricity</option>
          <option value="sanitation">Sanitation / Waste</option>
          <option value="health">Health Clinics</option>
          <option value="education">Education</option>
          <option value="other">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="neumorphic-concave px-4 py-2.5 text-sm text-[#3A2E2B] font-bold focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending_review">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="matched">Matched (Draft Proposal)</option>
          <option value="resolved">Resolved (Deployed)</option>
        </select>
      </div>

      {/* 2. Priority Ranked Table */}
      <div className="bg-[#FFFDF9] rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] border border-white/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="priority-table">
            <thead>
              <tr className="bg-[#FAF6ED] border-b border-[#E5DEC9]/60 text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">
                <th className="py-4 px-5">Location & Issue Details</th>
                <th className="py-4 px-3 text-center cursor-pointer hover:bg-[#FAF6ED]/50 transition-colors select-none" onClick={() => handleSort('aiPriorityScore')}>
                  <div className="flex items-center justify-center space-x-1 text-[#E76F51]">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-3 text-center cursor-pointer hover:bg-[#FAF6ED]/50 transition-colors select-none" onClick={() => handleSort('recurrenceCount')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Recurrence</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9A8C7F]" />
                  </div>
                </th>
                <th className="py-4 px-3 text-center cursor-pointer hover:bg-[#FAF6ED]/50 transition-colors select-none" onClick={() => handleSort('stressScore')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Stress</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9A8C7F]" />
                  </div>
                </th>
                <th className="py-4 px-3 text-center cursor-pointer hover:bg-[#FAF6ED]/50 transition-colors select-none" onClick={() => handleSort('infrastructureGapScore')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Gap Score</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9A8C7F]" />
                  </div>
                </th>
                <th className="py-4 px-4 text-left">Top AI Matched Solution</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]/40">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#9A8C7F] font-bold">
                    No community grievances found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const isSelected = selectedGrievanceId === item._id;
                  return (
                    <tr 
                      key={item._id} 
                      className={`hover:bg-[#FAF6ED]/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.08),inset_-2px_-2px_5px_#FFFFFF]' : ''
                      }`}
                      onClick={() => onSelectGrievance(item)}
                    >
                      {/* AI Priority Score Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center space-y-1 relative group">
                          <span className={`text-sm font-black border px-3 py-1 rounded-full ${getAIBadge(item.aiPriorityScore)} flex items-center gap-1`}>
                            {item.aiPriorityScore || 0}
                          </span>
                          {item.aiPriorityExplanation && (
                            <div className="absolute top-8 w-48 p-2 bg-[#3A2E2B] text-white text-[10px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                              {item.aiPriorityExplanation}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location & Details Column */}
                      <td className="py-4 px-5 max-w-sm">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="bg-[#FFFDF9] text-[#9A8C7F] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-[#E5DEC9]/40 rounded-md shadow-[1px_1px_3px_rgba(142,130,114,0.06)]">
                              {item.category}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${
                              item.status === 'pending_review' ? 'bg-[#FAF6ED] text-amber-600 border border-amber-500/25 shadow-[inset_1px_1px_3px_rgba(217,119,6,0.1)]' :
                              item.status === 'verified' ? 'bg-[#FAF6ED] text-[#3F6C51] border border-[#3F6C51]/25 shadow-[inset_1px_1px_3px_rgba(63,108,81,0.1)]' :
                              item.status === 'matched' ? 'bg-[#FAF6ED] text-[#3F6C51] border border-[#3F6C51]/20' :
                              'bg-[#FAF6ED] text-[#9A8C7F] border border-[#E5DEC9]/50'
                            }`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#3A2E2B] line-clamp-2 leading-relaxed">{item.description}</p>
                          <div className="flex items-center space-x-1 text-[#9A8C7F] text-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#E76F51]" />
                            <span className="truncate font-bold">{item.location?.address}</span>
                          </div>
                          {item.inputType === 'voice' && item.transcript && (
                            <p className="text-[11px] text-[#3F6C51] bg-[#3F6C51]/5 border border-[#3F6C51]/15 rounded-xl p-2.5 font-bold italic shadow-[inset_1px_1px_3px_rgba(63,108,81,0.06)]">
                              "Transcribed: {item.transcript}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Urgency Score Column */}
                      <td className="py-4 px-3 text-center">
                        <span className={`text-xs font-black border px-3 py-1 rounded-full ${getAIBadge(item.urgencyScore)}`}>
                          {item.urgencyScore}
                        </span>
                      </td>

                      {/* Recurrence Count Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-[#3A2E2B]">{item.recurrenceCount}</span>
                          <span className="text-[9px] font-black uppercase text-[#9A8C7F] tracking-wider">Reports</span>
                        </div>
                      </td>

                      {/* Stress Score Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-[#3A2E2B]">{item.stressScore}%</span>
                          <span className="text-[9px] font-black uppercase text-[#9A8C7F] tracking-wider">distress</span>
                        </div>
                      </td>

                      {/* Infrastructure Gap Score Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-[#3A2E2B]">{item.infrastructureGapScore}%</span>
                          <span className="text-[9px] font-black uppercase text-[#9A8C7F] tracking-wider">Census deficit</span>
                        </div>
                      </td>

                      {/* Top AI Matched Solution Column */}
                      <td className="py-4 px-4 max-w-xs text-left">
                        {item.topSolution ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-[#3F6C51] block truncate max-w-[150px]">{item.topSolution.title}</span>
                              {(item.topSolution?.aiMatchScore ?? 0) > 0 && (
                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1 rounded" title="AI Match Score">{item.topSolution?.aiMatchScore ?? 0}%</span>
                              )}
                            </div>
                            {/* ... Keep the rest of solution cell */}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#9A8C7F] font-bold italic">No prototypes listed</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          {item.status === 'pending_review' ? (
                            <button
                              onClick={() => onVerify(item._id)}
                              className="text-xs bg-[#3F6C51] hover:bg-[#2d4d3a] text-white font-black px-3 py-1.5 rounded-xl border border-white/20 shadow-[3px_3px_6px_rgba(63,108,81,0.2),-3px_-3px_6px_#FFFFFF] flex items-center space-x-1 cursor-pointer transition-all"
                              title="Verify grievance"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#9A8C7F] font-bold flex items-center space-x-0.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 font-extrabold" />
                              <span>Verified</span>
                            </span>
                          )}
                          <button
                            onClick={() => onSelectGrievance(item)}
                            className="text-xs text-[#9A8C7F] hover:text-[#3F6C51] bg-[#FFFDF9] hover:shadow-[inset_2px_2px_4px_rgba(142,130,114,0.1)] border border-white/40 shadow-[3px_3px_6px_rgba(142,130,114,0.08),-3px_-3px_6px_#FFFFFF] px-3 py-1.5 rounded-xl font-black uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Match</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


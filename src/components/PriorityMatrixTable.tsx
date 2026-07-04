import React, { useState } from 'react';
import { Shield, ArrowUpDown, MapPin, Sparkles, Plus, AlertTriangle, Check } from 'lucide-react';

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
  topSolution?: {
    _id: string;
    title: string;
    developer?: { name: string };
    vouchCount: number;
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
  data, 
  onSelectGrievance, 
  selectedGrievanceId,
  onVerify 
}) => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'urgencyScore' | 'recurrenceCount' | 'stressScore' | 'infrastructureGapScore'>('urgencyScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'urgencyScore' | 'recurrenceCount' | 'stressScore' | 'infrastructureGapScore') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getUrgencyBadge = (score: number) => {
    if (score >= 75) {
      return 'bg-rose-950/40 text-rose-400 border-rose-900/30';
    }
    if (score >= 45) {
      return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
    }
    return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
  };

  // Filter and Sort Data
  const filteredData = data
    .filter(item => {
      const matchCat = categoryFilter ? item.category === categoryFilter : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      const matchSearch = searchQuery 
        ? item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.location.address.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchCat && matchStatus && matchSearch;
    })
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
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
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
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
        >
          <option value="">All Statuses</option>
          <option value="pending_review">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="matched">Matched (Draft Proposal)</option>
          <option value="resolved">Resolved (Deployed)</option>
        </select>
      </div>

      {/* 2. Priority Ranked Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="priority-table">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Location & Issue Details</th>
                <th className="py-3.5 px-3 text-center cursor-pointer hover:bg-slate-900/60 transition-colors select-none" onClick={() => handleSort('urgencyScore')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Urgency</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center cursor-pointer hover:bg-slate-900/60 transition-colors select-none" onClick={() => handleSort('recurrenceCount')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Recurrence</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center cursor-pointer hover:bg-slate-900/60 transition-colors select-none" onClick={() => handleSort('stressScore')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Stress Score</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center cursor-pointer hover:bg-slate-900/60 transition-colors select-none" onClick={() => handleSort('infrastructureGapScore')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Gap Score</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-left">Top Active Solution</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500 font-medium bg-slate-950/20">
                    No community grievances found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const isSelected = selectedGrievanceId === item._id;
                  return (
                    <tr 
                      key={item._id} 
                      className={`hover:bg-slate-950/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-teal-950/20 hover:bg-teal-950/30' : ''
                      }`}
                      onClick={() => onSelectGrievance(item)}
                    >
                      {/* Location & Details Column */}
                      <td className="py-4 px-5 max-w-sm">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-slate-400 px-2 py-0.5 border border-slate-800 rounded">
                              {item.category}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${
                              item.status === 'pending_review' ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' :
                              item.status === 'verified' ? 'bg-teal-950/40 text-teal-400 border-teal-900/30' :
                              item.status === 'matched' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' :
                              'bg-slate-900 text-slate-400 border-slate-800'
                            }`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-100 line-clamp-2 leading-relaxed">{item.description}</p>
                          <div className="flex items-center space-x-1 text-slate-500 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            <span className="truncate font-medium">{item.location?.address}</span>
                          </div>
                          {item.inputType === 'voice' && item.transcript && (
                            <p className="text-[11px] text-teal-300 bg-teal-950/30 border border-teal-900/30 rounded p-1.5 font-medium italic">
                              "Transcribed: {item.transcript}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Urgency Score Column */}
                      <td className="py-4 px-3 text-center">
                        <span className={`text-sm font-bold border px-3 py-1 rounded-full ${getUrgencyBadge(item.urgencyScore)}`}>
                          {item.urgencyScore}
                        </span>
                      </td>

                      {/* Recurrence Count Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-200">{item.recurrenceCount}</span>
                          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Reports</span>
                        </div>
                      </td>

                      {/* Stress Score Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-200">{item.stressScore}%</span>
                          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">distress</span>
                        </div>
                      </td>

                      {/* Infrastructure Gap Score Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-200">{item.infrastructureGapScore}%</span>
                          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Census deficit</span>
                        </div>
                      </td>

                      {/* Top Active Solution Column */}
                      <td className="py-4 px-4 max-w-xs text-left">
                        {item.topSolution ? (
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-teal-400 block truncate max-w-[170px]" title={item.topSolution.title}>
                              {item.topSolution.title}
                            </span>
                            <div className="text-[10px] text-slate-400 font-bold">
                              by {item.topSolution.developer?.name || 'Anonymous Dev'}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500">
                              <span>Support: {item.topSolution.vouchCount || 0}</span>
                              {item.weeklyMomentum && item.weeklyMomentum > 0 ? (
                                <span className="text-amber-400 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.2 rounded inline-flex items-center space-x-0.5" title="Vouches gained in last 7 days">
                                  <span>🔥</span>
                                  <span>+{item.weeklyMomentum} wkly</span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold italic">No prototypes listed</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          {item.status === 'pending_review' ? (
                            <button
                              onClick={() => onVerify(item._id)}
                              className="text-xs bg-teal-500 hover:bg-teal-450 text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-teal-400/20 shadow-sm flex items-center space-x-1 cursor-pointer transition-all"
                              title="Verify grievance"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-semibold flex items-center space-x-0.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Verified</span>
                            </span>
                          )}
                          <button
                            onClick={() => onSelectGrievance(item)}
                            className="text-xs text-slate-300 hover:text-teal-400 bg-slate-950 hover:bg-teal-950/40 border border-slate-850 hover:border-teal-900/30 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
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

import React, { useState, useEffect } from 'react';
import { GrievanceForm } from '../../components/GrievanceForm';
import axiosClient from '../../api/axiosClient';
import { ShieldAlert, ListTodo, MapPin, Calendar, Clock, Volume2 } from 'lucide-react';

interface Grievance {
  _id: string;
  category: string;
  description: string;
  inputType: string;
  mediaUrl: string;
  transcript: string;
  location: { address: string };
  urgencyScore: number;
  status: string;
  createdAt: string;
}

export const CitizenDashboard: React.FC = () => {
  const [myGrievances, setMyGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyGrievances = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/grievances/mine');
      if (response.data.success) {
        setMyGrievances(response.data.grievances);
      }
    } catch (err) {
      console.error('Failed to load my grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGrievances();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-[#FAF6ED] text-amber-600 border border-amber-500/25 shadow-[inset_1px_1px_3px_rgba(217,119,6,0.1)]';
      case 'verified':
        return 'bg-[#FAF6ED] text-[#3F6C51] border border-[#3F6C51]/25 shadow-[inset_1px_1px_3px_rgba(63,108,81,0.1)]';
      case 'matched':
        return 'bg-[#FAF6ED] text-[#3F6C51] border border-[#3F6C51]/20';
      case 'resolved':
        return 'bg-[#FAF6ED] text-emerald-600 border border-emerald-500/25 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.1)]';
      default:
        return 'bg-[#FAF6ED] text-[#9A8C7F] border border-[#E5DEC9]/50';
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 75) return 'text-[#E76F51] bg-[#FAF6ED] border border-[#E76F51]/25 shadow-[inset_1px_1px_3px_rgba(231,111,81,0.1)]';
    if (score >= 45) return 'text-amber-600 bg-[#FAF6ED] border border-amber-500/25 shadow-[inset_1px_1px_3px_rgba(217,119,6,0.1)]';
    return 'text-emerald-600 bg-[#FAF6ED] border border-emerald-500/25 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.1)]';
  };

  return (
    <div className="bg-[#FAF6ED] min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8" id="citizen-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Upper summary block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-[#FFFDF9] text-[#3A2E2B] p-6 rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] border border-white/40 animate-fade-in">
          <div>
            <span className="text-[#3F6C51] text-xs font-black uppercase tracking-widest">Citizen Ingress Hub</span>
            <h1 className="text-2xl font-black mt-1">Lodge Community Grievance</h1>
            <p className="text-[#9A8C7F] text-xs mt-1 font-bold">Use text, high-definition photo uploads, or instant voice recording. Google Gemini handles the rest.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-[#FAF6ED] border border-white/40 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)] px-5 py-3 rounded-2xl">
              <span className="block text-xl font-black text-[#3F6C51]">{myGrievances.length}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Total Reports</span>
            </div>
            <div className="text-center bg-[#FAF6ED] border border-white/40 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)] px-5 py-3 rounded-2xl">
              <span className="block text-xl font-black text-emerald-600">
                {myGrievances.filter(g => g.status === 'resolved').length}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Resolved</span>
            </div>
          </div>
        </div>

        {/* Dashboard Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lodge Grievance Form Column */}
          <div className="lg:col-span-5 space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center space-x-2 px-1">
              <ShieldAlert className="w-5 h-5 text-[#3F6C51]" />
              <h2 className="text-lg font-black text-[#3A2E2B]">Submit New Issue</h2>
            </div>
            <GrievanceForm onSuccess={fetchMyGrievances} />
          </div>

          {/* Submissions List Column */}
          <div className="lg:col-span-7 space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center space-x-2 px-1">
              <ListTodo className="w-5 h-5 text-[#3F6C51]" />
              <h2 className="text-lg font-black text-[#3A2E2B]">My Historic Submissions</h2>
            </div>

            {loading ? (
              <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF]">
                <div className="w-8 h-8 border-3 border-[#3F6C51] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[#9A8C7F] font-black text-xs mt-3.5 uppercase tracking-wider">Syncing grievance database...</p>
              </div>
            ) : myGrievances.length === 0 ? (
              <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-12 text-center shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF] space-y-2">
                <p className="text-[#3A2E2B] text-sm font-black">You haven't submitted any civic grievances yet.</p>
                <p className="text-[#9A8C7F] text-xs font-bold">Fill out the form on the left to submit your first community report.</p>
              </div>
            ) : (
              <div className="space-y-4" id="grievance-history-list">
                {myGrievances.map((g) => (
                  <div key={g._id} className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-5 shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF] space-y-3.5 hover:bg-[#FAF6ED] transition-all duration-300">
                    
                    {/* Header: Category and Status */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[#FAF6ED] text-[#9A8C7F] px-2.5 py-1 border border-[#E5DEC9]/60 shadow-[inset_1px_1px_2px_rgba(142,130,114,0.06)] rounded-md">
                          {g.category}
                        </span>
                        <span className="text-[10px] text-[#9A8C7F] flex items-center space-x-1 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-[#9A8C7F]" />
                          <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 border rounded-full ${getStatusBadge(g.status)}`}>
                        {g.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[#3A2E2B] text-sm font-bold leading-relaxed">{g.description}</p>

                    {/* Media attachments */}
                    {g.inputType === 'photo' && g.mediaUrl && (
                      <div className="border border-[#E5DEC9]/60 rounded-2xl overflow-hidden max-h-48 bg-[#FAF6ED] inline-flex items-center shadow-inner p-1">
                        <img src={g.mediaUrl} alt="Complaint Attachment" className="object-cover max-h-44 rounded-xl" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {g.inputType === 'voice' && g.transcript && (
                      <div className="flex items-start space-x-2 bg-[#3F6C51]/5 border border-[#3F6C51]/15 p-3 rounded-xl text-xs text-[#3F6C51] font-bold italic shadow-[inset_1px_1px_3px_rgba(63,108,81,0.06)]">
                        <Volume2 className="w-4 h-4 text-[#3F6C51] shrink-0 mt-0.5" />
                        <span>"Transcribed: {g.transcript}"</span>
                      </div>
                    )}

                    <div className="h-px bg-[#E5DEC9]/60"></div>

                    {/* Footer: Location & Calculated Urgency */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-1 text-[#9A8C7F] font-bold max-w-[70%]">
                        <MapPin className="w-3.5 h-3.5 text-[#E76F51] shrink-0" />
                        <span className="truncate">{g.location?.address}</span>
                      </div>

                      {/* Score Indicator */}
                      <div className={`flex items-center space-x-1.5 border px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getUrgencyColor(g.urgencyScore)}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>AI Score: {g.urgencyScore}/100</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};


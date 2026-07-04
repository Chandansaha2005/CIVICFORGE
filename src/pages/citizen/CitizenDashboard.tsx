import React, { useState, useEffect } from 'react';
import { GrievanceForm } from '../../components/GrievanceForm';
import axiosClient from '../../api/axiosClient';
import { ShieldAlert, ListTodo, MapPin, Calendar, Clock, Volume2, Image as ImageIcon } from 'lucide-react';

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
        return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
      case 'verified':
        return 'bg-teal-950/40 text-teal-400 border-teal-900/30';
      case 'matched':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';
      case 'resolved':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 75) return 'text-rose-400 bg-rose-950/40 border-rose-900/30';
    if (score >= 45) return 'text-amber-400 bg-amber-950/40 border-amber-900/30';
    return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8" id="citizen-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Upper summary block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
          <div>
            <span className="text-teal-400 text-xs font-extrabold uppercase tracking-widest">Citizen Ingress Hub</span>
            <h1 className="text-2xl font-black mt-1">Lodge Community Grievance</h1>
            <p className="text-slate-400 text-sm mt-1">Use text, high-definition photo uploads, or instant voice recording. Google Gemini handles the rest.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-slate-950/40 border border-slate-850 px-5 py-3 rounded-xl">
              <span className="block text-xl font-bold text-teal-400">{myGrievances.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Reports</span>
            </div>
            <div className="text-center bg-slate-950/40 border border-slate-850 px-5 py-3 rounded-xl">
              <span className="block text-xl font-bold text-emerald-400">
                {myGrievances.filter(g => g.status === 'resolved').length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resolved</span>
            </div>
          </div>
        </div>

        {/* Dashboard Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lodge Grievance Form Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-extrabold text-slate-100">Submit New Issue</h2>
            </div>
            <GrievanceForm onSuccess={fetchMyGrievances} />
          </div>

          {/* Submissions List Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <ListTodo className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-extrabold text-slate-100">My Historic Submissions</h2>
            </div>

            {loading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
                <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 font-medium text-xs mt-3.5 uppercase tracking-wider">Syncing grievance database...</p>
              </div>
            ) : myGrievances.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-2">
                <p className="text-slate-300 text-sm font-semibold">You haven't submitted any civic grievances yet.</p>
                <p className="text-slate-500 text-xs">Fill out the form on the left to submit your first community report.</p>
              </div>
            ) : (
              <div className="space-y-4" id="grievance-history-list">
                {myGrievances.map((g) => (
                  <div key={g._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 hover:border-slate-700 transition-all">
                    
                    {/* Header: Category and Status */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-slate-400 px-2 py-0.5 border border-slate-800 rounded">
                          {g.category}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center space-x-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getStatusBadge(g.status)}`}>
                        {g.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-slate-200 text-sm font-medium leading-relaxed">{g.description}</p>

                    {/* Media attachments */}
                    {g.inputType === 'photo' && g.mediaUrl && (
                      <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 bg-slate-950 inline-flex items-center">
                        <img src={g.mediaUrl} alt="Complaint Attachment" className="object-cover max-h-44 rounded-md p-1" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {g.inputType === 'voice' && g.transcript && (
                      <div className="flex items-start space-x-2 bg-teal-950/20 border border-teal-900/30 p-3 rounded-xl text-xs text-teal-300 italic">
                        <Volume2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span>"Transcribed: {g.transcript}"</span>
                      </div>
                    )}

                    <div className="h-px bg-slate-800/60"></div>

                    {/* Footer: Location & Calculated Urgency */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-1 text-slate-400 font-semibold max-w-[70%]">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{g.location?.address}</span>
                      </div>

                      {/* Score Indicator */}
                      <div className={`flex items-center space-x-1.5 border px-2.5 py-1 rounded-full text-[10px] font-bold ${getUrgencyColor(g.urgencyScore)}`}>
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

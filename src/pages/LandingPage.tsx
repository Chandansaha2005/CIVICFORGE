import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hammer, Sparkles, Landmark, Cpu, Map, ShieldAlert, CheckCircle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // If already logged in, redirect to correct dashboard
  if (user) {
    if (user.role === 'citizen') return <Navigate to="/citizen/dashboard" replace />;
    if (user.role === 'developer') return <Navigate to="/developer/dashboard" replace />;
    if (user.role === 'mp') return <Navigate to="/mp/dashboard" replace />;
  }

  return (
    <div className="bg-slate-900 text-white min-h-[calc(screen-16)] flex flex-col justify-between overflow-hidden" id="landing-page">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 flex flex-col items-center text-center relative z-10">
        
        {/* Subtle glowing halo background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Feature Tag */}
        <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/50 px-3.5 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
            AI-Powered Constituency Development Planning
          </span>
        </div>

        {/* Display Typography */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl">
          Forging Solutions for{' '}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Constituency Progress
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mt-6 leading-relaxed font-medium">
          A dual-engine civic-tech ecosystem. Citizens lodge localized infrastructure grievances; developers construct deployable software prototypes; and MPs harness data fusion to prioritize funding-ready projects.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-teal-500/10 hover:brightness-110 transition-all text-center cursor-pointer"
          >
            Create Your Account
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-bold px-8 py-4 rounded-xl transition-all text-center cursor-pointer"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>

      {/* Role pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Citizen Pillar */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 border border-teal-500/10">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">1. Citizens submit</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Lodge geotagged complaints with photos or real-time voice notes. Gemini automatically transcribes and scores distress, creating "Civic RFPs".
            </p>
          </div>

          {/* Developer Pillar */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/10">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">2. Developers prototype</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Browse classified community demands. Submit open-source technical solutions (apps, IoT hardware) to win public validation and vouches.
            </p>
          </div>

          {/* MP Pillar */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/10">
              <Landmark className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">3. MPs authorize</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Evaluate real-time urgency heatmaps. Match citizen issues to developer tools, and one-click generate budget proposals using Gemini.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-medium">
        &copy; 2026 CivicForge. Developed under Government Open Data Directives.
      </footer>
    </div>
  );
};

import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Landmark, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // If already logged in, redirect to correct dashboard
  if (user) {
    if (user.role === 'citizen') return <Navigate to="/citizen/dashboard" replace />;
    if (user.role === 'developer') return <Navigate to="/developer/dashboard" replace />;
    if (user.role === 'mp') return <Navigate to="/mp/dashboard" replace />;
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-slate-800 min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden relative" id="landing-page">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 flex flex-col items-center text-center relative z-10 w-full">
        
        {/* Feature Tag */}
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full mb-10 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow duration-300 cursor-default">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
            AI-Powered Constituency Development Planning
          </span>
        </div>
 
        {/* Display Typography */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight max-w-5xl text-slate-900">
          Forging Solutions for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Constituency Progress
          </span>
        </h1>
 
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed font-medium">
          A dual-engine civic-tech ecosystem. Citizens lodge localized infrastructure grievances; developers construct deployable software prototypes; and MPs harness data fusion to prioritize funding-ready projects.
        </p>
 
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 text-center font-bold px-8 py-4 bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 hover:scale-105 rounded-2xl text-white shadow-[0_8px_30px_rgb(5,150,105,0.3)]"
          >
            <span>Create Your Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto text-center font-bold px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-300 hover:scale-105 rounded-2xl text-slate-800 shadow-sm hover:shadow-md"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
 
      {/* Role pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Citizen Pillar */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">1. Citizens submit</h3>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed font-medium">
                Lodge geotagged complaints with photos or real-time voice notes. Gemini automatically transcribes and scores distress, creating "Civic RFPs".
              </p>
            </div>
          </div>
 
          {/* Developer Pillar */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">2. Developers prototype</h3>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed font-medium">
                Browse classified community demands. Submit open-source technical solutions (apps, IoT hardware) to win public validation and vouches.
              </p>
            </div>
          </div>
 
          {/* MP Pillar */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <Landmark className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">3. MPs authorize</h3>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed font-medium">
                Evaluate real-time urgency heatmaps. Match citizen issues to developer tools, and one-click generate budget proposals using Gemini.
              </p>
            </div>
          </div>
 
        </div>
      </div>
 
      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-lg py-8 text-center text-sm text-slate-500 font-bold border-t border-emerald-100">
        &copy; 2026 CivicForge. Developed under Government Open Data Directives.
      </footer>
    </div>
  );
};
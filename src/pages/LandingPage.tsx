import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hammer, Sparkles, Landmark, Cpu, ShieldAlert } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // If already logged in, redirect to correct dashboard
  if (user) {
    if (user.role === 'citizen') return <Navigate to="/citizen/dashboard" replace />;
    if (user.role === 'developer') return <Navigate to="/developer/dashboard" replace />;
    if (user.role === 'mp') return <Navigate to="/mp/dashboard" replace />;
  }

  return (
    <div className="bg-[#FAF6ED] text-[#3A2E2B] min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden" id="landing-page">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center relative z-10">
        
        {/* Feature Tag */}
        <div className="inline-flex items-center space-x-2 bg-[#FFFDF9] px-4.5 py-2.5 rounded-full mb-8 shadow-[4px_4px_8px_0px_rgba(142,130,114,0.12),-4px_-4px_8px_0px_#FFFFFF] border border-white/40">
          <Sparkles className="w-4 h-4 text-[#E76F51]" />
          <span className="text-[10px] font-extrabold text-[#9A8C7F] uppercase tracking-widest font-sans">
            AI-Powered Constituency Development Planning
          </span>
        </div>
 
        {/* Display Typography */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl text-[#3A2E2B]">
          Forging Solutions for{' '}
          <span className="text-[#3F6C51]">
            Constituency Progress
          </span>
        </h1>
 
        <p className="text-[#9A8C7F] text-sm sm:text-base max-w-2xl mt-6 leading-relaxed font-medium">
          A dual-engine civic-tech ecosystem. Citizens lodge localized infrastructure grievances; developers construct deployable software prototypes; and MPs harness data fusion to prioritize funding-ready projects.
        </p>
 
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto text-center font-bold px-8 py-4 neumorphic-btn-accent rounded-xl text-white shadow-[6px_6px_12px_rgba(63,108,81,0.25),-6px_-6px_12px_#FFFFFF]"
          >
            Create Your Account
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto text-center font-bold px-8 py-4 neumorphic-btn rounded-xl text-[#3A2E2B]"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
 
      {/* Role pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Citizen Pillar */}
          <div className="neumorphic-convex-large p-7 border border-white/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#FFFDF9] shadow-[4px_4px_8px_0px_rgba(142,130,114,0.15),-4px_-4px_8px_0px_#FFFFFF] flex items-center justify-center mb-5">
                <ShieldAlert className="w-5 h-5 text-[#E76F51]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3A2E2B]">1. Citizens submit</h3>
              <p className="text-[#9A8C7F] text-xs mt-3 leading-relaxed font-medium">
                Lodge geotagged complaints with photos or real-time voice notes. Gemini automatically transcribes and scores distress, creating "Civic RFPs".
              </p>
            </div>
          </div>
 
          {/* Developer Pillar */}
          <div className="neumorphic-convex-large p-7 border border-white/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#FFFDF9] shadow-[4px_4px_8px_0px_rgba(142,130,114,0.15),-4px_-4px_8px_0px_#FFFFFF] flex items-center justify-center mb-5">
                <Cpu className="w-5 h-5 text-[#3F6C51]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3A2E2B]">2. Developers prototype</h3>
              <p className="text-[#9A8C7F] text-xs mt-3 leading-relaxed font-medium">
                Browse classified community demands. Submit open-source technical solutions (apps, IoT hardware) to win public validation and vouches.
              </p>
            </div>
          </div>
 
          {/* MP Pillar */}
          <div className="neumorphic-convex-large p-7 border border-white/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#FFFDF9] shadow-[4px_4px_8px_0px_rgba(142,130,114,0.15),-4px_-4px_8px_0px_#FFFFFF] flex items-center justify-center mb-5">
                <Landmark className="w-5 h-5 text-[#E76F51]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3A2E2B]">3. MPs authorize</h3>
              <p className="text-[#9A8C7F] text-xs mt-3 leading-relaxed font-medium">
                Evaluate real-time urgency heatmaps. Match citizen issues to developer tools, and one-click generate budget proposals using Gemini.
              </p>
            </div>
          </div>
 
        </div>
      </div>
 
      {/* Footer */}
      <footer className="bg-[#FFFDF9] py-6 text-center text-xs text-[#9A8C7F] font-bold shadow-[inset_0px_5px_10px_0px_rgba(142,130,114,0.1)] border-t border-white/30">
        &copy; 2026 CivicForge. Developed under Government Open Data Directives.
      </footer>
    </div>
  );
};


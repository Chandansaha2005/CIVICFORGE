import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Landmark, 
  Cpu, 
  ShieldAlert, 
  ArrowUpRight, 
  Mic, 
  Square, 
  Volume2, 
  Plus, 
  Heart, 
  Award, 
  Github, 
  ExternalLink, 
  FileText, 
  Check, 
  MapPin, 
  Send,
  User,
  Users,
  Code,
  Laptop
} from 'lucide-react';

import citizenImg from '../../assets/citizen.png';
import devImg from '../../assets/dev.png';
import mpImg from '../../assets/mp.png';
import colabImg from '../../assets/colab.png';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // Interactive State for Ingestion Platform Preview
  const [ingestionState, setIngestionState] = useState<'idle' | 'recording' | 'completed'>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [seconds, setSeconds] = useState(0);

  // Interactive State for Heatmap Preview
  const [activeHotspot, setActiveHotspot] = useState<number>(0);

  // Interactive State for Developer Leaderboard vouches
  const [vouches, setVouches] = useState({
    kolkata: 142,
    bengaluru: 98,
    mumbai: 76
  });
  const [vouchedTeams, setVouchedTeams] = useState<Record<string, boolean>>({});

  // Interactive State for MP Funding Proposal
  const [proposalStatus, setProposalStatus] = useState<'idle' | 'compiling' | 'approved'>('idle');
  const [proposalProgress, setProposalProgress] = useState(0);

  // Interactive State for Newsletter
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Voice recording timer simulation
  useEffect(() => {
    let interval: any;
    if (ingestionState === 'recording') {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 6) {
            setIngestionState('completed');
            setVoiceTranscript("Main main-hole near Metro Station Gate 3 is heavily clogged and overflowing with wastewater.");
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [ingestionState]);

  // Proposal compile simulation
  useEffect(() => {
    let interval: any;
    if (proposalStatus === 'compiling') {
      setProposalProgress(0);
      interval = setInterval(() => {
        setProposalProgress((prev) => {
          if (prev >= 100) {
            setProposalStatus('approved');
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [proposalStatus]);

  // Handle vouch increments
  const handleVouch = (team: 'kolkata' | 'bengaluru' | 'mumbai') => {
    if (vouchedTeams[team]) return;
    setVouches(prev => ({
      ...prev,
      [team]: prev[team] + 1
    }));
    setVouchedTeams(prev => ({
      ...prev,
      [team]: true
    }));
  };

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterName.trim() && newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setTimeout(() => {
        setNewsletterSuccess(false);
        setNewsletterName('');
        setNewsletterEmail('');
      }, 5000);
    }
  };

  // Redirect logged-in users to their respective dashboards
  if (user) {
    if (user.role === 'citizen') return <Navigate to="/citizen/dashboard" replace />;
    if (user.role === 'developer') return <Navigate to="/developer/dashboard" replace />;
    if (user.role === 'mp') return <Navigate to="/mp/dashboard" replace />;
  }

  // Hotspots definitions for Interactive Map
  const hotspots = [
    { id: 0, ward: "Ward 42 - Sector V", issue: "Water Deficit / Leakage", stress: 94, gap: "High (No sensor feedback)", coordinates: "85m from metro Hub" },
    { id: 1, ward: "Ward 18 - Salt Lake", issue: "Pothole Congestion", stress: 78, gap: "Medium (Periodic patches)", coordinates: "12m from main cross" },
    { id: 2, ward: "Ward 31 - Lake Town", issue: "Transformer Failure", stress: 88, gap: "Critical (Grid overload)", coordinates: "Inside Block B substation" },
  ];

  return (
    <div className="bg-[#F0F2F5] min-h-screen text-[#4B5563] font-montserrat relative overflow-x-hidden select-none" id="landing-page">
      
      {/* Decorative Vector Orange Arrows (Hero Display Accents) */}
      <div className="absolute top-[25%] left-[-10%] md:left-[5%] w-[350px] h-[350px] opacity-10 pointer-events-none transition-transform duration-1000 hover:rotate-12">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#F97316]">
          <path d="M10 90 L80 20 M80 20 L50 20 M80 20 L80 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 90 L90 30" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-[18%] right-[-10%] md:right-[2%] w-[450px] h-[450px] opacity-[0.08] pointer-events-none transition-transform duration-1000 hover:-rotate-12">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#F97316]">
          <path d="M10 80 L85 15 M85 15 L55 15 M85 15 L85 45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      </div>

      {/* SECTION 1: TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#F0F2F5]/80 backdrop-blur-md border-b border-[#D1D9E6]/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Branding */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-xl font-[900] tracking-[-0.05em] text-[#111827] uppercase">
              CIVIC<span className="text-[#10B981]">FORGE</span>
            </Link>
            <span className="bg-[#111827] text-[#10B981] text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
              BENTO SYSTEM
            </span>
          </div>

          {/* Right Interactive Items */}
          <div className="flex items-center space-x-6">
            <a 
              href="#about-us" 
              className="text-xs font-bold text-[#4B5563] hover:text-[#111827] transition-colors uppercase tracking-wider"
            >
              About Us
            </a>
            
            <Link 
              to="/login" 
              className="text-xs font-bold text-[#4B5563] hover:text-[#111827] px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF]"
            >
              Sign In
            </Link>

            <Link 
              to="/register" 
              className="text-xs font-[900] text-white bg-[#10B981] hover:bg-[#0ea572] px-6 py-3 rounded-xl transition-all uppercase tracking-wider shadow-[4px_4px_12px_rgba(16,185,129,0.3),-4px_-4px_12px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15)] hover:translate-y-[-1px]"
            >
              Get Started
            </Link>
          </div>

        </div>
      </header>

      {/* SECTION 2: HERO DISPLAY & TEXT INJECTOR */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* AI Banner Tag */}
          <div className="inline-flex items-center space-x-2 bg-[#F0F2F5] px-5 py-2.5 rounded-full mb-10 shadow-[6px_6px_12px_#D1D9E6,-6px_-6px_12px_#FFFFFF] border border-white/40">
            <Sparkles className="w-4 h-4 text-[#F97316] animate-pulse" />
            <span className="text-[10px] font-black text-[#111827] uppercase tracking-widest">
              AI-Powered Constituency Development Planning
            </span>
          </div>

          {/* Main Title Block */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-[900] tracking-[-0.05em] leading-[0.95] text-[#111827] uppercase max-w-4xl">
            FORGING DATA-DRIVEN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#0D9488] to-[#1E3A8A]">
              CONSTITUENCY
            </span>{' '}
            PROGRESS.
          </h1>

          {/* Geometric Accent Line */}
          <div className="w-24 h-1.5 bg-[#F97316] my-8 rounded-full shadow-sm"></div>

          {/* Sub-Headline */}
          <p className="text-sm sm:text-base text-[#4B5563] font-normal leading-relaxed max-w-3xl">
            A dual-engine civic-tech ecosystem. Citizens lodge localized infrastructure grievances; 
            developers construct deployable software prototypes, and MPs harness data fusion to prioritize funding-ready projects.
          </p>

          {/* CTA Cluster */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto text-center text-xs font-[900] text-white bg-[#F97316] hover:bg-[#ea6305] px-10 py-4 rounded-full transition-all uppercase tracking-widest shadow-[6px_6px_15px_rgba(249,115,22,0.35),-6px_-6px_15px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15)] hover:translate-y-[-1px]"
            >
              Create Your Account
            </Link>
            
            <Link
              to="/login"
              className="w-full sm:w-auto text-center text-xs font-[900] text-[#111827] bg-[#F0F2F5] px-10 py-4 rounded-full transition-all uppercase tracking-widest shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:text-[#F97316]"
            >
              Sign In to Dashboard
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 3: THREE-STEP CORE PROCESS CARDS */}
      <section className="py-20 bg-gradient-to-b from-transparent to-[#EBF0F6]/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center">
            <span className="text-[#10B981] text-xs font-black uppercase tracking-widest">HOW IT WORKS</span>
            <h2 className="text-2xl sm:text-3xl font-[900] tracking-[-0.04em] text-[#111827] mt-1 uppercase">
              The Three-Step Core Engine
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* Card 1 */}
            <div className="bg-[#F0F2F5] p-8 rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/50 relative overflow-hidden flex flex-col justify-between group hover:translate-y-[-4px] transition-all duration-300">
              <div className="space-y-4">
                <span className="block text-4xl font-[900] text-[#F97316] tracking-tighter">1.</span>
                <h3 className="text-lg font-[900] text-[#111827] uppercase tracking-tight">Citizens Submit</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Lodge geotagged complaints with photos or real-time voice notes. Gemini automatically transcribes and scores distress, creating 'Civic RFPs'.
                </p>
              </div>
              <div className="w-10 h-10 mt-6 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#F97316] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF]">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F0F2F5] p-8 rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/50 relative overflow-hidden flex flex-col justify-between group hover:translate-y-[-4px] transition-all duration-300">
              <div className="space-y-4">
                <span className="block text-4xl font-[900] text-[#0D9488] tracking-tighter">2.</span>
                <h3 className="text-lg font-[900] text-[#111827] uppercase tracking-tight">Developers Prototype</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Browse classified community demands. Submit open-source technical solutions (apps, IoT hardware) to win public validation and vouches.
                </p>
              </div>
              <div className="w-10 h-10 mt-6 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#0D9488] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF]">
                <Cpu className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F0F2F5] p-8 rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/50 relative overflow-hidden flex flex-col justify-between group hover:translate-y-[-4px] transition-all duration-300">
              <div className="space-y-4">
                <span className="block text-4xl font-[900] text-[#1E3A8A] tracking-tighter">3.</span>
                <h3 className="text-lg font-[900] text-[#111827] uppercase tracking-tight">MPs Authorize</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Evaluate real-time urgency heatmaps. Match citizen issues to developer tools, and one-click generate budget proposals using Gemini.
                </p>
              </div>
              <div className="w-10 h-10 mt-6 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#1E3A8A] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF]">
                <Landmark className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: CORE CHARACTER PILLARS (PNG ASSET TARGETS) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center">
            <span className="text-[#F97316] text-xs font-black uppercase tracking-widest font-sans">MEET THE ECOSYSTEM</span>
            <h2 className="text-2xl sm:text-3xl font-[900] tracking-[-0.04em] text-[#111827] mt-1 uppercase">
              Core Character Pillars
            </h2>
            <p className="text-xs text-[#4B5563] mt-2 font-normal max-w-2xl mx-auto">
              Empowering three critical stakeholders with specialized tools and layouts. Direct injection targets listed below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Pillar 1: Citizen */}
            <div className="bg-white rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] overflow-hidden flex flex-col justify-between border border-[#D1D9E6]/30 group">
              <div className="bg-[#F97316] p-6 text-white relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">CIVIC ROLE</span>
                    <h3 className="text-xl font-[900] mt-1 uppercase">The Citizen</h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white hover:text-[#F97316] transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Standing cutout asset placeholder with modern stylized SVG illustration */}
                <div className="mt-8 rounded-[32px] p-4 border border-white/20 bg-white/90 text-center relative h-64 flex items-end justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/5 via-transparent to-transparent pointer-events-none" />
                  <img
                    src={citizenImg}
                    alt="Citizen character"
                    className="relative z-10 max-w-[220px] w-full h-auto object-contain"
                  />
              </div>

              <div className="p-8 space-y-4">
                <span className="text-[#F97316] text-[10px] font-black uppercase tracking-widest block">Role Functions</span>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Citizen Role Details: Track active localized infrastructure demand feeds, review community validation lists, and deploy multi-format intake reports.
                </p>
                <div className="pt-2">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center space-x-1 text-xs font-[900] text-[#F97316] hover:text-[#ea6305] uppercase tracking-wider"
                  >
                    <span>Lodge Complaints</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pillar 2: Developer */}
            <div className="bg-white rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] overflow-hidden flex flex-col justify-between border border-[#D1D9E6]/30 group">
              <div className="bg-[#0D9488] p-6 text-white relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">BUILD ROLE</span>
                    <h3 className="text-xl font-[900] mt-1 uppercase">The Developer</h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white hover:text-[#0D9488] transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Standing cutout asset placeholder with modern stylized SVG illustration */}
                <div className="mt-8 bg-white/10 rounded-2xl p-4 border border-white/20 text-center relative h-56 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  
                  {/* Stylized CSS/SVG Dev Avatar */}
                  <svg className="w-24 h-24 mb-2 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                  </svg>

                  <span className="text-[9px] font-black tracking-wider uppercase text-white/90 bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                    [Developer Clear PNG Placement Area]
                  </span>
                  <span className="text-[8px] mt-1 text-white/70 block italic">Curly Hair Tech Enthusiast Avatar Placeholder</span>
                </div>
              </div>

              <div className="p-8 space-y-4">
                <span className="text-[#0D9488] text-[10px] font-black uppercase tracking-widest block">Role Functions</span>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Developer Role Details: Browse priority system requests for proposal (RFPs), link operational GitHub repository links, and submit technical builds.
                </p>
                <div className="pt-2">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center space-x-1 text-xs font-[900] text-[#0D9488] hover:text-[#0b7d73] uppercase tracking-wider"
                  >
                    <span>Browse Open RFPs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pillar 3: MP Representative */}
            <div className="bg-white rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] overflow-hidden flex flex-col justify-between border border-[#D1D9E6]/30 group">
              <div className="bg-[#1E3A8A] p-6 text-white relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">DECIDE ROLE</span>
                    <h3 className="text-xl font-[900] mt-1 uppercase">The Representative</h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white hover:text-[#1E3A8A] transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Standing cutout asset placeholder with modern stylized SVG illustration */}
                <div className="mt-8 bg-white/10 rounded-2xl p-4 border border-white/20 text-center relative h-56 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  
                  {/* Stylized CSS/SVG MP Avatar */}
                  <svg className="w-24 h-24 mb-2 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                  </svg>

                  <span className="text-[9px] font-black tracking-wider uppercase text-white/90 bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                    [MP Clear PNG Placement Area]
                  </span>
                  <span className="text-[8px] mt-1 text-white/70 block italic">Formal Representative / MP Avatar Placeholder</span>
                </div>
              </div>

              <div className="p-8 space-y-4">
                <span className="text-[#1E3A8A] text-[10px] font-black uppercase tracking-widest block">Role Functions</span>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Administrative Role Details: Analyze live constituency heatmaps, map public regional deficits, and confirm automated execution funding proposal metrics.
                </p>
                <div className="pt-2">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center space-x-1 text-xs font-[900] text-[#1E3A8A] hover:text-[#162a63] uppercase tracking-wider"
                  >
                    <span>Allocate Funds</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: SYSTEM FEATURE BREAKDOWN PANELS */}
      <section className="py-24 bg-gradient-to-b from-[#EBF0F6]/20 to-[#F0F2F5] border-t border-[#D1D9E6]/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-24">
          
          <div className="text-center">
            <span className="text-[#0D9488] text-xs font-black uppercase tracking-widest block">PLATFORM REVELATIONS</span>
            <h2 className="text-2xl sm:text-3xl font-[900] tracking-[-0.04em] text-[#111827] mt-1 uppercase">
              System Feature Breakdown
            </h2>
            <p className="text-xs text-[#4B5563] mt-2 font-normal max-w-2xl mx-auto">
              Interactive playground dashboards demonstrating true backend power. Click, test, and experience the features below.
            </p>
          </div>

          <div className="space-y-20">

            {/* Feature 1: Omnichannel Ingestion Platform */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] animate-pulse"></span>
                  <span className="text-[9px] font-black text-[#111827] uppercase tracking-wider">MODULE 01</span>
                </div>
                <h3 className="text-2xl font-[900] text-[#111827] uppercase tracking-tight">
                  Omnichannel Ingestion Platform
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Capture grassroots data seamlessly. Whispers AI processes verbal local complaints on-the-fly, transcribing multi-format recordings instantly. Exact GPS locations and photos bypass manual clerical checks.
                </p>
                <div className="bg-[#F0F2F5] p-4 rounded-2xl border border-white/60 shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]">
                  <span className="text-[10px] font-black text-[#111827] uppercase block mb-1">Empirical Parameters:</span>
                  <p className="text-[11px] text-[#4B5563] font-light">
                    • Multi-Format Intake (MPEG, WAV, PNG, WEBP) <br />
                    • Automatic Speech Recognition via Google Cloud AI <br />
                    • Geotag Coordinate Binding accuracy &lt; 5 meters.
                  </p>
                </div>
              </div>

              {/* Ingestion Interactive Panel */}
              <div className="lg:col-span-7 bg-[#F0F2F5] p-6 rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/60">
                <div className="bg-white rounded-2xl p-6 border border-[#D1D9E6]/30 space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-[10px] font-black text-[#111827] uppercase tracking-wider">Live Citizen Recorder</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#4B5563] uppercase bg-[#F0F2F5] px-2.5 py-1 rounded">
                      Status: {ingestionState === 'idle' ? 'Ready' : ingestionState === 'recording' ? 'Recording' : 'Transcribed'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    {ingestionState === 'idle' && (
                      <button 
                        onClick={() => setIngestionState('recording')}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-[4px_4px_12px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
                      >
                        <Mic className="w-6 h-6 animate-pulse" />
                      </button>
                    )}

                    {ingestionState === 'recording' && (
                      <button 
                        onClick={() => setIngestionState('completed')}
                        className="w-16 h-16 rounded-full bg-[#111827] text-white flex items-center justify-center shadow-[4px_4px_12px_rgba(17,24,39,0.3)] transition-all cursor-pointer animate-pulse"
                      >
                        <Square className="w-5 h-5" />
                      </button>
                    )}

                    {ingestionState === 'completed' && (
                      <button 
                        onClick={() => {
                          setIngestionState('idle');
                          setVoiceTranscript('');
                        }}
                        className="text-xs font-black text-[#F97316] uppercase tracking-widest bg-[#F0F2F5] px-4 py-2.5 rounded-xl shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF] cursor-pointer"
                      >
                        Record Again
                      </button>
                    )}

                    <div className="text-center">
                      <p className="text-xs font-black text-[#111827] uppercase">
                        {ingestionState === 'idle' && "Click mic to record complaint voice-note"}
                        {ingestionState === 'recording' && `Recording Voice... 0:0${seconds}s`}
                        {ingestionState === 'completed' && "✓ Audio Processing Complete!"}
                      </p>
                      <span className="text-[10px] text-[#4B5563] font-light mt-1 block">
                        Simulating raw sensor / voice capture
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Transcript Output Box */}
                  <div className="bg-[#F0F2F5] p-4 rounded-xl shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] relative min-h-16 flex items-center justify-center text-center">
                    {ingestionState === 'recording' && (
                      <div className="flex space-x-1.5 items-center justify-center">
                        <span className="w-1.5 h-6 bg-[#F97316] animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1.5 h-8 bg-[#F97316] animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-5 bg-[#F97316] animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        <span className="w-1.5 h-7 bg-[#F97316] animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    )}
                    {ingestionState === 'idle' && (
                      <p className="text-[11px] text-[#4B5563] italic">"Transcription results will display here..."</p>
                    )}
                    {ingestionState === 'completed' && (
                      <div className="space-y-1">
                        <p className="text-xs text-[#111827] font-semibold leading-relaxed">"{voiceTranscript}"</p>
                        <span className="text-[9px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full font-black uppercase inline-block">
                          AI Transcribed • Distressed Level: High
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* Feature 2: Geospatial Data Fusion Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Geospatial Interactive Panel */}
              <div className="lg:col-span-7 bg-[#F0F2F5] p-6 rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/60 lg:order-1 order-2">
                <div className="bg-white rounded-2xl p-6 border border-[#D1D9E6]/30 space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></span>
                      <span className="text-[10px] font-black text-[#111827] uppercase tracking-wider">Ward Urgency Matrix Map</span>
                    </div>
                    <span className="text-[9px] text-[#0D9488] font-black uppercase bg-[#0D9488]/10 px-2.5 py-1 rounded">
                      MongoDB 2dsphere Enabled
                    </span>
                  </div>

                  {/* Mock Map Grid */}
                  <div className="grid grid-cols-3 gap-3 bg-[#F0F2F5] p-3.5 rounded-2xl">
                    {hotspots.map((h, idx) => (
                      <div 
                        key={h.id}
                        onClick={() => setActiveHotspot(idx)}
                        className={`p-4 rounded-xl transition-all cursor-pointer text-center relative ${
                          activeHotspot === idx 
                          ? 'bg-white border-2 border-[#0D9488] shadow-[4px_4px_10px_#D1D9E6]' 
                          : 'bg-[#F0F2F5] hover:bg-white/40 shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF]'
                        }`}
                      >
                        {/* Hotspot Priority Ring */}
                        <span className={`w-3.5 h-3.5 rounded-full absolute top-2 right-2 border-2 border-white ${
                          h.stress >= 90 ? 'bg-red-500' : h.stress >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span className="text-[10px] font-black block text-[#111827] uppercase tracking-tighter">{h.ward}</span>
                        <span className="text-[14px] font-[900] block text-[#111827] mt-1">{h.stress}%</span>
                        <span className="text-[8px] font-black uppercase text-[#4B5563] tracking-wider block">Stress</span>
                      </div>
                    ))}
                  </div>

                  {/* Hotspot details rendering */}
                  <div className="bg-[#F0F2F5] p-4.5 rounded-xl shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#111827] uppercase">{hotspots[activeHotspot].ward}</span>
                      <span className="text-[9px] font-extrabold text-[#0D9488] uppercase bg-white px-2 py-0.5 rounded shadow-sm">
                        {hotspots[activeHotspot].coordinates}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider block text-[#4B5563] font-black">Identified Grievance:</span>
                        <p className="font-semibold text-[#111827]">{hotspots[activeHotspot].issue}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider block text-[#4B5563] font-black">Infrastructure Deficit:</span>
                        <p className="font-semibold text-[#111827]">{hotspots[activeHotspot].gap}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="lg:col-span-5 space-y-6 lg:order-2 order-1">
                <div className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse"></span>
                  <span className="text-[9px] font-black text-[#111827] uppercase tracking-wider">MODULE 02</span>
                </div>
                <h3 className="text-2xl font-[900] text-[#111827] uppercase tracking-tight">
                  Geospatial Data Fusion Heatmap
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  MongoDB 2dsphere indexing and spatial queries audit physical travel gaps automatically. By cross-referencing citizen distress with census metrics, we define genuine community priorities. No guess work, pure spatial transparency.
                </p>
                <div className="bg-[#F0F2F5] p-4 rounded-2xl border border-white/60 shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]">
                  <span className="text-[10px] font-black text-[#111827] uppercase block mb-1">Spatial Metrics:</span>
                  <p className="text-[11px] text-[#4B5563] font-light">
                    • Exact Coordinate Geometry indexing <br />
                    • Distance-decay algorithm computing regional deficit <br />
                    • Multi-source map overlay tracking live problem clusters.
                  </p>
                </div>
              </div>

            </div>

            {/* Feature 3: Developer Leaderboard & Solution Matchmaker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse"></span>
                  <span className="text-[9px] font-black text-[#111827] uppercase tracking-wider">MODULE 03</span>
                </div>
                <h3 className="text-2xl font-[900] text-[#111827] uppercase tracking-tight">
                  Developer Leaderboard & Matchmaker
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  Algorithmic matchmaking pairs incoming community grievances directly to registered open-source builds. Developers submit Github repository links, and citizens click to vouch. The most voted solutions gain high official deployment priority.
                </p>
                <div className="bg-[#F0F2F5] p-4 rounded-2xl border border-white/60 shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]">
                  <span className="text-[10px] font-black text-[#111827] uppercase block mb-1">Matchmaker Ticker:</span>
                  <p className="text-[11px] text-[#4B5563] font-light">
                    • Open Github API integration verifying prototype state <br />
                    • Public vouch weight algorithm preventing bots <br />
                    • Leaderboard badge tracking successful municipal releases.
                  </p>
                </div>
              </div>

              {/* Leaderboard Interactive Panel */}
              <div className="lg:col-span-7 bg-[#F0F2F5] p-6 rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/60">
                <div className="bg-white rounded-2xl p-6 border border-[#D1D9E6]/30 space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-3">
                    <span className="text-[10px] font-black text-[#111827] uppercase tracking-wider">Public Developer Standings</span>
                    <span className="text-[9px] font-black text-[#F97316] uppercase bg-[#F97316]/10 px-2 py-0.5 rounded">
                      Community Vote Active
                    </span>
                  </div>

                  {/* Leaderboard Rows */}
                  <div className="space-y-3">
                    
                    {/* Row 1 */}
                    <div className="flex items-center justify-between bg-[#F0F2F5] p-3.5 rounded-xl border border-white/60 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-[#111827] text-[#10B981] text-xs font-black flex items-center justify-center font-mono">#1</span>
                        <div>
                          <span className="text-xs font-[900] text-[#111827] block uppercase">Kolkata Code Brigade</span>
                          <div className="flex space-x-1.5 mt-0.5">
                            <span className="text-[7px] font-bold bg-[#111827] text-white px-1.5 py-0.2 rounded uppercase">YOLOv8</span>
                            <span className="text-[7px] font-bold bg-[#111827] text-white px-1.5 py-0.2 rounded uppercase">React</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleVouch('kolkata')}
                        className={`text-[9px] font-black uppercase px-3 py-2 rounded-lg flex items-center space-x-1 transition-all ${
                          vouchedTeams.kolkata 
                          ? 'bg-[#10B981] text-white cursor-default' 
                          : 'bg-white text-[#F97316] shadow-sm hover:bg-[#F0F2F5] cursor-pointer'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${vouchedTeams.kolkata ? 'fill-white' : 'fill-transparent'}`} />
                        <span>{vouches.kolkata} {vouchedTeams.kolkata ? 'Vouched!' : 'Vouch'}</span>
                      </button>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-center justify-between bg-[#F0F2F5] p-3.5 rounded-xl border border-white/60 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-[#F0F2F5] text-[#111827] text-xs font-black flex items-center justify-center font-mono shadow-[inset_1px_1px_2px_#D1D9E6]">#2</span>
                        <div>
                          <span className="text-xs font-[900] text-[#111827] block uppercase">Bengaluru Tech Guild</span>
                          <div className="flex space-x-1.5 mt-0.5">
                            <span className="text-[7px] font-bold bg-[#111827] text-white px-1.5 py-0.2 rounded uppercase">LoRaWAN</span>
                            <span className="text-[7px] font-bold bg-[#111827] text-white px-1.5 py-0.2 rounded uppercase">NodeJS</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleVouch('bengaluru')}
                        className={`text-[9px] font-black uppercase px-3 py-2 rounded-lg flex items-center space-x-1 transition-all ${
                          vouchedTeams.bengaluru 
                          ? 'bg-[#10B981] text-white cursor-default' 
                          : 'bg-white text-[#F97316] shadow-sm hover:bg-[#F0F2F5] cursor-pointer'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${vouchedTeams.bengaluru ? 'fill-white' : 'fill-transparent'}`} />
                        <span>{vouches.bengaluru} {vouchedTeams.bengaluru ? 'Vouched!' : 'Vouch'}</span>
                      </button>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-center justify-between bg-[#F0F2F5] p-3.5 rounded-xl border border-white/60 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-[#F0F2F5] text-[#111827] text-xs font-black flex items-center justify-center font-mono shadow-[inset_1px_1px_2px_#D1D9E6]">#3</span>
                        <div>
                          <span className="text-xs font-[900] text-[#111827] block uppercase">Mumbai Edge Labs</span>
                          <div className="flex space-x-1.5 mt-0.5">
                            <span className="text-[7px] font-bold bg-[#111827] text-white px-1.5 py-0.2 rounded uppercase">Python</span>
                            <span className="text-[7px] font-bold bg-[#111827] text-white px-1.5 py-0.2 rounded uppercase">Mqtt</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleVouch('mumbai')}
                        className={`text-[9px] font-black uppercase px-3 py-2 rounded-lg flex items-center space-x-1 transition-all ${
                          vouchedTeams.mumbai 
                          ? 'bg-[#10B981] text-white cursor-default' 
                          : 'bg-white text-[#F97316] shadow-sm hover:bg-[#F0F2F5] cursor-pointer'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${vouchedTeams.mumbai ? 'fill-white' : 'fill-transparent'}`} />
                        <span>{vouches.mumbai} {vouchedTeams.mumbai ? 'Vouched!' : 'Vouch'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>

            </div>

            {/* Feature 4: One-Click Funding Proposal Generator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Proposal Interactive Panel */}
              <div className="lg:col-span-7 bg-[#F0F2F5] p-6 rounded-[32px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/60 lg:order-1 order-2">
                <div className="bg-white rounded-2xl p-6 border border-[#D1D9E6]/30 space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></span>
                      <span className="text-[10px] font-black text-[#111827] uppercase tracking-wider">AI Procurement Drawer</span>
                    </div>
                    <span className="text-[9px] text-[#1E3A8A] font-black uppercase bg-[#1E3A8A]/10 px-2 py-0.5 rounded">
                      Gemini Blueprint SDK
                    </span>
                  </div>

                  {/* Proposal status visualizer */}
                  <div className="bg-[#F0F2F5] p-4.5 rounded-xl border border-white/40 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-black text-[#111827] uppercase border-b border-[#D1D9E6]/30 pb-2">
                      <span>PROJECT DRAFT: WATER-WARD-42</span>
                      <span className="text-xs tracking-mono font-mono text-[#F97316]">
                        {proposalStatus === 'idle' && "PENDING SIGNATURE"}
                        {proposalStatus === 'compiling' && `COMPILING ${proposalProgress}%`}
                        {proposalStatus === 'approved' && "✓ SIGNED & APPROVED"}
                      </span>
                    </div>

                    <div className="space-y-2 text-[10px] leading-relaxed">
                      <p>
                        <strong>CONSTITUENCY GAP:</strong> Ward 42 sector V reports 94% stress score on water leakage. Manual pipeline repairs have been delayed.
                      </p>
                      <p>
                        <strong>DEVELOPER TOOL PATH:</strong> Kolkata Code Brigade has designed the 'AquaSensor Leak-Guard' utilizing React and Python.
                      </p>
                      <p>
                        <strong>BUDGET PROPOSAL ALLOCATION:</strong> $45,000.00 authorized to cover regional LoRa sensor arrays and deployment pipeline.
                      </p>
                    </div>

                    {proposalStatus === 'compiling' && (
                      <div className="w-full bg-white rounded-full h-2 shadow-[inset_1px_1px_3px_#D1D9E6]">
                        <div 
                          className="bg-[#1E3A8A] h-2 rounded-full transition-all duration-150" 
                          style={{ width: `${proposalProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    {proposalStatus === 'idle' && (
                      <button 
                        onClick={() => setProposalStatus('compiling')}
                        className="bg-[#1E3A8A] hover:bg-[#162a63] text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-[4px_4px_10px_rgba(30,58,138,0.25)] transition-all cursor-pointer"
                      >
                        Authorize Funds ($45K)
                      </button>
                    )}
                    {proposalStatus === 'compiling' && (
                      <button 
                        disabled
                        className="bg-[#4B5563] text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-xl opacity-50 cursor-not-allowed"
                      >
                        Compiling Proposal...
                      </button>
                    )}
                    {proposalStatus === 'approved' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-[#10B981] uppercase tracking-wide">✓ Budget Released Successfully</span>
                        <button 
                          onClick={() => setProposalStatus('idle')}
                          className="text-[9px] font-black uppercase text-[#1E3A8A] border-b border-[#1E3A8A] ml-2 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div className="lg:col-span-5 space-y-6 lg:order-2 order-1">
                <div className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse"></span>
                  <span className="text-[9px] font-black text-[#111827] uppercase tracking-wider">MODULE 04</span>
                </div>
                <h3 className="text-2xl font-[900] text-[#111827] uppercase tracking-tight">
                  One-Click Funding proposal
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                  No more bureaucratic delays. Representatives analyze the verified data metrics of any grievance alongside matched developer tools. Click to execute the Gemini blueprint engine, instantly formatting ready budget drafts for formal state records.
                </p>
                <div className="bg-[#F0F2F5] p-4 rounded-2xl border border-white/60 shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]">
                  <span className="text-[10px] font-black text-[#111827] uppercase block mb-1">State Features:</span>
                  <p className="text-[11px] text-[#4B5563] font-light">
                    • Instant structural document drafting using Gemini <br />
                    • Public expenditure transparency verification <br />
                    • MP authorization ledger logs.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: FINAL FOOTER & ABOUT US EXTENSION */}
      <footer className="bg-gradient-to-t from-[#E2E8F0] to-[#F0F2F5] border-t border-[#D1D9E6] pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* The Resolution Banner Panel */}
          <div className="bg-[#F0F2F5] p-10 rounded-[40px] shadow-[12px_12px_24px_#D1D9E6,-12px_-12px_24px_#FFFFFF] border border-white/80 space-y-8 text-center flex flex-col items-center">
            
            <div className="space-y-2">
              <span className="text-[#F97316] text-[10px] font-black uppercase tracking-widest block">JOIN THE MOVEMENT</span>
              <h2 className="text-2xl sm:text-4xl font-[900] tracking-[-0.04em] text-[#111827] uppercase leading-tight max-w-4xl">
                ALIGNING VISION, TALENT, AND EXECUTION. <br />
                READY TO TRANSFORM REGIONAL DEVELOPMENT FRAMEWORKS?
              </h2>
            </div>

            {/* Widescreen 3-Character Handshake PNG Overlay Section with CSS layout */}
            <div className="w-full max-w-4xl bg-white/40 border border-[#D1D9E6]/40 p-6 rounded-3xl relative overflow-hidden h-72 flex flex-col items-center justify-center text-center shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F97316]/5 via-[#0D9488]/5 to-[#1E3A8A]/5 pointer-events-none"></div>
              
              {/* Conceptual Handshake SVG & stylized graphics */}
              <div className="flex items-center justify-center space-x-8 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#F97316]/15 flex items-center justify-center text-[#F97316] border border-[#F97316]/30">
                  <User className="w-5 h-5" />
                </div>
                <div className="w-8 h-[2px] bg-gradient-to-r from-[#F97316] to-[#0D9488]"></div>
                <div className="w-16 h-16 rounded-full bg-[#10B981]/15 flex items-center justify-center text-[#10B981] border-2 border-[#10B981]/40 shadow-sm animate-pulse">
                  <Users className="w-7 h-7" />
                </div>
                <div className="w-8 h-[2px] bg-gradient-to-r from-[#0D9488] to-[#1E3A8A]"></div>
                <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/15 flex items-center justify-center text-[#1E3A8A] border border-[#1E3A8A]/30">
                  <Laptop className="w-5 h-5" />
                </div>
              </div>

              <span className="text-[10px] font-black tracking-widest uppercase text-[#111827] bg-[#F0F2F5] px-4 py-2 rounded-full shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF] border border-white/50 block">
                [Widescreen 3-Character Handshake PNG Overlay Section]
              </span>
              <span className="text-[8px] text-[#4B5563] mt-2 block italic">
                Stakeholder Handshake (Citizen, Developer, MP) Landscape Graphic Placement Slot
              </span>
            </div>

            {/* Newsletter Subscription Box */}
            <form onSubmit={handleSubscribe} className="w-full max-w-xl space-y-4">
              <p className="text-xs font-black uppercase text-[#111827] tracking-wider">
                Subscribe to local constituency reports & releases
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  required
                  placeholder="Enter Your Name"
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  className="w-full bg-[#F0F2F5] px-4 py-3.5 text-xs font-bold text-[#111827] placeholder-[#4B5563]/50 rounded-xl focus:outline-none shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]"
                />
                <input 
                  type="email" 
                  required
                  placeholder="Enter Email Address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-[#F0F2F5] px-4 py-3.5 text-xs font-bold text-[#111827] placeholder-[#4B5563]/50 rounded-xl focus:outline-none shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#111827] hover:bg-[#1a2333] text-white text-xs font-black uppercase tracking-widest py-4 px-6 rounded-xl shadow-[4px_4px_12px_rgba(17,24,39,0.2)] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                Subscribe to Releases
              </button>

              {newsletterSuccess && (
                <div className="text-xs font-bold text-[#10B981] uppercase animate-fade-in">
                  ✓ Success! You have subscribed to the CivicForge constituency releases.
                </div>
              )}
            </form>

          </div>

          {/* Extended About Us Content Box (Anchor ID: about-us) */}
          <div id="about-us" className="bg-[#F0F2F5] p-8 sm:p-12 rounded-[40px] shadow-[8px_8px_16px_#D1D9E6,-8px_-8px_16px_#FFFFFF] border border-white/50 space-y-6 scroll-mt-24">
            <div className="border-b border-[#D1D9E6] pb-4">
              <span className="text-[#0D9488] text-xs font-black uppercase tracking-widest block">FOUNDING PHILOSOPHY</span>
              <h3 className="text-xl sm:text-2xl font-[900] text-[#111827] uppercase tracking-tight mt-1">About Us & Mission</h3>
            </div>
            
            <div className="space-y-4 text-xs leading-relaxed font-normal text-[#4B5563]">
              <p>
                The CivicForge platform is an execution-layer ecosystem built to replace manual bureaucracy with empirical data processing. By merging qualitative public feedback with spatial geographic analytics, we empower local technical communities to deploy targeted infrastructure fixes seamlessly from day one.
              </p>
              <p>
                We believe that municipal development shouldn't be stalled behind long paper trails and black-box planning. By allowing citizens to submit direct, voice-transcribed grievances, developers to map their active open-source prototype capabilities, and representatives to immediately authorize verified projects, we form a direct loop from grievance to deployment.
              </p>
            </div>
          </div>

          {/* Bottom Meta Tagline Block */}
          <div className="border-t border-[#D1D9E6] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-[#4B5563]">
            <p className="uppercase tracking-wider text-center md:text-left">
              &copy; 2026 CivicForge. All rights reserved. Under open data directives.
            </p>
            <p className="uppercase tracking-[0.15em] text-center md:text-right font-[900] text-[#111827]">
              A PROJECT BY TEAM TEESMAARKHACODERS
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

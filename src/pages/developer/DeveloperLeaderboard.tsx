import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  MapPin, 
  Search, 
  Trophy, 
  Star, 
  Heart, 
  Laptop, 
  Flame,
  UserCheck
} from 'lucide-react';

interface LeaderboardEntry {
  developer: {
    _id: string;
    name: string;
    email: string;
    region?: string;
  };
  totalVouches: number;
  solutionCount: number;
  hasDeployedBadge: boolean;
}

export const DeveloperLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchRegion, setSearchRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTooltipForDevId, setShowTooltipForDevId] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/leaderboard/developers');
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to retrieve leaderboard', err);
      toast.error('Failed to load developer leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(entry => {
    if (!searchRegion) return true;
    return entry.developer?.region?.toLowerCase().includes(searchRegion.toLowerCase());
  });

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 border border-amber-500/30 shadow-[inset_1px_1px_2px_#FFFFFF] animate-pulse">
            <Trophy className="w-4 h-4 fill-amber-500" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 border border-slate-300/30 shadow-[inset_1px_1px_2px_#FFFFFF]">
            <Trophy className="w-4 h-4 fill-slate-300" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100/60 text-amber-700 border border-amber-700/30 shadow-[inset_1px_1px_2px_#FFFFFF]">
            <Trophy className="w-4 h-4 fill-amber-700" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF6ED] border border-[#E5DEC9]/60 text-xs font-mono font-black text-[#9A8C7F] shadow-[inset_1px_1px_2px_rgba(142,130,114,0.08)]">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="bg-[#FAF6ED] min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 text-[#3A2E2B]" id="leaderboard-page">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Hero */}
        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-white/40 shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] relative overflow-hidden">
          <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-bounce" />
                <span className="text-amber-600 text-xs font-black uppercase tracking-widest">Public Leaderboard</span>
              </div>
              <h1 className="text-2xl font-black mt-1 text-[#3A2E2B] uppercase tracking-tight">Top Civic Developers</h1>
              <p className="text-[#9A8C7F] text-xs font-bold mt-1">
                Celebrating open-source contributors who build high-impact prototypes and successfully deploy them to city infrastructure.
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-[#FAF6ED] border border-white/40 p-3 rounded-2xl shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)]">
              <div className="text-center px-4 border-r border-[#E5DEC9]/60">
                <span className="block text-lg font-black text-[#E76F51]">
                  {leaderboard.filter(e => e.hasDeployedBadge).length}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Deployed</span>
              </div>
              <div className="text-center px-4">
                <span className="block text-lg font-black text-[#3F6C51]">{leaderboard.length}</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#9A8C7F]">Developers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF]">
          <div className="flex items-center space-x-2 shrink-0 text-[#9A8C7F]">
            <Search className="w-4 h-4 text-[#3F6C51]" />
            <span className="text-xs font-black uppercase tracking-wider">Search Developers</span>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by regional jurisdiction..."
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value)}
              className="w-full neumorphic-concave px-4 py-2.5 text-xs font-medium text-[#3A2E2B] placeholder-[#9A8C7F]/60 focus:outline-none focus:border-[#3F6C51]"
            />
            <div className="absolute right-3.5 top-3 pointer-events-none text-xs">📍</div>
          </div>
        </div>

        {/* Top 3 Podium Displays for high design impact */}
        {filteredLeaderboard.length >= 3 && !searchRegion && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 2nd Place Card */}
            <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-3 relative hover:border-[#E5DEC9] shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF] transition-all md:order-1 order-2">
              <div className="absolute top-3 left-3 text-[9px] font-black text-[#9A8C7F] uppercase tracking-wider">2nd Place</div>
              {getRankBadge(2)}
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#3A2E2B]">{filteredLeaderboard[1].developer.name}</h3>
                <span className="text-[10px] text-[#9A8C7F] font-bold">{filteredLeaderboard[1].developer.region || 'Remote Hub'}</span>
              </div>
              <div className="flex gap-4 text-xs font-black bg-[#FAF6ED] py-1.5 px-3 rounded-xl border border-white/50 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.06)]">
                <div className="text-[#E76F51] flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-[#E76F51]" />
                  <span>{filteredLeaderboard[1].totalVouches}</span>
                </div>
                <div className="text-[#3F6C51] flex items-center space-x-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{filteredLeaderboard[1].solutionCount}</span>
                </div>
              </div>
            </div>

            {/* 1st Place Card */}
            <div className="bg-[#FFFDF9] border border-amber-500/25 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3.5 relative hover:border-amber-500/40 shadow-[8px_8px_16px_0px_rgba(245,158,11,0.08),-8px_-8px_16px_0px_#FFFFFF] transition-all md:order-2 order-1 transform md:-translate-y-2">
              <div className="absolute top-3 left-3 text-[9px] font-black text-amber-600 flex items-center space-x-1 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span>CHAMPION</span>
              </div>
              {getRankBadge(1)}
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-amber-600 tracking-tight">{filteredLeaderboard[0].developer.name}</h3>
                <span className="text-xs text-[#9A8C7F] font-black">{filteredLeaderboard[0].developer.region || 'Remote Hub'}</span>
              </div>
              <div className="flex gap-4 text-xs font-black bg-[#FAF6ED] py-2 px-4 rounded-xl border border-white/60 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.06)]">
                <div className="text-[#E76F51] flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-[#E76F51]" />
                  <span>{filteredLeaderboard[0].totalVouches}</span>
                </div>
                <div className="text-[#3F6C51] flex items-center space-x-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{filteredLeaderboard[0].solutionCount}</span>
                </div>
              </div>
              {filteredLeaderboard[0].hasDeployedBadge && (
                <span className="bg-emerald-100 text-emerald-700 border border-emerald-500/25 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-[inset_1px_1px_1px_#FFFFFF]">
                  Deployed Solutions
                </span>
              )}
            </div>

            {/* 3rd Place Card */}
            <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-3 relative hover:border-[#E5DEC9] shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF] transition-all md:order-3 order-3">
              <div className="absolute top-3 left-3 text-[9px] font-black text-[#9A8C7F] uppercase tracking-wider">3rd Place</div>
              {getRankBadge(3)}
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#3A2E2B]">{filteredLeaderboard[2].developer.name}</h3>
                <span className="text-[10px] text-[#9A8C7F] font-bold">{filteredLeaderboard[2].developer.region || 'Remote Hub'}</span>
              </div>
              <div className="flex gap-4 text-xs font-black bg-[#FAF6ED] py-1.5 px-3 rounded-xl border border-white/50 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.06)]">
                <div className="text-[#E76F51] flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-[#E76F51]" />
                  <span>{filteredLeaderboard[2].totalVouches}</span>
                </div>
                <div className="text-[#3F6C51] flex items-center space-x-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{filteredLeaderboard[2].solutionCount}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Leaderboard Entries List */}
        {loading ? (
          <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-16 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]">
            <div className="w-8 h-8 border-3 border-[#3F6C51] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[#9A8C7F] font-black text-xs mt-3.5 uppercase tracking-wider">Recalculating developer rankings...</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl p-16 text-center shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] space-y-3">
            <UserCheck className="w-10 h-10 text-[#9A8C7F] mx-auto" />
            <p className="text-[#3A2E2B] text-sm font-black">No registered developers found matching that region.</p>
            <p className="text-[#9A8C7F] text-xs font-bold">Verify your search criteria or register as a developer to join!</p>
          </div>
        ) : (
          <div className="bg-[#FFFDF9] border border-white/40 rounded-3xl overflow-hidden shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF]" id="leaderboard-container">
            {/* Headers row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#FAF6ED]/60 border-b border-[#E5DEC9]/60 text-[10px] font-black uppercase tracking-widest text-[#9A8C7F]">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">Developer Details</div>
              <div className="col-span-2 text-center">Region</div>
              <div className="col-span-2 text-center">Solutions</div>
              <div className="col-span-2 text-center">Vouches</div>
            </div>

            <div className="divide-y divide-[#E5DEC9]/60">
              {filteredLeaderboard.map((entry, idx) => {
                const rank = idx + 1;
                return (
                  <div 
                    key={entry.developer._id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4.5 items-center hover:bg-[#FAF6ED]/50 transition-all relative"
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      {getRankBadge(rank)}
                    </div>

                    {/* Developer Name & Badge */}
                    <div className="col-span-5 flex items-center space-x-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-[#3A2E2B] truncate">{entry.developer.name}</span>
                          
                          {/* Deployed Badge */}
                          {entry.hasDeployedBadge && (
                            <div className="relative inline-block shrink-0">
                              <span 
                                onMouseEnter={() => setShowTooltipForDevId(entry.developer._id)}
                                onMouseLeave={() => setShowTooltipForDevId(null)}
                                className="bg-emerald-100 border border-emerald-500/25 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md cursor-help flex items-center space-x-0.5 shadow-sm"
                              >
                                <Award className="w-2.5 h-2.5" />
                                <span>Deployed</span>
                              </span>

                              {/* Tooltip */}
                              {showTooltipForDevId === entry.developer._id && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-[#FFFDF9] border border-[#E5DEC9]/60 text-[#9A8C7F] text-[10px] leading-relaxed rounded-xl p-2.5 shadow-xl z-50 font-medium">
                                  This elite contributor has successfully transitioned at least one open civic prototype into a fully deployed municipal infrastructure solution!
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-[#9A8C7F] font-mono block truncate">{entry.developer.email}</span>
                      </div>
                    </div>

                    {/* Region */}
                    <div className="col-span-2 text-center min-w-0">
                      {entry.developer.region ? (
                        <span className="inline-flex items-center space-x-0.5 text-xs text-[#9A8C7F] font-bold truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#9A8F7F] shrink-0" />
                          <span className="truncate">{entry.developer.region}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#9A8C7F] font-bold italic">Universal</span>
                      )}
                    </div>

                    {/* Solution count */}
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-mono font-black text-[#3F6C51] bg-[#FAF6ED] border border-[#3F6C51]/20 px-2.5 py-1 rounded-xl shadow-[inset_1px_1px_2px_rgba(142,130,114,0.06)]">
                        {entry.solutionCount}
                      </span>
                    </div>

                    {/* Total Vouches */}
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-mono font-black text-[#E76F51] bg-[#FAF6ED] border border-[#E76F51]/25 px-2.5 py-1 rounded-xl shadow-[inset_1px_1px_2px_rgba(231,111,81,0.06)] inline-flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5 fill-[#E76F51]" />
                        <span>{entry.totalVouches}</span>
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};


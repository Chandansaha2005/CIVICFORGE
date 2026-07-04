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
  HelpCircle,
  TrendingUp,
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
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
            <Trophy className="w-4 h-4 fill-amber-400" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/30">
            <Trophy className="w-4 h-4 fill-slate-300" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/30">
            <Trophy className="w-4 h-4 fill-amber-700" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-400">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 text-white" id="leaderboard-page">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                <span className="text-amber-400 text-xs font-extrabold uppercase tracking-widest">Public Leaderboard</span>
              </div>
              <h1 className="text-2xl font-black mt-1 text-slate-100 uppercase tracking-tight">Top Civic Developers</h1>
              <p className="text-slate-400 text-sm mt-1">
                Celebrating open-source contributors who build high-impact prototypes and successfully deploy them to city infrastructure.
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-slate-950/50 border border-slate-800 p-3 rounded-xl">
              <div className="text-center px-4 border-r border-slate-800">
                <span className="block text-lg font-black text-amber-400">
                  {leaderboard.filter(e => e.hasDeployedBadge).length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deployed</span>
              </div>
              <div className="text-center px-4">
                <span className="block text-lg font-black text-teal-400">{leaderboard.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Developers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-2 shrink-0 text-slate-400">
            <Search className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Search Developers</span>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by regional jurisdiction..."
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-amber-500"
            />
            <div className="absolute right-3.5 top-3 pointer-events-none text-slate-500 text-xs">📍</div>
          </div>
        </div>

        {/* Top 3 Podium Displays for high design impact */}
        {filteredLeaderboard.length >= 3 && !searchRegion && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 2nd Place Card */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 relative hover:border-slate-700 transition-all md:order-1 order-2">
              <div className="absolute top-3 left-3 text-[10px] font-bold text-slate-500 font-mono">2ND PLACE</div>
              {getRankBadge(2)}
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-100">{filteredLeaderboard[1].developer.name}</h3>
                <span className="text-[10px] text-slate-500 font-bold">{filteredLeaderboard[1].developer.region || 'Remote Hub'}</span>
              </div>
              <div className="flex gap-4 text-xs font-bold bg-slate-950/60 py-1 px-3 rounded-lg border border-slate-850">
                <div className="text-rose-400 flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  <span>{filteredLeaderboard[1].totalVouches}</span>
                </div>
                <div className="text-teal-400 flex items-center space-x-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{filteredLeaderboard[1].solutionCount}</span>
                </div>
              </div>
            </div>

            {/* 1st Place Card */}
            <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3.5 relative hover:border-amber-500/30 shadow-xl shadow-amber-500/5 transition-all md:order-2 order-1 transform md:-translate-y-2">
              <div className="absolute top-3 left-3 text-[10px] font-extrabold text-amber-400 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                <span>CHAMPION</span>
              </div>
              {getRankBadge(1)}
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-amber-400 tracking-tight">{filteredLeaderboard[0].developer.name}</h3>
                <span className="text-xs text-slate-400 font-extrabold">{filteredLeaderboard[0].developer.region || 'Remote Hub'}</span>
              </div>
              <div className="flex gap-4 text-xs font-bold bg-slate-950/60 py-1.5 px-4 rounded-xl border border-amber-500/10">
                <div className="text-rose-400 flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  <span>{filteredLeaderboard[0].totalVouches}</span>
                </div>
                <div className="text-teal-400 flex items-center space-x-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{filteredLeaderboard[0].solutionCount}</span>
                </div>
              </div>
              {filteredLeaderboard[0].hasDeployedBadge && (
                <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Deployed Solutions
                </span>
              )}
            </div>

            {/* 3rd Place Card */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 relative hover:border-slate-700 transition-all md:order-3 order-3">
              <div className="absolute top-3 left-3 text-[10px] font-bold text-slate-500 font-mono">3RD PLACE</div>
              {getRankBadge(3)}
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-100">{filteredLeaderboard[2].developer.name}</h3>
                <span className="text-[10px] text-slate-500 font-bold">{filteredLeaderboard[2].developer.region || 'Remote Hub'}</span>
              </div>
              <div className="flex gap-4 text-xs font-bold bg-slate-950/60 py-1 px-3 rounded-lg border border-slate-850">
                <div className="text-rose-400 flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  <span>{filteredLeaderboard[2].totalVouches}</span>
                </div>
                <div className="text-teal-400 flex items-center space-x-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{filteredLeaderboard[2].solutionCount}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Leaderboard Entries List */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 font-medium text-xs mt-3.5 uppercase tracking-wider">Recalculating developer rankings...</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl space-y-3">
            <UserCheck className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-slate-300 text-sm font-semibold">No registered developers found matching that region.</p>
            <p className="text-slate-500 text-xs">Verify your search criteria or register as a developer to join!</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl" id="leaderboard-container">
            {/* Headers row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-950/40 border-b border-slate-800 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">Developer Details</div>
              <div className="col-span-2 text-center">Region</div>
              <div className="col-span-2 text-center">Solutions</div>
              <div className="col-span-2 text-center">Vouches</div>
            </div>

            <div className="divide-y divide-slate-850">
              {filteredLeaderboard.map((entry, idx) => {
                const rank = idx + 1;
                return (
                  <div 
                    key={entry.developer._id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4.5 items-center hover:bg-slate-950/20 transition-all relative"
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      {getRankBadge(rank)}
                    </div>

                    {/* Developer Name & Badge */}
                    <div className="col-span-5 flex items-center space-x-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-slate-200 truncate">{entry.developer.name}</span>
                          
                          {/* Deployed Badge */}
                          {entry.hasDeployedBadge && (
                            <div className="relative inline-block shrink-0">
                              <span 
                                onMouseEnter={() => setShowTooltipForDevId(entry.developer._id)}
                                onMouseLeave={() => setShowTooltipForDevId(null)}
                                className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md cursor-help flex items-center space-x-0.5 shadow shadow-emerald-500/20"
                              >
                                <Award className="w-2.5 h-2.5" />
                                <span>Deployed</span>
                              </span>

                              {/* Tooltip */}
                              {showTooltipForDevId === entry.developer._id && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] leading-relaxed text-slate-400 shadow-xl z-50">
                                  This elite contributor has successfully transitioned at least one open civic prototype into a fully deployed municipal infrastructure solution!
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">{entry.developer.email}</span>
                      </div>
                    </div>

                    {/* Region */}
                    <div className="col-span-2 text-center min-w-0">
                      {entry.developer.region ? (
                        <span className="inline-flex items-center space-x-0.5 text-xs text-slate-400 font-bold truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span className="truncate">{entry.developer.region}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 font-bold italic">Universal</span>
                      )}
                    </div>

                    {/* Solution count */}
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/20 border border-teal-900/30 px-2.5 py-1 rounded-lg">
                        {entry.solutionCount}
                      </span>
                    </div>

                    {/* Total Vouches */}
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-mono font-extrabold text-rose-400 bg-rose-950/20 border border-rose-900/30 px-2.5 py-1 rounded-lg inline-flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5 fill-rose-400" />
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

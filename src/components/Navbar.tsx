import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User, Landmark, Cpu, Hammer } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'mp':
        return <Landmark className="w-4 h-4 text-amber-500" />;
      case 'developer':
        return <Cpu className="w-4 h-4 text-emerald-500" />;
      default:
        return <User className="w-4 h-4 text-teal-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'mp':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
      case 'developer':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      default:
        return 'bg-teal-950/40 text-teal-400 border-teal-900/30';
    }
  };

  return (
    <nav className="bg-slate-950 text-white sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8" id="global-navbar">
      <div className="max-w-7xl mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-lg shadow-slate-950/50">
        <div className="flex justify-between items-center h-10">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="bg-teal-500 p-2 rounded-lg text-slate-950 flex items-center justify-center">
                <Hammer className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase">
                CivicForge <span className="text-teal-400 text-xs ml-2 font-mono px-2 py-0.5 border border-teal-400/30 rounded uppercase hidden sm:inline-block">Bento System</span>
              </span>
            </Link>

            {/* In-Navbar Links for quick desktop/tablet access */}
            {user && (
              <div className="hidden md:flex items-center space-x-3 border-l border-slate-800 pl-4">
                {user.role === 'citizen' && (
                  <Link to="/citizen/dashboard" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                    Lodge Issue
                  </Link>
                )}
                {user.role === 'developer' && (
                  <Link to="/developer/dashboard" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                    Workspace
                  </Link>
                )}
                {user.role === 'mp' && (
                  <Link to="/mp/dashboard" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                    Cabinet
                  </Link>
                )}

                {(user.role === 'citizen' || user.role === 'developer') && (
                  <Link to="/feed/solutions" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                    Solutions Feed
                  </Link>
                )}

                {user.role === 'developer' && (
                  <Link to="/feed/problems" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                    Browse Demands
                  </Link>
                )}

                <Link to="/leaderboard" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Info & Actions */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-slate-400">Welcome Back</span>
                <span className="text-sm font-bold text-slate-100">{user.name}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {getRoleIcon(user.role)}
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 border rounded-md ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-800"></div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 font-bold transition-all bg-slate-950 hover:bg-rose-950/20 px-3 py-2 rounded-lg border border-slate-800 hover:border-rose-900/30 cursor-pointer"
                id="navbar-logout-btn"
                title="Logout from CivicForge"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold uppercase tracking-wider bg-teal-500 text-slate-950 hover:bg-teal-400 px-4 py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Nav Row */}
      {user && (
        <div className="md:hidden max-w-7xl mx-auto mt-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-xl flex items-center justify-around text-center overflow-x-auto whitespace-nowrap gap-2 scrollbar-none">
          {user.role === 'citizen' && (
            <Link to="/citizen/dashboard" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-white px-2 py-1">
              Lodge
            </Link>
          )}
          {user.role === 'developer' && (
            <Link to="/developer/dashboard" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-white px-2 py-1">
              Work
            </Link>
          )}
          {user.role === 'mp' && (
            <Link to="/mp/dashboard" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-white px-2 py-1">
              Cabinet
            </Link>
          )}

          {(user.role === 'citizen' || user.role === 'developer') && (
            <Link to="/feed/solutions" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-white px-2 py-1">
              Solutions
            </Link>
          )}

          {user.role === 'developer' && (
            <Link to="/feed/problems" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-white px-2 py-1">
              Demands
            </Link>
          )}

          <Link to="/leaderboard" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-white px-2 py-1">
            Leaderboard
          </Link>
        </div>
      )}
    </nav>
  );
};

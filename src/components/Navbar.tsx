import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  LogOut, 
  User, 
  Landmark, 
  Cpu, 
  Hammer, 
  PlusCircle, 
  Layers, 
  AlertTriangle, 
  Trophy,
  LogIn,
  UserPlus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'mp':
        return <Landmark className="w-4 h-4 text-[#E76F51]" />;
      case 'developer':
        return <Cpu className="w-4 h-4 text-[#3F6C51]" />;
      default:
        return <User className="w-4 h-4 text-[#3F6C51]" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'mp':
        return 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/20';
      case 'developer':
        return 'bg-[#3F6C51]/10 text-[#3F6C51] border-[#3F6C51]/20';
      default:
        return 'bg-[#3F6C51]/10 text-[#3F6C51] border-[#3F6C51]/20';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#FAF6ED] sticky top-0 z-50 pt-5 px-4 sm:px-6 lg:px-8" id="global-navbar">
      <div className="max-w-7xl mx-auto bg-[#FFFDF9] p-3.5 rounded-2xl shadow-[8px_8px_16px_0px_rgba(142,130,114,0.15),-8px_-8px_16px_0px_#FFFFFF] border border-white/40">
        <div className="flex justify-between items-center h-11">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-[#3F6C51] p-2 rounded-xl text-white flex items-center justify-center shadow-[4px_4px_8px_0px_rgba(63,108,81,0.25),-4px_-4px_8px_0px_#FFFFFF]">
                <Hammer className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-black tracking-tight text-[#3A2E2B] uppercase flex items-center">
                CivicForge 
                <span className="text-[#3F6C51] text-[9px] ml-2 font-mono px-2 py-0.5 bg-[#FAF6ED] shadow-[inset_2px_2px_4px_rgba(142,130,114,0.1),inset_-2px_-2px_4px_#FFFFFF] rounded uppercase hidden sm:inline-block">
                  Bento System
                </span>
              </span>
            </Link>

            {/* Icon-based Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center space-x-3.5 border-l border-[#E5DEC9]/60 pl-4">
                {user.role === 'citizen' && (
                  <Link 
                    to="/citizen/dashboard" 
                    title="Lodge Issue" 
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive('/citizen/dashboard')
                        ? 'bg-[#FAF6ED] shadow-[inset_3px_3px_6px_rgba(142,130,114,0.15),inset_-3px_-3px_6px_#FFFFFF] text-[#3F6C51]'
                        : 'text-[#9A8C7F] hover:text-[#3A2E2B] hover:bg-[#FAF6ED]/40'
                    }`}
                  >
                    <PlusCircle className="w-5 h-5" />
                  </Link>
                )}
                {user.role === 'developer' && (
                  <Link 
                    to="/developer/dashboard" 
                    title="Developer Workspace" 
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive('/developer/dashboard')
                        ? 'bg-[#FAF6ED] shadow-[inset_3px_3px_6px_rgba(142,130,114,0.15),inset_-3px_-3px_6px_#FFFFFF] text-[#3F6C51]'
                        : 'text-[#9A8C7F] hover:text-[#3A2E2B] hover:bg-[#FAF6ED]/40'
                    }`}
                  >
                    <Cpu className="w-5 h-5" />
                  </Link>
                )}
                {user.role === 'mp' && (
                  <Link 
                    to="/mp/dashboard" 
                    title="Cabinet Evaluation Room" 
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive('/mp/dashboard')
                        ? 'bg-[#FAF6ED] shadow-[inset_3px_3px_6px_rgba(142,130,114,0.15),inset_-3px_-3px_6px_#FFFFFF] text-[#3F6C51]'
                        : 'text-[#9A8C7F] hover:text-[#3A2E2B] hover:bg-[#FAF6ED]/40'
                    }`}
                  >
                    <Landmark className="w-5 h-5" />
                  </Link>
                )}

                {(user.role === 'citizen' || user.role === 'developer') && (
                  <Link 
                    to="/feed/solutions" 
                    title="Community Solutions Feed" 
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive('/feed/solutions')
                        ? 'bg-[#FAF6ED] shadow-[inset_3px_3px_6px_rgba(142,130,114,0.15),inset_-3px_-3px_6px_#FFFFFF] text-[#3F6C51]'
                        : 'text-[#9A8C7F] hover:text-[#3A2E2B] hover:bg-[#FAF6ED]/40'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                  </Link>
                )}

                {user.role === 'developer' && (
                  <Link 
                    to="/feed/problems" 
                    title="Browse Civic Demands" 
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive('/feed/problems')
                        ? 'bg-[#FAF6ED] shadow-[inset_3px_3px_6px_rgba(142,130,114,0.15),inset_-3px_-3px_6px_#FFFFFF] text-[#E76F51]'
                        : 'text-[#9A8C7F] hover:text-[#E76F51] hover:bg-[#FAF6ED]/40'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </Link>
                )}

                <Link 
                  to="/leaderboard" 
                  title="Developer Leaderboard" 
                  className={`p-2.5 rounded-xl transition-all ${
                    isActive('/leaderboard')
                      ? 'bg-[#FAF6ED] shadow-[inset_3px_3px_6px_rgba(142,130,114,0.15),inset_-3px_-3px_6px_#FFFFFF] text-[#3F6C51]'
                      : 'text-[#9A8C7F] hover:text-[#3A2E2B] hover:bg-[#FAF6ED]/40'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Info & Actions */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-[#9A8C7F] uppercase tracking-wider font-semibold">User Role</span>
                <span className="text-xs font-black text-[#3A2E2B]">{user.name}</span>
              </div>

              <div className="flex items-center space-x-1 px-2.5 py-1 bg-[#FAF6ED] rounded-xl shadow-[inset_2px_2px_5px_rgba(142,130,114,0.1),inset_-2px_-2px_5px_#FFFFFF]">
                {getRoleIcon(user.role)}
                <span className="text-[9px] font-black uppercase tracking-wider text-[#3A2E2B] ml-1">
                  {user.role}
                </span>
              </div>

              <div className="h-6 w-px bg-[#E5DEC9]/60"></div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="neumorphic-btn p-2.5 text-[#9A8C7F] hover:text-[#E76F51] flex items-center justify-center rounded-xl"
                id="navbar-logout-btn"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3.5">
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-wider text-[#9A8C7F] hover:text-[#3A2E2B] px-3.5 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="neumorphic-btn-accent text-xs font-extrabold uppercase tracking-wider px-4.5 py-2.5 rounded-xl shadow-[4px_4px_8px_rgba(63,108,81,0.25),-4px_-4px_8px_#FFFFFF]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Nav Row */}
      {user && (
        <div className="md:hidden max-w-7xl mx-auto mt-2.5 bg-[#FFFDF9] p-2 rounded-xl flex items-center justify-around text-center overflow-x-auto whitespace-nowrap gap-2 scrollbar-none shadow-[4px_4px_8px_0px_rgba(142,130,114,0.1),-4px_-4px_8px_0px_#FFFFFF]">
          {user.role === 'citizen' && (
            <Link 
              to="/citizen/dashboard" 
              className={`p-2.5 rounded-lg transition-all ${
                isActive('/citizen/dashboard')
                  ? 'bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] text-[#3F6C51]'
                  : 'text-[#9A8C7F]'
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5" />
            </Link>
          )}
          {user.role === 'developer' && (
            <Link 
              to="/developer/dashboard" 
              className={`p-2.5 rounded-lg transition-all ${
                isActive('/developer/dashboard')
                  ? 'bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] text-[#3F6C51]'
                  : 'text-[#9A8C7F]'
              }`}
            >
              <Cpu className="w-4.5 h-4.5" />
            </Link>
          )}
          {user.role === 'mp' && (
            <Link 
              to="/mp/dashboard" 
              className={`p-2.5 rounded-lg transition-all ${
                isActive('/mp/dashboard')
                  ? 'bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] text-[#3F6C51]'
                  : 'text-[#9A8C7F]'
              }`}
            >
              <Landmark className="w-4.5 h-4.5" />
            </Link>
          )}

          {(user.role === 'citizen' || user.role === 'developer') && (
            <Link 
              to="/feed/solutions" 
              className={`p-2.5 rounded-lg transition-all ${
                isActive('/feed/solutions')
                  ? 'bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] text-[#3F6C51]'
                  : 'text-[#9A8C7F]'
              }`}
            >
              <Layers className="w-4.5 h-4.5" />
            </Link>
          )}

          {user.role === 'developer' && (
            <Link 
              to="/feed/problems" 
              className={`p-2.5 rounded-lg transition-all ${
                isActive('/feed/problems')
                  ? 'bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] text-[#E76F51]'
                  : 'text-[#9A8C7F]'
              }`}
            >
              <AlertTriangle className="w-4.5 h-4.5" />
            </Link>
          )}

          <Link 
            to="/leaderboard" 
            className={`p-2.5 rounded-lg transition-all ${
              isActive('/leaderboard')
                ? 'bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] text-[#3F6C51]'
                : 'text-[#9A8C7F]'
            }`}
          >
            <Trophy className="w-4.5 h-4.5" />
          </Link>
        </div>
      )}
    </nav>
  );
};

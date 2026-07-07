import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  LogOut, 
  User, 
  Landmark, 
  Cpu, 
  Hammer, 
  PlusCircle, 
  Layers, 
  AlertTriangle, 
  Trophy
} from 'lucide-react';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  activeColor?: string;
  hoverColor?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  label,
  icon,
  active,
  activeColor = 'text-[#3F6C51]',
  hoverColor = 'hover:text-[#3A2E2B]'
}) => (
  <Link
    to={to}
    title={label}
    aria-label={label}
    className={`group flex h-10 items-center overflow-hidden rounded-xl px-2.5 transition-all duration-300 ease-out ${
      active
        ? `bg-[#FAF6ED] shadow-[inset_3px_3px_6px_rgba(142,130,114,0.15),inset_-3px_-3px_6px_#FFFFFF] ${activeColor}`
        : `text-[#9A8C7F] ${hoverColor} hover:bg-[#FAF6ED]/40`
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="max-w-0 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-wider opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-36 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-36 group-focus-visible:opacity-100">
      {label}
    </span>
  </Link>
);

const MobileNavItem: React.FC<NavItemProps> = ({
  to,
  label,
  icon,
  active,
  activeColor = 'text-[#3F6C51]'
}) => (
  <Link
    to={to}
    title={label}
    aria-label={label}
    className={`p-2.5 rounded-lg transition-all ${
      active
        ? `bg-[#FAF6ED] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] ${activeColor}`
        : 'text-[#9A8C7F]'
    }`}
  >
    {icon}
  </Link>
);

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    toast.loading('Logging out...', {
      id: 'logout-status',
      position: 'bottom-right',
      style: {
        background: '#FFFDF9',
        border: '1px solid rgba(231, 111, 81, 0.35)',
        color: '#E76F51',
        fontWeight: 800
      },
      iconTheme: {
        primary: '#E76F51',
        secondary: '#FFFFFF'
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    await logout();
    navigate('/login');
    toast.dismiss('logout-status');
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
              <div className="hidden lg:flex items-center space-x-3.5 border-l border-[#E5DEC9]/60 pl-4">
                {user.role === 'citizen' && (
                  <NavItem
                    to="/citizen/dashboard"
                    label="Lodge Issue"
                    icon={<PlusCircle className="w-5 h-5" />}
                    active={isActive('/citizen/dashboard')}
                  />
                )}
                {user.role === 'developer' && (
                  <NavItem
                    to="/developer/dashboard"
                    label="Workspace"
                    icon={<Cpu className="w-5 h-5" />}
                    active={isActive('/developer/dashboard')}
                  />
                )}
                {user.role === 'mp' && (
                  <NavItem
                    to="/mp/dashboard"
                    label="Evaluation Room"
                    icon={<Landmark className="w-5 h-5" />}
                    active={isActive('/mp/dashboard')}
                  />
                )}

                {(user.role === 'citizen' || user.role === 'developer') && (
                  <NavItem
                    to="/feed/solutions"
                    label="Solutions Feed"
                    icon={<Layers className="w-5 h-5" />}
                    active={isActive('/feed/solutions')}
                  />
                )}

                {user.role === 'developer' && (
                  <NavItem
                    to="/feed/problems"
                    label="Civic Demands"
                    icon={<AlertTriangle className="w-5 h-5" />}
                    active={isActive('/feed/problems')}
                    activeColor="text-[#E76F51]"
                    hoverColor="hover:text-[#E76F51]"
                  />
                )}

                <NavItem
                  to="/leaderboard"
                  label="Leaderboard"
                  icon={<Trophy className="w-5 h-5" />}
                  active={isActive('/leaderboard')}
                />
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
                disabled={isLoggingOut}
                className="flex items-center justify-center rounded-xl bg-[#FFFDF9] p-2.5 text-[#9A8C7F] shadow-[4px_4px_8px_0px_rgba(100,116,139,0.18),-4px_-4px_8px_0px_#FFFFFF] transition-all duration-200 hover:text-[#E76F51] active:translate-y-0.5 active:text-[#E76F51] active:shadow-[inset_4px_4px_8px_rgba(100,116,139,0.22),inset_-4px_-4px_8px_#FFFFFF] disabled:cursor-wait disabled:opacity-70"
                id="navbar-logout-btn"
                title="Sign Out"
                aria-label="Sign Out"
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
        <div className="lg:hidden max-w-7xl mx-auto mt-2.5 bg-[#FFFDF9] p-2 rounded-xl flex items-center justify-around text-center overflow-x-auto whitespace-nowrap gap-2 scrollbar-none shadow-[4px_4px_8px_0px_rgba(142,130,114,0.1),-4px_-4px_8px_0px_#FFFFFF]">
          {user.role === 'citizen' && (
            <MobileNavItem
              to="/citizen/dashboard"
              label="Lodge Issue"
              icon={<PlusCircle className="w-4.5 h-4.5" />}
              active={isActive('/citizen/dashboard')}
            />
          )}
          {user.role === 'developer' && (
            <MobileNavItem
              to="/developer/dashboard"
              label="Developer Workspace"
              icon={<Cpu className="w-4.5 h-4.5" />}
              active={isActive('/developer/dashboard')}
            />
          )}
          {user.role === 'mp' && (
            <MobileNavItem
              to="/mp/dashboard"
              label="Cabinet Evaluation Room"
              icon={<Landmark className="w-4.5 h-4.5" />}
              active={isActive('/mp/dashboard')}
            />
          )}

          {(user.role === 'citizen' || user.role === 'developer') && (
            <MobileNavItem
              to="/feed/solutions"
              label="Community Solutions Feed"
              icon={<Layers className="w-4.5 h-4.5" />}
              active={isActive('/feed/solutions')}
            />
          )}

          {user.role === 'developer' && (
            <MobileNavItem
              to="/feed/problems"
              label="Browse Civic Demands"
              icon={<AlertTriangle className="w-4.5 h-4.5" />}
              active={isActive('/feed/problems')}
              activeColor="text-[#E76F51]"
            />
          )}

          <MobileNavItem
            to="/leaderboard"
            label="Developer Leaderboard"
            icon={<Trophy className="w-4.5 h-4.5" />}
            active={isActive('/leaderboard')}
          />
        </div>
      )}
    </nav>
  );
};

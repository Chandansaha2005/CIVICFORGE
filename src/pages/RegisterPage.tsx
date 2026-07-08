import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Map, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'developer' | 'mp'>('citizen');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^\d{6}$/;
  const PHONE_REGEX = /^\d{10}$/;

  const validateEmail = (value: string) => EMAIL_REGEX.test(value.trim());
  const validatePassword = (value: string) => PASSWORD_REGEX.test(value.trim());
  const validatePhone = (value: string) => PHONE_REGEX.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedPhone = phone.trim();
    const normalizedRegion = region.trim();

    if (normalizedName.length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(normalizedPassword)) {
      setError('Password must be exactly 6 numeric digits.');
      return;
    }
    if (!validatePhone(normalizedPhone)) {
      setError('Phone number must be exactly 10 numeric digits.');
      return;
    }
    if (!normalizedRegion) {
      setError('Please enter your region, ward, or constituency.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name: normalizedName, email: normalizedEmail, password: normalizedPassword, role, phone: normalizedPhone, region: normalizedRegion });
      toast.success('Registration successful! Welcome to CivicForge.');
      
      if (role === 'citizen') navigate('/citizen/dashboard');
      else if (role === 'developer') navigate('/developer/dashboard');
      else if (role === 'mp') navigate('/mp/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Try using a unique email address.');
      toast.error('Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Dynamic Theme Mapper ---
  const getTheme = (currentRole: string) => {
    if (currentRole === 'developer') {
      return {
        bg: 'bg-[#0f1115]',
        card: 'bg-[#1a1c23] border-[#00FF41]/20 shadow-[0_8px_30px_rgba(0,255,65,0.05)]',
        title: 'text-gray-100',
        subtitle: 'text-[#00FF41]',
        label: 'text-gray-400',
        inputBox: 'bg-[#0f1115] border-[#2A2D35] text-gray-100 placeholder-gray-600 focus:ring-[#00FF41]/50 focus:border-[#00FF41]',
        icon: 'text-[#00FF41]',
        btnPrimary: 'bg-[#00FF41] hover:bg-[#00CC33] text-[#0f1115] shadow-[0_4px_15px_rgba(0,255,65,0.2)]',
        linkText: 'text-[#00FF41] hover:text-[#00CC33]',
        roleActiveBg: 'bg-[#00FF41]/10 border-[#00FF41]/50 text-[#00FF41]',
        roleInactiveBg: 'bg-[#0f1115] border-[#2A2D35] text-gray-500 hover:bg-[#2A2D35]',
        errorBg: 'bg-red-500/10 text-red-400 border-red-500/20'
      };
    }
    if (currentRole === 'mp') {
      return {
        bg: 'bg-[#121212]',
        card: 'bg-[#1E1E1E] border-[#D4AF37]/20 shadow-[0_8px_30px_rgba(212,175,55,0.05)]',
        title: 'text-[#F5E6D3]',
        subtitle: 'text-[#D4AF37]',
        label: 'text-[#F5E6D3]/60',
        inputBox: 'bg-[#121212] border-[#333] text-[#F5E6D3] placeholder-[#F5E6D3]/30 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]',
        icon: 'text-[#D4AF37]',
        btnPrimary: 'bg-[#D4AF37] hover:bg-[#C5A028] text-[#121212] shadow-[0_4px_15px_rgba(212,175,55,0.2)]',
        linkText: 'text-[#D4AF37] hover:text-[#C5A028]',
        roleActiveBg: 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]',
        roleInactiveBg: 'bg-[#121212] border-[#333] text-[#F5E6D3]/40 hover:bg-[#333]',
        errorBg: 'bg-red-900/20 text-red-400 border-red-900/50'
      };
    }
    // Default Citizen (Light-Mode Tinted Mint Green)
    return {
      bg: 'bg-emerald-50',
      card: 'bg-white border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
      title: 'text-slate-900',
      subtitle: 'text-emerald-600',
      label: 'text-slate-500',
      inputBox: 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-emerald-500/50 focus:border-emerald-500',
      icon: 'text-emerald-500',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30',
      linkText: 'text-emerald-600 hover:text-emerald-700',
      roleActiveBg: 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm',
      roleInactiveBg: 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100',
      errorBg: 'bg-red-50 text-red-600 border-red-100'
    };
  };

  const theme = getTheme(role);

  return (
    <div className={`min-h-[calc(100vh-80px)] ${theme.bg} flex flex-col justify-center items-center px-4 py-12 transition-colors duration-500`} id="register-page">
      <div className={`w-full max-w-xl rounded-3xl p-8 border ${theme.card} space-y-8 relative z-10 transition-all duration-500`}>
        
        <div className="text-center">
          <h2 className={`text-3xl font-black tracking-tight ${theme.title} transition-colors duration-500`}>Create Account</h2>
          <p className={`text-xs mt-2 font-bold uppercase tracking-wider ${theme.subtitle} transition-colors duration-500`}>Join the CivicForge platform</p>
        </div>

        {error && (
          <div className={`text-xs px-4 py-3 rounded-xl border font-bold flex items-center ${theme.errorBg}`}>
             <span className="mr-2">⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          
          {/* Platform Role Selector (Placed at top for immediate theme impact) */}
          <div className="space-y-2">
            <label className={`text-xs font-black uppercase tracking-wider ${theme.label}`}>Select Platform Role</label>
            <div className="grid grid-cols-3 gap-3">
              {(['citizen', 'developer', 'mp'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 px-2 text-[11px] sm:text-xs font-black uppercase tracking-wide rounded-xl transition-all duration-300 cursor-pointer text-center border ${
                    role === r ? theme.roleActiveBg : theme.roleInactiveBg
                  }`}
                >
                  {r === 'mp' ? 'Evaluator (MP)' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="register-name" className={`text-xs font-black uppercase tracking-wider ${theme.label}`}>Full Name</label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-4 ${theme.icon}`}>
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priyan Sen"
                  autoComplete="name"
                  id="register-name"
                  className={`w-full rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 border transition-all duration-300 ${theme.inputBox}`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="register-email" className={`text-xs font-black uppercase tracking-wider ${theme.label}`}>Email Address</label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-4 ${theme.icon}`}>
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  autoComplete="email"
                  id="register-email"
                  className={`w-full rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 border transition-all duration-300 ${theme.inputBox}`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="register-password" className={`text-xs font-black uppercase tracking-wider ${theme.label}`}>Password (6 Digits)</label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-4 ${theme.icon}`}>
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="\d{6}"
                  title="Exactly 6 numeric digits"
                  autoComplete="new-password"
                  id="register-password"
                  className={`w-full rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 border transition-all duration-300 ${theme.inputBox}`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="register-phone" className={`text-xs font-black uppercase tracking-wider ${theme.label}`}>Phone Contact</label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-4 ${theme.icon}`}>
                  <Phone className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9830012345"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d{10}"
                  title="Exactly 10 numeric digits"
                  autoComplete="tel"
                  id="register-phone"
                  className={`w-full rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 border transition-all duration-300 ${theme.inputBox}`}
                />
              </div>
            </div>

            {/* Region/Constituency - spans full width */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="register-region" className={`text-xs font-black uppercase tracking-wider ${theme.label}`}>Region / Ward / Constituency</label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-4 ${theme.icon}`}>
                  <Map className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Behala South, Ward 118"
                  autoComplete="address-level2"
                  id="register-region"
                  className={`w-full rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 border transition-all duration-300 ${theme.inputBox}`}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-xl py-4 px-4 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 ${theme.btnPrimary}`}
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className={`text-sm font-medium ${theme.label}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-bold transition-colors ${theme.linkText}`}>
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
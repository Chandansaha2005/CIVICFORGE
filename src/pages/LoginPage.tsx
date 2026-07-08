import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Landmark, User, Cpu, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^\d{6}$/;

  const validateEmail = (value: string) => EMAIL_REGEX.test(value.trim());
  const validatePassword = (value: string) => PASSWORD_REGEX.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!validateEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(normalizedPassword)) {
      setError('Password must be exactly 6 numeric digits.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(normalizedEmail, normalizedPassword);
      toast.success(`Welcome back, ${response.user.name}!`);
      
      // Route based on role
      if (response.user.role === 'citizen') navigate('/citizen/dashboard');
      else if (response.user.role === 'developer') navigate('/developer/dashboard');
      else if (response.user.role === 'mp') navigate('/mp/dashboard');
      else navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Incorrect email or password.');
      toast.error('Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Login Helper
  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(demoEmail, '123456');
      toast.success(`Logged in as demo ${response.user.role}: ${response.user.name}`);
      
      if (response.user.role === 'citizen') navigate('/citizen/dashboard');
      else if (response.user.role === 'developer') navigate('/developer/dashboard');
      else if (response.user.role === 'mp') navigate('/mp/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Seeded user login failed. Please verify seed script status.');
      toast.error('Quick Login Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF6ED] text-[#3A2E2B] flex flex-col justify-center items-center px-4 py-12" id="login-page">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl p-8 shadow-[14px_14px_28px_0px_#E5DEC9,-14px_-14px_28px_0px_#FFFFFF] border border-white/40 space-y-6 relative">
        
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-[#3A2E2B]">Sign In</h2>
          <p className="text-xs text-[#9A8C7F] mt-1 font-bold uppercase tracking-wider">Access your CivicForge bento portal</p>
        </div>

        {error && (
          <div className="bg-[#E76F51]/10 text-[#E76F51] text-xs px-4 py-3 rounded-xl border border-[#E76F51]/20 font-bold" id="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C7F]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                autoComplete="email"
                className="w-full neumorphic-concave pl-10 pr-4 py-3 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
                id="login-email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Security Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C7F]">
                <Lock className="w-4 h-4" />
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
                autoComplete="current-password"
                className="w-full neumorphic-concave pl-10 pr-4 py-3 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
                id="login-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full neumorphic-btn-accent py-3.5 px-4 font-extrabold text-sm uppercase tracking-wider shadow-[4px_4px_8px_rgba(63,108,81,0.25),-4px_-4px_8px_#FFFFFF] flex items-center justify-center space-x-1.5 disabled:opacity-50"
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#9A8C7F] font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#3F6C51] hover:underline font-bold">
              Register now
            </Link>
          </p>
        </div>

        {/* Demo Fast Login Panel */}
        <div className="border-t border-[#E5DEC9]/60 pt-5 space-y-3.5">
          <div className="flex items-center space-x-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9A8C7F]">Demo Fast Ingress Login</span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            <button
              onClick={() => handleQuickLogin('mp@civicforge.in')}
              disabled={isSubmitting}
              className="flex items-center justify-between bg-[#FFFDF9] p-3 rounded-xl shadow-[4px_4px_8px_0px_rgba(142,130,114,0.1),-4px_-4px_8px_0px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_rgba(142,130,114,0.1),inset_-2px_-2px_5px_#FFFFFF] border border-white/40 transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#FAF6ED] rounded-lg shadow-[inset_1px_1px_3px_rgba(142,130,114,0.1),inset_-1px_-1px_3px_#FFFFFF]">
                  <Landmark className="w-4 h-4 text-[#E76F51]" />
                </div>
                <div>
                  <p className="font-black text-[#3A2E2B]">Amit Roy</p>
                  <p className="text-[10px] text-[#9A8C7F] font-semibold">Cabinet evaluation & budget</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase bg-[#E76F51]/10 text-[#E76F51] px-2.5 py-1 rounded-md border border-[#E76F51]/20">MP</span>
            </button>

            <button
              onClick={() => handleQuickLogin('citizen1@gmail.com')}
              disabled={isSubmitting}
              className="flex items-center justify-between bg-[#FFFDF9] p-3 rounded-xl shadow-[4px_4px_8px_0px_rgba(142,130,114,0.1),-4px_-4px_8px_0px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_rgba(142,130,114,0.1),inset_-2px_-2px_5px_#FFFFFF] border border-white/40 transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#FAF6ED] rounded-lg shadow-[inset_1px_1px_3px_rgba(142,130,114,0.1),inset_-1px_-1px_3px_#FFFFFF]">
                  <User className="w-4 h-4 text-[#3F6C51]" />
                </div>
                <div>
                  <p className="font-black text-[#3A2E2B]">Vikram Chatterjee</p>
                  <p className="text-[10px] text-[#9A8C7F] font-semibold">Citizen lodging demands</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase bg-[#3F6C51]/10 text-[#3F6C51] px-2.5 py-1 rounded-md border border-[#3F6C51]/20">Citizen</span>
            </button>

            <button
              onClick={() => handleQuickLogin('dev1@gmail.com')}
              disabled={isSubmitting}
              className="flex items-center justify-between bg-[#FFFDF9] p-3 rounded-xl shadow-[4px_4px_8px_0px_rgba(142,130,114,0.1),-4px_-4px_8px_0px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_rgba(142,130,114,0.1),inset_-2px_-2px_5px_#FFFFFF] border border-white/40 transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#FAF6ED] rounded-lg shadow-[inset_1px_1px_3px_rgba(142,130,114,0.1),inset_-1px_-1px_3px_#FFFFFF]">
                  <Cpu className="w-4 h-4 text-[#3F6C51]" />
                </div>
                <div>
                  <p className="font-black text-[#3A2E2B]">TechForge (Arijit)</p>
                  <p className="text-[10px] text-[#9A8C7F] font-semibold">Developer building prototypes</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase bg-[#3F6C51]/10 text-[#3F6C51] px-2.5 py-1 rounded-md border border-[#3F6C51]/20">Dev</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

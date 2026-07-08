import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Landmark, User, Cpu, Loader2, Sparkles, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-80px)] bg-emerald-50 text-slate-800 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden" id="login-page">
      {/* Decorative Blob */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100 space-y-6 relative z-10">
        
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Sign In</h2>
          <p className="text-xs text-emerald-600 mt-2 font-bold uppercase tracking-wider">Access your CivicForge Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl border border-red-100 font-bold flex items-center" id="login-error">
            <span className="mr-2">⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-black uppercase tracking-wider text-slate-500">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                autoComplete="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                id="login-email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-xs font-black uppercase tracking-wider text-slate-500">Security Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
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
                autoComplete="current-password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                id="login-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4 px-4 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5"
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold transition-colors">
              Register now
            </Link>
          </p>
        </div>

        {/* Demo Fast Login Panel */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center space-x-2 justify-center">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Demo Fast Ingress Login</span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <button
              onClick={() => handleQuickLogin('mp@civicforge.in')}
              disabled={isSubmitting}
              className="group flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-50 group-hover:bg-amber-100 rounded-lg transition-colors">
                  <Landmark className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Amit Roy</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Cabinet evaluation & budget</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md">MP</span>
            </button>

            <button
              onClick={() => handleQuickLogin('citizen1@gmail.com')}
              disabled={isSubmitting}
              className="group flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-50 group-hover:bg-emerald-100 rounded-lg transition-colors">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Vikram Chatterjee</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Citizen lodging demands</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md">Citizen</span>
            </button>

            <button
              onClick={() => handleQuickLogin('dev1@gmail.com')}
              disabled={isSubmitting}
              className="group flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-50 group-hover:bg-indigo-100 rounded-lg transition-colors">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">TechForge (Arijit)</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Developer building prototypes</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md">Dev</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
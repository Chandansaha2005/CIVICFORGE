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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
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
    setPassword('Test@1234');
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(demoEmail, 'Test@1234');
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
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12" id="login-page">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 relative">
        
        {/* Glow accent */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl -z-10"></div>

        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight">Sign In</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Access your CivicForge full-stack portal</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 text-rose-300 text-xs px-4 py-3 rounded-lg border border-rose-900/30 font-semibold" id="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                id="login-email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                id="login-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-teal-500/5 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:underline font-semibold">
              Register now
            </Link>
          </p>
        </div>

        {/* Demo Fast Login Panel */}
        <div className="border-t border-slate-800/80 pt-5 space-y-3.5">
          <div className="flex items-center space-x-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Demo Fast Ingress Login</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <button
              onClick={() => handleQuickLogin('mp@civicforge.in')}
              className="flex items-center justify-between bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 p-2.5 rounded-lg transition-all text-left cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="font-bold text-slate-200">Amit Roy, MP (Kolkata)</p>
                  <p className="text-[10px] text-slate-500">Evaluator / Priority Matrices</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 border border-amber-500/20 rounded">MP</span>
            </button>

            <button
              onClick={() => handleQuickLogin('citizen1@gmail.com')}
              className="flex items-center justify-between bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 p-2.5 rounded-lg transition-all text-left cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-teal-500" />
                <div>
                  <p className="font-bold text-slate-200">Vikram Chatterjee</p>
                  <p className="text-[10px] text-slate-500">Citizen / Lodge Complaints</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-teal-500/10 text-teal-400 px-2 py-0.5 border border-teal-500/20 rounded">Citizen</span>
            </button>

            <button
              onClick={() => handleQuickLogin('dev1@gmail.com')}
              className="flex items-center justify-between bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-lg transition-all text-left cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="font-bold text-slate-200">TechForge (Arijit)</p>
                  <p className="text-[10px] text-slate-500">Developer / Post Solutions</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded">Dev</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

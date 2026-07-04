import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Map, Landmark, Cpu, Loader2 } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, email, password, role, phone, region });
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12" id="register-page">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 relative">
        
        {/* Glow accent */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl -z-10"></div>

        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Join the CivicForge platform</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 text-rose-300 text-xs px-4 py-3 rounded-lg border border-rose-900/30 font-semibold" id="register-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priyan Sen"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
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
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Platform Role */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Your Platform Role</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`py-2 text-[10px] font-extrabold uppercase tracking-wide border rounded-lg transition-all cursor-pointer text-center ${
                    role === 'citizen'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`py-2 text-[10px] font-extrabold uppercase tracking-wide border rounded-lg transition-all cursor-pointer text-center ${
                    role === 'developer'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  Developer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('mp')}
                  className={`py-2 text-[10px] font-extrabold uppercase tracking-wide border rounded-lg transition-all cursor-pointer text-center ${
                    role === 'mp'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  Evaluator (MP)
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone Contact</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98300 00000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Region/Constituency */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Region / Ward / Constituency</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Map className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Behala South, Ward 118"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-teal-500/5 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

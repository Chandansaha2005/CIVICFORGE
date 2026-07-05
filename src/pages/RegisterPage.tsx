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

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^\d{6}$/;
  const PHONE_REGEX = /^\d{10}$/;

  const validateEmail = (value: string) => EMAIL_REGEX.test(value.trim());
  const validatePassword = (value: string) => PASSWORD_REGEX.test(value.trim());
  const validatePhone = (value: string) => PHONE_REGEX.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedPhone = phone.trim();

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

    setIsSubmitting(true);

    try {
      await register({ name, email: normalizedEmail, password: normalizedPassword, role, phone: normalizedPhone, region });
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
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF6ED] text-[#3A2E2B] flex flex-col justify-center items-center px-4 py-12" id="register-page">
      <div className="w-full max-w-xl bg-[#FFFDF9] rounded-3xl p-8 shadow-[14px_14px_28px_0px_#E5DEC9,-14px_-14px_28px_0px_#FFFFFF] border border-white/40 space-y-6 relative">
        
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-[#3A2E2B]">Create Account</h2>
          <p className="text-xs text-[#9A8C7F] mt-1 font-bold uppercase tracking-wider">Join the CivicForge platform</p>
        </div>

        {error && (
          <div className="bg-[#E76F51]/10 text-[#E76F51] text-xs px-4 py-3 rounded-xl border border-[#E76F51]/20 font-bold" id="register-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C7F]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priyan Sen"
                  className="w-full neumorphic-concave pl-10 pr-4 py-2.5 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C7F]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full neumorphic-concave pl-10 pr-4 py-2.5 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Password</label>
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
                  className="w-full neumorphic-concave pl-10 pr-4 py-2.5 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
                />
              </div>
            </div>

            {/* Platform Role */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Your Platform Role</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`py-2 text-[10px] font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer text-center ${
                    role === 'citizen'
                      ? 'bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15),inset_-2px_-2px_5px_#FFFFFF] text-[#3F6C51] font-black border border-[#3F6C51]/20'
                      : 'bg-[#FFFDF9] text-[#9A8C7F] shadow-[4px_4px_8px_0px_rgba(142,130,114,0.12),-4px_-4px_8px_0px_#FFFFFF] hover:bg-[#FAF6ED]/50 border border-white/40'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`py-2 text-[10px] font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer text-center ${
                    role === 'developer'
                      ? 'bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15),inset_-2px_-2px_5px_#FFFFFF] text-[#3F6C51] font-black border border-[#3F6C51]/20'
                      : 'bg-[#FFFDF9] text-[#9A8C7F] shadow-[4px_4px_8px_0px_rgba(142,130,114,0.12),-4px_-4px_8px_0px_#FFFFFF] hover:bg-[#FAF6ED]/50 border border-white/40'
                  }`}
                >
                  Developer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('mp')}
                  className={`py-2 text-[10px] font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer text-center ${
                    role === 'mp'
                      ? 'bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15),inset_-2px_-2px_5px_#FFFFFF] text-[#E76F51] font-black border border-[#E76F51]/20'
                      : 'bg-[#FFFDF9] text-[#9A8C7F] shadow-[4px_4px_8px_0px_rgba(142,130,114,0.12),-4px_-4px_8px_0px_#FFFFFF] hover:bg-[#FAF6ED]/50 border border-white/40'
                  }`}
                >
                  Evaluator
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Phone Contact</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C7F]">
                  <Phone className="w-4 h-4" />
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
                  className="w-full neumorphic-concave pl-10 pr-4 py-2.5 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
                />
              </div>
            </div>

            {/* Region/Constituency */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#9A8C7F]">Region / Ward / Constituency</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A8C7F]">
                  <Map className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Behala South, Ward 118"
                  className="w-full neumorphic-concave pl-10 pr-4 py-2.5 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full neumorphic-btn-accent py-3.5 px-4 font-extrabold text-sm uppercase tracking-wider shadow-[4px_4px_8px_rgba(63,108,81,0.25),-4px_-4px_8px_#FFFFFF] flex items-center justify-center space-x-1.5 disabled:opacity-50"
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#9A8C7F] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3F6C51] hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

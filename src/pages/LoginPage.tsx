import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { FixTrackLogo } from '../components/common/FixTrackLogo';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onGoToSignUp: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onGoToSignUp, 
  onLoginSuccess 
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('vishnu.kumar@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: Brand & Illustration */}
      <div className="lg:w-1/2 p-6 sm:p-12 flex flex-col justify-between relative bg-[#FBFAF7]">
        {/* Logo at Top Left */}
        <div>
          <FixTrackLogo size="lg" />
        </div>

        {/* Clean Illustration in Center */}
        <div className="my-auto py-10 flex flex-col items-center justify-center">
          <img 
            src="/assets/login_illustration.svg" 
            alt="FixTrack Resident Illustration" 
            className="w-full max-w-sm sm:max-w-md h-auto object-contain max-h-[380px] mx-auto drop-shadow-xs"
          />
        </div>

        <div className="hidden lg:block h-6" />
      </div>

      {/* Right Column: Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="max-w-md w-full space-y-7 animate-fade-in">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm font-medium text-[#64748B]">
              Login to continue
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#8B9AA0]" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#475569] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#203136] focus:ring-[#203136]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset link sent to your registered email.')}
                className="font-medium text-[#D97706] hover:text-[#B45309] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#203136] text-white text-sm font-semibold hover:bg-[#18262A] transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs sm:text-sm text-[#64748B]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onGoToSignUp}
              className="font-bold text-[#D97706] hover:underline cursor-pointer ml-1"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

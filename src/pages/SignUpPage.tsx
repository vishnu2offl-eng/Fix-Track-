import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { FixTrackLogo } from '../components/common/FixTrackLogo';
import { useAuth } from '../context/AuthContext';

interface SignUpPageProps {
  onGoToLogin: () => void;
  onSignUpSuccess: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ 
  onGoToLogin, 
  onSignUpSuccess 
}) => {
  const { signUp } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [flatNo, setFlatNo] = useState('B-100');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !flatNo.trim() || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of services and Privacy Policy.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        flatNo: flatNo.trim(),
        password: password,
      });

      if (res.success) {
        onSignUpSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: Brand & Illustration */}
      <div className="lg:w-1/2 p-6 sm:p-12 flex flex-col justify-between relative bg-[#FBFAF7]">
        <div>
          <FixTrackLogo size="lg" />
        </div>

        <div className="my-auto py-10 flex flex-col items-center justify-center">
          <img 
            src="/assets/auth_illustration.svg" 
            alt="FixTrack Account Illustration" 
            className="w-full max-w-sm sm:max-w-md h-auto object-contain max-h-[380px] mx-auto drop-shadow-xs"
          />
        </div>

        <div className="hidden lg:block h-6" />
      </div>

      {/* Right Column: Sign Up Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="max-w-md w-full space-y-6 animate-fade-in">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              Create your Account
            </h1>
            <p className="text-sm font-medium text-[#64748B]">
              Sign up to get started
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                FULL NAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                EMAIL
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
                  required
                />
              </div>
            </div>

            {/* Flat No */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                FLAT NO
              </label>
              <input
                type="text"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                placeholder="B-100"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                PASSWORD
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#203136]/20 focus:border-[#203136] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#8B9AA0]" />}
                </button>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#203136] focus:ring-[#203136]"
              />
              <label htmlFor="terms" className="text-[#475569] cursor-pointer">
                I agree to the <span className="font-bold text-[#0F172A]">Terms of services</span> and <span className="font-bold text-[#0F172A]">Privacy Policy</span>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#203136] text-white text-sm font-semibold hover:bg-[#18262A] transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs sm:text-sm text-[#64748B]">
            Already have account ?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-bold text-[#D97706] hover:underline cursor-pointer ml-1"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

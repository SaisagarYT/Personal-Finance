import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onAuthSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E8E6DF] flex items-center justify-center p-3 sm:p-6 font-sans">
      {/* Outer Rounded Container with Black Border */}
      <div className="w-full max-w-5xl bg-[#111215] border-[10px] border-[#1C1D21] rounded-[44px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* ================= LEFT DARK BRAND PANEL (5 of 12 cols) ================= */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#141518] via-[#111214] to-[#0A0B0D] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-center md:text-left">
          {/* Subtle gold ambient glow in top-right */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top empty spacing / subtle logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E74D28] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              N
            </div>
            <span className="font-bold text-sm text-white tracking-tight">Kova</span>
          </div>

          {/* Center Brand Icon & Value Proposition */}
          <div className="my-auto py-10 flex flex-col items-center text-center">
            {/* Glossy App Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#2A2B30] to-[#17181B] border border-white/10 shadow-2xl flex items-center justify-center mb-8 relative group">
              <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-white border-r-white flex items-center justify-center transform -rotate-45" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug max-w-xs">
              One Platform to Streamline All Personal Finances
            </h1>
            <p className="text-xs text-white/50 mt-3 max-w-xs leading-relaxed font-normal">
              Your balances, budgets and cash flow are set to grow. Track revenue, wallets and transactions in real-time.
            </p>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5 mt-8">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/20" />
              <span className="w-2 h-2 rounded-full bg-white/20" />
            </div>
          </div>

          {/* Bottom Left Watermark */}
          <div className="text-[11px] text-white/30 text-center md:text-left">
            © 2026 Kova
          </div>
        </div>

        {/* ================= RIGHT WHITE FORM PANEL (7 of 12 cols) ================= */}
        <div className="md:col-span-7 bg-[#FFFFFF] p-8 sm:p-12 flex flex-col justify-between">
          {/* Top Switcher */}
          <div className="flex items-center justify-end text-xs">
            <span className="text-[#6B6A66]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
              }}
              className="font-bold text-[#141414] hover:underline ml-1 cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Form Content Area */}
          <div className="max-w-sm w-full mx-auto my-auto py-6">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back to Kova!'}
              </h2>
              <p className="text-xs text-[#6B6A66] mt-1 font-normal">
                {isSignUp ? 'Enter your details to register' : 'Please enter your details to sign in your account'}
              </p>
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl text-xs font-semibold text-[#141414] hover:bg-[#FAFAF7] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {/* Google G Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl text-xs font-semibold text-[#141414] hover:bg-[#FAFAF7] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {/* Apple Icon */}
                <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.66-1.08 1.74-.95 2.76 1.01.08 2.05-.51 2.67-1.26" />
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F0EFEA]" />
              </div>
              <div className="relative flex justify-center text-[11px] text-[#9E9D97] uppercase">
                <span className="bg-white px-2">Or sign in with</span>
              </div>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-[#141414] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Amara Okello"
                    className="w-full bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl px-3.5 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-amber-500 transition shadow-2xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#141414] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@mail.com"
                  className="w-full bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl px-3.5 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-amber-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141414] mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="minimum 8 character"
                    className="w-full bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl pl-3.5 pr-9 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-amber-500 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9D97] hover:text-[#141414] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Gradient Button: Warm Gold/Orange */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-2xl text-xs font-bold text-white transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(90deg, #F59E0B 0%, #EA580C 100%)',
                }}
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account →' : 'Sign In →'}
              </button>

              {!isSignUp && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    className="text-xs font-bold text-[#141414] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Footer Terms */}
          <div className="flex items-center justify-between text-[11px] text-[#9E9D97]">
            <span>© 2026 Kova</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#141414]">Privacy Policy</a>
              <a href="#" className="hover:text-[#141414]">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans selection:bg-[#E89328] selection:text-white bg-[#FFFFFF]">
      {/* ================= LEFT DARK HERO PANEL (Full Height, 45% width) ================= */}
      <div className="w-full md:w-[45%] lg:w-[42%] min-h-[500px] md:min-h-screen bg-gradient-to-br from-[#121418] via-[#0E1013] to-[#0A0B0E] p-8 sm:p-14 lg:p-16 flex flex-col justify-between relative overflow-hidden text-center md:text-left shrink-0">
        {/* Subtle warm atmospheric golden glow on the top-right corner */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Mini Brand */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-full bg-[#101216] border border-white/20 flex items-center justify-center p-1.5 shadow-sm">
            <div className="w-full h-full rounded-full border border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>
          <span className="font-bold text-sm text-white tracking-tight">Orion</span>
        </div>

        {/* Center Content: Icon + Headline + Subtitle + Pagination */}
        <div className="my-auto py-12 flex flex-col items-center text-center z-10">
          {/* Glossy 3D Rounded Squircle App Icon */}
          <div className="w-[88px] h-[88px] rounded-[24px] bg-gradient-to-b from-[#2E313A] to-[#15171C] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.6)] flex items-center justify-center mb-10 relative group">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg viewBox="0 0 44 44" className="w-full h-full">
                {/* Outer White Arc */}
                <circle
                  cx="22"
                  cy="22"
                  r="15"
                  stroke="#FFFFFF"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="94.2"
                  strokeDashoffset="28"
                  strokeLinecap="round"
                  transform="rotate(-55 22 22)"
                />
                {/* Inner Golden/Orange Wedge Accent */}
                <path
                  d="M 22 10 A 12 12 0 0 1 34 22 L 22 22 Z"
                  fill="#F59E0B"
                  transform="rotate(-20 22 22)"
                />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight leading-[1.25] max-w-[340px]">
            One Platform to Streamline All Product Analytics
          </h1>

          {/* Subtext */}
          <p className="text-[13px] text-white/50 mt-4 max-w-[320px] leading-[1.65] font-normal">
            Your revenue are set to grow by 20% next month. Your revenue is increase by next month with our campaign tools.
          </p>

          {/* Carousel Dots */}
          <div className="flex items-center gap-1.5 mt-9">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-white/25" />
            <span className="w-2 h-2 rounded-full bg-white/25" />
          </div>
        </div>

        {/* Bottom Left Copyright */}
        <div className="text-[11px] text-white/40 font-normal z-10">
          © 2024 Orion
        </div>
      </div>

      {/* ================= RIGHT FORM PANEL (Full Height, 55% width) ================= */}
      <div className="w-full md:w-[55%] lg:w-[58%] min-h-screen bg-[#FFFFFF] p-8 sm:p-14 lg:p-16 flex flex-col justify-between">
        {/* Top Bar Switcher (Right aligned) */}
        <div className="flex items-center justify-end text-xs">
          <span className="text-[#141414]">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="font-semibold text-[#141414] underline hover:text-black cursor-pointer ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {/* Form Core Area */}
        <div className="max-w-[380px] w-full mx-auto my-auto py-8">
          {/* Header Titles */}
          <div className="text-center mb-7">
            <h2 className="text-[26px] font-bold text-[#141414] tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back to Orion!'}
            </h2>
            <p className="text-[12px] text-[#6B6A66] mt-1.5 font-normal">
              {isSignUp ? 'Please enter your details to sign up' : 'Please enter your details to sign in your account'}
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              className="w-full py-3 px-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-xl text-xs font-semibold text-[#141414] hover:bg-[#FAFAF7] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
            >
              {/* Google G Logo */}
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
              className="w-full py-3 px-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-xl text-xs font-semibold text-[#141414] hover:bg-[#FAFAF7] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
            >
              {/* Apple Logo */}
              <svg className="w-4 h-4 fill-current text-[#141414]" viewBox="0 0 24 24">
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
            <div className="relative flex justify-center text-[11px] text-[#9E9D97]">
              <span className="bg-white px-3 font-normal">Or sign in with</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-[#141414] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#FFFFFF] border border-[#E7E6DF] rounded-xl px-3.5 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#E89328] transition shadow-2xs"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#141414] mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@mail.com"
                className="w-full bg-[#FFFFFF] border border-[#E7E6DF] rounded-xl px-3.5 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#E89328] transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#141414] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="minimum 8 character"
                  className="w-full bg-[#FFFFFF] border border-[#E7E6DF] rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#E89328] transition shadow-2xs"
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

            {/* Radiant Golden/Orange Gradient Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-semibold text-white transition cursor-pointer shadow-[0_4px_14px_rgba(232,147,40,0.35)] hover:shadow-[0_6px_20px_rgba(232,147,40,0.45)] hover:brightness-105 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(180deg, #F5A623 0%, #E88A1A 100%)',
              }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up →' : 'Sign In →'}
            </button>

            {!isSignUp && (
              <div className="text-center pt-2">
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

        {/* Bottom Footer Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#9E9D97] pt-4">
          <span>© 2024 Orion</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#141414] transition">Privacy Policy</a>
            <a href="#" className="hover:text-[#141414] transition">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

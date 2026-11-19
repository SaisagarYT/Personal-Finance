import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Wallet, ArrowLeftRight, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

const slides = [
  {
    badge: 'MULTI-CURRENCY',
    icon: Wallet,
    title: 'Effortless Multi-Currency Wealth & Wallet Tracking',
    description:
      'Seamlessly manage INR (₹), USD ($) and global currencies with real-time balances, spending limits, and dynamic scaling across all your accounts.',
    tabLabel: '01 Wallets',
  },
  {
    badge: 'ACTIVITY LEDGER',
    icon: ArrowLeftRight,
    title: 'Live Transaction Ledger & Financial Clarity',
    description:
      'Track every send and receive operation with instant category breakdowns, live search, and exportable CSV ledgers in seconds.',
    tabLabel: '02 Ledger',
  },
  {
    badge: 'BANK-GRADE SECURITY',
    icon: ShieldCheck,
    title: 'Private, Encrypted & Cloud-Synced on Cloudflare & Supabase',
    description:
      'Your financial data is guarded by Row-Level Security (RLS) and Cloudflare edge isolates. Only your authenticated session can query or modify your wallets.',
    tabLabel: '03 Security',
  },
];

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  const currentSlide = slides[activeSlide];

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans selection:bg-[#E89328] selection:text-white bg-[#FFFFFF]">
      {/* ================= LEFT DARK HERO PANEL ================= */}
      <div className="w-full md:w-[45%] lg:w-[42%] min-h-[520px] md:min-h-screen bg-gradient-to-br from-[#121418] via-[#0E1013] to-[#0A0B0E] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden text-left shrink-0 border-r border-white/5">
        {/* Subtle warm atmospheric glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Mini Brand - clean Kova typography */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">Kova</span>
          <span className="text-[10px] uppercase font-semibold text-white/40 tracking-widest ml-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Finance</span>
        </div>

        {/* Center Content: Animated Slide Text */}
        <div className="my-auto py-10 flex flex-col z-10 max-w-[420px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-amber-400 tracking-wider w-fit mb-6 transition-all duration-300">
            <currentSlide.icon className="w-3.5 h-3.5" />
            <span>{currentSlide.badge}</span>
          </div>

          {/* Sliding Headline */}
          <div className="relative overflow-hidden min-h-[90px]">
            <h1
              key={`title-${activeSlide}`}
              className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight leading-[1.25] transition-all duration-500"
            >
              {currentSlide.title}
            </h1>
          </div>

          {/* Sliding Subtext */}
          <div className="relative overflow-hidden min-h-[75px] mt-3">
            <p
              key={`desc-${activeSlide}`}
              className="text-[13px] text-white/60 leading-[1.65] font-normal transition-all duration-500"
            >
              {currentSlide.description}
            </p>
          </div>

          {/* 3 Interactive Slide Tabs with text */}
          <div className="flex items-center gap-2 mt-8 p-1 bg-white/5 rounded-xl border border-white/10 w-fit backdrop-blur-xs">
            {slides.map((slide, index) => {
              const isActive = index === activeSlide;
              return (
                <button
                  key={slide.tabLabel}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black font-semibold shadow-xs'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {slide.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Left Copyright */}
        <div className="text-[11px] text-white/40 font-normal z-10">
          © 2026 Kova. All rights reserved.
        </div>
      </div>

      {/* ================= RIGHT FORM PANEL ================= */}
      <div className="w-full md:w-[55%] lg:w-[58%] min-h-screen bg-[#FFFFFF] p-8 sm:p-14 lg:p-16 flex flex-col justify-between">
        {/* Top Bar Switcher */}
        <div className="flex items-center justify-end text-xs">
          <span className="text-[#6B6A66]">
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
              {isSignUp ? 'Create your Kova account' : 'Welcome back to Kova!'}
            </h2>
            <p className="text-[12px] text-[#6B6A66] mt-1.5 font-normal">
              {isSignUp
                ? 'Enter your details to start tracking your personal finances'
                : 'Enter your credentials to access your financial dashboard'}
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              className="w-full py-3 px-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-xl text-xs font-semibold text-[#141414] hover:bg-[#FAFAF7] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
            >
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
                  placeholder="minimum 8 characters"
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
          <span>© 2026 Kova. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#141414] transition">Privacy Policy</a>
            <a href="#" className="hover:text-[#141414] transition">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

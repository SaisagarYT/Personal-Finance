import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';

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
  const [activeSlide, setActiveSlide] = useState(0);

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

  const featureTabs = [
    {
      id: 0,
      label: '01 Cockpit',
      badge: 'MULTI-CURRENCY WEALTH',
      title: 'Real-time multi-currency balances & net worth tracking',
      description:
        'Seamlessly unify INR (₹), USD ($) and foreign accounts with real-time conversion at market rates, automatic ledger balancing, and dynamic font auto-scaling.',
    },
    {
      id: 1,
      label: '02 Ledger',
      badge: 'INSTANT CASH FLOW',
      title: 'Precision transaction ledger with 3-state cockpit',
      description:
        'Switch between Total Balance, Outflow (Send) and Inflow (Receive) with one click. Every transaction is tagged with masked bank IDs and instant category analysis.',
    },
    {
      id: 2,
      label: '03 Security',
      badge: 'BANK-GRADE INFRASTRUCTURE',
      title: 'Zero-trust architecture on Cloudflare Workers & Supabase',
      description:
        'Guarded by PostgreSQL Row-Level Security (RLS) and serverless V8 edge isolates. Your financial records are isolated, encrypted, and accessible only to your session.',
    },
  ];

  const currentFeature = featureTabs[activeSlide];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-[#F3F2ED] text-[#141414] antialiased">
      {/* ================= LEFT PRODUCT SHOWCASE PANEL (SaaS Level) ================= */}
      <div className="w-full lg:w-[48%] xl:w-[45%] bg-[#141414] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-[#262626]">
        {/* Subtle grid pattern for modern SaaS texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Brand Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E74D28] text-white font-black text-sm flex items-center justify-center shadow-xs">
              K
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                Kova
              </span>
              <span className="text-[10px] text-white/50 font-medium tracking-wide">
                Personal Finance Platform
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1F1F1F] border border-[#2D2D2D] text-[11px] text-white/70">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>Cloudflare Edge Active</span>
          </div>
        </div>

        {/* Center: Live Product Mockup Preview */}
        <div className="my-8 sm:my-auto z-10 space-y-6 max-w-lg">
          {/* Badge & Title */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] border border-[#2D2D2D] text-[10px] font-bold text-[#E74D28] tracking-wider uppercase mb-3">
              {currentFeature.badge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {currentFeature.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-2.5 leading-relaxed font-normal">
              {currentFeature.description}
            </p>
          </div>

          {/* Interactive Live Mini-Cockpit Card Preview */}
          <div className="bg-[#1C1C1E] border border-[#2D2D30] rounded-[24px] p-5 shadow-2xl relative overflow-hidden">
            {activeSlide === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium">Total Net Balance</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#262628] border border-[#3A3A3D] text-[10px] font-bold text-white flex items-center gap-1">
                    <span>🇮🇳</span> INR (₹)
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">
                    ₹2,40,250.00
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#16A34A] font-semibold mt-1">
                    <span>↑ +12.8%</span>
                    <span className="text-white/40 font-normal">vs last month</span>
                  </div>
                </div>
                {/* Mini Wallets Tray */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A2A2D]">
                  <div className="bg-[#262628] rounded-xl p-2.5 border border-[#333336]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                      <span>HDFC Checking</span>
                      <span className="text-[9px] text-white/40">•••• F86C</span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1">₹85,450.00</p>
                  </div>
                  <div className="bg-[#262628] rounded-xl p-2.5 border border-[#333336]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                      <span>SBI Savings</span>
                      <span className="text-[9px] text-white/40">•••• C0C7</span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1">₹1,50,000.00</p>
                  </div>
                </div>
              </div>
            )}

            {activeSlide === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-white/60 font-medium pb-2 border-b border-[#2A2A2D]">
                  <span>Recent Activity Ledger</span>
                  <span className="text-[10px] text-[#16A34A] font-bold">● Live Sync</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-[#262628] rounded-xl p-2.5 border border-[#333336] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Tech Lead Salary</p>
                        <p className="text-[10px] text-white/40">HDFC • Nov 01</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#16A34A]">+₹1,15,000.00</span>
                  </div>
                  <div className="bg-[#262628] rounded-xl p-2.5 border border-[#333336] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#E74D28]/20 text-[#E74D28] flex items-center justify-center">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Apartment Rent</p>
                        <p className="text-[10px] text-white/40">HDFC • Nov 02</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#E74D28]">-₹24,000.00</span>
                  </div>
                </div>
              </div>
            )}

            {activeSlide === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-white/60 font-medium pb-2 border-b border-[#2A2A2D]">
                  <span>Security & Isolation</span>
                  <span className="text-[10px] text-[#16A34A] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Certified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#262628] rounded-xl p-3 border border-[#333336] space-y-1">
                    <Lock className="w-4 h-4 text-[#E74D28]" />
                    <p className="text-xs font-bold text-white">Postgres RLS</p>
                    <p className="text-[10px] text-white/50 leading-tight">
                      Tenant-isolated row level security.
                    </p>
                  </div>
                  <div className="bg-[#262628] rounded-xl p-3 border border-[#333336] space-y-1">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <p className="text-xs font-bold text-white">Edge V8 Isolates</p>
                    <p className="text-[10px] text-white/50 leading-tight">
                      Sub-15ms serverless Cloudflare Workers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feature Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#1A1A1C] rounded-full border border-[#2D2D30] w-fit">
            {featureTabs.map((tab) => {
              const isActive = tab.id === activeSlide;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSlide(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#E74D28] text-white shadow-xs'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Trust & Security Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/40 pt-4 border-t border-[#222224] z-10">
          <span>© 2026 Kova. Built for financial sovereignty.</span>
          <div className="flex items-center gap-3">
            <span>256-Bit SSL</span>
            <span>•</span>
            <span>Cloudflare Anycast</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT AUTH FORM PANEL (Clean Kova Warm Stone) ================= */}
      <div className="flex-1 bg-[#F3F2ED] p-6 sm:p-12 lg:p-16 flex flex-col justify-between items-center">
        {/* Top Header Mode Switcher (Matching Dashboard 3-State Cockpit Pill) */}
        <div className="w-full max-w-md flex items-center justify-end">
          <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] rounded-full border border-[#E7E6DF] shadow-xs">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                !isSignUp
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#6B6A66] hover:text-[#141414]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                isSignUp
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#6B6A66] hover:text-[#141414]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Central Auth Card */}
        <div className="w-full max-w-md my-auto py-8">
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[28px] p-7 sm:p-9 shadow-sm space-y-6">
            {/* Header Titles */}
            <div className="text-left">
              <span className="text-[11px] font-bold text-[#E74D28] uppercase tracking-wider block mb-1">
                {isSignUp ? 'Get Started Free' : 'Secure Session'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
                {isSignUp ? 'Create your vault' : 'Welcome back'}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6A66] mt-1.5 leading-relaxed">
                {isSignUp
                  ? 'Set up your credentials to start managing your personal finances and wallets.'
                  : 'Sign in to access your real-time balances, wallets, and cash flow ledger.'}
              </p>
            </div>

            {/* Social Auth Providers */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-2.5 px-3 bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#EAE9E4] rounded-xl text-xs font-semibold text-[#141414] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Google</span>
              </button>

              <button
                type="button"
                className="py-2.5 px-3 bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#EAE9E4] rounded-xl text-xs font-semibold text-[#141414] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current text-[#141414] shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.66-1.08 1.74-.95 2.76 1.01.08 2.05-.51 2.67-1.26" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F0EFEA]" />
              </div>
              <div className="relative flex justify-center text-[11px] text-[#9E9D97]">
                <span className="bg-[#FFFFFF] px-3 font-normal">Or continue with email</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FDF2F0] border border-[#F87171]/40 text-[#E74D28] text-xs font-semibold text-center">
                {errorMessage}
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-[#141414] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Saisagar"
                    className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3.5 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] focus:bg-white transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#141414] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl px-3.5 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] focus:bg-white transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#141414]">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="text-[11px] text-[#6B6A66] hover:text-[#141414] transition cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9D97] hover:text-[#141414] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button (Solid Deep Ink / Persimmon - Zero Glowing Neon Artifacts) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#141414] hover:bg-[#27272A] text-white rounded-full text-xs font-semibold transition cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : isSignUp ? (
                  <span>Create Free Vault →</span>
                ) : (
                  <span>Sign In to Dashboard →</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Support & Privacy */}
        <div className="w-full max-w-md flex items-center justify-between text-[11px] text-[#9E9D97] pt-4">
          <span>Protected by Supabase Auth</span>
          <div className="flex items-center gap-4 font-medium">
            <a href="#" className="hover:text-[#141414] transition">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#141414] transition">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-[#141414] transition">Security</a>
          </div>
        </div>
      </div>
    </div>
  );
};

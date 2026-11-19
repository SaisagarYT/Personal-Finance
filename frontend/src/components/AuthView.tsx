import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';

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
    <div className="min-h-screen w-full bg-[#F3F2ED] text-[#141414] flex flex-col justify-between p-6 sm:p-10 font-sans antialiased selection:bg-[#E74D28]/20 selection:text-[#E74D28]">
      {/* ================= 1. TOP BRAND HEADER ================= */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E74D28] text-white font-extrabold text-sm flex items-center justify-center shadow-xs select-none">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#141414] leading-tight">
              Kova
            </span>
            <span className="text-[11px] text-[#8E8D88] font-medium tracking-tight">
              Personal Finance
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E7E6DF] text-[11px] text-[#6B6A66] font-medium shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Cloudflare Edge Active</span>
        </div>
      </header>

      {/* ================= 2. CENTERED VAULT AUTH CARD ================= */}
      <main className="w-full max-w-[420px] mx-auto my-auto py-6">
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-[24px] p-7 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          {/* Integrated Mode Switcher (Aligned right at the top of the card) */}
          <div className="grid grid-cols-2 p-1 bg-[#F4F3EE] rounded-full border border-[#EAE9E4] mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-full text-xs font-semibold transition cursor-pointer select-none ${
                !isSignUp
                  ? 'bg-[#FFFFFF] text-[#141414] shadow-xs'
                  : 'text-[#8E8D88] hover:text-[#141414]'
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
              className={`py-1.5 rounded-full text-xs font-semibold transition cursor-pointer select-none ${
                isSignUp
                  ? 'bg-[#FFFFFF] text-[#141414] shadow-xs'
                  : 'text-[#8E8D88] hover:text-[#141414]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading Group */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#141414]">
              {isSignUp ? 'Create your vault' : 'Welcome back'}
            </h1>
            <p className="text-xs text-[#8E8D88] mt-1.5 font-normal leading-relaxed">
              {isSignUp
                ? 'Start tracking multi-currency balances and cash flows.'
                : 'Access your sovereign financial ledger and live analytics.'}
            </p>
          </div>

          {/* Social SSO Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              className="h-[44px] px-3 bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#EAE9E4] rounded-[14px] text-xs font-semibold text-[#141414] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
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
              className="h-[44px] px-3 bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#EAE9E4] rounded-[14px] text-xs font-semibold text-[#141414] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg className="w-4 h-4 fill-current text-[#141414] shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.66-1.08 1.74-.95 2.76 1.01.08 2.05-.51 2.67-1.26" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Hairline Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0EFEA]" />
            </div>
            <div className="relative flex justify-center text-[11px] text-[#9E9D97]">
              <span className="bg-[#FFFFFF] px-3 font-normal">or continue with email</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-[14px] bg-[#FDF2F0] border border-[#F87171]/40 text-[#E74D28] text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#141414] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sagar"
                  className="h-[46px] w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-[14px] px-3.5 text-sm text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] focus:bg-white transition"
                  style={{
                    WebkitBoxShadow: '0 0 0px 1000px #FAFAF7 inset',
                    WebkitTextFillColor: '#141414',
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#141414] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-[46px] w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-[14px] px-3.5 text-sm text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] focus:bg-white transition"
                style={{
                  WebkitBoxShadow: '0 0 0px 1000px #FAFAF7 inset',
                  WebkitTextFillColor: '#141414',
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#141414]">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-[11px] text-[#8E8D88] hover:text-[#141414] transition cursor-pointer font-medium"
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
                  className="h-[46px] w-full bg-[#FAFAF7] border border-[#EAE9E4] rounded-[14px] pl-3.5 pr-11 text-sm text-[#141414] placeholder-[#9E9D97] focus:outline-none focus:border-[#141414] focus:bg-white transition"
                  style={{
                    WebkitBoxShadow: '0 0 0px 1000px #FAFAF7 inset',
                    WebkitTextFillColor: '#141414',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3.5 flex items-center text-[#9E9D97] hover:text-[#141414] transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="h-[46px] w-full mt-2 bg-[#141414] hover:bg-[#27272A] text-white rounded-[14px] text-xs font-semibold transition cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 select-none"
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

          {/* Quick Inline Helper */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
              }}
              className="text-xs text-[#8E8D88] hover:text-[#141414] transition font-medium cursor-pointer"
            >
              {isSignUp ? (
                <>
                  Already have a vault? <span className="text-[#141414] font-semibold underline underline-offset-2">Sign in</span>
                </>
              ) : (
                <>
                  New to Kova? <span className="text-[#141414] font-semibold underline underline-offset-2">Create an account</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* ================= 3. BOTTOM TRUST & SECURITY FOOTER ================= */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8E8D88] font-medium pt-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Protected by Supabase Auth & PostgreSQL RLS</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[#141414] transition">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-[#141414] transition">Terms of Service</a>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#8E8D88]" />
            <span>256-Bit SSL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

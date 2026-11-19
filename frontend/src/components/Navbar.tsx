import React from 'react';
import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import type { CurrencyCode } from '../lib/currency';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userName?: string;
  userEmail?: string;
  currency?: CurrencyCode;
  onCurrencyChange?: (c: CurrencyCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'Overview',
  onTabChange,
  userName = 'Amara Okello',
  userEmail = 'amara@kova.app',
  currency = 'INR',
  onCurrencyChange,
}) => {
  const tabs = ['Overview', 'Activity', 'Account'];

  return (
    <header className="w-full pt-4 pb-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#E74D28] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            N
          </div>
          <span className="font-bold text-lg text-[#141414] tracking-tight">Kova</span>
        </div>

        {/* Center: Floating Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FFFFFF] border border-[#E7E6DF] rounded-full p-1 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] text-white shadow-sm'
                    : 'text-[#6B6A66] hover:text-[#141414]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Currency Selector & User Chip */}
        <div className="flex items-center gap-2.5">
          {/* Global Currency Selector Dropdown */}
          {onCurrencyChange && (
            <CurrencySelector value={currency} onChange={onCurrencyChange} />
          )}

          {/* Action Icons Pill */}
          <div className="hidden sm:flex items-center gap-1 bg-[#FFFFFF] border border-[#E7E6DF] rounded-full px-2 py-1 shadow-sm">
            <button className="p-1.5 rounded-full text-[#6B6A66] hover:text-[#141414] hover:bg-[#FAFAF7] transition cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-full text-[#6B6A66] hover:text-[#141414] hover:bg-[#FAFAF7] transition cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-full text-[#6B6A66] hover:text-[#141414] hover:bg-[#FAFAF7] transition cursor-pointer">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Chip */}
          <div
            onClick={() => onTabChange?.('Account')}
            className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E7E6DF] rounded-full pl-1 pr-3 py-1 shadow-sm cursor-pointer hover:border-[#D8D6CE] transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#141414] text-white text-[11px] font-bold flex items-center justify-center">
              AO
            </div>
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs font-bold text-[#141414] leading-tight">{userName}</p>
              <p className="text-[10px] text-[#6B6A66] leading-tight">{userEmail}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6A66]" />
          </div>
        </div>
      </div>
    </header>
  );
};

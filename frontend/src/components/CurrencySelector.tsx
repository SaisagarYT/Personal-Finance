import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '../lib/currency';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (val: CurrencyCode) => void;
  variant?: 'pill' | 'compact' | 'input-addon';
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  variant = 'pill',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = SUPPORTED_CURRENCIES.find((c) => c.code === value) || SUPPORTED_CURRENCIES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'input-addon') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFAF7] hover:bg-[#F3F2ED] border border-[#EAE9E4] rounded-xl text-xs font-bold text-[#141414] transition cursor-pointer"
        >
          <span>{selected.flag}</span>
          <span>{selected.code}</span>
          <ChevronDown className="w-3 h-3 text-[#6B6A66]" />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1.5 w-36 bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl shadow-xl py-1.5 z-50">
            {SUPPORTED_CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#FAFAF7] transition cursor-pointer ${
                  c.code === value ? 'text-[#141414] bg-[#FAFAF7]/50' : 'text-[#6B6A66]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span>{c.label}</span>
                </div>
                {c.code === value && <Check className="w-3.5 h-3.5 text-[#141414]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#FAFAF7] border border-[#E7E6DF] rounded-full text-xs font-semibold text-[#141414] shadow-xs hover:border-[#D8D6CE] transition cursor-pointer"
      >
        <span className="text-sm leading-none">{selected.flag}</span>
        <span className="tracking-tight">{selected.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#6B6A66] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-[#FFFFFF] border border-[#E7E6DF] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[#9E9D97] border-b border-[#F0EFEA] mb-1">
            Select Currency
          </div>
          {SUPPORTED_CURRENCIES.map((c) => {
            const isSelected = c.code === value;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'text-[#141414] bg-[#FAFAF7]'
                    : 'text-[#6B6A66] hover:bg-[#FAFAF7] hover:text-[#141414]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{c.flag}</span>
                  <div>
                    <span className="block leading-tight text-xs">{c.label}</span>
                    <span className="text-[10px] text-[#9E9D97]">{c.country}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#141414] stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

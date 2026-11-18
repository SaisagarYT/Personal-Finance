import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { MetricCardsGrid } from './components/MetricCardsGrid';

export function App() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-[#141414] flex flex-col font-sans antialiased pb-12">
      {/* 1. Header Navigation Bar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Welcome Section Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
            Good morning, Amara
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6A66] mt-1">
            Here's where your money stands today — balances, cash flow and recent activity.
          </p>
        </div>

        {/* Top Grid: Left Side (Total Balance) & Center (2x2 Metric Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column (5 of 12 cols): Total Balance & Wallets */}
          <div className="lg:col-span-5 flex flex-col">
            <TotalBalanceCard
              onTransfer={() => console.log('Transfer clicked')}
              onRequest={() => console.log('Request clicked')}
            />
          </div>

          {/* Center Column (4 of 12 cols): 2x2 Metric Cards Grid */}
          <div className="lg:col-span-4 flex flex-col">
            <MetricCardsGrid />
          </div>

          {/* Right Column (3 of 12 cols): Step 4 Space for Total Income Chart & Monthly Limit */}
          <div className="lg:col-span-3 flex flex-col justify-center items-center border-2 border-dashed border-[#E7E6DF] rounded-[28px] bg-[#FAFAF7]/50 p-6 text-[#6B6A66] min-h-[350px]">
            <p className="text-sm font-semibold text-[#141414]">Step 4 Space</p>
            <p className="text-xs text-[#9E9D97] mt-1 text-center">
              Total income profit/loss stacked bar chart + monthly spending limit progress.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

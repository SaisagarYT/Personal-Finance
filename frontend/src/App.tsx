import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { IncomeChartCard } from './components/IncomeChartCard';

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

        {/* Master 2-Column Grid (Left: 8 Cols, Right: 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ================= LEFT MAIN COLUMN (8 of 12) ================= */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            {/* Top Row: Total Balance (1/2) + 2x2 Metric Grid (1/2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              <TotalBalanceCard
                onTransfer={() => console.log('Transfer clicked')}
                onRequest={() => console.log('Request clicked')}
              />
              <MetricCardsGrid />
            </div>

            {/* Bottom Row: Step 5 Space for Recent Activities Table */}
            <div className="flex-1 border-2 border-dashed border-[#E7E6DF] rounded-[28px] bg-[#FAFAF7]/50 p-8 text-[#6B6A66] flex flex-col items-center justify-center min-h-[300px]">
              <p className="text-sm font-semibold text-[#141414]">Step 5 Space: Recent Activities Table</p>
              <p className="text-xs text-[#9E9D97] mt-1 text-center">
                Search bar, Filter button, checkboxes, activity avatars (P, M, H, F, G, S), and status tags.
              </p>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (4 of 12) ================= */}
          <div className="lg:col-span-4 flex flex-col">
            <IncomeChartCard />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

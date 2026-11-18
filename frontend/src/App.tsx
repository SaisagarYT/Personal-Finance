import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { IncomeChartCard } from './components/IncomeChartCard';
import { SpendingLimitCard } from './components/SpendingLimitCard';
import { RecentActivitiesTable } from './components/RecentActivitiesTable';

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

        {/* Master Asymmetric Grid: Left Main (8 cols) + Right Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT MAIN COLUMN (8 of 12) ================= */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            {/* Top Row: Total Balance (50%) + 2x2 Metric Cards (50%) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              <TotalBalanceCard
                onTransfer={() => console.log('Transfer clicked')}
                onRequest={() => console.log('Request clicked')}
              />
              <MetricCardsGrid />
            </div>

            {/* Bottom Row: Full-Width Recent Activities Table */}
            <RecentActivitiesTable />
          </div>

          {/* ================= RIGHT SIDEBAR COLUMN (4 of 12) ================= */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* 1. Total Income Profit & Loss Bar Chart Card */}
            <IncomeChartCard />

            {/* 2. Monthly Spending Limit Progress Card */}
            <SpendingLimitCard />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

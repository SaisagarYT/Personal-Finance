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

        {/* Master Balanced 3-Column Top / 2-Column Bottom Layout */}
        <div className="space-y-6">
          {/* ================= ROW 1: 3 CARDS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* 1. Total Balance Card (4 of 12) */}
            <div className="lg:col-span-4 flex flex-col">
              <TotalBalanceCard
                onTransfer={() => console.log('Transfer clicked')}
                onRequest={() => console.log('Request clicked')}
              />
            </div>

            {/* 2. 2x2 Metric Cards Grid (4 of 12) */}
            <div className="lg:col-span-4 flex flex-col">
              <MetricCardsGrid />
            </div>

            {/* 3. Total Income Chart Card (4 of 12) */}
            <div className="lg:col-span-4 flex flex-col">
              <IncomeChartCard />
            </div>
          </div>

          {/* ================= ROW 2: TABLE + SPENDING LIMIT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Recent Activities Table (8 of 12) */}
            <div className="lg:col-span-8 flex flex-col">
              <RecentActivitiesTable />
            </div>

            {/* Monthly Spending Limit Card (4 of 12) */}
            <div className="lg:col-span-4 flex flex-col">
              <SpendingLimitCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

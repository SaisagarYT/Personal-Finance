import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TotalBalanceCard } from './components/TotalBalanceCard';

export function App() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-[#141414] flex flex-col font-sans antialiased">
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

        {/* Top Grid: Left Side (Total Balance Card) & Right Side Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (5 of 12 cols): Total Balance & Wallets */}
          <div className="lg:col-span-5 flex flex-col">
            <TotalBalanceCard
              onTransfer={() => console.log('Transfer clicked')}
              onRequest={() => console.log('Request clicked')}
            />
          </div>

          {/* Right Columns (7 of 12 cols): Placeholder for Step 3 & Step 4 */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center border-2 border-dashed border-[#E7E6DF] rounded-3xl bg-[#FAFAF7]/50 p-8 text-[#6B6A66] min-h-[350px]">
            <p className="text-sm font-semibold text-[#141414]">Step 3 & 4 Space</p>
            <p className="text-xs text-[#9E9D97] mt-1 text-center">
              Next: 2x2 Metric Cards (Total earnings in orange, spending, income, revenue) + Profit/Loss chart.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

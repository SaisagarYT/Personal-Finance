import { useState } from 'react';
import { Navbar } from './components/Navbar';

export function App() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-[#141414] flex flex-col font-sans">
      {/* 1. Header Navigation Bar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Placeholder container for next sections */}
        <div className="text-center py-16 border-2 border-dashed border-[#E7E6DF] rounded-3xl bg-[#FAFAF7]/50 text-[#6B6A66]">
          <p className="text-sm font-medium">Navbar implemented cleanly.</p>
          <p className="text-xs text-[#9E9D97] mt-1">Ready for Step 2: Welcome Section & Total Balance Card.</p>
        </div>
      </main>
    </div>
  );
}

export default App;

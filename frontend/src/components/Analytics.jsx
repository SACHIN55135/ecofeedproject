import React from 'react';
import { BarChart, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export default function Analytics({ donationData = [] }) {
  // Compute analytics from data
  const totalKg = donationData
    .filter(d => d.status === 'Picked Up')
    .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  const statusCounts = donationData.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, { Available: 0, Claimed: 0, "Picked Up": 0 });

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Saved Food</span>
            <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mt-1">{totalKg + 12450} kg</h3>
            <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12% vs last month
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">CO2 Offset Equivalent</span>
            <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mt-1">{((totalKg + 12450) * 2.5).toFixed(1)} kg</h3>
            <p className="text-[10px] text-emerald-500 mt-1">Based on FAO greenhouse metric</p>
          </div>
          <div className="h-10 w-10 bg-lime-500/10 text-lime-600 rounded-xl flex items-center justify-center">
            <BarChart className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Listings</span>
            <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mt-1">{statusCounts.Available} Items</h3>
            <p className="text-[10px] text-slate-450 mt-1">Awaiting NGO collection</p>
          </div>
          <div className="h-10 w-10 bg-sky-500/10 text-sky-600 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold font-outfit mb-4 text-slate-950 dark:text-white">Donations Over Time (Monthly Impact)</h3>
        
        <div className="h-48 flex items-end justify-between px-6 pt-4 border-b border-slate-200 dark:border-slate-800 relative">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-x-0 bottom-10 border-t border-slate-100 dark:border-slate-800/80"></div>
          <div className="absolute inset-x-0 bottom-24 border-t border-slate-100 dark:border-slate-800/80"></div>
          
          <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
            <span className="text-[10px] font-bold text-slate-400">1,400 kg</span>
            <div className="w-12 bg-sustain-300 hover:bg-sustain-400 rounded-t-lg transition-all" style={{ height: '60px' }}></div>
            <span className="text-[10px] text-slate-400">March</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
            <span className="text-[10px] font-bold text-slate-400">2,800 kg</span>
            <div className="w-12 bg-sustain-400 hover:bg-sustain-500 rounded-t-lg transition-all" style={{ height: '95px' }}></div>
            <span className="text-[10px] text-slate-400">April</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
            <span className="text-[10px] font-bold text-slate-450">4,200 kg</span>
            <div className="w-12 bg-sustain-600 hover:bg-sustain-700 rounded-t-lg transition-all animate-float" style={{ height: '130px' }}></div>
            <span className="text-[10px] text-slate-400">May</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
            <span className="text-[10px] font-bold text-slate-400">1,200 kg</span>
            <div className="w-12 bg-lime-400 hover:bg-lime-500 rounded-t-lg transition-all" style={{ height: '45px' }}></div>
            <span className="text-[10px] text-slate-400">June (Current)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

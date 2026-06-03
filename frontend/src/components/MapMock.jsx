import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export default function MapMock({ fromAddress = "Shelter Hub", toAddress = "Donor Facility" }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3 text-xs">
        <span className="font-bold flex items-center gap-1.5 text-slate-850 dark:text-slate-100">
          <Navigation className="h-3.5 w-3.5 text-sustain-500 animate-pulse" />
          Active Pickup Navigation Map
        </span>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
          GPS Tracking Active
        </span>
      </div>

      <div className="bg-slate-200 dark:bg-slate-950 h-56 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-800 flex flex-col justify-between p-4">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Map Compass */}
        <div className="z-10 self-start bg-slate-900/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-800">
          <Compass className="h-3 w-3 text-sustain-400 animate-spin-slow" />
          <span>N 39° 44' 22.8"</span>
        </div>

        {/* Simulated SVG Path Map Route */}
        <div className="absolute inset-0 p-8 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full text-sustain-500" stroke="currentColor" strokeWidth="3" fill="none">
            <path strokeDasharray="5" d="M25,25 Q100,70 160,50 T280,120" className="stroke-sustain-500 dark:stroke-sustain-400" />
            
            {/* Start Pin */}
            <circle cx="25" cy="25" r="7" fill="#10b981" className="animate-ping" />
            <circle cx="25" cy="25" r="5" fill="#10b981" />
            
            {/* End Pin */}
            <circle cx="280" cy="120" r="7" fill="#0284c7" />
            <circle cx="280" cy="120" r="5" fill="#0284c7" />
          </svg>
        </div>

        {/* Pin labels */}
        <div className="absolute top-10 left-12 bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded shadow">
          {fromAddress} (Start)
        </div>
        <div className="absolute bottom-12 right-12 bg-sky-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
          {toAddress} (Destination)
        </div>

        {/* Bottom Banner */}
        <div className="z-10 bg-slate-900/90 text-white text-[10px] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between shadow">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[8px] uppercase font-bold">Route ETA</span>
            <span>4.2 miles • 11 mins</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800"></div>
          <div className="flex flex-col text-right">
            <span className="text-slate-400 text-[8px] uppercase font-bold">Driver GPS</span>
            <span className="text-lime-400">Arriving shortly</span>
          </div>
        </div>
      </div>
    </div>
  );
}

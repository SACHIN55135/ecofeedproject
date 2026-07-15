import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ShieldCheck, Leaf, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function MapMock({ fromAddress = "NGO Hub", toAddress = "Donor Facility", activePickups = [] }) {
  const { t } = useTranslation();
  const [routeMode, setRouteMode] = useState('eco'); // eco, fast

  // Route statistics based on mode
  const stats = routeMode === 'eco' 
    ? { distance: "3.8 miles", duration: "12 mins", carbonSaved: "1.4 kg CO2", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25", path: "M25,25 Q70,90 140,80 T280,120" }
    : { distance: "4.5 miles", duration: "9 mins", carbonSaved: "0.8 kg CO2", color: "text-sky-500 bg-sky-500/10 border-sky-500/25", path: "M25,25 L120,40 L210,95 L280,120" };

  const directions = routeMode === 'eco'
    ? [
        "Head south on NGO Hub Road toward Green Alley (0.5 mi)",
        "Turn left onto Eco Boulevard - Avoid traffic zone (1.2 mi)",
        "Keep right to merge onto Sustain Parkway (1.5 mi)",
        "Arrive at donor location on the right (0.6 mi)"
      ]
    : [
        "Head north on NGO Hub Road (0.4 mi)",
        "Take fast lane exit onto Express Hwy (3.1 mi)",
        "Take exit 4B toward Food District (0.7 mi)",
        "Arrive at destination (0.3 mi)"
      ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold flex items-center gap-1.5 text-slate-850 dark:text-slate-100">
          <Navigation className="h-3.5 w-3.5 text-sustain-500 animate-pulse" />
          {t('route_opt')} Map
        </span>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
          GPS Live Tracking
        </span>
      </div>

      {/* Route Mode Switches */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setRouteMode('eco')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-[10px] font-bold transition-all ${
            routeMode === 'eco'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/15'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Leaf className="h-3.5 w-3.5" />
          Eco-Route Optimized
        </button>
        <button
          onClick={() => setRouteMode('fast')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-[10px] font-bold transition-all ${
            routeMode === 'fast'
              ? 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/15'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Fastest Route
        </button>
      </div>

      {/* SVG Map Graphics */}
      <div className="bg-slate-200 dark:bg-slate-950 h-56 rounded-xl relative overflow-hidden border border-slate-350 dark:border-slate-850 flex flex-col justify-between p-4">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="z-10 self-start bg-slate-900/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-800">
          <Compass className="h-3 w-3 text-sustain-400 animate-spin-slow" />
          <span>GPS Active • {stats.distance}</span>
        </div>

        {/* Dynamic Route SVG path */}
        <div className="absolute inset-0 p-8 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full text-sustain-500" stroke="currentColor" strokeWidth="3" fill="none">
            <path strokeDasharray="4" d={stats.path} className="stroke-sustain-500 dark:stroke-sustain-400" />
            
            {/* Start Pin */}
            <circle cx="25" cy="25" r="6" fill="#10b981" className="animate-ping" />
            <circle cx="25" cy="25" r="4.5" fill="#10b981" />
            
            {/* Destination Pin */}
            <circle cx="280" cy="120" r="6" fill="#0284c7" />
            <circle cx="280" cy="120" r="4.5" fill="#0284c7" />
          </svg>
        </div>

        {/* Node Names */}
        <div className="absolute top-10 left-12 bg-emerald-500 text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
          {fromAddress} (Start)
        </div>
        <div className="absolute bottom-12 right-12 bg-sky-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
          {toAddress} (End)
        </div>

        {/* GPS Banner */}
        <div className="z-10 bg-slate-900/95 text-white text-[9px] p-2 rounded-lg border border-slate-800 flex items-center justify-between shadow">
          <div className="flex flex-col">
            <span className="text-slate-450 text-[7px] uppercase font-bold">Metrics</span>
            <span>{stats.distance} • {stats.duration}</span>
          </div>
          <div className="h-5 w-[1px] bg-slate-800"></div>
          <div className="flex flex-col text-right">
            <span className="text-slate-450 text-[7px] uppercase font-bold">Eco Impact</span>
            <span className="text-emerald-400 font-bold">-{stats.carbonSaved}</span>
          </div>
        </div>
      </div>

      {/* Step by step Directions List */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Turn-by-Turn Directions</h4>
        <div className="space-y-1 max-h-28 overflow-y-auto">
          {directions.map((step, idx) => (
            <div key={idx} className="flex gap-2 text-[10px] text-slate-600 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800/40 pb-1">
              <ArrowRight className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-stop Optimization Banner if multiple items exist */}
      {activePickups.length > 1 && (
        <div className="bg-sustain-500/10 border border-sustain-500/25 p-3 rounded-xl flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-sustain-600 dark:text-sustain-400 shrink-0 mt-0.5" />
          <div className="text-[9px] text-sustain-800 dark:text-sustain-300">
            <strong>Multi-stop Optimized Schedule Active:</strong> Route optimized dynamically across <strong>{activePickups.length} pickups</strong> to save fuel and minimize travel duration.
          </div>
        </div>
      )}

    </div>
  );
}

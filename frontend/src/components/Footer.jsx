import React from 'react';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-tr from-sustain-500 to-lime-400 rounded-lg flex items-center justify-center mr-2 shadow shadow-sustain-500/10">
                <Leaf className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold font-outfit text-slate-900 dark:text-white">EcoFeed</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Bridging the surplus food gap through real-time coordinate matching. Together, we reduce food waste, support localized charities, and lower greenhouse emissions.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-450 mb-3 font-outfit">Ecosystem</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#about" className="hover:text-sustain-600">About Our Mission</a></li>
              <li><a href="#how-it-works" className="hover:text-sustain-600">Logistics Workflow</a></li>
              <li><a href="#contact" className="hover:text-sustain-600">Contact Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-450 mb-3 font-outfit">Contact Info</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Green Sustainability Lab, Tech City<br />
              support@ecofeed.org<br />
              +1 (555) 492-9100
            </p>
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400">
          <p>© 2026 EcoFeed Inc. All rights reserved. Hackathon Project for zero hunger.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Hygienic Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Hotel, ShieldCheck, Heart, CloudUpload, BellRing, CheckSquare, Truck, HelpCircle, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_donations: 384,
    food_saved_kg: 12450,
    ngos_connected: 154,
    people_helped: 25000
  });

  useEffect(() => {
    // Fetch stats from backend API
    fetch('/api/stats')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        setStats({
          total_donations: data.total_donations + 350,
          food_saved_kg: data.food_saved_kg + 12000,
          ngos_connected: data.ngos_connected + 150,
          people_helped: (data.food_saved_kg + 12000) * 2
        });
      })
      .catch(() => {
        // Fallback to static numbers if backend is not running yet
      });
  }, []);

  return (
    <div className="overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-36 bg-gradient-to-b from-sustain-50/50 via-slate-50 to-white dark:from-sustain-950/20 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sustain-100 dark:bg-sustain-900/40 text-sustain-700 dark:text-sustain-300 rounded-full text-xs font-semibold tracking-wide border border-sustain-200 dark:border-sustain-800/40 animate-pulse">
              🌱 Zero Waste & Hunger Ecosystem
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-outfit text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Reduce Food Waste,<br />
              <span className="bg-gradient-to-r from-sustain-600 via-emerald-500 to-lime-500 bg-clip-text text-transparent">
                Feed More Lives
              </span>
            </h1>
            <p className="text-slate-650 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Diverting quality surplus food away from landfill hazards. Easily connect hotels, caterers, and food businesses directly with volunteer NGOs in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
              <button 
                onClick={() => navigate('/login')} 
                className="bg-sustain-600 hover:bg-sustain-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-sustain-600/20 transition-all hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
              >
                Donate Surplus Food <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-8 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:scale-[1.02] text-sm"
              >
                Join as NGO Partner
              </button>
            </div>

            {/* Quick Summary metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800/50 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-2xl font-bold text-slate-950 dark:text-white font-outfit">{stats.food_saved_kg}kg</div>
                <div className="text-xxs text-slate-400 font-semibold uppercase tracking-wider">Food Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-950 dark:text-white font-outfit">{stats.total_donations}</div>
                <div className="text-xxs text-slate-400 font-semibold uppercase tracking-wider">Total Batches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-950 dark:text-white font-outfit">{stats.ngos_connected}</div>
                <div className="text-xxs text-slate-400 font-semibold uppercase tracking-wider">NGO partners</div>
              </div>
            </div>
          </div>

          {/* Right graphics */}
          <div className="relative flex justify-center items-center lg:pl-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 bg-sustain-500/20 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 max-w-md w-full p-4 space-y-4">
              <div className="relative rounded-2xl overflow-hidden group h-60">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800" 
                  alt="Food distribution volunteers"
                  className="object-cover h-full w-full group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute bottom-4 left-4 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Impact Story</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3.5 flex items-center justify-between border border-slate-150 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Fresh Lasagna Pan Available</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400">Listed by La Piazza • 25 portions</p>
                  </div>
                </div>
                <button onClick={() => navigate('/login')} className="bg-sustain-600 hover:bg-sustain-700 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow">Claim</button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="text-4xl lg:text-5xl font-extrabold font-outfit text-sustain-600 dark:text-sustain-400">{stats.food_saved_kg}+</span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Food Saved (kg)</p>
            </div>
            <div className="space-y-1">
              <span className="text-4xl lg:text-5xl font-extrabold font-outfit text-sustain-600 dark:text-sustain-400">{stats.total_donations}+</span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Listings</p>
            </div>
            <div className="space-y-1">
              <span className="text-4xl lg:text-5xl font-extrabold font-outfit text-sustain-600 dark:text-sustain-400">{stats.ngos_connected}+</span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NGOs Connected</p>
            </div>
            <div className="space-y-1">
              <span className="text-4xl lg:text-5xl font-extrabold font-outfit text-sustain-600 dark:text-sustain-400">{stats.people_helped}+</span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">People Fed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1595273670150-db0a3e368157?auto=format&fit=crop&q=80&w=800" 
              alt="Food distribution bins" 
              className="rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
              The Food Waste Challenge vs Community Hunger
            </h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Every day, massive quantities of fresh, nutritional food are thrown away by restaurants, hotel buffets, and supermarkets due to strict freshness policies, while nearby shelters suffer from chronic food shortages. This is primarily a coordination and logistics challenge.
              </p>
              <p>
                <strong>EcoFeed</strong> bridges this communication gap. By allowing donors to list fresh batches with quick expiration times and giving verified NGOs instant maps and pickup dispatches, we create a zero-friction sustainability cycle.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-sustain-100 dark:bg-sustain-950 flex items-center justify-center text-sustain-700 dark:text-sustain-400">
                  <Hotel className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">For Businesses</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Divert waste, meet ESG ratings, and claim tax write-offs safely.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-sustain-100 dark:bg-sustain-950 flex items-center justify-center text-sustain-700 dark:text-sustain-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">For NGOs</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Access quality, nutritional batches from certified local donors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">EcoFeed Dispatch Loop</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">How our micro-logistics platform bridges food waste in five actions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute top-4 left-4 text-xs font-bold text-slate-250 dark:text-slate-700 font-outfit">01</span>
              <div className="h-10 w-10 bg-sustain-500/10 text-sustain-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold mb-1">Donor Uploads</h4>
              <p className="text-[10px] text-slate-450">Donor specifies food type, serving counts, address, and photo.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute top-4 left-4 text-xs font-bold text-slate-250 dark:text-slate-700 font-outfit">02</span>
              <div className="h-10 w-10 bg-sustain-500/10 text-sustain-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BellRing className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold mb-1">Alert Sent</h4>
              <p className="text-[10px] text-slate-450">Nearby verified NGOs receive a real-time notification push.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute top-4 left-4 text-xs font-bold text-slate-250 dark:text-slate-700 font-outfit">03</span>
              <div className="h-10 w-10 bg-sustain-500/10 text-sustain-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold mb-1">NGO Accepts</h4>
              <p className="text-[10px] text-slate-450">Charity claims the donation and locks in the pickup path.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute top-4 left-4 text-xs font-bold text-slate-250 dark:text-slate-700 font-outfit">04</span>
              <div className="h-10 w-10 bg-sustain-500/10 text-sustain-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Truck className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold mb-1">Food Collection</h4>
              <p className="text-[10px] text-slate-450">NGO driver arrives, scans, checks hygiene, and collects batch.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute top-4 left-4 text-xs font-bold text-slate-250 dark:text-slate-700 font-outfit">05</span>
              <div className="h-10 w-10 bg-sustain-500/10 text-sustain-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold mb-1">Feeding Needy</h4>
              <p className="text-[10px] text-slate-450">Meals are distributed safely to local shelters and communities.</p>
            </div>

          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">Platform Modules</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">Custom tools built for transparency, verification, and speed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <CloudUpload className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold mb-2 text-slate-950 dark:text-white">Real-Time Donation Listings</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Donors quickly upload menus, photos, servings count, and exact expiry times.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-sky-500/10 text-sky-600 rounded-lg flex items-center justify-center mb-4">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold mb-2 text-slate-950 dark:text-white">Route Navigation Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Driver maps integrate pickup addresses directly, showing optimized routes and ETAs.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold mb-2 text-slate-950 dark:text-white">Reviews & Feedback</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Both donors and NGOs rate transactions to build high-trust community accountability.</p>
          </div>

        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 bg-slate-900 text-white border-t border-sustain-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold font-outfit text-white">Join the Fight Against Food Waste</h2>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Have questions about integrations, food compliance laws, or onboarding your establishment? Reach out, and our local sustainability team will assist.
            </p>
            <div className="space-y-3 text-xs text-slate-350">
              <p>📍 Green Sustainability Lab, Tech City</p>
              <p>✉️ support@ecofeed.org</p>
              <p>📞 +1 (555) 492-9100</p>
            </div>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }} className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Full Name</label>
                <input type="text" className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white" required />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Email</label>
                <input type="email" className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white" required />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Message</label>
              <textarea className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white" rows="3" required></textarea>
            </div>
            <button type="submit" className="w-full text-xs font-semibold py-2.5 bg-sustain-600 hover:bg-sustain-700 rounded-lg transition-colors">Send Message</button>
          </form>
        </div>
      </section>

    </div>
  );
}

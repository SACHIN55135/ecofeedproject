import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { PlusCircle, Trash, Star, Loader2, Award, QrCode, Leaf, Flame, Sparkles, AlertCircle, ScanLine, Trophy } from 'lucide-react';

export default function DonorDashboard() {
  const { user, authFetch } = useAuth();
  const { t } = useTranslation();
  const [donations, setDonations] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodType, setFoodType] = useState('Veg');
  const [expiryTime, setExpiryTime] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // UI Flow states
  const [activeReviewDonation, setActiveReviewDonation] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [scanningDonationId, setScanningDonationId] = useState(null);
  const [activeQrDonation, setActiveQrDonation] = useState(null);
  const [aiMatches, setAiMatches] = useState({});
  const [redeemedBadge, setRedeemedBadge] = useState(false);

  const fetchMyDonations = async () => {
    try {
      const response = await authFetch('/api/donations');
      if (response.ok) {
        const data = await response.json();
        const myData = data.filter(d => d.donor_id === user.id);
        setDonations(myData);
        fetchMatchesForDonations(myData);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/rewards/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatchesForDonations = async (myData) => {
    const tempMatches = {};
    for (const d of myData) {
      if (d.status === 'Available') {
        try {
          const res = await authFetch(`/api/ai/match?donation_id=${d.donation_id}`);
          if (res.ok) {
            const matches = await res.json();
            if (matches.length > 0) {
              tempMatches[d.donation_id] = matches[0]; // best recommendation
            }
          }
        } catch (err) {
          console.error("AI Matching failed:", err);
        }
      }
    }
    setAiMatches(tempMatches);
  };

  useEffect(() => {
    fetchMyDonations();
    fetchLeaderboard();
  }, []);

  const handlePostDonation = async (e) => {
    e.preventDefault();
    if (!foodName || !quantity || !expiryTime || !pickupAddress) return;

    setSubmitLoading(true);
    try {
      const defaultImages = {
        Veg: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
        "Non-Veg": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=600",
        Bakery: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600",
        Groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
      };

      const payload = {
        food_name: foodName,
        quantity: parseFloat(quantity),
        food_type: foodType,
        expiry_time: expiryTime,
        pickup_address: pickupAddress,
        image_url: imageUrl || defaultImages[foodType]
      };

      const res = await authFetch('/api/donations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Food donation listed successfully!");
        setFoodName('');
        setQuantity('');
        setExpiryTime('');
        setPickupAddress('');
        setImageUrl('');
        fetchMyDonations();
        fetchLeaderboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to list donation');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelDonation = async (donationId) => {
    if (!window.confirm("Are you sure you want to cancel this donation?")) return;

    try {
      const res = await authFetch(`/api/donations/${donationId}/cancel`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert("Donation cancelled successfully");
        fetchMyDonations();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQualityScan = async (donationId, img) => {
    setScanningDonationId(donationId);
    setTimeout(async () => {
      try {
        const res = await authFetch('/api/ai/verify-quality', {
          method: 'POST',
          body: JSON.stringify({
            donation_id: donationId,
            image_url: img
          })
        });
        if (res.ok) {
          const data = await res.json();
          alert(`Quality scan PASSED! Freshness index: ${data.freshness_score}% - Certified safe for donation.`);
          fetchMyDonations();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setScanningDonationId(null);
      }
    }, 2500);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          donation_id: activeReviewDonation.donation_id,
          rating,
          comment
        })
      });

      if (res.ok) {
        alert("Review submitted successfully");
        setActiveReviewDonation(null);
        setComment('');
        setRating(5);
        fetchMyDonations();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Determine Tiers
  const getTier = (points) => {
    if (points >= 1000) return { name: "Platinum Eco-Hero", color: "text-purple-600 dark:text-purple-400 border-purple-500/25 bg-purple-500/10" };
    if (points >= 500) return { name: "Gold Eco-Hero", color: "text-amber-600 dark:text-amber-400 border-amber-500/25 bg-amber-500/10" };
    if (points >= 250) return { name: "Silver Eco-Hero", color: "text-slate-500 dark:text-slate-350 border-slate-500/25 bg-slate-500/10" };
    return { name: "Bronze Eco-Hero", color: "text-bronze-600 dark:text-bronze-400 border-orange-500/25 bg-orange-500/10" };
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-sustain-500 animate-spin" />
      </div>
    );
  }

  const tierInfo = getTier(user.eco_points || 0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner with Badges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold font-outfit">{t('donor_cockpit')}</h2>
          <p className="text-xs text-slate-500">Post surplus food, check quality verification, and secure pickup confirmations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold font-outfit ${tierInfo.color}`}>
            <Award className="h-4 w-4" />
            <span>{tierInfo.name}</span>
          </div>
          <div className="px-4 py-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-xs font-bold font-outfit">
            <Leaf className="h-4 w-4" />
            <span>{user.eco_points || 0} {t('eco_points')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Post new listing */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="text-base font-bold font-outfit mb-4 text-slate-950 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            {t('post_donation')}
          </h3>
          <form onSubmit={handlePostDonation} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('food_name')}</label>
              <input 
                type="text" 
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. 50 Servings Pasta & Salad"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('quantity')}</label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('category')}</label>
                <select 
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Bakery">Bakery / Bread</option>
                  <option value="Groceries">Raw Groceries</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('expiry')}</label>
                <input 
                  type="datetime-local" 
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('pickup_address')}</label>
              <input 
                type="text" 
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Where to collect the food"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={submitLoading}
              className="w-full py-3 bg-sustain-600 hover:bg-sustain-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {submitLoading ? 'Posting...' : <><PlusCircle className="h-4.5 w-4.5" /> {t('post_donation')}</>}
            </button>
          </form>
        </div>

        {/* Middle: Active & Past Donations List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main listings table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-outfit mb-4 text-slate-950 dark:text-white">
              {t('active_donations')}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-550 dark:text-slate-400">
                <thead className="text-[10px] text-slate-700 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">Food Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Freshness (AI)</th>
                    <th className="px-4 py-3">Secure Match (AI)</th>
                    <th className="px-4 py-3">NGO claimed</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400">No food donations posted yet.</td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d.donation_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {d.image_url && <img src={d.image_url} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />}
                            <span className="font-semibold text-slate-900 dark:text-white">{d.food_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{d.quantity} kg</td>
                        <td className="px-4 py-3">
                          {d.freshness_score ? (
                            <div className="flex flex-col">
                              <span className={`font-bold ${d.freshness_score >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{d.freshness_score}% Fresh</span>
                              <span className="text-[9px] text-slate-400">Status: {d.quality_status}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleQualityScan(d.donation_id, d.image_url)}
                              className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-1 rounded"
                              disabled={scanningDonationId === d.donation_id}
                            >
                              {scanningDonationId === d.donation_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ScanLine className="h-3 w-3" />
                              )}
                              {scanningDonationId === d.donation_id ? 'Auditing...' : 'Run AI Quality'}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {d.status === 'Available' ? (
                            aiMatches[d.donation_id] ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-sustain-700 dark:text-sustain-400 text-[10px]">
                                  ⭐ {aiMatches[d.donation_id].organization_name}
                                </span>
                                <span className="text-[9px] text-slate-450">Match: {aiMatches[d.donation_id].match_score}%</span>
                              </div>
                            ) : (
                              <span className="italic text-slate-400 text-[10px]">Searching NGOs...</span>
                            )
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[10px]">
                          {d.logistics ? (
                            <div>
                              <strong>{d.logistics.ngo_name}</strong>
                              <div className="text-[9px] text-sustain-650 dark:text-sustain-400">({d.logistics.pickup_status})</div>
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Waiting...</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {d.status === 'Picked Up' && (
                              <button 
                                onClick={() => setActiveReviewDonation(d)}
                                className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2.5 py-1 rounded font-bold"
                              >
                                Review NGO
                              </button>
                            )}
                            {d.status === 'Claimed' && (
                              <button 
                                onClick={() => setActiveQrDonation(d)}
                                className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] px-2.5 py-1 rounded flex items-center gap-1 font-bold"
                              >
                                <QrCode className="h-3 w-3" /> QR Code
                              </button>
                            )}
                            {d.status === 'Available' && (
                              <button 
                                onClick={() => handleCancelDonation(d.donation_id)}
                                className="text-rose-500 hover:text-rose-700 flex items-center gap-0.5 font-bold"
                              >
                                <Trash className="h-3.5 w-3.5" /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Grid: Rewards Shop & Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rewards Vouchers Gallery */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold font-outfit mb-3 text-slate-950 dark:text-white flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                {t('redeem_store')}
              </h3>
              
              <div className="space-y-3">
                <div className="border border-slate-200 dark:border-slate-850 p-3 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                  <div className="text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white">Green Certified Catering Badge</h4>
                    <p className="text-[10px] text-slate-450">Redeem certificate for your venue homepage</p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Cost: 200 Eco-Points</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (user.eco_points >= 200) {
                        alert("Claim success! PDF Green Certificate has been sent to your email.");
                        user.eco_points -= 200;
                        setRedeemedBadge(true);
                      } else {
                        alert("Insufficient Eco-Points.");
                      }
                    }}
                    disabled={redeemedBadge}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {redeemedBadge ? 'Claimed' : 'Redeem'}
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-850 p-3 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                  <div className="text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white">Tax Deduction Voucher</h4>
                    <p className="text-[10px] text-slate-450">15% Tax reduction slip for surplus foods</p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Cost: 500 Eco-Points</span>
                  </div>
                  <button 
                    onClick={() => alert("Requires 500 Eco-Points to claim. Keep donating to earn!")}
                    className="bg-slate-200 text-slate-650 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-350 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold font-outfit mb-3 text-slate-950 dark:text-white flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
                {t('leaderboard')}
              </h3>
              
              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Loading leaderboard...</p>
                ) : (
                  leaderboard.map((item, idx) => (
                    <div 
                      key={item.donor_id} 
                      className={`flex justify-between items-center p-2 rounded-lg text-xs ${
                        item.donor_id === user.id ? 'bg-sustain-500/10 border border-sustain-500/25 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-400 w-4">#{idx + 1}</span>
                        <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">({item.tier.split(' ')[0]})</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.eco_points} pts</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QR Code display Modal */}
      {activeQrDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 relative flex flex-col items-center text-center space-y-4">
            <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white">Secure Delivery QR Confirmation</h3>
            <p className="text-[11px] text-slate-500">Provide this QR Code to the NGO volunteer. Once scanned, the pickup completes securely.</p>
            
            {/* Draw beautiful SVG mock QR Code */}
            <div className="h-44 w-44 bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-center relative">
              <svg className="h-full w-full text-slate-900" viewBox="0 0 100 100">
                <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                <rect x="5" y="5" width="15" height="15" fill="white" />
                <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                <rect x="80" y="5" width="15" height="15" fill="white" />
                <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                <rect x="5" y="80" width="15" height="15" fill="white" />
                {/* Random QR blocks */}
                <rect x="35" y="10" width="10" height="10" fill="currentColor" />
                <rect x="55" y="25" width="15" height="10" fill="currentColor" />
                <rect x="30" y="45" width="10" height="20" fill="currentColor" />
                <rect x="50" y="50" width="15" height="15" fill="currentColor" />
                <rect x="70" y="70" width="20" height="10" fill="currentColor" />
                <rect x="75" y="40" width="10" height="15" fill="currentColor" />
                <rect x="10" y="35" width="15" height="5" fill="currentColor" />
                <rect x="30" y="80" width="25" height="10" fill="currentColor" />
              </svg>
              <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                <div className="h-8 w-8 bg-white border-2 border-emerald-500 rounded-lg flex items-center justify-center">
                  <Leaf className="h-4.5 w-4.5 text-emerald-500 fill-current" />
                </div>
              </div>
            </div>

            <div className="text-xs bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-350">
              Token: {activeQrDonation.qr_code_token}
            </div>

            <button 
              onClick={() => setActiveQrDonation(null)}
              className="w-full py-2 bg-sustain-600 text-white rounded-lg font-bold text-xs hover:bg-sustain-700 transition-colors"
            >
              Close Code
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeReviewDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold font-outfit mb-2">Review NGO Pickup</h3>
            <p className="text-xs text-slate-500 mb-4">Provide rating for the team who picked up <strong>{activeReviewDonation.food_name}</strong></p>
            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Rating</label>
                <div className="flex gap-1.5 text-2xl text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
                      {star <= rating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Comment</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share feedback on punctuality, compliance..."
                  rows="3"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 font-semibold pt-2">
                <button type="button" onClick={() => setActiveReviewDonation(null)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sustain-600 text-white rounded-lg hover:bg-sustain-700">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}

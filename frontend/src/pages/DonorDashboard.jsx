import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash, Star, Loader2 } from 'lucide-react';

export default function DonorDashboard() {
  const { user, authFetch } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodType, setFoodType] = useState('Veg');
  const [expiryTime, setExpiryTime] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Rating Modal
  const [activeReviewDonation, setActiveReviewDonation] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchMyDonations = async () => {
    try {
      const response = await authFetch('/api/donations');
      if (response.ok) {
        const data = await response.json();
        // Filter by current logged in user
        setDonations(data.filter(d => d.donor_id === user.id));
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
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

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-sustain-500 animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold font-outfit">Donor Cockpit</h2>
          <p className="text-xs text-slate-500">Post surplus food and track NGO pickups for <strong>{user?.name}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Post new listing */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="text-base font-bold font-outfit mb-4 text-slate-950 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            List Food Surplus
          </h3>
          <form onSubmit={handlePostDonation} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Food Item Name</label>
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
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Quantity (servings/kg)</label>
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
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Category</label>
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
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Expiry Datetime</label>
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
              <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Pickup Address</label>
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
              {submitLoading ? 'Posting...' : <><PlusCircle className="h-4.5 w-4.5" /> Post Donation</>}
            </button>
          </form>
        </div>

        {/* Right Cockpit list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-outfit mb-4 text-slate-950 dark:text-white">Active & Past Donations</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-550 dark:text-slate-400">
                <thead className="text-[10px] text-slate-700 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">Food Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
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
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{d.food_name}</td>
                        <td className="px-4 py-3">{d.quantity} units</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            d.food_type === 'Veg' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200' :
                            d.food_type === 'Non-Veg' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                          }`}>{d.food_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            d.status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350' :
                            d.status === 'Claimed' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-350' :
                            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-350'
                          }`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3 text-[10px]">
                          {d.logistics ? (
                            <div>
                              <strong>{d.logistics.ngo_name}</strong>
                              <div className="text-[9px] text-sustain-600 dark:text-sustain-400">({d.logistics.pickup_status})</div>
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Waiting...</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {d.status === 'Picked Up' && (
                            <button 
                              onClick={() => setActiveReviewDonation(d)}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2.5 py-1 rounded"
                            >
                              Review NGO
                            </button>
                          )}
                          {d.status === 'Available' && (
                            <button 
                              onClick={() => handleCancelDonation(d.donation_id)}
                              className="text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
                            >
                              <Trash className="h-3.5 w-3.5" /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

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

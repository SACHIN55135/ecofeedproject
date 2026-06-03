import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MapMock from '../components/MapMock';
import { Search, Filter, Compass, Loader2 } from 'lucide-react';

export default function NgoDashboard() {
  const { user, authFetch } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Active map coordinates reference
  const [selectedRoute, setSelectedRoute] = useState({
    from: "Shelter Hub",
    to: "Donor Facility"
  });

  const fetchAllDonations = async () => {
    try {
      const response = await fetch('/api/donations');
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDonations();
  }, []);

  const handleClaim = async (donationId, donorName, address) => {
    if (user.ngo_details?.verification_status !== 'Approved') {
      alert("Your NGO account status is pending verification by the admin.");
      return;
    }

    try {
      const res = await authFetch('/api/pickups/claim', {
        method: 'POST',
        body: JSON.stringify({ donation_id: donationId })
      });

      if (res.ok) {
        alert("Donation claimed! Coordinate pickup immediately.");
        setSelectedRoute({
          from: "NGO Head office",
          to: donorName
        });
        fetchAllDonations();
      }
    } catch (err) {
      alert(err.message || 'Claim failed');
    }
  };

  const handleUpdateStatus = async (requestId, nextStatus) => {
    try {
      const res = await authFetch(`/api/pickups/${requestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ pickup_status: nextStatus })
      });

      if (res.ok) {
        alert(`Status updated to ${nextStatus}`);
        fetchAllDonations();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter available donations
  const availableDonations = donations.filter(d => {
    const matchesSearch = d.food_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.pickup_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || d.food_type === filterType;
    return d.status === 'Available' && matchesSearch && matchesType;
  });

  // NGO's claimed donations (active/delivered)
  const myClaimedDonations = donations.filter(d => d.logistics && d.logistics.ngo_id === user.ngo_details?.ngo_id);

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
          <h2 className="text-2xl font-bold font-outfit">NGO Cockpit</h2>
          <p className="text-xs text-slate-500">Claim donations and track pickup logistics for <strong>{user?.ngo_details?.organization_name}</strong></p>
        </div>
        <div className="flex items-center">
          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
            user?.ngo_details?.verification_status === 'Approved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
          }`}>
            Profile Status: {user?.ngo_details?.verification_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left side: Available List & Active Dispatches */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* List of Available Donations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-base font-bold font-outfit text-slate-950 dark:text-white">Find Available Food Donations</h3>
              
              {/* Search filter row */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search location or food..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-xs pl-8 pr-2.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full"
                  />
                </div>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="All">All Categories</option>
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Bakery">Bakery / Bread</option>
                  <option value="Groceries">Raw Groceries</option>
                </select>
              </div>
            </div>

            {/* Grid listings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableDonations.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                  No available donations found matching the search criteria.
                </div>
              ) : (
                availableDonations.map((d) => (
                  <div key={d.donation_id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
                    <div className="h-32 relative">
                      <img src={d.image_url} alt={d.food_name} className="w-full h-full object-cover" />
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold ${
                        d.food_type === 'Veg' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'
                      }`}>{d.food_type}</span>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{d.food_name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Qty: {d.quantity} units • Exp: {new Date(d.expiry_time).toLocaleTimeString()}</p>
                        <p className="text-[10px] text-slate-550 mt-2">📍 {d.pickup_address}</p>
                      </div>
                      <button 
                        onClick={() => handleClaim(d.donation_id, d.donor_name, d.pickup_address)}
                        className="w-full py-2 bg-sustain-600 hover:bg-sustain-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Claim & Request Pickup
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active claimed pickups status update list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-outfit mb-4 text-slate-950 dark:text-white">Active Pickups Logistics Tracker</h3>
            <div className="space-y-4">
              {myClaimedDonations.filter(d => d.status !== 'Picked Up').length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active claimed pickup requests.</p>
              ) : (
                myClaimedDonations.filter(d => d.status !== 'Picked Up').map((d) => (
                  <div key={d.donation_id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/40">
                    <div className="text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{d.food_name}</h4>
                      <p className="text-[10px] text-slate-400">Donor: {d.donor_name} • Location: {d.pickup_address}</p>
                      <span className="inline-block mt-2 text-[9px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                        Logistics: {d.logistics.pickup_status}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {d.logistics.pickup_status === 'Requested' && (
                        <button 
                          onClick={() => handleUpdateStatus(d.logistics.request_id, 'In Transit')}
                          className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Start Dispatch
                        </button>
                      )}
                      {d.logistics.pickup_status === 'In Transit' && (
                        <button 
                          onClick={() => handleUpdateStatus(d.logistics.request_id, 'Delivered')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right side: Map navigation mock */}
        <div className="lg:col-span-1">
          <MapMock fromAddress={selectedRoute.from} toAddress={selectedRoute.to} />
        </div>

      </div>
    </section>
  );
}

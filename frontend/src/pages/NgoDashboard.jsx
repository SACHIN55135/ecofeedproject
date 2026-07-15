import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import MapMock from '../components/MapMock';
import { Search, Filter, Compass, Loader2, QrCode, ScanLine, Camera, AlertCircle, CheckCircle } from 'lucide-react';

export default function NgoDashboard() {
  const { user, authFetch } = useAuth();
  const { t } = useTranslation();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Active map coordinates reference
  const [selectedRoute, setSelectedRoute] = useState({
    from: "NGO Head Office",
    to: "Food Hub Facility"
  });

  // Scanner Simulator Modal State
  const [activeScannerRequest, setActiveScannerRequest] = useState(null);
  const [qrInputToken, setQrInputToken] = useState('');
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
  const [scanMessage, setScanMessage] = useState('');

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
        alert("Donation claimed! Route optimized for pickup.");
        setSelectedRoute({
          from: user.ngo_details?.address || "NGO Hub HQ",
          to: address || donorName
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

  const openQrScanner = (request) => {
    setActiveScannerRequest(request);
    setQrInputToken(request.donation_details?.qr_code_token || '');
    setScanStatus('idle');
    setScanMessage('');
  };

  const triggerQrVerification = async () => {
    if (!qrInputToken) {
      setScanStatus('error');
      setScanMessage('Please enter a secure QR code token.');
      return;
    }

    setScanStatus('scanning');
    setScanMessage('Connecting to camera feed & scanning code...');

    // Simulate camera scan delay
    setTimeout(async () => {
      try {
        const res = await authFetch(`/api/pickups/${activeScannerRequest.request_id}/confirm-qr`, {
          method: 'POST',
          body: JSON.stringify({ qr_code_token: qrInputToken })
        });

        const data = await res.json();
        if (res.ok) {
          setScanStatus('success');
          setScanMessage(`Verified! Secured +${data.eco_points_earned} Eco-Points for donor. Saved ${data.carbon_offset_kg} kg CO2.`);
          setTimeout(() => {
            setActiveScannerRequest(null);
            fetchAllDonations();
          }, 3000);
        } else {
          setScanStatus('error');
          setScanMessage(data.message || 'QR code token verification failed.');
        }
      } catch (err) {
        setScanStatus('error');
        setScanMessage(err.message || 'Network connection failed.');
      }
    }, 2000);
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
  const activePickupsList = myClaimedDonations.filter(d => d.status !== 'Picked Up');

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
          <h2 className="text-2xl font-bold font-outfit">{t('ngo_cockpit')}</h2>
          <p className="text-xs text-slate-500">Claim donations and track optimized route directions for <strong>{user?.ngo_details?.organization_name}</strong></p>
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
              <h3 className="text-sm font-bold font-outfit text-slate-950 dark:text-white">{t('find_food')}</h3>
              
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
                        <p className="text-[10px] text-slate-450 mt-0.5">Qty: {d.quantity} kg • Exp: {new Date(d.expiry_time).toLocaleTimeString()}</p>
                        <p className="text-[10px] text-slate-400 mt-2">📍 {d.pickup_address}</p>
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
            <h3 className="text-sm font-bold font-outfit mb-4 text-slate-950 dark:text-white">{t('active_pickups')}</h3>
            <div className="space-y-4">
              {activePickupsList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active claimed pickup requests.</p>
              ) : (
                activePickupsList.map((d) => (
                  <div 
                    key={d.donation_id} 
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:border-sky-500/50 transition-colors"
                    onClick={() => setSelectedRoute({
                      from: user.ngo_details?.address || "NGO Hub HQ",
                      to: d.pickup_address
                    })}
                  >
                    <div className="text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{d.food_name}</h4>
                      <p className="text-[10px] text-slate-450">Donor: {d.donor_name} • Location: {d.pickup_address}</p>
                      <div className="flex gap-2 items-center mt-2">
                        <span className="text-[9px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-350 px-2 py-0.5 rounded-full font-bold">
                          Status: {d.logistics.pickup_status}
                        </span>
                        {d.logistics.route_distance && (
                          <span className="text-[9px] text-slate-400 font-bold">
                            🛣️ {d.logistics.route_distance} miles ({d.logistics.route_duration} mins)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {d.logistics.pickup_status === 'Requested' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(d.logistics.request_id, 'In Transit'); }}
                          className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Start Dispatch
                        </button>
                      )}
                      {d.logistics.pickup_status === 'In Transit' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openQrScanner(d.logistics); }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <QrCode className="h-3 w-3" /> Secure QR Scan
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
          <MapMock fromAddress={selectedRoute.from} toAddress={selectedRoute.to} activePickups={activePickupsList} />
        </div>

      </div>

      {/* QR Scanner Simulator Modal */}
      {activeScannerRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 relative flex flex-col items-center space-y-4">
            <div className="w-full flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Camera className="h-5 w-5 text-sustain-500 animate-pulse" />
              <h3 className="text-sm font-bold font-outfit text-slate-900 dark:text-white">Secure Dispatch QR Scanner</h3>
            </div>
            
            <p className="text-[11px] text-slate-500 text-center">Verify the donor's secure pickup token to confirm handover and calculate environmental statistics.</p>

            {/* Video feed scanner simulator box */}
            <div className="h-44 w-full bg-slate-950 rounded-xl relative overflow-hidden flex items-center justify-center border-2 border-slate-800">
              {/* Scan viewport boxes */}
              <div className="h-32 w-32 border-2 border-emerald-500 rounded-lg relative flex items-center justify-center">
                
                {/* Laser scan lines */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-x-0 h-[1.5px] bg-emerald-400 shadow-md shadow-emerald-400/80 animate-bounce"></div>
                )}
                
                {scanStatus === 'success' ? (
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                ) : scanStatus === 'error' ? (
                  <AlertCircle className="h-10 w-10 text-rose-500" />
                ) : (
                  <ScanLine className="h-10 w-10 text-slate-600 animate-pulse" />
                )}
              </div>
              <div className="absolute bottom-2 text-[8px] uppercase tracking-wider text-slate-500 font-bold bg-slate-900/80 px-2 py-0.5 rounded">
                Camera Feed Simulation
              </div>
            </div>

            {/* Verification console */}
            <div className="w-full space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 text-left">Secure QR Token Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Token (e.g. QR-VEG-...)"
                    value={qrInputToken}
                    onChange={(e) => setQrInputToken(e.target.value)}
                    className="flex-grow p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                    disabled={scanStatus === 'scanning'}
                  />
                  <button
                    onClick={triggerQrVerification}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                    disabled={scanStatus === 'scanning' || scanStatus === 'success'}
                  >
                    Verify
                  </button>
                </div>
              </div>

              {scanMessage && (
                <div className={`p-2.5 rounded-lg border text-[10px] text-left leading-relaxed ${
                  scanStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                  scanStatus === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-450' :
                  'bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-400 animate-pulse'
                }`}>
                  {scanMessage}
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveScannerRequest(null)}
              className="w-full py-2 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              disabled={scanStatus === 'scanning'}
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Analytics from '../components/Analytics';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [pendingNgos, setPendingNgos] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      // 1. Fetch Pending NGOs
      const pendingRes = await authFetch('/api/admin/ngos/pending');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingNgos(pendingData);
      }

      // 2. Fetch All Donations
      const donationsRes = await fetch('/api/donations');
      if (donationsRes.ok) {
        const donationsData = await donationsRes.json();
        setAllDonations(donationsData);
      }
    } catch (err) {
      console.error('Failed to load admin logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyNgo = async (ngoId, status) => {
    try {
      const res = await authFetch(`/api/admin/ngos/${ngoId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ verification_status: status })
      });

      if (res.ok) {
        alert(`NGO registration successfully ${status.toLowerCase()}ed`);
        fetchAdminData();
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h2 className="text-2xl font-bold font-outfit">Platform Admin Console</h2>
        <p className="text-xs text-slate-500">Monitor ecosystem health, verify registrations, and audit donation logs.</p>
      </div>

      {/* Analytics widgets row */}
      <Analytics donationData={allDonations} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: NGO Approvals */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold font-outfit mb-4 text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Pending NGO Registrations
          </h3>
          <div className="space-y-4">
            {pendingNgos.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending registrations requiring review.</p>
            ) : (
              pendingNgos.map((ngo) => (
                <div key={ngo.ngo_id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-850 space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{ngo.organization_name}</h4>
                    <p className="text-[10px] text-slate-400">Representative: {ngo.user_name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">📍 {ngo.address}</p>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      onClick={() => handleVerifyNgo(ngo.ngo_id, 'Rejected')}
                      className="bg-rose-500/10 text-rose-600 hover:bg-rose-650 hover:text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleVerifyNgo(ngo.ngo_id, 'Approved')}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Global Audit Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold font-outfit mb-4 text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Global Donation Audit Logs
          </h3>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-550 dark:text-slate-400">
              <thead className="text-[10px] text-slate-700 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Food</th>
                  <th className="px-4 py-2">Donor</th>
                  <th className="px-4 py-2">NGO Partner</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {allDonations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">No donations reported in system.</td>
                  </tr>
                ) : (
                  allDonations.map((d) => (
                    <tr key={d.donation_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-bold">#{d.donation_id}</td>
                      <td className="px-4 py-2.5 text-slate-900 dark:text-white font-semibold">{d.food_name}</td>
                      <td className="px-4 py-2.5">{d.donor_name}</td>
                      <td className="px-4 py-2.5">{d.logistics ? d.logistics.ngo_name : <span className="text-slate-400 italic">None</span>}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          d.status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350' :
                          d.status === 'Claimed' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-350' :
                          'bg-slate-100 text-slate-850 dark:bg-slate-800'
                        }`}>{d.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </section>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Building2, UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('Donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [ngoName, setNgoName] = useState('');
  const [ngoAddress, setNgoAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = { role, name, email, phone, password };
    if (role === 'NGO') {
      payload.organization_name = ngoName;
      payload.address = ngoAddress;
    }

    try {
      const data = await register(payload);
      if (role === 'NGO') {
        alert("NGO registered successfully! Verification status: Pending approval by admin.");
        navigate('/login');
      } else {
        navigate('/donor-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/20 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-8 shadow-xl">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-bold font-outfit">Create Ecosystem Account</h2>
          <p className="text-xs text-slate-500">Join either as a food donor partner or a distribution NGO</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-750 dark:text-slate-300 mb-1.5">Register As</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setRole('Donor')}
                className={`p-3 rounded-lg border font-semibold flex items-center justify-center gap-2 ${role === 'Donor' ? 'bg-sustain-500/10 border-sustain-500 text-sustain-700 dark:text-sustain-400' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}
              >
                <UserCheck className="h-4 w-4" /> Food Donor
              </button>
              <button 
                type="button" 
                onClick={() => setRole('NGO')}
                className={`p-3 rounded-lg border font-semibold flex items-center justify-center gap-2 ${role === 'NGO' ? 'bg-sustain-500/10 border-sustain-500 text-sustain-700 dark:text-sustain-400' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}
              >
                <Building2 className="h-4 w-4" /> NGO / Charity
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-750 dark:text-slate-350 mb-1">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                required 
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-750 dark:text-slate-350 mb-1">Contact Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@domain.com"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-750 dark:text-slate-350 mb-1">Phone Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-xxxx"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                required 
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-750 dark:text-slate-350 mb-1">Secure Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                required 
              />
            </div>
          </div>

          {/* Conditional NGO details */}
          {role === 'NGO' && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
              <span className="font-semibold text-sustain-600 dark:text-sustain-400">NGO Verification Details</span>
              <div>
                <label className="block font-semibold text-slate-755 dark:text-slate-350 mb-1">Organization Legal Name</label>
                <input 
                  type="text" 
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  placeholder="e.g. Save Food Foundation"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                  required 
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-755 dark:text-slate-350 mb-1">Office Address</label>
                <input 
                  type="text" 
                  value={ngoAddress}
                  onChange={(e) => setNgoAddress(e.target.value)}
                  placeholder="Street, City, Zip Code"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                  required 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full font-semibold py-3 bg-sustain-600 hover:bg-sustain-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2 shadow"
          >
            <UserPlus className="h-4 w-4" /> {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-sustain-600 font-semibold hover:underline">Sign In</Link>
        </div>
      </div>
    </section>
  );
}

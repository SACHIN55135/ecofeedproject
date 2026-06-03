import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'Donor') navigate('/donor-dashboard');
      else if (user.role === 'NGO') navigate('/ngo-dashboard');
      else if (user.role === 'Admin') navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/20 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-xl">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-bold font-outfit">Welcome to EcoFeed</h2>
          <p className="text-xs text-slate-500">Sign in to coordinate food donations and pickups</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. donor@lapiazza.com"
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
              required 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full font-semibold py-3 bg-sustain-600 hover:bg-sustain-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-sustain-600 font-semibold hover:underline">Register now</Link>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X, Bell, Leaf, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Mock Notifications
  const notifications = [
    { id: 1, text: "New donation listed by La Piazza Restaurant", time: "10 mins ago" },
    { id: 2, text: "Hope Mission Charity registration is pending approval", time: "1 hr ago" }
  ];

  return (
    <nav className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 bg-gradient-to-tr from-sustain-500 to-lime-400 rounded-xl flex items-center justify-center shadow-lg shadow-sustain-500/20 mr-3">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-outfit tracking-tight bg-gradient-to-r from-sustain-600 to-sustain-800 dark:from-sustain-400 dark:to-lime-400 bg-clip-text text-transparent">
              EcoFeed
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <Link to="/" className={`transition-colors py-1 ${isActive('/') ? 'text-sustain-600 dark:text-sustain-400 border-b-2 border-sustain-500' : 'text-slate-600 dark:text-slate-350 hover:text-sustain-500'}`}>
              Home
            </Link>
            
            {user?.role === 'Donor' && (
              <Link to="/donor-dashboard" className={`transition-colors py-1 ${isActive('/donor-dashboard') ? 'text-sustain-600 dark:text-sustain-400 border-b-2 border-sustain-500' : 'text-slate-600 dark:text-slate-350 hover:text-sustain-500'}`}>
                Donor Dashboard
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link to="/ngo-dashboard" className={`transition-colors py-1 ${isActive('/ngo-dashboard') ? 'text-sustain-600 dark:text-sustain-400 border-b-2 border-sustain-500' : 'text-slate-600 dark:text-slate-350 hover:text-sustain-500'}`}>
                NGO Dashboard
              </Link>
            )}

            {user?.role === 'Admin' && (
              <Link to="/admin-dashboard" className={`transition-colors py-1 ${isActive('/admin-dashboard') ? 'text-sustain-600 dark:text-sustain-400 border-b-2 border-sustain-500' : 'text-slate-600 dark:text-slate-350 hover:text-sustain-500'}`}>
                Admin Console
              </Link>
            )}

            <a href="#about" className="text-slate-600 dark:text-slate-350 hover:text-sustain-500 py-1 transition-colors">About</a>
            <a href="#how-it-works" className="text-slate-600 dark:text-slate-350 hover:text-sustain-500 py-1 transition-colors">How It Works</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-350 hover:text-sustain-500 py-1 transition-colors">Contact</a>
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full"></span>
              </button>
              
              {/* Dropdown panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Notifications</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800/50 flex flex-col">
                        <p className="text-xs text-slate-600 dark:text-slate-300">{n.text}</p>
                        <span className="text-[10px] text-slate-450 mt-1">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Cockpit */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-sustain-600 dark:text-sustain-400 font-medium font-outfit uppercase tracking-wider">{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="hidden md:block bg-sustain-600 hover:bg-sustain-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-sustain-600/10"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">Home</Link>
          {user?.role === 'Donor' && <Link to="/donor-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">Donor Dashboard</Link>}
          {user?.role === 'NGO' && <Link to="/ngo-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">NGO Dashboard</Link>}
          {user?.role === 'Admin' && <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">Admin Console</Link>}
          
          <div className="border-t border-slate-100 dark:border-slate-850 my-2 pt-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-rose-500 font-bold">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="w-full bg-sustain-600 text-white font-semibold py-2 rounded-lg text-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

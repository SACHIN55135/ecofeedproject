import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { Sun, Moon, Menu, X, Bell, Leaf, LogOut, Check } from 'lucide-react';

export default function Navbar() {
  const { user, logout, authFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, setLanguage, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await authFetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (notifId) => {
    try {
      const response = await authFetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
              {t('home')}
            </Link>
            
            {user?.role === 'Donor' && (
              <Link to="/donor-dashboard" className={`transition-colors py-1 ${isActive('/donor-dashboard') ? 'text-sustain-600 dark:text-sustain-400 border-b-2 border-sustain-500' : 'text-slate-600 dark:text-slate-350 hover:text-sustain-500'}`}>
                {t('donor_cockpit')}
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link to="/ngo-dashboard" className={`transition-colors py-1 ${isActive('/ngo-dashboard') ? 'text-sustain-600 dark:text-sustain-400 border-b-2 border-sustain-500' : 'text-slate-600 dark:text-slate-350 hover:text-sustain-500'}`}>
                {t('ngo_cockpit')}
              </Link>
            )}

            {user?.role === 'Admin' && (
              <Link to="/admin-dashboard" className={`transition-colors py-1 ${isActive('/admin-dashboard') ? 'text-sustain-600 dark:text-sustain-400 border-b-2 border-sustain-500' : 'text-slate-600 dark:text-slate-350 hover:text-sustain-500'}`}>
                {t('admin_cockpit')}
              </Link>
            )}
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-semibold transition-all"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="hi">🇮🇳 HI</option>
            </select>

            {/* Eco Points Badge for Donors */}
            {user?.role === 'Donor' && (
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full text-xs font-bold font-outfit" title="My Reward Eco-Points">
                <Leaf className="h-3 w-3 fill-current text-emerald-500 animate-bounce" />
                <span>{user.eco_points || 0} {t('eco_points')}</span>
              </div>
            )}
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications Menu */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                
                {/* Dropdown panel */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                      <span className="font-semibold text-xs text-slate-750 dark:text-slate-205">{t('notifications')} ({unreadCount})</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-center text-xs text-slate-400">No new alerts.</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`px-4 py-2 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-start gap-1.5 ${
                              !n.is_read ? 'bg-sky-50/40 dark:bg-sky-950/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex-grow">
                              <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block">{new Date(n.created_at).toLocaleTimeString()}</span>
                            </div>
                            {!n.is_read && (
                              <button 
                                onClick={() => handleMarkRead(n.id)}
                                className="text-sky-600 dark:text-sky-400 hover:text-emerald-600 p-0.5"
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  title={t('logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="hidden md:block bg-sustain-600 hover:bg-sustain-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-sustain-600/10"
              >
                {t('login')}
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
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">{t('home')}</Link>
          {user?.role === 'Donor' && <Link to="/donor-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">{t('donor_cockpit')}</Link>}
          {user?.role === 'NGO' && <Link to="/ngo-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">{t('ngo_cockpit')}</Link>}
          {user?.role === 'Admin' && <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-250">{t('admin_cockpit')}</Link>}
          
          <div className="border-t border-slate-100 dark:border-slate-850 my-2 pt-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-rose-500 font-bold">
                  <LogOut className="h-3.5 w-3.5" /> {t('logout')}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="w-full bg-sustain-600 text-white font-semibold py-2 rounded-lg text-xs"
              >
                {t('login')}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

import { Clock, Moon, Menu, X, BookOpen, LogIn, Shield, Home } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeView?: 'prayer-times' | 'ramadan-tracker' | 'admin' | 'imams-corner';
  onViewChange?: (view: 'prayer-times' | 'ramadan-tracker') => void;
  currentPage?: string;
}

export default function Navigation({ activeView, onViewChange, currentPage }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, role } = useAuth();

  const handleViewChange = (view: 'prayer-times' | 'ramadan-tracker') => {
    if (onViewChange) {
      onViewChange(view);
      setIsMenuOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <>
      <div className="md:hidden flex justify-start mb-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all shadow-lg"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="font-semibold">Menu</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mb-4 bg-slate-800 rounded-lg shadow-xl max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden">
          <button
            onClick={() => handleNavigation('/home')}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all border-b border-slate-700 ${
              currentPage === 'home-page'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            onClick={() => onViewChange ? handleViewChange('prayer-times') : handleNavigation('/prayer-times')}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all border-b border-slate-700 ${
              activeView === 'prayer-times' || currentPage === 'prayer-times'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-5 h-5" />
            Prayer Times
          </button>
          <button
            onClick={() => onViewChange ? handleViewChange('ramadan-tracker') : handleNavigation('/ramadan-tracker')}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all border-b border-slate-700 ${
              activeView === 'ramadan-tracker' || currentPage === 'ramadan-tracker'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Moon className="w-5 h-5" />
            Ramadan Tracker
          </button>
          <button
            onClick={() => handleNavigation('/imams-corner')}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all border-b border-slate-700 ${
              currentPage === 'imams-corner'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Guidance from the Minbar
          </button>
          {user ? (
            <>
              {role.isAdmin && (
                <button
                  onClick={() => handleNavigation('/admin/dashboard')}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all border-b border-slate-700 ${
                    currentPage === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </button>
              )}
              {(role.canManagePosts || role.canManageVideos) && !role.isAdmin && (
                <button
                  onClick={() => handleNavigation('/')}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-base font-semibold transition-all border-b border-slate-700 ${
                    currentPage === 'home'
                      ? 'bg-green-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  My Dashboard
                </button>
              )}
            </>
          ) : null}
        </div>
      )}

      <div className="hidden md:flex gap-3 justify-center items-stretch flex-wrap">
        <button
          onClick={() => handleNavigation('/home')}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
            currentPage === 'home-page'
              ? 'bg-emerald-600 text-white shadow-lg scale-105'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Home className="w-5 h-5" />
          Home
        </button>
        <button
          onClick={() => onViewChange ? onViewChange('prayer-times') : handleNavigation('/prayer-times')}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
            activeView === 'prayer-times' || currentPage === 'prayer-times'
              ? 'bg-emerald-600 text-white shadow-lg scale-105'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Clock className="w-5 h-5" />
          Prayer Times
        </button>
        <button
          onClick={() => onViewChange ? onViewChange('ramadan-tracker') : handleNavigation('/ramadan-tracker')}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
            activeView === 'ramadan-tracker' || currentPage === 'ramadan-tracker'
              ? 'bg-emerald-600 text-white shadow-lg scale-105'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Moon className="w-5 h-5" />
          Ramadan Tracker
        </button>
        <button
          onClick={() => handleNavigation('/imams-corner')}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
            currentPage === 'imams-corner'
              ? 'bg-emerald-600 text-white shadow-lg scale-105'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Guidance from the Minbar
        </button>
        {user ? (
          <>
            {role.isAdmin && (
              <button
                onClick={() => handleNavigation('/admin/dashboard')}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
                  currentPage === 'admin'
                    ? 'bg-blue-700 text-white shadow-lg scale-105'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin
              </button>
            )}
            {(role.canManagePosts || role.canManageVideos) && !role.isAdmin && (
              <button
                onClick={() => handleNavigation('/')}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
                  currentPage === 'home'
                    ? 'bg-green-700 text-white shadow-lg scale-105'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Dashboard
              </button>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}

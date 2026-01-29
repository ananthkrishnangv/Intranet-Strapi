import React, { useState, useEffect } from 'react';
import { User, MenuItem } from '../types';
import { Menu, Bell, Search, User as UserIcon, LogOut, X, ChevronDown, LayoutDashboard, Calendar, Image, Info } from 'lucide-react';
import { db } from '../services/db';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onSearch: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeRoute, onNavigate, onSearch }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const loadMenu = async () => {
        const items = await db.getMenuItems();
        setMenuItems(items);
    };
    loadMenu();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const getIcon = (route: string) => {
      if (route.includes('home')) return <LayoutDashboard className="w-4 h-4 mr-2" />;
      if (route.includes('calendar')) return <Calendar className="w-4 h-4 mr-2" />;
      if (route.includes('gallery')) return <Image className="w-4 h-4 mr-2" />;
      return <Info className="w-4 h-4 mr-2" />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 leading-none text-lg">SERC</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Intranet</span>
                </div>
              </div>
              
              <nav className="hidden md:ml-8 md:flex md:space-x-6 items-center">
                {menuItems.filter(m => m.type !== 'external').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.route)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-full ${
                      activeRoute === item.route
                        ? 'border-blue-600 text-blue-700'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {getIcon(item.route)}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-64 pl-10 pr-3 py-1.5 border border-slate-200 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Search circulars, posts..."
                />
              </form>

              <button className="relative p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none">
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center space-x-2"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                      alt=""
                    />
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-xs font-bold text-slate-700 leading-none">{user.name}</span>
                        <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                    </div>
                    <ChevronDown className="hidden md:block h-3 w-3 text-slate-400" />
                  </button>
                </div>
                
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }}
                      className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Your Profile
                    </button>
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</a>
                    <button
                      onClick={onLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex items-center md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
            <div className="pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.route);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    activeRoute === item.route
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-sm text-slate-400">
                &copy; 2024 CSIR-Structural Engineering Research Centre. All rights reserved.
              </p>
            </div>
            <div className="flex justify-center space-x-6 md:order-2">
              <a href="#" className="text-slate-400 hover:text-slate-500 text-sm">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-slate-500 text-sm">Terms of Use</a>
              <a href="#" className="text-slate-400 hover:text-slate-500 text-sm">Contact Webmaster</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
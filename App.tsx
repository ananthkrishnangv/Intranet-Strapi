import React, { useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Home from './components/Home';
import CalendarView from './components/Calendar';
import Gallery from './components/Gallery';
import Profile from './components/Profile';
import { User } from './types';

const App: React.FC = () => {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  
  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentRoute('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoute('home');
  };

  const handleSearch = (query: string) => {
      setSearchQuery(query);
      setCurrentRoute('search');
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'home':
        return <Home onNavigate={setCurrentRoute} userRole={user?.role} />;
      case 'search':
        return <Home onNavigate={setCurrentRoute} userRole={user?.role} searchQuery={searchQuery} />;
      case 'calendar':
        return <CalendarView />;
      case 'gallery':
        return <Gallery />;
      case 'profile':
        return <Profile user={user!} onUpdate={setUser} />;
      case 'about':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">About CSIR-SERC</h1>
            <div className="prose max-w-none text-slate-700">
              <p className="mb-4">
                CSIR-Structural Engineering Research Centre (CSIR-SERC), Chennai, is a constituent laboratory of the Council of Scientific and Industrial Research (CSIR), Government of India.
              </p>
              <p>
                Established in 1965, CSIR-SERC has built up excellent facilities and expertise for the analysis, design and testing of structures and structural components. Services provided by CSIR-SERC include design consultancy and proof checking, structural integrity assessment, and life extension of plant structures.
              </p>
            </div>
          </div>
        );
      default:
        return <Home onNavigate={setCurrentRoute} userRole={user?.role} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeRoute={currentRoute}
      onNavigate={(route) => {
          setCurrentRoute(route);
          setSearchQuery(''); // Clear search on nav
      }}
      onSearch={handleSearch}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
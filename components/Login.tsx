import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Server, Globe, UserCog, Building2 } from 'lucide-react';
import { db } from '../services/db';

interface LoginProps {
  onLogin: (user: User) => void;
}

type LoginMode = 'employee' | 'admin';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<LoginMode>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'admin') {
        const user = await db.loginAdmin(username, password);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid admin credentials. Try admin / admin123');
        }
      } else {
        // Simulate AD Login
        setTimeout(() => {
          onLogin({
            id: '12345',
            name: 'Dr. Arun Sharma',
            email: 'arun.sharma@csir.res.in',
            role: 'employee',
            avatarUrl: 'https://picsum.photos/200'
          });
        }, 800);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      {/* Left Panel - Intranet Glimpse */}
      <div className="hidden lg:flex w-2/3 relative flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0">
           <img 
            src="https://picsum.photos/1920/1080?blur=4" 
            alt="Campus Background" 
            className="w-full h-full object-cover"
          /> 
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/80 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <Globe className="w-8 h-8 text-blue-300" />
            <span className="text-xl font-semibold tracking-wide uppercase">CSIR-SERC</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Empowering Research <br /> Through Collaboration.
          </h1>
          <p className="text-lg text-blue-100 max-w-xl">
            Welcome to the internal digital workspace. Access circulars, project management tools, and institutional resources securely.
          </p>
        </div>

        <div className="relative z-10 flex space-x-8 text-sm text-blue-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>System Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Secure Connection</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center items-center p-8 bg-white shadow-2xl z-20">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 transition-colors duration-300">
              {mode === 'admin' ? (
                <UserCog className="w-8 h-8 text-purple-600" />
              ) : (
                <Server className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {mode === 'admin' ? 'Admin Portal' : 'Employee Login'}
            </h2>
            <p className="mt-2 text-slate-500">
              {mode === 'admin' 
                ? 'Manage intranet content & settings' 
                : 'Sign in with your Active Directory ID'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('employee')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'employee' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Employee
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'admin' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={mode === 'admin' ? "Admin Username" : "AD Username (e.g. asharma)"}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
                mode === 'admin' 
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Signing in...' : (mode === 'admin' ? 'Login as Administrator' : 'Login with AD')}
            </button>
            
            <div className="flex items-center justify-between text-sm">
              <a href="#" className="font-medium text-slate-500 hover:text-slate-700">
                Helpdesk
              </a>
              {mode === 'employee' && (
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot Password?
                </a>
              )}
            </div>
          </form>
        </div>
        
        <div className="mt-16 text-center text-xs text-slate-400">
          <p>&copy; 2024 CSIR-SERC. Authorized access only.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

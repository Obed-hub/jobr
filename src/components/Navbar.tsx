import React from 'react';
import { auth, signInWithGoogle, logout } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Briefcase, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar({ activeView, setView }: { activeView: string, setView: (v: string) => void }) {
  const [user] = useAuthState(auth);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request cancelled by a newer request.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the login popup.');
      } else {
        console.error('Login error:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'find-job', label: 'Find Job' },
    { id: 'matchmaker', label: 'Matchmaker' },
    { id: 'profile', label: 'Profile' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'apps', label: 'Apps' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">_HIRE.io</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "text-sm font-medium transition-colors",
                  activeView === item.id ? "text-black" : "text-gray-400 hover:text-black"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-gray-200" />
                  <span className="hidden sm:inline text-sm font-medium">{user.displayName}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-black transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={cn(
                  "flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95",
                  isLoggingIn && "opacity-50 cursor-not-allowed"
                )}
              >
                <LogIn className="w-4 h-4" />
                {isLoggingIn ? 'Joining...' : 'Join Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { JobSearch } from './components/JobSearch';
import { Matchmaker } from './components/Matchmaker';
import { Profile } from './components/Profile';
import { JobAlerts } from './components/JobAlerts';
import { Applications } from './components/Applications';
import { Onboarding } from './components/Onboarding';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

const StatsSection = () => (
  <section className="py-12 border-y border-gray-100 bg-gray-50/30">
    <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 md:gap-24">
      <div className="text-center">
        <p className="text-4xl font-bold">12k+</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Remote Jobs</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold">850+</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Companies</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold">98%</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Match Rate</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold">24/7</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">AI Support</p>
      </div>
    </div>
  </section>
);

export default function App() {
  const [user] = useAuthState(auth);
  const [view, setView] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      checkOnboarding();
    }
  }, [user]);

  const checkOnboarding = async () => {
    if (!user) return;
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (!docSnap.exists()) {
      setShowOnboarding(true);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <>
            <Hero />
            <StatsSection />
            <div className="max-w-7xl mx-auto py-20 px-4 space-y-32">
              <JobSearch />
              <Matchmaker />
            </div>
          </>
        );
      case 'find-job':
        return <JobSearch />;
      case 'matchmaker':
        return <Matchmaker />;
      case 'profile':
        return <Profile />;
      case 'alerts':
        return <JobAlerts />;
      case 'apps':
        return <Applications />;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-amber-200 selection:text-black">
      {showOnboarding && <Onboarding onComplete={() => {
        setShowOnboarding(false);
        setView('home');
      }} />}
      <Navbar activeView={view} setView={setView} />
      <main className="pt-16">
        {renderView()}
        
        {/* Footer */}
        <footer className="py-20 px-4 border-t border-gray-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                </div>
                <span className="text-xl font-bold tracking-tight">_HIRE.io</span>
              </div>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                The world's leading remote job finder and AI-powered matchmaker. We help you find your dream job across the globe.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-black transition-colors">Find Jobs</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Matchmaker</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Companies</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2026 _HIRE.io. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-black transition-colors">Twitter</a>
              <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-black transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

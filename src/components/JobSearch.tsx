import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Sparkles } from 'lucide-react';
import { Job } from '../types';
import { searchAllJobs } from '../services/jobService';
import { JobCard } from './JobCard';
import { motion, AnimatePresence } from 'motion/react';

export function JobSearch() {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    const results = await searchAllJobs(query);
    setJobs(results);
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true;
    return job.platform.toLowerCase() === activeTab.toLowerCase();
  });

  const platforms = ['All', 'Remotive', 'Arbeitnow', 'RemoteOK'];

  return (
    <section id="find-job" className="py-20 px-4 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Featured Jobs Category</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Browse through thousands of remote opportunities from top platforms like Remotive, Arbeitnow, and RemoteOK.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title, company, or skills..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
            >
              Search
            </button>
          </form>

          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setActiveTab(p.toLowerCase())}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === p.toLowerCase() 
                    ? 'bg-amber-200 text-black shadow-sm' 
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-teal-800 animate-spin" />
            <p className="text-gray-500 font-medium animate-pulse">Fetching latest remote jobs...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-400 font-medium">No jobs found matching your criteria.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

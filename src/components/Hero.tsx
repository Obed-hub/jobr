import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section id="home" className="pt-32 pb-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900">
            Find Your First <br />
            <span className="relative inline-block">
              Remote Job
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex gap-1">
                <div className="w-6 h-6 rounded-full bg-teal-800" />
                <div className="w-6 h-6 rounded-full bg-amber-200" />
              </div>
            </span> <br />
            In _Hire.io
          </h1>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/find-job')}
              className="bg-amber-200 text-black px-8 py-4 rounded-xl font-semibold hover:bg-amber-300 transition-all active:scale-95"
            >
              Find Jobs
            </button>
            <button 
              onClick={() => navigate('/matchmaker')}
              className="border border-gray-200 text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all active:scale-95"
            >
              AI Matchmaker
            </button>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Trusted By:</p>
            <div className="flex flex-wrap gap-8 opacity-50 grayscale">
              <span className="text-xl font-bold">amara</span>
              <span className="text-xl font-bold">aven.</span>
              <span className="text-xl font-bold">{'{ }'}CodeLab</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Main Card */}
          <div className="relative z-10 bg-amber-200 rounded-[2.5rem] p-8 aspect-[4/5] max-w-md mx-auto overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
              alt="Professional" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Nehal Hamim</h3>
                  <p className="text-xs text-gray-500">UIUX Designer</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold text-black">5.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-4 z-20 bg-teal-900 text-white p-6 rounded-3xl shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-2xl font-bold">1.7M</span>
            </div>
            <p className="text-[10px] text-teal-100 uppercase tracking-wider font-medium">Active Freelancers</p>
            <div className="mt-4 flex justify-end">
              <ArrowUpRight className="w-5 h-5 text-teal-300" />
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-3xl shadow-xl w-64"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-800" />
              </div>
              <div>
                <h4 className="font-bold text-sm">UIUX Designer</h4>
                <p className="text-[10px] text-gray-400">Blone.org</p>
              </div>
            </div>
            <div className="h-12 w-full bg-gray-50 rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 flex items-end px-2 pb-2 gap-1">
                {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                  <div key={i} className="flex-1 bg-amber-200 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

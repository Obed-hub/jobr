import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, Job } from '../types';
import { matchJobsWithProfile } from '../services/geminiService';
import { searchAllJobs } from '../services/jobService';
import { JobCard } from './JobCard';
import { motion, AnimatePresence } from 'motion/react';

export function Matchmaker() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<{ job: Job; score: number; reasoning: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      setProfile(data);
      setSkills(data.skills?.join(', ') || '');
      setBio(data.bio || '');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const profileData: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      skills: skillsArray,
      bio,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: serverTimestamp(),
        createdAt: profile?.createdAt ? profile.createdAt : serverTimestamp()
      }, { merge: true });
      setProfile(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleMatch = async (useResume = false) => {
    if (!user) return;
    if (!useResume && !skills) return;
    setMatching(true);
    
    try {
      // 1. Fetch latest jobs
      const jobs = await searchAllJobs('');
      
      // 2. Match with Gemini
      const matches = await matchJobsWithProfile(jobs, {
        uid: user.uid,
        email: user.email || '',
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        bio,
        resumeUrl: profile?.resumeUrl,
        resumeName: profile?.resumeName,
        createdAt: '',
        updatedAt: ''
      });

      // 3. Map results
      const results = matches.map(m => ({
        job: jobs.find(j => j.id === m.jobId)!,
        score: m.score,
        reasoning: m.reasoning
      })).filter(r => r.job);

      setMatchedJobs(results);
    } catch (error) {
      console.error('Matchmaking error:', error);
    } finally {
      setMatching(false);
    }
  };

  if (!user) {
    return (
      <section id="matchmaker" className="py-20 px-4 bg-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="w-20 h-20 bg-teal-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <BrainCircuit className="w-10 h-10 text-teal-300" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight">AI Matchmaker</h2>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            Sign in to unlock our AI-powered matchmaking. We'll analyze your skills and preferences to find the perfect remote opportunities for you.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-amber-200 text-black px-8 py-4 rounded-2xl font-bold hover:bg-amber-300 transition-all active:scale-95"
          >
            Get Started Now
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="matchmaker" className="py-20 px-4 bg-teal-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-800 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-teal-300" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Matchmaker</h2>
            </div>
            
            <p className="text-teal-100 text-lg">
              Tell us about your skills and experience. Our AI will scan thousands of remote jobs to find your perfect fit.
            </p>

            <div className="bg-teal-800/50 backdrop-blur-sm border border-teal-700 rounded-[2.5rem] p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-teal-300">Your Skills</label>
                <textarea 
                  placeholder="e.g. React, TypeScript, Node.js, UI/UX Design..."
                  className="w-full bg-teal-900/50 border border-teal-700 rounded-2xl p-4 text-white placeholder:text-teal-600 focus:ring-2 focus:ring-teal-400 outline-none transition-all resize-none h-32"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-teal-300">Short Bio / Experience</label>
                <textarea 
                  placeholder="Tell us a bit about what you're looking for..."
                  className="w-full bg-teal-900/50 border border-teal-700 rounded-2xl p-4 text-white placeholder:text-teal-600 focus:ring-2 focus:ring-teal-400 outline-none transition-all resize-none h-32"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 bg-teal-700 text-white px-6 py-4 rounded-2xl font-bold hover:bg-teal-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Profile'}
                  </button>
                  <button 
                    onClick={() => handleMatch(false)}
                    disabled={matching || !skills}
                    className="flex-[2] bg-amber-200 text-black px-6 py-4 rounded-2xl font-bold hover:bg-amber-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {matching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        AI Matching...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-5 h-5" />
                        Find Matches
                      </>
                    )}
                  </button>
                </div>
                
                {profile?.resumeUrl && (
                  <button 
                    onClick={() => handleMatch(true)}
                    disabled={matching}
                    className="w-full bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    Match with Resume: {profile.resumeName}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {matching ? (
                <motion.div 
                  key="matching"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-teal-800/30 rounded-[3rem] aspect-square flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-teal-700"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-teal-400/20 rounded-full animate-ping absolute inset-0" />
                    <div className="w-24 h-24 bg-teal-800 rounded-full flex items-center justify-center relative z-10">
                      <BrainCircuit className="w-10 h-10 text-teal-300" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Analyzing Opportunities</h3>
                  <p className="text-teal-200 leading-relaxed">
                    Gemini is currently scanning Remotive, Arbeitnow, and RemoteOK to find jobs that match your unique skill set.
                  </p>
                </motion.div>
              ) : matchedJobs.length > 0 ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar"
                >
                  {matchedJobs.map((match, i) => (
                    <motion.div
                      key={match.job.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <JobCard 
                        job={match.job} 
                        matchScore={match.score} 
                        matchReasoning={match.reasoning}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-teal-800/30 rounded-[3rem] aspect-square flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-teal-700"
                >
                  <div className="w-20 h-20 bg-teal-800 rounded-3xl flex items-center justify-center mb-8">
                    <Sparkles className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">No Matches Yet</h3>
                  <p className="text-teal-200 leading-relaxed">
                    Enter your skills and click "Find Matches" to see AI-powered job recommendations.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

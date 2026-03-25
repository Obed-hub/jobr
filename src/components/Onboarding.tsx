import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, storage } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Upload, CheckCircle2, ArrowRight, Sparkles, Briefcase, User } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  
  // Form states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [jobTitles, setJobTitles] = useState('');

  const user = auth.currentUser;

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setResumeUrl(url);
      setResumeName(file.name);
      setStep(2);
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profileData: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        desiredJobTitles: jobTitles.split(',').map(s => s.trim()).filter(Boolean),
        resumeUrl,
        resumeName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-200 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome to _HIRE.io</h1>
          <p className="text-gray-500">Let's get your profile set up to find your perfect remote job.</p>
        </div>

        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-black"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  {uploading ? <Loader2 className="w-10 h-10 animate-spin text-gray-400" /> : <Upload className="w-10 h-10 text-gray-400" />}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Upload your Resume</h3>
                  <p className="text-gray-500 text-sm">We'll use this to match you with relevant jobs.</p>
                </div>
                <label className="inline-block bg-black text-white px-8 py-4 rounded-2xl font-bold cursor-pointer hover:bg-gray-800 transition-all active:scale-95">
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploading} />
                </label>
                <button 
                  onClick={() => setStep(2)}
                  className="block w-full text-gray-400 text-sm font-medium hover:text-black transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <User className="w-3 h-3" /> Short Bio
                  </label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your professional background..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 h-32 outline-none focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Skills (comma separated)
                  </label>
                  <input 
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript, Node.js..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                >
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Desired Job Titles
                  </label>
                  <input 
                    type="text"
                    value={jobTitles}
                    onChange={(e) => setJobTitles(e.target.value)}
                    placeholder="Senior Frontend Engineer, Product Designer..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold">Almost there!</h4>
                    <p className="text-sm text-amber-800">We'll use this information to personalize your job feed and match you with the best remote opportunities.</p>
                  </div>
                </div>
                <button 
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Complete Setup <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

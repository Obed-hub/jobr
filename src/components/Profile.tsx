import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserProfile, WorkExperience } from '../types';
import { Loader2, Plus, Trash2, FileText, Upload, Save, Briefcase, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Profile() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitles, setJobTitles] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      if (profileSnap.exists()) {
        const data = profileSnap.data() as UserProfile;
        setProfile(data);
        setSkills(data.skills?.join(', ') || '');
        setBio(data.bio || '');
        setJobTitles(data.desiredJobTitles?.join(', ') || '');
      }

      const expSnap = await getDocs(collection(db, 'users', user.uid, 'experience'));
      setExperiences(expSnap.docs.map(d => ({ id: d.id, ...d.data() } as WorkExperience)));
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profileData: any = {
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        desiredJobTitles: jobTitles.split(',').map(s => s.trim()).filter(Boolean),
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(doc(db, 'users', user.uid), profileData);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Error saving profile: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Basic size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please upload a file smaller than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', user.uid);

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const { url, name } = await response.json();
      
      await updateDoc(doc(db, 'users', user.uid), {
        resumeUrl: url,
        resumeName: name,
        updatedAt: serverTimestamp()
      });
      
      setProfile(prev => prev ? { ...prev, resumeUrl: url, resumeName: name } : null);
      alert('Resume uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      alert(`Error uploading resume: ${error.message || 'Unknown error'}.`);
    } finally {
      setUploading(false);
    }
  };

  const addExperience = async () => {
    if (!user) return;
    const newExp = {
      company: 'New Company',
      position: 'New Position',
      startDate: new Date().toISOString().split('T')[0],
      current: true,
      description: ''
    };
    const docRef = await addDoc(collection(db, 'users', user.uid, 'experience'), newExp);
    setExperiences([...experiences, { id: docRef.id, ...newExp }]);
  };

  const deleteExperience = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'experience', id));
    setExperiences(experiences.filter(e => e.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">My Profile</h2>
          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Skills (comma separated)</label>
            <textarea 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 h-32 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
              placeholder="React, TypeScript, Node.js..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Desired Job Titles</label>
            <textarea 
              value={jobTitles}
              onChange={(e) => setJobTitles(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 h-32 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
              placeholder="Senior Frontend Engineer, Product Manager..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bio</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 h-32 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <h3 className="font-bold">Resume</h3>
              <p className="text-sm text-amber-700">{profile?.resumeName || 'No resume uploaded yet'}</p>
            </div>
          </div>
          <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {profile?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
          </label>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Work Experience
          </h2>
          <button 
            onClick={addExperience}
            className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {experiences.map((exp) => (
              <motion.div 
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative group"
              >
                <button 
                  onClick={() => deleteExperience(exp.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid md:grid-cols-2 gap-4">
                  <input 
                    className="font-bold text-lg outline-none border-b border-transparent focus:border-amber-200" 
                    defaultValue={exp.company}
                    onBlur={(e) => updateDoc(doc(db, 'users', user!.uid, 'experience', exp.id), { company: e.target.value })}
                  />
                  <input 
                    className="text-gray-500 outline-none border-b border-transparent focus:border-amber-200" 
                    defaultValue={exp.position}
                    onBlur={(e) => updateDoc(doc(db, 'users', user!.uid, 'experience', exp.id), { position: e.target.value })}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

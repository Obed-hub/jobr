import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { JobAlert } from '../types';
import { Bell, Plus, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function JobAlerts() {
  const [user] = useAuthState(auth);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeywords, setNewKeywords] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newJobType, setNewJobType] = useState('Full-time');

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'alerts'));
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as JobAlert)));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAlert = async () => {
    if (!user || !newKeywords) return;
    const alertData = {
      keywords: newKeywords,
      location: newLocation,
      jobType: newJobType,
      active: true,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'users', user.uid, 'alerts'), alertData);
    setAlerts([...alerts, { id: docRef.id, ...alertData }]);
    setNewKeywords('');
    setNewLocation('');
  };

  const toggleAlert = async (alert: JobAlert) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'alerts', alert.id), { active: !alert.active });
    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, active: !a.active } : a));
  };

  const deleteAlert = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'alerts', id));
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-amber-800" />
          </div>
          <h2 className="text-3xl font-bold">Job Alerts</h2>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <h3 className="font-bold text-lg">Create New Alert</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Keywords</label>
              <input 
                type="text" 
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Location</label>
              <input 
                type="text" 
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Remote"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Job Type</label>
              <select 
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Freelance</option>
              </select>
            </div>
          </div>
          <button 
            onClick={addAlert}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.active ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-400'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{alert.keywords}</h4>
                    <p className="text-xs text-gray-500">{alert.location || 'Anywhere'} • {alert.jobType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleAlert(alert)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${alert.active ? 'bg-teal-50 text-teal-700' : 'bg-gray-50 text-gray-400'}`}
                  >
                    {alert.active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {alert.active ? 'Active' : 'Paused'}
                  </button>
                  <button 
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Application } from '../types';
import { ClipboardList, Plus, Trash2, Loader2, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

export function Applications() {
  const [user] = useAuthState(auth);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    if (user) {
      fetchApps();
    }
  }, [user]);

  const fetchApps = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'applications'));
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addApp = async () => {
    if (!user || !newTitle || !newCompany) return;
    const appData = {
      jobId: `manual-${Date.now()}`,
      jobTitle: newTitle,
      company: newCompany,
      status: 'applied' as const,
      appliedAt: new Date().toISOString(),
      notes: ''
    };
    const docRef = await addDoc(collection(db, 'users', user.uid, 'applications'), appData);
    setApps([...apps, { id: docRef.id, ...appData }]);
    setNewTitle('');
    setNewCompany('');
    setShowAdd(false);
  };

  const updateStatus = async (id: string, status: Application['status']) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'applications', id), { status });
    setApps(apps.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteApp = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'applications', id));
    setApps(apps.filter(a => a.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-teal-800" />
            </div>
            <h2 className="text-3xl font-bold">Applications</h2>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="bg-black text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 mb-8">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Job Title</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Company</label>
                    <input 
                      type="text" 
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                    />
                  </div>
                </div>
                <button 
                  onClick={addApp}
                  className="w-full bg-teal-800 text-white py-4 rounded-2xl font-bold hover:bg-teal-900 transition-all active:scale-95"
                >
                  Save Application
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6">
          <AnimatePresence>
            {apps.map((app) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    app.status === 'applied' ? 'bg-gray-100 text-gray-500' :
                    app.status === 'interviewing' ? 'bg-amber-100 text-amber-700' :
                    app.status === 'offered' ? 'bg-teal-100 text-teal-800' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {app.status === 'applied' ? <Clock className="w-6 h-6" /> :
                     app.status === 'interviewing' ? <MessageSquare className="w-6 h-6" /> :
                     app.status === 'offered' ? <CheckCircle2 className="w-6 h-6" /> :
                     <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{app.jobTitle}</h4>
                    <p className="text-sm text-gray-500 font-medium">{app.company} • Applied {formatDistanceToNow(new Date(app.appliedAt))} ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select 
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as Application['status'])}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button 
                    onClick={() => deleteApp(app.id)}
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

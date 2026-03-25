import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Job } from '../types';
import { searchAllJobs } from '../services/jobService';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  ExternalLink, 
  Loader2, 
  Share2, 
  Bookmark,
  Building2,
  Globe,
  Calendar,
  Share
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { ShareModal } from './ShareModal';

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const allJobs = await searchAllJobs('');
        const foundJob = allJobs.find(j => j.id === id);
        setJob(foundJob || null);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-teal-800 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
          <Briefcase className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
        <p className="text-gray-500 text-center max-w-md">
          The job you're looking for might have been removed or is no longer available.
        </p>
        <button 
          onClick={() => navigate('/find-job')}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-12"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </button>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-8 md:p-12 border-b border-gray-100 bg-gray-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex gap-6">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center overflow-hidden border border-gray-100 p-3 shadow-sm shrink-0">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-3xl font-bold text-gray-300">{job.company[0]}</span>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="font-semibold">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Globe className="w-4 h-4" />
                    <span>{job.platform}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-black hover:border-black transition-all">
                <Bookmark className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-black hover:border-black transition-all"
              >
                <Share2 className="w-6 h-6" />
              </button>
              <a 
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
              >
                Apply Now
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</p>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span className="font-medium">{job.location || 'Remote'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Salary Range</p>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span className="font-medium">{job.salary || 'Competitive'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Job Type</p>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-teal-600" />
                <span className="font-medium">{job.type || 'Full-time'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date Posted</p>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span className="font-medium">{formatDistanceToNow(new Date(job.publishedAt))} ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold">Job Description</h2>
              <div className="prose prose-teal max-w-none text-gray-600 leading-relaxed">
                {job.description ? (
                  <div className="markdown-body">
                    <Markdown>{job.description}</Markdown>
                  </div>
                ) : (
                  <p>No detailed description provided by the platform. Please visit the original posting for more information.</p>
                )}
              </div>
            </section>

            {job.tags && job.tags.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold">Required Skills & Tags</h2>
                <div className="flex flex-wrap gap-3">
                  {job.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-6">
              <h3 className="font-bold text-lg">About the Company</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  {job.company} is actively hiring for {job.title} and other remote positions on {job.platform}.
                </p>
                <div className="pt-4">
                  <a 
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 font-bold text-sm hover:underline flex items-center gap-2"
                  >
                    View Company Profile
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 space-y-6">
              <h3 className="font-bold text-lg text-amber-900">Safety Tip</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                Always research companies before applying. Never share sensitive personal information or pay for job applications.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
        title={`Check out this job: ${job.title} at ${job.company}`}
      />
    </motion.div>
  );
}

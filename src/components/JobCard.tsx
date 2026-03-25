import React, { useState } from 'react';
import { Job } from '../types';
import { ExternalLink, MapPin, DollarSign, Clock, Bookmark, Share2, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { ShareModal } from './ShareModal';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSave?: (job: Job) => void;
  matchScore?: number;
  matchReasoning?: string;
}

export function JobCard({ job, isSaved, onSave, matchScore, matchReasoning }: JobCardProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
      {matchScore && (
        <div className="absolute -top-3 -right-3 z-10 bg-teal-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          {matchScore}% Match
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 p-2">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-2xl font-bold text-gray-300">{job.company[0]}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg group-hover:text-teal-900 transition-colors">{job.title}</h3>
            <p className="text-sm text-gray-500 font-medium">{job.company}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black rounded-xl transition-all"
            title="Share Job"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onSave?.(job)}
            className={cn(
              "p-2 rounded-xl transition-all",
              isSaved ? "bg-amber-100 text-amber-600" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black"
            )}
            title={isSaved ? "Unsave Job" : "Save Job"}
          >
            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{job.location || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="truncate">{job.salary || 'Competitive'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{formatDistanceToNow(new Date(job.publishedAt))} ago</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          </div>
          <span>{job.platform}</span>
        </div>
      </div>

      {matchReasoning && (
        <div className="mb-6 p-4 bg-teal-50 rounded-2xl border border-teal-100">
          <p className="text-xs text-teal-900 leading-relaxed italic">
            " {matchReasoning} "
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {job.tags?.slice(0, 3).map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <Link 
          to={`/job/${job.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-200 text-black rounded-2xl font-bold text-sm hover:bg-amber-300 transition-all active:scale-95"
        >
          More Detail
          <Info className="w-4 h-4" />
        </Link>
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95"
          title="Apply on Platform"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`${window.location.origin}/job/${job.id}`}
        title={`Check out this job: ${job.title} at ${job.company}`}
      />
    </div>
  );
}

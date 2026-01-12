import { useEffect, useState } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import { Check, X, MapPin, DollarSign, Loader2, Sparkles, Code2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  workMode: string;
  requiredSkills: string[];
}

export default function Jobs() {
  const [job, setJob] = useState<Job | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [matchReasons, setMatchReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNextJob = async () => {
    setLoading(true);
    try {
      const res = await client.get('/jobs/next');
      if (res.data.data) {
        setJob(res.data.data.job);
        setMatchScore(res.data.data.matchScore);
        setMatchReasons(res.data.data.reasons || []); 
      } else {
        setJob(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextJob();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!job) return;
    try {
      if (direction === 'right') {
        await client.post(`/jobs/${job.id}/swipe-right`);
      } else {
        await client.post(`/jobs/${job.id}/swipe-left`);
      }
      fetchNextJob();
    } catch (err) {
      console.error('Swipe failed', err);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await client.post('/jobs/recover');
      await fetchNextJob();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!job) return;
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job]);

  if (loading && !job) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      {error && (
        <div className="mx-auto mt-4 max-w-lg rounded-lg bg-red-500/10 p-4 text-center text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <main className="flex flex-col items-center justify-center p-4 pt-4">
        {!job ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">No more jobs! 🎉</h2>
            <p className="mt-2 text-slate-400">You've viewed all available jobs for now.</p>
            <button 
              onClick={handleReset}
              className="mt-6 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
            >
              Revisit Rejected Jobs ↺
            </button>
          </div>
        ) : (
          <div className="w-full max-w-lg rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700">
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                <p className="text-lg text-blue-400">{job.company}</p>
              </div>
              <div className={`flex flex-col items-end`}>
                <div className={`rounded-full px-3 py-1 text-xs font-bold ${
                  matchScore > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {matchScore}% Match
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {matchReasons.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-500/10 p-3 border border-blue-500/20">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-blue-400">
                  <Sparkles className="h-3 w-3" /> AI Insights
                </div>
                <ul className="space-y-1">
                  {matchReasons.map((reason, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Basic Info Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-md bg-slate-700 px-2 py-1 text-sm text-slate-300">
                <MapPin className="h-3 w-3" /> {job.location} ({job.workMode})
              </span>
              <span className="flex items-center gap-1 rounded-md bg-slate-700 px-2 py-1 text-sm text-slate-300">
                <DollarSign className="h-3 w-3" /> ${job.salaryMin / 1000}k - ${job.salaryMax / 1000}k
              </span>
            </div>

            {/* ✅ NEW: Skills Tags */}
            <div className="mt-3">
               <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Code2 className="h-3 w-3" /> Required Skills
               </div>
               <div className="flex flex-wrap gap-2">
                 {job.requiredSkills.map((skill, index) => (
                   <span key={index} className="rounded-full bg-slate-700 border border-slate-600 px-3 py-1 text-xs font-medium text-blue-300">
                     {skill}
                   </span>
                 ))}
               </div>
            </div>

            <div className="mt-6 h-40 overflow-y-auto text-slate-300 scrollbar-hide">
              {job.description}
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              Use <span className="font-bold text-slate-400">← Left</span> to Pass, <span className="font-bold text-slate-400">Right →</span> to Apply
            </div>

            <div className="mt-4 flex items-center justify-center gap-6">
              <button
                onClick={() => handleSwipe('left')}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border-2 border-red-500 text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                <X className="h-8 w-8" />
              </button>
              
              <button
                onClick={() => handleSwipe('right')}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border-2 border-green-500 text-green-500 transition hover:bg-green-500 hover:text-white"
              >
                <Check className="h-8 w-8" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
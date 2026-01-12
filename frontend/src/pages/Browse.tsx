import { useEffect, useState } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import { Search, MapPin, Building2, DollarSign, Briefcase, Loader2, Check } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  postedDate: string;
  requiredSkills: string[]; // ✅ Added this to Interface
  hasApplied?: boolean;
}

export default function Browse() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  
  // Search States
  const [query, setQuery] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [query, workMode, location]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await client.get('/jobs', {
        params: {
          q: query,
          workMode: workMode || undefined,
          location: location || undefined,
        }
      });
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      await client.post(`/jobs/${jobId}/swipe-right`);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, hasApplied: true } : job
        )
      );
    } catch (err) {
      console.error("Failed to apply", err);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="mx-auto max-w-6xl p-6">
        {/* Search Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl bg-slate-800 p-4 shadow-lg border border-slate-700 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs (e.g. React, Google)..."
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-blue-500 focus:outline-none"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
            >
              <option value="">Any Mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="City..."
                className="w-40 rounded-lg bg-slate-900 border border-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-slate-400 py-20">No jobs found matching your filters.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-col rounded-xl bg-slate-800 p-5 shadow-md border border-slate-700 transition hover:border-blue-500/50 hover:bg-slate-800/80">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white line-clamp-1">{job.title}</h3>
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1 rounded bg-slate-700 px-2 py-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-slate-700 px-2 py-1">
                    <Briefcase className="h-3 w-3" /> {job.workMode}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-slate-700 px-2 py-1 text-green-400">
                    <DollarSign className="h-3 w-3" /> {job.salaryMin/1000}k-{job.salaryMax/1000}k
                  </span>
                </div>

                {/* ✅ NEW: Skills Display (First 3 only to keep it clean) */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                    {job.requiredSkills?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="rounded border border-slate-600 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                            {skill}
                        </span>
                    ))}
                    {job.requiredSkills?.length > 3 && (
                        <span className="rounded border border-slate-600 px-2 py-0.5 text-[10px] text-slate-500">
                            +{job.requiredSkills.length - 3}
                        </span>
                    )}
                </div>

                <p className="mb-4 text-sm text-slate-400 line-clamp-3 flex-1">
                  {job.description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-700 pt-4">
                  <span className="text-xs text-slate-500">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={job.hasApplied || applying === job.id}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      job.hasApplied
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    {job.hasApplied ? (
                      <>
                        <Check className="h-4 w-4" /> Applied
                      </>
                    ) : applying === job.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
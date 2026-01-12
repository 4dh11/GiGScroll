import { useEffect, useState } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import { Building2, MapPin, Calendar, Loader2 } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  job: {
    title: string;
    company: string;
    location: string;
    workMode: string;
  };
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/applications/mine')
      .then(res => setApplications(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Helper to color-code statuses
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'INTERVIEWING': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-500"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold">My Applications</h1>
        
        {applications.length === 0 ? (
          <div className="rounded-xl bg-slate-800 p-8 text-center border border-slate-700">
            <p className="text-slate-400">You haven't applied to any jobs yet.</p>
            <p className="text-sm text-slate-500 mt-2">Go to the Jobs page and swipe right!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {applications.map((app) => (
              <div key={app.id} className="group relative overflow-hidden rounded-xl bg-slate-800 p-5 shadow-lg border border-slate-700 transition hover:border-slate-600">
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition">{app.job.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    {app.job.company}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {app.job.location} <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300">{app.job.workMode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 transition group-hover:opacity-100"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
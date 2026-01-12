import { useState } from 'react';
import client from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await client.post('/auth/login', { email, password });
      
      // Save token and user info
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      
      // Redirect to the swiping page
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">GigScroll</h1>
        <p className="mb-8 text-center text-slate-400">Swipe your way to your next job.</p>

        {error && (
          <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 pl-10 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 pl-10 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
        
        {/* ✅ Link to the Register Page */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="cursor-pointer text-blue-400 hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Briefcase, FileText, Search } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
      {/* Left Side: Logo */}
      <Link to="/jobs" className="flex items-center gap-2 text-xl font-bold text-white hover:text-blue-400">
        <Briefcase className="h-6 w-6 text-blue-500" />
        GigScroll
      </Link>

      {/* Right Side: Navigation Links */}
      <div className="flex items-center gap-6">
        
        {/* 1. Browse Jobs */}
        <Link to="/browse" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <Search className="h-5 w-5" />
          <span className="hidden sm:inline">Browse</span>
        </Link>

        {/* 2. My Applications */}
        <Link to="/applications" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <FileText className="h-5 w-5" />
          <span className="hidden sm:inline">Applications</span>
        </Link>

        {/* 3. Profile */}
        <Link to="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <User className="h-5 w-5" />
          <span className="hidden sm:inline">Profile</span>
        </Link>

        {/* 4. Logout Button */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
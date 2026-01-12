import { useEffect, useState } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import { Upload, FileText, Loader2, Edit2, Save, X, Settings, DollarSign, MapPin } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    skills: '', 
    // ✅ NEW: Preferences Fields
    workMode: 'Any',
    minSalary: '0',
  });
  const [saving, setSaving] = useState(false);

  // Resume Upload State
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Load Profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/users/profile');
      const data = res.data.data;
      setUser(data);
      
      // Initialize form data with existing profile + preferences
      setFormData({
        fullName: data.fullName,
        email: data.email,
        skills: data.skills.join(', '),
        // Safe check in case preferences are null yet
        workMode: data.preferences?.workMode || 'Any',
        minSalary: data.preferences?.minSalary?.toString() || '0',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArray = formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        skills: skillsArray,
        // ✅ NEW: Send preferences object
        preferences: {
            workMode: formData.workMode,
            minSalary: Number(formData.minSalary)
        }
      };

      const res = await client.patch('/users/profile', payload);
      setUser(res.data.data);
      setIsEditing(false);
      setMessage('✅ Profile & Preferences updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    setUploading(true);
    setMessage('');

    try {
      const res = await client.post('/users/upload-resume', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser((prev: any) => ({
        ...prev,
        resumeUrl: res.data.data.resumeUrl,
        skills: res.data.data.skills
      }));
      setFormData(prev => ({
        ...prev,
        skills: res.data.data.skills.join(', ')
      }));
      setMessage('✅ Resume parsed & profile updated!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
          
          {/* Header with Edit Button */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold uppercase">
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mb-1 w-full rounded bg-slate-900 border border-slate-600 p-1 text-xl font-bold text-white"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{user.fullName}</h1>
                )}
                
                {isEditing ? (
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded bg-slate-900 border border-slate-600 p-1 text-sm text-slate-300"
                  />
                ) : (
                  <p className="text-slate-400">{user.email}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition">
                    <X className="h-5 w-5 text-red-400" />
                  </button>
                  <button onClick={handleSave} disabled={saving} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition">
                    {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5 text-white" />}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition">
                  <Edit2 className="h-5 w-5 text-blue-400" />
                </button>
              )}
            </div>
          </div>

          {/* ✅ NEW SECTION: Preferences */}
          <div className="mb-8 border-b border-slate-700 pb-8">
             <h2 className="mb-4 text-lg font-semibold flex items-center gap-2 text-white">
               <Settings className="text-blue-500 h-5 w-5" /> Job Preferences
             </h2>
             
             {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-slate-400 mb-1 block">Preferred Work Mode</label>
                      <select 
                        name="workMode" 
                        value={formData.workMode} 
                        onChange={handleChange}
                        className="w-full rounded bg-slate-900 border border-slate-600 p-2 text-white focus:border-blue-500 outline-none"
                      >
                         <option value="Any">Any Mode</option>
                         <option value="Remote">Remote</option>
                         <option value="Hybrid">Hybrid</option>
                         <option value="On-site">On-site</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 mb-1 block">Min. Salary (USD)</label>
                      <input 
                        type="number"
                        name="minSalary"
                        value={formData.minSalary}
                        onChange={handleChange}
                        className="w-full rounded bg-slate-900 border border-slate-600 p-2 text-white focus:border-blue-500 outline-none"
                        placeholder="e.g. 80000"
                      />
                   </div>
                </div>
             ) : (
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2 border border-slate-700">
                      <MapPin className="text-slate-400 h-4 w-4" />
                      <span className="text-slate-200 text-sm">
                        {user.preferences?.workMode || 'Any Mode'}
                      </span>
                   </div>
                   <div className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2 border border-slate-700">
                      <DollarSign className="text-slate-400 h-4 w-4" />
                      <span className="text-slate-200 text-sm">
                        ${user.preferences?.minSalary ? user.preferences.minSalary.toLocaleString() : '0'}+
                      </span>
                   </div>
                </div>
             )}
          </div>

          {/* Resume Upload Section */}
          <div className="mb-8 rounded-xl bg-slate-900 p-6 border border-slate-700 border-dashed">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <FileText className="text-blue-500 h-5 w-5" /> Resume & Skills
            </h2>
            
            {user.resumeUrl ? (
              <div className="mb-4 flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Resume uploaded</span>
              </div>
            ) : (
              <p className="mb-4 text-sm text-slate-500">No resume uploaded yet.</p>
            )}

            <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 transition">
              {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Parsing...' : 'Upload Resume (PDF)'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>

            {message && <p className="mt-3 text-sm text-slate-300 transition-opacity duration-500">{message}</p>}
          </div>

          {/* Skills Section */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Skills</h3>
            {isEditing ? (
              <div>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg bg-slate-900 border border-slate-600 p-3 text-slate-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Java, Python, React (Comma separated)"
                />
                <p className="mt-1 text-xs text-slate-500">Separate skills with commas.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? user.skills.map((skill: string) => (
                  <span key={skill} className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300">
                    {skill}
                  </span>
                )) : (
                  <span className="text-slate-500 italic">No skills added.</span>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
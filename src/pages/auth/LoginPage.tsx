import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'dentist') {
        navigate('/referral/dentist');
      } else if (loggedInUser.role === 'specialist') {
        navigate('/referral/specialist');
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Patient', email: 'patient@globalsmile.com' },
    { role: 'Admin', email: 'admin@globalsmile.com' },
    { role: 'Dentist', email: 'dentist@globalsmile.com' },
    { role: 'Specialist', email: 'specialist@globalsmile.com' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient-bg relative p-4">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 rounded-3xl shadow-premium">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-2xl text-healthcare-text-primary dark:text-dark-text-primary">Global<span className="gradient-text">Smile</span></span>
            </Link>
            <h1 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Welcome Back</h1>
            <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">{error}</div>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-healthcare-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-healthcare-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  {showPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !mt-6">
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-6">
            Don't have an account? <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium cursor-pointer">Sign Up</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-healthcare-border dark:border-dark-border">
            <p className="text-xs text-center text-healthcare-text-muted dark:text-dark-text-muted mb-3">Demo Accounts (password: demo123)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(d => (
                <button key={d.role} onClick={() => { setEmail(d.email); setPassword('demo123'); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-dark-surface text-healthcare-text-secondary dark:text-dark-text-secondary hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer">
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

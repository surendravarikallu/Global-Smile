import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, User, Globe, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/patient');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient-bg relative p-4">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 rounded-3xl shadow-premium">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow"><Sparkles className="w-6 h-6 text-white" /></div>
              <span className="font-heading font-bold text-2xl text-healthcare-text-primary dark:text-dark-text-primary">Global<span className="gradient-text">Smile</span></span>
            </Link>
            <h1 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Create Account</h1>
            <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Start your smile transformation journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">First Name</label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="firstName" value={form.firstName} onChange={e => update('firstName', e.target.value)} required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" /></div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Last Name</label>
                <input id="lastName" value={form.lastName} onChange={e => update('lastName', e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" placeholder="you@example.com" /></div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" placeholder="••••••••" /></div>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Country</label>
              <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="country" value={form.country} onChange={e => update('country', e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" placeholder="United States" /></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !mt-6">
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-6">
            Already have an account? <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium cursor-pointer">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { GitBranch, Plus, ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const statusColors: Record<string, string> = { pending: 'bg-amber-50 text-amber-600', in_review: 'bg-primary-50 text-primary-600', accepted: 'bg-accent-50 text-accent-600', completed: 'bg-gray-100 text-gray-600' };

export default function DentistOverview() {
  const [referrals, setReferrals] = useState<any[]>([]);
  useEffect(() => { fetch('/api/referrals').then(r => r.json()).then(d => setReferrals(d.referrals || [])).catch(() => {}); }, []);

  const stats = [
    { label: 'Total Referrals', value: referrals.length, icon: GitBranch, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
    { label: 'Accepted', value: referrals.filter(r => r.status === 'accepted').length, icon: CheckCircle2, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-500/10' },
    { label: 'In Review', value: referrals.filter(r => r.status === 'in_review').length, icon: Users, color: 'text-secondary-500', bg: 'bg-secondary-50 dark:bg-secondary-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Dentist Portal</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Refer patients and track specialist collaborations</p></div>
        <button className="btn-primary text-sm !py-2"><Plus className="w-4 h-4" /> New Referral</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <div><p className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">{s.value}</p><p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{s.label}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-card">
        <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">My Referrals</h3>
        <div className="space-y-3">
          {referrals.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-surface cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
              <GitBranch className="w-5 h-5 text-primary-500 shrink-0" />
              <div className="flex-1"><p className="font-semibold text-sm text-healthcare-text-primary dark:text-dark-text-primary">{r.patientName}</p><p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{r.reason}</p></div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

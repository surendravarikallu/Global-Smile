import { motion } from 'framer-motion';
import { GitBranch, User, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const statusColors: Record<string, string> = { pending: 'bg-amber-50 text-amber-600', in_review: 'bg-primary-50 text-primary-600', accepted: 'bg-accent-50 text-accent-600', completed: 'bg-gray-100 text-gray-600' };

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<any[]>([]);
  useEffect(() => { fetch('/api/referrals').then(r => r.json()).then(d => setReferrals(d.referrals || [])).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Referral Network</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Manage specialist referral pipeline</p></div>
      <div className="space-y-3">
        {referrals.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="w-5 h-5 text-primary-500" />
              <span className="font-semibold text-sm text-healthcare-text-primary dark:text-dark-text-primary">{r.patientName}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-healthcare-text-secondary dark:text-dark-text-secondary">{r.reason}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-healthcare-text-muted dark:text-dark-text-muted">
              <User className="w-3 h-3" />{r.dentistName} <ArrowRight className="w-3 h-3" /> {r.specialistName || 'Unassigned'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

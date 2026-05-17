import { motion } from 'framer-motion';
import { Stethoscope, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SpecialistOverview() {
  const [referrals, setReferrals] = useState<any[]>([]);
  useEffect(() => { fetch('/api/referrals').then(r => r.json()).then(d => setReferrals(d.referrals || [])).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Specialist Portal</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Review incoming referrals and collaborate with dentists</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: referrals.filter(r => r.status === 'in_review' || r.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Accepted Cases', value: referrals.filter(r => r.status === 'accepted').length, icon: CheckCircle2, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-500/10' },
          { label: 'Total Cases', value: referrals.length, icon: Stethoscope, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <div><p className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">{s.value}</p><p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{s.label}</p></div>
          </motion.div>
        ))}
      </div>
      <div className="dashboard-card">
        <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">Incoming Referrals</h3>
        <div className="space-y-3">
          {referrals.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-healthcare-text-primary dark:text-dark-text-primary">{r.patientName}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.status === 'accepted' ? 'bg-accent-50 text-accent-600' : 'bg-primary-50 text-primary-600'}`}>{r.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-healthcare-text-secondary dark:text-dark-text-secondary">{r.reason}</p>
              <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted mt-1">Referred by: {r.dentistName}</p>
              {r.notes && <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted mt-1 italic">Notes: {r.notes}</p>}
              <div className="flex gap-2 mt-3">
                <button className="btn-primary text-xs !py-1.5 !px-3"><CheckCircle2 className="w-3 h-3" /> Accept</button>
                <button className="btn-secondary text-xs !py-1.5 !px-3"><MessageSquare className="w-3 h-3" /> Reply</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

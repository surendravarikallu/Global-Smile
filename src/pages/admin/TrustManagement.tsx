import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TrustManagement() {
  const [certs, setCerts] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/certifications').then(r => r.json()).then(d => setCerts(d.certifications || [])).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Trust Management</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Manage certifications and compliance</p></div><button className="btn-primary text-sm !py-2"><Award className="w-4 h-4" /> Add Cert</button></div>
      <div className="space-y-3">
        {certs.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="dashboard-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center"><Shield className="w-6 h-6 text-accent-500" /></div>
            <div className="flex-1"><p className="font-semibold text-sm text-healthcare-text-primary dark:text-dark-text-primary">{c.name}</p><p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">Issued by {c.issuedBy} · Valid until {c.validUntil}</p></div>
            <span className="trust-badge-verified"><CheckCircle2 className="w-3 h-3" /> {c.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

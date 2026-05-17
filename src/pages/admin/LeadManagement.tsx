import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Mail, Globe, Clock } from 'lucide-react';

const statusColors: Record<string, string> = { new: 'bg-blue-50 text-blue-600', contacted: 'bg-amber-50 text-amber-600', qualified: 'bg-accent-50 text-accent-600', consultation: 'bg-purple-50 text-purple-600' };

export default function LeadManagement() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  useEffect(() => { fetch('/api/admin/leads').then(r => r.json()).then(d => setLeads(d.leads || [])).catch(() => {}); }, []);
  const filtered = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.treatment.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Lead Management</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Track and manage incoming patient inquiries</p></div>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" /></div>
        <button className="btn-secondary text-sm !py-2"><Filter className="w-4 h-4" /> Filter</button>
      </div>
      <div className="space-y-3">
        {filtered.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="dashboard-card flex items-center gap-4 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">{l.name.split(' ').map((n: string) => n[0]).join('')}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-healthcare-text-primary dark:text-dark-text-primary">{l.name}</p>
              <div className="flex flex-wrap gap-2 text-xs text-healthcare-text-muted dark:text-dark-text-muted mt-0.5">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {l.email}</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {l.country}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {l.createdAt}</span>
              </div>
            </div>
            <span className="text-xs text-healthcare-text-secondary dark:text-dark-text-secondary">{l.treatment}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[l.status] || 'bg-gray-100 text-gray-600'}`}>{l.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

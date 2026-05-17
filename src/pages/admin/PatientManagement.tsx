import { motion } from 'framer-motion';
import { Users, Globe, Activity } from 'lucide-react';

const patients = [
  { id: '1', name: 'Sarah Johnson', country: 'US', treatment: 'Full Mouth Rehab', status: 'IN_PROGRESS', progress: 65 },
  { id: '2', name: 'James Wilson', country: 'UK', treatment: 'Dental Implants', status: 'INQUIRY', progress: 10 },
  { id: '3', name: 'Maria Garcia', country: 'Spain', treatment: 'Porcelain Veneers', status: 'COMPLETED', progress: 100 },
];

const statusStyles: Record<string,string> = { IN_PROGRESS: 'bg-primary-50 text-primary-600', INQUIRY: 'bg-amber-50 text-amber-600', COMPLETED: 'bg-accent-50 text-accent-600' };

export default function PatientManagement() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Patient Management</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Manage patient profiles and treatment journeys</p></div>
      <div className="space-y-3">
        {patients.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card flex items-center gap-4 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">{p.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="flex-1"><p className="font-semibold text-sm text-healthcare-text-primary dark:text-dark-text-primary">{p.name}</p><p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted flex items-center gap-2"><Globe className="w-3 h-3" />{p.country} · {p.treatment}</p></div>
            <div className="hidden sm:flex items-center gap-2 w-32"><div className="flex-1 h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden"><div className="h-full bg-gradient-primary rounded-full" style={{ width: `${p.progress}%` }} /></div><span className="text-xs font-medium text-healthcare-text-muted dark:text-dark-text-muted">{p.progress}%</span></div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[p.status]}`}>{p.status.replace('_', ' ')}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

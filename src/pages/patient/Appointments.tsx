import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';

const appts = [
  { id: '1', type: 'Follow-up Consultation', date: 'June 1, 2026', time: '10:00 AM', doctor: 'Dr. Priya Sharma', status: 'scheduled', location: 'Global Smile Clinic, Vijayawada' },
  { id: '2', type: 'Prosthetic Fitting', date: 'June 15, 2026', time: '2:00 PM', doctor: 'Dr. Ravi Kumar', status: 'scheduled', location: 'Global Smile Clinic, Vijayawada' },
];

const statusStyles: Record<string, string> = { scheduled: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400', completed: 'bg-accent-50 text-accent-600', pending: 'bg-amber-50 text-amber-600' };

export default function Appointments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Appointments</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Manage your consultations and visits</p></div>
        <button className="btn-primary text-sm !py-2"><Calendar className="w-4 h-4" /> Book New</button>
      </div>
      <div className="space-y-4">
        {appts.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0"><Calendar className="w-7 h-7 text-primary-500" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-healthcare-text-primary dark:text-dark-text-primary">{a.type}</h3>
              <div className="flex flex-wrap gap-3 text-xs text-healthcare-text-muted dark:text-dark-text-muted mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.date} at {a.time}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {a.doctor}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[a.status]}`}>{a.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

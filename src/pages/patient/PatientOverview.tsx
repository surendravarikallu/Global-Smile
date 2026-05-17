import { motion } from 'framer-motion';
import { Activity, Calendar, TrendingUp, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Treatment Progress', value: '65%', icon: Activity, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
  { label: 'Next Appointment', value: 'Jun 1', icon: Calendar, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-500/10' },
  { label: 'Milestones Done', value: '3/6', icon: CheckCircle2, color: 'text-secondary-500', bg: 'bg-secondary-50 dark:bg-secondary-500/10' },
  { label: 'Cost Savings', value: '68%', icon: TrendingUp, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-500/10' },
];

const milestones = [
  { title: 'Initial Consultation', status: 'completed', date: 'Aug 15, 2025' },
  { title: 'Digital Impressions', status: 'completed', date: 'Sep 1, 2025' },
  { title: 'Implant Placement', status: 'completed', date: 'Oct 15, 2025' },
  { title: 'Healing Period', status: 'in-progress', date: 'Jan 15, 2026' },
  { title: 'Prosthetic Fitting', status: 'pending', date: 'Jun 1, 2026' },
  { title: 'Final Review', status: 'pending', date: 'Jul 1, 2026' },
];

const statusIcon: Record<string, any> = { completed: CheckCircle2, 'in-progress': Clock, pending: AlertCircle };
const statusColor: Record<string, string> = { completed: 'text-accent-500', 'in-progress': 'text-primary-500', pending: 'text-gray-400' };

const quickActions = [
  { label: 'AI Smile Analysis', path: '/patient/smile-visualizer', color: 'from-primary-500 to-secondary-400' },
  { label: 'Tourism Calculator', path: '/patient/tourism-calculator', color: 'from-secondary-400 to-accent-500' },
  { label: 'Trust Chain', path: '/patient/trust-chain', color: 'from-accent-500 to-primary-500' },
];

export default function PatientOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Welcome back, Sarah 👋</h2>
        <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Your smile journey is 65% complete</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <div><p className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">{s.value}</p><p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{s.label}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treatment timeline */}
        <div className="lg:col-span-2 dashboard-card">
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">Treatment Journey</h3>
          <div className="space-y-4">
            {milestones.map((m, i) => {
              const Icon = statusIcon[m.status];
              return (
                <motion.div key={m.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3">
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${statusColor[m.status]} mt-0.5`} />
                    {i < milestones.length - 1 && <div className={`absolute left-2.5 top-6 w-0.5 h-8 ${m.status === 'completed' ? 'bg-accent-200' : 'bg-gray-200 dark:bg-dark-border'}`} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary">{m.title}</p>
                    <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{m.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'completed' ? 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400' : m.status === 'in-progress' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'bg-gray-100 text-gray-500 dark:bg-dark-surface dark:text-dark-text-muted'}`}>
                    {m.status.replace('-', ' ')}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">Quick Actions</h3>
          {quickActions.map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
              <Link to={a.path} className={`block p-5 rounded-2xl bg-gradient-to-r ${a.color} text-white shadow-glass hover:shadow-glass-lg transition-all duration-250 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold">{a.label}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

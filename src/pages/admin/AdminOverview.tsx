import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Globe, DollarSign, GitBranch, Target, Heart, BarChart3 } from 'lucide-react';

const kpiCards = [
  { label: 'Total Leads', value: '1,247', change: '+12.5%', icon: TrendingUp, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
  { label: 'Active Patients', value: '342', change: '+8.2%', icon: Users, color: 'text-secondary-500', bg: 'bg-secondary-50 dark:bg-secondary-500/10' },
  { label: 'International', value: '156', change: '+15.3%', icon: Globe, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-500/10' },
  { label: 'Revenue Est.', value: '$2.84M', change: '+22.1%', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { label: 'Referrals', value: '89', change: '+5.6%', icon: GitBranch, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { label: 'Conversion', value: '27.4%', change: '+3.1%', icon: Target, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
  { label: 'Avg. Value', value: '$8,300', change: '+7.4%', icon: BarChart3, color: 'text-secondary-500', bg: 'bg-secondary-50 dark:bg-secondary-500/10' },
  { label: 'Satisfaction', value: '97.2%', change: '+0.8%', icon: Heart, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
];

const pieColors = ['#0891b2', '#22d3ee', '#059669', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/analytics').then(r => r.json()).then(setData).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Analytics Overview</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Real-time clinic performance metrics</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="dashboard-card">
            <div className="flex items-center justify-between mb-3"><div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}><kpi.icon className={`w-5 h-5 ${kpi.color}`} /></div><span className="text-xs font-semibold text-accent-500">{kpi.change}</span></div>
            <p className="text-xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">{kpi.value}</p>
            <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead trends */}
        <div className="dashboard-card">
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">Lead & Conversion Trends</h3>
          {data?.monthlyLeads && (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.monthlyLeads}><defs><linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.2}/><stop offset="95%" stopColor="#0891b2" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,145,178,0.1)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#0891b2" fill="url(#colorLeads)" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Country distribution */}
        <div className="dashboard-card">
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">Patients by Country</h3>
          {data?.patientsByCountry && (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart><Pie data={data.patientsByCountry} dataKey="count" nameKey="country" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {data.patientsByCountry.map((_: any, i: number) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {data.patientsByCountry.slice(0, 5).map((c: any, i: number) => (
                  <div key={c.country} className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ background: pieColors[i] }} /><span className="text-healthcare-text-secondary dark:text-dark-text-secondary">{c.country}</span><span className="font-semibold text-healthcare-text-primary dark:text-dark-text-primary ml-auto">{c.percentage}%</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

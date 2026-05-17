import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Globe, Plane, Hotel, TrendingDown } from 'lucide-react';

const treatments = ['Dental Implants','Full Mouth Rehabilitation','Porcelain Veneers','Crowns & Bridges','Teeth Whitening','Root Canal','All-on-4 Implants'];
const countries = ['United States','United Kingdom','Australia','Canada','Germany','UAE'];
const barColors = ['#ef4444','#f59e0b','#3b82f6','#059669'];

export default function TourismCalculator() {
  const [treatment, setTreatment] = useState(treatments[0]);
  const [country, setCountry] = useState(countries[0]);
  const [days, setDays] = useState(7);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/tourism/compare?treatment=${encodeURIComponent(treatment)}&country=${encodeURIComponent(country)}&days=${days}`)
      .then(r => r.json()).then(setData).catch(() => {});
  }, [treatment, country, days]);

  const maxSavings = data?.comparison?.reduce((max: number, c: any) => Math.max(max, c.savings || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Dental Tourism Calculator</h2>
        <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Compare treatment costs across the world</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="dashboard-card space-y-5">
          <div>
            <label className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Treatment Type</label>
            <select value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary cursor-pointer">
              {treatments.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Your Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary cursor-pointer">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1.5">Travel Duration: {days} days</label>
            <input type="range" min={3} max={21} value={days} onChange={e => setDays(Number(e.target.value))} className="w-full accent-primary-500 cursor-pointer" />
          </div>

          {data?.travelBreakdown && (
            <div className="pt-4 border-t border-healthcare-border dark:border-dark-border space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-healthcare-text-muted dark:text-dark-text-muted"><Plane className="w-4 h-4" /> Flight</span><span className="font-medium text-healthcare-text-primary dark:text-dark-text-primary">${data.travelBreakdown.flight}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-healthcare-text-muted dark:text-dark-text-muted"><Hotel className="w-4 h-4" /> Accommodation</span><span className="font-medium text-healthcare-text-primary dark:text-dark-text-primary">${data.travelBreakdown.accommodation}</span></div>
              <div className="flex items-center justify-between text-sm font-semibold"><span className="flex items-center gap-2 text-healthcare-text-primary dark:text-dark-text-primary"><Globe className="w-4 h-4" /> Travel Total</span><span className="text-primary-500">${data.travelBreakdown.total}</span></div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 dashboard-card">
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">Cost Comparison</h3>
          {data?.comparison && (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.comparison} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,145,178,0.1)" />
                  <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Total Cost']} />
                  <Bar dataKey="totalCost" radius={[8, 8, 0, 0]}>
                    {data.comparison.map((_: any, i: number) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Savings highlight */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-500/10 dark:to-primary-500/10 border border-accent-200 dark:border-accent-500/20 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow-accent shrink-0">
                  <TrendingDown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-accent-600 dark:text-accent-400">Save up to {maxSavings}%</p>
                  <p className="text-sm text-healthcare-text-secondary dark:text-dark-text-secondary">with Vijayawada (including travel & accommodation)</p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

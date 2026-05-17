import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GlobeLock, UsersRound, TrendingDown, Award } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const globalStats = [
  { icon: GlobeLock, value: '28+', label: 'Countries Served' },
  { icon: UsersRound, value: '1,200+', label: 'International Patients' },
  { icon: TrendingDown, value: '68%', label: 'Average Savings' },
  { icon: Award, value: '97%', label: 'Patient Satisfaction' },
];

const countries = [
  { name: '🇺🇸 USA', x: '20%', y: '35%' }, { name: '🇬🇧 UK', x: '45%', y: '25%' },
  { name: '🇩🇪 Germany', x: '50%', y: '28%' }, { name: '🇦🇪 UAE', x: '58%', y: '42%' },
  { name: '🇮🇳 India', x: '65%', y: '42%' }, { name: '🇦🇺 Australia', x: '82%', y: '70%' },
  { name: '🇨🇦 Canada', x: '22%', y: '25%' }, { name: '🇯🇵 Japan', x: '82%', y: '35%' },
];

export default function GlobalPresence() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="savings" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1929] to-[#132f46]" />
      <div className="section-container relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-heading font-semibold uppercase tracking-[0.2em] text-secondary-400 mb-4 block">Global Reach</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">Patients from Around the World</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Vijayawada is becoming a global destination for advanced prosthodontic care.</p>
          </div>
        </ScrollReveal>

        {/* World map area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative h-64 md:h-80 mb-16 rounded-3xl bg-[#0f2a3d] border border-gray-800 overflow-hidden"
        >
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

          {/* Country dots */}
          {countries.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className="absolute group"
              style={{ left: c.x, top: c.y }}
            >
              <motion.div
                animate={{ boxShadow: ['0 0 0 0px rgba(34,211,238,0.3)', '0 0 0 8px rgba(34,211,238,0)', '0 0 0 0px rgba(34,211,238,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 rounded-full bg-secondary-400 cursor-pointer"
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 px-2.5 py-1.5 bg-dark-card border border-dark-border rounded-lg text-xs text-white whitespace-nowrap shadow-lg group-hover:-translate-y-1">
                {c.name}
              </div>
            </motion.div>
          ))}

          {/* Vijayawada marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1, type: 'spring', stiffness: 150 }}
            className="absolute" style={{ left: '65%', top: '42%' }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0 0px rgba(5,150,105,0.4)', '0 0 0 12px rgba(5,150,105,0)', '0 0 0 0px rgba(5,150,105,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-5 h-5 rounded-full bg-accent-500 border-2 border-white"
            />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-accent-400 whitespace-nowrap">📍 Vijayawada HQ</span>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {globalStats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, borderColor: 'rgba(34,211,238,0.3)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-default"
              >
                <stat.icon className="w-8 h-8 text-secondary-400 mx-auto mb-3" strokeWidth={1.8} />
                <p className="text-3xl font-heading font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

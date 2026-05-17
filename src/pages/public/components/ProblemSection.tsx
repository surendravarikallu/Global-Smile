import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { DollarSign, Hourglass, EyeOff, Plane } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const stats = [
  { icon: DollarSign, label: 'Average US Implant Cost', value: '$5,000+', desc: 'Per single implant', color: 'text-red-500', gradient: 'from-red-500/10 to-red-500/5' },
  { icon: Hourglass, label: 'Average Wait Time', value: '6-12 mo', desc: 'For specialist appointment', color: 'text-amber-500', gradient: 'from-amber-500/10 to-amber-500/5' },
  { icon: EyeOff, label: 'Patients Concerned', value: '73%', desc: 'About treatment transparency', color: 'text-orange-500', gradient: 'from-orange-500/10 to-orange-500/5' },
  { icon: Plane, label: 'Would Consider Travel', value: '62%', desc: 'For affordable quality care', color: 'text-primary-500', gradient: 'from-primary-500/10 to-primary-500/5' },
];

function AnimatedNumber({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-3xl md:text-4xl font-heading font-bold"
    >
      {value}
    </motion.span>
  );
}

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-white dark:bg-dark-bg relative" ref={ref}>
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="section-label">The Problem</span>
            <h2 className="section-title">Why Patients Struggle with Dental Care</h2>
            <p className="section-subtitle mx-auto mt-4">
              High costs, long waits, and lack of transparency keep millions from the smile they deserve.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-card p-6 text-center group cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} strokeWidth={1.8} />
                </div>
                <AnimatedNumber value={stat.value} />
                <p className="text-sm font-semibold text-healthcare-text-primary dark:text-dark-text-primary mt-2">{stat.label}</p>
                <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted mt-1">{stat.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

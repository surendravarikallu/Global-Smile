import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BrainCircuit, PiggyBank, ShieldCheck, Network, Radar } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const features = [
  { icon: BrainCircuit, title: 'AI Smile Visualizer', desc: 'Upload a photo and receive AI-powered dental analysis with 3D visualization of findings and confidence scores.', tag: 'Sparks Curiosity', gradient: 'from-primary-500 to-secondary-400', glow: 'shadow-[0_0_30px_rgba(8,145,178,0.2)]' },
  { icon: PiggyBank, title: 'Tourism Calculator', desc: 'Compare treatment costs across New York, London, Sydney and Vijayawada — including flights and accommodation.', tag: 'Shows Savings', gradient: 'from-secondary-400 to-accent-500', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.2)]' },
  { icon: ShieldCheck, title: 'Trust Dashboard', desc: 'Track sterilization logs, doctor credentials, ISO certifications and every treatment milestone in real-time.', tag: 'Removes Fear', gradient: 'from-accent-500 to-primary-500', glow: 'shadow-[0_0_30px_rgba(5,150,105,0.2)]' },
  { icon: Network, title: 'Referral Ecosystem', desc: 'B2B collaboration between general dentists and specialists for seamless patient handoffs and case management.', tag: 'B2B Growth', gradient: 'from-primary-500 to-accent-500', glow: 'shadow-[0_0_30px_rgba(8,145,178,0.15)]' },
  { icon: Radar, title: 'Global Care Tracking', desc: 'International patients can track their entire journey from initial inquiry to post-operative follow-up.', tag: 'Full Visibility', gradient: 'from-secondary-400 to-primary-500', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)]' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const } },
};

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="section-container relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="section-label">Our Solution</span>
            <h2 className="section-title">One Platform. Four Engines.</h2>
            <p className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary mt-2">
              One Outcome: <span className="gradient-text">Booked Consultations</span>
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className={`glass-card p-8 group cursor-default ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <motion.div
                whileHover={{ rotate: [0, -5, 5, -3, 3, 0], scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 ${feature.glow} transition-shadow duration-300`}
              >
                <feature.icon className="w-7 h-7 text-white" strokeWidth={1.8} />
              </motion.div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-secondary-400 mb-3">
                {feature.tag}
              </span>
              <h3 className="text-xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-healthcare-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Patient journey flow */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 glass-card p-5 rounded-2xl">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary">
              <span className="gradient-text font-heading font-semibold">Patient Journey:</span>
              {['📷 Upload Photo', '🧠 Receive Insights', '💰 View Savings', '✅ Trust Verified', '📅 Book Consultation'].map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <motion.span
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="px-3 py-1.5 rounded-full bg-primary-50 dark:bg-dark-surface text-xs cursor-default"
                  >
                    {step}
                  </motion.span>
                  {i < 4 && <span className="text-primary-400 text-lg">→</span>}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

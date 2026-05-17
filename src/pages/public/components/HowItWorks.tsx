import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Camera, BrainCircuit, LineChart, Route, CalendarCheck2 } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const steps = [
  { icon: Camera, num: '01', title: 'Upload Your Smile', desc: 'Take a photo of your smile and upload it securely to our HIPAA-compliant platform.', color: 'from-primary-500 to-primary-400' },
  { icon: BrainCircuit, num: '02', title: 'Receive AI Insights', desc: 'Our multi-model AI pipeline analyzes your dental photo and generates a comprehensive report.', color: 'from-secondary-400 to-primary-500' },
  { icon: LineChart, num: '03', title: 'Compare Global Costs', desc: 'See treatment cost comparisons across New York, London, Sydney, and Vijayawada.', color: 'from-accent-500 to-secondary-400' },
  { icon: Route, num: '04', title: 'Track Treatment Journey', desc: 'Monitor every milestone with our transparent trust chain dashboard and real-time updates.', color: 'from-primary-500 to-accent-500' },
  { icon: CalendarCheck2, num: '05', title: 'Book Consultation', desc: 'Schedule a video or in-person consultation with our specialist prosthodontic team.', color: 'from-secondary-400 to-accent-500' },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="section-padding bg-white dark:bg-dark-bg" ref={ref}>
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Your Journey to a Perfect Smile</h2>
            <p className="section-subtitle mx-auto mt-4">Five simple steps from your first upload to your dream smile.</p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-secondary-200 to-accent-200 dark:from-primary-500/20 dark:via-secondary-500/20 dark:to-accent-500/20" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={`lg:grid lg:grid-cols-2 lg:gap-12 items-center ${i > 0 ? 'lg:mt-16' : ''}`}
              >
                <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(8, 145, 178, 0.12)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="glass-card p-8"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ rotate: [0, -8, 8, -4, 4, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 shadow-glow`}
                      >
                        <step.icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                      </motion.div>
                      <div>
                        <span className="text-xs font-mono text-primary-400 font-bold tracking-wider">STEP {step.num}</span>
                        <h3 className="text-xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary mt-1">{step.title}</h3>
                        <p className="text-sm text-healthcare-text-secondary dark:text-dark-text-secondary mt-2 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                {/* Timeline dot (desktop) */}
                <div className={`hidden lg:flex justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: i * 0.12 + 0.3, type: 'spring', stiffness: 300 }}
                    className="w-5 h-5 rounded-full bg-gradient-primary shadow-glow ring-4 ring-white dark:ring-dark-bg relative"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="absolute inset-0 rounded-full bg-primary-400"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, Calculator } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 animated-gradient-bg" />
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="section-container relative z-10">
        <ScrollReveal>
          <motion.div
            whileHover={{ boxShadow: '0 30px 80px rgba(8, 145, 178, 0.15)' }}
            transition={{ duration: 0.4 }}
            className="glass-card p-12 md:p-16 rounded-3xl text-center shadow-premium"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <HeartPulse className="w-12 h-12 text-primary-500 mx-auto mb-6" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary mb-4">
              Ready to Transform Your Smile?
            </h2>
            <p className="text-lg text-healthcare-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto mb-8">
              Join 1,200+ international patients who chose world-class prosthodontic care at a fraction of western costs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="btn-primary text-base !py-3.5 !px-8">
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link to="/patient/tourism-calculator" className="btn-secondary text-base !py-3.5 !px-8">
                  <Calculator className="w-5 h-5" /> Calculate Savings
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}

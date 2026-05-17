import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, MessageCircleHeart } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const testimonials = [
  { name: 'Sarah J.', country: '🇺🇸 United States', treatment: 'Full Mouth Rehabilitation', quote: 'The AI analysis was incredibly detailed. I saved over $22,000 compared to US prices, and the trust dashboard gave me confidence throughout the entire journey.', rating: 5, savings: '$22,000', avatar: 'SJ' },
  { name: 'James W.', country: '🇬🇧 United Kingdom', treatment: 'Dental Implants', quote: 'From the initial AI smile scan to the final fitting, every step was transparent. The 3D visualization helped me understand exactly what to expect.', rating: 5, savings: '£18,500', avatar: 'JW' },
  { name: 'Maria G.', country: '🇪🇸 Spain', treatment: 'Porcelain Veneers', quote: 'The tourism calculator showed me I could get world-class veneers at a fraction of European costs. The results exceeded my expectations.', rating: 5, savings: '€12,000', avatar: 'MG' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const } },
};

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="testimonials" className="section-padding bg-white dark:bg-dark-bg" ref={ref}>
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="section-label">Patient Stories</span>
            <h2 className="section-title">Trusted by International Patients</h2>
            <p className="section-subtitle mx-auto mt-4">Real stories from patients who transformed their smiles with Global Smile.</p>
          </div>
        </ScrollReveal>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(8, 145, 178, 0.1)' }}
              className="glass-card p-8 flex flex-col cursor-default group"
            >
              <MessageCircleHeart className="w-8 h-8 text-primary-200 dark:text-primary-500/30 mb-4 group-hover:text-primary-400 dark:group-hover:text-primary-500/50 transition-colors" />
              <p className="text-sm text-healthcare-text-secondary dark:text-dark-text-secondary leading-relaxed flex-1 italic">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-4 border-t border-healthcare-border dark:border-dark-border">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.8 + j * 0.08 }}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">{t.name}</p>
                    <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{t.country} · {t.treatment}</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mt-3 inline-block px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 text-xs font-semibold cursor-default"
                >
                  💰 Saved {t.savings}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

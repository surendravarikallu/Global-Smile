import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, BarChart3, ArrowRight, ShieldCheck, Sparkles, Globe, Star, Stethoscope } from 'lucide-react';

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden animated-gradient-bg">
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      {/* Floating orbs with parallax */}
      <motion.div style={{ y }} className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-float" />
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 80]) }} className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/8 rounded-full blur-3xl animate-float-slow" />
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 60]) }} className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-400/6 rounded-full blur-3xl animate-float-delayed" />

      <motion.div style={{ opacity, scale }} className="section-container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-secondary-400 text-sm font-medium mb-6"
            >
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                <Sparkles className="w-4 h-4" />
              </motion.div>
              AI-Powered Dental Excellence
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary leading-[1.1] mb-6">
              Advanced Prosthodontic{' '}
              <span className="gradient-text">Care Without</span>{' '}
              Borders
            </h1>

            <p className="text-lg text-healthcare-text-secondary dark:text-dark-text-secondary leading-relaxed mb-8 max-w-lg">
              AI-powered smile visualization, transparent treatment journeys, and global dental tourism
              coordination — all from Vijayawada to the world.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="btn-primary">
                  <Camera className="w-4 h-4" /> Upload Smile Photo
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/patient/tourism-calculator" className="btn-secondary">
                  <BarChart3 className="w-4 h-4" /> Compare Savings
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 4 }}>
                <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="btn-secondary !border-transparent !shadow-none">
                  Explore Journey <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </motion.div>

            {/* Trust badges with micro-animations */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-sm text-healthcare-text-muted dark:text-dark-text-muted"
            >
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50/50 dark:bg-accent-500/5 cursor-default">
                <ShieldCheck className="w-4 h-4 text-accent-500" /> HIPAA Compliant
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50/50 dark:bg-primary-500/5 cursor-default">
                <Globe className="w-4 h-4 text-primary-500" /> 28+ Countries
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/50 dark:bg-amber-500/5 cursor-default">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> 4.9/5 Rating
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right: Floating dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="hidden lg:block relative perspective-1000"
          >
            {/* Main dashboard card */}
            <motion.div
              whileHover={{ y: -5, boxShadow: '0 25px 70px rgba(8, 145, 178, 0.2)' }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="glass-card p-6 rounded-3xl shadow-premium relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-healthcare-text-muted dark:text-dark-text-muted font-mono flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-primary-400" /> AI Smile Analysis
                </span>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-surface dark:to-dark-bg rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-healthcare-text-primary dark:text-dark-text-primary">Dental Health Score</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-2xl font-bold gradient-text"
                  >87/100</motion.span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ delay: 1, duration: 1.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="h-full bg-gradient-primary rounded-full relative"
                  >
                    <div className="absolute right-0 top-0 w-2 h-full bg-white/40 rounded-full" />
                  </motion.div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Symmetry', score: '92%', color: 'text-accent-500', icon: '🔄' },
                  { label: 'Alignment', score: '85%', color: 'text-primary-500', icon: '📐' },
                  { label: 'Color', score: '88%', color: 'text-secondary-500', icon: '🎨' },
                  { label: 'Gum Health', score: '83%', color: 'text-accent-500', icon: '🩺' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-white/60 dark:bg-dark-surface/60 rounded-xl p-3 text-center cursor-default"
                  >
                    <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted flex items-center justify-center gap-1">
                      <span className="text-sm">{item.icon}</span> {item.label}
                    </p>
                    <p className={`text-lg font-bold ${item.color}`}>{item.score}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Floating savings card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="absolute -bottom-4 -left-8 glass-card p-4 rounded-2xl shadow-glass-lg animate-float-delayed"
            >
              <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted mb-1">💰 Potential Savings</p>
              <p className="text-2xl font-bold text-accent-500">Up to 68%</p>
              <p className="text-xs text-healthcare-text-secondary dark:text-dark-text-secondary">vs. US treatment costs</p>
            </motion.div>

            {/* Floating trust badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              whileHover={{ scale: 1.08 }}
              className="absolute -top-4 -right-4 glass-card px-4 py-2 rounded-full shadow-glass animate-float"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-accent-500"
                />
                <span className="text-xs font-semibold text-accent-600 dark:text-accent-400">✓ Verified Trust Chain</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

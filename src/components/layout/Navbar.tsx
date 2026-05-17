import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Sparkles, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Savings', href: '#savings' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track active section for highlighting
      const sections = navLinks.map(l => l.href.replace('#', ''));
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll with easing and offset for fixed nav
  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 80;
      const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
    setIsMobileOpen(false);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    const paths: Record<string, string> = { patient: '/patient', admin: '/admin', dentist: '/referral/dentist', specialist: '/referral/specialist' };
    return paths[user.role] || '/patient';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'top-3 mx-3 md:mx-6 rounded-2xl glass shadow-glass-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-heading font-bold text-xl text-healthcare-text-primary dark:text-dark-text-primary">
              Global<span className="gradient-text">Smile</span>
            </span>
          </Link>

          {/* Desktop nav with active indicator */}
          <div className="hidden md:flex items-center gap-0.5 bg-gray-50/50 dark:bg-dark-surface/30 rounded-xl p-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-primary-600 dark:text-secondary-400'
                      : 'text-healthcare-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-secondary-400'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-white dark:bg-dark-card rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-healthcare-text-secondary dark:text-dark-text-secondary hover:bg-primary-50 dark:hover:bg-dark-surface transition-colors duration-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(getDashboardPath())}
                className="btn-primary text-sm !py-2 !px-4"
              >
                Dashboard <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-healthcare-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors cursor-pointer">
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile menu */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl text-healthcare-text-secondary dark:text-dark-text-secondary hover:bg-primary-50 dark:hover:bg-dark-surface cursor-pointer"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMobileOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden glass border-t border-healthcare-border dark:border-dark-border rounded-b-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl text-healthcare-text-secondary dark:text-dark-text-secondary hover:bg-primary-50 dark:hover:bg-dark-surface cursor-pointer"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </motion.a>
              ))}
              <div className="pt-3 border-t border-healthcare-border dark:border-dark-border mt-2 flex flex-col gap-2">
                <Link to="/login" className="btn-secondary text-sm text-center" onClick={() => setIsMobileOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setIsMobileOpen(false)}>Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard, Scan, Calculator, Shield, Calendar, FileText, MessageSquare,
  Users, TrendingUp, Settings, ChevronLeft, ChevronRight, LogOut, Sun, Moon,
  Bell, Sparkles, Menu, UserCircle, GitBranch, Smartphone
} from 'lucide-react';

interface DashboardLayoutProps {
  role: 'patient' | 'admin' | 'dentist' | 'specialist';
}

const navItems: Record<string, Array<{ icon: any; label: string; path: string }>> = {
  patient: [
    { icon: LayoutDashboard, label: 'Overview', path: '/patient' },
    { icon: Scan, label: 'AI Smile Visualizer', path: '/patient/smile-visualizer' },
    { icon: Calculator, label: 'Tourism Calculator', path: '/patient/tourism-calculator' },
    { icon: Shield, label: 'Trust Chain', path: '/patient/trust-chain' },
    { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
    { icon: FileText, label: 'Documents', path: '/patient/documents' },
    { icon: MessageSquare, label: 'Messages', path: '/patient/messages' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Analytics', path: '/admin' },
    { icon: TrendingUp, label: 'Leads', path: '/admin/leads' },
    { icon: Users, label: 'Patients', path: '/admin/patients' },
    { icon: Shield, label: 'Trust Mgmt', path: '/admin/trust' },
    { icon: GitBranch, label: 'Referrals', path: '/admin/referrals' },
    { icon: Smartphone, label: 'Test Hub', path: '/admin/test-hub' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ],
  dentist: [
    { icon: LayoutDashboard, label: 'Overview', path: '/referral/dentist' },
  ],
  specialist: [
    { icon: LayoutDashboard, label: 'Overview', path: '/referral/specialist' },
  ],
};

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const items = navItems[role] || [];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-healthcare-bg dark:bg-dark-bg flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white dark:bg-dark-card border-r border-healthcare-border dark:border-dark-border z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-healthcare-border dark:border-dark-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="ml-3 font-heading font-bold text-lg text-healthcare-text-primary dark:text-dark-text-primary">Global<span className="gradient-text">Smile</span></span>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}` || item.path === '/referral/dentist' || item.path === '/referral/specialist'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-secondary-400 shadow-sm'
                    : 'text-healthcare-text-secondary dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-healthcare-border dark:border-dark-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-healthcare-text-muted dark:text-dark-text-muted hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-dark-card border-r border-healthcare-border dark:border-dark-border z-50 lg:hidden flex flex-col">
              <div className="h-16 flex items-center px-4 border-b border-healthcare-border dark:border-dark-border">
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
                <span className="ml-3 font-heading font-bold text-lg text-healthcare-text-primary dark:text-dark-text-primary">Global<span className="gradient-text">Smile</span></span>
              </div>
              <nav className="flex-1 py-4 px-2 space-y-1">
                {items.map((item) => (
                  <NavLink key={item.path} to={item.path} end={item.path === `/${role}`} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isActive ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-secondary-400' : 'text-healthcare-text-secondary dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface'}`}>
                    <item.icon className="w-5 h-5" /><span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-250 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-healthcare-border dark:border-dark-border sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer">
              <Menu className="w-5 h-5 text-healthcare-text-secondary dark:text-dark-text-secondary" />
            </button>
            <h1 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary capitalize">{role} Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="w-5 h-5 text-gray-500" /> : <Sun className="w-5 h-5 text-gray-400" />}
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer relative" aria-label="Notifications">
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-surface">
              <UserCircle className="w-5 h-5 text-primary-500" />
              <span className="hidden sm:inline text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary">
                {user?.firstName || 'User'}
              </span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer" aria-label="Logout">
              <LogOut className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

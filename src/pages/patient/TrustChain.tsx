import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Clock, Award, Stethoscope, Syringe, FileCheck } from 'lucide-react';

const trustItems = [
  { icon: Stethoscope, title: 'Doctor Credentials', status: 'verified', details: 'BDS, MDS Prosthodontics — 15+ years experience', badge: 'ISO 9001' },
  { icon: Syringe, title: 'Sterilization Protocol', status: 'verified', details: 'Class B autoclave sterilization, daily spore testing', badge: 'CDC Compliant' },
  { icon: Award, title: 'Clinic Accreditation', status: 'verified', details: 'NABH accredited, ADA recognized facility', badge: 'NABH' },
  { icon: FileCheck, title: 'Equipment Certification', status: 'verified', details: 'FDA-cleared digital scanners and CAD/CAM systems', badge: 'FDA Cleared' },
  { icon: Shield, title: 'Patient Data Security', status: 'verified', details: 'End-to-end encryption, HIPAA compliant storage', badge: 'HIPAA' },
];

const timeline = [
  { date: 'May 15, 2026', event: 'Sterilization log verified', type: 'sterilization' },
  { date: 'May 14, 2026', event: 'Equipment calibration completed', type: 'equipment' },
  { date: 'May 10, 2026', event: 'Monthly infection control audit passed', type: 'audit' },
  { date: 'May 01, 2026', event: 'Staff training certification renewed', type: 'training' },
  { date: 'Apr 20, 2026', event: 'NABH re-accreditation confirmed', type: 'accreditation' },
];

export default function TrustChain() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Trust Chain Dashboard</h2>
        <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Full transparency into clinic standards and safety protocols</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">Verification Status</h3>
          {trustItems.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-accent-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-healthcare-text-primary dark:text-dark-text-primary">{item.title}</span>
                  <CheckCircle2 className="w-4 h-4 text-accent-500" />
                </div>
                <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{item.details}</p>
              </div>
              <span className="trust-badge-verified">{item.badge}</span>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">Transparency Timeline</h3>
          <div className="space-y-4">
            {timeline.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-accent-400 mt-1.5" />
                  {i < timeline.length - 1 && <div className="absolute left-1.5 top-4 w-0.5 h-8 bg-accent-100 dark:bg-dark-border" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary">{t.event}</p>
                  <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{t.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

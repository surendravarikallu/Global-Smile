import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'AI Smile Visualizer', href: '#features' },
    { label: 'Tourism Calculator', href: '#savings' },
    { label: 'Trust Dashboard', href: '#trust' },
    { label: 'Referral Network', href: '#referral' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Our Team', href: '#' },
    { label: 'Certifications', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'HIPAA Compliance', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

const certBadges = ['ISO 9001:2015', 'NABH', 'ADA Recognized', 'HIPAA Compliant'];

export default function Footer() {
  return (
    <footer className="bg-[#0a1929] text-gray-300 relative overflow-hidden">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-primary" />

      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                Global<span className="text-secondary-400">Smile</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-sm leading-relaxed">
              Advanced prosthodontic care without borders. AI-powered smile visualization,
              transparent treatment journeys, and global dental tourism coordination.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400"><MapPin className="w-4 h-4 text-primary-500" /> Vijayawada, Andhra Pradesh, India</div>
              <div className="flex items-center gap-2 text-gray-400"><Phone className="w-4 h-4 text-primary-500" /> +91 866-XXX-XXXX</div>
              <div className="flex items-center gap-2 text-gray-400"><Mail className="w-4 h-4 text-primary-500" /> hello@globalsmile.health</div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-white mb-4 text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-400 hover:text-secondary-400 transition-colors duration-200 flex items-center gap-1 cursor-pointer group">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Certifications:</span>
            {certBadges.map((badge) => (
              <span key={badge} className="px-3 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full border border-gray-700">
                {badge}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Global Smile Health. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-xs text-gray-500 hover:text-secondary-400 transition-colors cursor-pointer">Doctor Portal</Link>
              <Link to="/login" className="text-xs text-gray-500 hover:text-secondary-400 transition-colors cursor-pointer">Admin Access</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
    </footer>
  );
}

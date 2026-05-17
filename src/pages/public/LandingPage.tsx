import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import GlobalPresence from './components/GlobalPresence';
import CTASection from './components/CTASection';
import ScrollToTop from '@/components/ui/ScrollToTop';

function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative h-16 md:h-24 -mt-1 ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
        <path d="M0 96L60 85.3C120 75 240 53 360 48C480 43 600 53 720 58.7C840 64 960 64 1080 56C1200 48 1320 32 1380 24L1440 16V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0Z"
          className="fill-white dark:fill-dark-bg" />
      </svg>
    </div>
  );
}

function WaveDivider({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <div className="relative h-12 md:h-20 -mt-1 overflow-hidden">
      <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
        <path d="M0 32L48 34.7C96 37 192 43 288 42.7C384 43 480 37 576 34.7C672 32 768 32 864 37.3C960 43 1056 53 1152 50.7C1248 48 1344 32 1392 24L1440 16V64H1392C1344 64 1248 64 1152 64C1056 64 960 64 864 64C768 64 672 64 576 64C480 64 384 64 288 64C192 64 96 64 48 64H0Z"
          className={variant === 'dark' ? 'fill-[#0a1929]' : 'fill-healthcare-bg dark:fill-dark-bg'} />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <SectionDivider />
      <ProblemSection />
      <WaveDivider />
      <FeaturesSection />
      <SectionDivider />
      <HowItWorks />
      <WaveDivider />
      <Testimonials />
      <WaveDivider variant="dark" />
      <GlobalPresence />
      <SectionDivider flip />
      <CTASection />
      <ScrollToTop />
    </>
  );
}

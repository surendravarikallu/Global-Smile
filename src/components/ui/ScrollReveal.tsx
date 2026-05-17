import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
  parallax?: boolean;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  parallax = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]);

  const initial: Record<string, any> = { opacity: 0 };
  const animate: Record<string, any> = { opacity: 1 };

  switch (direction) {
    case 'up': initial.y = 60; animate.y = 0; break;
    case 'down': initial.y = -60; animate.y = 0; break;
    case 'left': initial.x = 60; animate.x = 0; break;
    case 'right': initial.x = -60; animate.x = 0; break;
  }

  if (parallax) {
    return (
      <motion.div
        ref={ref}
        style={{ y: yParallax, opacity }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

interface AnimatedPageProps {
  children: React.ReactNode;
  animation?: 'slide-horizontal' | 'slide-vertical' | 'fade';
  className?: string;
}

export function AnimatedPage({
  children,
  animation = 'fade',
  className = '',
}: AnimatedPageProps) {
  const animations = {
    'slide-horizontal': {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.4 },
    },
    'slide-vertical': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.4 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.4 },
    },
  };

  const config = animations[animation];

  return (
    <motion.div
      className={className}
      initial={config.initial}
      animate={config.animate}
      exit={config.exit}
      transition={config.transition}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

interface AnimatedDashboardProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedDashboard({
  children,
  className = '',
}: AnimatedDashboardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`transition-all duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeader({
  children,
  className = '',
}: AnimatedHeaderProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { useRef } from 'react';

import { motion, useInView } from 'framer-motion';

interface AnimatedHeroProps {
  children: React.ReactNode;
}

export function AnimatedHero({ children }: AnimatedHeroProps) {
  return (
    <motion.section
      className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.section>
  );
}

interface AnimatedHeroContentProps {
  children: React.ReactNode;
}

export function AnimatedHeroContent({ children }: AnimatedHeroContentProps) {
  return (
    <motion.div
      className='text-center'
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedHeroBadgeProps {
  children: React.ReactNode;
}

export function AnimatedHeroBadge({ children }: AnimatedHeroBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedHeroTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeroTitle({
  children,
  className,
}: AnimatedHeroTitleProps) {
  return (
    <motion.h1
      className={className}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      {children}
    </motion.h1>
  );
}

interface AnimatedHeroDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeroDescription({
  children,
  className,
}: AnimatedHeroDescriptionProps) {
  return (
    <motion.p
      className={className}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      {children}
    </motion.p>
  );
}

interface AnimatedHeroButtonsProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeroButtons({
  children,
  className,
}: AnimatedHeroButtonsProps) {
  return (
    <motion.div
      className={className}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedButton({ children, className }: AnimatedButtonProps) {
  return (
    <div
      className={`transition-all duration-150 ease-out hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${className}`}
    >
      {children}
    </div>
  );
}

interface AnimatedHeroFeaturesProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeroFeatures({
  children,
  className,
}: AnimatedHeroFeaturesProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedFeatureItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedFeatureItem({
  children,
  className,
}: AnimatedFeatureItemProps) {
  return (
    <div
      className={`transition-transform duration-150 ease-out hover:scale-105 ${className}`}
    >
      {children}
    </div>
  );
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.section ref={ref} className={className}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

interface AnimatedSectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSectionHeader({
  children,
  className,
}: AnimatedSectionHeaderProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCardGrid({
  children,
  className,
}: AnimatedCardGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedCard({
  children,
  className,
  index = 0,
}: AnimatedCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
      className={`transition-all duration-150 ease-out hover:-translate-y-1 hover:scale-[1.02] ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedIconProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedIcon({ children, className }: AnimatedIconProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

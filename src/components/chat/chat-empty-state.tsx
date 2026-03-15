'use client';

import * as React from 'react';

import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

import { GlassCard } from '@/components/shared/glass-card';
import { StaggerContainer, StaggerItem } from '@/components/shared/page-transition';
import { EXAMPLE_QUERIES } from '@/lib/ai/prompts';
import { cn } from '@/lib/utils';

interface ChatEmptyStateProps {
  onSelectQuery: (query: string) => void;
  className?: string;
}

export function ChatEmptyState({ onSelectQuery, className }: ChatEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 px-4', className)}>
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='relative mb-6'
      >
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/5' />
        </div>
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
          className='relative flex items-center justify-center h-24 w-24'
        >
          <div className='flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-xl shadow-violet-500/30'>
            <Bot className='h-7 w-7' />
          </div>
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='text-center mb-6'
      >
        <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
          AI Operations Assistant
        </h3>
        <p className='mt-2 text-sm text-muted-foreground max-w-sm'>
          Ask questions about service orders, technicians, and business performance.
        </p>
      </motion.div>

      {/* Suggested queries */}
      <StaggerContainer className='w-full max-w-2xl'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {EXAMPLE_QUERIES.slice(0, 4).map((query) => (
            <StaggerItem key={query}>
              <GlassCard
                hover
                glow
                glowColor='violet'
                className='p-3 cursor-pointer'
                onClick={() => onSelectQuery(query)}
              >
                <div className='flex items-start gap-3'>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'>
                    <Sparkles className='h-4 w-4' />
                  </div>
                  <p className='text-sm text-left leading-snug'>{query}</p>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </div>
  );
}

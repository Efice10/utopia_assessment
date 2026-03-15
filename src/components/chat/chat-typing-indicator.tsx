'use client';

import * as React from 'react';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function ChatTypingIndicator() {
  return (
    <div className='flex gap-3'>
      {/* Avatar */}
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'>
        <Bot className='h-4 w-4' />
      </div>

      {/* Typing dots */}
      <div className='flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3'>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className='h-2 w-2 rounded-full bg-muted-foreground/50'
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

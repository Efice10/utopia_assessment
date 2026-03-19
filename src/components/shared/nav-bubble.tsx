'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface NavBubbleContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function NavBubbleContainer({ children, className }: NavBubbleContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const bubbleRef = React.useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = React.useState(false);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !bubbleRef.current) return;

    const container = containerRef.current;
    const bubble = bubbleRef.current;
    const rect = container.getBoundingClientRect();

    // Find the closest menu item
    const menuItems = container.querySelectorAll('[data-nav-item]');
    let closestItem: Element | null = null;
    let closestDistance = Infinity;

    menuItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenterY = itemRect.top + itemRect.height / 2;
      const distance = Math.abs(e.clientY - itemCenterY);

      if (distance < closestDistance && e.clientY >= itemRect.top && e.clientY <= itemRect.bottom) {
        closestDistance = distance;
        closestItem = item;
      }
    });

    if (closestItem) {
      const itemRect = (closestItem as Element).getBoundingClientRect();
      bubble.style.top = `${itemRect.top - rect.top}px`;
      bubble.style.left = `${itemRect.left - rect.left}px`;
      bubble.style.width = `${itemRect.width}px`;
      bubble.style.height = `${itemRect.height}px`;
      setIsActive(true);
    }
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsActive(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('nav-bubble-container relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={bubbleRef}
        className={cn('nav-bubble', isActive && 'active')}
      />
      {children}
    </div>
  );
}

// Wrapper to mark items as nav items for bubble tracking
export function NavBubbleItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-nav-item className={cn('relative z-10', className)}>
      {children}
    </div>
  );
}

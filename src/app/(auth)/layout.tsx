'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';
import { GalleryVerticalEnd } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get page-specific image and text
  const getImageConfig = () => {
    switch (pathname) {
      case '/login':
        return {
          src: '/illustrations/secure-login.svg',
          alt: 'Secure login illustration',
        };
      case '/signup':
        return {
          src: '/illustrations/signup.svg',
          alt: 'Sign up illustration',
        };
      case '/forgot-password':
        return {
          src: '/illustrations/forgot-password.svg',
          alt: 'Forgot password illustration',
        };
      default:
        return {
          src: '/illustrations/secure-login.svg',
          alt: 'Authentication illustration',
        };
    }
  };

  const imageConfig = getImageConfig();

  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <Link href='/' className='flex items-center gap-2 font-medium'>
            <motion.div
              className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <GalleryVerticalEnd className='size-4' />
            </motion.div>
            Acme Inc.
          </Link>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>{children}</div>
        </div>
      </div>
      <div className='bg-muted flex hidden items-center justify-center p-12 lg:flex'>
        <div className='relative w-full max-w-md'>
          <Image
            src={imageConfig.src}
            alt={imageConfig.alt}
            width={400}
            height={300}
            className='h-auto w-full dark:brightness-[0.8] dark:grayscale'
            priority
          />
        </div>
      </div>
    </div>
  );
}

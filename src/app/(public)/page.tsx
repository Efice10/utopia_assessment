import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Eye,
  Globe,
  Rocket,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';

import {
  AnimatedButton,
  AnimatedCard,
  AnimatedCardGrid,
  AnimatedFeatureItem,
  AnimatedHero,
  AnimatedHeroBadge,
  AnimatedHeroButtons,
  AnimatedHeroContent,
  AnimatedHeroDescription,
  AnimatedHeroFeatures,
  AnimatedHeroTitle,
  AnimatedIcon,
  AnimatedSection,
  AnimatedSectionHeader,
} from '@/components/ui/animated-landing';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Hero Section */}
      <AnimatedHero>
        <div className='bg-grid-white/[0.02] absolute inset-0 bg-[size:60px_60px]' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='h-96 w-96 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-3xl' />
        </div>
        <div className='relative container mx-auto px-4 py-24 sm:py-32'>
          <AnimatedHeroContent>
            <AnimatedHeroBadge>
              <Badge
                variant='secondary'
                className='mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200'
              >
                <Rocket className='mr-1 h-3 w-3' />
                Now in Beta - Join 10,000+ early adopters
              </Badge>
            </AnimatedHeroBadge>
            <AnimatedHeroTitle className='mb-6 text-5xl font-bold text-white sm:text-6xl lg:text-7xl'>
              Transform Your
              <span className='bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>
                {' '}
                Business
              </span>
              <br />
              with AI-Powered Analytics
            </AnimatedHeroTitle>
            <AnimatedHeroDescription className='mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-300 sm:text-2xl'>
              Unlock unprecedented insights, automate complex workflows, and
              scale your business 10x faster with our revolutionary AI platform
              trusted by industry leaders.
            </AnimatedHeroDescription>
            <AnimatedHeroButtons className='mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <AnimatedButton>
                <Button
                  asChild
                  size='lg'
                  className='h-auto bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 text-lg hover:from-purple-700 hover:to-blue-700'
                >
                  <Link href='/login'>
                    Start Free Trial
                    <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
              </AnimatedButton>
              <AnimatedButton>
                <Button
                  variant='outline'
                  size='lg'
                  className='h-auto border-gray-300 px-8 py-3 text-lg text-gray-300 hover:bg-gray-800'
                >
                  Watch Demo
                  <Eye className='ml-2 h-5 w-5' />
                </Button>
              </AnimatedButton>
            </AnimatedHeroButtons>
            <AnimatedHeroFeatures className='flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400'>
              <AnimatedFeatureItem className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-400' />
                Free 14-day trial
              </AnimatedFeatureItem>
              <AnimatedFeatureItem className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-400' />
                No credit card required
              </AnimatedFeatureItem>
              <AnimatedFeatureItem className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-400' />
                Cancel anytime
              </AnimatedFeatureItem>
            </AnimatedHeroFeatures>
          </AnimatedHeroContent>
        </div>

        {/* Hero Illustration */}
        <div className='relative container mx-auto px-4 pb-24'>
          <div className='flex justify-center'>
            <div className='relative max-w-2xl'>
              <Image
                src='/illustrations/analytics.svg'
                alt='Business analytics and data trends illustration'
                width={600}
                height={400}
                className='h-auto w-full opacity-90'
                priority
              />
            </div>
          </div>
        </div>
      </AnimatedHero>

      {/* Social Proof */}
      <section className='bg-gray-50 py-16'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <p className='mb-8 text-gray-600'>
              Trusted by 50,000+ businesses worldwide
            </p>
            <div className='flex flex-wrap items-center justify-center gap-8 opacity-60'>
              {[
                'Microsoft',
                'Google',
                'Amazon',
                'Tesla',
                'Netflix',
                'Spotify',
              ].map(company => (
                <div key={company} className='text-2xl font-bold text-gray-400'>
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <AnimatedSection className='bg-white py-24'>
        <div className='container mx-auto px-4'>
          <AnimatedSectionHeader className='mb-16 text-center'>
            <Badge variant='secondary' className='mb-4'>
              Features
            </Badge>
            <h2 className='mb-6 text-4xl font-bold text-gray-900 sm:text-5xl'>
              Everything you need to
              <span className='text-purple-600'> dominate your market</span>
            </h2>
            <p className='mx-auto max-w-2xl text-xl text-gray-600'>
              Our comprehensive suite of AI-powered tools gives you the
              competitive edge you need to stay ahead.
            </p>
          </AnimatedSectionHeader>
          <AnimatedCardGrid className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                icon: <Brain className='h-8 w-8 text-purple-600' />,
                title: 'AI-Powered Insights',
                description:
                  'Get predictive analytics and intelligent recommendations that adapt to your business patterns.',
              },
              {
                icon: <BarChart3 className='h-8 w-8 text-blue-600' />,
                title: 'Real-Time Analytics',
                description:
                  'Monitor your KPIs with live dashboards that update in real-time across all your channels.',
              },
              {
                icon: <Zap className='h-8 w-8 text-yellow-600' />,
                title: 'Lightning Fast',
                description:
                  'Process millions of data points in seconds with our optimized cloud infrastructure.',
              },
              {
                icon: <Shield className='h-8 w-8 text-green-600' />,
                title: 'Enterprise Security',
                description:
                  'Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards.',
              },
              {
                icon: <Users className='h-8 w-8 text-orange-600' />,
                title: 'Team Collaboration',
                description:
                  'Share insights, create custom reports, and collaborate seamlessly across departments.',
              },
              {
                icon: <Globe className='h-8 w-8 text-indigo-600' />,
                title: 'Global Scale',
                description:
                  'Built on AWS with 99.99% uptime guarantee and global CDN for instant access anywhere.',
              },
            ].map((feature, index) => (
              <AnimatedCard key={index} index={index}>
                <Card className='h-full border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                  <CardHeader>
                    <AnimatedIcon className='mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gray-50'>
                      {feature.icon}
                    </AnimatedIcon>
                    <CardTitle className='mb-2 text-xl'>
                      {feature.title}
                    </CardTitle>
                    <CardDescription className='leading-relaxed text-gray-600'>
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            ))}
          </AnimatedCardGrid>
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <section className='bg-gray-50 py-24'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <Badge variant='secondary' className='mb-4'>
              Pricing
            </Badge>
            <h2 className='mb-6 text-4xl font-bold text-gray-900 sm:text-5xl'>
              Simple, transparent pricing
            </h2>
            <p className='text-xl text-gray-600'>
              Choose the plan that fits your needs. Upgrade or downgrade at any
              time.
            </p>
          </div>
          <div className='mx-auto grid max-w-5xl gap-8 md:grid-cols-3'>
            {[
              {
                name: 'Starter',
                price: '$29',
                description: 'Perfect for small teams getting started',
                features: [
                  'Up to 5 team members',
                  '10,000 data points/month',
                  'Basic analytics',
                  'Email support',
                  'Standard integrations',
                ],
                popular: false,
              },
              {
                name: 'Professional',
                price: '$99',
                description: 'Best for growing businesses',
                features: [
                  'Up to 25 team members',
                  '100,000 data points/month',
                  'Advanced AI insights',
                  'Priority support',
                  'All integrations',
                  'Custom dashboards',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: [
                  'Unlimited team members',
                  'Unlimited data points',
                  'White-label solution',
                  '24/7 phone support',
                  'Custom integrations',
                  'Dedicated success manager',
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'scale-105 shadow-xl ring-2 ring-purple-600' : 'shadow-lg'}`}
              >
                {plan.popular && (
                  <Badge className='absolute -top-3 left-1/2 -translate-x-1/2 transform bg-purple-600 hover:bg-purple-700'>
                    Most Popular
                  </Badge>
                )}
                <CardHeader className='text-center'>
                  <CardTitle className='text-2xl'>{plan.name}</CardTitle>
                  <div className='mt-4'>
                    <span className='text-4xl font-bold'>{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className='text-gray-600'>/month</span>
                    )}
                  </div>
                  <CardDescription className='mt-2'>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    className={`mb-6 w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <Link href={plan.price === 'Custom' ? '#' : '/login'}>
                      {plan.price === 'Custom'
                        ? 'Contact Sales'
                        : 'Start Free Trial'}
                    </Link>
                  </Button>
                  <ul className='space-y-3'>
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className='flex items-center gap-3'
                      >
                        <CheckCircle className='h-4 w-4 flex-shrink-0 text-green-600' />
                        <span className='text-sm'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='bg-white py-24'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <Badge variant='secondary' className='mb-4'>
              Testimonials
            </Badge>
            <h2 className='mb-6 text-4xl font-bold text-gray-900 sm:text-5xl'>
              Loved by thousands of businesses
            </h2>
            <p className='text-xl text-gray-600'>
              See why companies choose our platform to transform their
              operations.
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-3'>
            {[
              {
                quote:
                  'This platform has completely revolutionized how we analyze customer data. Our conversion rates increased by 150% in just 3 months!',
                author: 'Sarah Chen',
                title: 'CEO, TechFlow',
                avatar: 'SC',
                rating: 5,
              },
              {
                quote:
                  "The AI insights helped us identify market trends before our competitors. We've gained a significant competitive advantage.",
                author: 'Michael Rodriguez',
                title: 'CMO, GrowthLabs',
                avatar: 'MR',
                rating: 5,
              },
              {
                quote:
                  'Implementation was seamless and the support team is outstanding. ROI was positive within the first month!',
                author: 'Emily Johnson',
                title: 'VP Operations, ScaleUp Inc',
                avatar: 'EJ',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className='border-0 shadow-lg'>
                <CardContent className='p-6'>
                  <div className='mb-4 flex'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className='h-4 w-4 fill-current text-yellow-400'
                      />
                    ))}
                  </div>
                  <blockquote className='mb-6 text-gray-700 italic'>
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarFallback className='bg-purple-100 text-purple-700'>
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        {testimonial.author}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {testimonial.title}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='bg-gradient-to-r from-purple-600 to-blue-600 py-24'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='mb-6 text-4xl font-bold text-white sm:text-5xl'>
            Ready to transform your business?
          </h2>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-purple-100'>
            Join thousands of companies already using our platform to drive
            growth and innovation.
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Button
              asChild
              size='lg'
              variant='secondary'
              className='h-auto bg-white px-8 py-3 text-lg text-purple-600 hover:bg-gray-100'
            >
              <Link href='/login'>
                Start Free Trial
                <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='h-auto border-white px-8 py-3 text-lg text-white hover:bg-white hover:text-purple-600'
            >
              Schedule Demo
            </Button>
          </div>
          <p className='mt-4 text-sm text-purple-200'>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 py-16 text-white'>
        <div className='container mx-auto px-4'>
          <div className='grid gap-8 md:grid-cols-4'>
            <div>
              <h3 className='mb-4 text-xl font-bold'>Sejuk-Sejuk</h3>
              <p className='mb-4 text-gray-400'>
                Empowering businesses with AI-powered analytics and insights.
              </p>
              <div className='flex space-x-4'>
                <Badge variant='secondary'>SOC 2 Certified</Badge>
                <Badge variant='secondary'>GDPR Compliant</Badge>
              </div>
            </div>
            <div>
              <h4 className='mb-4 font-semibold'>Product</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='mb-4 font-semibold'>Company</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    About
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='mb-4 font-semibold'>Support</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Status
                  </Link>
                </li>
                <li>
                  <Link href='#' className='transition-colors hover:text-white'>
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className='my-8 bg-gray-800' />
          <div className='flex flex-col items-center justify-between md:flex-row'>
            <p className='text-sm text-gray-400'>
              © 2025 Sejuk-Sejuk. All rights reserved.
            </p>
            <div className='mt-4 flex space-x-6 text-sm text-gray-400 md:mt-0'>
              <Link href='#' className='transition-colors hover:text-white'>
                Privacy Policy
              </Link>
              <Link href='#' className='transition-colors hover:text-white'>
                Terms of Service
              </Link>
              <Link href='#' className='transition-colors hover:text-white'>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

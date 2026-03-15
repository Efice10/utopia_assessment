'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Globe,
  Key,
  Palette,
  Settings,
  Shield,
  User,
  Users,
  Webhook,
} from 'lucide-react';

import { PageHeader, PageTransition } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Settings categories
const settingsCategories = [
  {
    title: 'Account',
    description: 'Manage your personal account settings',
    items: [
      {
        id: 'profile',
        title: 'Profile',
        description: 'Your name, avatar, and personal info',
        icon: User,
        href: '/dashboard/settings/profile',
      },
      {
        id: 'security',
        title: 'Security',
        description: 'Password, 2FA, and login settings',
        icon: Shield,
        href: '/dashboard/settings/security',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Email and push notification preferences',
        icon: Bell,
        href: '/dashboard/settings/notifications',
      },
    ],
  },
  {
    title: 'Workspace',
    description: 'Configure your workspace and team settings',
    items: [
      {
        id: 'team',
        title: 'Team Settings',
        description: 'Manage team members and roles',
        icon: Users,
        href: '/dashboard/settings/team',
        badge: '5 members',
      },
      {
        id: 'integrations',
        title: 'Integrations',
        description: 'Connect third-party services',
        icon: Webhook,
        href: '/dashboard/settings/integrations',
        badge: '2 active',
      },
      {
        id: 'api',
        title: 'API Keys',
        description: 'Manage API access tokens',
        icon: Key,
        href: '/dashboard/settings/api',
      },
    ],
  },
];

// Quick settings cards
const quickSettings = [
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Theme, colors, layout',
    icon: Palette,
    href: '/dashboard/settings/appearance',
    color: 'violet',
  },
  {
    id: 'language',
    title: 'Language',
    description: 'Localization settings',
    icon: Globe,
    href: '/dashboard/settings/language',
    color: 'blue',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Data and visibility',
    icon: Shield,
    href: '/dashboard/settings/privacy',
    color: 'emerald',
  },
];

export default function SettingsPage() {
  return (
    <PageTransition>
      <motion.div
        className="space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={item}>
          <PageHeader
            title="Settings"
            description="Manage your account settings and preferences"
          />
        </motion.div>

        {/* Featured: General Settings */}
        <motion.div variants={item}>
          <Link href="/dashboard/settings/general">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-white shadow-xl cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.01]">
              <div className="absolute inset-0 bg-grid-white/5 opacity-50" />
              <CardContent className="relative p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">General Settings</h2>
                        <Badge className="bg-emerald-500 text-white">Quick Setup</Badge>
                      </div>
                      <p className="text-slate-300">
                        Configure your account, preferences, and workspace settings all in one place
                      </p>
                    </div>
                  </div>
                  <Button className="bg-white text-slate-700 hover:bg-slate-100 shadow-lg">
                    Open Settings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Quick Settings Cards */}
        <motion.div variants={item}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Quick Settings</h2>
            <p className="text-sm text-muted-foreground">Frequently accessed settings</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickSettings.map((setting) => (
              <Link key={setting.id} href={setting.href}>
                <Card className="group h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-lg bg-${setting.color}-500/10 p-2`}>
                        <setting.icon className={`h-5 w-5 text-${setting.color}-600`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{setting.title}</h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Settings Categories */}
        <div className="space-y-8">
          {settingsCategories.map((category) => (
            <motion.div key={category.title} variants={item}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((settingItem) => (
                  <Link key={settingItem.id} href={settingItem.href}>
                    <Card className="group h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <settingItem.icon className="h-5 w-5 text-primary" />
                          </div>
                          {settingItem.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {settingItem.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{settingItem.title}</h3>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {settingItem.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Configuration Status */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration Status</CardTitle>
              <CardDescription>
                Overview of your account configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Profile</p>
                    <p className="text-xs text-emerald-600">Complete</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Security</p>
                    <p className="text-xs text-emerald-600">Configured</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="rounded-full bg-amber-500/20 p-2">
                    <Users className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Team</p>
                    <p className="text-xs text-amber-600">Needs Review</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="rounded-full bg-gray-500/20 p-2">
                    <Webhook className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Integrations</p>
                    <p className="text-xs text-muted-foreground">Not configured</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}

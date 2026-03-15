'use client';

import { useState } from 'react';

import {
  AnimatedSettingsCard,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'available' | 'coming-soon';
  category: string;
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions',
    icon: '💳',
    status: 'connected',
    category: 'Payments',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications in your Slack workspace',
    icon: '💬',
    status: 'connected',
    category: 'Communication',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect your repositories for seamless integration',
    icon: '🐙',
    status: 'available',
    category: 'Development',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync issues and track project progress',
    icon: '📋',
    status: 'available',
    category: 'Project Management',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect your Notion workspace',
    icon: '📝',
    status: 'available',
    category: 'Documentation',
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Import designs and prototypes',
    icon: '🎨',
    status: 'coming-soon',
    category: 'Design',
  },
];

const categories = ['All', 'Payments', 'Communication', 'Development', 'Project Management', 'Documentation', 'Design'];

export function IntegrationsSettings() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIntegrations = selectedCategory === 'All'
    ? integrations
    : integrations.filter((i) => i.category === selectedCategory);

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-6">
      <AnimatedSettingsCard>
        <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground">
          Connect third-party services to enhance your workflow.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Connected Summary */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Connected Services</h3>
              <p className="text-muted-foreground text-sm">
                {connectedCount} of {integrations.filter((i) => i.status !== 'coming-soon').length} available integrations connected
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600">
              {connectedCount} Active
            </Badge>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Category Filter */}
      <AnimatedSettingsSection delay={0.15}>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </AnimatedSettingsSection>

      {/* Integrations Grid */}
      <AnimatedSettingsSection delay={0.2}>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{integration.name}</span>
                    {integration.status === 'connected' && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">
                        Connected
                      </Badge>
                    )}
                    {integration.status === 'coming-soon' && (
                      <Badge variant="outline" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {integration.description}
                  </p>
                  <p className="text-muted-foreground/70 text-xs mt-1">
                    {integration.category}
                  </p>
                </div>
              </div>
              <Button
                variant={integration.status === 'connected' ? 'outline' : 'default'}
                size="sm"
                disabled={integration.status === 'coming-soon'}
              >
                {integration.status === 'connected' && 'Disconnect'}
                {integration.status === 'available' && 'Connect'}
                {integration.status === 'coming-soon' && 'Coming Soon'}
              </Button>
            </div>
          ))}
        </div>
      </AnimatedSettingsSection>

      {/* API Documentation Link */}
      <AnimatedSettingsSection delay={0.3}>
        <AnimatedSettingsCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Need a custom integration?</h3>
              <p className="text-muted-foreground text-sm">
                Build your own integration using our API
              </p>
            </div>
            <Button variant="outline">View Documentation</Button>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>
    </div>
  );
}

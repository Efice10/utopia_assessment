'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Key,
  Plus,
  Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  AnimatedSettingsCard,
  AnimatedSettingsForm,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const createKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
});

type CreateKeyFormData = z.infer<typeof createKeySchema>;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk_live_****************************a1b2c3',
    createdAt: '2024-01-15',
    lastUsed: '2 hours ago',
  },
  {
    id: '2',
    name: 'Development Key',
    key: 'sk_test_****************************x9y8z7',
    createdAt: '2024-02-20',
    lastUsed: '1 day ago',
  },
];

export function ApiSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateKeyFormData>({
    resolver: zodResolver(createKeySchema),
  });

  const onSubmit = async (data: CreateKeyFormData) => {
    try {
      // TODO: Implement API call to create key
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: data.name,
        key: `sk_live_${Math.random().toString(36).substring(2, 15)}...`,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: null,
      };
      setApiKeys([...apiKeys, newKey]);
      setShowNewKey(newKey.id);
      reset();
    } catch {
      throw new Error('Failed to create API key');
    }
  };

  const handleDeleteKey = (keyId: string) => {
    // TODO: Implement API call to delete key
    setApiKeys(apiKeys.filter((k) => k.id !== keyId));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  return (
    <div className="space-y-6">
      <AnimatedSettingsCard>
        <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
        <p className="text-muted-foreground">
          Manage API keys for programmatic access to your account.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Create New Key */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Create New API Key</h3>
          <p className="text-muted-foreground text-sm">
            Generate a new API key for your applications.
          </p>
          <AnimatedSettingsForm
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 flex gap-2"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor="name" className="sr-only">
                Key Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Production, Development, Testing"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Key'}
            </Button>
          </AnimatedSettingsForm>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Security Warning */}
      <AnimatedSettingsSection delay={0.15}>
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-600">Security Notice</p>
            <p className="text-muted-foreground text-sm">
              API keys provide full access to your account. Never share them publicly or commit them to version control.
            </p>
          </div>
        </div>
      </AnimatedSettingsSection>

      {/* Existing Keys */}
      <AnimatedSettingsSection delay={0.2}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Your API Keys</h3>
          <p className="text-muted-foreground text-sm">
            {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} configured
          </p>

          <div className="mt-4 space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{apiKey.name}</span>
                      {showNewKey === apiKey.id && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-muted-foreground text-sm font-mono">
                        {visibleKeys.has(apiKey.id)
                          ? apiKey.key.replace(/\*+/g, 'abcd1234efgh5678')
                          : apiKey.key}
                      </code>
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Created: {apiKey.createdAt}
                      {apiKey.lastUsed && ` • Last used: ${apiKey.lastUsed}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyKey(apiKey.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {apiKeys.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Key className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 font-medium">No API keys yet</p>
                <p className="text-muted-foreground text-sm">
                  Create your first API key above to get started.
                </p>
              </div>
            )}
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>
    </div>
  );
}

'use client';

import { useState } from 'react';

import { Check, Monitor, Moon, Sun } from 'lucide-react';

import {
  AnimatedSettingsCard,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Theme = 'light' | 'dark' | 'system';

interface ColorOption {
  name: string;
  value: string;
  color: string;
}

const colorOptions: ColorOption[] = [
  { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
  { name: 'Violet', value: 'violet', color: 'bg-violet-500' },
  { name: 'Emerald', value: 'emerald', color: 'bg-emerald-500' },
  { name: 'Rose', value: 'rose', color: 'bg-rose-500' },
  { name: 'Amber', value: 'amber', color: 'bg-amber-500' },
  { name: 'Slate', value: 'slate', color: 'bg-slate-500' },
];

export function AppearanceSettings() {
  const [theme, setTheme] = useState<Theme>('system');
  const [accentColor, setAccentColor] = useState('blue');
  const [compactMode, setCompactMode] = useState(false);

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <AnimatedSettingsCard>
        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
        <p className="text-muted-foreground">
          Customize how the application looks and feels.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Theme Selection */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Theme</h3>
          <p className="text-muted-foreground text-sm">
            Select your preferred color theme.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  theme === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-muted-foreground/20'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    theme === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <t.icon className="h-6 w-6" />
                </div>
                <span className="font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Accent Color */}
      <AnimatedSettingsSection delay={0.2}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Accent Color</h3>
          <p className="text-muted-foreground text-sm">
            Choose the primary accent color for the interface.
          </p>
          <div className="mt-4 grid grid-cols-6 gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setAccentColor(color.value)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full ${color.color} transition-transform hover:scale-110`}
              >
                {accentColor === color.value && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            Selected: <span className="font-medium capitalize">{accentColor}</span>
          </p>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Layout Options */}
      <AnimatedSettingsSection delay={0.3}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Layout</h3>
          <p className="text-muted-foreground text-sm">
            Adjust the layout density and spacing.
          </p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-muted-foreground text-sm">
                  Reduce spacing for a more compact view.
                </p>
              </div>
              <button
                type="button"
                id="compact-mode"
                role="switch"
                aria-checked={compactMode}
                onClick={() => setCompactMode(!compactMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  compactMode ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Preview */}
      <AnimatedSettingsSection delay={0.4}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Preview</h3>
          <p className="text-muted-foreground text-sm">
            See how your changes will look.
          </p>
          <div className="mt-4 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${colorOptions.find((c) => c.value === accentColor)?.color}`} />
              <div>
                <p className="font-medium">Sample Element</p>
                <p className="text-muted-foreground text-sm">
                  This is how your accent color will appear.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Save Button */}
      <AnimatedSettingsSection delay={0.5}>
        <Button>Save Preferences</Button>
      </AnimatedSettingsSection>
    </div>
  );
}

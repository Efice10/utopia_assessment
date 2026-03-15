'use client';

import { useState } from 'react';

import { Check, Globe } from 'lucide-react';

import {
  AnimatedSettingsCard,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
];

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
];

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
];

export function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [selectedDateFormat, setSelectedDateFormat] = useState('MM/DD/YYYY');

  return (
    <div className="space-y-6">
      <AnimatedSettingsCard>
        <h2 className="text-2xl font-bold tracking-tight">Language & Region</h2>
        <p className="text-muted-foreground">
          Configure your language and regional preferences.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Language Selection */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Display Language</h3>
          <p className="text-muted-foreground text-sm">
            Choose your preferred language for the interface.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {languages.slice(0, 6).map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => setSelectedLanguage(language.code)}
                className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                  selectedLanguage === language.code
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{language.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{language.name}</p>
                    <p className="text-muted-foreground text-sm">{language.nativeName}</p>
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* More Languages Dropdown */}
          <div className="mt-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full md:w-[300px]">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.flag} {language.name} ({language.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Timezone */}
      <AnimatedSettingsSection delay={0.2}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Timezone</h3>
          <p className="text-muted-foreground text-sm">
            Set your local timezone for accurate date and time display.
          </p>
          <div className="mt-4">
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Date Format */}
      <AnimatedSettingsSection delay={0.3}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Date Format</h3>
          <p className="text-muted-foreground text-sm">
            Choose how dates are displayed throughout the application.
          </p>
          <div className="mt-4 space-y-2">
            {dateFormats.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => setSelectedDateFormat(format.value)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all ${
                  selectedDateFormat === format.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/20'
                }`}
              >
                <span>{format.label}</span>
                {selectedDateFormat === format.value && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Save Button */}
      <AnimatedSettingsSection delay={0.4}>
        <Button>Save Preferences</Button>
      </AnimatedSettingsSection>
    </div>
  );
}

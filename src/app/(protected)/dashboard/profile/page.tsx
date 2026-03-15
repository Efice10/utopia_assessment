import { ProfileSettings } from '@/components/settings/profile-settings';

export default function ProfilePage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Profile</h1>
        <p className='text-muted-foreground'>
          Manage your profile information and preferences.
        </p>
      </div>
      <ProfileSettings />
    </div>
  );
}

'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Crown,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserMinus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  AnimatedSettingsCard,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  status: 'active' | 'pending';
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'member',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'member',
    status: 'active',
  },
];

const getRoleBadge = (role: TeamMember['role']) => {
  switch (role) {
    case 'owner':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
          <Crown className="mr-1 h-3 w-3" />
          Owner
        </Badge>
      );
    case 'admin':
      return (
        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
          <Shield className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          Member
        </Badge>
      );
  }
};

export function TeamSettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onInviteSubmit = async (data: InviteFormData) => {
    try {
      // TODO: Implement API call to invite team member
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reset();
    } catch {
      throw new Error('Failed to send invitation');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Implement remove member functionality
  };

  const handleChangeRole = (memberId: string, newRole: string) => {
    // TODO: Implement change role functionality
  };

  return (
    <div className="space-y-6">
      <AnimatedSettingsCard>
        <h2 className="text-2xl font-bold tracking-tight">Team Settings</h2>
        <p className="text-muted-foreground">
          Manage your team members and their roles.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Invite Member */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Invite Team Member</h3>
          <p className="text-muted-foreground text-sm">
            Send an invitation to add a new member to your team.
          </p>
          <form
            onSubmit={handleSubmit(onInviteSubmit)}
            className="mt-4 flex gap-2"
          >
            <div className="flex-1 space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter email address"
                  className="pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Team Members List */}
      <AnimatedSettingsSection delay={0.2}>
        <AnimatedSettingsCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Team Members</h3>
              <p className="text-muted-foreground text-sm">
                {teamMembers.length} members in your team
              </p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      {getRoleBadge(member.role)}
                      {member.status === 'pending' && (
                        <Badge variant="outline" className="text-amber-600">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {member.email}
                    </p>
                  </div>
                </div>

                {member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleChangeRole(member.id, 'admin')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChangeRole(member.id, 'member')}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>
    </div>
  );
}

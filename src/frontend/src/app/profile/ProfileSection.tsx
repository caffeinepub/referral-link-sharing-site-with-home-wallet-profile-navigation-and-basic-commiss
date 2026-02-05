import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, User as UserIcon } from 'lucide-react';
import { useUserProfile, useSaveUserProfile } from './useUserProfile';
import { useAuth } from '../auth/useAuth';
import SignOutButton from '../auth/SignOutButton';
import { toast } from 'sonner';

export default function ProfileSection() {
  const { principalString } = useAuth();
  const { data: profile, isLoading, isFetched } = useUserProfile();
  const saveMutation = useSaveUserProfile();

  const [name, setName] = useState('');
  const [upi, setUpi] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setUpi(profile.upi);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        name: name.trim(),
        upi: upi.trim(),
      });
      toast.success('Profile saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    }
  };

  const showProfileSetup = isFetched && profile === null;

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Principal ID</Label>
            <div className="p-3 bg-muted rounded-lg text-sm font-mono break-all">
              {principalString}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle>{showProfileSetup ? 'Setup Your Profile' : 'Edit Profile'}</CardTitle>
          <CardDescription>
            {showProfileSetup
              ? 'Please complete your profile to get started'
              : 'Update your personal information and payment details'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upi">UPI ID</Label>
                <Input
                  id="upi"
                  placeholder="yourname@upi"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Required for receiving payouts
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}

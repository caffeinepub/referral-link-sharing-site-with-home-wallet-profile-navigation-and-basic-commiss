import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Shield } from 'lucide-react';
import { useListAllowedUsers, useAddAllowedUser, useRemoveAllowedUser } from './useAllowlist';
import { validatePrincipal } from '../../utils/validatePrincipal';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AllowlistPanel() {
  const { data: allowedUsers, isLoading } = useListAllowedUsers();
  const addMutation = useAddAllowedUser();
  const removeMutation = useRemoveAllowedUser();
  const [newPrincipal, setNewPrincipal] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleAdd = async () => {
    const validation = validatePrincipal(newPrincipal);
    
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid Principal ID');
      return;
    }

    setValidationError('');

    try {
      await addMutation.mutateAsync(validation.normalized!);
      toast.success('User added to allowlist successfully');
      setNewPrincipal('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add user to allowlist');
    }
  };

  const handleRemove = async (principalString: string) => {
    try {
      await removeMutation.mutateAsync(principalString);
      toast.success('User removed from allowlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove user from allowlist');
    }
  };

  const handleInputChange = (value: string) => {
    setNewPrincipal(value);
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Allowlist Management
        </CardTitle>
        <CardDescription>
          Manage which users can access the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new user */}
        <div className="space-y-3">
          <Label htmlFor="principal">Add User to Allowlist</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="principal"
                placeholder="Enter Principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                value={newPrincipal}
                onChange={(e) => handleInputChange(e.target.value)}
                className={validationError ? 'border-destructive' : ''}
              />
              {validationError && (
                <p className="text-xs text-destructive mt-1">{validationError}</p>
              )}
            </div>
            <Button
              onClick={handleAdd}
              disabled={addMutation.isPending || !newPrincipal.trim()}
            >
              {addMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Users on the allowlist can access all features of the application
          </p>
        </div>

        {/* List of allowed users */}
        <div className="space-y-3">
          <Label>Allowed Users ({allowedUsers?.length || 0})</Label>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : allowedUsers && allowedUsers.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {allowedUsers.map((user) => {
                const principalString = user.principal.toText();
                return (
                  <div
                    key={principalString}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono break-all">{principalString}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove User from Allowlist</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this user from the allowlist? They will no longer be able to access the application.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemove(principalString)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No users in the allowlist yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

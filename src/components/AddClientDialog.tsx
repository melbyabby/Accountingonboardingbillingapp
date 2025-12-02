import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded: () => void;
  accessToken: string;
}

export function AddClientDialog({
  open,
  onOpenChange,
  onClientAdded,
  accessToken,
}: AddClientDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'individual' | 'business' | 'trust' | 'nonprofit'>(
    'individual'
  );
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://tcmmddpcihkohnytxmeh.supabase.co/functions/v1/make-server-657f9657/clients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name,
            type,
            assignedTo,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Error adding client:', result.error);
        toast.error(result.error || 'Failed to add client');
        setLoading(false);
        return;
      }

      toast.success('Client added successfully!');
      
      // Reset form
      setName('');
      setType('individual');
      setAssignedTo('');
      
      onClientAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Manual Client</DialogTitle>
            <DialogDescription>
              Add a new client manually to the system. They can be assigned to a team member
              for onboarding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
              <Input
                id="client-name"
                placeholder="John Doe or Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-type">Client Type *</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)} required>
                <SelectTrigger id="client-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="nonprofit">Nonprofit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned-to">Assigned To *</Label>
              <Input
                id="assigned-to"
                placeholder="Team member name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

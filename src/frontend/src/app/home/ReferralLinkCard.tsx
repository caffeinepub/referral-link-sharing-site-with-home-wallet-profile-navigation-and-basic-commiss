import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { ReferralLink } from '../../backend';
import { buildShareUrl } from '../utils/shareUrl';
import { copyToClipboard } from '../utils/clipboard';
import { formatTimestamp } from '../utils/format';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';

interface ReferralLinkCardProps {
  link: ReferralLink;
}

export default function ReferralLinkCard({ link }: ReferralLinkCardProps) {
  const { principalString } = useAuth();
  const shareUrl = buildShareUrl(principalString, link.title);

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{link.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{link.destinationUrl}</p>
            </div>
            <a
              href={link.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {link.commission !== undefined && link.commission !== null && (
            <div className="text-sm">
              <span className="text-muted-foreground">Commission: </span>
              <span className="font-medium">{link.commission.toString()}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created {formatTimestamp(link.created)}
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border border-border truncate"
              />
              <Button onClick={handleCopy} size="sm" variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

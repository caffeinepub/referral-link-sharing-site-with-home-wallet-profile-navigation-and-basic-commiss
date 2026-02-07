import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronRight, ListChecks, Search } from 'lucide-react';
import { useReferralLinks } from './useReferralLinks';
import ReferralLinkCard from './ReferralLinkCard';
import { useIsAdmin } from '../auth/useIsAdmin';
import { useAuth } from '../auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useSectionRouter } from '../navigation/useSectionRouter';
import UploadReferralLinkPanel from './UploadReferralLinkPanel';

export default function HomeSection() {
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAuthenticated } = useAuth();
  const { data: links, isLoading } = useReferralLinks();
  const { data: isAdmin, isLoading: isAdminLoading, isFetched: isAdminFetched } = useIsAdmin();
  const { navigateToSection } = useSectionRouter();

  // Filter links based on search query
  const filteredLinks = links?.filter((link) => {
    const query = searchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.destinationUrl.toLowerCase().includes(query)
    );
  });

  // Show limited ongoing links or all links based on toggle
  const displayedLinks = showAllLinks ? filteredLinks : filteredLinks?.slice(0, 5);

  const hasLinks = links && links.length > 0;
  const hasFilteredResults = filteredLinks && filteredLinks.length > 0;
  const isSearching = searchQuery.trim() !== '';

  // Admin-only UI should only show when authenticated AND admin
  const showAdminUI = isAuthenticated && isAdmin;

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Ongoing Tasks Section */}
      <div className="pt-4 space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ongoing Tasks</h1>
          <p className="text-muted-foreground">Your active referral links in progress</p>
        </div>

        {/* Search input */}
        {hasLinks && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search referral links"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Links list */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !hasLinks ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No referral links yet. {showAdminUI ? 'Upload your first one below!' : 'Contact the owner to create links.'}
            </CardContent>
          </Card>
        ) : !hasFilteredResults && isSearching ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No referral links match your search query. Try a different search term.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayedLinks?.map((link, index) => (
              <ReferralLinkCard key={index} link={link} />
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        {/* See all referral links */}
        {hasLinks && hasFilteredResults && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowAllLinks(!showAllLinks)}
            >
              <span>{showAllLinks ? 'Show less' : 'See all referral links'}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllLinks ? 'rotate-90' : ''}`} />
            </Button>

            {/* Admin-only upload button - shown under "See all referral links" */}
            {isAdminLoading && !isAdminFetched ? (
              <Skeleton className="h-10 w-full" />
            ) : showAdminUI ? (
              <Button
                variant="default"
                className="w-full"
                onClick={() => setShowUploadPanel(true)}
              >
                Upload Referral Link
              </Button>
            ) : null}
          </div>
        )}

        {/* Tasks navigation */}
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => navigateToSection('tasks')}
        >
          <span>Tasks</span>
          <ListChecks className="w-4 h-4" />
        </Button>
      </div>

      {/* Upload panel dialog */}
      {showAdminUI && (
        <UploadReferralLinkPanel
          open={showUploadPanel}
          onOpenChange={setShowUploadPanel}
        />
      )}
    </div>
  );
}

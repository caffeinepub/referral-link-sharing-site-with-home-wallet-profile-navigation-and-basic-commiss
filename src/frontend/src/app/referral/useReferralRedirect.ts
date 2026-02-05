import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { parseShareParams } from '../utils/parseShareParams';
import { Principal } from '@dfinity/principal';

export function useReferralRedirect() {
  const { actor } = useActor();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processReferral() {
      try {
        const params = parseShareParams();
        if (!params) {
          setError('Invalid referral parameters');
          setStatus('error');
          return;
        }

        if (!actor) {
          setError('System not ready');
          setStatus('error');
          return;
        }

        // Track the click
        const userPrincipal = Principal.fromText(params.user);
        await actor.trackReferralClick(userPrincipal, params.linkTitle);

        // Get the referral links to find destination
        const links = await actor.getReferralLinks();
        const link = links.find((l) => l.title === params.linkTitle);

        if (!link) {
          setError('Referral link not found');
          setStatus('error');
          return;
        }

        setDestinationUrl(link.destinationUrl);
        setStatus('success');
      } catch (err: any) {
        console.error('Referral redirect error:', err);
        setError(err.message || 'Failed to process referral');
        setStatus('error');
      }
    }

    if (actor) {
      processReferral();
    }
  }, [actor]);

  return { status, destinationUrl, error };
}

export interface WalletEvent {
  type: 'earned' | 'payout';
  amount: number;
  timestamp: number;
  status?: string;
}

const STORAGE_KEY_PREFIX = 'wallet_events_';

export function getWalletEvents(principal: string): WalletEvent[] {
  try {
    const key = STORAGE_KEY_PREFIX + principal;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load wallet events:', error);
    return [];
  }
}

export function addWalletEvent(principal: string, event: WalletEvent): void {
  try {
    const key = STORAGE_KEY_PREFIX + principal;
    const events = getWalletEvents(principal);
    events.unshift(event); // Add to beginning
    localStorage.setItem(key, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save wallet event:', error);
  }
}

export function clearWalletEvents(principal: string): void {
  try {
    const key = STORAGE_KEY_PREFIX + principal;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear wallet events:', error);
  }
}

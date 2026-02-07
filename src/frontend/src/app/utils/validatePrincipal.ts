import { Principal } from '@dfinity/principal';

export function validatePrincipal(principalString: string): { valid: boolean; error?: string; normalized?: string } {
  const trimmed = principalString.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Principal ID cannot be empty' };
  }

  try {
    const principal = Principal.fromText(trimmed);
    return { valid: true, normalized: principal.toText() };
  } catch (error) {
    return { valid: false, error: 'Invalid Principal ID format' };
  }
}

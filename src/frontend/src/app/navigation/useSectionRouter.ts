import { useState, useEffect } from 'react';

export function useSectionRouter() {
  const [currentSection, setCurrentSection] = useState<string>('home');

  useEffect(() => {
    // Parse hash on mount
    const parseHash = () => {
      const hash = window.location.hash.slice(1); // Remove #
      const section = hash.split('?')[0] || 'home';
      setCurrentSection(section);
    };

    parseHash();

    // Listen for hash changes
    const handleHashChange = () => {
      parseHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToSection = (section: string) => {
    window.location.hash = section;
  };

  return { currentSection, navigateToSection };
}

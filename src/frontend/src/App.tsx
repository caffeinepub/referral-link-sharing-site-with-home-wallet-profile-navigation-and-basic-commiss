import { useState, useEffect } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import BottomNavLayout from './app/layout/BottomNavLayout';
import HomeSection from './app/home/HomeSection';
import WalletSection from './app/wallet/WalletSection';
import ProfileSection from './app/profile/ProfileSection';
import TasksSection from './app/tasks/TasksSection';
import ReferralRedirect from './app/referral/ReferralRedirect';
import AuthGate from './app/auth/AuthGate';
import { useSectionRouter } from './app/navigation/useSectionRouter';

export default function App() {
  const { currentSection, navigateToSection } = useSectionRouter();

  // Check if we're on a referral redirect route
  const isReferralRedirect = currentSection.startsWith('r/');

  if (isReferralRedirect) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ReferralRedirect />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BottomNavLayout currentSection={currentSection} onNavigate={navigateToSection}>
        {currentSection === 'home' && (
          <AuthGate>
            <HomeSection />
          </AuthGate>
        )}
        {currentSection === 'tasks' && (
          <AuthGate>
            <TasksSection />
          </AuthGate>
        )}
        {currentSection === 'wallet' && (
          <AuthGate>
            <WalletSection />
          </AuthGate>
        )}
        {currentSection === 'profile' && (
          <AuthGate>
            <ProfileSection />
          </AuthGate>
        )}
      </BottomNavLayout>
      <Toaster />
    </ThemeProvider>
  );
}

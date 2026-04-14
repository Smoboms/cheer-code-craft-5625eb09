import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/app/LoginPage';
import { OnboardingPage } from '@/pages/app/OnboardingPage';
import { ProfilePage } from '@/pages/app/ProfilePage';
import { PremiumHeader } from '@/components/app/PremiumHeader';
import { PremiumBottomNav, TabType } from '@/components/app/PremiumBottomNav';
import { NetworkPage } from '@/pages/app/NetworkPage';
import { BenefitsPage } from '@/pages/app/BenefitsPage';
import { CrescerPage } from '@/pages/app/CrescerPage';
import { TalentsPage } from '@/pages/app/TalentsPage';

function formatCardNumber(cardNumber: string): string {
  return cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber;
}

const Index = () => {
  const { user, profile, isLoading, signOut, refreshProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('rede');
  const [showProfilePage, setShowProfilePage] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (profile && !profile.name) {
    return <OnboardingPage />;
  }

  if (showProfilePage && profile) {
    return (
      <ProfilePage
        onBack={() => setShowProfilePage(false)}
        userProfile={{
          email: profile.email || user.email || '',
          name: profile.name,
          photo: profile.avatar_url,
        }}
        onUpdateProfile={async (name: string, photo: string | null) => {
          // Profile updates now handled inside ProfilePage via Supabase
          await refreshProfile();
        }}
        onLogout={async () => {
          await signOut();
        }}
      />
    );
  }

  const currentUser = {
    name: profile?.name || 'Usuário',
    company: profile?.company || 'Empresa Associada',
    memberNumber: formatCardNumber(profile?.card_number || '0000000000000000'),
    bio: profile?.bio || 'Membro da Rarques Association',
    photo: profile?.avatar_url || null,
  };

  return (
    <div className="min-h-screen bg-black">
      <PremiumHeader onSettingsClick={() => setShowProfilePage(true)} />
      <div className="max-w-md mx-auto pt-20 pb-24 px-4">
        {currentTab === 'rede' && <NetworkPage currentUser={currentUser} />}
        {currentTab === 'beneficios' && <BenefitsPage />}
        {currentTab === 'crescer' && <CrescerPage />}
        {currentTab === 'talentos' && <TalentsPage />}
      </div>
      <PremiumBottomNav activeTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default Index;

import { useState, ReactNode } from 'react';
import { AssociateThemeProvider } from '@/contexts/ThemeContext';

import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/app/LoginPage';
import { OnboardingPage } from '@/pages/app/OnboardingPage';
import { ProfilePage } from '@/pages/app/ProfilePage';
import { PremiumHeader } from '@/components/app/PremiumHeader';
import { PremiumBottomNav, TabType } from '@/components/app/PremiumBottomNav';
import { NetworkPage } from '@/pages/app/NetworkPage';
import { BenefitsPage } from '@/pages/app/BenefitsPage';
import { CrescerPage } from '@/pages/app/CrescerPage';
import { HomePage } from '@/pages/app/HomePage';
import { JournalPage } from '@/pages/app/JournalPage';
import { MorePage, MoreSection } from '@/pages/app/MorePage';
import { NexusPage } from '@/pages/app/NexusPage';
import { ElasPage } from '@/pages/app/ElasPage';
import { MagnaPage } from '@/pages/app/MagnaPage';
import { PanoramaPage } from '@/pages/app/PanoramaPage';
import { MinhaEmpresaPage } from '@/pages/app/MinhaEmpresaPage';
import { JuridicoEmpresarialPage } from '@/pages/app/JuridicoEmpresarialPage';

function formatCardNumber(cardNumber: string): string {
  return cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber;
}

const ADMIN_EMAIL = 'rarquesmatriz@gmail.com';

const Index = () => {
  const { user, profile, isLoading, isAdmin, signOut, refreshProfile, activeAccountType, hasCompanyProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [moreSection, setMoreSection] = useState<MoreSection | null>(null);
  const isCompanyActive = activeAccountType === 'company' && hasCompanyProfile;
  

  const isAdminUser = isAdmin || user?.email === ADMIN_EMAIL;

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

  if (!user) return <LoginPage />;
  if (user && !profile) return <OnboardingPage />;
  if (profile && !profile.name) return <OnboardingPage />;


  const Wrap = ({ children }: { children: ReactNode }) => (
    <AssociateThemeProvider>{children}</AssociateThemeProvider>
  );

  if (currentTab === 'config') {
    return (
      <Wrap>
        <ProfilePage
          onBack={() => setCurrentTab('inicio')}
          userProfile={{
            email: profile.email || user.email || '',
            name: profile.name,
            photo: profile.avatar_url,
          }}
          onUpdateProfile={async () => { await refreshProfile(); }}
          onLogout={async () => { await signOut(); }}
          isAdmin={isAdminUser}
          onAdminPanel={() => {
            window.location.assign('/admin');
          }}
        />
      </Wrap>
    );
  }


  const currentUser = {
    name: profile?.name || 'Usuário',
    company: profile?.company || 'Rarques Association',
    memberNumber: formatCardNumber(profile?.card_number || '0000000000000000'),
    bio: profile?.bio || 'Membro da Rarques Association',
    photo: profile?.avatar_url || null,
  };

  const handleTabChange = (tab: TabType) => {
    setMoreSection(null);
    setCurrentTab(tab);
  };

  const renderMoreSection = () => {
    // Bloqueio hard: seções exclusivas de Empresa NUNCA carregam para conta Cliente.
    if ((moreSection === 'minhaempresa' || moreSection === 'juridico') && !isCompanyActive) {
      return (
        <div className="animate-fadeUp">
          <button onClick={() => setMoreSection(null)} className="text-gray-300 hover:text-white text-sm mb-3">← Voltar</button>
          <p className="text-gray-400 text-sm">Área exclusiva para contas Empresa.</p>
        </div>
      );
    }
    switch (moreSection) {
      case 'nexus': return <NexusPage onBack={() => setMoreSection(null)} />;
      case 'elas': return <ElasPage onBack={() => setMoreSection(null)} />;
      case 'magna': return <MagnaPage onBack={() => setMoreSection(null)} />;
      case 'panorama': return <PanoramaPage onBack={() => setMoreSection(null)} />;
      case 'minhaempresa': return <MinhaEmpresaPage onBack={() => setMoreSection(null)} />;
      case 'juridico': return <JuridicoEmpresarialPage onBack={() => setMoreSection(null)} />;
      case 'crescer': return (
        <div className="animate-fadeUp">
          <button onClick={() => setMoreSection(null)} className="text-gray-300 hover:text-white text-sm mb-3">← Voltar</button>
          <CrescerPage />
        </div>
      );
      case 'beneficios': return (
        <div className="animate-fadeUp">
          <button onClick={() => setMoreSection(null)} className="text-gray-300 hover:text-white text-sm mb-3">← Voltar</button>
          <BenefitsPage />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <PremiumHeader onSettingsClick={() => setCurrentTab('config')} />
      <div className="max-w-md mx-auto pt-20 pb-24 px-4">
        {moreSection ? renderMoreSection() : (
          <>
            {currentTab === 'inicio' && (
              <HomePage
                userName={currentUser.name}
                onNavigate={handleTabChange}
                onOpenMore={(s) => { setCurrentTab('mais'); setMoreSection(s); }}
                isCompany={isCompanyActive}
              />
            )}
            {currentTab === 'rcard' && <NetworkPage currentUser={currentUser} isCompany={isCompanyActive} />}
            {currentTab === 'journal' && <JournalPage onBack={() => setCurrentTab('inicio')} />}
            {currentTab === 'mais' && <MorePage onOpen={setMoreSection} isCompany={isCompanyActive} />}
            {currentTab === 'beneficios' && <BenefitsPage />}

          </>
        )}
      </div>
      <PremiumBottomNav activeTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;

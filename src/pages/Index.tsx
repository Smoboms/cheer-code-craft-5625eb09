import { useState } from 'react';
import { LoginPage } from '@/pages/app/LoginPage';
import { OnboardingPage } from '@/pages/app/OnboardingPage';
import { ProfilePage } from '@/pages/app/ProfilePage';
import { PremiumHeader } from '@/components/app/PremiumHeader';
import { PremiumBottomNav, TabType } from '@/components/app/PremiumBottomNav';
import { NetworkPage } from '@/pages/app/NetworkPage';
import { BenefitsPage } from '@/pages/app/BenefitsPage';
import { CrescerPage } from '@/pages/app/CrescerPage';
import { TalentsPage } from '@/pages/app/TalentsPage';

interface UserProfile {
  email: string;
  name: string;
  photo: string | null;
  hasCompletedOnboarding: boolean;
  cardNumber?: string;
  company?: string;
  bio?: string;
}

function generateUniqueCardNumber(): string {
  const existingNumbers = new Set<string>();
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('user_')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key) || '{}');
        if (userData.cardNumber) {
          existingNumbers.add(userData.cardNumber);
        }
      } catch (e) {}
    }
  }
  let cardNumber: string;
  do {
    cardNumber = '';
    for (let i = 0; i < 16; i++) {
      cardNumber += Math.floor(Math.random() * 10).toString();
    }
  } while (existingNumbers.has(cardNumber));
  return cardNumber;
}

function formatCardNumber(cardNumber: string): string {
  return cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('rede');
  const [showProfilePage, setShowProfilePage] = useState(false);

  const handleLogin = (email: string, password: string) => {
    const existingUser = localStorage.getItem(`user_${email}`);
    if (existingUser) {
      const user = JSON.parse(existingUser);
      if (user.password === password) {
        if (!user.cardNumber) user.cardNumber = generateUniqueCardNumber();
        if (!user.company) user.company = 'Empresa Associada';
        if (!user.bio) user.bio = 'Membro da Rarques Association, conectando empresários e oportunidades.';
        localStorage.setItem(`user_${email}`, JSON.stringify(user));
        localStorage.setItem('current_user_email', email);
        setUserProfile(user);
        setIsAuthenticated(true);
      } else {
        alert('Senha incorreta');
      }
    } else {
      const newUser: UserProfile & { password: string } = {
        email, password, name: '', photo: null, hasCompletedOnboarding: false,
        cardNumber: generateUniqueCardNumber(), company: 'Empresa Associada',
        bio: 'Membro da Rarques Association, conectando empresários e oportunidades.',
      };
      localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
      localStorage.setItem('current_user_email', email);
      setUserProfile(newUser);
      setIsAuthenticated(true);
    }
  };

  const handleOnboardingComplete = (name: string, photo: string | null) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, name, photo, hasCompletedOnboarding: true };
      setUserProfile(updatedProfile);
      localStorage.setItem(`user_${userProfile.email}`, JSON.stringify(updatedProfile));
    }
  };

  const handleUpdateProfile = (name: string, photo: string | null) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, name, photo };
      setUserProfile(updatedProfile);
      localStorage.setItem(`user_${userProfile.email}`, JSON.stringify(updatedProfile));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user_email');
    setIsAuthenticated(false);
    setUserProfile(null);
    setCurrentTab('rede');
    setShowProfilePage(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (userProfile && !userProfile.hasCompletedOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  if (showProfilePage && userProfile) {
    return (
      <ProfilePage
        onBack={() => setShowProfilePage(false)}
        userProfile={{ email: userProfile.email, name: userProfile.name, photo: userProfile.photo }}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />
    );
  }

  const currentUser = {
    name: userProfile?.name || 'Usuário',
    company: userProfile?.company || 'Empresa Associada',
    memberNumber: formatCardNumber(userProfile?.cardNumber || generateUniqueCardNumber()),
    bio: userProfile?.bio || 'Membro da Rarques Association',
    photo: userProfile?.photo || null,
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

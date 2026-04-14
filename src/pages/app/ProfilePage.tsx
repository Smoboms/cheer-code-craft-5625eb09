import { useState, useRef } from 'react';
import { ArrowLeft, Camera, User, Mail, LogOut } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
  userProfile: {
    email: string;
    name: string;
    photo: string | null;
  };
  onUpdateProfile: (name: string, photo: string | null) => void;
  onLogout: () => void;
}

export function ProfilePage({ onBack, userProfile, onUpdateProfile, onLogout }: ProfilePageProps) {
  const [name, setName] = useState(userProfile.name);
  const [photo, setPhoto] = useState<string | null>(userProfile.photo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, insira seu nome');
      return;
    }
    onUpdateProfile(name.trim(), photo);
    onBack();
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-black to-gray-950 border-b border-gray-900 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 transition-colors text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">Meu Perfil</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Photo Section */}
          <div className="bg-gray-900 p-6 border border-gray-800">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-4 border-gray-200"
                >
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-gray-400" size={48} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-black flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all"
                >
                  <Camera className="text-white" size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Clique para alterar a foto
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div className="bg-white p-4 shadow-sm">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Email Field (Read-only) */}
          <div className="bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
              <Mail size={20} className="text-gray-400" />
              <span className="text-gray-600">{userProfile.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              O e-mail não pode ser alterado
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-black text-white font-semibold py-3 hover:bg-gray-800 transition-all"
          >
            Salvar alterações
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full bg-white border-2 border-red-500 text-red-500 font-semibold py-3 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
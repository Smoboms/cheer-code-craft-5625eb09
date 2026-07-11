import { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, uploadAvatar } from '@/services/auth.service';

// Race a promise against a timeout so we never block the user indefinitely.
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Tempo esgotado ao ${label}. Tente novamente.`)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warnMsg, setWarnMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Imagem muito grande (máximo 5MB).');
        return;
      }
      setErrorMsg(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent duplicate submissions
    const trimmed = name.trim();
    if (!trimmed || !user) return;

    setLoading(true);
    setErrorMsg(null);
    setWarnMsg(null);

    // 1) Save name first — this is the critical step and must be fast/reliable.
    try {
      await withTimeout(
        updateProfile(user.id, { name: trimmed }),
        15000,
        'salvar o perfil',
      );
    } catch (err: any) {
      console.error('Error saving profile name:', err);
      setErrorMsg(err?.message || 'Erro ao salvar perfil. Tente novamente.');
      setLoading(false);
      return;
    }

    // 2) Upload avatar (optional, non-blocking for the flow).
    if (photoFile) {
      try {
        const avatarUrl = await withTimeout(
          uploadAvatar(user.id, photoFile),
          20000,
          'enviar a foto',
        );
        await withTimeout(
          updateProfile(user.id, { avatar_url: avatarUrl }),
          15000,
          'salvar a foto',
        );
      } catch (err: any) {
        console.error('Error uploading avatar:', err);
        setWarnMsg('Perfil salvo, mas não conseguimos enviar a foto agora. Você poderá tentar novamente depois.');
      }
    }

    try {
      await refreshProfile();
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h1>
          <p className="text-gray-400 text-sm">Complete seu perfil para começar</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-4 border-gray-200">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-gray-400" size={48} />
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="text-white" size={20} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {photo ? 'Clique para alterar a foto' : 'Adicione uma foto de perfil'}
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
              <input id="name" type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>

            <button type="submit" disabled={loading || !name.trim()}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Salvando...' : 'Começar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

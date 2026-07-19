import { useState, useRef } from 'react';
import { ArrowLeft, Camera, User, Mail, LogOut, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { optimizeImage, toWebpName } from '@/lib/imageOptimizer';

interface ProfilePageProps {
  onBack: () => void;
  userProfile: {
    email: string;
    name: string;
    photo: string | null;
  };
  onUpdateProfile: () => Promise<void> | void;
  onLogout: () => void;
  onAdminPanel?: () => void;
  isAdmin?: boolean;
}

const AVATAR_SIGNED_TTL = 60 * 60 * 24 * 365; // ~1 ano

export function ProfilePage({ onBack, userProfile, onUpdateProfile, onLogout, onAdminPanel, isAdmin }: ProfilePageProps) {
  const { user, activeAccountType } = useAuth();
  const [name, setName] = useState(userProfile.name);
  const [photo, setPhoto] = useState<string | null>(userProfile.photo);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setMsg(null);
    try {
      const optimized = await optimizeImage(file, { maxDimension: 800, quality: 0.85 });
      const path = `${user.id}/${Date.now()}-avatar.webp`;
      const upload = await supabase.storage
        .from('avatars')
        .upload(path, optimized, { upsert: true, contentType: 'image/webp' });
      if (upload.error) throw upload.error;
      const signed = await supabase.storage.from('avatars').createSignedUrl(path, AVATAR_SIGNED_TTL);
      if (signed.error) throw signed.error;
      setPhoto(signed.data.signedUrl);
    } catch (err: any) {
      console.error('Upload avatar erro:', err);
      setMsg('Erro ao enviar imagem. Tente novamente.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !user) {
      alert('Por favor, insira seu nome');
      return;
    }
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), avatar_url: photo })
      .eq('user_id', user.id)
      .eq('account_type', activeAccountType ?? 'client');
    setSaving(false);
    if (error) {
      setMsg('Erro ao salvar. Tente novamente.');
      return;
    }
    await onUpdateProfile();
    onBack();
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto min-h-screen bg-black">
        <div className="bg-gradient-to-r from-black via-black to-gray-950 border-b border-gray-900 p-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="p-2 hover:bg-white/10 transition-colors text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">Meu Perfil</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gray-900 p-6 border border-gray-800">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-4 border-gray-200"
                >
                  {uploading ? (
                    <Loader2 size={32} className="text-gray-500 animate-spin" />
                  ) : photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-gray-400" size={48} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-black flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all disabled:opacity-60"
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
                {uploading ? 'Otimizando e enviando…' : 'Clique para alterar a foto (será convertida para WEBP)'}
              </p>
            </div>
          </div>

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

          <div className="bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
              <Mail size={20} className="text-gray-400" />
              <span className="text-gray-600">{userProfile.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">O e-mail não pode ser alterado</p>
          </div>

          {msg && <p className="text-sm text-center text-red-400">{msg}</p>}

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full bg-black text-white font-semibold py-3 hover:bg-gray-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Salvar alterações
          </button>

          {isAdmin && onAdminPanel && (
            <button
              onClick={onAdminPanel}
              className="w-full bg-gray-900 text-white font-semibold py-3 hover:bg-gray-800 transition-all flex items-center justify-center gap-2 border border-gray-700"
            >
              <Shield size={20} />
              Painel Administrativo
            </button>
          )}

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

// referência mantida para ajudar tree-shaking em futuras utilidades
void toWebpName;

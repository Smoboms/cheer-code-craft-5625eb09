import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MyProductsSection } from './MyProductsSection';
import { optimizeImage } from '@/lib/imageOptimizer';

interface Props { onBack: () => void; }

interface Form {
  company: string;
  segment: string;
  bio: string;
  phone: string;
  what_i_offer: string;
  what_i_seek: string;
  avatar_url: string;
}

const AVATAR_SIGNED_TTL = 60 * 60 * 24 * 365;

export function MinhaEmpresaPage({ onBack }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<Form>({
    company: '',
    segment: '',
    bio: '',
    phone: '',
    what_i_offer: '',
    what_i_seek: '',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(0);

  useEffect(() => {
    if (profile) {
      setForm({
        company: profile.company || '',
        segment: profile.segment || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        what_i_offer: profile.what_i_offer || '',
        what_i_seek: profile.what_i_seek || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const filledCount = Object.values(form).filter((v) => v.trim().length > 0).length;
  const total = Object.keys(form).length;
  const percent = Math.round((filledCount / total) * 100);
  // Requisitos mínimos para liberar o cadastro de produtos no Mercado:
  // empresa, segmento, contato e descrição preenchidos. Campos "o que ofereço/busco"
  // permanecem opcionais para não bloquear o fluxo comercial.
  const requiredOk = !!(form.company.trim() && form.segment.trim() && form.phone.trim() && form.bio.trim());
  const complete = percent === 100;
  const productsUnlocked = requiredOk;

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setMsg(null);
    try {
      const optimized = await optimizeImage(file, { maxDimension: 1200, quality: 0.85 });
      const path = `${user.id}/company-${Date.now()}.webp`;
      const upload = await supabase.storage
        .from('avatars')
        .upload(path, optimized, { upsert: true, contentType: 'image/webp' });
      if (upload.error) throw upload.error;
      const signed = await supabase.storage.from('avatars').createSignedUrl(path, AVATAR_SIGNED_TTL);
      if (signed.error) throw signed.error;
      setForm((f) => ({ ...f, avatar_url: signed.data.signedUrl }));
    } catch (err: any) {
      console.error('Upload empresa erro:', err);
      setMsg('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from('profiles').update(form).eq('user_id', user.id);
    if (error) { setSaving(false); setMsg('Erro ao salvar. Tente novamente.'); return; }

    // Provisiona/atualiza automaticamente o registro na tabela `partners` (diretório público),
    // liberando o cadastro de produtos no Mercado. Regras de curadoria permanecem no fluxo existente.
    if (form.company.trim()) {
      const { data: existing } = await supabase
        .from('partners')
        .select('id')
        .eq('created_by', user.id)
        .maybeSingle();

      const partnerPayload: any = {
        name: form.company.trim(),
        category: form.segment.trim() || 'Geral',
        description: form.bio || null,
        phone: form.phone || null,
        whatsapp: form.phone || null,
        profile_image_url: form.avatar_url || null,
        logo_url: form.avatar_url || null,
        discount: '',
        is_active: true,
        status: 'approved',
      };

      if (existing?.id) {
        await supabase.from('partners').update(partnerPayload).eq('id', existing.id);
      } else {
        await supabase.from('partners').insert({ ...partnerPayload, created_by: user.id });
      }
    }

    setSaving(false);
    setMsg('Perfil atualizado com sucesso.');
    await refreshProfile();
  };

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Minha Empresa</h2>
        <p className="text-gray-400 text-sm">Edite seu perfil no diretório público de Associados</p>
      </div>

      <div className={`p-3 border mb-5 flex items-center gap-3 ${complete ? 'bg-green-500/10 border-green-500/40' : 'bg-yellow-500/10 border-yellow-500/40'}`}>
        {complete ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-yellow-400" />}
        <div className="flex-1">
          <p className={`text-sm font-semibold ${complete ? 'text-green-300' : 'text-yellow-300'}`}>
            {complete ? 'Perfil completo' : 'Perfil incompleto'}
          </p>
          <div className="mt-1 h-1.5 bg-black/40 overflow-hidden">
            <div className={`h-full ${complete ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <p className="text-white text-sm font-bold">{percent}%</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 p-4">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Logo / Foto</label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-800 overflow-hidden flex items-center justify-center">
              {uploading ? (
                <Loader2 size={20} className="text-gray-400 animate-spin" />
              ) : form.avatar_url ? (
                <img src={form.avatar_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-600 text-xs">Sem logo</span>
              )}
            </div>
            <label className={`text-white text-sm underline cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? 'Otimizando…' : 'Enviar imagem (WEBP)'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
          </div>
        </div>

        {[
          { key: 'company', label: 'Nome da empresa' },
          { key: 'segment', label: 'Segmento' },
          { key: 'phone', label: 'Contato / WhatsApp' },
        ].map((f) => (
          <div key={f.key} className="bg-gray-900 border border-gray-800 p-4">
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{f.label}</label>
            <input
              value={(form as any)[f.key]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white"
            />
          </div>
        ))}

        {[
          { key: 'bio', label: 'Descrição da empresa' },
          { key: 'what_i_offer', label: 'O que ofereço' },
          { key: 'what_i_seek', label: 'O que busco' },
        ].map((f) => (
          <div key={f.key} className="bg-gray-900 border border-gray-800 p-4">
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{f.label}</label>
            <textarea
              value={(form as any)[f.key]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              rows={3}
              className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white resize-none"
            />
          </div>
        ))}

        {msg && <p className={`text-sm text-center ${msg.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-white text-black font-semibold py-3 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Salvar alterações
        </button>

        <MyProductsSection enabled={complete} />
      </div>
    </div>
  );
}


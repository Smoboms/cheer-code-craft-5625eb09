import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Clock, XCircle, Settings, Package, Ticket, LayoutDashboard, LucideIcon } from 'lucide-react';
import { MinhaEmpresaDashboard } from './MinhaEmpresaDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CouponIssuer } from './CouponIssuer';
import { MyProductsPage } from './MyProductsPage';
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

type PartnerSummary = {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  description: string | null;
  created_by: string | null;
  status: string;
  is_active: boolean | null;
  discount_percent?: number | null;
  cashback_enabled?: boolean | null;
  cashback_percent?: number | null;
  cashback_feature_unlocked?: boolean | null;
  products_feature_unlocked?: boolean | null;
  rejection_reason?: string | null;
};

const PARTNER_SELECT = 'id, name, category, phone, description, created_by, status, is_active, discount_percent, cashback_enabled, cashback_percent, cashback_feature_unlocked, products_feature_unlocked, rejection_reason';
const AVATAR_SIGNED_TTL = 60 * 60 * 24 * 365;

type View = 'hub' | 'config' | 'products' | 'coupon' | 'dashboard';

export function MinhaEmpresaPage({ onBack }: Props) {
  const [view, setView] = useState<View>('hub');

  if (view === 'products') return <MyProductsPage onBack={() => setView('hub')} />;
  if (view === 'dashboard') return <MinhaEmpresaDashboard onBack={() => setView('hub')} />;
  if (view === 'config' || view === 'coupon') {
    return <MinhaEmpresaHubDetail view={view} onBack={() => setView('hub')} />;
  }
  return <MinhaEmpresaHub onBack={onBack} onOpen={(v) => setView(v)} />;
}

const HUB_ITEMS: { key: Exclude<View, 'hub'>; label: string; desc: string; icon: LucideIcon; accent: string }[] = [
  { key: 'dashboard', label: 'Dashboard', desc: 'Cupons e faturamento', icon: LayoutDashboard, accent: 'text-blue-400' },
  { key: 'config', label: 'Configurar Minha Empresa', desc: 'Foto, nome, contato e descrição', icon: Settings, accent: 'text-white' },
  { key: 'products', label: 'Meus Produtos', desc: 'Vitrine (em breve)', icon: Package, accent: 'text-yellow-400' },
  { key: 'coupon', label: 'Emitir Cupom', desc: 'Descontos para clientes', icon: Ticket, accent: 'text-green-400' },
];

function MinhaEmpresaHub({ onBack, onOpen }: { onBack: () => void; onOpen: (v: Exclude<View, 'hub'>) => void }) {
  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Minha Empresa</h2>
        <p className="text-gray-400 text-sm">Gestão da sua conta empresarial na Rarques</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {HUB_ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              onClick={() => onOpen(it.key)}
              className="bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors p-3 text-left flex flex-col gap-2 aspect-square"
            >
              <Icon size={20} className={it.accent} />
              <div className="mt-auto">
                <p className="text-white font-semibold text-sm">{it.label}</p>
                <p className="text-gray-400 text-[11px] mt-0.5 leading-tight">{it.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MinhaEmpresaHubDetail({ view, onBack }: { view: 'config' | 'coupon'; onBack: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>({
    company: '',
    segment: '',
    bio: '',
    phone: '',
    what_i_offer: '',
    what_i_seek: '',
    avatar_url: '',
  });
  const [partner, setPartner] = useState<PartnerSummary | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const initialLoadedRef = useState({ done: false })[0];

  // Carrega o formulário a partir da linha em `partners` (fonte da verdade da empresa).
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('partners')
        .select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setPartner(data as unknown as PartnerSummary);
        if (!initialLoadedRef.done) {
          setForm({
            company: (data as any).name || '',
            segment: (data as any).category || '',
            bio: (data as any).description || '',
            phone: (data as any).phone || (data as any).whatsapp || '',
            what_i_offer: '',
            what_i_seek: '',
            avatar_url: (data as any).profile_image_url || (data as any).logo_url || '',
          });
          initialLoadedRef.done = true;
        }
      } else if (!initialLoadedRef.done) {
        initialLoadedRef.done = true;
      }
    })();
  }, [user, initialLoadedRef]);

  const requiredOk = !!(form.company.trim() && form.phone.trim() && form.bio.trim());

  const persist = async (next: Form) => {
    if (!user) return;
    if (!requiredOk) {
      setMsg({ kind: 'err', text: 'Preencha nome, contato e descrição para salvar.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const { data: existingRows } = await supabase
        .from('partners')
        .select(PARTNER_SELECT)
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
      const existing = existingRows?.[0] as PartnerSummary | undefined;
      const isCompanyAccount = profile?.account_type === 'company';
      const partnerPayload: any = {
        name: next.company.trim(),
        category: next.segment.trim() || existing?.category || 'Geral',
        description: next.bio || null,
        phone: next.phone || null,
        whatsapp: next.phone || null,
        profile_image_url: next.avatar_url || null,
        logo_url: next.avatar_url || null,
        is_active: true,
      };
      if (!existing) {
        partnerPayload.status = isCompanyAccount ? 'pending_curation' : 'approved';
      }
      const partnerMutation = existing?.id
        ? await supabase.from('partners').update(partnerPayload).eq('id', existing.id).select(PARTNER_SELECT).single()
        : await supabase.from('partners').insert({ ...partnerPayload, created_by: user.id }).select(PARTNER_SELECT).single();

      if (partnerMutation.error) throw partnerMutation.error;
      if (partnerMutation.data) setPartner(partnerMutation.data as PartnerSummary);
      qc.invalidateQueries({ queryKey: ['partners', 'active'] });
      qc.invalidateQueries({ queryKey: ['my-products', user.id] });
      setMsg({ kind: 'ok', text: 'Alterações salvas com sucesso.' });
    } catch (err: any) {
      console.error('Salvar empresa erro:', err);
      const raw = err?.message || err?.error_description || '';
      let friendly = 'Erro ao salvar. Tente novamente.';
      if (/row-level security|violates row-level/i.test(raw) || err?.code === '42501') {
        friendly = 'Sua conta ainda não tem perfil empresarial. Faça logout e crie a conta como "Sou Empresa" para configurar sua empresa.';
      } else if (raw) {
        friendly = `Erro ao salvar: ${raw}`;
      }
      setMsg({ kind: 'err', text: friendly });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof Form, value: string) => {
    setForm((s) => ({ ...s, [key]: value }));
    if (msg) setMsg(null);
  };

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
      setForm((s) => ({ ...s, avatar_url: signed.data.signedUrl }));
    } catch (err: any) {
      console.error('Upload empresa erro:', err);
      setMsg({ kind: 'err', text: 'Erro ao enviar imagem.' });
    } finally {
      setUploading(false);
    }
  };

  if (view === 'coupon') {
    return (
      <div className="animate-fadeUp pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-1">Emitir Cupom</h2>
          <p className="text-gray-400 text-sm">Gere cupons de desconto para seus clientes</p>
        </div>
        {!partner ? (
          <div className="bg-gray-900 border border-gray-800 p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-semibold">Empresa ainda não configurada</p>
              <p className="text-gray-400 text-xs mt-1">Preencha os dados em "Configurar Minha Empresa" primeiro.</p>
            </div>
          </div>
        ) : partner.status !== 'approved' ? (
          <div className={`p-3 border flex items-start gap-3 ${
            partner.status === 'rejected' ? 'bg-red-500/10 border-red-500/40' : 'bg-yellow-500/10 border-yellow-500/40'
          }`}>
            {partner.status === 'rejected'
              ? <XCircle size={20} className="text-red-400 mt-0.5" />
              : <Clock size={20} className="text-yellow-400 mt-0.5" />}
            <div className="text-sm">
              <p className={`font-semibold ${partner.status === 'rejected' ? 'text-red-300' : 'text-yellow-300'}`}>
                {partner.status === 'rejected' ? 'Empresa recusada' : 'Empresa em curadoria'}
              </p>
              <p className="text-gray-300 text-xs mt-0.5">
                {partner.status === 'rejected'
                  ? (partner.rejection_reason || 'Entre em contato com a administração para mais informações.')
                  : 'Seu perfil está sendo avaliado. Você poderá emitir cupons após a aprovação.'}
              </p>
            </div>
          </div>
        ) : (
          <CouponIssuer
            partnerId={partner.id}
            discountPercent={Number(partner.discount_percent) || 0}
            cashbackEnabled={!!partner.cashback_enabled}
            cashbackPercent={Number(partner.cashback_percent) || 0}
            cashbackFeatureUnlocked={!!partner.cashback_feature_unlocked}
          />
        )}
      </div>
    );
  }

  // view === 'config'
  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Configurar Minha Empresa</h2>
        <p className="text-gray-400 text-sm">Edite os dados e clique em Salvar Alterações</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 p-4">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Foto de perfil</label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-800 overflow-hidden flex items-center justify-center">
              {uploading ? (
                <Loader2 size={20} className="text-gray-400 animate-spin" />
              ) : form.avatar_url ? (
                <img src={form.avatar_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-600 text-xs">Sem foto</span>
              )}
            </div>
            <label className={`text-white text-sm underline cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? 'Otimizando…' : 'Enviar imagem'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Nome da empresa</label>
          <input
            value={form.company}
            onChange={(e) => updateField('company', e.target.value)}
            className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white"
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Contato / WhatsApp</label>
          <input
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white"
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Descrição da empresa</label>
          <textarea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            rows={4}
            className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white resize-none"
          />
        </div>

        {partner && partner.status !== 'approved' && (
          <div className={`p-3 border flex items-start gap-3 ${
            partner.status === 'rejected' ? 'bg-red-500/10 border-red-500/40' : 'bg-yellow-500/10 border-yellow-500/40'
          }`}>
            {partner.status === 'rejected'
              ? <XCircle size={20} className="text-red-400 mt-0.5" />
              : <Clock size={20} className="text-yellow-400 mt-0.5" />}
            <div className="text-sm">
              <p className={`font-semibold ${partner.status === 'rejected' ? 'text-red-300' : 'text-yellow-300'}`}>
                {partner.status === 'rejected' ? 'Empresa recusada' : 'Empresa em curadoria'}
              </p>
              <p className="text-gray-300 text-xs mt-0.5">
                {partner.status === 'rejected'
                  ? (partner.rejection_reason || 'Entre em contato com a administração para mais informações.')
                  : 'Seu perfil está sendo avaliado.'}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => persist(form)}
          disabled={saving || uploading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold text-sm py-3 flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? (<><Loader2 size={14} className="animate-spin" /> Salvando…</>) : 'Salvar Alterações'}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs h-5">
          {msg && (
            <span className={msg.kind === 'err' ? 'text-red-400' : 'text-green-400'}>
              {msg.kind === 'ok' && <CheckCircle2 size={12} className="inline mr-1" />}
              {msg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

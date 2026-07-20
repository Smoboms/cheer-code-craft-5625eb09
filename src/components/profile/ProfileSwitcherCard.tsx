import { useState } from 'react';
import { Loader2, User as UserIcon, Building2, ArrowLeftRight, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Cartão de gerenciamento Dual Profile: alterna entre Cliente/Empresa
 * ou cria o perfil complementar quando ainda não existe.
 * Reutiliza a estética preto/dourado da plataforma.
 */
export function ProfileSwitcherCard() {
  const {
    activeAccountType, hasClientProfile, hasCompanyProfile,
    switchAccountType, createSecondaryProfile,
  } = useAuth();
  const [busy, setBusy] = useState<'client' | 'company' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Exibimos o switcher para qualquer usuário que já possua um perfil de Empresa (CNPJ),
  // permitindo criar o perfil Cliente complementar quando ainda não existir.
  if (!hasCompanyProfile) return null;

  const handleAction = async (type: 'client' | 'company') => {
    setBusy(type); setErr(null);
    try {
      const exists = type === 'client' ? hasClientProfile : hasCompanyProfile;
      if (exists) {
        await switchAccountType(type);
      } else {
        await createSecondaryProfile(type);
      }
    } catch (e: any) {
      setErr(e?.message ?? 'Não foi possível concluir a operação');
    } finally {
      setBusy(null);
    }
  };

  const Row = ({ type }: { type: 'client' | 'company' }) => {
    const exists = type === 'client' ? hasClientProfile : hasCompanyProfile;
    const active = activeAccountType === type;
    const Icon = type === 'client' ? UserIcon : Building2;
    const label = type === 'client' ? 'Perfil Cliente' : 'Perfil Empresa';
    return (
      <button
        onClick={() => handleAction(type)}
        disabled={busy !== null || active}
        className={
          'w-full flex items-center justify-between px-4 py-3 border transition-all ' +
          (active
            ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 cursor-default'
            : 'bg-gray-900 border-gray-800 text-white hover:border-yellow-500/60')
        }
      >
        <span className="flex items-center gap-3">
          <Icon size={18} />
          <span className="font-medium">{label}</span>
        </span>
        <span className="text-xs flex items-center gap-1">
          {busy === type ? <Loader2 size={14} className="animate-spin" /> :
            active ? 'Ativo' :
            exists ? (<><ArrowLeftRight size={14} /> Ativar</>) :
                     (<><Plus size={14} /> Criar</>)}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-black border border-gray-800 p-4 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-white">Meus perfis</h3>
        <span className="text-[10px] uppercase tracking-widest text-yellow-500">Dual Profile</span>
      </div>
      <Row type="client" />
      <Row type="company" />
      {err && <p className="text-xs text-red-400 pt-1">{err}</p>}
      <p className="text-[11px] text-gray-500 pt-1">
        Alterne entre suas contas ou crie um novo perfil sem precisar sair da sessão.
      </p>
    </div>
  );
}

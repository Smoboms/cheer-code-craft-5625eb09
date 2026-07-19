import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCardCode, formatCardNumber, normalizeCardCode } from '@/lib/card';
import { useSeo } from '@/lib/useSeo';
import logoRCard from '@/assets/e88c6454816224d16b0c3ab8438f10bfae44646a.png';
import { CouponIssuerDialog } from '@/components/card/CouponIssuerDialog';

interface PublicCardData {
  name: string;
  avatar_url: string | null;
  card_number: string;
  card_code: string;
  is_active: boolean;
  user_id: string;
  card_tier: 'standard' | 'executive';
}

export default function PublicCard() {
  const { cardCode } = useParams<{ cardCode: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<PublicCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openIssuer, setOpenIssuer] = useState(false);
  const [partner, setPartner] = useState<{ id: string; name: string; discount_percent: number; cashback_enabled: boolean; cashback_percent: number; cashback_feature_unlocked: boolean } | null>(null);

  const normalized = useMemo(() => normalizeCardCode(cardCode || ''), [cardCode]);

  useSeo({
    title: data ? `${data.name} · R-CARD Rarques` : 'R-CARD Rarques',
    description: 'Carteirinha oficial de membro Rarques Association.',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data: rows, error } = await (supabase as any).rpc('get_public_card_by_code', { _code: normalized });
      if (cancelled) return;
      if (error || !rows || rows.length === 0) {
        setNotFound(true);
        setData(null);
      } else {
        setData(rows[0] as PublicCardData);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [normalized]);

  // Load partner info of the current logged-in user (if company & approved)
  useEffect(() => {
    let cancelled = false;
    if (!user) { setPartner(null); return; }
    (async () => {
      const { data: p } = await supabase
        .from('partners')
        .select('id,name,discount_percent,cashback_enabled,cashback_percent,cashback_feature_unlocked,status,created_by')
        .eq('created_by', user.id)
        .eq('status', 'approved')
        .maybeSingle();
      if (cancelled) return;
      if (p) {
        setPartner({
          id: p.id,
          name: p.name,
          discount_percent: Number(p.discount_percent || 0),
          cashback_enabled: !!p.cashback_enabled,
          cashback_percent: Number(p.cashback_percent || 0),
          cashback_feature_unlocked: !!(p as any).cashback_feature_unlocked,
        });
      } else {
        setPartner(null);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const canIssue = !!(data?.is_active && partner);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Carregando carteirinha…
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="w-14 h-14 flex items-center justify-center border border-neutral-300 rounded-full text-2xl">
          🔒
        </div>
        <h1 className="text-xl font-semibold">Perfil indisponível</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Este perfil não está disponível para visualização pública no momento.
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
        >
          Voltar para a página inicial
        </Link>
        <Link to="/cartao" className="text-xs text-muted-foreground underline">Buscar por outro código</Link>
      </div>
    );
  }
  // ref preserved to avoid unused-import warnings if visual copy evolves
  void formatCardCode;

  const isExec = data.card_tier === 'executive';
  const shellClass = isExec
    ? 'rcard-preserve w-full max-w-sm bg-gradient-to-br from-[#1a1204] via-black to-[#1a1204] border-2 border-yellow-500/70 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)]'
    : 'rcard-preserve w-full max-w-sm bg-gradient-to-br from-black via-[#3a1d0f] to-black border-2 border-[#B85C2E]/70 shadow-2xl';
  const statusChipClass = isExec
    ? 'bg-yellow-500/30 border-yellow-400/80'
    : (data.is_active ? 'bg-[#B85C2E]/20 border-[#B85C2E]/60' : 'bg-red-500/10 border-red-500/40');
  const statusTextClass = isExec ? 'text-yellow-300' : (data.is_active ? 'text-[#F1A56C]' : 'text-red-400');

  return (
    <div className={`min-h-[70vh] flex flex-col items-center justify-start px-4 py-10 ${isExec ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      {/* R-CARD visual (reused layout) */}
      <div className={shellClass}>
        <div className="relative p-5">
          {isExec && (
            <div className="absolute top-3 right-3 text-[9px] tracking-[0.25em] font-semibold text-yellow-400 border border-yellow-500/60 px-2 py-0.5">
              EXECUTIVO
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-block px-2 py-0.5 border ${statusChipClass}`}>
              <p className={`text-[10px] font-semibold tracking-wider ${statusTextClass}`}>
                {data.is_active ? 'MEMBRO ATIVO' : 'MEMBRO INATIVO'}
              </p>
            </div>
            {!isExec && <img src={logoRCard} alt="R-CARD" className="h-10 w-auto opacity-80" />}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 flex items-center justify-center overflow-hidden flex-shrink-0 ${isExec ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-yellow-400' : 'bg-gradient-to-br from-white to-gray-200 border-2 border-white'}`}>
              {data.avatar_url ? (
                <img src={data.avatar_url} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-black">{getInitials(data.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className={`font-semibold text-base truncate ${isExec ? 'text-yellow-100' : 'text-white'}`}>{data.name}</p>
              {isExec && (
                <p className="text-xs truncate text-yellow-500/80">Membro Executivo · Rarques</p>
              )}
            </div>
          </div>

          <div className={`border-t pt-4 ${isExec ? 'border-yellow-500/30' : 'border-gray-700'}`}>
            <p className={`text-[10px] tracking-widest mb-1 ${isExec ? 'text-yellow-500/80' : 'text-gray-400'}`}>NÚMERO DO CARTÃO</p>
            <p className={`text-base sm:text-lg font-mono tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis ${isExec ? 'text-yellow-100' : 'text-white'}`}>
              {formatCardNumber(data.card_number)}
            </p>
          </div>

          <div className={`mt-4 border p-2 text-center ${isExec ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/40'}`}>
            <p className={`text-[11px] tracking-wider font-semibold ${isExec ? 'text-yellow-300' : 'text-white'}`}>
              RARQUES ASSOCIATION · R-CARD{isExec ? ' EXECUTIVO' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Action area */}
      <div className="w-full max-w-sm mt-4">
        {!data.is_active ? (
          <p className="text-center text-sm text-red-600 font-medium">
            Este membro está atualmente inativo.
          </p>
        ) : canIssue ? (
          <button
            onClick={() => setOpenIssuer(true)}
            className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3 text-sm tracking-wide transition-colors"
          >
            Gerar Cupom
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Apenas Empresas Parceiras aprovadas podem gerar cupons a partir deste cartão.
          </p>
        )}
      </div>

      {canIssue && partner && (
        <CouponIssuerDialog
          open={openIssuer}
          onOpenChange={setOpenIssuer}
          partner={partner}
          client={{ user_id: data.user_id, name: data.name, card_code: data.card_code }}
        />
      )}
    </div>
  );
}

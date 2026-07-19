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
        <h1 className="text-xl font-semibold">Cartão não encontrado</h1>
        <p className="text-sm text-muted-foreground">
          O código <span className="font-mono">{formatCardCode(normalized) || cardCode}</span> não corresponde a nenhum membro.
        </p>
        <Link to="/" className="mt-2 text-sm underline">Voltar para a Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-start px-4 py-10 bg-neutral-50">
      {/* R-CARD visual (reused layout) */}
      <div className="w-full max-w-sm bg-gradient-to-br from-black via-gray-900 to-black border-2 border-white/80 shadow-2xl">
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-block px-2 py-0.5 border ${data.is_active ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-red-500/10 border-red-500/40'}`}>
              <p className={`text-[10px] font-semibold tracking-wider ${data.is_active ? 'text-yellow-400' : 'text-red-400'}`}>
                {data.is_active ? 'MEMBRO ATIVO' : 'MEMBRO INATIVO'}
              </p>
            </div>
            <img src={logoRCard} alt="R-CARD" className="h-10 w-auto opacity-80" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center border-2 border-white overflow-hidden flex-shrink-0">
              {data.avatar_url ? (
                <img src={data.avatar_url} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-black">{getInitials(data.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-base truncate">{data.name}</p>
              <p className="text-gray-400 text-xs truncate">Membro Rarques Association</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-[10px] tracking-widest mb-1">NÚMERO DO CARTÃO</p>
            <p className="text-white text-base sm:text-lg font-mono tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis">
              {formatCardNumber(data.card_number)}
            </p>
          </div>

          <div className="mt-4 border border-white/40 p-2 text-center">
            <p className="text-white text-[11px] tracking-wider font-semibold">
              RARQUES ASSOCIATION · R-CARD
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

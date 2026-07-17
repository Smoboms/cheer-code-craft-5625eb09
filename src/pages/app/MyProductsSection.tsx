import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Loader2, X, ImageIcon, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketCategories } from '@/data/useMarketCategories';
import { optimizeImage } from '@/lib/imageOptimizer';
import { formatBRL } from '@/lib/utils';

type Product = {
  id: string;
  name: string;
  category: string | null;
  market_category_id: string | null;
  market_subcategory_id: string | null;
  description: string | null;
  price: number | null;
  images: string[];
  status: string;
  is_active: boolean;
  rejection_reason: string | null;
};

type PartnerSummary = {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  description: string | null;
  created_by: string | null;
  status: string;
  is_active: boolean | null;
};

const PARTNER_SELECT = 'id, name, category, phone, description, created_by, status, is_active';

const hasMinimumCompanyData = (partner: PartnerSummary | null) => !!(
  partner?.id &&
  partner.name?.trim() &&
  partner.category?.trim() &&
  partner.phone?.trim() &&
  partner.description?.trim()
);

interface Props {
  /** True quando os campos mínimos do perfil da empresa estão preenchidos. */
  profileComplete?: boolean;
  /** Partner salvo pela tela pai; evita estado antigo após o primeiro Save. */
  partnerSeed?: PartnerSummary | null;
  /** Incrementado externamente após salvar o perfil, força recarregar produtos/partner. */
  reloadKey?: number;
}

export function MyProductsSection({ profileComplete = true, partnerSeed = null, reloadKey = 0 }: Props) {
  const { user } = useAuth();
  const [partner, setPartner] = useState<PartnerSummary | null>(partnerSeed);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const partnerId = partner?.id || null;
  const productsUnlocked = hasMinimumCompanyData(partner);
  const canCreateProducts = !!partner && productsUnlocked;

  useEffect(() => {
    if (!partnerSeed) return;
    console.log('Partner encontrado', partnerSeed);
    console.log('Partner ID', partnerSeed.id);
    setPartner(partnerSeed);
  }, [partnerSeed]);

  const load = async () => {
    console.log('Rendering MyProductsSection');
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: partnerRows, error: partnerError } = await supabase
      .from('partners')
      .select(PARTNER_SELECT)
      .eq('created_by', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);
    const foundPartner = (partnerRows?.[0] as PartnerSummary | undefined) || partnerSeed || null;

    if (partnerError) {
      console.error('Erro ao buscar partner da empresa:', partnerError);
    }

    setPartner(foundPartner);
    console.log('Partner encontrado', foundPartner);
    console.log('Partner ID', foundPartner?.id || null);
    console.log('partnerId', foundPartner?.id || null);
    console.log('partner', foundPartner);
    console.log('Products unlocked', hasMinimumCompanyData(foundPartner));
    console.log('productsUnlocked', hasMinimumCompanyData(foundPartner));
    console.log('profileComplete', profileComplete);
    console.log('canCreateProducts', !!foundPartner && hasMinimumCompanyData(foundPartner));

    if (foundPartner?.id) {
      const { data } = await supabase.from('marketplace_products').select('*').eq('partner_id', foundPartner.id).order('created_at', { ascending: false });
      setProducts((data as any) || []);
    } else {
      setProducts([]);
    }
    const { data: cats } = await supabase.from('partner_categories').select('name').order('name');
    setCategories((cats || []).map((c: any) => c.name));
    setLoading(false);
  };
  useEffect(() => { load(); }, [user, reloadKey]);

  const del = async (p: Product) => { if (confirm('Excluir produto?')) { await supabase.from('marketplace_products').delete().eq('id', p.id); load(); } };

  if (loading) return <div className="text-gray-400 text-sm py-4"><Loader2 size={16} className="inline animate-spin" /> Carregando…</div>;

  if (!canCreateProducts) {
    console.log('Rendering LockedState');
    return (
      <div className="bg-gray-900 border border-gray-800 p-4">
        <div className="flex items-start gap-3">
          <Package size={20} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold">Mercado Rarques</p>
            <p className="text-gray-400 text-xs mt-1">Salve os dados da sua empresa para liberar o cadastro de produtos.</p>
          </div>
        </div>
      </div>
    );
  }

  const atLimit = products.length >= 200;

  return (
    <div className="bg-gray-900 border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold">Meus produtos no Mercado</p>
          <p className="text-gray-500 text-[11px]">
            {products.length} de 200 produtos cadastrados · Passam por curadoria antes de irem ao ar.
          </p>
        </div>
        <button
          onClick={() => { if (atLimit) { alert('Limite de 200 produtos atingido. Exclua algum produto para cadastrar um novo.'); return; } setEditing(null); setShowForm(true); }}
          disabled={atLimit}
          className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold px-2.5 py-1.5 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus size={14} /> Novo
        </button>
      </div>
      {atLimit && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 text-[11px] p-2 mb-3">
          Você atingiu o limite de 200 produtos cadastrados. Exclua algum para adicionar novos.
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-4">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-black border border-gray-800 p-2">
              <div className="w-12 h-12 bg-gray-900 shrink-0">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon size={16} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] px-1.5 py-0.5 uppercase ${p.status==='approved'?'bg-green-500/20 text-green-300':p.status==='rejected'?'bg-red-500/20 text-red-300':'bg-yellow-500/20 text-yellow-300'}`}>
                    {p.status === 'approved' ? 'No ar' : p.status === 'rejected' ? 'Recusado' : 'Em curadoria'}
                  </span>
                  {p.price != null && <span className="text-gray-400 text-[10px]">{formatBRL(p.price)}</span>}
                </div>
              </div>
              <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-gray-400 hover:text-white p-1"><Edit3 size={14} /></button>
              <button onClick={() => del(p)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {showForm && partnerId && (
        <ProductForm
          partnerId={partnerId}
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductForm({ partnerId, initial, onClose, onSaved }: {
  partnerId: string; initial: Product | null; onClose: () => void; onSaved: () => void;
}) {
  const { user } = useAuth();
  const { categories, subcategories, loading: catsLoading } = useMarketCategories(true);
  const [f, setF] = useState({
    name: initial?.name || '',
    market_category_id: initial?.market_category_id || '',
    market_subcategory_id: initial?.market_subcategory_id || '',
    description: initial?.description || '',
    price: initial?.price != null ? String(initial.price) : '',
    images: initial?.images || [],
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const subsForCat = subcategories.filter((s) => s.category_id === f.market_category_id);

  const upload = async (file: File) => {
    if (!user) return;
    if (f.images.length >= 4) { alert('Máximo de 4 fotos.'); return; }
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, { maxDimension: 1400, quality: 0.85 });
      const path = `${user.id}/${Date.now()}.webp`;
      const { error } = await supabase.storage
        .from('partner-images')
        .upload(path, optimized, { upsert: false, contentType: 'image/webp' });
      if (error) { alert(error.message); return; }
      const { data } = supabase.storage.from('partner-images').getPublicUrl(path);
      setF((s) => ({ ...s, images: [...s.images, data.publicUrl] }));
    } finally {
      setUploading(false);
    }
  };

  const removeImg = (i: number) => setF((s) => ({ ...s, images: s.images.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!f.name.trim()) { alert('Nome é obrigatório.'); return; }
    if (!f.market_category_id) { alert('Selecione uma categoria.'); return; }
    if (!f.market_subcategory_id) { alert('Selecione uma subcategoria.'); return; }
    setSaving(true);
    const catName = categories.find((c) => c.id === f.market_category_id)?.name || null;
    const payload: any = {
      partner_id: partnerId,
      name: f.name.trim(),
      category: catName,
      market_category_id: f.market_category_id,
      market_subcategory_id: f.market_subcategory_id,
      description: f.description || null,
      price: f.price === '' ? null : Number(f.price),
      images: f.images,
      is_active: f.is_active,
      created_by: user?.id,
      ...(initial ? {} : { status: 'pending_curation' }),
    };
    const { error } = initial
      ? await supabase.from('marketplace_products').update(payload).eq('id', initial.id)
      : await supabase.from('marketplace_products').insert(payload);
    setSaving(false);
    if (error) alert(error.message); else onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold text-sm">{initial ? 'Editar produto' : 'Novo produto'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Nome do produto *</label>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Categoria *</label>
            <select
              value={f.market_category_id}
              onChange={(e) => setF({ ...f, market_category_id: e.target.value, market_subcategory_id: '' })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500"
            >
              <option value="">{catsLoading ? 'Carregando…' : 'Selecione uma categoria'}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Subcategoria *</label>
            <select
              value={f.market_subcategory_id}
              onChange={(e) => setF({ ...f, market_subcategory_id: e.target.value })}
              disabled={!f.market_category_id}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500 disabled:opacity-50"
            >
              <option value="">{!f.market_category_id ? 'Selecione a categoria primeiro' : 'Selecione uma subcategoria'}</option>
              {subsForCat.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Preço (opcional)</label>
            <input type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Descrição</label>
            <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500 resize-none" />
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Fotos ({f.images.length}/4)</label>
            <div className="grid grid-cols-4 gap-1 mt-1">
              {f.images.map((src, i) => (
                <div key={i} className="relative aspect-square bg-black border border-gray-700">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImg(i)} className="absolute -top-1 -right-1 bg-red-600 text-white p-0.5"><X size={10} /></button>
                </div>
              ))}
              {f.images.length < 4 && (
                <label className="aspect-square bg-black border border-dashed border-gray-600 flex items-center justify-center text-gray-500 cursor-pointer hover:border-yellow-500">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
            Ativo (visível quando aprovado)
          </label>
          {!initial && (
            <p className="text-yellow-400/80 text-[11px]">O produto ficará pendente de curadoria antes de aparecer no Mercado público.</p>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-xs uppercase text-gray-300 border border-gray-700">Cancelar</button>
          <button onClick={save} disabled={saving} className="px-3 py-2 text-xs uppercase font-semibold bg-yellow-500 hover:bg-yellow-400 text-black disabled:opacity-50">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

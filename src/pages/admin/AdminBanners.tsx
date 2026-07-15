import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, PageHeader, Select, Textarea } from './ui';
import { useAsync } from './hooks';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { optimizeImage } from '@/lib/imageOptimizer';

type SlotTarget = 'public' | 'associate' | 'both';
type BannerSlot = { imageUrl: string; ctaHref: string; target: SlotTarget };
const EMPTY_SLOT: BannerSlot = { imageUrl: '', ctaHref: '', target: 'public' };
const EMPTY_SLOTS: BannerSlot[] = [EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT];

function BannerEditor() {
  const [f, setF] = useState({ active: false, title: '', text: '', cta_label: 'Saiba mais', cta_href: '', image_url: '' });
  const [slots, setSlots] = useState<BannerSlot[]>(EMPTY_SLOTS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('public_home_banner').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setF({ active: data.active, title: data.title, text: data.text, cta_label: data.cta_label, cta_href: data.cta_href, image_url: data.image_url });
      setLoaded(true);
    });
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, { maxDimension: 1920, quality: 0.85 });
      const path = `banner/home-${Date.now()}.webp`;
      const { error } = await supabase.storage.from('partner-images').upload(path, optimized, {
        upsert: true, contentType: 'image/webp',
      });
      if (error) { alert(error.message); return; }
      const { data } = supabase.storage.from('partner-images').getPublicUrl(path);
      setF((s) => ({ ...s, image_url: data.publicUrl }));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    // Upsert guarantees row 1 exists even if the seed migration didn't run yet.
    const { error } = await supabase
      .from('public_home_banner')
      .upsert({ id: 1, ...f, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    setSaving(false);
    if (error) { alert(error.message); return; }
    window.dispatchEvent(new CustomEvent('rarques:publicBanner:updated'));
    alert('Banner salvo.');
  };

  if (!loaded) return <Card className="p-4"><div className="text-gray-400 text-sm">Carregando…</div></Card>;

  return (
    <Card className="p-4">
      <div className="text-white font-semibold mb-3">Banner da Home Pública</div>
      <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
        <input type="checkbox" checked={f.active} onChange={e => setF({ ...f, active: e.target.checked })} />
        Exibir banner na Home pública
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><Label>Título</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
        <div>
          <Label>Imagem do banner</Label>
          <div className="flex gap-2">
            <Input value={f.image_url} onChange={e => setF({ ...f, image_url: e.target.value })} placeholder="URL ou envie um arquivo" />
            <Btn variant="ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            </Btn>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </div>
          {f.image_url && <img src={f.image_url} alt="preview" className="mt-2 max-h-32 object-cover border border-white/10" />}
        </div>
        <div className="md:col-span-2"><Label>Texto</Label><Textarea rows={2} value={f.text} onChange={e => setF({ ...f, text: e.target.value })} /></div>
        <div><Label>Texto do botão</Label><Input value={f.cta_label} onChange={e => setF({ ...f, cta_label: e.target.value })} /></div>
        <div><Label>Link do botão</Label><Input value={f.cta_href} onChange={e => setF({ ...f, cta_href: e.target.value })} /></div>
      </div>
      <div className="mt-4 text-right"><Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar banner'}</Btn></div>
    </Card>
  );
}

function CarouselEditor() {
  const [f, setF] = useState({ title: '', text: '', link: '', icon: 'Megaphone', active: true, sort_order: 0 });
  const { data, loading, reload } = useAsync(async () => (await supabase.from('home_carousel_slides').select('*').order('sort_order')).data || []);

  const add = async () => {
    if (!f.title.trim()) return;
    const { error } = await supabase.from('home_carousel_slides').insert(f);
    if (error) return alert(error.message);
    setF({ title: '', text: '', link: '', icon: 'Megaphone', active: true, sort_order: (data?.length || 0) });
    reload();
  };
  const toggle = async (s: any) => { await supabase.from('home_carousel_slides').update({ active: !s.active }).eq('id', s.id); reload(); };
  const del = async (s: any) => { if (confirm('Excluir slide?')) { await supabase.from('home_carousel_slides').delete().eq('id', s.id); reload(); } };

  return (
    <Card className="p-4">
      <div className="text-white font-semibold mb-3">Carrossel de avisos (Área do Associado)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 pb-4 border-b border-white/10">
        <div><Label>Título</Label><Input value={f.title} onChange={e=>setF({...f, title: e.target.value})} /></div>
        <div><Label>Ícone (nome lucide)</Label><Input value={f.icon} onChange={e=>setF({...f, icon: e.target.value})} placeholder="Megaphone / Bell / Star" /></div>
        <div className="md:col-span-2"><Label>Texto</Label><Textarea rows={2} value={f.text} onChange={e=>setF({...f, text: e.target.value})} /></div>
        <div><Label>Link (opcional)</Label><Input value={f.link} onChange={e=>setF({...f, link: e.target.value})} /></div>
        <div><Label>Ordem</Label><Input type="number" value={f.sort_order} onChange={e=>setF({...f, sort_order: Number(e.target.value)})} /></div>
        <div className="md:col-span-2 text-right"><Btn onClick={add}>+ Adicionar slide</Btn></div>
      </div>
      {loading ? <div className="text-gray-400 text-sm">Carregando…</div> :
       !data?.length ? <EmptyState>Nenhum slide.</EmptyState> : (
        <div className="space-y-2">
          {data.map((s: any) => (
            <div key={s.id} className="flex justify-between items-start bg-[#0a0f1e] p-3 border border-white/10">
              <div>
                <div className="text-white text-sm">{s.title} {!s.active && <span className="text-red-400 text-xs">(inativo)</span>}</div>
                <div className="text-xs text-gray-400">{s.text}</div>
                {s.link && <div className="text-xs text-gray-500 mt-0.5">→ {s.link}</div>}
              </div>
              <div className="flex gap-1">
                <Btn variant="ghost" onClick={() => toggle(s)}>{s.active ? 'Desativar' : 'Ativar'}</Btn>
                <Btn variant="danger" onClick={() => del(s)}><Trash2 size={12} /></Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function AdminBanners() {
  return (
    <>
      <PageHeader title="Banners e Avisos" subtitle="Comunicações públicas e da Área do Associado" />
      <div className="space-y-4">
        <BannerEditor />
        <CarouselEditor />
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfessionalCategories } from '@/data/useProfessionals';
import { z } from 'zod';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').max(120),
  categorySlug: z.string().min(1, 'Selecione uma categoria'),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido').max(20),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  neighborhood: z.string().trim().max(80).optional().or(z.literal('')),
  description: z.string().trim().max(600).optional().or(z.literal('')),
  photo_url: z.string().url('URL inválida').max(500).optional().or(z.literal('')),
});

export default function PublicProfessionalSubmit() {
  const navigate = useNavigate();
  const { categories } = useProfessionalCategories();
  const [form, setForm] = useState({
    name: '', categorySlug: '', whatsapp: '', city: 'Uruaçu',
    neighborhood: '', description: '', photo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const cat = categories.find((c) => c.slug === parsed.data.categorySlug);
    if (!cat) { setError('Categoria inválida'); return; }
    setLoading(true);
    const { error: err } = await (supabase as any).from('professionals').insert({
      name: parsed.data.name,
      category: cat.name,
      category_slug: cat.slug,
      whatsapp: parsed.data.whatsapp,
      city: parsed.data.city || null,
      neighborhood: parsed.data.neighborhood || null,
      description: parsed.data.description || null,
      photo_url: parsed.data.photo_url || null,
      status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="animate-fadeUp py-8 text-center">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
        <h1 className="text-white text-xl font-bold mb-2">Cadastro recebido</h1>
        <p className="text-gray-300 text-sm max-w-md mx-auto mb-6">
          Seu cadastro foi recebido e será analisado pela equipe Rarques antes de ficar disponível publicamente.
        </p>
        <button
          onClick={() => navigate('/profissionais')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold px-4 py-2"
        >
          Voltar ao diretório
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp pb-4 max-w-lg mx-auto">
      <Link to="/profissionais" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-xs mb-3">
        <ArrowLeft size={12} /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-white mb-1">Cadastrar como Profissional</h1>
      <p className="text-gray-400 text-sm mb-5">
        Preencha os dados abaixo. Seu perfil aparecerá publicamente após análise da nossa equipe.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome completo *">
          <input value={form.name} onChange={set('name')} className={INPUT} maxLength={120} />
        </Field>
        <Field label="Categoria *">
          <select value={form.categorySlug} onChange={set('categorySlug')} className={INPUT}>
            <option value="">Selecione…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="WhatsApp *">
          <input value={form.whatsapp} onChange={set('whatsapp')} placeholder="(62) 9 9999-9999" className={INPUT} maxLength={20} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade">
            <input value={form.city} onChange={set('city')} className={INPUT} maxLength={80} />
          </Field>
          <Field label="Bairro">
            <input value={form.neighborhood} onChange={set('neighborhood')} className={INPUT} maxLength={80} />
          </Field>
        </div>
        <Field label="Descrição dos serviços">
          <textarea value={form.description} onChange={set('description')} rows={4} className={INPUT} maxLength={600} />
        </Field>
        <Field label="Foto (URL — opcional)">
          <input value={form.photo_url} onChange={set('photo_url')} placeholder="https://..." className={INPUT} maxLength={500} />
        </Field>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold text-sm py-2.5 inline-flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Enviar cadastro
        </button>
      </form>
    </div>
  );
}

const INPUT =
  'w-full bg-gray-900 border border-gray-800 focus:border-gray-600 outline-none text-white text-sm px-3 py-2.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-gray-300 text-xs mb-1">{label}</span>
      {children}
    </label>
  );
}

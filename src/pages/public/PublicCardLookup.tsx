import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, Search } from 'lucide-react';
import { normalizeCardCode, formatCardCode } from '@/lib/card';
import { useSeo } from '@/lib/useSeo';

export default function PublicCardLookup() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: 'Buscar R-CARD · Rarques',
    description: 'Digite o código do cartão para acessar a carteirinha do membro.',
  });

  const normalized = normalizeCardCode(raw);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (normalized.length !== 6) {
      setError('O código do cartão tem 6 caracteres.');
      return;
    }
    navigate(`/cartao/${normalized}`);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-10 bg-neutral-50">
      <div className="w-full max-w-sm bg-white border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <IdCard size={20} className="text-neutral-800" />
          <h1 className="text-lg font-semibold text-neutral-900">Buscar R-CARD</h1>
        </div>
        <p className="text-sm text-neutral-600 mb-5">
          Digite o código de 6 caracteres impresso no cartão do membro para abrir a carteirinha.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Código do cartão
            </span>
            <input
              value={formatCardCode(normalized)}
              onChange={(e) => setRaw(e.target.value)}
              maxLength={7}
              autoFocus
              inputMode="text"
              placeholder="XXX-XXX"
              className="w-full bg-white border border-neutral-300 text-neutral-900 px-3 py-3 text-base font-mono tracking-[0.25em] uppercase outline-none focus:border-neutral-900"
            />
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={normalized.length !== 6}
            className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3 text-sm tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search size={16} /> Abrir carteirinha
          </button>
        </form>

        <p className="text-[11px] text-neutral-500 mt-4 text-center">
          Use este acesso se o QR-Code do cartão não puder ser lido.
        </p>
      </div>
    </div>
  );
}

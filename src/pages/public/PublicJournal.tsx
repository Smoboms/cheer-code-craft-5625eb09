import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { journalArticles, journalCategories, type JournalCategory } from '@/data/journalArticles';

export default function PublicJournal() {
  const [active, setActive] = useState<JournalCategory>('Todas');
  const [slide, setSlide] = useState(0);

  const list = active === 'Todas' ? journalArticles : journalArticles.filter((a) => a.category === active);
  const featured = journalArticles.filter((a) => a.featured);

  useEffect(() => {
    if (featured.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % featured.length), 4500);
    return () => clearInterval(id);
  }, [featured.length]);

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Journal</h2>
        <p className="text-gray-400 text-sm">Conteúdo editorial Rarques</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {journalCategories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs border transition-colors ${
              active === c
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <div className="mb-5 relative overflow-hidden bg-gray-900 border border-gray-800">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            {featured.map((a) => (
              <Link key={a.id} to={`/journal/${a.id}`} className="min-w-full text-left">
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-950" />
                <div className="p-4">
                  <p className="text-[10px] font-semibold tracking-wider text-yellow-400 mb-1">
                    {a.category.toUpperCase()} · DESTAQUE
                  </p>
                  <p className="text-white font-semibold leading-snug">{a.title}</p>
                  <p className="text-white text-xs mt-2 underline">Ler matéria completa →</p>
                </div>
              </Link>
            ))}
          </div>
          {featured.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-3">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Destaque ${i + 1}`}
                  className={`h-1.5 transition-all ${i === slide ? 'w-4 bg-yellow-400' : 'w-1.5 bg-gray-600'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {list.map((a) => (
          <Link
            key={a.id}
            to={`/journal/${a.id}`}
            className="block w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-950" />
            <div className="p-4">
              <p className="text-[10px] font-semibold tracking-wider text-yellow-400 mb-1">{a.category.toUpperCase()}</p>
              <p className="text-white font-semibold mb-1 leading-snug">{a.title}</p>
              <p className="text-gray-400 text-sm">{a.excerpt}</p>
              <p className="text-white text-xs mt-2 underline">Ler matéria completa</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

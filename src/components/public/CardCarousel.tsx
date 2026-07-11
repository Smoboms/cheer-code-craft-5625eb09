import { useEffect, useRef, useState } from 'react';

interface Props<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  autoMs?: number;
  itemClassName?: string; // widths per breakpoint
}

/**
 * Horizontal snap carousel. Shows 1 card on mobile, more on desktop.
 * Auto-scrolls every `autoMs` ms. Swipeable on mobile.
 */
export function CardCarousel<T>({
  items,
  renderItem,
  autoMs = 4500,
  itemClassName = 'w-[85%] md:w-[46%] lg:w-[31%] xl:w-[23.5%]',
}: Props<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(items.length);
  const userScrolledRef = useRef(false);
  const restartRef = useRef<number | null>(null);

  const recompute = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const cardW = first.getBoundingClientRect().width + 12;
    const visible = Math.max(1, Math.round(el.clientWidth / cardW));
    setPages(Math.max(1, items.length - visible + 1));
    setPage(Math.min(page, Math.max(0, items.length - visible)));
  };

  useEffect(() => {
    recompute();
    const ro = new ResizeObserver(recompute);
    if (scrollerRef.current) ro.observe(scrollerRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    if (pages < 2) return;
    const id = window.setInterval(() => {
      if (userScrolledRef.current) return;
      setPage((p) => {
        const next = (p + 1) % pages;
        const el = scrollerRef.current;
        const first = el?.firstElementChild as HTMLElement | null;
        if (el && first) {
          const cardW = first.getBoundingClientRect().width + 12;
          el.scrollTo({ left: next * cardW, behavior: 'smooth' });
        }
        return next;
      });
    }, autoMs);
    return () => window.clearInterval(id);
  }, [pages, autoMs]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const cardW = first.getBoundingClientRect().width + 12;
    setPage(Math.round(el.scrollLeft / cardW));
    userScrolledRef.current = true;
    if (restartRef.current) window.clearTimeout(restartRef.current);
    restartRef.current = window.setTimeout(() => {
      userScrolledRef.current = false;
    }, 6000);
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <div key={i} className={`snap-start shrink-0 ${itemClassName}`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div className="flex justify-center gap-1.5 mt-1">
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 transition-all ${i === page ? 'w-4 bg-yellow-400' : 'w-1.5 bg-gray-600'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

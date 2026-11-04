import { useCallback, useEffect, useRef } from 'react';

export function useCatalogScroll(requested: boolean) {
  const catalog = useRef<HTMLDivElement>(null);
  const scrollToCatalog = useCallback(() => {
    catalog.current?.scrollIntoView({ block: 'start' });
    catalog.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (!requested) return;
    const frame = requestAnimationFrame(scrollToCatalog);
    return () => cancelAnimationFrame(frame);
  }, [requested, scrollToCatalog]);
  return { catalog, scrollToCatalog };
}

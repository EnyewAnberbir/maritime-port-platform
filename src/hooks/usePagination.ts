import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 8) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const slice = useMemo(() => {
    const start = safePage * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  return {
    page: safePage,
    pageCount,
    pageSize,
    slice,
    setPage,
    next: () => setPage((value) => Math.min(value + 1, pageCount - 1)),
    prev: () => setPage((value) => Math.max(value - 1, 0)),
  };
}

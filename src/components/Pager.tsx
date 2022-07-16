export function Pager({
  page,
  pageCount,
  onPrev,
  onNext,
}: {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="pager">
      <button type="button" onClick={onPrev} disabled={page <= 0}>
        Prev
      </button>
      <span>
        {page + 1} / {pageCount}
      </span>
      <button type="button" onClick={onNext} disabled={page + 1 >= pageCount}>
        Next
      </button>
    </div>
  );
}

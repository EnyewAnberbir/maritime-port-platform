import type { DeskView } from "../context/FocusContext";

const VIEWS: DeskView[] = ["calls", "berths", "cargo", "customs", "yard", "export"];

export function DeskNav({
  view,
  onChange,
}: {
  view: DeskView;
  onChange: (view: DeskView) => void;
}) {
  return (
    <nav className="desk-nav" aria-label="Harbor desk views">
      {VIEWS.map((item) => (
        <button
          key={item}
          type="button"
          data-active={item === view}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </nav>
  );

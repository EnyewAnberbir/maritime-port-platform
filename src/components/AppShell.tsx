import { useEffect, type ReactNode } from "react";

export function AppShell({
  children,
  generation,
  callCount,
}: {
  children: ReactNode;
  generation: number;
  callCount: number;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        document.body.dataset.harborFocus = "cleared";
      }
    };
    window.addEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Maritime Port Platform Desk</div>
        <div className="stamp">
          harbor gen {generation} · {callCount} calls · offline
        </div>
      </header>
      {children}
    </div>
  );
}

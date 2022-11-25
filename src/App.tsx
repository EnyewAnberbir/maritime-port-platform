import { AppShell } from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StatusBar } from "./components/StatusBar";
import { FocusProvider } from "./context/FocusContext";
import { PortProvider } from "./context/PortContext";
import { usePort } from "./hooks/usePort";
import { DeskPage } from "./pages/DeskPage";

export function App() {
  return (
    <ErrorBoundary>
      <PortProvider>
        <FocusProvider>
          <WiredApp />
        </FocusProvider>
      </PortProvider>
    </ErrorBoundary>
  );
}

function WiredApp() {
  const { desk } = usePort();
  return (
    <AppShell generation={desk.store.generation} callCount={desk.view.callCount}>
      <DeskPage />
      <StatusBar metrics={desk.metrics.snapshot()} />
    </AppShell>
  );
}

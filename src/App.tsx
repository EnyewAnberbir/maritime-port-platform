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

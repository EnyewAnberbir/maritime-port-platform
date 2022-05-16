import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { message: string | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (info.componentStack) {
      this.setState({ message: error.message });
    }
  }

  render(): ReactNode {
    if (this.state.message) {
      return (
        <div className="error-boundary" role="alert">
          Harbor desk fault: {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}

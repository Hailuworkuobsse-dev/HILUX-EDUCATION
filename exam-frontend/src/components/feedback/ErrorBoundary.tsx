import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors so a broken page never blanks the whole app.
 * Logs to the console; wire an error reporter here when you add one.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base p-6">
        <div className="w-full max-w-md rounded-2xl border border-danger/30 bg-bg-surface p-6 text-center shadow-xl">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-fg">Something went wrong</h1>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">
            The page failed to render. Reloading usually fixes it — if it keeps
            happening, note the time and contact support.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl border border-border bg-bg-elevated/60 p-3 text-left text-[11px] text-rose-300">
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-sm font-semibold text-white transition-colors hover:from-brand-400 hover:to-brand-500 focus-ring"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

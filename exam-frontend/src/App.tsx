import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { SessionBootstrap } from '@/features/auth/components/SessionBootstrap';
import { AppRouter } from '@/router';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SessionBootstrap />
            <AppRouter />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

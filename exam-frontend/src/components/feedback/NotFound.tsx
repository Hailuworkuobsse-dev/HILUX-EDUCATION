import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { ROUTES } from '@/router/routes';

export interface NotFoundProps {
  title?: string;
  description?: string;
}

/** 404 page — also used as the router's catch-all. */
export function NotFound({
  title = 'Page not found',
  description = "The link may be broken, or the page may have been moved."
}: NotFoundProps) {
  return (
    <Container size="sm" className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <PageMeta title={title} description={description} />

      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-surface text-brand-300">
        <Compass className="h-7 w-7" />
      </span>

      <p className="mt-6 text-5xl font-extrabold tracking-tight gradient-text">404</p>
      <h1 className="mt-2 text-xl font-bold text-fg">{title}</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to={ROUTES.HOME}>Back to home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to={ROUTES.SUPPORT}>Get support</Link>
        </Button>
      </div>
    </Container>
  );
}

export default NotFound;

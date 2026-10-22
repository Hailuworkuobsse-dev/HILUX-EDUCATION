import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none'
};

/** Centred page-width wrapper. */
export function Container({ size = 'xl', className, ...rest }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6', sizeClasses[size], className)} {...rest} />
  );
}

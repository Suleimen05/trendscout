import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

/**
 * Reusable Logo component with SVG
 */
export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0',
          sizeClasses[size]
        )}
      >
        <span className="text-sm">R</span>
      </div>
      {showText && (
        <span className={cn('font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent', textSizeClasses[size])}>
          Rizko.ai
        </span>
      )}
    </div>
  );
}

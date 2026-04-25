import { Button as BaseButton } from '@base-ui/react';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export const buttonVariants = ({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-700 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
    icon: 'h-9 w-9 p-0',
  };

  return cn(baseStyles, variants[variant], sizes[size], className);
};

export interface ButtonProps extends Omit<ComponentProps<typeof BaseButton>, 'className'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <BaseButton ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
  );
}

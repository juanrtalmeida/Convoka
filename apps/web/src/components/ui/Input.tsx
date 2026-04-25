import { Input as BaseInput } from '@base-ui/react';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends ComponentProps<typeof BaseInput> {}

export function Input({
  className,
  type,
  ref,
  ...props
}: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <BaseInput
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 transition-colors',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

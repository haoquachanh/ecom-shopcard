import React from 'react';
import { cn } from '@/shared/lib/cn';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
}) {
  return <button className={cn('btn', `btn--${variant}`, `btn--${size}`, className)} {...props} />;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} {...props} className={cn('field', className)} />,
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} {...props} className={cn('field field--textarea', className)} />,
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} {...props} className={cn('field', className)} />,
);
Select.displayName = 'Select';

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn('label', props.className)} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section {...props} className={cn('card', className)} />;
}

export function Badge({
  tone = 'default',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'default' | 'success' | 'muted' | 'danger' | 'warning' }) {
  return <span {...props} className={cn('badge', `badge--${tone}`, className)} />;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {description ? <span>{description}</span> : null}
    </div>
  );
}

export function LoadingRows({ columns = 5 }: { columns?: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <td key={cellIndex}>
              <div className="skeleton" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

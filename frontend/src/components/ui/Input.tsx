import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

interface BaseFieldProps {
  label: string;
  hint?: string | null;
  error?: string | null;
  icon?: ReactNode;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, className = '', ...props },
  ref,
) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className={`field-control ${error ? 'field-control-error' : ''}`}>
        {icon ? <span className="field-icon">{icon}</span> : null}
        <input ref={ref} className={`field-input ${className}`.trim()} {...props} />
      </span>
      {error ? (
        <span className="field-error">{error}</span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, icon, className = '', ...props },
  ref,
) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className={`field-control ${error ? 'field-control-error' : ''}`}>
        {icon ? <span className="field-icon field-icon-top">{icon}</span> : null}
        <textarea ref={ref} className={`field-input field-textarea ${className}`.trim()} {...props} />
      </span>
      {error ? (
        <span className="field-error">{error}</span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  );
});

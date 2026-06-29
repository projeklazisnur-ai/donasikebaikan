"use client";

import { useRef } from "react";

interface Props {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  message: string;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

export function ConfirmActionButton({ action, fields, message, className, children, title }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        title={title}
        className={className}
        onClick={(e) => {
          if (!confirm(message)) e.preventDefault();
        }}
      >
        {children}
      </button>
    </form>
  );
}

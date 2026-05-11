"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ProjectFormModal } from "@/components/ProjectFormModal";

/**
 * Global form-open state. Lifts the ProjectFormModal out of the
 * homepage's local React state so any page (work case studies,
 * insights articles, future routes) can open the same form via
 * useFormContext().openForm().
 *
 * Mount once in the root layout (already done in src/app/layout.tsx).
 * Consume anywhere with the useFormContext hook.
 */

type FormContextValue = {
  isOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
};

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openForm = useCallback(() => setIsOpen(true), []);
  const closeForm = useCallback(() => setIsOpen(false), []);

  return (
    <FormContext.Provider value={{ isOpen, openForm, closeForm }}>
      {children}
      <ProjectFormModal isOpen={isOpen} onClose={closeForm} />
    </FormContext.Provider>
  );
}

export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error(
      "useFormContext must be used inside a <FormProvider>. " +
        "It is mounted globally in src/app/layout.tsx.",
    );
  }
  return ctx;
}

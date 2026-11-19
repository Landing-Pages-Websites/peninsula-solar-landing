"use client";

import { useCallback, useState } from "react";
import { FIELD_KEYS, validateField, validateLeadValues, type FieldErrors, type FieldKey, type LeadValues } from "../leadFields";

export function fieldId(formId: string, key: FieldKey): string {
  return `${formId}-${key}`;
}

interface FieldErrorsApi {
  errors: FieldErrors;
  /** Validates every field, shows each message and focuses the first invalid one. */
  validateAll: (values: LeadValues) => boolean;
  /** Blur check: a blank optional field stays quiet; a touched field gets its message. */
  validateOne: (key: FieldKey, values: LeadValues) => void;
  /** While typing, an error disappears as soon as the value becomes valid. */
  clearIfValid: (key: FieldKey, values: LeadValues) => void;
}

function withError(errors: FieldErrors, key: FieldKey, error: string | null): FieldErrors {
  const next = { ...errors };
  if (error) next[key] = error;
  else delete next[key];
  return next;
}

export function useFieldErrors(formId: string): FieldErrorsApi {
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateAll = useCallback((values: LeadValues): boolean => {
    const found = validateLeadValues(values);
    setErrors(found);
    const first = FIELD_KEYS.find((key) => found[key]);
    if (!first) return true;
    document.getElementById(fieldId(formId, first))?.focus();
    return false;
  }, [formId]);

  const validateOne = useCallback((key: FieldKey, values: LeadValues): void => {
    const raw = values[key];
    const touched = typeof raw === "string" && raw.trim().length > 0;
    setErrors((current) => (touched || current[key] ? withError(current, key, validateField(key, values)) : current));
  }, []);

  const clearIfValid = useCallback((key: FieldKey, values: LeadValues): void => {
    setErrors((current) => (current[key] && !validateField(key, values) ? withError(current, key, null) : current));
  }, []);

  return { errors, validateAll, validateOne, clearIfValid };
}

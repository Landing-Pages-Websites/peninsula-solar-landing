// The six-field quote form, in payload order. Only name and phone are required;
// email and phone use the canonical rules in ./fields, never a local copy.
import { EMAIL_ERROR, PHONE_ERROR, isValidEmail, isValidPhone, normalizeEmail, phoneDigits } from "./fields";

export const FIELD_KEYS = ["name", "phone", "email", "utility", "offGrid", "message"] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];
export type TextFieldKey = Exclude<FieldKey, "offGrid">;

/** Raw values as typed. The checkbox is a plain boolean, false until checked. */
export interface LeadValues {
  name: string;
  phone: string;
  email: string;
  utility: string;
  offGrid: boolean;
  message: string;
}

/** What is sent as `form_data` and in conversion events: all six keys, normalized. */
export type LeadFormData = LeadValues;
export type FieldErrors = Partial<Record<FieldKey, string>>;

export const EMPTY_VALUES: LeadValues = { name: "", phone: "", email: "", utility: "", offGrid: false, message: "" };

export const NAME_REQUIRED_ERROR = "Enter your full name";
export const PHONE_REQUIRED_ERROR = "Enter your phone number";
export const TEXT_MAX_LENGTH = 200;
export const MESSAGE_MAX_LENGTH = 1000;
export const INVALID_VALUE_ERROR = "This value can't be sent";
export const OFF_GRID_ERROR = "Choose whether you're interested in off-grid or battery backup";

export function tooLongError(max: number): string {
  return `Use ${max.toLocaleString("en-US")} characters or fewer`;
}
export const TEXT_TOO_LONG_ERROR = tooLongError(TEXT_MAX_LENGTH);
export const MESSAGE_TOO_LONG_ERROR = tooLongError(MESSAGE_MAX_LENGTH);

/** The one place requiredness and length caps are declared; labels and the validator both read it. */
const TEXT_RULES: Record<"name" | "utility" | "message", { required: boolean; max: number }> = {
  name: { required: true, max: TEXT_MAX_LENGTH },
  utility: { required: false, max: TEXT_MAX_LENGTH },
  message: { required: false, max: MESSAGE_MAX_LENGTH },
};

export function isRequired(key: FieldKey): boolean {
  return key === "phone" || (key in TEXT_RULES && TEXT_RULES[key as keyof typeof TEXT_RULES].required);
}

function validateText(key: keyof typeof TEXT_RULES, value: string): string | null {
  const { required, max } = TEXT_RULES[key];
  const trimmed = value.trim();
  if (trimmed.length === 0) return required ? NAME_REQUIRED_ERROR : null;
  return trimmed.length > max ? tooLongError(max) : null;
}

function validatePhone(value: string): string | null {
  if (value.trim().length === 0) return PHONE_REQUIRED_ERROR;
  return isValidPhone(value) ? null : PHONE_ERROR;
}

/** Optional: blank passes; anything typed must be a valid address. */
function validateEmail(value: string): string | null {
  if (value.trim().length === 0) return null;
  return isValidEmail(value) ? null : EMAIL_ERROR;
}

/** One field against its own declaration; the UI gate and submit() both call this. */
export function validateField(key: FieldKey, values: LeadValues): string | null {
  switch (key) {
    case "phone":
      return validatePhone(values.phone);
    case "email":
      return validateEmail(values.email);
    case "offGrid":
      return null;
    default:
      return validateText(key, values[key]);
  }
}

/** Programmatic callers can pass anything; a wrong type fails closed instead of being coerced. */
function typeErrors(input: unknown): FieldErrors {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    const expected = key === "offGrid" ? "boolean" : "string";
    if (typeof record[key] !== expected) errors[key] = key === "offGrid" ? OFF_GRID_ERROR : INVALID_VALUE_ERROR;
  }
  return errors;
}

/** The single validation entry point for typed values (the UI gate). */
export function validateLeadValues(values: LeadValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    const error = validateField(key, values);
    if (error) errors[key] = error;
  }
  return errors;
}

export class LeadValidationError extends Error {
  readonly errors: FieldErrors;

  constructor(errors: FieldErrors) {
    super(Object.values(errors).join("; "));
    this.name = "LeadValidationError";
    this.errors = errors;
  }
}

/** Throws on wrongly typed or invalid input; otherwise returns exactly the six keys that are sent. */
export function normalizeLeadValues(raw: unknown): LeadFormData {
  const typed = typeErrors(raw);
  if (Object.keys(typed).length > 0) throw new LeadValidationError(typed);
  const input = raw as LeadValues;
  const errors = validateLeadValues(input);
  if (Object.keys(errors).length > 0) throw new LeadValidationError(errors);
  return {
    name: input.name.trim(),
    phone: phoneDigits(input.phone),
    email: input.email.trim().length === 0 ? "" : normalizeEmail(input.email),
    utility: input.utility.trim(),
    offGrid: input.offGrid,
    message: input.message.trim(),
  };
}

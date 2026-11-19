// The single implementation of the email and phone rules. The lead API does no
// field validation, so what this file accepts is exactly what lands in the CRM
// and in the hashed conversion matching. Nothing else may re-implement it.

export const EMAIL_ERROR = "Enter a valid email address (e.g. you@company.com)";
export const PHONE_ERROR = "Enter a valid 10-digit US phone number";

/** Un-anchored: the browser adds its own anchors to `<input pattern>` (compiled with the `v` flag). */
export const EMAIL_PATTERN =
  "[A-Za-z0-9_%+\\-]+(?:\\.[A-Za-z0-9_%+\\-]+)*@[A-Za-z0-9](?:[A-Za-z0-9\\-]*[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9\\-]*[A-Za-z0-9])?)*\\.[A-Za-z]{2,}";
export const EMAIL_REGEX = new RegExp(`^${EMAIL_PATTERN}$`);
export const PHONE_PATTERN = "\\(\\d{3}\\) \\d{3}-\\d{4}";

export const EMAIL_MAX_LENGTH = 254;
export const EMAIL_LOCAL_MAX_LENGTH = 64;
export const EMAIL_LABEL_MAX_LENGTH = 63;

const NANP_DIGITS = 10;
const NANP_COUNTRY_CODE = "1";
const FICTIONAL_EXCHANGE = "555";
const FICTIONAL_LINE_PREFIX = "01";
/** The one QA test number the landing-page-forms Testing Forms rule mandates for every live test. */
const MANDATED_QA_PHONE = "5555550100";
/** Optional `tel:` (as pasted from links) and `+1`, then only digits, whitespace, ( ) . and hyphens/dashes. */
const PHONE_CHARACTERS = /^(?:tel:\s*)?(?:\+1)?[\d\s().\u2010-\u2015-]*$/i;

/** Judged on the trimmed text as typed: lowercasing first would let U+212A (Kelvin sign) pose as "k". */
export function isValidEmail(raw: unknown): boolean {
  if (typeof raw !== "string") return false;
  const value = raw.trim();
  if (value.length === 0 || value.length > EMAIL_MAX_LENGTH) return false;
  const at = value.indexOf("@");
  if (at > EMAIL_LOCAL_MAX_LENGTH) return false;
  const labels = value.slice(at + 1).split(".");
  if (labels.some((label) => label.length > EMAIL_LABEL_MAX_LENGTH)) return false;
  return EMAIL_REGEX.test(value);
}

/** Trim, and lowercase the domain only; the local part is kept as typed. */
export function normalizeEmail(raw: string): string {
  const value = raw.trim();
  const at = value.indexOf("@");
  if (at === -1) return value;
  return `${value.slice(0, at)}@${value.slice(at + 1).toLowerCase()}`;
}

/** US/Canada national digits, or null when the input is not a NANP number:
 *  any character a phone number does not contain, an explicit non-+1 country
 *  code, or more digits than a NANP number has. Checked before any digit is
 *  extracted, so stripping can never assemble a number that was not typed. */
export function nationalDigits(value: string): string | null {
  const trimmed = value.trim();
  if (!PHONE_CHARACTERS.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");
  const national = digits.length === NANP_DIGITS + 1 && digits.startsWith(NANP_COUNTRY_CODE) ? digits.slice(1) : digits;
  return national.length <= NANP_DIGITS ? national : null;
}

export function phoneDigits(value: string): string {
  return nationalDigits(value) ?? "";
}

/** Formats as (XXX) XXX-XXXX while typing. Input that is not a NANP number is left
 *  exactly as entered, so validation rejects it visibly instead of a truncation
 *  turning it into a different, valid-looking number. */
export function formatPhone(value: string): string {
  const d = nationalDigits(value);
  if (d === null) return value;
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function isValidPhone(value: string): boolean {
  const d = nationalDigits(value);
  if (d === null || d.length !== NANP_DIGITS) return false;
  const [area, exchange, line] = [d.slice(0, 3), d.slice(3, 6), d.slice(6)];
  const nanpBlock = /^[2-9]\d\d$/;
  const isN11 = /^[2-9]11$/;
  // 555-01XX is fictional, except the one mandated QA number.
  const isFictional = exchange === FICTIONAL_EXCHANGE && line.startsWith(FICTIONAL_LINE_PREFIX) && d !== MANDATED_QA_PHONE;
  return nanpBlock.test(area) && !isN11.test(area) && nanpBlock.test(exchange) && !isN11.test(exchange) && !isFictional;
}

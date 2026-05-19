import parsePhoneNumber from "libphonenumber-js/min";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  suggestion?: string | null;
  reason?: string | null;
}

export interface BatchValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface PasswordOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

export interface PasswordStrengthResult {
  score: number;          // 0–4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  suggestions: string[];
}

export interface DateOptions {
  minDate?: string;
  maxDate?: string;
  format?: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
}

export interface SanitizeOptions {
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  removeHtml?: boolean;
  removeSpecialChars?: boolean;
  alphanumericOnly?: boolean;
  maxLength?: number;
}

export interface ValidateX {
  // Core validators
  email: (email: string) => ValidationResult;
  password: (password: string, options?: PasswordOptions) => ValidationResult;
  passwordStrength: (password: string) => PasswordStrengthResult;
  username: (username: string) => ValidationResult;
  phone: (number: string) => ValidationResult;
  url: (link: string) => ValidationResult;
  creditCard: (cardNumber: string) => ValidationResult & { cardType?: string };

  // Date & Location
  date: (value: string, options?: DateOptions) => ValidationResult;
  postalCode: (code: string, countryCode?: string) => ValidationResult;

  // Network
  ipAddress: (ip: string) => ValidationResult & { version?: "IPv4" | "IPv6" };

  // Identity (India-specific)
  aadhaar: (number: string) => ValidationResult;
  pan: (number: string) => ValidationResult;

  // Format validators
  hexColor: (color: string) => ValidationResult;
  uuid: (id: string) => ValidationResult;
  json: (str: string) => ValidationResult & { parsed?: unknown };

  // Utilities
  sanitize: (input: string, options?: SanitizeOptions) => string;
  validateBatch: (
    data: Record<string, string>,
    rules: Record<string, keyof Omit<ValidateX, "addRule" | "validateBatch" | "sanitize" | "passwordStrength">>
  ) => BatchValidationResult;
  addRule: (name: string, func: (value: unknown) => ValidationResult) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd",
  "123456", "1234567", "12345678", "123456789", "1234567890",
  "qwerty", "qwerty123", "qwertyuiop", "qazwsx",
  "admin", "admin123", "administrator", "root",
  "letmein", "welcome", "welcome1", "welcome123",
  "abc123", "abcdef", "iloveyou", "trustno1",
  "monkey", "dragon", "master", "login",
  "pass", "pass123", "passpass",
  "sunshine", "princess", "football", "baseball",
  "shadow", "superman", "batman", "spiderman",
  "michael", "jessica", "thomas", "charlie",
  "111111", "000000", "654321", "696969",
]);

const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cmo": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaul.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yaoo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmall.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outlookk.com": "outlook.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
  "protonmai.com": "protonmail.com",
};

function detectCardType(sanitized: string): string {
  if (/^4/.test(sanitized)) return "Visa";
  if (/^5[1-5]/.test(sanitized) || /^2[2-7]\d{2}/.test(sanitized)) return "Mastercard";
  if (/^3[47]/.test(sanitized)) return "American Express";
  if (/^6(?:011|5\d{2})/.test(sanitized)) return "Discover";
  if (/^3(?:0[0-5]|[68])/.test(sanitized)) return "Diners Club";
  if (/^(?:2131|1800|35\d{3})/.test(sanitized)) return "JCB";
  if (/^(?:5018|5020|5038|6304|6759|676[1-3])/.test(sanitized)) return "Maestro";
  if (/^62/.test(sanitized)) return "UnionPay";
  return "Unknown";
}

// Verhoeff algorithm tables for Aadhaar validation
const verhoeffMult: number[][] = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];
const verhoeffPerm: number[][] = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8],
];
const verhoeffInv = [0,4,3,2,1,5,6,7,8,9];

function verhoeffCheck(num: string): boolean {
  let c = 0;
  const arr = num.split("").reverse().map(Number);
  for (let i = 0; i < arr.length; i++) {
    c = verhoeffMult[c][verhoeffPerm[i % 8][arr[i]]];
  }
  return c === 0;
}

// ─── Main Validator ───────────────────────────────────────────────────────────

export const validate: ValidateX = {

  // ── Email ──────────────────────────────────────────────────────────────────
  email: (email: string): ValidationResult => {
    const trimmed = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (trimmed.length === 0) {
      return { valid: false, reason: "Email cannot be empty.", suggestion: null };
    }
    if (!trimmed.includes("@")) {
      return { valid: false, reason: "Email must contain '@'.", suggestion: `Did you mean ${trimmed}@gmail.com?` };
    }

    const parts = trimmed.split("@");
    if (parts.length !== 2) {
      return { valid: false, reason: "Email must contain exactly one '@'.", suggestion: null };
    }

    const [local, domain] = parts;

    if (!local || local.length === 0) {
      return { valid: false, reason: "Email must have a local part before '@'.", suggestion: null };
    }
    if (!domain || domain.length === 0) {
      return { valid: false, reason: "Email must have a domain after '@'.", suggestion: null };
    }
    if (local.endsWith(".") || domain.startsWith(".")) {
      return { valid: false, reason: "No dots allowed immediately around '@'.", suggestion: null };
    }
    if (/\.{2,}/.test(trimmed)) {
      return { valid: false, reason: "Consecutive dots are not allowed.", suggestion: null };
    }
    if (local.length > 64) {
      return { valid: false, reason: "Local part (before @) cannot exceed 64 characters.", suggestion: null };
    }
    if (trimmed.length > 254) {
      return { valid: false, reason: "Email cannot exceed 254 characters.", suggestion: null };
    }

    const domainParts = domain.split(".");
    if (domainParts.length >= 2) {
      const tld = domainParts[domainParts.length - 1];
      const sld = domainParts[domainParts.length - 2];
      if (tld === sld) {
        return {
          valid: false,
          reason: "Duplicate TLD detected (e.g. .com.com).",
          suggestion: `${local}@${domainParts.slice(0, -1).join(".")}`,
        };
      }
    }

    if (!regex.test(trimmed)) {
      return { valid: false, reason: "Invalid email format.", suggestion: null };
    }

    const correctedDomain = DOMAIN_TYPOS[domain];
    if (correctedDomain) {
      return {
        valid: false,
        reason: `Domain '${domain}' looks like a typo.`,
        suggestion: `${local}@${correctedDomain}`,
      };
    }

    return { valid: true, reason: null, suggestion: null };
  },

  // ── Password ───────────────────────────────────────────────────────────────
  password: (password: string, options: PasswordOptions = {}): ValidationResult => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSpecialChar = true,
    } = options;

    if (password.length === 0) {
      return { valid: false, reason: "Password cannot be empty." };
    }

    const reasons: string[] = [];
    if (password.length < minLength) reasons.push(`at least ${minLength} characters`);
    if (requireUppercase && !/[A-Z]/.test(password)) reasons.push("an uppercase letter");
    if (requireLowercase && !/[a-z]/.test(password)) reasons.push("a lowercase letter");
    if (requireNumber && !/\d/.test(password)) reasons.push("a number");
    if (requireSpecialChar && !/[@$!%*?&#^()_\-+=~`|:;<>,.?/\\]/.test(password)) reasons.push("a special character");
    if (COMMON_PASSWORDS.has(password.toLowerCase())) reasons.push("must not be a commonly used password");
    if (/(.)\1{2,}/.test(password)) reasons.push("must not have 3+ repeating characters (e.g. 'aaa')");

    const valid = reasons.length === 0;
    return { valid, reason: valid ? null : `Password must include: ${reasons.join(", ")}.` };
  },

  // ── Password Strength Meter ────────────────────────────────────────────────
  passwordStrength: (password: string): PasswordStrengthResult => {
    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password) && /[@$!%*?&#^()_\-+=]/.test(password)) score++;
    if (COMMON_PASSWORDS.has(password.toLowerCase())) score = Math.max(0, score - 2);
    if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);

    if (password.length < 8) suggestions.push("Use at least 8 characters");
    if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters");
    if (!/[a-z]/.test(password)) suggestions.push("Add lowercase letters");
    if (!/\d/.test(password)) suggestions.push("Add numbers");
    if (!/[@$!%*?&#^()_\-+=]/.test(password)) suggestions.push("Add special characters");
    if (password.length < 12) suggestions.push("Use 12+ characters for a stronger password");

    const labels: PasswordStrengthResult["label"][] = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    return { score, label: labels[Math.min(score, 4)], suggestions };
  },

  // ── Username ───────────────────────────────────────────────────────────────
  username: (username: string): ValidationResult => {
    if (!username || username.length === 0) {
      return { valid: false, reason: "Username cannot be empty." };
    }
    if (username.length < 3 || username.length > 20) {
      return { valid: false, reason: "Username must be 3–20 characters long." };
    }
    if (!/^[a-zA-Z]/.test(username)) {
      return { valid: false, reason: "Username must start with a letter." };
    }
    if (/[^a-zA-Z0-9_]/.test(username)) {
      return { valid: false, reason: "Username may only contain letters, numbers, and underscores." };
    }
    if (/_{2,}/.test(username) || username.endsWith("_")) {
      return { valid: false, reason: "No consecutive underscores or trailing underscore." };
    }
    return { valid: true, reason: null };
  },

  // ── Phone ──────────────────────────────────────────────────────────────────
  phone: (number: string): ValidationResult => {
    if (!number || number.trim().length === 0) {
      return { valid: false, reason: "Phone number cannot be empty." };
    }
    try {
      const phone = parsePhoneNumber(number);
      const valid = phone ? phone.isValid() : false;
      return {
        valid,
        reason: valid ? null : "Invalid phone number. Include country code (e.g. +91 for India, +1 for US).",
      };
    } catch {
      return { valid: false, reason: "Could not parse phone number. Include country code." };
    }
  },

  // ── URL ────────────────────────────────────────────────────────────────────
  url: (str: string): ValidationResult => {
    if (!str || str.trim().length === 0) {
      return { valid: false, reason: "URL cannot be empty." };
    }
    try {
      const url = new URL(str.trim());
      const valid = url.protocol === "http:" || url.protocol === "https:";
      return { valid, reason: valid ? null : "URL must use http:// or https://." };
    } catch {
      return { valid: false, reason: "Invalid URL. Must start with http:// or https://." };
    }
  },

  // ── Credit Card ────────────────────────────────────────────────────────────
  creditCard: (cardNumber: string): ValidationResult & { cardType?: string } => {
    if (!cardNumber || cardNumber.trim().length === 0) {
      return { valid: false, reason: "Card number cannot be empty.", cardType: undefined };
    }

    const sanitized = cardNumber.replace(/\D/g, "");

    if (sanitized.length < 13 || sanitized.length > 19) {
      return { valid: false, reason: "Card number must be 13–19 digits.", cardType: undefined };
    }

    // Check for obviously fake numbers (all same digit)
    if (/^(.)\1+$/.test(sanitized)) {
      return { valid: false, reason: "Card number cannot be all the same digit.", cardType: undefined };
    }

    let sum = 0;
    let shouldDouble = false;
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10);
      if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const valid = sum % 10 === 0;
    return {
      valid,
      reason: valid ? null : "Invalid credit card number (failed Luhn check).",
      cardType: valid ? detectCardType(sanitized) : undefined,
    };
  },

  // ── Date ───────────────────────────────────────────────────────────────────
  date: (value: string, options: DateOptions = {}): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { valid: false, reason: "Date cannot be empty." };
    }
    const { minDate, maxDate, format = "YYYY-MM-DD" } = options;
    let parsed: Date | null = null;

    if (format === "YYYY-MM-DD") {
      const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) parsed = new Date(`${m[1]}-${m[2]}-${m[3]}`);
    } else if (format === "DD/MM/YYYY") {
      const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) parsed = new Date(`${m[3]}-${m[2]}-${m[1]}`);
    } else if (format === "MM/DD/YYYY") {
      const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) parsed = new Date(`${m[3]}-${m[1]}-${m[2]}`);
    }

    if (!parsed || isNaN(parsed.getTime())) {
      return { valid: false, reason: `Invalid date. Expected format: ${format}.` };
    }
    if (minDate && parsed < new Date(minDate)) {
      return { valid: false, reason: `Date must be on or after ${minDate}.` };
    }
    if (maxDate && parsed > new Date(maxDate)) {
      return { valid: false, reason: `Date must be on or before ${maxDate}.` };
    }
    return { valid: true, reason: null };
  },

  // ── Postal Code ────────────────────────────────────────────────────────────
  postalCode: (code: string, countryCode = "IN"): ValidationResult => {
    if (!code || code.trim().length === 0) {
      return { valid: false, reason: "Postal code cannot be empty." };
    }
    const patterns: Record<string, RegExp> = {
      IN: /^[1-9][0-9]{5}$/,
      US: /^\d{5}(-\d{4})?$/,
      UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
      AU: /^\d{4}$/,
      DE: /^\d{5}$/,
      FR: /^\d{5}$/,
      JP: /^\d{3}-\d{4}$/,
      SG: /^\d{6}$/,
    };

    const pattern = patterns[countryCode.toUpperCase()];
    if (!pattern) {
      return { valid: false, reason: `Postal code validation not supported for country: ${countryCode}.` };
    }
    const valid = pattern.test(code.trim());
    return { valid, reason: valid ? null : `Invalid postal code format for ${countryCode}.` };
  },

  // ── IP Address ─────────────────────────────────────────────────────────────
  ipAddress: (ip: string): ValidationResult & { version?: "IPv4" | "IPv6" } => {
    if (!ip || ip.trim().length === 0) {
      return { valid: false, reason: "IP address cannot be empty.", version: undefined };
    }
    const trimmed = ip.trim();
    const ipv4 = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;
    // Comprehensive IPv6 including compressed notation
    const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;

    if (ipv4.test(trimmed)) return { valid: true, reason: null, version: "IPv4" };
    if (ipv6.test(trimmed)) return { valid: true, reason: null, version: "IPv6" };
    return { valid: false, reason: "Invalid IP address. Must be valid IPv4 or IPv6.", version: undefined };
  },

  // ── Aadhaar (India) ────────────────────────────────────────────────────────
  aadhaar: (number: string): ValidationResult => {
    const cleaned = number.replace(/\s|-/g, "");
    if (!/^\d{12}$/.test(cleaned)) {
      return { valid: false, reason: "Aadhaar must be exactly 12 digits." };
    }
    if (/^0/.test(cleaned) || /^1/.test(cleaned)) {
      return { valid: false, reason: "Aadhaar number cannot start with 0 or 1." };
    }
    const valid = verhoeffCheck(cleaned);
    return { valid, reason: valid ? null : "Invalid Aadhaar number (checksum failed)." };
  },

  // ── PAN Card (India) ───────────────────────────────────────────────────────
  pan: (number: string): ValidationResult => {
    const cleaned = number.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleaned)) {
      return {
        valid: false,
        reason: "Invalid PAN format. Must be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).",
      };
    }
    const validEntityChars = ["P", "C", "H", "F", "A", "T", "B", "L", "J", "G"];
    const entityChar = cleaned[3];
    if (!validEntityChars.includes(entityChar)) {
      return { valid: false, reason: `Invalid PAN entity type '${entityChar}'.` };
    }
    return { valid: true, reason: null };
  },

  // ── Hex Color ──────────────────────────────────────────────────────────────
  hexColor: (color: string): ValidationResult => {
    if (!color || color.trim().length === 0) {
      return { valid: false, reason: "Color cannot be empty." };
    }
    const trimmed = color.trim();
    const valid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed);
    return {
      valid,
      reason: valid ? null : "Invalid hex color. Must be #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.",
    };
  },

  // ── UUID ───────────────────────────────────────────────────────────────────
  uuid: (id: string): ValidationResult => {
    if (!id || id.trim().length === 0) {
      return { valid: false, reason: "UUID cannot be empty." };
    }
    const valid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
    return { valid, reason: valid ? null : "Invalid UUID format." };
  },

  // ── JSON ───────────────────────────────────────────────────────────────────
  json: (str: string): ValidationResult & { parsed?: unknown } => {
    if (!str || str.trim().length === 0) {
      return { valid: false, reason: "Input cannot be empty." };
    }
    try {
      const parsed = JSON.parse(str.trim());
      return { valid: true, reason: null, parsed };
    } catch (err) {
      const msg = err instanceof SyntaxError ? err.message : "Invalid JSON.";
      return { valid: false, reason: `Invalid JSON: ${msg}` };
    }
  },

  // ── Sanitize ───────────────────────────────────────────────────────────────
  sanitize: (input: string, options: SanitizeOptions = {}): string => {
    const {
      trim = true,
      lowercase = false,
      uppercase = false,
      removeHtml = true,
      removeSpecialChars = false,
      alphanumericOnly = false,
      maxLength,
    } = options;

    let result = input;
    if (removeHtml) {
      result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
      result = result.replace(/<[^>]*>/g, "");
      result = result.replace(/&[a-z]+;/gi, " ");
    }
    if (alphanumericOnly) result = result.replace(/[^a-zA-Z0-9\s]/g, "");
    else if (removeSpecialChars) result = result.replace(/[^a-zA-Z0-9\s@._\-]/g, "");
    if (trim) result = result.trim();
    if (lowercase) result = result.toLowerCase();
    else if (uppercase) result = result.toUpperCase();
    if (maxLength && result.length > maxLength) result = result.slice(0, maxLength);
    return result;
  },

  // ── Batch Validation ───────────────────────────────────────────────────────
  validateBatch: (
    data: Record<string, string>,
    rules: Record<string, keyof Omit<ValidateX, "addRule" | "validateBatch" | "sanitize" | "passwordStrength">>
  ): BatchValidationResult => {
    const errors: Record<string, string> = {};
    for (const [field, validatorName] of Object.entries(rules)) {
      const fn = validate[validatorName] as ((v: string) => ValidationResult) | undefined;
      if (typeof fn !== "function") {
        errors[field] = `Unknown validator: ${String(validatorName)}`;
        continue;
      }
      const result = fn(data[field] ?? "");
      if (!result.valid) errors[field] = result.reason ?? "Invalid value.";
    }
    return { valid: Object.keys(errors).length === 0, errors };
  },

  // ── Add Custom Rule ────────────────────────────────────────────────────────
  addRule: function (name: string, func: (value: unknown) => ValidationResult): void {
    if (typeof func !== "function") throw new Error("Rule must be a function.");
    (this as unknown as Record<string, unknown>)[name] = func;
  },
};

export default validate;

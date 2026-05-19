declare module "validatex-0.1" {
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

  export interface DateOptions {
    minDate?: string;
    maxDate?: string;
    format?: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  }

  export interface ValidateX {
    email: (email: string) => ValidationResult;
    password: (password: string, options?: PasswordOptions) => ValidationResult;
    username: (username: string) => ValidationResult;
    phone: (number: string) => ValidationResult;
    url: (link: string) => ValidationResult;
    creditCard: (cardNumber: string) => ValidationResult & { cardType?: string };
    date: (value: string, options?: DateOptions) => ValidationResult;
    postalCode: (code: string, countryCode?: string) => ValidationResult;
    ipAddress: (ip: string) => ValidationResult & { version?: "IPv4" | "IPv6" };
    validateBatch: (
      data: Record<string, string>,
      rules: Record<string, keyof Omit<ValidateX, "addRule" | "validateBatch">>
    ) => BatchValidationResult;
    addRule: (name: string, func: (value: unknown) => ValidationResult) => void;
  }

  const validate: ValidateX;
  export default validate;
}

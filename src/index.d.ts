declare module "validatex" {
  export interface ValidationResult {
    valid: boolean;
    suggestion?: string | null;
    reason?: string | null;
  }

  export interface ValidateX {
    email: (email: string) => ValidationResult;
    password: (password: string) => ValidationResult;
    username: (username: string) => ValidationResult;
    phone: (number: string) => ValidationResult;
    url: (link: string) => ValidationResult;
    creditCard: (cardNumber: string) => ValidationResult;
    addRule: (name: string, func: (value: any) => ValidationResult) => void;
  }

  const validate: ValidateX;
  export default validate;
}

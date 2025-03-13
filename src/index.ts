import parsePhoneNumber from "libphonenumber-js/min";


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

export const validate: ValidateX = {
  email: (email: string): ValidationResult => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const consecutiveDots = /\.{2,}/.test(email);
    const atSymbolValid = email.indexOf("@") > 0 && email.lastIndexOf("@") === email.indexOf("@");
    const parts = email.split("@");
    const dotsAroundAt = parts.length === 2 && (parts[0].endsWith(".") || parts[1].startsWith("."));
    const domainParts = parts.length === 2 ? parts[1].split(".") : [];
    const hasDuplicateTLD = domainParts.length >= 2 && domainParts[domainParts.length - 1] === domainParts[domainParts.length - 2];

    const valid = regex.test(email) && !consecutiveDots && atSymbolValid && !dotsAroundAt && !hasDuplicateTLD;

    return {
      valid,
      reason: valid ? null : "Invalid email format: check '@' position, consecutive dots, or incorrect domain.",
      suggestion: valid 
        ? null 
        : !email.includes("@") 
          ? `Did you mean ${email}@example.com?` 
          : email.endsWith(".com.com") 
            ? email.slice(0, -4)  
            : `${email}.com`, 
    };
  },


  password: (password: string): ValidationResult => {
    const lengthCheck = password.length >= 8;
    const upperCaseCheck = /[A-Z]/.test(password);
    const lowerCaseCheck = /[a-z]/.test(password);
    const numberCheck = /\d/.test(password);
    const specialCharCheck = /[@$!%*?&]/.test(password);
    const commonPasswords = ["password", "123456", "qwerty"];
    const commonCheck = !commonPasswords.includes(password.toLowerCase());

    const valid = lengthCheck && upperCaseCheck && lowerCaseCheck && numberCheck && specialCharCheck && commonCheck;

    return {
      valid,
      reason: valid ? null : "Password must be at least 8 characters with uppercase, lowercase, number, and special character. Avoid common passwords.",
    };
  },

  username: (username: string): ValidationResult => {
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
    const specialCharCheck = /_{2,}/.test(username) || username.endsWith("_") || username.startsWith("_");
    const valid = regex.test(username) && !specialCharCheck;

    return {
      valid,
      reason: valid ? null : "Username must start with a letter, be 3-16 characters long, and contain only letters, numbers, or single underscores.",
    };
  },

  phone: (number: string): ValidationResult => {
    const phone = parsePhoneNumber(number);
    const valid = phone ? phone.isValid() : false;

    return {
      valid,
      reason: valid ? null : "Invalid phone number format. Use correct country code if needed.",
    };
  },

  url: (str: string): ValidationResult => {
    const regex = /^(https?:\/\/)(www\.)?[\w-]+(\.[a-z]{2,6})+([/?#].*)?$/;
    const valid = regex.test(str);

    return {
      valid,
      reason: valid ? null : "Invalid URL format. Ensure correct http/https structure.",
    };
  },

  creditCard: (cardNumber: string): ValidationResult => {
    const sanitized = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const valid = sum % 10 === 0;

    return {
      valid,
      reason: valid ? null : "Invalid credit card number.",
    };
  },

  addRule: function (name: string, func: (value: any) => ValidationResult) {
    (this as any)[name] = func;
  },
};

export default validate;

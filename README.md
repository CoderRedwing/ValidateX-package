# ValidateX

> A lightweight, zero-fuss validation library for JavaScript and TypeScript.

[![npm version](https://img.shields.io/npm/v/validatex-0.1.svg)](https://www.npmjs.com/package/validatex-0.1)
[![license](https://img.shields.io/npm/l/validatex-0.1.svg)](https://github.com/CoderRedwing/ValidateX-package/blob/master/LICENSE)

## Why ValidateX?

- ✅ **10 validators** — email, password, username, phone, URL, credit card, date, postal code, IP address, batch
- 💡 **Smart suggestions** — catches `gmial.com` and suggests `gmail.com`
- 🃏 **Card type detection** — tells you Visa vs Mastercard vs Amex
- 🌍 **International phone support** — powered by `libphonenumber-js`
- 🔧 **Fully extensible** — add your own rules with `addRule()`
- 📦 **TypeScript-first** — full type definitions included
- 🪶 **Zero config** — works with ES Modules and CommonJS

---

## Installation

```sh
npm install validatex-0.1
```

---

## Quick Start

```ts
import validate from "validatex-0.1";

// Email with typo detection
validate.email("user@gmial.com");
// { valid: false, reason: "Domain 'gmial.com' looks like a typo.", suggestion: "user@gmail.com" }

// Batch validate an entire form at once
const result = validate.validateBatch(
  { email: "user@gmail.com", password: "Secure@123" },
  { email: "email", password: "password" }
);
// { valid: true, errors: {} }
```

---

## API Reference

### `validate.email(email)`

Validates email format and detects common domain typos.

```ts
validate.email("test@gmail.com");
// { valid: true, reason: null, suggestion: null }

validate.email("test@gmial.com");
// { valid: false, reason: "Domain 'gmial.com' looks like a typo.", suggestion: "test@gmail.com" }

validate.email("testgmail.com");
// { valid: false, reason: "Email must contain '@'.", suggestion: "testgmail.com@gmail.com" }
```

---

### `validate.password(password, options?)`

Validates password strength. Fully configurable.

```ts
validate.password("Secure@123");
// { valid: true, reason: null }

validate.password("weakpass");
// { valid: false, reason: "Password must include: an uppercase letter, a number, a special character." }

// Custom options
validate.password("mypassword", { minLength: 10, requireSpecialChar: false });
```

**Options:**

| Option | Default | Description |
|---|---|---|
| `minLength` | `8` | Minimum character count |
| `requireUppercase` | `true` | Require at least one uppercase letter |
| `requireLowercase` | `true` | Require at least one lowercase letter |
| `requireNumber` | `true` | Require at least one digit |
| `requireSpecialChar` | `true` | Require `@$!%*?&#` etc. |

---

### `validate.username(username)`

```ts
validate.username("ajitesh_dev");
// { valid: true, reason: null }

validate.username("user__name");
// { valid: false, reason: "No consecutive underscores or start/end with underscore." }
```

Rules: 3–16 chars, start with a letter, only letters/numbers/underscores, no consecutive underscores.

---

### `validate.phone(number)`

International phone number validation via `libphonenumber-js`.

```ts
validate.phone("+14155552671");   // { valid: true }
validate.phone("+919876543210");  // { valid: true }
validate.phone("12345");          // { valid: false }
```

> Always include country code (e.g. `+91` for India, `+1` for US).

---

### `validate.url(link)`

```ts
validate.url("https://example.com");          // { valid: true }
validate.url("http://localhost:3000/api");     // { valid: true }
validate.url("example.com");                  // { valid: false }
```

---

### `validate.creditCard(cardNumber)`

Uses the Luhn algorithm. Also detects card type.

```ts
validate.creditCard("4111111111111111");
// { valid: true, reason: null, cardType: "Visa" }

validate.creditCard("5500005555555559");
// { valid: true, cardType: "Mastercard" }

validate.creditCard("1234567812345678");
// { valid: false, reason: "Invalid credit card number (failed Luhn check).", cardType: undefined }
```

Supported types: Visa, Mastercard, American Express, Discover, Diners Club, JCB, Maestro.

---

### `validate.date(value, options?)`

```ts
validate.date("2025-06-15");
// { valid: true }

validate.date("15/06/2025", { format: "DD/MM/YYYY" });
// { valid: true }

validate.date("2020-01-01", { minDate: "2023-01-01" });
// { valid: false, reason: "Date must be on or after 2023-01-01." }
```

**Options:** `format` (`YYYY-MM-DD` | `DD/MM/YYYY` | `MM/DD/YYYY`), `minDate`, `maxDate`.

---

### `validate.postalCode(code, countryCode?)`

```ts
validate.postalCode("110001");          // India (default) → { valid: true }
validate.postalCode("90210", "US");     // { valid: true }
validate.postalCode("SW1A 1AA", "UK");  // { valid: true }
```

Supported countries: `IN`, `US`, `UK`, `CA`, `AU`, `DE`.

---

### `validate.ipAddress(ip)`

```ts
validate.ipAddress("192.168.1.1");
// { valid: true, version: "IPv4" }

validate.ipAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
// { valid: true, version: "IPv6" }
```

---

### `validate.validateBatch(data, rules)`

Validate an entire form object in one call.

```ts
const result = validate.validateBatch(
  {
    email: "user@gmail.com",
    password: "Weak",
    username: "aj",
  },
  {
    email: "email",
    password: "password",
    username: "username",
  }
);

// {
//   valid: false,
//   errors: {
//     password: "Password must include: an uppercase letter, a number, a special character.",
//     username: "Username must be 3–16 characters long."
//   }
// }
```

---

### `validate.addRule(name, func)`

Add your own custom validator.

```ts
validate.addRule("isEven", (num) => ({
  valid: Number(num) % 2 === 0,
  reason: Number(num) % 2 !== 0 ? "Number must be even." : null,
}));

validate.isEven(4);  // { valid: true }
validate.isEven(5);  // { valid: false, reason: "Number must be even." }
```

---

## License

MIT © 2025 [Ajitesh Mishra](https://github.com/CoderRedwing)

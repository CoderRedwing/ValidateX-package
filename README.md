# ValidateX

A lightweight and flexible validation library for JavaScript and TypeScript.

## Features

- Email Validation – Detects typos and suggests corrections
- Strong Password Enforcement – Ensures security standards
- Username Validation – Enforces proper character usage
- Phone Number Validation – Supports international formats
- URL Validation – Checks for correct structure
- Credit Card Validation – Uses the Luhn algorithm
- Custom Validation Rules – Extendable API for custom needs

---

## Installation

```sh
npm install validatex-0.1
```

---

## Usage

### Importing ValidateX

For ES Modules (JavaScript/TypeScript):

```ts
import ValidateX from "validatex-0.1";
```

For CommonJS:

```js
const ValidateX = require("validatex-0.1");
```

---

## API Reference

### Email Validation

```js
import ValidateX from "validatex-0.1";

// Validates an email address
function checkEmail(email) {
  const result = ValidateX.email(email);
  console.log(result);
}

checkEmail("test@@gmail.com");
```

### Password Validation

```js
import ValidateX from "validatex-0.1";

// Ensures password meets security standards
// A strong password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.
function checkPassword(password) {
  const result = ValidateX.password(password);
  console.log(result);
}

checkPassword("weakpass");
```

### Username Validation

```js
import ValidateX from "validatex-0.1";

// Checks if a username follows valid character constraints
// A valid username must start with a letter, be 3-16 characters long, and contain only letters, numbers, or single underscores.
function checkUsername(username) {
  const result = ValidateX.username(username);
  console.log(result);
}

checkUsername("user__name");
```

### Phone Number Validation

```js
import ValidateX from "validatex-0.1";

// Validates an international phone number
// A valid phone number should include the correct country code if applicable.
function checkPhone(phone) {
  const result = ValidateX.phone(phone);
  console.log(result);
}

checkPhone("12345");
```

### URL Validation

```js
import ValidateX from "validatex-0.1";

// Ensures a properly formatted URL
// A valid URL should start with http:// or https://
function checkURL(url) {
  const result = ValidateX.url(url);
  console.log(result);
}

checkURL("example");
```

### Credit Card Validation

```js
import ValidateX from "validatex-0.1";

// Validates a credit card number using the Luhn algorithm
function checkCreditCard(cardNumber) {
  const result = ValidateX.creditCard(cardNumber);
  console.log(result);
}

checkCreditCard("1234567812345678");
```

### Custom Validation Rules

```js
import ValidateX from "validatex-0.1";

// Define a custom validation rule to check if a number is even
ValidateX.addRule("isEven", (num) => ({
  valid: num % 2 === 0,
  reason: num % 2 !== 0 ? "Number is not even." : null,
}));

function checkEvenNumber(number) {
  const result = ValidateX.isEven(number);
  console.log(result);
}

checkEvenNumber(5);
```

---

## License

© 2025 Ajitesh

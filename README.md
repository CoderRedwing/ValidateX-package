# **ValidateX**  

A lightweight and flexible validation library for **JavaScript** and **TypeScript**.  

## **Features**  

- 📧 **Email Validation** – Detects typos and suggests corrections  
- 🔐 **Strong Password Enforcement** – Ensures security standards  
- 👤 **Username Validation** – Enforces proper character usage  
- 📞 **Phone Number Validation** – Supports international formats  
- 🌐 **URL Validation** – Checks for correct structure  
- 💳 **Credit Card Validation** – Uses the Luhn algorithm  
- ⚡ **Custom Validation Rules** – Extendable API for custom needs  

---

## **Installation**  

```sh
npm install validatex-0.1
```

---

## **Usage**  

### **CommonJS (JavaScript)**  
```js
const ValidateX = require("validatex-0.1");

console.log(ValidateX.email("test@example.com")); 
// { valid: true, reason: null, suggestion: null }
```

### **ES Modules (JavaScript/TypeScript)**  
```ts
import ValidateX from "validatex-0.1";

console.log(ValidateX.email("test@example.com")); 
// { valid: true, reason: null, suggestion: null }
```

---

## **API Reference**  

### `ValidateX.email(email: string): ValidationResult`  
📧 **Validates an email address**, detecting typos and suggesting corrections.  
```js
ValidateX.email("test@@gmail.com"); 
// { valid: false, reason: "Invalid email format", suggestion: "Did you mean test@gmail.com?" }
```

### `ValidateX.password(password: string): ValidationResult`  
🔐 **Ensures password meets security standards** (length, uppercase, number, special character).  
```js
ValidateX.password("weakpass"); 
// { valid: false, reason: "Password must be at least 8 characters with uppercase, lowercase, number, and special character." }
```

### `ValidateX.username(username: string): ValidationResult`  
👤 **Checks if a username follows valid character constraints**.  
```js
ValidateX.username("user__name"); 
// { valid: false, reason: "Username must start with a letter, be 3-16 characters long, and contain only letters, numbers, or single underscores." }
```

### `ValidateX.phone(number: string): ValidationResult`  
📞 **Validates an international phone number**.  
```js
ValidateX.phone("12345"); 
// { valid: false, reason: "Invalid phone number format. Use correct country code if needed." }
```

### `ValidateX.url(link: string): ValidationResult`  
🌐 **Ensures a properly formatted URL**.  
```js
ValidateX.url("example"); 
// { valid: false, reason: "Invalid URL format. Ensure correct http/https structure." }
```

### `ValidateX.creditCard(cardNumber: string): ValidationResult`  
💳 **Validates a credit card number using the Luhn algorithm**.  
```js
ValidateX.creditCard("1234567812345678"); 
// { valid: false, reason: "Invalid credit card number." }
```

### `ValidateX.addRule(name: string, func: (value: any) => ValidationResult): void`  
⚡ **Create custom validation rules dynamically**.  
```js
ValidateX.addRule("isEven", (num) => ({
  valid: num % 2 === 0,
  reason: num % 2 !== 0 ? "Number is not even." : null,
}));

console.log(ValidateX.isEven(5)); 
// { valid: false, reason: "Number is not even." }
```

---

## **License**  
© 2025 **Ajitesh** 
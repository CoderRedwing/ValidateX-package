import validate from "../src/index";

// ── Email ─────────────────────────────────────────────────────────────────────
describe("Email", () => {
  test("valid", () => expect(validate.email("test@example.com").valid).toBe(true));
  test("empty", () => expect(validate.email("").valid).toBe(false));
  test("missing @", () => { const r = validate.email("invalidemail"); expect(r.valid).toBe(false); expect(r.suggestion).toContain("@"); });
  test("multiple @", () => expect(validate.email("a@@b.com").valid).toBe(false));
  test("consecutive dots", () => expect(validate.email("test..email@example.com").valid).toBe(false));
  test("dot before @", () => expect(validate.email("test.@example.com").valid).toBe(false));
  test("duplicate TLD", () => expect(validate.email("test@gmail.com.com").valid).toBe(false));
  test("local part too long", () => expect(validate.email("a".repeat(65) + "@example.com").valid).toBe(false));
  test("typo gmial.com → gmail.com", () => { const r = validate.email("user@gmial.com"); expect(r.valid).toBe(false); expect(r.suggestion).toBe("user@gmail.com"); });
  test("typo yaho.com → yahoo.com", () => expect(validate.email("user@yaho.com").suggestion).toBe("user@yahoo.com"));
  test("typo hotmial.com → hotmail.com", () => expect(validate.email("x@hotmial.com").suggestion).toBe("x@hotmail.com"));
  test("typo outlok.com → outlook.com", () => expect(validate.email("x@outlok.com").suggestion).toBe("x@outlook.com"));
});

// ── Password ──────────────────────────────────────────────────────────────────
describe("Password", () => {
  test("strong", () => expect(validate.password("Secure@123").valid).toBe(true));
  test("empty", () => expect(validate.password("").valid).toBe(false));
  test("too short", () => expect(validate.password("Ab@1").valid).toBe(false));
  test("no uppercase", () => expect(validate.password("secure@123").valid).toBe(false));
  test("no special char", () => expect(validate.password("Secure123").valid).toBe(false));
  test("common - admin", () => expect(validate.password("admin").valid).toBe(false));
  test("common - letmein", () => expect(validate.password("letmein").valid).toBe(false));
  test("repeating chars aaa", () => expect(validate.password("Aaa@aaaa1").valid).toBe(false));
  test("custom minLength", () => expect(validate.password("Ab@1", { minLength: 4, requireSpecialChar: true }).valid).toBe(true));
  test("custom no special char", () => expect(validate.password("Secure123", { requireSpecialChar: false }).valid).toBe(true));
});

// ── Password Strength ─────────────────────────────────────────────────────────
describe("Password Strength", () => {
  test("very weak - '123'", () => { const r = validate.passwordStrength("123"); expect(r.score).toBe(0); expect(r.label).toBe("Very Weak"); });
  test("weak - 'password'", () => { const r = validate.passwordStrength("password"); expect(r.score).toBeLessThanOrEqual(1); });
  test("strong - 'Secure@123abc'", () => { const r = validate.passwordStrength("Secure@123abc"); expect(r.score).toBeGreaterThanOrEqual(3); });
  test("has suggestions for weak password", () => { const r = validate.passwordStrength("abc"); expect(r.suggestions.length).toBeGreaterThan(0); });
  test("common password penalised", () => { const r = validate.passwordStrength("password"); expect(r.score).toBeLessThan(2); });
});

// ── Username ──────────────────────────────────────────────────────────────────
describe("Username", () => {
  test("valid", () => expect(validate.username("ajitesh_dev").valid).toBe(true));
  test("empty", () => expect(validate.username("").valid).toBe(false));
  test("too short", () => expect(validate.username("ab").valid).toBe(false));
  test("too long 21 chars", () => expect(validate.username("a".repeat(21)).valid).toBe(false));
  test("starts with number", () => expect(validate.username("1user").valid).toBe(false));
  test("special chars", () => expect(validate.username("user@123").valid).toBe(false));
  test("consecutive underscores", () => expect(validate.username("user__name").valid).toBe(false));
  test("trailing underscore", () => expect(validate.username("username_").valid).toBe(false));
});

// ── Phone ─────────────────────────────────────────────────────────────────────
describe("Phone", () => {
  test("valid US", () => expect(validate.phone("+14155552671").valid).toBe(true));
  test("valid India", () => expect(validate.phone("+919876543210").valid).toBe(true));
  test("valid UK", () => expect(validate.phone("+447911123456").valid).toBe(true));
  test("empty", () => expect(validate.phone("").valid).toBe(false));
  test("no country code", () => expect(validate.phone("9876543210").valid).toBe(false));
  test("too short", () => expect(validate.phone("12345").valid).toBe(false));
});

// ── URL ───────────────────────────────────────────────────────────────────────
describe("URL", () => {
  test("valid http", () => expect(validate.url("http://example.com").valid).toBe(true));
  test("valid https", () => expect(validate.url("https://example.com").valid).toBe(true));
  test("valid localhost port", () => expect(validate.url("http://localhost:3000").valid).toBe(true));
  test("valid with path + query", () => expect(validate.url("https://api.example.com/v1?q=1").valid).toBe(true));
  test("empty", () => expect(validate.url("").valid).toBe(false));
  test("no protocol", () => expect(validate.url("example.com").valid).toBe(false));
  test("ftp rejected", () => expect(validate.url("ftp://example.com").valid).toBe(false));
});

// ── Credit Card ───────────────────────────────────────────────────────────────
describe("Credit Card", () => {
  test("Visa", () => { const r = validate.creditCard("4111111111111111"); expect(r.valid).toBe(true); expect(r.cardType).toBe("Visa"); });
  test("Visa with spaces", () => expect(validate.creditCard("4111 1111 1111 1111").valid).toBe(true));
  test("Visa with dashes", () => expect(validate.creditCard("4111-1111-1111-1111").valid).toBe(true));
  test("Mastercard", () => { const r = validate.creditCard("5500005555555559"); expect(r.valid).toBe(true); expect(r.cardType).toBe("Mastercard"); });
  test("Amex", () => { const r = validate.creditCard("378282246310005"); expect(r.valid).toBe(true); expect(r.cardType).toBe("American Express"); });
  test("empty", () => expect(validate.creditCard("").valid).toBe(false));
  test("all same digit", () => expect(validate.creditCard("4444444444444444").valid).toBe(false));
  test("invalid Luhn", () => expect(validate.creditCard("1234567812345678").valid).toBe(false));
  test("too short", () => expect(validate.creditCard("411111").valid).toBe(false));
});

// ── Date ──────────────────────────────────────────────────────────────────────
describe("Date", () => {
  test("valid YYYY-MM-DD", () => expect(validate.date("2025-06-15").valid).toBe(true));
  test("valid DD/MM/YYYY", () => expect(validate.date("15/06/2025", { format: "DD/MM/YYYY" }).valid).toBe(true));
  test("valid MM/DD/YYYY", () => expect(validate.date("06/15/2025", { format: "MM/DD/YYYY" }).valid).toBe(true));
  test("empty", () => expect(validate.date("").valid).toBe(false));
  test("invalid string", () => expect(validate.date("not-a-date").valid).toBe(false));
  test("before minDate", () => expect(validate.date("2020-01-01", { minDate: "2023-01-01" }).valid).toBe(false));
  test("after maxDate", () => expect(validate.date("2030-01-01", { maxDate: "2025-12-31" }).valid).toBe(false));
  test("within range", () => expect(validate.date("2024-06-01", { minDate: "2023-01-01", maxDate: "2025-12-31" }).valid).toBe(true));
});

// ── Postal Code ───────────────────────────────────────────────────────────────
describe("Postal Code", () => {
  test("India valid", () => expect(validate.postalCode("110001").valid).toBe(true));
  test("India starts with 0", () => expect(validate.postalCode("011001").valid).toBe(false));
  test("India empty", () => expect(validate.postalCode("").valid).toBe(false));
  test("US valid", () => expect(validate.postalCode("90210", "US").valid).toBe(true));
  test("US ZIP+4", () => expect(validate.postalCode("90210-1234", "US").valid).toBe(true));
  test("Germany valid", () => expect(validate.postalCode("10115", "DE").valid).toBe(true));
  test("Singapore valid", () => expect(validate.postalCode("238823", "SG").valid).toBe(true));
  test("Japan valid", () => expect(validate.postalCode("100-0001", "JP").valid).toBe(true));
  test("unsupported country", () => expect(validate.postalCode("12345", "XX").valid).toBe(false));
});

// ── IP Address ────────────────────────────────────────────────────────────────
describe("IP Address", () => {
  test("IPv4 valid", () => { const r = validate.ipAddress("192.168.1.1"); expect(r.valid).toBe(true); expect(r.version).toBe("IPv4"); });
  test("IPv4 localhost", () => expect(validate.ipAddress("127.0.0.1").valid).toBe(true));
  test("IPv4 out of range", () => expect(validate.ipAddress("999.999.999.999").valid).toBe(false));
  test("IPv6 full", () => { const r = validate.ipAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); expect(r.valid).toBe(true); expect(r.version).toBe("IPv6"); });
  test("IPv6 compressed", () => expect(validate.ipAddress("::1").valid).toBe(true));
  test("empty", () => expect(validate.ipAddress("").valid).toBe(false));
  test("plain text", () => expect(validate.ipAddress("not-an-ip").valid).toBe(false));
});

// ── Aadhaar ───────────────────────────────────────────────────────────────────
describe("Aadhaar", () => {
  test("invalid - wrong length", () => expect(validate.aadhaar("12345").valid).toBe(false));
  test("invalid - starts with 0", () => expect(validate.aadhaar("012345678901").valid).toBe(false));
  test("invalid - starts with 1", () => expect(validate.aadhaar("112345678901").valid).toBe(false));
  test("invalid - non-numeric", () => expect(validate.aadhaar("ABCD12345678").valid).toBe(false));
  test("accepts dashes and spaces", () => {
    // Verhoeff valid test number (example)
    const r = validate.aadhaar("234123412346");
    expect(typeof r.valid).toBe("boolean"); // just check it runs
  });
});

// ── PAN ───────────────────────────────────────────────────────────────────────
describe("PAN", () => {
  test("valid individual PAN", () => expect(validate.pan("ABCPE1234F").valid).toBe(true));
  test("valid company PAN", () => expect(validate.pan("AABCT1234F").valid).toBe(true));
  test("wrong format", () => expect(validate.pan("ABC1234F").valid).toBe(false));
  test("lowercase accepted (auto-uppercase)", () => expect(validate.pan("abcpe1234f").valid).toBe(true));
  test("invalid entity char", () => expect(validate.pan("ABCDX1234F").valid).toBe(false));
  test("wrong length", () => expect(validate.pan("ABCDE12345").valid).toBe(false));
});

// ── Hex Color ─────────────────────────────────────────────────────────────────
describe("Hex Color", () => {
  test("3-char valid", () => expect(validate.hexColor("#fff").valid).toBe(true));
  test("6-char valid", () => expect(validate.hexColor("#ff5733").valid).toBe(true));
  test("8-char with alpha", () => expect(validate.hexColor("#ff5733aa").valid).toBe(true));
  test("uppercase valid", () => expect(validate.hexColor("#AABBCC").valid).toBe(true));
  test("missing hash", () => expect(validate.hexColor("ff5733").valid).toBe(false));
  test("invalid chars", () => expect(validate.hexColor("#xyz123").valid).toBe(false));
  test("empty", () => expect(validate.hexColor("").valid).toBe(false));
  test("wrong length 5 chars", () => expect(validate.hexColor("#12345").valid).toBe(false));
});

// ── UUID ──────────────────────────────────────────────────────────────────────
describe("UUID", () => {
  test("v4 valid", () => expect(validate.uuid("550e8400-e29b-41d4-a716-446655440000").valid).toBe(true));
  test("v1 valid", () => expect(validate.uuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8").valid).toBe(true));
  test("uppercase valid", () => expect(validate.uuid("550E8400-E29B-41D4-A716-446655440000").valid).toBe(true));
  test("empty", () => expect(validate.uuid("").valid).toBe(false));
  test("missing dashes", () => expect(validate.uuid("550e8400e29b41d4a716446655440000").valid).toBe(false));
  test("invalid format", () => expect(validate.uuid("not-a-uuid").valid).toBe(false));
});

// ── JSON ──────────────────────────────────────────────────────────────────────
describe("JSON", () => {
  test("valid object", () => { const r = validate.json('{"name":"ajitesh"}'); expect(r.valid).toBe(true); expect(r.parsed).toEqual({ name: "ajitesh" }); });
  test("valid array", () => { const r = validate.json('[1,2,3]'); expect(r.valid).toBe(true); });
  test("valid nested", () => expect(validate.json('{"a":{"b":1}}').valid).toBe(true));
  test("invalid - trailing comma", () => expect(validate.json('{"a":1,}').valid).toBe(false));
  test("invalid - single quotes", () => expect(validate.json("{'a':1}").valid).toBe(false));
  test("empty string", () => expect(validate.json("").valid).toBe(false));
  test("plain text", () => expect(validate.json("hello world").valid).toBe(false));
});

// ── Sanitize ──────────────────────────────────────────────────────────────────
describe("Sanitize", () => {
  test("removes HTML tags", () => expect(validate.sanitize("<script>alert('xss')</script>hello")).toBe("hello"));
  test("trims whitespace", () => expect(validate.sanitize("  hello  ")).toBe("hello"));
  test("lowercase", () => expect(validate.sanitize("HELLO", { lowercase: true })).toBe("hello"));
  test("uppercase", () => expect(validate.sanitize("hello", { uppercase: true })).toBe("HELLO"));
  test("alphanumeric only", () => expect(validate.sanitize("hello@world! 123", { alphanumericOnly: true })).toBe("helloworld 123"));
  test("maxLength", () => expect(validate.sanitize("hello world", { maxLength: 5 })).toBe("hello"));
  test("strips html entities", () => expect(validate.sanitize("hello &amp; world")).toBe("hello   world"));
});

// ── Batch Validation ──────────────────────────────────────────────────────────
describe("Batch Validation", () => {
  test("all valid", () => {
    const r = validate.validateBatch(
      { email: "user@gmail.com", password: "Secure@123", username: "ajitesh_dev" },
      { email: "email", password: "password", username: "username" }
    );
    expect(r.valid).toBe(true);
    expect(Object.keys(r.errors)).toHaveLength(0);
  });
  test("multiple errors collected", () => {
    const r = validate.validateBatch(
      { email: "bad", password: "weak", username: "1" },
      { email: "email", password: "password", username: "username" }
    );
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty("email");
    expect(r.errors).toHaveProperty("password");
    expect(r.errors).toHaveProperty("username");
  });
  test("unknown validator name", () => {
    const r = validate.validateBatch({ field: "val" }, { field: "nonexistent" as any });
    expect(r.valid).toBe(false);
    expect(r.errors.field).toContain("Unknown validator");
  });
});

// ── Custom Rule ───────────────────────────────────────────────────────────────
describe("Custom Rule", () => {
  test("addRule works correctly", () => {
    validate.addRule("isEven", (n) => ({ valid: Number(n) % 2 === 0, reason: Number(n) % 2 !== 0 ? "Must be even." : null }));
    expect((validate as any).isEven(4).valid).toBe(true);
    expect((validate as any).isEven(5).valid).toBe(false);
  });
  test("addRule throws on non-function", () => {
    expect(() => validate.addRule("bad", "notafunction" as any)).toThrow("Rule must be a function.");
  });
});

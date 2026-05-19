// JS test — uses CJS build (CommonJS)
const { default: validate } = require("../dist/cjs/index.js");

// ── Email ─────────────────────────────────────────────────────────────────────
describe("Email (JS)", () => {
  test("valid", () => expect(validate.email("test@example.com").valid).toBe(true));
  test("missing @", () => { const r = validate.email("bademail"); expect(r.valid).toBe(false); expect(r.suggestion).toContain("@"); });
  test("typo gmial → gmail", () => expect(validate.email("user@gmial.com").suggestion).toBe("user@gmail.com"));
  test("duplicate TLD", () => expect(validate.email("x@gmail.com.com").valid).toBe(false));
  test("empty", () => expect(validate.email("").valid).toBe(false));
});

// ── Password ──────────────────────────────────────────────────────────────────
describe("Password (JS)", () => {
  test("strong", () => expect(validate.password("Secure@123").valid).toBe(true));
  test("common password", () => expect(validate.password("admin").valid).toBe(false));
  test("no uppercase", () => expect(validate.password("secure@123").valid).toBe(false));
  test("custom options relaxed", () => expect(validate.password("simplepass", { requireUppercase: false, requireSpecialChar: false, requireNumber: false }).valid).toBe(true));
});

// ── Password Strength ─────────────────────────────────────────────────────────
describe("Password Strength (JS)", () => {
  test("very weak", () => expect(validate.passwordStrength("123").label).toBe("Very Weak"));
  test("strong password scores high", () => expect(validate.passwordStrength("Secure@123abc").score).toBeGreaterThanOrEqual(3));
  test("returns suggestions", () => expect(validate.passwordStrength("abc").suggestions.length).toBeGreaterThan(0));
});

// ── Username ──────────────────────────────────────────────────────────────────
describe("Username (JS)", () => {
  test("valid", () => expect(validate.username("valid_user").valid).toBe(true));
  test("too short", () => expect(validate.username("ab").valid).toBe(false));
  test("starts with number", () => expect(validate.username("1bad").valid).toBe(false));
  test("consecutive underscores", () => expect(validate.username("bad__name").valid).toBe(false));
});

// ── URL ───────────────────────────────────────────────────────────────────────
describe("URL (JS)", () => {
  test("https", () => expect(validate.url("https://example.com").valid).toBe(true));
  test("localhost with port", () => expect(validate.url("http://localhost:3000/api").valid).toBe(true));
  test("no protocol", () => expect(validate.url("example.com").valid).toBe(false));
  test("empty", () => expect(validate.url("").valid).toBe(false));
});

// ── Credit Card ───────────────────────────────────────────────────────────────
describe("Credit Card (JS)", () => {
  test("Visa", () => { const r = validate.creditCard("4111111111111111"); expect(r.valid).toBe(true); expect(r.cardType).toBe("Visa"); });
  test("Amex", () => { const r = validate.creditCard("378282246310005"); expect(r.valid).toBe(true); expect(r.cardType).toBe("American Express"); });
  test("with spaces", () => expect(validate.creditCard("4111 1111 1111 1111").valid).toBe(true));
  test("invalid Luhn", () => expect(validate.creditCard("1234567812345678").valid).toBe(false));
  test("all same digit", () => expect(validate.creditCard("4444444444444444").valid).toBe(false));
});

// ── Date ──────────────────────────────────────────────────────────────────────
describe("Date (JS)", () => {
  test("YYYY-MM-DD valid", () => expect(validate.date("2025-06-15").valid).toBe(true));
  test("DD/MM/YYYY valid", () => expect(validate.date("15/06/2025", { format: "DD/MM/YYYY" }).valid).toBe(true));
  test("before minDate", () => expect(validate.date("2020-01-01", { minDate: "2023-01-01" }).valid).toBe(false));
});

// ── Postal Code ───────────────────────────────────────────────────────────────
describe("Postal Code (JS)", () => {
  test("India 110001", () => expect(validate.postalCode("110001").valid).toBe(true));
  test("US 90210", () => expect(validate.postalCode("90210", "US").valid).toBe(true));
  test("Singapore", () => expect(validate.postalCode("238823", "SG").valid).toBe(true));
  test("India starts 0", () => expect(validate.postalCode("011001").valid).toBe(false));
});

// ── IP Address ────────────────────────────────────────────────────────────────
describe("IP Address (JS)", () => {
  test("IPv4", () => { const r = validate.ipAddress("192.168.1.1"); expect(r.valid).toBe(true); expect(r.version).toBe("IPv4"); });
  test("IPv6 compressed", () => { const r = validate.ipAddress("::1"); expect(r.valid).toBe(true); expect(r.version).toBe("IPv6"); });
  test("invalid", () => expect(validate.ipAddress("999.0.0.1").valid).toBe(false));
});

// ── Aadhaar ───────────────────────────────────────────────────────────────────
describe("Aadhaar (JS)", () => {
  test("wrong length", () => expect(validate.aadhaar("12345").valid).toBe(false));
  test("starts with 0", () => expect(validate.aadhaar("012345678901").valid).toBe(false));
  test("non-numeric", () => expect(validate.aadhaar("ABCD12345678").valid).toBe(false));
});

// ── PAN ───────────────────────────────────────────────────────────────────────
describe("PAN (JS)", () => {
  test("valid individual", () => expect(validate.pan("ABCPE1234F").valid).toBe(true));
  test("lowercase auto-uppercase", () => expect(validate.pan("abcpe1234f").valid).toBe(true));
  test("invalid entity char", () => expect(validate.pan("ABCDX1234F").valid).toBe(false));
  test("wrong format", () => expect(validate.pan("ABC1234F").valid).toBe(false));
});

// ── Hex Color ─────────────────────────────────────────────────────────────────
describe("Hex Color (JS)", () => {
  test("#fff valid", () => expect(validate.hexColor("#fff").valid).toBe(true));
  test("#ff5733 valid", () => expect(validate.hexColor("#ff5733").valid).toBe(true));
  test("#ff5733aa valid", () => expect(validate.hexColor("#ff5733aa").valid).toBe(true));
  test("missing hash", () => expect(validate.hexColor("ff5733").valid).toBe(false));
  test("empty", () => expect(validate.hexColor("").valid).toBe(false));
});

// ── UUID ──────────────────────────────────────────────────────────────────────
describe("UUID (JS)", () => {
  test("v4 valid", () => expect(validate.uuid("550e8400-e29b-41d4-a716-446655440000").valid).toBe(true));
  test("uppercase valid", () => expect(validate.uuid("550E8400-E29B-41D4-A716-446655440000").valid).toBe(true));
  test("no dashes", () => expect(validate.uuid("550e8400e29b41d4a716446655440000").valid).toBe(false));
  test("empty", () => expect(validate.uuid("").valid).toBe(false));
});

// ── JSON ──────────────────────────────────────────────────────────────────────
describe("JSON (JS)", () => {
  test("valid object", () => { const r = validate.json('{"key":"val"}'); expect(r.valid).toBe(true); expect(r.parsed).toEqual({ key: "val" }); });
  test("valid array", () => expect(validate.json("[1,2,3]").valid).toBe(true));
  test("invalid", () => expect(validate.json("{bad json}").valid).toBe(false));
  test("empty", () => expect(validate.json("").valid).toBe(false));
});

// ── Sanitize ──────────────────────────────────────────────────────────────────
describe("Sanitize (JS)", () => {
  test("removes HTML", () => expect(validate.sanitize("<b>hello</b>")).toBe("hello"));
  test("trims", () => expect(validate.sanitize("  hi  ")).toBe("hi"));
  test("lowercase", () => expect(validate.sanitize("HELLO", { lowercase: true })).toBe("hello"));
  test("maxLength", () => expect(validate.sanitize("hello world", { maxLength: 5 })).toBe("hello"));
  test("alphanumericOnly", () => expect(validate.sanitize("hi@world!", { alphanumericOnly: true })).toBe("hiworld"));
  test("prevents XSS script tag", () => { const r = validate.sanitize("<script>alert(1)</script>safe"); expect(r).not.toContain("<script>"); });
});

// ── Batch ─────────────────────────────────────────────────────────────────────
describe("Batch (JS)", () => {
  test("all valid", () => {
    const r = validate.validateBatch(
      { email: "user@gmail.com", password: "Secure@123" },
      { email: "email", password: "password" }
    );
    expect(r.valid).toBe(true);
  });
  test("errors collected", () => {
    const r = validate.validateBatch({ email: "bad", password: "123" }, { email: "email", password: "password" });
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty("email");
    expect(r.errors).toHaveProperty("password");
  });
});

// ── Custom Rule ───────────────────────────────────────────────────────────────
describe("Custom Rule (JS)", () => {
  test("addRule works", () => {
    validate.addRule("isPositive", (n) => ({ valid: Number(n) > 0, reason: Number(n) <= 0 ? "Must be positive." : null }));
    expect(validate.isPositive(5).valid).toBe(true);
    expect(validate.isPositive(-1).valid).toBe(false);
  });
  test("throws on non-function", () => {
    expect(() => validate.addRule("x", "notafunction")).toThrow();
  });
});

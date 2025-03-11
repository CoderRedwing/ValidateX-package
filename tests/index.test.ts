import validate from "../src/index";


describe("Email Validation", () => {
  test("Valid email", () => {
    expect(validate.email("test@example.com").valid).toBe(true);
  });

  test("Invalid email (missing @)", () => {
    expect(validate.email("invalid-email").valid).toBe(false);
  });

  test("Invalid email (consecutive dots)", () => {
    expect(validate.email("test..email@example.com").valid).toBe(false);
  });
});

describe("Password Validation", () => {
  test("Strong password", () => {
    expect(validate.password("Strong123!").valid).toBe(true);
  });

  test("Weak password (too short)", () => {
    expect(validate.password("12345").valid).toBe(false);
  });

  test("Weak password (no special character)", () => {
    expect(validate.password("Strong123").valid).toBe(false);
  });
});

describe("Username Validation", () => {
  test("Valid username", () => {
    expect(validate.username("valid_user123").valid).toBe(true);
  });

  test("Invalid username (spaces)", () => {
    expect(validate.username("invalid user").valid).toBe(false);
  });

  test("Invalid username (special characters)", () => {
    expect(validate.username("user@123").valid).toBe(false);
  });
});

describe("Phone Number Validation", () => {
  test("Valid phone number (with country code)", () => {
    expect(validate.phone("+14155552671").valid).toBe(true);

  });

  test("Valid phone number (without country code)", () => {
    expect(validate.phone("1234567890").valid).toBe(false);
  });

  test("Invalid phone number (alphabets included)", () => {
    expect(validate.phone("123abc456").valid).toBe(false);
  });

  test("Invalid phone number (too short)", () => {
    expect(validate.phone("12345").valid).toBe(false);
  });
});

describe("URL Validation", () => {
  test("Valid URL (http)", () => {
    expect(validate.url("http://example.com").valid).toBe(true);

  });

  test("Valid URL (https)", () => {
    expect(validate.url("https://example.com").valid).toBe(true);

  });

  test("Invalid URL (missing protocol)", () => {
    expect(validate.url("example.com").valid).toBe(false);
  });

  test("Invalid URL (typo in protocol)", () => {
    expect(validate.url("htp:/example").valid).toBe(false);
  });
});

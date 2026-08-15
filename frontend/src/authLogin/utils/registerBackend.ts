// frontend\src\authLogin\utils\registerBackend.ts
// password validation regex
// returns a message to be used ο έλεγχος ελέγχει αν υπάρχει μήνυμα και αν ναι θεωρεί οτι δεν πέρασε
export const frontendValidatePassword = (password: string) => {
  const minLength = 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (password.length < minLength)
    return "Password must be at least 6 characters";
  if (!hasUppercase)
    return "Password must contain at least one uppercase letter";
  if (!hasSpecialChar)
    return "Password must contain at least one special character";
  return ""; // valid
};

// Email validation regex
// returns a message to be used ο έλεγχος ελέγχει αν υπάρχει μήνυμα και αν ναι θεωρεί οτι δεν πέρασε
export const frontEndValidateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email address";
  return ""; // valid
};

export function validateSymbol(input: string) {
  if (!input || input.trim().length === 0) {
    return "Symbol is required.";
  }

  const cleaned = input.trim().toUpperCase();

  if (!/^[A-Z0-9.]{1,12}$/.test(cleaned)) {
    return "Symbol contains unsupported characters.";
  }

  return "";
}

export function validateQuery(input: string) {
  if (!input || input.trim().length < 2) {
    return "Search term must be at least 2 characters long.";
  }

  return "";
}

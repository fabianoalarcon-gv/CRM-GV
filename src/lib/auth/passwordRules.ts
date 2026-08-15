export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "Mínimo de 6 caracteres", test: (p) => p.length >= 6 },
  { id: "special", label: "Pelo menos 1 caractere especial", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { id: "uppercase", label: "Pelo menos 1 letra em maiúsculo", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "Pelo menos 1 número", test: (p) => /[0-9]/.test(p) },
];

export function passwordMeetsAllRules(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

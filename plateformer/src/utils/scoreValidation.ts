export function validatePlayerName(value: string): string | null {
  const name = value.trim();
  if (!name) return 'Le pseudo est obligatoire.';
  if (name.length < 2) return 'Le pseudo doit contenir au moins 2 caractères.';
  return null;
}
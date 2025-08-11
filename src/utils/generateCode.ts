export const generateCodeUnique = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const aleatorio = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
  return timestamp + aleatorio;
}

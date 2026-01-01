export const generateCodeUnique = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const aleatorio = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
  return timestamp + aleatorio;
}

// generar codigo unico numerico para facturas y boletas
export const generateNumericCodeUnique = (length: number): string => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

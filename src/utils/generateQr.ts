import QRCode from "qrcode";
import { uploadFileToR2 } from "@/shared/services/r2";

/**
 * Genera un QR y lo sube a R2 en formato PNG.
 * @param text Texto a codificar
 * @param folder Carpeta en R2 (ej. "qrs/receipts")
 * @param filename Nombre del archivo sin extensión
 * @returns Objeto con URL pública y key de R2
 */
export const generateQrAndUpload = async (
  text: string,
  folder: string,
  filename: string
): Promise<{ url: string; key: string }> => {
  try {
    const buffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
    });

    const key = `${folder}/${filename}.png`;
    const url = await uploadFileToR2(key, buffer, "image/png");

    return { key, url };
  } catch (error) {
    console.error("Error generando/subiendo QR:", error);
    throw new Error("No se pudo generar ni subir el código QR");
  }
};

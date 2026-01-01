import PdfPrinter from 'pdfmake';
import * as fs from 'fs';
import * as path from 'path';

// 🛑 1. DEFINICIÓN DE FUENTES (CRÍTICO)
// Asegúrate de que las rutas a los archivos .ttf sean correctas
const fonts = {
  Roboto: {
    normal: path.join(process.cwd(), 'fonts/Roboto-Regular.ttf'),
    bold: path.join(process.cwd(), 'fonts/Roboto-Medium.ttf'),
    italics: path.join(process.cwd(), 'fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(process.cwd(), 'fonts/Roboto-MediumItalic.ttf'),
  },
  // Si usas otros idiomas o símbolos, podrías necesitar otras fuentes
};

const printer = new PdfPrinter(fonts);

/**
 * Convierte un objeto de definición de PDFMake en un Buffer binario.
 * @param docDefinition Objeto JSON que describe el PDF.
 * @returns Promise<Buffer> del PDF generado.
 */
export function generatePdfBuffer(docDefinition: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    // Crea un array para almacenar los datos del PDF mientras se genera
    const chunks: Buffer[] = [];
    
    pdfDoc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    pdfDoc.on('end', () => {
      // Combina todos los trozos en un solo Buffer
      resolve(Buffer.concat(chunks));
    });

    pdfDoc.on('error', (err) => {
      reject(err);
    });

    // Finaliza el proceso de generación del PDF
    pdfDoc.end();
  });
}


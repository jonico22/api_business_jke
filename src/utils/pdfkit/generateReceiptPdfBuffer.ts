import {
  Receipt,
  PaymentTransaction,
  Currency,
  Tax,
  ReceiptType,
} from '@prisma/client';
import { TDocumentDefinitions } from 'pdfmake/interfaces'; // Importar tipos para IntelliSense
import { format } from 'date-fns';

// Define el mismo tipo de datos de entrada
type ReceiptData = Receipt & {
  transaction: PaymentTransaction & {
    subscriptionMovement: {
      subscription: {
        user: {
          name: string | null;
        };
      };
    } | null;
  };
  currency: Currency;
  tax: Tax;
  receiptType: ReceiptType;
};

// Helper para formatear moneda y evitar DRY (Don't Repeat Yourself)
const formatCurrency = (amount: number, currencySymbol: string) => {
  return `${currencySymbol} ${amount.toFixed(2)}`;
};


export const generateReceiptDefinition = (receipt: ReceiptData): TDocumentDefinitions => {
  if (!receipt) {
    throw new Error('Datos de recibo no disponibles.');
  }

  const clientName = receipt.transaction.subscriptionMovement?.subscription.user.name || 'N/A';
  const subtotal = receipt.totalAmount - receipt.taxAmount;

  const definition: TDocumentDefinitions = {
    // 1. PROPIEDADES GLOBALES (Página)
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40], // Margen (igual que tu CSS: 40px)
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
    },
    
    // 2. CONTENIDO
    content: [
      // === HEADER (Logo e Info de la Compañía) ===
      {
        columns: [
          // Logo (usar una imagen base64 o ruta local)
          { image: 'ruta/a/tu/logo.png', width: 150 }, 
          // Info de la Compañía (Alineado a la derecha)
          {
            alignment: 'right',
            width: '*', // Ocupa el espacio restante
            stack: [
              { text: 'Mi Empresa S.A.C.', bold: true, fontSize: 14 },
              { text: `RUC: 123456789` },
              { text: `contacto@miempresa.com` },
              { text: `www.miempresa.com` },
            ],
          },
        ],
        // Simula el borde inferior del Header
        margin: [0, 0, 0, 30], // [izquierda, arriba, derecha, abajo]
        columnGap: 10
      },
      
      // === TÍTULO CENTRAL ===
      {
        text: 'Comprobante de Pago',
        style: 'h1',
        margin: [0, 0, 0, 20]
      },

      // === INFORMACIÓN DEL RECIBO Y CLIENTE ===
      {
        style: 'infoSection',
        columns: [
          // Columna Izquierda (Datos del recibo)
          {
            width: '50%',
            stack: [
              { text: [{ text: 'Número: ', bold: true }, `${receipt.series}-${receipt.number}`] },
              { text: [{ text: 'Fecha: ', bold: true }, format(receipt.issueDate, 'dd/MM/yyyy')] },
              { text: [{ text: 'Estado: ', bold: true }, receipt.status] },
            ]
          },
          // Columna Derecha (Datos del Cliente)
          {
            width: '50%',
            stack: [
              { text: [{ text: 'Cliente: ', bold: true }, clientName] },
              { text: [{ text: 'Tipo: ', bold: true }, receipt.receiptType.name] },
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // === TABLA DE ITEMS ===
      {
        // El body simula las filas y columnas de tu tabla HTML
        table: {
          headerRows: 1, // Indica que la primera fila es el encabezado
          widths: ['*', 50, 90, 90], // Anchos relativos de las columnas
          body: [
            // Encabezado de la tabla (<thead>)
            [{ text: 'Descripción', style: 'tableHeader' }, 
             { text: 'Cant.', style: 'tableHeader' }, 
             { text: 'P. Unitario', style: 'tableHeader', alignment: 'right' }, 
             { text: 'Subtotal', style: 'tableHeader', alignment: 'right' }],
            
            // Fila de items (<tbody>)
            [
              receipt.transaction.description || 'Descripción no disponible',
              { text: '1', alignment: 'center' },
              { text: formatCurrency(subtotal, receipt.currency.symbol), alignment: 'right' },
              { text: formatCurrency(subtotal, receipt.currency.symbol), alignment: 'right' },
            ],
          ]
        },
        layout: 'lightHorizontalLines', // Estilo de borde de la tabla (más limpio que todos los bordes)
        margin: [0, 20, 0, 0],
      },
      
      // === SECCIÓN DE TOTALES ===
      {
        style: 'totals',
        // Usamos una tabla sin bordes para alinear los totales a la derecha
        table: {
          widths: ['*', 100],
          body: [
            [{ text: 'Impuesto:', alignment: 'right' }, formatCurrency(receipt.taxAmount, receipt.currency.symbol)],
            [{ text: 'TOTAL:', style: 'totalText', alignment: 'right' }, { text: formatCurrency(receipt.totalAmount, receipt.currency.symbol), style: 'totalText' }],
          ],
        },
        layout: 'noBorders',
        margin: [0, 30, 0, 0],
      },

      // === SECCIÓN DE QR (Placeholder) ===
      // Aquí puedes inyectar el código QR si lo tienes como una imagen base64
      {
        text: 'QR Placeholder', // Reemplaza con una imagen si es base64
        alignment: 'center',
        margin: [0, 40, 0, 0]
      },

      // === FOOTER ===
      {
        text: 'Documento generado automáticamente. No requiere firma. | Verifica en: https://midominio.com/verify-receipt/'+receipt.id,
        style: 'footer',
        alignment: 'center',
        margin: [0, 60, 0, 0],
      }
    ],
    
    // 3. ESTILOS (Simula tu CSS)
    styles: {
      h1: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        decoration: 'underline',
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'black',
        fillColor: '#f5f5f5' // Simula el background-color del <th>
      },
      totals: {
        fontSize: 12,
      },
      totalText: {
        fontSize: 14,
        bold: true,
      },
      footer: {
        fontSize: 8,
        color: '#777',
      }
    }
  };
  
  return definition;
};

//
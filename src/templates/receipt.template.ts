import {
  Receipt,
  PaymentTransaction,
  Currency,
  Tax,
  ReceiptType,
} from '@prisma/client';

// Define a type for the receipt data, including relations
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

export const generateReceiptHtml = (receipt: ReceiptData): string => {
  if (!receipt) {
    return '<p>Recibo no encontrado.</p>';
  }

  // Helper para formatear fechas
  const formatDate = (date: Date) => new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  // Helper para formatear moneda
  const formatCurrency = (amount: number, currencySymbol: string) => {
    return `${currencySymbol} ${amount.toFixed(2)}`;
  };
  
  // Asumiendo que el item es la descripción de la transacción
  const itemsHtml = `
    <tr>
      <td>${receipt.transaction.description || 'Descripción no disponible'}</td>
      <td>1</td>
      <td>${formatCurrency(receipt.totalAmount - receipt.taxAmount, receipt.currency.symbol)}</td>
      <td>${formatCurrency(receipt.totalAmount - receipt.taxAmount, receipt.currency.symbol)}</td>
    </tr>
  `;

  let html = `
    <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Comprobante de Pago</title>
  <style>
    * {
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    }
    body {
      margin: 40px;
      color: #333;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
    }
    .company-info {
      text-align: right;
      font-size: 14px;
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
    .info {
      margin-bottom: 20px;
      font-size: 15px;
    }
    .info div {
      margin-bottom: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
    }
    th {
      background-color: #f5f5f5;
      text-align: left;
    }

    .amount-section {
      margin-top: 30px;
      font-size: 16px;
      border-top: 1px solid #ccc;
      padding-top: 15px;
    }
    .amount-section div {
      margin-bottom: 8px;
    }

    .qr-section {
      margin-top: 40px;
      display: flex;
      justify-content: center;
    }

    footer {
      margin-top: 60px;
      font-size: 12px;
      text-align: center;
      color: #777;
      border-top: 1px solid #ccc;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <header>
    <img src="https://via.placeholder.com/150x50?text=LOGO" alt="Logo" class="logo" />
    <div class="company-info">
      <strong>Mi Empresa S.A.C.</strong><br />
      RUC: 123456789<br />
      contacto@miempresa.com<br />
      www.miempresa.com
    </div>
  </header>

  <h1>Comprobante de Pago</h1>

  <div class="info">
    <div><strong>Número:</strong> ${receipt.series}-${receipt.number}</div>
    <div><strong>Fecha:</strong> ${formatDate(receipt.issueDate)}</div>
    <div><strong>Estado:</strong> ${receipt.status}</div>
    <div><strong>Cliente:</strong> ${receipt.transaction.subscriptionMovement?.subscription.user.name || 'N/A'}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cantidad</th>
        <th>Precio Unitario</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="amount-section">
    <div><strong>Impuesto:</strong> ${formatCurrency(receipt.taxAmount, receipt.currency.symbol)}</div>
    <div><strong>Total:</strong> ${formatCurrency(receipt.totalAmount, receipt.currency.symbol)}</div>
  </div>

  <div class="qr-section">
    <img src="{{qr}}" alt="Código QR" width="120" />
  </div>

  <footer>
    Documento generado automáticamente. No requiere firma.<br />
    Verifica en: https://midominio.com/verify-receipt/${receipt.id}
  </footer>
</body>
</html>
`;
  // QR placeholder needs to be replaced with actual QR generation logic if available
  // For now, it's left as a placeholder.
  return html.replace('{{qr}}', '');
};



export const generateReceiptHtml = (data: any): string => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
          .content { font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="title">Comprobante de Pago</div>
        <div class="content">
          <p><strong>Número:</strong> ${data.number}</p>
          <p><strong>Fecha:</strong> ${data.date}</p>
          <p><strong>Monto:</strong> ${data.totalAmount} ${data.currency}</p>
        </div>
      </body>
    </html>
  `;
};

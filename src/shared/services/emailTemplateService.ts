import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { redis } from "@/shared/services/redis.service";

// Configuración del Cliente R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});


export class EmailTemplateService {
  private static CACHE_TTL = 3600;

  static async getTemplate(templateName: string, variables: Record<string, string>): Promise<string> {
    const cacheKey = `email_template:${templateName}`;

    // 1. Usamos tu método redis.get (que ya maneja JSON.parse internamente)
    let html = await redis.get<string>(cacheKey);

    if (!html) {
      console.log(`[R2] Descargando plantilla: ${templateName}`);
      html = await this.fetchFromR2(templateName);
      
      // 2. Usamos tu método redis.set
      await redis.set(cacheKey, html, this.CACHE_TTL);
    }

    return this.replacePlaceholders(html!, variables);
  }

 private static async fetchFromR2(name: string): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME_EMAIL;

  // Validación manual antes de llamar al SDK
  if (!bucketName) {
    throw new Error("❌ Error Crítico: R2_BUCKET_NAME_EMAIL no está definido en las variables de entorno.");
  }
  console.log(`[R2] Intentando descargar 'templates/${name}.html' del bucket: '${bucketName}'`);
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName, // Ahora estamos seguros de que no es undefined
      Key: `templates/${name}.html`,
    });

    const response = await r2Client.send(command);
    return await response.Body?.transformToString() || "";
  } catch (err) {
    console.error(`[R2] Error al obtener objeto:`, err);
    throw err;
  }
}

  private static replacePlaceholders(html: string, vars: Record<string, string>): string {
    let output = html;
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      output = output.replace(regex, value);
    }
    return output;
  }
}
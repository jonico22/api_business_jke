import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import Redis from "ioredis";

// Configuración del Cliente R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Configuración de Redis
const redis = new Redis(process.env.REDIS_URL!);

export class EmailTemplateService {
  private static CACHE_TTL = 3600; // 1 hora de persistencia en caché

  /**
   * Obtiene y procesa una plantilla de correo
   */
  static async getTemplate(templateName: string, variables: Record<string, string>): Promise<string> {
    const cacheKey = `email_template:${templateName}`;

    // 1. Intentar obtener desde Redis
    let html = await redis.get(cacheKey);

    // 2. Si es un "Cache Miss", descargar de Cloudflare R2
    if (!html) {
      html = await this.fetchFromR2(templateName);
      // Guardar en Redis para futuras peticiones
      await redis.set(cacheKey, html, "EX", this.CACHE_TTL);
    }

    // 3. Inyectar variables dinámicas
    return this.replacePlaceholders(html, variables);
  }

  private static async fetchFromR2(name: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME_EMAIL,
      Key: `templates/${name}.html`,
    });

    const response = await r2Client.send(command);
    const content = await response.Body?.transformToString();

    if (!content) throw new Error(`Plantilla ${name} no encontrada en R2.`);
    return content;
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
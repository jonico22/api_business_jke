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
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `templates/${name}.html`,
    });

    const response = await r2Client.send(command);
    const content = await response.Body?.transformToString();

    if (!content) throw new Error(`Plantilla ${name} no encontrada.`);
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
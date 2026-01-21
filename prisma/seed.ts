// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🌱 [SEED] Iniciando en modo: ${env.toUpperCase()}`);

  // Buscamos el archivo según el entorno
  const fileName = env === 'production' ? 'seed.prod.sql' : 'seed.sql';
  const filePath = path.join(process.cwd(), 'prisma', fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ [SEED] Archivo ${fileName} no encontrado en ${filePath}. Saltando seed...`);
    return;
  }

  const fullSql = fs.readFileSync(filePath, 'utf8');

  // Regex más segura para separar sentencias SQL (ignora puntos y coma dentro de comillas simples)
  const sqlStatements = fullSql
    .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  try {
    await prisma.$transaction(async (tx) => {
      console.log(`🚀 [SEED] Ejecutando ${sqlStatements.length} sentencias...`);
      for (const sql of sqlStatements) {
        await tx.$executeRawUnsafe(sql);
      }
    });
    console.log('✅ [SEED] Completado con éxito.');
  } catch (error) {
    console.error('❌ [SEED] Error crítico:');
    console.error(error);
    // En producción, a veces es mejor no matar el proceso si el seed falla 
    // porque los datos ya podrían estar ahí. 
    // process.exit(1); 
  } finally {
    await prisma.$disconnect();
  }
}

main();
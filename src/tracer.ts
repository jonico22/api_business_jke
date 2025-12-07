// src/tracer.ts

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { 
  Span, 
  SpanProcessor, 
  ReadableSpan 
} from '@opentelemetry/sdk-trace-base';

// 1. Definición del Exportador (toma la variable de entorno de Docker Compose)
const exporter = new OTLPTraceExporter({
  // El endpoint se toma de la variable OTEL_EXPORTER_OTLP_ENDPOINT en docker-compose
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});

// 2. Definición del Procesador Personalizado para Redacción
class AttributeRedactingProcessor implements SpanProcessor {
  // 🚫 LISTA DE CLAVES SENSIBLES A REDACTAR O ELIMINAR
  private SENSITIVE_KEYS = [
    // Encabezados HTTP (si son capturados por alguna razón)
    'http.request.header.authorization', 
    'http.request.header.cookie',
    'http.response.header.set-cookie',
    
    // Contenido de la base de datos (si la instrumentación lo captura)
    // El texto de la consulta SQL completa.
    'db.statement', 
    
    // Cualquier otra clave que añadas manualmente que contenga PII (ej. user.email)
    'user.email', 
    'http.url' // A veces se redacta la URL completa si tiene tokens
  ];

  // Este método se ejecuta justo antes de que la traza sea exportada
  onEnd(span: ReadableSpan): void {
    // Creamos una copia de los atributos para modificarlos
    const attributes = { ...span.attributes };

    for (const key of this.SENSITIVE_KEYS) {
      // OpenTelemetry normaliza los headers a minúsculas, por eso es importante
      // usar el formato `http.request.header.nombre`.
      if (attributes.hasOwnProperty(key)) {
        // ⭐ Redactamos el valor en lugar de eliminar la clave. 
        // Esto mantiene el contexto (sabemos que había un campo de Auth) pero no el dato.
        attributes[key] = '[REDACTED_BY_PROCESSOR]';
      }
    }

    // Sobreescribir los atributos del span antes de que el exportador los tome
    // Nota: Es un 'type assertion' necesario para modificar la interfaz ReadableSpan.
    (span as any).attributes = attributes; 
  }

  // Implementaciones requeridas por la interfaz, pero no usadas para este fin
  onStart(span: Span): void {}
  shutdown(): Promise<void> { return Promise.resolve(); }
  forceFlush(): Promise<void> { return Promise.resolve(); }
}

// 3. Inicialización del SDK
const sdk = new NodeSDK({
  // @ts-ignore
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
  }),

  // USAMOS EL PROCESADOR PERSONALIZADO EN LUGAR DEL POR DEFECTO
  spanProcessors: [
    new AttributeRedactingProcessor(),
  ],

  traceExporter: exporter,
  
  // 4. Configuración de la Auto-Instrumentación (Útil para control inicial de HTTP)
  instrumentations: [
    getNodeAutoInstrumentations({
        // 🚨 CONFIGURACIÓN ESPECÍFICA PARA HTTP/EXPRESS
        '@opentelemetry/instrumentation-http': {
            // Esta opción previene que OpenTelemetry capture automáticamente 
            // *todos* los headers, obligándote a listar solo los seguros.
            // Si no especificas 'authorization', no se captura desde el inicio.
            headersToSpanAttributes: {
                server: {
                    requestHeaders: ['User-Agent', 'Content-Type', 'Accept-Encoding'], 
                    responseHeaders: ['Content-Type', 'server'],
                },
            },
        },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
/**
 * Servicio para comunicación con la API de Ventas/Sales
 */

import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

const API_SALES_URL = process.env.API_SALES_URL || 'http://localhost:3000';

/**
 * Realiza una petición GET a la API de ventas
 * @param path - Ruta del endpoint (sin la base URL)
 * @returns Promise con la respuesta JSON
 */
export const requestApiSaleGet = async (path: string, options?: { headers?: Record<string, string> }) => {
    try {
        const url = `${API_SALES_URL}/${path}`;
        console.log('GET request a:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers || {})
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[API SALE ERROR] ${response.status} ${response.statusText}`, errorBody);
            try {
                const errorJson = JSON.parse(errorBody);
                throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
            } catch (e) {
                throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
            }
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error('Error en requestApiSaleGet:', error);
        throw error;
    }
};

/**
 * Realiza una petición POST con FormData usando http/https nativo
 * Necesario porque fetch no maneja correctamente los streams de form-data
 */
const requestApiSalePostFormData = async (path: string, formData: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        const fullUrl = `${API_SALES_URL}/${path}`;
        const parsedUrl = new URL(fullUrl);
        const isHttps = parsedUrl.protocol === 'https:';
        const httpModule = isHttps ? https : http;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            headers: formData.getHeaders()
        };

        console.log('[FormData Upload] Enviando a:', fullUrl);
        console.log('[FormData Upload] Headers:', options.headers);

        const req = httpModule.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    try {
                        const errorJson = JSON.parse(data);
                        reject(new Error(errorJson.message || `HTTP ${res.statusCode}: ${res.statusMessage}`));
                    } catch (e) {
                        reject(new Error(`HTTP ${res.statusCode}: ${data || res.statusMessage}`));
                    }
                }
            });
        });

        req.on('error', (error) => {
            console.error('[FormData Upload] Error:', error);
            reject(error);
        });

        // Pipe el FormData stream al request
        formData.pipe(req);
    });
};

/**
 * Realiza una petición POST a la API de ventas
 * @param path - Ruta del endpoint (sin la base URL)
 * @param body - Cuerpo de la petición (puede ser JSON o FormData)
 * @param options - Opciones adicionales como headers
 * @returns Promise con la respuesta JSON
 */
export const requestApiSalePost = async (path: string, body: any, options?: { headers?: Record<string, string> }) => {
    try {
        // Si body es FormData del paquete form-data, usar función especializada
        if (body && typeof body === 'object' && body.constructor.name === 'FormData') {
            return await requestApiSalePostFormData(path, body);
        }

        // Para JSON normal, usar fetch
        const url = `${API_SALES_URL}/${path}`;
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            },
            body: body ? JSON.stringify(body) : undefined
        };

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[API SALE ERROR] ${response.status} ${response.statusText}`, errorBody);
            try {
                const errorJson = JSON.parse(errorBody);
                throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
            } catch (e) {
                throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
            }
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error('Error en requestApiSalePost:', error);
        throw error;
    }
};

/**
 * Realiza una petición PUT a la API de ventas
 * @param path - Ruta del endpoint (sin la base URL)
 * @param body - Cuerpo de la petición
 * @returns Promise con la respuesta JSON
 */
export const requestApiSalePut = async (path: string, body: any) => {
    try {
        const url = `${API_SALES_URL}/${path}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[API SALE ERROR] ${response.status} ${response.statusText}`, errorBody);
            try {
                const errorJson = JSON.parse(errorBody);
                throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
            } catch (e) {
                throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
            }
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error('Error en requestApiSalePut:', error);
        throw error;
    }
};

/**
 * Realiza una petición DELETE a la API de ventas
 * @param path - Ruta del endpoint (sin la base URL)
 * @param body - Cuerpo opcional de la petición (para soft deletes)
 * @returns Promise con la respuesta JSON
 */
export const requestApiSaleDelete = async (path: string, body?: any) => {
    try {
        const url = `${API_SALES_URL}/${path}`;
        const options: RequestInit = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Agregar body solo si se proporciona
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorBody = await response.text();
            try {
                const errorJson = JSON.parse(errorBody);
                throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
            } catch (e) {
                throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
            }
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error('Error en requestApiSaleDelete:', error);
        throw error;
    }
};

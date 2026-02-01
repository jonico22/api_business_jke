/**
 * Servicio para comunicación con la API de Ventas/Sales
 */

const API_SALES_URL = process.env.API_SALES_URL || 'http://localhost:3000';

/**
 * Realiza una petición GET a la API de ventas
 * @param path - Ruta del endpoint (sin la base URL)
 * @returns Promise con la respuesta JSON
 */
export const requestApiSaleGet = async (path: string) => {
    try {
        const url = `${API_SALES_URL}/${path}`;
        console.log('GET request a:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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
        return response.json();
    } catch (error) {
        console.error('Error en requestApiSaleGet:', error);
        throw error;
    }
};

/**
 * Realiza una petición POST a la API de ventas
 * @param path - Ruta del endpoint (sin la base URL)
 * @param body - Cuerpo de la petición
 * @returns Promise con la respuesta JSON
 */
export const requestApiSalePost = async (path: string, body: any) => {
    try {
        const url = `${API_SALES_URL}/${path}`;
        console.log('POST request a:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[API SALE ERROR] ${response.status} ${response.statusText}`, errorBody);
            try {
                // Intenta parsear si es JSON para un mensaje más limpio
                const errorJson = JSON.parse(errorBody);
                throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
            } catch (e) {
                // Si no es JSON, usa el texto plano o el status
                throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
            }
        }
        return response.json();
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
        console.log('PUT request a:', url);

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
        return response.json();
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
        console.log('DELETE request a:', url);

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
            console.error(`[API SALE ERROR] ${response.status} ${response.statusText}`, errorBody);
            try {
                const errorJson = JSON.parse(errorBody);
                throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
            } catch (e) {
                throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
            }
        }
        return response.json();
    } catch (error) {
        console.error('Error en requestApiSaleDelete:', error);
        throw error;
    }
};

/**
 * Utilidad para parsear archivos CSV sin dependencias externas
 */

export interface CSVRow {
    [key: string]: string;
}

/**
 * Parsea un archivo CSV y retorna un array de objetos
 * @param csvContent - Contenido del archivo CSV como string
 * @returns Array de objetos donde cada objeto representa una fila
 */
export const parseCSV = (csvContent: string): CSVRow[] => {
    // Dividir por líneas y eliminar espacios en blanco
    const lines = csvContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (lines.length === 0) {
        throw new Error('El archivo CSV está vacío');
    }

    // Primera línea contiene los headers
    const headers = lines[0].split(',').map(h => h.trim());

    if (headers.length === 0) {
        throw new Error('El archivo CSV no tiene columnas definidas');
    }

    // Parsear las filas restantes
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        // Crear objeto con los headers como keys
        const row: CSVRow = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        rows.push(row);
    }

    return rows;
};

/**
 * Valida que el CSV tenga las columnas requeridas
 * @param csvContent - Contenido del archivo CSV
 * @param requiredColumns - Array de nombres de columnas requeridas
 * @returns true si tiene todas las columnas, lanza error si no
 */
export const validateCSVColumns = (csvContent: string, requiredColumns: string[]): boolean => {
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

    if (lines.length === 0) {
        throw new Error('El archivo CSV está vacío');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
        throw new Error(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`);
    }

    return true;
};

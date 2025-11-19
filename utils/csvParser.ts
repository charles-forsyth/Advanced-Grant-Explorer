/**
 * A simple CSV parser that converts a CSV string into an array of objects.
 * It handles fields quoted with double quotes.
 * @param csvText The string content of the CSV file.
 * @returns An array of objects, where each object represents a row.
 */
export function parseCsv(csvText: string): Record<string, string>[] {
    if (!csvText?.trim()) return [];

    const lines = csvText.trim().split('\n');
    
    // Assumes the first line is the header.
    // Removes quotes and trims whitespace from header keys.
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: Record<string, string>[] = [];

    // Process each data line
    for (let i = 1; i < lines.length; i++) {
        // This regex splits by comma, but ignores commas inside double-quoted fields.
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        // Only process rows that have the same number of columns as the header
        if (values.length === header.length) {
            const rowObject: Record<string, string> = {};
            for (let j = 0; j < header.length; j++) {
                // Removes quotes from the beginning and end of the value and trims whitespace.
                rowObject[header[j]] = values[j]?.trim().replace(/^"|"$/g, '') || '';
            }
            rows.push(rowObject);
        }
    }
    return rows;
}

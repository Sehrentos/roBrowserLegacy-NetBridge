import { readFileSync } from 'fs';

/**
 * Reads configuration from a file and sets environment variables.
 * The file should contain lines in the format "key=value".
 * Lines which start with "#" are ignored, as are blank lines.
 *
 * @param {string} filePath
 * The path to the configuration file to read. The file should
 * contain lines in the format "key=value". Lines which start
 * with "#" are ignored, as are blank lines.
 * 
 * If the file is not found, or if there is an error reading it,
 * a message is printed to the console but the function does not
 * throw.
 * 
 * @example loadEnv('./.env');
 */
export function loadEnv(filePath) {
    try {
        const data = readFileSync(filePath, 'utf8');
        const lines = data.toString().split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('#') || trimmedLine === '') continue; // skip comments
            const [key, value] = trimmedLine.split('=');
            process.env[key.trim()] = value.trim();
        }
    } catch (error) {
        console.error(`config read error: ${error.message}`);
    }
}
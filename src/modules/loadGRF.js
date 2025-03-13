import { GrfNode } from 'grf-loader';
import { openSync, readFileSync } from 'fs';

/**
 * Loads a file from the ROBrowser zdata.grf file.
 * @param {string} searchFilename the filename to search for in the grf. eg `'data/clientinfo.xml'`
 * @returns {Promise<Uint8Array>} the content of the file as a Uint8Array.
 */
export async function loadGRF(searchFilename) {
    const name = searchFilename.slice(1).replace(/\//g, '\\');
    const grfFiles = parseDataIni();
    for (const grfFile of grfFiles) {
        try {
            const fd = openSync(`./resources/${grfFile}`, 'r');
            const grf = new GrfNode(fd);
            // Start parsing the grf.
            await grf.load();
            // grf.files.forEach((entry, path) => {
            //     console.log(path);
            // });
            const { data, error } = await grf.getFile(name);
            if (error) {
                throw error;
            }
            return data;
        } catch (error) {
            // file not found
        }
    }
}

/**
 * load file names from data.ini and in priority order
 * 
 * ```ini
 * [Data]
 * 1=cdata.grf
 * 2=rdata.grf
 * 3=data.grf
 * ```
 * 
 * @returns {string[]}
 */
function parseDataIni() {
    try {
        const dataIni = readFileSync('./resources/data.ini', 'utf-8');
        const lines = dataIni.split('\n');
        /** @type {{key: string, value: string}[]} */
        const files = [];
        lines.forEach(line => {
            const [key, value] = line.split('=');
            const trimmedKey = key?.trim() ?? "";
            const trimmedValue = value?.trim() ?? "";
            if (trimmedValue) {
                files.push({ key: trimmedKey, value: trimmedValue });
            }
        });
        files.sort((a, b) => a.key > b.key ? 1 : -1);
        return files.map(file => file.value);
    } catch (error) {
        return [];
    }
}
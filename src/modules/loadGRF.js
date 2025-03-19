import { GrfNode } from 'grf-loader';
import { open, readFile } from 'fs/promises';

// TODO: I noticed that when caching grf, the CPU spiked on usage,
// but its faster for delivery. This part needs some optimisation.
// Also it did not matter was the cache set before or after the grf.load call.
// Disabled the grf cache for now.

// // #region caches
// const cache = {
//     /** @type {string[]} - `DATA.ini` file cache. */
//     grfNames: [],
//     /** @type {{[key: string]: GrfNode}} - GrfNode parsed cache. */
//     grf: {},
// };
// // #endregion

/**
 * Loads a file from the grf file.
 * @param {string} searchFilename the filename to search for in the grf. eg `'data/clientinfo.xml'`
 * @returns {Promise<Uint8Array>} the content of the file as a Uint8Array.
 */
export async function loadGRF(searchFilename) {
    const name = searchFilename.slice(1).replace(/\//g, '\\');
    const grfNames = await getDataIni();
    // if (cache.grfNames.length === 0) {
    //     cache.grfNames = await getDataIni();
    // }

    for (const grfFile of grfNames/*cache.grfNames*/) {
        let fh;
        try {
            // get cache first
            // if (cache.grf[grfFile]) {
            //     // await cache.grf[grfFile].load();
            //     const { data, error } = await cache.grf[grfFile].getFile(name);
            //     if (error) {
            //         throw error;
            //     }
            //     return data;
            // }
            // no cache
            // open grf and then set cache
            fh = await open(`./resources/${grfFile}`, 'r');
            const grf = new GrfNode(fh.fd);
            // Start parsing the grf.
            await grf.load();
            // set cached grf for the next call
            //cache.grf[grfFile] = grf;
            // list all files for debug
            // grf.files.forEach((entry, path) => {
            //     console.log(path);
            // });
            const { data, error } = await grf.getFile(name);
            if (error) {
                throw error;
            }
            return data;
        } catch (error) {
            // file not found or error
        } finally {
            if (fh) {
                await fh.close();
            }
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
 * @returns {Promise<string[]>}
 */
async function getDataIni() {
    try {
        const dataIni = await readFile('./resources/data.ini', 'utf-8');
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
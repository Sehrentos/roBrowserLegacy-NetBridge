/**
 * Helper to fix common typos posted from the client
 * @param {string} value 
 * @returns {string}
 */
export function fixCommonTypos(value) {
    return value.replace('.lua.lua', '.lua') // "AI/AI.lua.lua"
        .replace('//', '/') // "//AI/AI.lua"
}
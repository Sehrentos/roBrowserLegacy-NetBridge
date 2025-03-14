import path from "path"

/**
 * Helper to fix common typos posted from the client
 * @param {string} value and URL to clean
 * @returns {string}
 */
export function fixCommonTypos(value) {
    return value.replace('.lua.lua', '.lua') // "AI/AI.lua.lua"
        .replace(/\/\//g, '/') // "//AI/AI.lua"
}
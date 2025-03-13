/**
 * Helper to parse lua file contents and replace dofile with require and fix paths like AI\\Const to AI/Const
 * @param {string} luaCode 
 * @returns {string} 
 */
export function parseLuaFile(luaCode) {
    // first replace dofile with require
    luaCode = luaCode.replace(/dofile\s*\(\s*["'](.*)["']\s*\)|dofile\s+["'](.*)["']/g, (match, p1, p2) => {
        const filename = p1 || p2; // Use p1 if available, otherwise p2
        if (filename) {
            return `require("${filename}")`;
        }
        return match; // Return the original match if no filename is found.
    });

    // then replace require("AI\\Const") to require("AI/Const")
    luaCode = luaCode.replace(/require\s*\(\s*["'](.*)["']\s*\)|require\s+["'](.*)["']/g, (match, p1, p2) => {
        const filename = p1 || p2; // Use p1 if available, otherwise p2
        if (filename) {
            return `require("${filename.replace(/\\/g, '/')}")`;
        }
        return match; // Return the original match if no filename is found.
    });

    return luaCode;
}
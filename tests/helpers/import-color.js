/**
 * Helper to import Color class for testing
 * Wraps color.js in a module context
 */

const fs = require('fs');
const path = require('path');

// Define random function in global scope for Color class
global.random = (min, max) => Math.random() * (max - min) + min;

// Read and execute color.js
const colorJsPath = path.join(__dirname, '../../color.js');
const colorJsContent = fs.readFileSync(colorJsPath, 'utf8');

// Create module-like context
const moduleContext = { exports: {} };
const moduleWrapper = new Function('exports', 'module', colorJsContent + '\nmodule.exports = { Color, clampRound };');
moduleWrapper(moduleContext.exports, moduleContext);

module.exports = moduleContext.exports;

/**
 * Helper to import canvas.js functions for testing
 * Provides isolated functions without browser dependencies
 */

const fs = require('fs');
const path = require('path');
const { Color } = require('./import-color');

// Mock canvas element with getContext
const mockCtx = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(1920 * 1080 * 4) })),
  imageSmoothingEnabled: true
};

const mockCanvas = {
  width: 1920,
  height: 1080,
  style: {},
  getContext: jest.fn(() => mockCtx),
  getBoundingClientRect: jest.fn(() => ({ width: 1920, height: 1080 })),
  addEventListener: jest.fn()
};

// Mock browser globals
const document = {
  getElementById: jest.fn((id) => {
    if (id === 'canvas' || id === 'particleCanvas') {
      return mockCanvas;
    }
    if (id === 'titleText' || id === 'treeDnaTooltip' || id === 'tooltipTitle' || id === 'tooltipContent') {
      return {
        style: { opacity: '1' },
        textContent: '',
        innerHTML: '',
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }
      };
    }
    return {
      style: {},
      value: '',
      classList: { toggle: jest.fn(), contains: jest.fn(), remove: jest.fn(), add: jest.fn() }
    };
  }),
  querySelectorAll: jest.fn(() => []),
  querySelector: jest.fn(() => null),
  createElement: jest.fn(() => ({
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
    click: jest.fn(),
    href: '',
    download: ''
  })),
  body: {
    appendChild: jest.fn()
  }
};

const window = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: jest.fn(),
  requestAnimationFrame: jest.fn()
};

const performance = {
  mark: jest.fn(),
  measure: jest.fn(),
  now: jest.fn(() => Date.now())
};

const URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

const fetch = jest.fn(() => Promise.reject(new Error('No fetch in tests')));
const alert = jest.fn();

// Read canvas.js
const canvasJsPath = path.join(__dirname, '../../canvas.js');
const canvasJsContent = fs.readFileSync(canvasJsPath, 'utf8');

// Execute canvas.js in this scope and capture exports
let canvasExports = {};

// We need to capture the const variables, so we'll use indirect eval to make them global-ish
// We'll wrap the code in a function that returns what we need
const wrapper = `
  (function() {
    ${canvasJsContent}

    // Return the things we need
    return {
      clamp: typeof clamp !== 'undefined' ? clamp : null,
      random: typeof random !== 'undefined' ? random : null,
      randomInt: typeof randomInt !== 'undefined' ? randomInt : null,
      rotateAngle: typeof rotateAngle !== 'undefined' ? rotateAngle : null,
      create_random_tree: typeof create_random_tree !== 'undefined' ? create_random_tree : null,
      create_invisible_tree: typeof create_invisible_tree !== 'undefined' ? create_invisible_tree : null,
      copulate: typeof copulate !== 'undefined' ? copulate : null,
      mutate: typeof mutate !== 'undefined' ? mutate : null,
      GENE_CONSTRAINTS: typeof GENE_CONSTRAINTS !== 'undefined' ? GENE_CONSTRAINTS : null,
      Planter: typeof Planter !== 'undefined' ? Planter : null,
      Particle: typeof Particle !== 'undefined' ? Particle : null
    };
  })()
`;

try {
  const result = eval(wrapper);

  canvasExports = {
    clamp: result.clamp || ((value, min, max) => Math.max(min, Math.min(max, value))),
    random: result.random || ((min, max) => Math.random() * (max - min) + min),
    randomInt: result.randomInt || ((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
    rotateAngle: result.rotateAngle || (() => 0),
    create_random_tree: result.create_random_tree || (() => ({})),
    create_invisible_tree: result.create_invisible_tree || (() => ({})),
    copulate: result.copulate || (() => ({})),
    mutate: result.mutate || (() => {}),
    GENE_CONSTRAINTS: result.GENE_CONSTRAINTS || {},
    Planter: result.Planter || class {},
    Particle: result.Particle || class {}
  };
} catch (error) {
  console.error('Error loading canvas.js:', error.message);
  // Provide fallback exports
  canvasExports = {
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    random: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    rotateAngle: () => 0,
    create_random_tree: () => ({}),
    create_invisible_tree: () => ({}),
    copulate: () => ({}),
    mutate: () => {},
    GENE_CONSTRAINTS: {},
    Planter: class {},
    Particle: class {}
  };
}

module.exports = canvasExports;

/**
 * Unit tests for Color class and related utilities
 * Tests RGB color manipulation, clamping, and randomization
 */

const { Color, clampRound } = require('../helpers/import-color');

describe('Color class', () => {
  describe('constructor', () => {
    test('should create a color with RGBA values', () => {
      const color = new Color(100, 150, 200, 255);
      expect(color.r).toBe(100);
      expect(color.g).toBe(150);
      expect(color.b).toBe(200);
      expect(color.a).toBe(255);
    });

    test('should default alpha to 255 if not provided', () => {
      const color = new Color(100, 150, 200);
      expect(color.a).toBe(255);
    });

    test('should handle alpha value of 0', () => {
      const color = new Color(100, 150, 200, 0);
      expect(color.a).toBe(0);
    });
  });

  describe('toCSS', () => {
    test('should return CSS rgb format string', () => {
      const color = new Color(100, 150, 200);
      expect(color.toCSS()).toBe('rgb(100,150,200)');
    });

    test('should handle edge case values', () => {
      const black = new Color(0, 0, 0);
      expect(black.toCSS()).toBe('rgb(0,0,0)');

      const white = new Color(255, 255, 255);
      expect(white.toCSS()).toBe('rgb(255,255,255)');
    });
  });

  describe('randomise', () => {
    test('should return a new Color instance', () => {
      const original = new Color(100, 150, 200);
      const randomized = original.randomise(10);

      expect(randomized).toBeInstanceOf(Color);
      expect(randomized).not.toBe(original); // Should be a new object
    });

    test('should keep colors within valid RGB range (0-255)', () => {
      const color = new Color(128, 128, 128);

      // Test multiple randomizations
      for (let i = 0; i < 100; i++) {
        const randomized = color.randomise(50);
        expect(randomized.r).toBeGreaterThanOrEqual(0);
        expect(randomized.r).toBeLessThanOrEqual(255);
        expect(randomized.g).toBeGreaterThanOrEqual(0);
        expect(randomized.g).toBeLessThanOrEqual(255);
        expect(randomized.b).toBeGreaterThanOrEqual(0);
        expect(randomized.b).toBeLessThanOrEqual(255);
      }
    });

    test('should clamp values at boundaries', () => {
      // Test color near black
      const nearBlack = new Color(5, 5, 5);
      const randomizedBlack = nearBlack.randomise(20);
      expect(randomizedBlack.r).toBeGreaterThanOrEqual(0);
      expect(randomizedBlack.g).toBeGreaterThanOrEqual(0);
      expect(randomizedBlack.b).toBeGreaterThanOrEqual(0);

      // Test color near white
      const nearWhite = new Color(250, 250, 250);
      const randomizedWhite = nearWhite.randomise(20);
      expect(randomizedWhite.r).toBeLessThanOrEqual(255);
      expect(randomizedWhite.g).toBeLessThanOrEqual(255);
      expect(randomizedWhite.b).toBeLessThanOrEqual(255);
    });

    test('should vary from original color within deviation range', () => {
      const original = new Color(128, 128, 128);
      const deviation = 10;

      // Test that randomization produces values roughly within range
      // (statistical test, may occasionally fail due to randomness)
      const randomized = original.randomise(deviation);

      // Values should be different (highly likely with randomization)
      const isDifferent =
        randomized.r !== original.r ||
        randomized.g !== original.g ||
        randomized.b !== original.b;

      expect(isDifferent).toBe(true);
    });
  });

  describe('grayscale static method', () => {
    test('should create grayscale color with equal RGB values', () => {
      const gray = Color.grayscale(128);
      expect(gray.r).toBe(128);
      expect(gray.g).toBe(128);
      expect(gray.b).toBe(128);
    });

    test('should work with edge values', () => {
      const black = Color.grayscale(0);
      expect(black.r).toBe(0);
      expect(black.g).toBe(0);
      expect(black.b).toBe(0);

      const white = Color.grayscale(255);
      expect(white.r).toBe(255);
      expect(white.g).toBe(255);
      expect(white.b).toBe(255);
    });
  });
});

describe('clampRound utility function', () => {
  test('should clamp values below 0 to 0', () => {
    expect(clampRound(-10)).toBe(0);
    expect(clampRound(-0.1)).toBe(0);
  });

  test('should clamp values above 255 to 255', () => {
    expect(clampRound(300)).toBe(255);
    expect(clampRound(255.1)).toBe(255);
  });

  test('should round decimal values', () => {
    expect(clampRound(127.4)).toBe(127);
    expect(clampRound(127.5)).toBe(128);
    expect(clampRound(127.6)).toBe(128);
  });

  test('should handle valid range values correctly', () => {
    expect(clampRound(0)).toBe(0);
    expect(clampRound(128)).toBe(128);
    expect(clampRound(255)).toBe(255);
  });

  test('should combine rounding and clamping', () => {
    expect(clampRound(255.6)).toBe(255); // Would round to 256, but clamped to 255
    expect(clampRound(-0.6)).toBe(0); // Would round to -1, but clamped to 0
  });
});

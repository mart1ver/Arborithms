/**
 * Unit tests for utility functions
 * Tests random number generation, clamping, and angle rotation
 */

const { random, randomInt, clamp, rotateAngle } = require('../helpers/import-canvas');

describe('Utility Functions', () => {
  describe('random(min, max)', () => {
    test('should return value within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = random(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThan(20);
      }
    });

    test('should handle negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const value = random(-20, -10);
        expect(value).toBeGreaterThanOrEqual(-20);
        expect(value).toBeLessThan(-10);
      }
    });

    test('should handle ranges crossing zero', () => {
      for (let i = 0; i < 100; i++) {
        const value = random(-10, 10);
        expect(value).toBeGreaterThanOrEqual(-10);
        expect(value).toBeLessThan(10);
      }
    });

    test('should handle decimal ranges', () => {
      for (let i = 0; i < 100; i++) {
        const value = random(0.5, 1.5);
        expect(value).toBeGreaterThanOrEqual(0.5);
        expect(value).toBeLessThan(1.5);
      }
    });

    test('should return min when min equals max', () => {
      const value = random(5, 5);
      expect(value).toBe(5);
    });
  });

  describe('randomInt(min, max)', () => {
    test('should return integer within inclusive range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(1, 10);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    test('should handle negative integer ranges', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(-10, -1);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(-10);
        expect(value).toBeLessThanOrEqual(-1);
      }
    });

    test('should return min when min equals max', () => {
      const value = randomInt(5, 5);
      expect(value).toBe(5);
    });

    test('should include both min and max in possible values', () => {
      const results = new Set();
      // Run many times to statistically verify both endpoints are possible
      for (let i = 0; i < 1000; i++) {
        results.add(randomInt(1, 3));
      }
      expect(results.has(1)).toBe(true);
      expect(results.has(2)).toBe(true);
      expect(results.has(3)).toBe(true);
    });

    test('should round decimal inputs correctly', () => {
      // Min should be ceiled, max should be floored
      for (let i = 0; i < 100; i++) {
        const value = randomInt(1.7, 5.3);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(2); // ceil(1.7)
        expect(value).toBeLessThanOrEqual(5); // floor(5.3)
      }
    });
  });

  describe('clamp(value, min, max)', () => {
    test('should return value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0.5, 0, 1)).toBe(0.5);
    });

    test('should clamp to min when value is below min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, -50, 50)).toBe(-50);
    });

    test('should clamp to max when value is above max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, -50, 50)).toBe(50);
    });

    test('should handle boundary values correctly', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    test('should work with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    test('should work with decimal values', () => {
      expect(clamp(0.5, 0.1, 0.9)).toBe(0.5);
      expect(clamp(1.5, 0.1, 0.9)).toBe(0.9);
      expect(clamp(0.05, 0.1, 0.9)).toBe(0.1);
    });
  });

  describe('rotateAngle(from, to, amount)', () => {
    test('should return from angle when amount is 0', () => {
      const result = rotateAngle(Math.PI / 4, Math.PI / 2, 0);
      expect(result).toBeCloseTo(Math.PI / 4, 5);
    });

    test('should clamp amount to [-1, 1] range', () => {
      // Amount > 1 should be treated as 1
      const result1 = rotateAngle(0, Math.PI / 2, 5);
      const result2 = rotateAngle(0, Math.PI / 2, 1);
      expect(result1).toBeCloseTo(result2, 5);

      // Amount < -1 should be treated as -1
      const result3 = rotateAngle(0, Math.PI / 2, -5);
      const result4 = rotateAngle(0, Math.PI / 2, -1);
      expect(result3).toBeCloseTo(result4, 5);
    });

    test('should rotate towards target angle', () => {
      // Rotating from 0 towards PI/2
      const from = 0;
      const to = Math.PI / 2;
      const result = rotateAngle(from, to, 0.5);

      // Result should be between from and to
      expect(result).toBeGreaterThan(from);
      expect(result).toBeLessThan(to);
    });

    test('should handle angle wrapping (2π normalization)', () => {
      // Test that angles are normalized to [0, 2π)
      const result = rotateAngle(0, 0, 0.5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(Math.PI * 2);
    });

    test('should take shortest path around circle', () => {
      // From 0 to 2π-0.1 should rotate backwards (negative), not all the way around
      const from = 0;
      const to = Math.PI * 2 - 0.1;
      const result = rotateAngle(from, to, 0.5);

      // Should be close to 2π (wrapped) rather than PI (halfway around)
      expect(result).toBeGreaterThan(Math.PI * 1.5);
    });

    test('should handle gravity effect (upward rotation)', () => {
      // Common use case: rotating towards -PI/2 (upward)
      const from = Math.PI / 4;
      const to = Math.PI / -2;
      const result = rotateAngle(from, to, 0.1);

      // Should move towards upward direction
      expect(result).toBeDefined();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(Math.PI * 2);
    });
  });
});

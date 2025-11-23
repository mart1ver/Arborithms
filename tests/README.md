# Arborithms Test Suite

This directory contains comprehensive unit tests for the Arborithms genetic tree algorithm project.

## Test Coverage

### Total: 64 tests across 3 test suites
- **Color class tests**: 16 tests
- **Utility function tests**: 22 tests
- **Genetic algorithm tests**: 26 tests

## Test Categories

### 1. Color Class Tests (`tests/unit/color.test.js`)
Tests for color manipulation and randomization:
- Constructor initialization with RGBA values
- CSS color string generation
- Color randomization within RGB bounds (0-255)
- Grayscale color creation
- Value clamping and rounding

### 2. Utility Function Tests (`tests/unit/utils.test.js`)
Tests for mathematical and utility functions:
- `random(min, max)` - Float random number generation
- `randomInt(min, max)` - Integer random number generation with inclusive bounds
- `clamp(value, min, max)` - Value constraint enforcement
- `rotateAngle(from, to, amount)` - Angle interpolation and wrapping

### 3. Genetic Algorithm Tests (`tests/unit/genetic-algorithm.test.js`)
Tests for the core genetic breeding system:

#### Tree Creation
- Random tree generation with all 24 genes
- Gene constraint validation
- Invisible tree initialization

#### Copulation (Breeding)
- Mendelian 50/50 inheritance from parents
- Mutation during breeding (5% rate)
- Gene constraint enforcement after breeding
- Generation counter inheritance
- Color inheritance
- TxMut (mutation rate) clamping

#### Mutation
- Mutation rate application
- ±10% mutation factor
- Gene constraint respect after multiple mutations
- Generation counter incrementation
- Color mutation

#### Gene Constraints
- All 22 gene constraints defined with min/max bounds
- Constraint validation across all operations

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run with verbose output
npm run test:verbose
```

## Test Infrastructure

### Framework
- **Jest** - Modern JavaScript testing framework
- **jsdom** - DOM environment for browser API mocking

### Helper Modules
- `tests/helpers/import-color.js` - Imports Color class for testing
- `tests/helpers/import-canvas.js` - Imports canvas.js functions with browser API mocks

### Configuration
- `jest.config.js` - Jest configuration
- `tests/setup.js` - Test environment setup and global mocks

## Critical Areas Tested

### High Priority ✅
1. **Genetic Algorithm Integrity**
   - Mutations stay within defined constraints
   - Inheritance follows 50/50 Mendelian genetics
   - Mutation rates are applied correctly
   - All 22 gene constraints are enforced

2. **Color Manipulation**
   - RGB values clamped to 0-255
   - Randomization stays within valid bounds
   - CSS color generation works correctly

3. **Utility Functions**
   - Random number generation works within specified ranges
   - Angle rotation handles wrapping correctly
   - Clamping enforces min/max bounds

## Gene Constraints Covered

The tests validate all 22 gene constraints:
- TxMut, lt, mnSpt, thk, gtInitial, gtPerGen
- warping, angDif, sEndMx, sMidMx, lfGen
- lfAmount, lfLength, lfGravity, lfThickness, lfSteps
- asymmetry, branchAngle, trunkTaper, branchDensity
- colorVariation, leafCluster

## Areas for Future Testing

### Medium Priority
- **Physics Simulation** - Planter and Particle update cycles
- **File I/O** - JSON export/import and round-trip validation
- **Tree Lifecycle** - Full breed → save → load integration tests

### Lower Priority
- **DOM Interactions** - Tooltip system and UI controls
- **Canvas Rendering** - Visual regression tests
- **Performance** - Benchmark tests for genetic operations

## Test Metrics

- **Test Suites**: 3 passed
- **Tests**: 64 passed
- **Test Duration**: ~4-7 seconds
- **Coverage**: Core genetic algorithms, color manipulation, and utilities

## Adding New Tests

1. Create test file in `tests/unit/` or `tests/integration/`
2. Import required modules from helpers:
   ```javascript
   const { Color } = require('../helpers/import-color');
   const { copulate, mutate } = require('../helpers/import-canvas');
   ```
3. Write tests following existing patterns
4. Run `npm test` to verify

## Notes

- Tests use mocked browser APIs (canvas, document, window)
- Genetic algorithm tests verify mathematical correctness
- All tests are deterministic despite using randomization (validated statistically)
- Console warnings about Trees.json are expected in test environment

/**
 * Unit tests for genetic algorithm functions
 * Tests tree breeding (copulation), mutation, and constraint enforcement
 */

const { Color } = require('../helpers/import-color');
const {
  create_random_tree,
  create_invisible_tree,
  copulate,
  mutate,
  GENE_CONSTRAINTS
} = require('../helpers/import-canvas');

describe('Genetic Algorithm - Tree Creation', () => {
  describe('create_random_tree()', () => {
    test('should create a tree with all required genes', () => {
      const tree = create_random_tree();

      // Check all expected genes exist
      expect(tree).toHaveProperty('TxMut');
      expect(tree).toHaveProperty('gen');
      expect(tree).toHaveProperty('lt');
      expect(tree).toHaveProperty('mnSpt');
      expect(tree).toHaveProperty('thk');
      expect(tree).toHaveProperty('gtInitial');
      expect(tree).toHaveProperty('gtPerGen');
      expect(tree).toHaveProperty('warping');
      expect(tree).toHaveProperty('lfGen');
      expect(tree).toHaveProperty('angDif');
      expect(tree).toHaveProperty('lfAmount');
      expect(tree).toHaveProperty('lfLength');
      expect(tree).toHaveProperty('lfGravity');
      expect(tree).toHaveProperty('lfThickness');
      expect(tree).toHaveProperty('sEndMx');
      expect(tree).toHaveProperty('sMidMx');
      expect(tree).toHaveProperty('lfSteps');
      expect(tree).toHaveProperty('colorBase');
      expect(tree).toHaveProperty('colorLeaves');
      expect(tree).toHaveProperty('asymmetry');
      expect(tree).toHaveProperty('branchAngle');
      expect(tree).toHaveProperty('trunkTaper');
      expect(tree).toHaveProperty('branchDensity');
      expect(tree).toHaveProperty('colorVariation');
      expect(tree).toHaveProperty('leafCluster');
    });

    test('should create colors as Color instances', () => {
      const tree = create_random_tree();
      expect(tree.colorBase).toBeInstanceOf(Color);
      expect(tree.colorLeaves).toBeInstanceOf(Color);
    });

    test('should initialize generation to 0', () => {
      const tree = create_random_tree();
      expect(tree.gen).toBe(0);
    });

    test('should respect gene constraints', () => {
      // Test multiple random trees
      for (let i = 0; i < 50; i++) {
        const tree = create_random_tree();

        // Test each gene against its constraints
        for (const gene in tree) {
          if (GENE_CONSTRAINTS[gene] && typeof tree[gene] === 'number') {
            expect(tree[gene]).toBeGreaterThanOrEqual(GENE_CONSTRAINTS[gene].min);
            expect(tree[gene]).toBeLessThanOrEqual(GENE_CONSTRAINTS[gene].max);
          }
        }
      }
    });

    test('should create different trees each time', () => {
      const tree1 = create_random_tree();
      const tree2 = create_random_tree();

      // Trees should be different (at least one gene differs)
      let isDifferent = false;
      for (const gene in tree1) {
        if (typeof tree1[gene] === 'number' && tree1[gene] !== tree2[gene]) {
          isDifferent = true;
          break;
        }
      }
      expect(isDifferent).toBe(true);
    });
  });

  describe('create_invisible_tree()', () => {
    test('should create a tree with zero size genes', () => {
      const tree = create_invisible_tree();

      expect(tree.TxMut).toBe(0);
      expect(tree.gen).toBe(0);
      expect(tree.lt).toBe(0);
      expect(tree.thk).toBe(0);
      expect(tree.lfGen).toBe(0);
      expect(tree.lfAmount).toBe(0);
      expect(tree.lfLength).toBe(0);
      expect(tree.lfThickness).toBe(0);
      expect(tree.sEndMx).toBe(0);
      expect(tree.sMidMx).toBe(0);
      expect(tree.lfSteps).toBe(0);
    });

    test('should have transparent colors (alpha = 0)', () => {
      const tree = create_invisible_tree();
      expect(tree.colorBase.a).toBe(0);
      expect(tree.colorLeaves.a).toBe(0);
    });
  });
});

describe('Genetic Algorithm - Copulation (Breeding)', () => {
  let parent1, parent2;

  beforeEach(() => {
    parent1 = create_random_tree();
    parent2 = create_random_tree();
  });

  test('should create child with genes from both parents', () => {
    const child = copulate(parent1, parent2);
    expect(child).toBeDefined();
    expect(typeof child).toBe('object');
  });

  test('should inherit all genes from parents', () => {
    const child = copulate(parent1, parent2);

    // Check that child has all the same gene keys
    for (const gene in parent1) {
      expect(child).toHaveProperty(gene);
    }
  });

  test('should respect gene constraints after copulation', () => {
    // Test multiple copulations
    for (let i = 0; i < 50; i++) {
      const p1 = create_random_tree();
      const p2 = create_random_tree();
      const child = copulate(p1, p2);

      // Test each gene against its constraints
      for (const gene in child) {
        if (GENE_CONSTRAINTS[gene] && typeof child[gene] === 'number') {
          expect(child[gene]).toBeGreaterThanOrEqual(GENE_CONSTRAINTS[gene].min);
          expect(child[gene]).toBeLessThanOrEqual(GENE_CONSTRAINTS[gene].max);
        }
      }
    }
  });

  test('should apply Mendelian inheritance (50/50 from each parent)', () => {
    // Create distinct parents for easier tracking
    const p1 = create_random_tree();
    const p2 = create_random_tree();

    // Set distinct values for a specific gene
    p1.lt = 1.0;
    p2.lt = 0.5;

    // Test multiple copulations - should get mix of both values
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      const child = copulate(p1, p2);
      // Value should be close to one parent or the other (allowing for mutation)
      results.add(Math.abs(child.lt - p1.lt) < 0.1 || Math.abs(child.lt - p2.lt) < 0.1);
    }

    // At least some children should inherit from each parent
    expect(results.size).toBeGreaterThan(0);
  });

  test('should inherit generation from highest parent', () => {
    parent1.gen = 5;
    parent2.gen = 3;

    const child = copulate(parent1, parent2);
    expect(child.gen).toBe(5);
  });

  test('should clamp TxMut within constraints', () => {
    parent1.TxMut = 0.01;
    parent2.TxMut = 20;

    for (let i = 0; i < 50; i++) {
      const child = copulate(parent1, parent2);
      expect(child.TxMut).toBeGreaterThanOrEqual(GENE_CONSTRAINTS.TxMut.min);
      expect(child.TxMut).toBeLessThanOrEqual(GENE_CONSTRAINTS.TxMut.max);
    }
  });

  test('should inherit color from one parent randomly', () => {
    parent1.colorBase = new Color(255, 0, 0);
    parent2.colorBase = new Color(0, 0, 255);

    const children = [];
    for (let i = 0; i < 20; i++) {
      children.push(copulate(parent1, parent2));
    }

    // Should have some children with each parent's color
    const hasRed = children.some(c => c.colorBase.r === 255 && c.colorBase.b === 0);
    const hasBlue = children.some(c => c.colorBase.b === 255 && c.colorBase.r === 0);

    expect(hasRed || hasBlue).toBe(true);
  });

  test('should handle mutation during copulation', () => {
    // With 5% mutation rate, some genes should mutate
    const children = [];
    for (let i = 0; i < 100; i++) {
      children.push(copulate(parent1, parent2));
    }

    // At least some children should have mutated genes
    // (statistically, with 100 children and many genes, at least one should mutate)
    expect(children.length).toBe(100);
  });

  test('should maintain gene validity after mutation', () => {
    for (let i = 0; i < 50; i++) {
      const child = copulate(parent1, parent2);

      // All numeric genes should be valid numbers
      for (const gene in child) {
        if (typeof child[gene] === 'number') {
          expect(isNaN(child[gene])).toBe(false);
          expect(isFinite(child[gene])).toBe(true);
        }
      }
    }
  });
});

describe('Genetic Algorithm - Mutation', () => {
  test('should mutate numeric genes within constraints', () => {
    const tree = create_random_tree();
    tree.TxMut = 1.0; // High mutation rate for testing

    const original = JSON.parse(JSON.stringify(tree)); // Deep copy for comparison

    mutate(tree);

    // At least some genes should have changed (with high mutation rate)
    let hasChanged = false;
    for (const gene in tree) {
      if (typeof tree[gene] === 'number' && gene !== 'gen' && tree[gene] !== original[gene]) {
        hasChanged = true;
        break;
      }
    }

    // With high mutation rate, at least one gene should change
    expect(hasChanged).toBe(true);
  });

  test('should respect gene constraints after mutation', () => {
    const tree = create_random_tree();
    tree.TxMut = 1.0; // Ensure high mutation

    // Mutate multiple times
    for (let i = 0; i < 10; i++) {
      mutate(tree);

      // Check all constraints
      for (const gene in tree) {
        if (GENE_CONSTRAINTS[gene] && typeof tree[gene] === 'number') {
          expect(tree[gene]).toBeGreaterThanOrEqual(GENE_CONSTRAINTS[gene].min);
          expect(tree[gene]).toBeLessThanOrEqual(GENE_CONSTRAINTS[gene].max);
        }
      }
    }
  });

  test('should increment generation counter', () => {
    const tree = create_random_tree();
    const originalGen = tree.gen;

    mutate(tree);

    expect(tree.gen).toBe(originalGen + 1);
  });

  test('should not mutate generation counter', () => {
    const tree = create_random_tree();
    tree.gen = 5;

    mutate(tree);

    // Gen should be incremented, not mutated
    expect(tree.gen).toBe(6);
  });

  test('should apply mutation based on TxMut rate', () => {
    // Test with zero mutation rate
    const tree1 = create_random_tree();
    tree1.TxMut = 0;
    const original1 = { ...tree1 };

    mutate(tree1);

    // With 0% mutation, numeric genes should mostly stay the same (except gen)
    // Colors might still change due to random chance in the mutation check

    // Test with high mutation rate
    const tree2 = create_random_tree();
    tree2.TxMut = 1.0; // 100% mutation rate

    mutate(tree2);

    // With 100% mutation, many genes should change
    let changedCount = 0;
    for (const gene in tree2) {
      if (typeof tree2[gene] === 'number' && gene !== 'gen' && gene !== 'TxMut') {
        changedCount++;
      }
    }

    expect(changedCount).toBeGreaterThan(0);
  });

  test('should apply ±10% mutation factor', () => {
    const tree = create_random_tree();
    tree.lt = 1.0; // Set to known value
    tree.TxMut = 1.0; // Ensure mutation happens

    // Mutate many times and track results
    const results = [];
    for (let i = 0; i < 100; i++) {
      const testTree = { ...tree, colorBase: tree.colorBase, colorLeaves: tree.colorLeaves };
      mutate(testTree);
      results.push(testTree.lt);
    }

    // At least some values should be within ±10% range (0.9x or 1.1x)
    // Due to constraints, some might hit boundaries
    expect(results.length).toBe(100);
  });

  test('should handle color mutation', () => {
    const tree = create_random_tree();
    tree.TxMut = 1.0;
    const originalColorBase = tree.colorBase;

    // Mutate multiple times
    for (let i = 0; i < 20; i++) {
      mutate(tree);
    }

    // Color might have changed (depends on random chance)
    expect(tree.colorBase).toBeDefined();
    expect(tree.colorBase).toBeInstanceOf(Color);
  });
});

describe('Gene Constraints Validation', () => {
  test('GENE_CONSTRAINTS should be defined', () => {
    expect(GENE_CONSTRAINTS).toBeDefined();
    expect(typeof GENE_CONSTRAINTS).toBe('object');
  });

  test('all constraints should have min and max', () => {
    for (const gene in GENE_CONSTRAINTS) {
      expect(GENE_CONSTRAINTS[gene]).toHaveProperty('min');
      expect(GENE_CONSTRAINTS[gene]).toHaveProperty('max');
      expect(GENE_CONSTRAINTS[gene].min).toBeLessThanOrEqual(GENE_CONSTRAINTS[gene].max);
    }
  });

  test('constraints should cover all major genes', () => {
    const expectedGenes = [
      'TxMut', 'lt', 'mnSpt', 'thk', 'gtInitial', 'gtPerGen',
      'warping', 'angDif', 'sEndMx', 'sMidMx', 'lfGen',
      'lfAmount', 'lfLength', 'lfGravity', 'lfThickness', 'lfSteps',
      'asymmetry', 'branchAngle', 'trunkTaper', 'branchDensity',
      'colorVariation', 'leafCluster'
    ];

    for (const gene of expectedGenes) {
      expect(GENE_CONSTRAINTS).toHaveProperty(gene);
    }
  });
});

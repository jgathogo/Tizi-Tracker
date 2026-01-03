/**
 * Utility functions for calculating weight per side and plate breakdowns
 */

/**
 * Gets the standard bar weight based on unit
 */
export const getBarWeight = (unit: 'kg' | 'lb'): number => {
  return unit === 'kg' ? 20 : 45;
};

/**
 * Calculates the weight to be loaded per side of the barbell
 * 
 * Args:
 *   totalWeight: Total weight including bar
 *   unit: Weight unit (kg or lb)
 * 
 * Returns:
 *   number: Weight per side (0 if totalWeight is less than or equal to bar weight)
 */
export const getWeightPerSide = (totalWeight: number, unit: 'kg' | 'lb'): number => {
  const barWeight = getBarWeight(unit);
  if (totalWeight <= barWeight) return 0;
  return (totalWeight - barWeight) / 2;
};

/**
 * Common plate sizes available in most gyms
 */
const PLATE_SIZES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_SIZES_LB = [45, 35, 25, 10, 5, 2.5];

/**
 * Calculates the plate breakdown for a given weight per side
 * Uses a greedy algorithm to find the combination of plates
 * 
 * Args:
 *   weightPerSide: Weight to load on each side
 *   unit: Weight unit (kg or lb)
 * 
 * Returns:
 *   Array<{weight: number, count: number}>: Array of plates needed (e.g., [{weight: 20, count: 1}, {weight: 5, count: 1}])
 */
export const getPlateBreakdown = (weightPerSide: number, unit: 'kg' | 'lb'): Array<{weight: number, count: number}> => {
  if (weightPerSide <= 0) return [];
  
  const plateSizes = unit === 'kg' ? PLATE_SIZES_KG : PLATE_SIZES_LB;
  const plates: Array<{weight: number, count: number}> = [];
  let remaining = weightPerSide;
  
  // Use greedy algorithm - start with largest plates
  for (const plateWeight of plateSizes) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      plates.push({ weight: plateWeight, count });
      remaining = remaining - (count * plateWeight);
    }
    // Round to 2 decimal places to avoid floating point errors
    remaining = Math.round(remaining * 100) / 100;
    if (remaining < 0.01) break;
  }
  
  return plates;
};

/**
 * Formats plate breakdown as a human-readable string
 * 
 * Args:
 *   plates: Array of plates from getPlateBreakdown
 *   unit: Weight unit (kg or lb)
 * 
 * Returns:
 *   string: Formatted string (e.g., "1×20kg + 1×5kg" or "Empty")
 */
export const formatPlateBreakdown = (plates: Array<{weight: number, count: number}>, unit: 'kg' | 'lb'): string => {
  if (plates.length === 0) return 'Empty bar';
  
  return plates.map(p => {
    if (p.count === 1) {
      return `${p.weight}${unit}`;
    } else {
      return `${p.count}×${p.weight}${unit}`;
    }
  }).join(' + ');
};



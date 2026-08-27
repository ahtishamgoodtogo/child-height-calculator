export type ChildSex = "boy" | "girl";

export type KhamisRocheCoefficients = {
  age: number;
  intercept: number;
  height: number;
  weight: number;
  midParent: number;
};

// Erratum-corrected coefficients (Khamis & Roche, Pediatrics 1994; erratum 1995).
// Formula uses imperial units: height (in), weight (lb), mid-parent (in).
export const BOYS_COEFFICIENTS: KhamisRocheCoefficients[] = [
  { age: 4.0, intercept: -10.2567, height: 1.23812, weight: -0.087235, midParent: 0.50286 },
  { age: 4.5, intercept: -10.719, height: 1.15964, weight: -0.074454, midParent: 0.52887 },
  { age: 5.0, intercept: -11.0213, height: 1.10674, weight: -0.064778, midParent: 0.53919 },
  { age: 5.5, intercept: -11.1556, height: 1.0748, weight: -0.05776, midParent: 0.53691 },
  { age: 6.0, intercept: -11.1138, height: 1.05923, weight: -0.052947, midParent: 0.52513 },
  { age: 6.5, intercept: -11.0221, height: 1.05542, weight: -0.049892, midParent: 0.50692 },
  { age: 7.0, intercept: -10.9984, height: 1.05877, weight: -0.048144, midParent: 0.48538 },
  { age: 7.5, intercept: -11.0214, height: 1.06467, weight: -0.047256, midParent: 0.46361 },
  { age: 8.0, intercept: -11.0696, height: 1.06853, weight: -0.046778, midParent: 0.44469 },
  { age: 8.5, intercept: -11.122, height: 1.06572, weight: -0.046261, midParent: 0.43171 },
  { age: 9.0, intercept: -11.1571, height: 1.05166, weight: -0.045254, midParent: 0.42776 },
  { age: 9.5, intercept: -11.1405, height: 1.02174, weight: -0.043311, midParent: 0.43593 },
  { age: 10.0, intercept: -11.038, height: 0.97135, weight: -0.039981, midParent: 0.45932 },
  { age: 10.5, intercept: -10.8286, height: 0.89589, weight: -0.034814, midParent: 0.50101 },
  { age: 11.0, intercept: -10.4917, height: 0.81239, weight: -0.02905, midParent: 0.54781 },
  { age: 11.5, intercept: -10.0065, height: 0.74134, weight: -0.024167, midParent: 0.58409 },
  { age: 12.0, intercept: -9.3522, height: 0.68325, weight: -0.020076, midParent: 0.60927 },
  { age: 12.5, intercept: -8.6055, height: 0.63869, weight: -0.016681, midParent: 0.62279 },
  { age: 13.0, intercept: -7.8632, height: 0.60818, weight: -0.013895, midParent: 0.62407 },
  { age: 13.5, intercept: -7.1348, height: 0.59228, weight: -0.011624, midParent: 0.61253 },
  { age: 14.0, intercept: -6.4299, height: 0.59151, weight: -0.009776, midParent: 0.58762 },
  { age: 14.5, intercept: -5.7578, height: 0.60643, weight: -0.008261, midParent: 0.54875 },
  { age: 15.0, intercept: -5.1282, height: 0.63757, weight: -0.006988, midParent: 0.49536 },
  { age: 15.5, intercept: -4.5092, height: 0.68548, weight: -0.005863, midParent: 0.42687 },
  { age: 16.0, intercept: -3.9292, height: 0.75069, weight: -0.004795, midParent: 0.34271 },
  { age: 16.5, intercept: -3.4873, height: 0.83375, weight: -0.003695, midParent: 0.24231 },
  { age: 17.0, intercept: -3.283, height: 0.9352, weight: -0.00247, midParent: 0.1251 },
  { age: 17.5, intercept: -3.4156, height: 1.05558, weight: -0.001027, midParent: -0.0095 },
];

export const GIRLS_COEFFICIENTS: KhamisRocheCoefficients[] = [
  { age: 4.0, intercept: -8.1325, height: 1.24768, weight: -0.19435, midParent: 0.44774 },
  { age: 4.5, intercept: -6.47656, height: 1.22177, weight: -0.18519, midParent: 0.41381 },
  { age: 5.0, intercept: -5.13582, height: 1.19932, weight: -0.1753, midParent: 0.38467 },
  { age: 5.5, intercept: -4.13791, height: 1.1788, weight: -0.16484, midParent: 0.36039 },
  { age: 6.0, intercept: -3.51039, height: 1.15866, weight: -0.154, midParent: 0.34105 },
  { age: 6.5, intercept: -3.14322, height: 1.13737, weight: -0.14294, midParent: 0.32672 },
  { age: 7.0, intercept: -2.87645, height: 1.11342, weight: -0.13184, midParent: 0.31748 },
  { age: 7.5, intercept: -2.66291, height: 1.08525, weight: -0.12086, midParent: 0.3134 },
  { age: 8.0, intercept: -2.45559, height: 1.05135, weight: -0.11019, midParent: 0.31457 },
  { age: 8.5, intercept: -2.20728, height: 1.01018, weight: -0.09999, midParent: 0.32105 },
  { age: 9.0, intercept: -1.87098, height: 0.9602, weight: -0.09044, midParent: 0.33291 },
  { age: 9.5, intercept: -1.0633, height: 0.89989, weight: -0.08171, midParent: 0.35025 },
  { age: 10.0, intercept: 0.33468, height: 0.82771, weight: -0.07397, midParent: 0.37312 },
  { age: 10.5, intercept: 1.97366, height: 0.74213, weight: -0.06739, midParent: 0.40161 },
  { age: 11.0, intercept: 3.50436, height: 0.67173, weight: -0.06136, midParent: 0.42042 },
  { age: 11.5, intercept: 4.57747, height: 0.6415, weight: -0.05518, midParent: 0.41686 },
  { age: 12.0, intercept: 4.84365, height: 0.64452, weight: -0.04894, midParent: 0.3949 },
  { age: 12.5, intercept: 4.27869, height: 0.67386, weight: -0.04272, midParent: 0.3585 },
  { age: 13.0, intercept: 3.21417, height: 0.7226, weight: -0.03661, midParent: 0.31163 },
  { age: 13.5, intercept: 1.83456, height: 0.78383, weight: -0.03067, midParent: 0.25826 },
  { age: 14.0, intercept: 0.32425, height: 0.85062, weight: -0.025, midParent: 0.20235 },
  { age: 14.5, intercept: -1.13224, height: 0.91605, weight: -0.01967, midParent: 0.14787 },
  { age: 15.0, intercept: -2.35055, height: 0.97319, weight: -0.01477, midParent: 0.0988 },
  { age: 15.5, intercept: -3.10326, height: 1.01514, weight: -0.01037, midParent: 0.05909 },
  { age: 16.0, intercept: -3.17885, height: 1.03496, weight: -0.00655, midParent: 0.03272 },
  { age: 16.5, intercept: -2.41657, height: 1.02573, weight: -0.0034, midParent: 0.02364 },
  { age: 17.0, intercept: -0.65579, height: 0.98054, weight: -0.001, midParent: 0.03584 },
  { age: 17.5, intercept: 2.26429, height: 0.89246, weight: 0.00057, midParent: 0.07327 },
];

export const MIN_AGE = 4;
export const MAX_AGE = 17.5;

/** Approximate 90% prediction ranges from published standard errors. */
export function estimatedRangeCm(sex: ChildSex) {
  return sex === "boy" ? 5.6 : 4.3;
}

function interpolateCoefficients(
  table: KhamisRocheCoefficients[],
  age: number
): KhamisRocheCoefficients {
  if (age <= table[0].age) return table[0];
  if (age >= table[table.length - 1].age) return table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    const lower = table[i];
    const upper = table[i + 1];

    if (age >= lower.age && age <= upper.age) {
      const t = (age - lower.age) / (upper.age - lower.age);

      return {
        age,
        intercept: lower.intercept + t * (upper.intercept - lower.intercept),
        height: lower.height + t * (upper.height - lower.height),
        weight: lower.weight + t * (upper.weight - lower.weight),
        midParent: lower.midParent + t * (upper.midParent - lower.midParent),
      };
    }
  }

  return table[table.length - 1];
}

/**
 * Predict adult height in centimeters using the Khamis-Roche method.
 * Inputs: age in years, child height cm, child weight kg, parent heights cm.
 */
export function predictAdultHeightCm(params: {
  sex: ChildSex;
  ageYears: number;
  childHeightCm: number;
  childWeightKg: number;
  fatherHeightCm: number;
  motherHeightCm: number;
}): number {
  const {
    sex,
    ageYears,
    childHeightCm,
    childWeightKg,
    fatherHeightCm,
    motherHeightCm,
  } = params;

  const table = sex === "boy" ? BOYS_COEFFICIENTS : GIRLS_COEFFICIENTS;
  const coeffs = interpolateCoefficients(table, ageYears);

  const heightIn = childHeightCm / 2.54;
  const weightLb = childWeightKg * 2.2046226218;
  const midParentIn = (fatherHeightCm + motherHeightCm) / 2 / 2.54;

  const predictedInches =
    coeffs.intercept +
    coeffs.height * heightIn +
    coeffs.weight * weightLb +
    coeffs.midParent * midParentIn;

  return predictedInches * 2.54;
}

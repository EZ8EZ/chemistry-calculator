/**
 * Element data for common elements used in organic, medicinal, and materials chemistry.
 * Ordered by atomic number. Contains CPK colors and standard valence information.
 */

import { ElementData, ElementCategory } from "./types";

function el(
  symbol: string,
  name: string,
  atomicNumber: number,
  mass: number,
  exactMass: number,
  defaultValences: number[],
  maxValence: number,
  electronegativity: number | null,
  color: string,
  category: ElementCategory
): ElementData {
  return { symbol, name, atomicNumber, mass, exactMass, defaultValences, maxValence, electronegativity, color, category };
}

export const ELEMENTS: Record<string, ElementData> = {
  H:  el("H",  "Hydrogen",    1,   1.008,   1.00783,  [1],       1, 2.20, "#FFFFFF", "nonmetal"),
  He: el("He", "Helium",      2,   4.003,   4.00260,  [0],       0, null, "#D9FFFF", "noble-gas"),
  Li: el("Li", "Lithium",     3,   6.941,   7.01600,  [1],       1, 0.98, "#CC80FF", "alkali-metal"),
  Be: el("Be", "Beryllium",   4,   9.012,   9.01218,  [2],       2, 1.57, "#C2FF00", "alkaline-earth"),
  B:  el("B",  "Boron",       5,  10.81,   11.00931,  [3],       4, 2.04, "#FFB5B5", "metalloid"),
  C:  el("C",  "Carbon",      6,  12.011,  12.00000,  [4],       4, 2.55, "#909090", "nonmetal"),
  N:  el("N",  "Nitrogen",    7,  14.007,  14.00307,  [3],       4, 3.04, "#3050F8", "nonmetal"),
  O:  el("O",  "Oxygen",      8,  15.999,  15.99491,  [2],       3, 3.44, "#FF4444", "nonmetal"),
  F:  el("F",  "Fluorine",    9,  18.998,  18.99840,  [1],       1, 3.98, "#90E050", "halogen"),
  Ne: el("Ne", "Neon",       10,  20.180,  19.99244,  [0],       0, null, "#B3E3F5", "noble-gas"),
  Na: el("Na", "Sodium",     11,  22.990,  22.98977,  [1],       1, 0.93, "#AB5CF2", "alkali-metal"),
  Mg: el("Mg", "Magnesium",  12,  24.305,  23.98504,  [2],       2, 1.31, "#8AFF00", "alkaline-earth"),
  Al: el("Al", "Aluminum",   13,  26.982,  26.98154,  [3],       3, 1.61, "#BFA6A6", "post-transition-metal"),
  Si: el("Si", "Silicon",    14,  28.086,  27.97693,  [4],       4, 1.90, "#F0C8A0", "metalloid"),
  P:  el("P",  "Phosphorus", 15,  30.974,  30.97376,  [3, 5],    5, 2.19, "#FF8000", "nonmetal"),
  S:  el("S",  "Sulfur",     16,  32.065,  31.97207,  [2, 4, 6], 6, 2.58, "#FFFF30", "nonmetal"),
  Cl: el("Cl", "Chlorine",   17,  35.453,  34.96885,  [1],       1, 3.16, "#1FF01F", "halogen"),
  Ar: el("Ar", "Argon",      18,  39.948,  39.96238,  [0],       0, null, "#80D1E3", "noble-gas"),
  K:  el("K",  "Potassium",  19,  39.098,  38.96371,  [1],       1, 0.82, "#8F40D4", "alkali-metal"),
  Ca: el("Ca", "Calcium",    20,  40.078,  39.96259,  [2],       2, 1.00, "#3DFF00", "alkaline-earth"),
  Ti: el("Ti", "Titanium",   22,  47.867,  47.94795,  [4],       4, 1.54, "#BFC2C7", "transition-metal"),
  Cr: el("Cr", "Chromium",   24,  51.996,  51.94051,  [3, 6],    6, 1.66, "#8A99C7", "transition-metal"),
  Mn: el("Mn", "Manganese",  25,  54.938,  54.93805,  [2, 4, 7], 7, 1.55, "#9C7AC7", "transition-metal"),
  Fe: el("Fe", "Iron",       26,  55.845,  55.93494,  [2, 3],    6, 1.83, "#E06633", "transition-metal"),
  Co: el("Co", "Cobalt",     27,  58.933,  58.93320,  [2, 3],    5, 1.88, "#F090A0", "transition-metal"),
  Ni: el("Ni", "Nickel",     28,  58.693,  57.93535,  [2],       4, 1.91, "#50D050", "transition-metal"),
  Cu: el("Cu", "Copper",     29,  63.546,  62.92960,  [1, 2],    3, 1.90, "#C88033", "transition-metal"),
  Zn: el("Zn", "Zinc",       30,  65.38,   63.92915,  [2],       2, 1.65, "#7D80B0", "transition-metal"),
  Ga: el("Ga", "Gallium",    31,  69.723,  68.92558,  [3],       3, 1.81, "#C28F8F", "post-transition-metal"),
  Ge: el("Ge", "Germanium",  32,  72.63,   73.92118,  [4],       4, 2.01, "#668F8F", "metalloid"),
  As: el("As", "Arsenic",    33,  74.922,  74.92160,  [3, 5],    5, 2.18, "#BD80E3", "metalloid"),
  Se: el("Se", "Selenium",   34,  78.96,   79.91652,  [2, 4, 6], 6, 2.55, "#FFA100", "nonmetal"),
  Br: el("Br", "Bromine",    35,  79.904,  78.91834,  [1],       1, 2.96, "#A62929", "halogen"),
  I:  el("I",  "Iodine",     53, 126.904, 126.90447,  [1],       7, 2.66, "#940094", "halogen"),
  Pt: el("Pt", "Platinum",   78, 195.084, 194.96479,  [2, 4],    6, 2.28, "#D0D0E0", "transition-metal"),
  Au: el("Au", "Gold",       79, 196.967, 196.96657,  [1, 3],    5, 2.54, "#FFD123", "transition-metal"),
};

/** Quick elements for the palette (most commonly used in organic/medicinal chemistry) */
export const PALETTE_ELEMENTS = ["H", "C", "N", "O", "F", "P", "S", "Cl", "Br", "I"];

/** Extended elements available via search */
export const EXTENDED_ELEMENTS = Object.keys(ELEMENTS);

export function getElement(symbol: string): ElementData | undefined {
  return ELEMENTS[symbol];
}

export function getDefaultValence(symbol: string): number {
  const el = ELEMENTS[symbol];
  if (!el) return 4;
  return el.defaultValences[0];
}

/**
 * Get the number of implicit hydrogens an atom should have
 * based on its element, bond order sum, and formal charge.
 */
export function calcImplicitHydrogens(
  symbol: string,
  bondOrderSum: number,
  formalCharge: number
): number {
  const elem = ELEMENTS[symbol];
  if (!elem) return 0;

  // Noble gases, metals with no standard H
  if (elem.defaultValences[0] === 0) return 0;

  // Find the best matching default valence
  const effectiveElectrons = bondOrderSum - formalCharge;

  for (const v of elem.defaultValences) {
    const implicitH = v - effectiveElectrons;
    if (implicitH >= 0) return implicitH;
  }

  return 0;
}

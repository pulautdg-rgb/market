import { Product } from '../types';

/**
 * Standard Code 128 Character Patterns (Indices 0 - 106)
 * Each pattern specifies [bar1, space1, bar2, space2, bar3, space3] module widths (sum = 11).
 * Index 106 (STOP) has 7 values [bar1, space1, bar2, space2, bar3, space3, bar4] (sum = 13).
 */
export const CODE128_PATTERNS: number[][] = [
  [2, 1, 2, 2, 2, 2], // 0: SP
  [2, 2, 2, 1, 2, 2], // 1: !
  [2, 2, 2, 2, 2, 1], // 2: "
  [1, 2, 1, 2, 2, 3], // 3: #
  [1, 2, 1, 3, 2, 2], // 4: $
  [1, 3, 1, 2, 2, 2], // 5: %
  [1, 2, 2, 2, 1, 3], // 6: &
  [1, 2, 2, 3, 1, 2], // 7: '
  [1, 3, 2, 2, 1, 2], // 8: (
  [2, 2, 1, 2, 1, 3], // 9: )
  [2, 2, 1, 3, 1, 2], // 10: *
  [2, 3, 1, 2, 1, 2], // 11: +
  [1, 1, 2, 2, 3, 2], // 12: ,
  [1, 2, 2, 1, 3, 2], // 13: -
  [1, 2, 2, 2, 3, 1], // 14: .
  [1, 1, 3, 2, 2, 2], // 15: /
  [1, 2, 3, 1, 2, 2], // 16: 0
  [1, 2, 3, 2, 2, 1], // 17: 1
  [2, 2, 3, 2, 1, 1], // 18: 2
  [2, 2, 1, 1, 3, 2], // 19: 3
  [2, 2, 1, 2, 3, 1], // 20: 4
  [2, 1, 3, 2, 1, 2], // 21: 5
  [2, 2, 3, 1, 1, 2], // 22: 6
  [3, 1, 2, 1, 3, 1], // 23: 7
  [3, 1, 1, 2, 2, 2], // 24: 8
  [3, 2, 1, 1, 2, 2], // 25: 9
  [3, 2, 1, 2, 2, 1], // 26: :
  [3, 1, 2, 2, 1, 2], // 27: ;
  [3, 2, 2, 1, 1, 2], // 28: <
  [3, 2, 2, 2, 1, 1], // 29: =
  [2, 1, 2, 1, 2, 3], // 30: >
  [2, 1, 2, 3, 2, 1], // 31: ?
  [2, 3, 2, 1, 2, 1], // 32: @
  [1, 1, 1, 3, 2, 3], // 33: A
  [1, 3, 1, 1, 2, 3], // 34: B
  [1, 3, 1, 3, 2, 1], // 35: C
  [1, 1, 2, 3, 1, 3], // 36: D
  [1, 3, 2, 1, 1, 3], // 37: E
  [1, 3, 2, 3, 1, 1], // 38: F
  [2, 1, 1, 3, 1, 3], // 39: G
  [2, 3, 1, 1, 1, 3], // 40: H
  [2, 3, 1, 3, 1, 1], // 41: I
  [1, 1, 2, 1, 3, 3], // 42: J
  [1, 1, 2, 3, 3, 1], // 43: K
  [1, 3, 2, 1, 3, 1], // 44: L
  [1, 1, 3, 1, 2, 3], // 45: M
  [1, 1, 3, 3, 2, 1], // 46: N
  [1, 3, 3, 1, 2, 1], // 47: O
  [3, 1, 3, 1, 2, 1], // 48: P
  [2, 1, 1, 3, 3, 1], // 49: Q
  [2, 3, 1, 1, 3, 1], // 50: R
  [2, 1, 3, 1, 1, 3], // 51: S
  [2, 1, 3, 3, 1, 1], // 52: T
  [2, 1, 3, 1, 3, 1], // 53: U
  [3, 1, 1, 1, 2, 3], // 54: V
  [3, 1, 1, 3, 2, 1], // 55: W
  [3, 3, 1, 1, 2, 1], // 56: X
  [3, 1, 2, 1, 1, 3], // 57: Y
  [3, 1, 2, 3, 1, 1], // 58: Z
  [3, 3, 2, 1, 1, 1], // 59: [
  [3, 1, 4, 1, 1, 1], // 60: \
  [2, 2, 1, 4, 1, 1], // 61: ]
  [4, 3, 1, 1, 1, 1], // 62: ^
  [1, 1, 1, 2, 2, 4], // 63: _
  [1, 1, 1, 4, 2, 2], // 64: `
  [1, 2, 1, 1, 2, 4], // 65: a
  [1, 2, 1, 4, 2, 1], // 66: b
  [1, 4, 1, 1, 2, 2], // 67: c
  [1, 4, 1, 2, 2, 1], // 68: d
  [1, 1, 2, 2, 1, 4], // 69: e
  [1, 1, 2, 4, 1, 2], // 70: f
  [1, 2, 2, 1, 1, 4], // 71: g
  [1, 2, 2, 4, 1, 1], // 72: h
  [1, 4, 2, 1, 1, 2], // 73: i
  [1, 4, 2, 2, 1, 1], // 74: j
  [2, 4, 1, 2, 1, 1], // 75: k
  [2, 2, 1, 1, 1, 4], // 76: l
  [4, 1, 3, 1, 1, 1], // 77: m
  [2, 4, 1, 1, 1, 2], // 78: n
  [1, 3, 4, 1, 1, 1], // 79: o
  [1, 1, 1, 2, 4, 2], // 80: p
  [1, 2, 1, 1, 4, 2], // 81: q
  [1, 2, 1, 2, 4, 1], // 82: r
  [1, 1, 4, 2, 1, 2], // 83: s
  [1, 2, 4, 1, 1, 2], // 84: t
  [1, 2, 4, 2, 1, 1], // 85: u
  [4, 1, 1, 2, 1, 2], // 86: v
  [4, 2, 1, 1, 1, 2], // 87: w
  [4, 2, 1, 2, 1, 1], // 88: x
  [2, 1, 2, 1, 4, 1], // 89: y
  [2, 1, 4, 1, 2, 1], // 90: z
  [4, 1, 2, 1, 2, 1], // 91: {
  [1, 1, 1, 1, 4, 3], // 92: |
  [1, 1, 1, 3, 4, 1], // 93: }
  [1, 3, 1, 1, 4, 1], // 94: ~
  [1, 1, 4, 1, 1, 3], // 95: DEL
  [1, 1, 4, 3, 1, 1], // 96: FNC3
  [4, 1, 1, 1, 1, 3], // 97: FNC2
  [4, 1, 1, 3, 1, 1], // 98: SHIFT
  [1, 1, 3, 1, 4, 1], // 99: CODE C
  [1, 1, 4, 1, 3, 1], // 100: CODE B
  [3, 1, 1, 1, 4, 1], // 101: FNC4
  [4, 1, 1, 1, 3, 1], // 102: FNC1
  [2, 1, 1, 4, 1, 2], // 103: START A
  [2, 1, 1, 2, 1, 4], // 104: START B
  [2, 1, 1, 2, 3, 2], // 105: START C
  [2, 3, 3, 1, 1, 1, 2] // 106: STOP
];

/**
 * Encode an ASCII string into Code 128 (Subset B) binary modules ('1' for bar, '0' for space).
 */
export function encodeCode128B(text: string): string {
  if (!text) text = 'SMK-000000';

  const START_B = 104;
  const STOP = 106;

  // Convert chars to indices (ASCII 32..126 -> index = charCode - 32)
  const indices: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 32 && code <= 126) {
      indices.push(code - 32);
    } else {
      indices.push(0); // fallback space
    }
  }

  // Calculate Checksum = (START_B + sum(pos * index)) % 103
  let checksum = START_B;
  for (let i = 0; i < indices.length; i++) {
    checksum += (i + 1) * indices[i];
  }
  const checkDigit = checksum % 103;

  const allSymbols = [START_B, ...indices, checkDigit, STOP];

  // Convert to bit sequence
  let bitSequence = '';
  allSymbols.forEach((symIndex) => {
    const pattern = CODE128_PATTERNS[symIndex];
    if (pattern) {
      let isBar = true;
      pattern.forEach((width) => {
        bitSequence += (isBar ? '1' : '0').repeat(width);
        isBar = !isBar;
      });
    }
  });

  return bitSequence;
}

/**
 * Auto-generate the next unique internal barcode in the format: SMK-000001
 * Increments sequentially based on all existing SMK- products in catalog.
 */
export function generateNextInternalBarcode(products: Product[]): string {
  let highestNum = 0;
  const regex = /^SMK-(\d+)$/i;

  products.forEach((prod) => {
    if (prod.barcode) {
      const match = prod.barcode.match(regex);
      if (match && match[1]) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > highestNum) {
          highestNum = val;
        }
      }
    }
    // Also check SKU if it follows SMK pattern
    if (prod.sku) {
      const matchSku = prod.sku.match(regex);
      if (matchSku && matchSku[1]) {
        const val = parseInt(matchSku[1], 10);
        if (!isNaN(val) && val > highestNum) {
          highestNum = val;
        }
      }
    }
  });

  const nextNum = highestNum + 1;
  return `SMK-${String(nextNum).padStart(6, '0')}`;
}

/**
 * Check if a barcode is duplicate across catalog (excluding current product being edited).
 */
export function isBarcodeDuplicate(
  barcode: string,
  currentProductId: string | undefined,
  products: Product[]
): boolean {
  if (!barcode || !barcode.trim()) return false;
  const clean = barcode.trim().toUpperCase();
  return products.some((p) => p.id !== currentProductId && p.barcode?.trim().toUpperCase() === clean);
}

/**
 * Determine barcode format & whether it's manufacturer branded or internal
 */
export function detectBarcodeMeta(barcode: string): {
  type: 'EAN13' | 'EAN8' | 'UPC_A' | 'UPC_E' | 'CODE128';
  source: 'manufacturer' | 'internal';
  label: string;
} {
  const clean = barcode ? barcode.trim() : '';

  if (/^SMK-\d+$/i.test(clean)) {
    return {
      type: 'CODE128',
      source: 'internal',
      label: 'Barcode Internal (Code 128)'
    };
  }

  // Pure digits: EAN-13, EAN-8, UPC
  if (/^\d{13}$/.test(clean)) {
    return {
      type: 'EAN13',
      source: 'manufacturer',
      label: 'Barcode Pabrik (EAN-13)'
    };
  }

  if (/^\d{12}$/.test(clean)) {
    return {
      type: 'UPC_A',
      source: 'manufacturer',
      label: 'Barcode Pabrik (UPC-A)'
    };
  }

  if (/^\d{8}$/.test(clean)) {
    return {
      type: 'EAN8',
      source: 'manufacturer',
      label: 'Barcode Pabrik (EAN-8)'
    };
  }

  return {
    type: 'CODE128',
    source: 'internal',
    label: 'Standard Code 128'
  };
}

/**
 * Calculate change breakdown in Indonesian Rupiah banknotes
 */
export function calculateCashBreakdown(changeAmount: number): { denom: number; count: number; label: string }[] {
  if (changeAmount <= 0) return [];

  const denominations = [
    { denom: 100000, label: 'Rp 100.000' },
    { denom: 50000, label: 'Rp 50.000' },
    { denom: 20000, label: 'Rp 20.000' },
    { denom: 10000, label: 'Rp 10.000' },
    { denom: 5000, label: 'Rp 5.000' },
    { denom: 2000, label: 'Rp 2.000' },
    { denom: 1000, label: 'Rp 1.000' },
    { denom: 500, label: 'Rp 500 (Koin)' }
  ];

  let remaining = changeAmount;
  const breakdown: { denom: number; count: number; label: string }[] = [];

  for (const item of denominations) {
    if (remaining >= item.denom) {
      const count = Math.floor(remaining / item.denom);
      breakdown.push({ denom: item.denom, count, label: item.label });
      remaining %= item.denom;
    }
  }

  return breakdown;
}

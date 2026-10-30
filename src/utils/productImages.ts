import { Product } from '../types';

/**
 * High-fidelity SVG default category placeholders.
 * Clean, modern, branded vector illustrations that never break or fail to load.
 */
export const DEFAULT_CATEGORY_IMAGES: Record<Product['category'], string> = {
  beras: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ecfdf5"/>
          <stop offset="100%" stop-color="#d1fae5"/>
        </linearGradient>
        <linearGradient id="sack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#059669"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <path d="M50 85 C50 65, 80 55, 100 55 C120 55, 150 65, 150 85 L145 155 C145 168, 125 175, 100 175 C75 175, 55 168, 55 155 Z" fill="url(#sack)" stroke="#065f46" stroke-width="4"/>
      <ellipse cx="100" cy="55" rx="35" ry="12" fill="#34d399" stroke="#065f46" stroke-width="3"/>
      <path d="M70 54 Q100 64 130 54" stroke="#047857" stroke-width="3" fill="none"/>
      <!-- Rice plant emblem -->
      <circle cx="100" cy="115" r="28" fill="#ffffff" opacity="0.9"/>
      <path d="M100 98 Q90 115 100 132 M100 105 Q112 110 100 120 M100 112 Q88 118 100 126" stroke="#059669" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <text x="100" y="160" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">BERAS</text>
    </svg>
  `)}`,

  minyak: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fefce8"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
        <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#facc15"/>
          <stop offset="100%" stop-color="#eab308"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <!-- Bottle neck & cap -->
      <rect x="90" y="40" width="20" height="15" rx="3" fill="#ca8a04"/>
      <path d="M85 55 L115 55 L125 80 L125 155 C125 165, 115 170, 100 170 C85 170, 75 165, 75 155 L75 80 Z" fill="url(#bottle)" stroke="#a16207" stroke-width="4"/>
      <rect x="80" y="95" width="40" height="45" rx="6" fill="#ffffff" opacity="0.95"/>
      <path d="M100 105 C108 115, 110 122, 100 128 C90 122, 92 115, 100 105 Z" fill="#eab308"/>
      <text x="100" y="160" font-family="sans-serif" font-size="11" font-weight="bold" fill="#713f12" text-anchor="middle">MINYAK</text>
    </svg>
  `)}`,

  gula: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0f9ff"/>
          <stop offset="100%" stop-color="#e0f2fe"/>
        </linearGradient>
        <linearGradient id="pouch" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <rect x="58" y="55" width="84" height="110" rx="12" fill="url(#pouch)" stroke="#075985" stroke-width="4"/>
      <!-- Pouch header seal -->
      <path d="M58 70 L142 70" stroke="#bae6fd" stroke-width="4" stroke-dasharray="4 2"/>
      <circle cx="100" cy="112" r="24" fill="#ffffff"/>
      <text x="100" y="117" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0284c7" text-anchor="middle">G</text>
      <text x="100" y="152" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">GULA PASIR</text>
    </svg>
  `)}`,

  telur: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff7ed"/>
          <stop offset="100%" stop-color="#ffedd5"/>
        </linearGradient>
        <linearGradient id="egg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdba74"/>
          <stop offset="100%" stop-color="#fb923c"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <!-- Egg tray bowl -->
      <path d="M40 135 Q100 170 160 135 L150 160 Q100 180 50 160 Z" fill="#9a3412" stroke="#7c2d12" stroke-width="3"/>
      <!-- 3 Eggs -->
      <ellipse cx="75" cy="115" rx="22" ry="30" fill="url(#egg)" stroke="#c2410c" stroke-width="3" transform="rotate(-10 75 115)"/>
      <ellipse cx="125" cy="115" rx="22" ry="30" fill="url(#egg)" stroke="#c2410c" stroke-width="3" transform="rotate(10 125 115)"/>
      <ellipse cx="100" cy="105" rx="23" ry="32" fill="url(#egg)" stroke="#c2410c" stroke-width="3"/>
      <text x="100" y="172" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">TELUR AYAM</text>
    </svg>
  `)}`,

  mie: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef2f2"/>
          <stop offset="100%" stop-color="#fee2e2"/>
        </linearGradient>
        <linearGradient id="pack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#dc2626"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <rect x="45" y="60" width="110" height="85" rx="10" fill="url(#pack)" stroke="#991b1b" stroke-width="4"/>
      <!-- Noodle wavy lines on pack -->
      <path d="M60 85 Q75 75 90 85 T120 85 T140 85" stroke="#fef08a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60 100 Q75 90 90 100 T120 100 T140 100" stroke="#fef08a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="70" y="112" width="60" height="22" rx="4" fill="#ffffff"/>
      <text x="100" y="127" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">MIE INSTAN</text>
    </svg>
  `)}`,

  gas: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0fdf4"/>
          <stop offset="100%" stop-color="#dcfce7"/>
        </linearGradient>
        <linearGradient id="lpg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="100%" stop-color="#16a34a"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <!-- Gas cylinder collar -->
      <path d="M75 55 L125 55 L120 70 L80 70 Z" fill="#15803d" stroke="#14532d" stroke-width="3"/>
      <!-- Body -->
      <rect x="65" y="70" width="70" height="80" rx="30" fill="url(#lpg)" stroke="#14532d" stroke-width="4"/>
      <!-- Ring base -->
      <ellipse cx="100" cy="155" rx="30" ry="8" fill="#15803d" stroke="#14532d" stroke-width="3"/>
      <circle cx="100" cy="108" r="18" fill="#ffffff" opacity="0.9"/>
      <text x="100" y="114" font-family="sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="middle">3kg</text>
      <text x="100" y="172" font-family="sans-serif" font-size="11" font-weight="bold" fill="#14532d" text-anchor="middle">GAS LPG</text>
    </svg>
  `)}`,

  lainnya: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#f1f5f9"/>
        </linearGradient>
        <linearGradient id="box" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#64748b"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)"/>
      <rect x="55" y="65" width="90" height="80" rx="10" fill="url(#box)" stroke="#334155" stroke-width="4"/>
      <path d="M55 90 L145 90 M100 65 L100 145" stroke="#94a3b8" stroke-width="3"/>
      <circle cx="100" cy="105" r="18" fill="#ffffff"/>
      <text x="100" y="111" font-family="sans-serif" font-size="14" font-weight="bold" fill="#475569" text-anchor="middle">📦</text>
      <text x="100" y="165" font-family="sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">SEMBAKO</text>
    </svg>
  `)}`
};

/**
 * Returns the effective image URL for a product, with category fallback and cache busting.
 */
export function getProductImageUrl(product?: Partial<Product> | null, withCacheBuster = true): string {
  if (!product) return DEFAULT_CATEGORY_IMAGES.lainnya;

  const rawUrl = product.imageUrl || product.image_url;

  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
    // If it's a base64 Data URL, return directly (no query string needed)
    if (rawUrl.startsWith('data:')) {
      return rawUrl;
    }
    // If external URL, append timestamp cache-buster if requested
    if (withCacheBuster && product.photoUpdatedAt) {
      const sep = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${sep}_t=${product.photoUpdatedAt}`;
    }
    return rawUrl;
  }

  // Fallback to category default
  const category = (product.category as Product['category']) || 'lainnya';
  return DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES.lainnya;
}

/**
 * Backward-compatible alias for getProductImageUrl
 */
export const getProductDisplayImage = getProductImageUrl;

/**
 * Checks if the product has a genuine custom photo uploaded by the user.
 */
export function isProductCustomPhoto(product?: Partial<Product> | null): boolean {
  if (!product) return false;
  if (product.isCustomPhoto === true) return true;
  const rawUrl = product.imageUrl || product.image_url;
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim().length === 0) return false;
  // If it's an uploaded data URL or non-google default
  if (rawUrl.startsWith('data:image/')) return true;
  return Boolean(product.imagePath || product.image_path || product.photoUpdatedAt);
}

/**
 * File validation for image upload:
 * - Formats: JPG, JPEG, PNG, WEBP
 * - Max size: 5 MB
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  if (!file) {
    return { valid: false, error: 'Tidak ada file yang dipilih.' };
  }

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Format file "${file.type || 'unknown'}" tidak didukung. Harap pilih gambar JPG, JPEG, PNG, atau WEBP.`
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Ukuran file terlalu besar (${sizeInMB} MB). Maksimal ukuran file adalah 5 MB.`
    };
  }

  return { valid: true };
}

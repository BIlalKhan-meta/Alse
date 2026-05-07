import {BASE_URL} from './baseurl';

/**
 * Resolves product / shop list image paths (absolute URL, relative, or //).
 */
export function resolveProductMediaUrl(
  value?: string | null,
): string | undefined {
  if (value == null || typeof value !== 'string') {
    return undefined;
  }
  const v = value.trim();
  if (!v) {
    return undefined;
  }
  if (v.startsWith('http://') || v.startsWith('https://')) {
    try {
      const baseHost = new URL(BASE_URL).host;
      const parsed = new URL(v);
      if (parsed.protocol === 'http:' && parsed.host === baseHost) {
        return `https://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      /* ignore */
    }
    return v;
  }
  if (v.startsWith('//')) {
    return `https:${v}`;
  }
  const root = BASE_URL.replace(/\/api\/?$/i, '');
  if (v.startsWith('/')) {
    return `${root}${v}`;
  }
  return `${root}/${v}`;
}

export function resolveProductListImageUrl(
  product: Record<string, any>,
): string | undefined {
  const first = product?.images?.[0];
  const path =
    (typeof first === 'string' ? first : first?.path ?? first?.url) ??
    product?.image ??
    product?.banner ??
    product?.thumbnail ??
    product?.media?.[0]?.path;
  return resolveProductMediaUrl(path);
}

function moneyLabel(raw: unknown): string {
  if (raw == null || raw === '') {
    return '—';
  }
  const n = Number(String(raw).replace(/,/g, ''));
  if (Number.isFinite(n)) {
    return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
  }
  return `$${raw}`;
}

export function getShopProductPriceParts(product: Record<string, any>): {
  current: string;
  original?: string;
} {
  const currentRaw =
    product?.sale_price ??
    product?.discounted_price ??
    product?.price ??
    product?.amount;
  const originalRaw =
    product?.old_price ??
    product?.compare_at_price ??
    product?.regular_price;

  const current = moneyLabel(currentRaw);
  const oNum = Number(String(originalRaw ?? '').replace(/,/g, ''));
  const cNum = Number(String(currentRaw ?? '').replace(/,/g, ''));
  const original =
    originalRaw != null &&
    originalRaw !== '' &&
    Number.isFinite(oNum) &&
    Number.isFinite(cNum) &&
    oNum > cNum
      ? moneyLabel(originalRaw)
      : undefined;

  return {current, original};
}

/** Strip HTML / collapse whitespace for card preview */
export function stripProductDescription(
  product: Record<string, any>,
  maxChars?: number,
): string {
  const raw =
    product?.description ??
    product?.short_description ??
    product?.summary ??
    '';
  let s = String(raw)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) {
    return '';
  }
  if (maxChars && s.length > maxChars) {
    return `${s.slice(0, maxChars).trim()}…`;
  }
  return s;
}

export function getProductCategoryLabel(product: Record<string, any>): string {
  const c = product?.category;
  if (c && typeof c === 'object' && (c.title || c.name)) {
    return String(c.title ?? c.name);
  }
  return '';
}

export function getProductBrandLabel(product: Record<string, any>): string {
  const b = product?.brand_name ?? product?.brand;
  return b != null && String(b).trim() !== '' ? String(b).trim() : '';
}

export function getStockLabel(product: Record<string, any>): string {
  const q = Number(product?.quantity ?? product?.stock ?? product?.qty);
  if (!Number.isFinite(q)) {
    return '';
  }
  if (q <= 0) {
    return 'Out of stock';
  }
  return `${q} in stock`;
}

export function getSkuLabel(product: Record<string, any>): string {
  const sku = product?.sku;
  if (sku != null && String(sku).trim() !== '') {
    return `SKU: ${String(sku).trim()}`;
  }
  return '';
}

export function getListingStatusLabel(product: Record<string, any>): string {
  const s = product?.status;
  if (s === true || s === 1 || s === '1' || s === 'active') {
    return 'Active listing';
  }
  if (
    s === false ||
    s === 0 ||
    s === '0' ||
    s === 'inactive' ||
    s === 'draft'
  ) {
    return 'Inactive';
  }
  return '';
}

export function getRatingLabel(product: Record<string, any>): string {
  const r = Number(product?.average_rating ?? product?.rating);
  const n = Number(product?.total_reviews ?? product?.reviews_count);
  if (!Number.isFinite(r) || r <= 0) {
    return '';
  }
  const star = '★';
  const rev =
    Number.isFinite(n) && n > 0
      ? ` (${n} review${n === 1 ? '' : 's'})`
      : '';
  return `${star} ${r.toFixed(1)}${rev}`;
}

/** Dot-separated meta line (category, brand, stock, status) */
export function buildProductMetaSummary(product: Record<string, any>): string {
  const parts: string[] = [];
  const cat = getProductCategoryLabel(product);
  if (cat) {
    parts.push(cat);
  }
  const brand = getProductBrandLabel(product);
  if (brand) {
    parts.push(brand);
  }
  const stock = getStockLabel(product);
  if (stock) {
    parts.push(stock);
  }
  const status = getListingStatusLabel(product);
  if (status) {
    parts.push(status);
  }
  return parts.join(' · ');
}

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
  const listPrice = product?.price ?? product?.amount ?? product?.regular_price;
  const saleRaw =
    product?.sale_price ??
    product?.discounted_price ??
    product?.effective_price;
  const listNum = Number(String(listPrice ?? '').replace(/,/g, ''));
  const saleNum = Number(String(saleRaw ?? '').replace(/,/g, ''));
  const hasSale =
    saleRaw != null &&
    saleRaw !== '' &&
    Number.isFinite(saleNum) &&
    Number.isFinite(listNum) &&
    saleNum > 0 &&
    saleNum < listNum;

  const currentRaw = hasSale ? saleRaw : listPrice ?? saleRaw;
  const originalRaw = hasSale
    ? listPrice
    : product?.old_price ?? product?.compare_at_price;

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

export function getProductTitle(product: Record<string, any>): string {
  return (
    product?.title ||
    product?.name ||
    product?.product_name ||
    'Product'
  );
}

export function resolveProductMediaItems(
  product: Record<string, any>,
): Array<{url: string; type: 'image' | 'video'}> {
  const items: Array<{url: string; type: 'image' | 'video'}> = [];
  const push = (value?: string | null, type: 'image' | 'video' = 'image') => {
    const resolved = resolveProductMediaUrl(value);
    if (resolved && !items.some(i => i.url === resolved)) {
      items.push({url: resolved, type});
    }
  };

  if (Array.isArray(product?.images)) {
    product.images.forEach((img: any) => {
      if (typeof img === 'string') {
        push(img, 'image');
      } else {
        const mediaType =
          img?.type === 'video' || String(img?.mime_type || '').startsWith('video')
            ? 'video'
            : 'image';
        push(img?.path ?? img?.url, mediaType);
      }
    });
  }

  push(product?.banner);
  push(product?.image);
  push(product?.thumbnail);
  push(product?.media?.[0]?.path);

  return items;
}

export function resolveProductImageUrls(
  product: Record<string, any>,
): string[] {
  return resolveProductMediaItems(product).map(item => item.url);
}

export function getProductSizeLabel(product: Record<string, any>): string {
  const sizes = product?.sizes;
  if (!Array.isArray(sizes) || sizes.length === 0) {
    return '';
  }
  return 'Size Available';
}

export function getProductColorsLabel(product: Record<string, any>): string {
  const colorsList = product?.colors;
  if (!Array.isArray(colorsList) || colorsList.length === 0) {
    return '';
  }
  const names = colorsList
    .map((entry: any) => {
      if (typeof entry === 'string') {
        return entry.trim();
      }
      return String(entry?.color ?? entry?.name ?? '').trim();
    })
    .filter(Boolean);
  if (names.length === 0) {
    return '';
  }
  return `Color: ${names.join(', ')}`;
}

export function isProductNegotiable(product: Record<string, any>): boolean {
  if (
    product?.is_negotiable === true ||
    product?.negotiable === true ||
    product?.is_negotiable === 1 ||
    product?.negotiable === 1
  ) {
    return true;
  }
  const type = String(
    product?.listing_type ?? product?.price_type ?? product?.type ?? '',
  ).toLowerCase();
  return type.includes('negotiable');
}

export type ShopProductSortValue =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest';

export function sortShopProducts(
  products: Record<string, any>[],
  sort: ShopProductSortValue,
): Record<string, any>[] {
  const list = [...products];
  const getName = (product: Record<string, any>) =>
    getProductTitle(product).toLowerCase();
  const getPrice = (product: Record<string, any>) => {
    const raw =
      product?.sale_price ??
      product?.discounted_price ??
      product?.price ??
      product?.amount ??
      0;
    const n = Number(String(raw).replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const getCreatedAt = (product: Record<string, any>) => {
    const raw = product?.created_at ?? product?.updated_at ?? 0;
    const t = Date.parse(String(raw));
    return Number.isFinite(t) ? t : 0;
  };

  list.sort((a, b) => {
    switch (sort) {
      case 'name_desc':
        return getName(b).localeCompare(getName(a));
      case 'price_asc':
        return getPrice(a) - getPrice(b);
      case 'price_desc':
        return getPrice(b) - getPrice(a);
      case 'newest':
        return getCreatedAt(b) - getCreatedAt(a);
      case 'name_asc':
      default:
        return getName(a).localeCompare(getName(b));
    }
  });

  return list;
}

export function filterShopProductsByCategory(
  products: Record<string, any>[],
  category: string,
): Record<string, any>[] {
  if (!category || category === 'all') {
    return products;
  }
  return products.filter(product => {
    const label = getProductCategoryLabel(product).toLowerCase();
    const slug = String(
      product?.category?.slug ?? product?.category_id ?? '',
    ).toLowerCase();
    const needle = category.toLowerCase();
    return label === needle || slug === needle || label.includes(needle);
  });
}

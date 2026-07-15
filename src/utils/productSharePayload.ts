export const ALSE_PRODUCT_PREFIX = '__ALSE_PRODUCT__';

export interface ProductSharePayload {
  v: 1;
  type: 'product_share';
  product_id: number | string;
  title: string;
  price: string;
  image?: string;
  vendor?: string;
}

function cleanOptionalString(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }
  const text = String(value).trim();
  return text ? text : undefined;
}

export function serializeProductShare(payload: ProductSharePayload): string {
  return `${ALSE_PRODUCT_PREFIX}${JSON.stringify({
    ...payload,
    title: payload.title.trim() || 'Product',
    price: payload.price.trim() || '—',
    image: cleanOptionalString(payload.image),
    vendor: cleanOptionalString(payload.vendor),
  })}`;
}

export function parseProductShareMessage(
  message: string | undefined | null,
): ProductSharePayload | null {
  if (!message || typeof message !== 'string') {
    return null;
  }
  if (!message.startsWith(ALSE_PRODUCT_PREFIX)) {
    return null;
  }

  try {
    const raw = JSON.parse(
      message.slice(ALSE_PRODUCT_PREFIX.length),
    ) as Partial<ProductSharePayload>;

    if (
      raw?.v === 1 &&
      raw.type === 'product_share' &&
      raw.product_id != null
    ) {
      return {
        v: 1,
        type: 'product_share',
        product_id: raw.product_id,
        title: cleanOptionalString(raw.title) ?? 'Product',
        price: cleanOptionalString(raw.price) ?? '—',
        image: cleanOptionalString(raw.image),
        vendor: cleanOptionalString(raw.vendor),
      };
    }
  } catch {
    /* ignore malformed product payloads */
  }

  return null;
}

export function getProductShareDisplayText(
  message: string | undefined | null,
): string {
  return parseProductShareMessage(message) ? '' : message || '';
}

export function getProductSharePreviewText(
  message: string | undefined | null,
): string {
  const product = parseProductShareMessage(message);
  return product ? `Product: ${product.title}` : message || '';
}

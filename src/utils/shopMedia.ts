import {BASE_URL} from './baseurl';

export function isRemoteImageUrl(url?: string | null): boolean {
  return (
    typeof url === 'string' &&
    (url.startsWith('http://') || url.startsWith('https://'))
  );
}

export function resolveShopMediaUrl(value?: string | null): string | undefined {
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
      /* ignore URL parse errors */
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

/**
 * Normalizes GET /shop/:id responses.
 */
export function extractShopDetailPayload(res: any): Record<string, any> {
  const body = res?.data;
  if (!body || typeof body !== 'object') {
    return {};
  }

  const outer = (body as any).data;
  if (outer == null) {
    if (
      (body as any).banner != null ||
      (body as any).avatar != null ||
      (body as any).shop_name != null ||
      typeof (body as any).id === 'number'
    ) {
      return body as Record<string, any>;
    }
    return {};
  }
  if (Array.isArray(outer)) {
    const first = outer[0];
    return first && typeof first === 'object' ? first : {};
  }
  if (typeof outer !== 'object') {
    return {};
  }

  if (outer.shop && typeof outer.shop === 'object' && !Array.isArray(outer.shop)) {
    return outer.shop;
  }

  const inner = (outer as any).data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    if (Array.isArray(inner.data) && inner.data.length > 0) {
      const row = inner.data[0];
      if (
        row &&
        typeof row === 'object' &&
        (row.banner != null ||
          row.avatar != null ||
          row.shop_name != null ||
          typeof row.id === 'number')
      ) {
        return row;
      }
    }
    if (
      !Array.isArray(inner.data) &&
      (inner.banner != null ||
        inner.avatar != null ||
        inner.shop_name != null ||
        inner.user_id != null ||
        typeof inner.id === 'number')
    ) {
      return inner;
    }
  }

  return outer as Record<string, any>;
}

export function pickBannerUrl(shop: Record<string, any>): string | undefined {
  const raw =
    shop?.banner ??
    shop?.shop_banner ??
    shop?.banner_url ??
    shop?.cover_image ??
    shop?.cover ??
    shop?.shop?.banner ??
    shop?.user?.banner ??
    shop?.user?.cover_photo;
  return resolveShopMediaUrl(raw);
}

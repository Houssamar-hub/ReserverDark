const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';

export function formatImageUrl(url, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const cleanUrl = url.trim();

  // If already absolute URL
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // If starts with /
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }

  // If Unsplash ID like "photo-1560448204-e02f11c3d0e2..."
  if (cleanUrl.startsWith('photo-')) {
    return `https://images.unsplash.com/${cleanUrl}`;
  }

  // If relative to uploads
  if (cleanUrl.startsWith('uploads/')) {
    return `/${cleanUrl}`;
  }

  return cleanUrl;
}

export function handleImageError(e, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
}

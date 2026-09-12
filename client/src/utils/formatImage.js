const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';

export function formatImageUrl(url, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  let cleanUrl = url.trim();

  // Fix malformed Unsplash domains
  if (cleanUrl.includes('imagesunsplashcom')) {
    cleanUrl = cleanUrl.replace('imagesunsplashcom', 'images.unsplash.com');
  }

  // If already absolute URL
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // If starts with / (local public assets or /uploads)
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }

  // If relative path without leading slash
  if (cleanUrl.startsWith('uploads/')) {
    return `/${cleanUrl}`;
  }

  // If Unsplash ID
  if (cleanUrl.startsWith('photo-')) {
    return `https://images.unsplash.com/${cleanUrl}`;
  }

  return `/${cleanUrl}`;
}

export function handleImageError(e, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
}


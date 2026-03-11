
export function getPimcoreImageUrl(path?: string) {
  if (!path) return null;
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path;
  
  const baseUrl = process.env.NEXT_PUBLIC_PIMCORE_BASE_URL || 'http://35.246.89.127';
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
}

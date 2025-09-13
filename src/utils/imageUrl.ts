/**
 * Helper function to get the correct image URL for admin
 * Handles both relative paths and full URLs
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) {
    return '/placeholder.jpg';
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it starts with /uploads/, add the API domain
  if (imageUrl.startsWith('/uploads/')) {
    return `https://api.kariajuda.com${imageUrl}`;
  }

  // If it's just a filename or relative path, assume it's in uploads
  if (!imageUrl.startsWith('/')) {
    return `https://api.kariajuda.com/uploads/${imageUrl}`;
  }

  // For other paths, add API domain
  return `https://api.kariajuda.com${imageUrl}`;
};
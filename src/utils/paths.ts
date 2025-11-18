import path from 'path';

// Use /app/images for production (Docker) or local images directory for development
export function getImagePath(imageId: string): string {
  // Docker 환경에서는 /app/images, 로컬 개발에서는 src/imageProcessor/images
  const imagesDir = process.env.NODE_ENV === 'production'
    ? path.join('/app', 'images')
    : path.join(process.cwd(), 'src', 'imageProcessor', 'images');

  return path.join(imagesDir, `${imageId}.png`);
}

export function getImagesDirectory(): string {
  return process.env.NODE_ENV === 'production'
    ? path.join('/app', 'images')
    : path.join(process.cwd(), 'src', 'imageProcessor', 'images');
}

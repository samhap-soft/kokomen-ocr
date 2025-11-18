import path from 'path';

// Use a simple path relative to the process working directory
// This works in both production and test environments
export function getImagePath(imageId: string): string {
  return path.join(process.cwd(), 'src', 'imageProcessor', 'images', `${imageId}.png`);
}

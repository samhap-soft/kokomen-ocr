import { writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import { isArrayBuffer } from 'util/types';
import { getImagePath, getImagesDirectory } from '../utils/paths.js';

export class ImageProcessor {
  public async fetchImage(imageUrl: string, imageId: string): Promise<void> {
    // 디렉토리가 없으면 생성
    const imagesDir = getImagesDirectory();
    await mkdir(imagesDir, { recursive: true });

    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    if (!buffer) {
      throw new Error('Failed to fetch image');
    }

    await writeFile(getImagePath(imageId), new Uint8Array(buffer));
  }

  public async resizeImage(imageId: string, width: number = 500): Promise<string> {
    try {
      const imagePath = getImagePath(imageId);
      const buffer = await sharp(imagePath)
        .resize(width)
        .toFormat('png', { quality: 100 })
        .toBuffer();
      if (!buffer) {
        throw new Error('Failed to resize image');
      }
      return this.transferImageToBase64(buffer);
    } catch (error) {
      throw new Error(`Failed to resize image: ${error}`);
    }
  }

  public transferImageToBase64(buffer: Buffer): string {
    if (!Buffer.isBuffer(buffer) && !isArrayBuffer(buffer)) {
      throw new Error('Buffer is not an array buffer');
    }
    return Buffer.from(buffer).toString('base64');
  }
}

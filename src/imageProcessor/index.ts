import path from 'path';
import sharp from 'sharp';
import { isArrayBuffer } from 'util/types';

export class ImageProcessor {
  public async resizeImage(fileName: string, width: number = 500): Promise<string> {
    try {
      const imagePath = path.join(import.meta.dirname, 'images', fileName);
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
    if (!isArrayBuffer(buffer)) {
      throw new Error('Buffer is not an array buffer');
    }
    return Buffer.from(buffer).toString('base64');
  }
}

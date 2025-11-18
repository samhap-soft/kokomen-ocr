import { ImageProcessor } from '../imageProcessor';

export class ImageService {
  private imageProcessor: ImageProcessor;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  public fetchImage(imageUrl: string, imageId: string): Promise<void> {
    return this.imageProcessor.fetchImage(imageUrl, imageId);
  }

  public async resizeImage(imageId: string, width: number = 500): Promise<string> {
    return this.imageProcessor.resizeImage(imageId, width);
  }

  public transferImageToBase64(buffer: Buffer): string {
    return this.imageProcessor.transferImageToBase64(buffer);
  }
}

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ImageService } from '../../service/imageService.js';
import { ImageProcessor } from '../../imageProcessor/index.js';

jest.mock('../../imageProcessor/index.js');

describe('ImageService', () => {
  let imageService: ImageService;
  let mockImageProcessor: jest.Mocked<ImageProcessor>;

  beforeEach(() => {
    const ImageProcessorMock = ImageProcessor as jest.MockedClass<typeof ImageProcessor>;
    mockImageProcessor = new ImageProcessorMock() as jest.Mocked<ImageProcessor>;

    imageService = new ImageService();
    (imageService as any).imageProcessor = mockImageProcessor;

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchImage', () => {
    it('should delegate to ImageProcessor.fetchImage', async () => {
      mockImageProcessor.fetchImage = jest.fn<(url: string, id: string) => Promise<void>>().mockResolvedValue(undefined);

      const imageUrl = 'https://example.com/image.png';
      const imageId = 'test-image-123';

      await imageService.fetchImage(imageUrl, imageId);

      expect(mockImageProcessor.fetchImage).toHaveBeenCalledWith(imageUrl, imageId);
      expect(mockImageProcessor.fetchImage).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from ImageProcessor', async () => {
      const mockError = new Error('Failed to fetch image');
      mockImageProcessor.fetchImage = jest.fn<(url: string, id: string) => Promise<void>>().mockRejectedValue(mockError);

      const imageUrl = 'https://example.com/image.png';
      const imageId = 'test-image-123';

      await expect(imageService.fetchImage(imageUrl, imageId)).rejects.toThrow('Failed to fetch image');
    });
  });

  describe('resizeImage', () => {
    it('should successfully resize image with default width', async () => {
      const mockBase64 = 'base64encodedstring';
      mockImageProcessor.resizeImage = jest.fn<(id: string, width?: number) => Promise<string>>().mockResolvedValue(mockBase64);

      const imageId = 'test-image-123';
      const result = await imageService.resizeImage(imageId);

      expect(mockImageProcessor.resizeImage).toHaveBeenCalledWith(imageId, 500);
      expect(result).toBe(mockBase64);
    });

    it('should resize image with custom width', async () => {
      const mockBase64 = 'base64encodedstring';
      mockImageProcessor.resizeImage = jest.fn<(id: string, width?: number) => Promise<string>>().mockResolvedValue(mockBase64);

      const imageId = 'test-image-123';
      const customWidth = 1000;
      const result = await imageService.resizeImage(imageId, customWidth);

      expect(mockImageProcessor.resizeImage).toHaveBeenCalledWith(imageId, customWidth);
      expect(result).toBe(mockBase64);
    });

    it('should throw error when resize fails', async () => {
      const mockError = new Error('Failed to resize image');
      mockImageProcessor.resizeImage = jest.fn<(id: string, width?: number) => Promise<string>>().mockRejectedValue(mockError);

      const imageId = 'test-image-123';

      await expect(imageService.resizeImage(imageId)).rejects.toThrow('Failed to resize image');
    });
  });

  describe('transferImageToBase64', () => {
    it('should convert buffer to base64', () => {
      const mockBuffer = Buffer.from('test data');
      const expectedBase64 = mockBuffer.toString('base64');

      mockImageProcessor.transferImageToBase64 = jest.fn<(buffer: Buffer) => string>().mockReturnValue(expectedBase64);

      const result = imageService.transferImageToBase64(mockBuffer);

      expect(mockImageProcessor.transferImageToBase64).toHaveBeenCalledWith(mockBuffer);
      expect(result).toBe(expectedBase64);
    });

    it('should throw error for invalid buffer', () => {
      const invalidBuffer = 'not a buffer' as any;
      mockImageProcessor.transferImageToBase64 = jest.fn<(buffer: Buffer) => string>().mockImplementation(() => {
        throw new Error('Buffer is not an array buffer');
      });

      expect(() => imageService.transferImageToBase64(invalidBuffer)).toThrow('Buffer is not an array buffer');
    });
  });
});

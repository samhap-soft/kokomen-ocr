import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ImageProcessor } from '../../imageProcessor/index.js';
import { writeFile } from 'fs/promises';
import sharp from 'sharp';

jest.mock('fs/promises');
jest.mock('sharp');

describe('ImageProcessor', () => {
  let imageProcessor: ImageProcessor;
  const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;
  const mockSharp = sharp as unknown as jest.MockedFunction<typeof sharp>;

  beforeEach(() => {
    imageProcessor = new ImageProcessor();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchImage', () => {
    it('should successfully fetch and save an image', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        arrayBuffer: jest.fn<() => Promise<ArrayBuffer>>().mockResolvedValue(mockArrayBuffer),
      };

      global.fetch = jest.fn<typeof fetch>().mockResolvedValue(mockResponse as any);
      mockWriteFile.mockResolvedValue(undefined);

      const imageUrl = 'https://example.com/image.png';
      const imageId = 'test-image-123';

      await imageProcessor.fetchImage(imageUrl, imageId);

      expect(global.fetch).toHaveBeenCalledWith(imageUrl);
      expect(mockResponse.arrayBuffer).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining(`${imageId}.png`),
        expect.any(Uint8Array)
      );
    });

    it('should throw error when fetch fails to retrieve buffer', async () => {
      const mockResponse = {
        arrayBuffer: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      };

      global.fetch = jest.fn<typeof fetch>().mockResolvedValue(mockResponse as any);

      const imageUrl = 'https://example.com/image.png';
      const imageId = 'test-image-123';

      await expect(imageProcessor.fetchImage(imageUrl, imageId)).rejects.toThrow('Failed to fetch image');
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn<typeof fetch>().mockRejectedValue(new Error('Network error'));

      const imageUrl = 'https://example.com/image.png';
      const imageId = 'test-image-123';

      await expect(imageProcessor.fetchImage(imageUrl, imageId)).rejects.toThrow('Network error');
    });
  });

  describe('resizeImage', () => {
    it('should successfully resize an image and return base64', async () => {
      const mockBuffer = Buffer.from('mock image data');
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn<() => Promise<Buffer>>().mockResolvedValue(mockBuffer),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const imageId = 'test-image-123';
      const result = await imageProcessor.resizeImage(imageId, 500);

      expect(mockSharp).toHaveBeenCalledWith(
        expect.stringContaining(`${imageId}.png`)
      );
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(500);
      expect(mockSharpInstance.toFormat).toHaveBeenCalledWith('png', { quality: 100 });
      expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
      expect(result).toBe(mockBuffer.toString('base64'));
    });

    it('should use default width of 500 when not specified', async () => {
      const mockBuffer = Buffer.from('mock image data');
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn<() => Promise<Buffer>>().mockResolvedValue(mockBuffer),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const imageId = 'test-image-123';
      await imageProcessor.resizeImage(imageId);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(500);
    });

    it('should throw error when buffer is null', async () => {
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const imageId = 'test-image-123';

      await expect(imageProcessor.resizeImage(imageId)).rejects.toThrow('Failed to resize image');
    });

    it('should handle sharp processing errors', async () => {
      mockSharp.mockImplementation((() => {
        throw new Error('Invalid image format');
      }) as any);

      const imageId = 'test-image-123';

      await expect(imageProcessor.resizeImage(imageId)).rejects.toThrow('Failed to resize image: Error: Invalid image format');
    });
  });

  describe('transferImageToBase64', () => {
    it('should convert buffer to base64 string', () => {
      const testBuffer = Buffer.from('test data');
      const result = imageProcessor.transferImageToBase64(testBuffer);

      expect(result).toBe(testBuffer.toString('base64'));
    });

    it('should throw error for non-ArrayBuffer input', () => {
      const invalidBuffer = 'not a buffer' as any;

      expect(() => imageProcessor.transferImageToBase64(invalidBuffer)).toThrow('Buffer is not an array buffer');
    });
  });
});

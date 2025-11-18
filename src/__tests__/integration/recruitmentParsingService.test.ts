import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { RecruitmentParsingService } from '../../service/recruitmentParsingService.js';
import { ImageService } from '../../service/imageService.js';
import { OpenAIClient } from '../../ai/index.js';
import { createConnection } from '../../utils/mysql.js';

jest.mock('../../service/imageService.js');
jest.mock('../../ai/index.js');
jest.mock('../../utils/mysql.js');

describe('RecruitmentParsingService Integration Tests', () => {
  let recruitmentParsingService: RecruitmentParsingService;
  let mockImageService: jest.Mocked<ImageService>;
  let mockOpenAIClient: jest.Mocked<OpenAIClient>;
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const ImageServiceMock = ImageService as jest.MockedClass<typeof ImageService>;
    const OpenAIClientMock = OpenAIClient as jest.MockedClass<typeof OpenAIClient>;

    mockImageService = new ImageServiceMock() as jest.Mocked<ImageService>;
    mockOpenAIClient = new OpenAIClientMock() as jest.Mocked<OpenAIClient>;

    mockConnection = {
      query: jest.fn(),
      end: jest.fn(),
    };

    (createConnection as jest.MockedFunction<typeof createConnection>).mockResolvedValue(mockConnection);

    recruitmentParsingService = new RecruitmentParsingService();
    (recruitmentParsingService as any).imageService = mockImageService;
    (recruitmentParsingService as any).openAIClient = mockOpenAIClient;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseRecruitmentsFromWaitingList', () => {
    it('should process all rows from waiting list successfully', async () => {
      const mockRows = [
        {
          id: 1,
          recruit_id: 101,
          image_url: 'https://example.com/image1.png',
        },
        {
          id: 2,
          recruit_id: 102,
          image_url: 'https://example.com/image2.png',
        },
      ];

      mockConnection.query
        .mockResolvedValueOnce([mockRows])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      mockImageService.fetchImage = jest.fn<(url: string, id: string) => Promise<void>>().mockResolvedValue(undefined);
      mockImageService.resizeImage = jest.fn<(id: string) => Promise<string>>().mockResolvedValue('base64imagestring');
      mockOpenAIClient.textDetectionFromAI = jest.fn<(base64: string) => Promise<any>>().mockResolvedValue({
        choices: [{ message: { content: 'Parsed recruitment text' } }],
      } as any);

      await recruitmentParsingService.parseRecruitmentsFromWaitingList();

      expect(createConnection).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM ocr_waiting_list');
      expect(mockConnection.end).toHaveBeenCalled();
    });

    it('should fetch and resize images for each recruitment', async () => {
      const mockRows = [
        {
          id: 1,
          recruit_id: 101,
          image_url: 'https://example.com/image1.png',
        },
      ];

      mockConnection.query
        .mockResolvedValueOnce([mockRows])
        .mockResolvedValue([{ affectedRows: 1 }]);

      mockImageService.fetchImage = jest.fn<(url: string, id: string) => Promise<void>>().mockResolvedValue(undefined);
      mockImageService.resizeImage = jest.fn<(id: string) => Promise<string>>().mockResolvedValue('base64imagestring');
      mockOpenAIClient.textDetectionFromAI = jest.fn<(base64: string) => Promise<any>>().mockResolvedValue({
        choices: [{ message: { content: 'Parsed text' } }],
      } as any);

      await recruitmentParsingService.parseRecruitmentsFromWaitingList();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockImageService.fetchImage).toHaveBeenCalledWith(
        'https://example.com/image1.png',
        '101'
      );
      expect(mockImageService.resizeImage).toHaveBeenCalledWith('101');
    });

    it('should call OpenAI text detection with resized image', async () => {
      const mockRows = [
        {
          id: 1,
          recruit_id: 101,
          image_url: 'https://example.com/image1.png',
        },
      ];

      const mockBase64 = 'base64imagestring';

      mockConnection.query
        .mockResolvedValueOnce([mockRows])
        .mockResolvedValue([{ affectedRows: 1 }]);

      mockImageService.fetchImage = jest.fn<(url: string, id: string) => Promise<void>>().mockResolvedValue(undefined);
      mockImageService.resizeImage = jest.fn<(id: string) => Promise<string>>().mockResolvedValue(mockBase64);
      mockOpenAIClient.textDetectionFromAI = jest.fn<(base64: string) => Promise<any>>().mockResolvedValue({
        choices: [{ message: { content: 'Parsed text' } }],
      } as any);

      await recruitmentParsingService.parseRecruitmentsFromWaitingList();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOpenAIClient.textDetectionFromAI).toHaveBeenCalledWith(mockBase64);
    });

    it('should handle empty waiting list', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);

      await recruitmentParsingService.parseRecruitmentsFromWaitingList();

      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM ocr_waiting_list');
      expect(mockImageService.fetchImage).not.toHaveBeenCalled();
      expect(mockOpenAIClient.textDetectionFromAI).not.toHaveBeenCalled();
    });

    it('should handle database query errors', async () => {
      const mockError = new Error('Database connection failed');
      mockConnection.query.mockRejectedValue(mockError);

      await expect(recruitmentParsingService.parseRecruitmentsFromWaitingList()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});

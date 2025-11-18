import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { OpenAIClient } from '../../ai/index.js';
import OpenAI from 'openai';

jest.mock('openai');

describe('OpenAIClient', () => {
  let openAIClient: OpenAIClient;
  let mockOpenAI: jest.Mocked<OpenAI>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-api-key' };

    const OpenAIMock = OpenAI as jest.MockedClass<typeof OpenAI>;
    mockOpenAI = new OpenAIMock({ apiKey: 'test-api-key' }) as jest.Mocked<OpenAI>;

    mockOpenAI.chat = {
      completions: {
        create: jest.fn(),
      },
    } as any;

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAI);

    openAIClient = new OpenAIClient();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize OpenAI client with API key from environment', () => {
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
      });
    });
  });

  describe('textDetectionFromAI', () => {
    it('should successfully detect text from image base64', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'gpt-5-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '채용 공고 내용입니다.',
            },
            finish_reason: 'stop',
          },
        ],
      };

      (mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

      const imageBase64 = 'base64encodedimage';
      const result = await openAIClient.textDetectionFromAI(imageBase64);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-5-mini',
        reasoning_effort: 'low',
        verbosity: 'low',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '주어진 이미지는 한 기업의 채용 공고를 캡쳐한 이미지입니다. 해당 이미지를 보고 채용공고에 해당하는 내용만을 정리해서 반환해주세요. 내용은 반드시 자체적으로 변형하지 않고 원본 내용을 그대로 반환해주세요.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                  detail: 'auto',
                },
              },
            ],
          },
        ],
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle OpenAI API errors', async () => {
      const mockError = new Error('OpenAI API error');
      (mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mockRejectedValue(mockError);

      const imageBase64 = 'base64encodedimage';

      await expect(openAIClient.textDetectionFromAI(imageBase64)).rejects.toThrow('OpenAI API error');
    });

    it('should format image URL correctly with base64 data', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        choices: [{ message: { content: 'test' } }],
      };

      (mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

      const imageBase64 = 'testbase64string';
      await openAIClient.textDetectionFromAI(imageBase64);

      const callArgs = (mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mock.calls[0][0];
      const imageUrl = callArgs.messages[0].content[1].image_url.url;

      expect(imageUrl).toBe(`data:image/png;base64,${imageBase64}`);
    });

    it('should use correct model and parameters', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        choices: [{ message: { content: 'test' } }],
      };

      (mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

      const imageBase64 = 'base64encodedimage';
      await openAIClient.textDetectionFromAI(imageBase64);

      const callArgs = (mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mock.calls[0][0];

      expect(callArgs.model).toBe('gpt-5-mini');
      expect(callArgs.reasoning_effort).toBe('low');
      expect(callArgs.verbosity).toBe('low');
    });
  });
});
